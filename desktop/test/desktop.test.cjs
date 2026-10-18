'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');const os=require('node:os');const crypto=require('node:crypto');const {Readable}=require('node:stream');
const {Store}=require('../src/storage.cjs');const {Updater,validateManifest,verifyInstaller}=require('../src/updater.cjs');
const {safeRelative,safeName,grantedPath,trustedFrame,allowedDownloadURL}=require('../src/security.cjs');
const config=require('../src/config.cjs');
const payload=Buffer.alloc(2048,42),hash=crypto.createHash('sha512').update(payload).digest('hex');
const manifest={schema:1,version:'3.15.1',channel:'stable',platform:'win32-x64',file:config.installer,size:payload.length,sha512:hash};
function release(m=manifest){const tag='desktop-v'+m.version;return {tag_name:tag,prerelease:m.channel==='beta',draft:false,published_at:'2026-10-18T00:00:00Z',body:'Release notes',assets:[{name:config.installer,size:m.size,browser_download_url:`https://github.com/${config.repository}/releases/download/${tag}/${config.installer}`},{name:config.manifest,browser_download_url:`https://github.com/${config.repository}/releases/download/${tag}/${config.manifest}`}]};}
async function temp(t){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'lolite-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));return dir;}
function response(data,statusCode=200,headers={}){return Object.assign(Readable.from([data]),{statusCode,headers});}
test('rejects traversal, Windows streams and unsafe update hosts',()=>{
  for(const value of ['../file','/file','a/../../b','a\\b','c:/Windows/file','a:stream','a//b','a/./b','trailing.'])assert.throws(()=>safeRelative(value));
  assert.equal(safeRelative('Documents/file.txt'),path.join('Documents','file.txt'));
  assert.equal(safeName('CON.txt'),'_CON.txt');
  for(const u of ['http://github.com/x','https://evil.example/update.exe','https://github.com/other/repo/releases/download/v/file','file:///C:/x','https://github.com@evil.example/x'])assert.equal(allowedDownloadURL(u),false);
});
test('IPC allows only the exact top-level application page',()=>{
  const main={url:'lolite://app/index.html'},sender={mainFrame:main};
  assert.equal(trustedFrame({sender,senderFrame:main},'app'),true);
  assert.equal(trustedFrame({sender,senderFrame:{url:main.url}},'app'),false);
  for(const url of ['https://evil.example/','lolite://app/html%20games/a.html','lolite://content/index.html','lolite://app/other.html'])assert.equal(trustedFrame({sender:{mainFrame:main},senderFrame:{url}},'app'),false);
});
test('folder grants cannot escape through symbolic links',async t=>{
  const root=await temp(t);await fs.mkdir(path.join(root,'allowed'));await fs.writeFile(path.join(root,'secret'),'secret');await fs.writeFile(path.join(root,'allowed','ok.txt'),'ok');
  assert.equal(await grantedPath(path.join(root,'allowed'),'ok.txt'),await fs.realpath(path.join(root,'allowed','ok.txt')));
  try{await fs.symlink(path.join(root,'secret'),path.join(root,'allowed','escape'));}catch(e){if(e.code==='EPERM'){t.diagnostic('Symlink creation unavailable on this Windows runner');return;}throw e;}
  await assert.rejects(()=>grantedPath(path.join(root,'allowed'),'escape'),/outside/);
});
test('manifest is bound to repository, version, asset size and release channel',()=>{
  assert.equal(validateManifest(manifest,release()).version,manifest.version);
  for(const patch of [{version:'4.0.0'},{size:12},{sha512:'bad'},{channel:'beta'},{platform:'win32-arm64'},{file:'evil.exe'}])assert.throws(()=>validateManifest({...manifest,...patch},release()));
  const bad=release();bad.assets[0].browser_download_url='https://evil.example/LoliteOS-Setup.exe';assert.throws(()=>validateManifest(manifest,bad));
});
test('downloads, verifies, resumes and rejects modified installer bytes',async t=>{
  const dir=await temp(t),store=new Store(dir);let seenRange;
  const updater=new Updater({store,version:'3.15.0',request:async(_url,{headers})=>{seenRange=headers.Range;return response(payload.subarray(1000),206,{'content-range':`bytes 1000-2047/2048`,'content-length':'1048'});}});
  updater.release=validateManifest(manifest,release());await fs.writeFile(updater.fileFor(updater.release,true),payload.subarray(0,1000));
  await updater.download();assert.equal(seenRange,'bytes=1000-');assert.equal(updater.state.phase,'ready');assert.deepEqual(await fs.readFile(updater.ready.file),payload);
  await fs.writeFile(updater.ready.file,Buffer.alloc(2048,9));await assert.rejects(()=>verifyInstaller(updater.ready.file,manifest,null),/verification failed/);
});
test('servers that ignore Range safely restart instead of appending',async t=>{
  const store=new Store(await temp(t)),updater=new Updater({store,version:'3.15.0',request:async()=>response(payload,200,{'content-length':'2048'})});
  updater.release=validateManifest(manifest,release());await fs.writeFile(updater.fileFor(updater.release,true),payload.subarray(0,1000));await updater.download();assert.deepEqual(await fs.readFile(updater.ready.file),payload);
});
test('tampered and oversized downloads never become installable',async t=>{
  const store=new Store(await temp(t));
  for(const data of [Buffer.alloc(2048,0),Buffer.alloc(3000,0)]){const updater=new Updater({store,version:'3.15.0',request:async()=>response(data)});updater.release=validateManifest(manifest,release());await assert.rejects(()=>updater.download());assert.equal(updater.ready,null);}
});
test('stable excludes beta releases and never offers an older release as an update',async t=>{
  const beta={...manifest,version:'4.0.0-beta.1',channel:'beta'},store=new Store(await temp(t));
  const updater=new Updater({store,version:'3.15.2',json:async url=>url.includes('api.github.com')?[release(beta),release()]:manifest});
  await updater.check();assert.equal(updater.state.phase,'current');assert.equal(updater.state.latest,'3.15.1');
  store.settings({beta:true});updater.json=async url=>url.includes('api.github.com')?[release(beta),release()]:beta;await updater.check();assert.equal(updater.state.phase,'available');
});
test('settings and data survive updater cache clearing and a new session',async t=>{
  const dir=await temp(t),store=new Store(dir);store.settings({autoDownload:true,fullscreen:true});await fs.writeFile(path.join(dir,'project.txt'),'keep');
  const updater=new Updater({store,version:'3.15.0'});await fs.writeFile(path.join(updater.cache,'old.part'),'partial');await updater.clearCache();
  assert.equal(await fs.readFile(path.join(dir,'project.txt'),'utf8'),'keep');assert.equal(new Store(dir).data.settings.fullscreen,true);assert.throws(()=>store.settings({repository:'evil'}));
});
test('repair detects corrupted app files and downloads the same verified version',async t=>{
  const dir=await temp(t),root=path.join(dir,'program');await fs.mkdir(path.join(root,'resources'),{recursive:true});await fs.writeFile(path.join(root,'app.txt'),'bad');
  await fs.writeFile(path.join(root,'resources/integrity.json'),JSON.stringify({files:[{path:'app.txt',size:4,sha256:crypto.createHash('sha256').update('good').digest('hex')}]}));
  const updater=new Updater({store:new Store(path.join(dir,'data')),version:manifest.version,json:async url=>url.includes('api.github.com')?[release()]:manifest,request:async()=>response(payload)});
  await updater.repair(root);assert.equal(updater.state.phase,'ready');assert.equal(updater.ready.release.version,manifest.version);assert.equal(await fs.readFile(path.join(root,'app.txt'),'utf8'),'bad');
});
