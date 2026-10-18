'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const {digest}=require('../src/updater.cjs');
module.exports=async context=>{
  if(context.electronPlatformName!=='win32')return;
  const root=context.appOutDir;
  // Both genuine PE executables use the same signed Electron runtime/resources.
  // Copy AFTER signing so the launcher retains the valid Authenticode signature.
  await fs.copyFile(path.join(root,'Lolite OS.exe'),path.join(root,'Lolite Launcher.exe'));
  const files=[];
  async function walk(folder){for(const item of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,item.name);if(item.isDirectory())await walk(file);else if(item.name!=='integrity.json')files.push({path:path.relative(root,file).replaceAll(path.sep,'/'),size:(await fs.stat(file)).size,sha256:await digest(file,'sha256')});}}
  await walk(root);await fs.writeFile(path.join(root,'resources/integrity.json'),JSON.stringify({schema:1,version:require('../package.json').version,files},null,2));
};
