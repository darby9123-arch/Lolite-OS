'use strict';
const {contextBridge,ipcRenderer}=require('electron');
// A remote page or child frame never receives either bridge.
if(process.isMainFrame && location.protocol==='lolite:' && location.pathname==='/index.html') {
  const call=(name,...args)=>ipcRenderer.invoke(name,...args);
  if(location.hostname==='launcher')contextBridge.exposeInMainWorld('loliteLauncher',{
    state:()=>call('launcher:state'),launch:()=>call('launcher:launch'),check:()=>call('launcher:check'),reinstall:()=>call('launcher:reinstall'),readme:refresh=>call('launcher:readme',refresh),download:()=>call('launcher:download'),pause:()=>call('launcher:pause'),install:()=>call('launcher:install'),repair:()=>call('launcher:repair'),clear:()=>call('launcher:clear'),settings:patch=>call('launcher:settings',patch),openFolder:which=>call('launcher:folder',which),
    onState:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('launcher:state',listener);return ()=>ipcRenderer.removeListener('launcher:state',listener);}
  });
  if(location.hostname==='app')contextBridge.exposeInMainWorld('loliteDesktop',{
    openFiles:()=>call('files:open'),saveFile:file=>call('files:save',file),chooseFolder:()=>call('files:folder'),listFolder:request=>call('files:list',request),readFile:request=>call('files:read',request),launcher:page=>call('desktop:launcher',page),fullscreen:()=>call('desktop:fullscreen'),ready:()=>call('desktop:ready'),version:()=>call('desktop:version'),
    onUpdate:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('desktop:update-state',listener);return ()=>ipcRenderer.removeListener('desktop:update-state',listener);}
  });
}
