'use strict';
const {app,BrowserWindow,protocol,net,session,ipcMain,dialog,shell,Menu,screen}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const {spawn}=require('node:child_process');
const {Store}=require('./storage.cjs');
const {Updater,verifyInstaller}=require('./updater.cjs');
const {trustedFrame,safeRelative}=require('./security.cjs');
const {fileAccess}=require('./files.cjs');
const version=require('../package.json').version;
const base=path.join(__dirname,'..');
const smoke=process.argv.includes('--smoke-test')||process.argv.includes('--smoke-launcher');
const requestedRole=process.argv.includes('--launcher')||/Lolite Launcher\.exe$/i.test(process.execPath)||process.argv.includes('--smoke-launcher')?'launcher':'os';
// Both entry executables share one main process and one data profile.
app.setName('Lolite OS');
const dataRoot=smoke&&process.env.LOLITE_SMOKE_DATA?path.resolve(process.env.LOLITE_SMOKE_DATA):path.join(app.getPath('appData'),'Lolite OS');
app.setPath('userData',dataRoot);
app.setPath('sessionData',path.join(dataRoot,'profile'));
const store=new Store(dataRoot);
let launcher=null,os=null,updater=null,updating=false,healthTimer=null,healthy=false;
protocol.registerSchemesAsPrivileged([{scheme:'lolite',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true,allowServiceWorkers:false}}]);
if(!app.requestSingleInstanceLock({role:requestedRole})){app.quit();}
else {
  app.on('second-instance',(_event,argv,_cwd,data)=>{if(updating)return;if(data?.role==='launcher'||argv.includes('--launcher'))showLauncher();else showOS();});
  app.whenReady().then(start).catch(fatal);
}
process.on('uncaughtException',fatal);
process.on('unhandledRejection',error=>store.log(error?.stack||error));
function fatal(error){store.log(error?.stack||error);if(smoke){smokeResult({ok:false,error:String(error)});app.exit(1);return;}dialog.showErrorBox('Lolite OS could not start',`${error.message||error}\nYour files are still in your application data folder. Open Lolite Launcher to repair the installation.`);app.exit(1);}
const appCSP="default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: data: https:; font-src 'self' data: blob:; connect-src 'self' https: wss:; worker-src 'self' blob:; frame-src lolite://content https: blob: data:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
const launcherCSP="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";
async function installProtocol(){
  await protocol.handle('lolite',async request=>{
    try{
      const url=new URL(request.url);if(!['app','launcher','content'].includes(url.hostname))return new Response('Not found',{status:404});
      const directory=url.hostname==='launcher'?path.join(base,'launcher'):path.join(base,'web');
      const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
      if(url.hostname==='content' && !/^(games|html games)\//.test(relative))return new Response('Not found',{status:404});
      const target=path.join(directory,safeRelative(relative));
      const response=await net.fetch(pathToFileURL(target).href,{headers:request.headers});
      const headers=new Headers(response.headers);
      headers.set('X-Content-Type-Options','nosniff');
      if(url.hostname!=='content')headers.set('Content-Security-Policy',url.hostname==='launcher'?launcherCSP:appCSP);
      else headers.set('Access-Control-Allow-Origin','*');
      return new Response(response.body,{status:response.status,headers});
    }catch{return new Response('This bundled file is missing. Use Repair Installation in Lolite Launcher.',{status:404});}
  });
}
function secureSession(){
  const s=session.defaultSession;
  s.setPermissionCheckHandler((_wc,permission,origin)=>['fullscreen','pointerLock'].includes(permission) && origin.startsWith('lolite://'));
  s.setPermissionRequestHandler(async(wc,permission,callback,details)=>{
    if(['fullscreen','pointerLock'].includes(permission)){callback(true);return;}
    if(permission==='media' && details.isMainFrame && wc===os?.webContents){const result=await dialog.showMessageBox(os,{type:'question',buttons:['Deny','Allow this time'],defaultId:0,cancelId:0,message:'Allow Lolite OS to use your microphone or camera for this request?'});callback(result.response===1);return;}
    callback(false);
  });
  s.setDevicePermissionHandler(()=>false);
  s.webRequest.onBeforeRequest((details,callback)=>{
    try{
      const u=new URL(details.url);
      if(u.protocol==='file:'&&details.webContentsId>0){callback({cancel:true});return;}
      if(details.resourceType==='subFrame' && u.protocol==='lolite:' && u.hostname==='app'){
        if(/^\/(games|html%20games)\//i.test(u.pathname)){u.hostname='content';callback({redirectURL:u.href});return;}
        callback({cancel:true});return;
      }
    }catch{callback({cancel:true});return;}
    callback({});
  });
  s.on('will-download',(_event,item)=>{item.setSaveDialogOptions({title:'Save from Lolite OS'});});
}
function windowOptions(role){
  const saved=store.data.windows?.[role]||{},fallback=role==='launcher'?{width:1140,height:780}:{width:1360,height:860};
  const bounds={width:Math.max(800,Math.min(saved.width||fallback.width,4000)),height:Math.max(600,Math.min(saved.height||fallback.height,2400))};
  if(Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&screen.getAllDisplays().some(d=>saved.x+100>d.workArea.x&&saved.x<d.workArea.x+d.workArea.width-100&&saved.y+80>d.workArea.y&&saved.y<d.workArea.y+d.workArea.height-80)){bounds.x=saved.x;bounds.y=saved.y;}
  return {...bounds,minWidth:800,minHeight:600,show:false,title:role==='launcher'?'Lolite Launcher':'Lolite OS',backgroundColor:'#090e18',icon:path.join(base,'build/icon.png'),autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,nodeIntegrationInSubFrames:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,webviewTag:false,spellcheck:true}};
}
function secureWindow(win,role){
  const host=role==='launcher'?'launcher':'app';
  win.webContents.setWindowOpenHandler(({url})=>{openExternal(url,win);return {action:'deny'};});
  win.webContents.on('will-navigate',(event,url)=>{if(url!==`lolite://${host}/index.html`){event.preventDefault();openExternal(url,win);}});
  win.webContents.on('will-attach-webview',event=>event.preventDefault());
  win.webContents.on('before-input-event',(event,input)=>{if(input.key==='F11'&&input.type==='keyDown'){event.preventDefault();win.setFullScreen(!win.isFullScreen());}if(input.key==='Escape'&&input.type==='keyDown'&&win.isFullScreen())win.setFullScreen(false);});
  win.on('close',()=>{store.data.windows ||= {};store.data.windows[role]={...win.getNormalBounds(),maximized:win.isMaximized()};store.save();});
  win.once('ready-to-show',()=>{if(store.data.windows?.[role]?.maximized)win.maximize();if(role==='os'&&store.data.settings.fullscreen)win.setFullScreen(true);win.show();if(store.data.settings.startMinimized&&!smoke)win.minimize();});
  win.webContents.on('render-process-gone',(_event,details)=>{store.log(`${role} renderer: ${details.reason}`);if(role==='os')recover('The new desktop renderer stopped unexpectedly.');});
}
async function openExternal(value,owner){
  try{const url=new URL(value);if(!['https:','http:','mailto:'].includes(url.protocol)||url.username||url.password)return;
    const {response}=await dialog.showMessageBox(owner,{type:'question',title:'Open external link',message:'Open this link in your default Windows application?',detail:url.href.slice(0,700),buttons:['Cancel','Open link'],defaultId:0,cancelId:0});
    if(response===1)await shell.openExternal(url.href);
  }catch(error){store.log(error.message);}
}
function showLauncher(){
  if(launcher){launcher.show();launcher.restore();launcher.focus();return launcher;}
  launcher=new BrowserWindow(windowOptions('launcher'));secureWindow(launcher,'launcher');
  launcher.on('closed',()=>{launcher=null;});launcher.loadURL('lolite://launcher/index.html');
  return launcher;
}
function showOS(){
  if(updating)return;if(os){os.show();os.restore();os.focus();return os;}
  healthy=false;os=new BrowserWindow(windowOptions('os'));secureWindow(os,'os');
  os.on('closed',()=>{os=null;clearTimeout(healthTimer);nativeFiles.revoke();emit();});
  os.webContents.on('did-fail-load',(_event,code,description,_url,main)=>{if(main&&code!==-3)recover(description);});
  os.loadURL('lolite://app/index.html');
  healthTimer=setTimeout(()=>{if(!healthy)recover('The desktop did not finish starting.');},30000);
  emit();return os;
}
let nativeFiles;
function emit(){if(launcher&&!launcher.isDestroyed())launcher.webContents.send('launcher:state',{...updater.snapshot(),running:!!os,packaged:app.isPackaged});}
function handle(channel,host,fn){ipcMain.handle(channel,async(event,...args)=>{if(!trustedFrame(event,host))throw Error('This page is not authorized to use desktop commands.');return fn(...args);});}
async function start(){
  app.setAppUserModelId('com.lolite.os');Menu.setApplicationMenu(null);
  await installProtocol();secureSession();
  updater=new Updater({store,version});updater.on('state',emit);
  nativeFiles=fileAccess({dialog,getWindow:()=>os});
  for(const op of ['open','save','folder','list','read'])handle('files:'+op,'app',arg=>nativeFiles[op](arg));
  handle('desktop:version','app',()=>version);
  handle('desktop:launcher','app',()=>{showLauncher();return true;});
  handle('desktop:fullscreen','app',()=>{os.setFullScreen(!os.isFullScreen());return os.isFullScreen();});
  handle('desktop:ready','app',()=>{healthy=true;clearTimeout(healthTimer);if(store.data.pending?.to===version){store.history('Update healthy',version);delete store.data.pending;store.save();}if(smoke)smokeDesktop().catch(fatal);return true;});
  handle('launcher:state','launcher',()=>({...updater.snapshot(),running:!!os,packaged:app.isPackaged}));
  handle('launcher:launch','launcher',()=>{showOS();return true;});
  for(const action of ['check','download','pause','clear'])handle('launcher:'+action,'launcher',()=>updater[action==='clear'?'clearCache':action]());
  handle('launcher:settings','launcher',patch=>{if(updater.busy)throw Error('Wait for the update operation before changing settings.');const changed=patch?.beta!==undefined&&patch.beta!==store.data.settings.beta;const settings=store.settings(patch);if(changed){updater.release=null;updater.ready=null;updater.set({phase:'idle',latest:null,message:'Channel changed. Check for updates.'});}emit();return settings;});
  handle('launcher:folder','launcher',async which=>{if(!['installation','data'].includes(which))throw Error('Unknown folder.');const target=which==='data'?dataRoot:app.isPackaged?path.dirname(process.execPath):base;const error=await shell.openPath(target);if(error)throw Error(error);});
  handle('launcher:repair','launcher',async()=>{if(!app.isPackaged)throw Error('Repair is available in the installed Windows application.');if(os)throw Error('Close Lolite OS before checking and repairing program files.');return updater.repair(path.dirname(process.execPath));});
  handle('launcher:install','launcher',async()=>{
    if(!app.isPackaged||process.platform!=='win32')throw Error('Install updates from the installed Windows application.');
    if(os){const {response}=await dialog.showMessageBox(launcher,{type:'question',buttons:['Cancel','Close Lolite OS and install'],defaultId:0,cancelId:0,message:'Save your work before installing.',detail:'Lolite OS must close before application files can be replaced.'});if(response!==1)return;await new Promise(resolve=>{const current=os;current.once('closed',resolve);current.close();setTimeout(resolve,1500);});if(os)throw Error('Lolite OS is still open. Save your work and close it first.');}
    updating=true;try{const installer=await updater.prepareInstall();await runInstaller(installer);}catch(e){updating=false;throw e;}
  });
  const pending=store.data.pending;
  if(pending&&pending.to!==version){updater.set({phase:'error',message:'The previous installation did not finish. Your existing version and user data are available. Retry the update.'});delete store.data.pending;store.save();}
  if(requestedRole==='launcher')showLauncher();else showOS();
  if(pending?.to===version&&pending.launch)showOS();
  if(smoke&&requestedRole==='launcher')launcher.webContents.once('did-finish-load',()=>smokeLauncher().catch(fatal));
  if(smoke)setTimeout(()=>{smokeResult({ok:false,error:'Startup health check timed out'});app.exit(1);},40000).unref();
  if(!smoke&&store.data.settings.checkOnStartup&&requestedRole==='launcher')updater.check().catch(()=>{});
}
async function runInstaller(file){
  // The only input is a hash-verified installer from the fixed official repository.
  const child=spawn(file,['--updated','--force-run'],{detached:true,stdio:'ignore',windowsHide:false});
  await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});
  child.unref();setImmediate(()=>{updating=true;app.quit();});
}
async function recover(reason){
  clearTimeout(healthTimer);store.log('Desktop recovery: '+reason);
  if(smoke){smokeResult({ok:false,error:reason});app.exit(1);return;}
  if(updating)return;
  const pending=store.data.pending;
  if(pending?.to===version&&pending.recovery&&process.platform==='win32'){
    try{await verifyInstaller(pending.recovery.file,pending.recovery.release);updating=true;os?.destroy();store.history('Automatic rollback',pending.recovery.release.version,reason);store.data.lastInstaller=pending.recovery;delete store.data.pending;store.save();await runInstaller(pending.recovery.file);return;}catch(e){updating=false;store.log('Rollback unavailable: '+e.message);}
  }
  showLauncher();updater.set({phase:'error',message:reason+' Use Repair Installation. Your personal files are preserved.'});
}
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{clearTimeout(healthTimer);store.save();});
function smokeResult(result){if(process.env.LOLITE_SMOKE_RESULT)fs.writeFileSync(process.env.LOLITE_SMOKE_RESULT,JSON.stringify({...result,version},null,2));}
async function smokeDesktop(){
  const result=await os.webContents.executeJavaScript(`(async()=>{const rows=await FileOS.all();await FileOS.put('Documents/desktop-smoke.txt',new Blob(['persistent desktop data']));return {bridge:!!window.loliteDesktop,node:typeof require,icons:document.querySelectorAll('#icons .desktop-icon').length,files:!!window.FileOS,previous:rows.some(r=>r.path==='Documents/desktop-smoke.txt')}})()`);
  if(!result.bridge||result.node!=='undefined'||!result.files)throw Error('Desktop isolation or storage check failed.');
  await os.webContents.executeJavaScript(`new Promise(resolve=>{const f=document.createElement('iframe');f.sandbox='allow-scripts';f.srcdoc='<script>try{parent.loliteDesktop.version();parent.postMessage("unsafe","*")}catch(e){parent.postMessage("isolated","*")}<\/script>';window.addEventListener('message',e=>{if(e.source===f.contentWindow){f.remove();resolve(e.data)}},{once:true});document.body.append(f)})`).then(value=>{if(value!=='isolated')throw Error('Child frame isolation failed');});
  if(process.env.LOLITE_SMOKE_SCREENSHOT)await fsp.writeFile(process.env.LOLITE_SMOKE_SCREENSHOT,(await os.webContents.capturePage()).toPNG());
  smokeResult({ok:true,...result});app.quit();
}
async function smokeLauncher(){
  const result=await launcher.webContents.executeJavaScript(`({bridge:!!window.loliteLauncher,node:typeof require,buttons:document.querySelectorAll('button').length})`);
  if(!result.bridge||result.node!=='undefined'||result.buttons<8)throw Error('Launcher smoke test failed.');
  if(process.env.LOLITE_SMOKE_SCREENSHOT)await fsp.writeFile(process.env.LOLITE_SMOKE_SCREENSHOT,(await launcher.webContents.capturePage()).toPNG());
  smokeResult({ok:true,...result});app.quit();
}
