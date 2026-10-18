'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {safeName,grantedPath}=require('./security.cjs');
const {maxFileBytes}=require('./config.cjs');
function fileAccess({dialog,getWindow}) {
  const grants=new Map();
  async function read(file){const stat=await fs.stat(file);if(!stat.isFile() || stat.size>maxFileBytes)throw Error('Native transfer limit is 256 MB per file. Use Import to stream larger files into Lolite.');return {name:path.basename(file),bytes:new Uint8Array(await fs.readFile(file)),modified:stat.mtimeMs};}
  return {
    async open(){const result=await dialog.showOpenDialog(getWindow(),{title:'Import into Lolite OS',properties:['openFile','multiSelections']});if(result.canceled)return [];if(result.filePaths.length>50)throw Error('Select up to 50 files at a time.');const out=[];let total=0;for(const file of result.filePaths){const item=await read(file);total+=item.bytes.length;if(total>maxFileBytes)throw Error('Select files totaling up to 256 MB per import.');out.push(item);}return out;},
    async save({name,bytes}){if(!(bytes instanceof Uint8Array) || bytes.byteLength>maxFileBytes)throw Error('Invalid export or export exceeds 256 MB.');const result=await dialog.showSaveDialog(getWindow(),{title:'Save from Lolite OS',defaultPath:safeName(name)});if(result.canceled)return false;await fs.writeFile(result.filePath,bytes);return true;},
    async folder(){const result=await dialog.showOpenDialog(getWindow(),{title:'Allow Lolite to read this folder for this session',properties:['openDirectory']});if(result.canceled)return null;const root=await fs.realpath(result.filePaths[0]),token=crypto.randomUUID();grants.set(token,root);return {token,name:path.basename(root)};},
    async list({token,relative=''}){const root=grants.get(token);if(!root)throw Error('Select the folder again to grant access.');const folder=relative?await grantedPath(root,relative):root;const entries=await fs.readdir(folder,{withFileTypes:true});return entries.slice(0,2000).filter(e=>!e.isSymbolicLink()).map(e=>({name:e.name,directory:e.isDirectory(),relative:[relative,e.name].filter(Boolean).join('/')}));},
    async read({token,relative}){const root=grants.get(token);if(!root)throw Error('Folder access expired.');return read(await grantedPath(root,relative));},
    revoke(){grants.clear();}
  };
}
module.exports={fileAccess};
