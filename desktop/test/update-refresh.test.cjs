'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {Readable}=require('node:stream'),{EventEmitter}=require('node:events');
const {Store}=require('../src/storage.cjs'),{Updater}=require('../src/updater.cjs');
const {createClient}=require('../src/network.cjs'),{readReadme}=require('../src/readme.cjs');
const {chooseVersion}=require('../../.github/scripts/select-desktop-version.cjs');
const repo='darby9123-arch/Lolite-OS',bytes=Buffer.alloc(2048,7);
const meta={schema:1,version:'3.15.1',channel:'stable',platform:'win32-x64',file:'LoliteOS-Setup.exe',size:bytes.length,sha512:crypto.createHash('sha512').update(bytes).digest('hex')};
const release={tag_name:'desktop-v3.15.1',prerelease:false,assets:[{name:'LoliteOS-Setup.exe',size:bytes.length,browser_download_url:`https://github.com/${repo}/releases/download/desktop-v3.15.1/LoliteOS-Setup.exe`},{name:'lolite-desktop.json',browser_download_url:`https://github.com/${repo}/releases/download/desktop-v3.15.1/lolite-desktop.json`}]};
async function fixture(t,version='3.15.1'){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'lolite-refresh-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const store=new Store(dir);let requests=0,checks=0,range;
  const updater=new Updater({store,version,json:async url=>{checks++;return url.includes('api.github.com')?[release]:meta;},request:async(_url,{headers})=>{requests++;range=headers.Range;return Object.assign(Readable.from([bytes]),{statusCode:200,headers:{'content-length':String(bytes.length)}});}});
  return {dir,store,updater,counts:()=>({requests,checks,range})};
}
test('same-version reinstall checks GitHub again and fetches new bytes despite a valid cache',async t=>{
  const {dir,store,updater,counts}=await fixture(t);store.settings({autoDownload:true,fullscreen:true});
  await fs.writeFile(path.join(dir,'personal-project.txt'),'keep me');
  await updater.check();assert.equal(updater.state.phase,'current');assert.equal(counts().requests,0);
  await fs.writeFile(updater.fileFor(updater.release),bytes);await fs.writeFile(updater.fileFor(updater.release,true),bytes.subarray(0,100));
  await updater.reinstallLatest();assert.equal(counts().checks,4);assert.equal(counts().requests,1);assert.equal(counts().range,undefined);
  assert.equal(updater.state.phase,'ready');assert.equal(updater.state.operation,'reinstall');assert.equal(updater.busy,false);assert.ok(updater.state.checkedAt);
  const installer=await updater.prepareInstall();assert.deepEqual(await fs.readFile(installer),bytes);assert.equal(store.data.pending.to,'3.15.1');assert.equal(store.data.history[0].action,'Reinstall requested');
  assert.equal(await fs.readFile(path.join(dir,'personal-project.txt'),'utf8'),'keep me');assert.equal(store.data.settings.fullscreen,true);
});
test('force refresh refuses a downgrade and does not fetch an installer',async t=>{
  const {updater,counts}=await fixture(t,'3.16.0');await assert.rejects(()=>updater.reinstallLatest(),/downgrade/);assert.equal(counts().requests,0);assert.equal(updater.ready,null);assert.equal(updater.release,null);
});
test('failed update checks invalidate old download targets, retain the last success time, and can be retried',async t=>{
  const {updater}=await fixture(t,'3.15.0');await updater.check();const stamp=updater.state.checkedAt,good=updater.json;
  updater.json=async()=>{throw Error('Network unavailable');};await assert.rejects(()=>updater.check(),/Network unavailable/);
  assert.equal(updater.state.phase,'error');assert.equal(updater.state.checkStatus,'error');assert.equal(updater.state.checkedAt,stamp);assert.equal(updater.release,null);assert.equal(updater.snapshot().canDownload,false);await assert.rejects(()=>updater.download(),/Check for updates/);
  updater.json=good;await updater.check();assert.equal(updater.state.phase,'available');assert.equal(updater.state.checkStatus,'success');
});
test('an empty feed or incomplete latest release never claims the app is up to date',async t=>{
  const {updater}=await fixture(t);updater.json=async()=>[];await assert.rejects(()=>updater.check(),/No desktop release/);assert.equal(updater.state.phase,'error');
  updater.json=async()=>[{...release,tag_name:'desktop-v3.16.0',assets:[]},release];await assert.rejects(()=>updater.check(),/metadata location/);assert.equal(updater.ready,null);
});
test('concurrent refresh and a modified verified installer cannot be installed',async t=>{
  const {updater}=await fixture(t);updater.busy=true;await assert.rejects(()=>updater.reinstallLatest(),/current update operation/);updater.busy=false;
  await updater.reinstallLatest();await fs.writeFile(updater.ready.file,Buffer.alloc(2048,0));await assert.rejects(()=>updater.prepareInstall(),/verification failed/);assert.equal(updater.busy,false);assert.equal(updater.store.data.pending,undefined);
});
test('Chromium follows approved redirects synchronously and blocks untrusted destinations',async()=>{
  function factory(destination,calls){return options=>{
    calls.push(options);const req=new EventEmitter();let followed=false,aborted=false;
    req.followRedirect=()=>{followed=true;calls.push('followed');};req.abort=()=>{aborted=true;req.emit('close');};
    req.end=()=>queueMicrotask(()=>{
      req.emit('redirect',302,'GET',destination,{});
      if(!followed){if(!aborted)req.emit('error',Error('Redirect was cancelled'));return;}
      const res=Object.assign(Readable.from([Buffer.from('{"verified":true}')]),{statusCode:200,headers:{}});
      res.on('end',()=>req.emit('close'));req.emit('response',res);
    });return req;
  };}
  const calls=[],client=createClient(factory('https://release-assets.githubusercontent.com/test',calls));
  assert.deepEqual(await client.json(`https://github.com/${repo}/releases/download/desktop-v3.15.1/lolite-desktop.json`),{verified:true});
  assert.equal(calls[0].redirect,'manual');assert.equal(calls[0].cache,'no-store');assert.equal(calls[0].credentials,'omit');assert.equal(calls[1],'followed');
  const blockedCalls=[],blocked=createClient(factory('https://untrusted.example/payload',blockedCalls));
  await assert.rejects(()=>blocked.json(`https://api.github.com/repos/${repo}/releases`),/Blocked update URL/);assert.equal(blockedCalls.length,1);
});
test('Chromium checks and downloads honour cancellation',async()=>{
  let aborted=false;const client=createClient(()=>{const req=new EventEmitter();req.end=()=>{};req.abort=()=>{aborted=true;req.emit('close');};return req;});
  const controller=new AbortController(),pending=client.request(`https://api.github.com/repos/${repo}/releases`,{signal:controller.signal});controller.abort();await assert.rejects(()=>pending,/abort/i);assert.equal(aborted,true);
});
test('README refresh caches the official document and falls back offline',async t=>{
  const {dir}=await fixture(t),bundled=path.join(dir,'README.md');await fs.writeFile(bundled,'# Bundled Lolite');
  const base={directory:dir,bundled,json:async()=>{throw Error('Offline');}};
  assert.equal((await readReadme({...base,refresh:true})).text,'# Bundled Lolite');
  let requested;const result=await readReadme({...base,refresh:true,json:async url=>{requested=url;return {encoding:'base64',content:Buffer.from('# Latest Lolite\nWorks offline.').toString('base64'),size:30,sha:'a'.repeat(40)};}});
  assert.equal(requested,`https://api.github.com/repos/${repo}/readme?ref=main`);assert.equal(result.kind,'github');
  const offline=await readReadme({...base,refresh:true});assert.equal(offline.text,result.text);assert.equal(offline.kind,'cached');assert.match(offline.warning,/Could not refresh/);
});
test('main source changes get new Windows versions; repeat builds keep existing releases immutable',()=>{
  const context={ref:'refs/heads/main',sha:'new',event:'push'},existing=[{tag_name:'desktop-v3.15.1',target_commitish:'old'}];
  assert.deepEqual(chooseVersion('3.15.1',existing,context),{version:'3.15.2',publish:true});
  assert.deepEqual(chooseVersion('3.15.1',existing,{...context,sha:'old'}),{version:'3.15.1',publish:false});
  assert.deepEqual(chooseVersion('3.16.0',existing,context),{version:'3.16.0',publish:true});
  assert.deepEqual(chooseVersion('3.16.0-beta.1',[{tag_name:'desktop-v3.16.0-beta.1'}],context),{version:'3.16.0-beta.2',publish:true});
  assert.equal(chooseVersion('3.15.1',existing,{...context,event:'pull_request'}).publish,false);
  assert.throws(()=>chooseVersion('3.15.1',[],{...context,ref:'refs/tags/desktop-v3.15.2'}),/do not match/);
});
