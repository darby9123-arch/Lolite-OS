'use strict';
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const exec=promisify(execFile);
const {Updater}=require('../../desktop/src/updater.cjs'),{Store}=require('../../desktop/src/storage.cjs');
const network=require('../../desktop/src/network.cjs');
(async()=>{
  if(process.platform!=='win32')throw Error('Live installation verification requires Windows.');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lolite-live-release-')),data=path.join(directory,'user-data'),root=path.join(directory,'program');
  const store=new Store(data);store.settings({beta:require('../../desktop/package.json').version.includes('-')});
  fs.writeFileSync(path.join(data,'personal-project.txt'),'Preserve this project');
  const updater=new Updater({store,version:'0.0.0'});
  function observe(instance){let phase='',bucket=-1;instance.on('state',s=>{const next=Math.floor(s.progress/25);if(phase!==s.phase||(s.phase==='downloading'&&next!==bucket)){console.log(JSON.stringify({phase:s.phase,version:s.latest,progress:Math.round(s.progress),message:s.message}));phase=s.phase;bucket=next;}});}
  async function install(file){await exec(file,['/S',`/D=${root}`],{timeout:120000});if(!fs.existsSync(path.join(root,'resources/app.asar')))throw Error('Setup did not restore application files.');}
  async function smoke(exe,mode,name){
    const report=path.join(directory,name+'.json');
    try{await exec(path.join(root,exe),[mode],{timeout:100000,env:{...process.env,LOLITE_SMOKE_DATA:data,LOLITE_SMOKE_RESULT:report}});}
    catch(e){if(fs.existsSync(report))console.error(fs.readFileSync(report,'utf8'));const log=path.join(data,'launcher.log');if(fs.existsSync(log))console.error(fs.readFileSync(log,'utf8').slice(-8000));throw e;}
    const value=JSON.parse(fs.readFileSync(report,'utf8'));if(!value.ok)throw Error(name+' failed: '+JSON.stringify(value));return value;
  }
  try{
    observe(updater);await updater.check();
    if(updater.state.phase!=='available')throw Error('The public release feed did not offer an update.');
    const version=updater.release.version;
    if(process.env.LOLITE_EXPECTED_COMMIT&&updater.release.sourceCommit!==process.env.LOLITE_EXPECTED_COMMIT)throw Error('The published installer does not contain the expected source commit.');
    await updater.download();const installer=await updater.prepareInstall();await install(installer);
    const first=await smoke('Lolite OS.exe','--smoke-test','first');if(first.version!==version)throw Error('Installed version differs from release metadata.');
    const native=await smoke('Lolite Launcher.exe','--smoke-feed','feed');
    let freshRequests=0;
    const current=new Updater({store:new Store(data),version,request:async(url,options)=>{freshRequests++;return network.request(url,options);}});observe(current);
    await current.check();if(current.state.phase!=='current')throw Error('Same-version feed comparison failed.');
    // The earlier verified installer is still cached. Reinstall must fetch it again.
    await current.reinstallLatest();if(freshRequests!==1||current.state.phase!=='ready')throw Error('Forced reinstall reused its cache or did not verify.');
    const fresh=await current.prepareInstall();fs.unlinkSync(path.join(root,'resources/app.asar'));await install(fresh);
    const second=await smoke('Lolite OS.exe','--smoke-test','reinstalled');if(!second.previous)throw Error('Reinstall lost IndexedDB user files.');
    if(fs.readFileSync(path.join(data,'personal-project.txt'),'utf8')!=='Preserve this project')throw Error('Reinstall removed personal data.');
    await smoke('Lolite Launcher.exe','--smoke-launcher','launcher');
    const result={ok:true,version,size:current.release.size,sha512:current.release.sha512,source:current.release.url,sourceCommit:current.release.sourceCommit,verifiedAt:new Date().toISOString(),nativeFeed:native,sameVersionFreshDownload:true,missingFilesRestored:true,userDataPreserved:true};
    fs.writeFileSync('live-release-verification.json',JSON.stringify(result,null,2)+'\n');
    console.log('Published update installed; native launcher checked GitHub; same-version fresh reinstall restored missing files and preserved user data.');
  }finally{
    if(fs.existsSync(root)){const uninstall=fs.readdirSync(root).find(n=>/^Uninstall.*\.exe$/i.test(n));if(uninstall)await exec(path.join(root,uninstall),['/S'],{timeout:60000}).catch(e=>console.error('Test uninstall: '+e.message));}
    await fsp.rm(directory,{recursive:true,force:true,maxRetries:30,retryDelay:500});
  }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
