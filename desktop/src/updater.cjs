'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {pipeline} = require('node:stream/promises');
const {Transform} = require('node:stream');
const {EventEmitter} = require('node:events');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const semver = require('semver');
const config = require('./config.cjs');
const {officialAsset,safeRelative} = require('./security.cjs');
const network = require('./network.cjs');
async function digest(file, algorithm='sha512') {
  const hash=crypto.createHash(algorithm);
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
function validateManifest(manifest, release) {
  if (!manifest || manifest.schema !== 1 || !semver.valid(manifest.version) || release.tag_name !== `desktop-v${manifest.version}` ||
    manifest.platform !== 'win32-x64' || manifest.file !== config.installer ||
    !Number.isSafeInteger(manifest.size) || manifest.size < 1024 || manifest.size > config.maxDownloadBytes ||
    !/^[a-f0-9]{128}$/.test(manifest.sha512)) throw Error('Invalid desktop release manifest.');
  const prerelease=!!semver.prerelease(manifest.version);
  if (prerelease !== !!release.prerelease || manifest.channel !== (prerelease?'beta':'stable')) throw Error('Release channel does not match its version.');
  const asset=release.assets?.find(a=>a.name===config.installer);
  if (!asset || asset.size !== manifest.size || !officialAsset(asset.browser_download_url,release.tag_name,config.installer)) throw Error('Installer is missing or does not match the official release.');
  return {...manifest,url:asset.browser_download_url,notes:String(release.body || '').slice(0,40000),date:release.published_at};
}
async function verifyInstaller(file, metadata, publisher=config.publisher) {
  if ((await fsp.stat(file)).size !== metadata.size || await digest(file) !== metadata.sha512) throw Error('Update verification failed. The installer was not executed. Retry the download.');
  if (publisher) {
    if(process.platform !== 'win32') throw Error('Authenticode verification requires Windows.');
    // Arguments are passed without a shell. Neither the renderer nor release metadata supplies the publisher.
    const script = '$s=Get-AuthenticodeSignature -LiteralPath $env:LOLITE_VERIFY_FILE; if($s.Status -ne "Valid"){exit 2}; if($s.SignerCertificate.Subject -ne $env:LOLITE_VERIFY_PUBLISHER){exit 3}';
    await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:30000,env:{...process.env,LOLITE_VERIFY_FILE:file,LOLITE_VERIFY_PUBLISHER:publisher}});
  }
  return true;
}
class Updater extends EventEmitter {
  constructor({store,version,request=network.request,json=network.json}) {
    super();this.store=store;this.version=version;this.request=request;this.json=json;
    this.cache=path.join(store.directory,'updates');fs.mkdirSync(this.cache,{recursive:true});
    this.state={phase:'idle',message:'Ready to launch.',installed:version,latest:null,progress:0,transferred:0,total:0,speed:0,eta:null};
    this.release=null;this.ready=null;this.busy=false;this.controller=null;
  }
  set(patch) {Object.assign(this.state,patch);this.emit('state',this.snapshot());}
  snapshot(){return {...this.state,settings:{...this.store.data.settings},history:[...this.store.data.history]};}
  error(error){this.store.log(error.stack||error);this.set({phase:'error',message:error.message||String(error),speed:0,eta:null});}
  async list() {
    const releases=await this.json(`https://api.github.com/repos/${config.repository}/releases?per_page=50`);
    if(!Array.isArray(releases)) throw Error('Unexpected release response.');
    return releases.filter(r=>!r.draft && /^desktop-v/.test(r.tag_name) && semver.valid(r.tag_name.slice(9)) &&
      (this.store.data.settings.beta || !r.prerelease) && r.assets?.some(a=>a.name===config.manifest))
      .sort((a,b)=>semver.rcompare(a.tag_name.slice(9),b.tag_name.slice(9)));
  }
  async metadata(release) {
    const asset=release.assets.find(a=>a.name===config.manifest);
    if(!asset || !officialAsset(asset.browser_download_url,release.tag_name,config.manifest)) throw Error('Invalid release metadata location.');
    return validateManifest(await this.json(asset.browser_download_url,128*1024),release);
  }
  async check() {
    if(this.busy) throw Error('Wait for the current update operation to finish.');
    this.busy=true;this.ready=null;
    this.set({phase:'checking',message:'Checking official GitHub releases…',progress:0});
    try {
      const releases=await this.list();
      this.set({announcements:releases.slice(0,5).map(r=>({version:r.tag_name.slice(9),date:r.published_at,notes:String(r.body||'').slice(0,4000)}))});
      if(!releases.length){this.release=null;this.set({phase:'current',latest:null,message:'No desktop release has been published on this channel yet.'});return;}
      this.release=await this.metadata(releases[0]);
      const available=semver.gt(this.release.version,this.version);
      this.set({phase:available?'available':'current',latest:this.release.version,notes:this.release.notes,total:this.release.size,message:available?'A new version is ready to download.':'You have the latest version on this channel.'});
    } catch(e){this.error(e);throw e;} finally{this.busy=false;}
    if(this.state.phase==='available' && this.store.data.settings.autoDownload) await this.download();
  }
  fileFor(release,partial=false){return path.join(this.cache,`${release.version}-${release.sha512.slice(0,20)}${partial?'.part':'.exe'}`);}
  async transfer(release,signal) {
    const destination=this.fileFor(release),partial=this.fileFor(release,true);
    if(fs.existsSync(destination)) {try{await verifyInstaller(destination,release);return destination;}catch{await fsp.rm(destination,{force:true});}}
    let offset=fs.existsSync(partial)?(await fsp.stat(partial)).size:0;
    if(offset>release.size){await fsp.rm(partial,{force:true});offset=0;}
    if(offset<release.size){
      const headers=offset?{Range:`bytes=${offset}-`,Accept:'application/octet-stream'}:{Accept:'application/octet-stream'};
      const res=await this.request(release.url,{headers,signal});
      if(res.statusCode===200) offset=0;
      else if(res.statusCode===206){
        const range=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(res.headers['content-range']||'');
        if(!range || +range[1]!==offset || +range[3]!==release.size || +range[2]!==release.size-1){res.destroy();throw Error('Invalid resumed download response.');}
      } else {res.resume();throw Error(`Download returned HTTP ${res.statusCode}. Please retry.`);}
      const length=Number(res.headers['content-length']);
      if(length && length!==release.size-offset){res.destroy();throw Error('Download size differs from the release manifest.');}
      let received=offset;const started=Date.now();let last=0;
      const meter=new Transform({transform:(chunk,encoding,done)=>{
        received+=chunk.length;
        if(received>release.size){done(Error('Download exceeded its verified size.'));return;}
        const elapsed=Math.max((Date.now()-started)/1000,.1),speed=(received-offset)/elapsed;
        if(Date.now()-last>150){this.set({progress:received/release.size*100,transferred:received,total:release.size,speed,eta:speed?(release.size-received)/speed:null});last=Date.now();}
        done(null,chunk);
      }});
      await pipeline(res,meter,fs.createWriteStream(partial,{flags:offset?'a':'w',mode:0o600}),{signal});
    }
    this.set({phase:'verifying',message:'Verifying the complete installer…',speed:0,eta:null});
    try{await verifyInstaller(partial,release);}catch(e){await fsp.rm(partial,{force:true});throw e;}
    await fsp.rename(partial,destination);return destination;
  }
  async download() {
    if(this.busy)throw Error('Another operation is running.');
    if(!this.release)throw Error('Check for updates first.');
    this.busy=true;this.controller=new AbortController();this.ready=null;
    this.set({phase:'downloading',message:this.repairing?'Downloading verified repair installer…':'Downloading update…',progress:0});
    try {
      const file=await this.transfer(this.release,this.controller.signal);
      this.ready={file,release:this.release};
      this.set({phase:'ready',progress:100,transferred:this.release.size,message:this.repairing?'Repair installer verified. Close Lolite OS to reinstall.':'Update verified. Install whenever you are ready.'});
    } catch(e){if(this.controller.signal.aborted)this.set({phase:'paused',message:'Download paused. Your progress has been saved.',speed:0,eta:null});else{this.error(e);throw e;}}
    finally{this.busy=false;this.controller=null;}
  }
  pause(){if(this.state.phase==='downloading' && this.controller)this.controller.abort();}
  async repair(root) {
    if(this.busy)throw Error('Another operation is running.');
    this.busy=true;this.ready=null;this.set({phase:'repairing',progress:0,message:'Checking installed program files…'});
    try {
      const manifest=JSON.parse(await fsp.readFile(path.join(root,'resources','integrity.json'),'utf8'));
      if(!Array.isArray(manifest.files) || !manifest.files.length) throw Error('Installation integrity manifest is missing. Reinstall using the official setup file.');
      const damaged=[];
      for(let i=0;i<manifest.files.length;i++){
        const item=manifest.files[i],file=path.join(root,safeRelative(item.path));
        try{if((await fsp.stat(file)).size!==item.size || await digest(file,'sha256')!==item.sha256)damaged.push(item.path);}catch{damaged.push(item.path);}
        this.set({progress:(i+1)/manifest.files.length*100,message:`Checking file ${i+1} of ${manifest.files.length}…`});
      }
      this.store.history('Integrity check',this.version,damaged.length?`${damaged.length} damaged or missing files`:'All program files verified');
      if(!damaged.length){this.set({phase:'current',message:'Repair check complete. All program files are intact.',progress:100});return;}
      const releases=await this.list();
      const current=releases.find(r=>r.tag_name===`desktop-v${this.version}`);
      if(!current)throw Error(`Found ${damaged.length} damaged files. This version has no published repair installer. Use the official setup file to reinstall.`);
      this.release=await this.metadata(current);this.repairing=true;
      this.set({message:`Found ${damaged.length} damaged files. Preparing repair…`});
    }catch(e){this.error(e);throw e;}finally{this.busy=false;}
    if(this.repairing) await this.download();
  }
  async prepareInstall() {
    if(this.busy || !this.ready) throw Error('Download and verify an update first.');
    const target=this.ready;
    await verifyInstaller(target.file,target.release);
    this.busy=true;this.set({phase:'installing',message:'Preparing recovery and installation…',progress:0});
    try {
      let recovery=this.store.data.lastInstaller;
      if(target.release.version!==this.version && (!recovery || recovery.release.version!==this.version)) {
        try{
          const current=(await this.list()).find(r=>r.tag_name===`desktop-v${this.version}`);
          if(current){const release=await this.metadata(current);this.set({phase:'downloading',message:'Saving a recovery copy of your current version…'});const file=await this.transfer(release);recovery={file,release};}
        }catch(e){this.store.log('Recovery copy unavailable: '+e.message);recovery=null;}
      }
      this.store.data.pending={from:this.version,to:target.release.version,recovery:target.release.version===this.version?null:recovery,launch:this.store.data.settings.launchAfterUpdate,time:Date.now()};
      this.store.data.lastInstaller=target;this.store.history(this.repairing?'Repair requested':'Update requested',target.release.version);
      this.set({phase:'installing',progress:100,message:'Windows Setup will finish installation. User files are preserved.'});
      return target.file;
    } catch(e){this.busy=false;this.error(e);throw e;}
  }
  async clearCache(){
    if(this.busy)throw Error('Wait for the current operation first.');
    const keep=new Set([this.ready?.file,this.store.data.lastInstaller?.file,this.store.data.pending?.recovery?.file]);
    for(const entry of await fsp.readdir(this.cache)){const file=path.join(this.cache,entry);if(!keep.has(file))await fsp.rm(file,{force:true});}
    this.set({message:'Temporary update files cleared. The last verified recovery installer was kept.'});
  }
}
module.exports={Updater,validateManifest,verifyInstaller,digest};
