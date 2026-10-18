'use strict';
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {Updater}=require('../../desktop/src/updater.cjs');
const {Store}=require('../../desktop/src/storage.cjs');
const version=require('../../desktop/package.json').version;
(async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lolite-live-release-'));
  const store=new Store(directory);store.settings({beta:version.includes('-')});
  const updater=new Updater({store,version:'0.0.0'});
  let phase='',bucket=-1;
  updater.on('state',state=>{
    const next=Math.floor(state.progress/20);
    if(state.phase!==phase || (state.phase==='downloading'&&next!==bucket)){
      console.log(JSON.stringify({phase:state.phase,version:state.latest,progress:Math.round(state.progress),message:state.message}));
      phase=state.phase;bucket=next;
    }
  });
  try{
    await updater.check();
    if(updater.state.phase!=='available'||updater.release.version!==version)throw Error('The published release does not match the desktop version.');
    await updater.download();
    if(updater.state.phase!=='ready'||!updater.ready)throw Error('The published installer did not verify.');
    const result={ok:true,version,size:updater.release.size,sha512:updater.release.sha512,source:updater.release.url,verifiedAt:new Date().toISOString()};
    fs.writeFileSync('live-release-verification.json',JSON.stringify(result,null,2)+'\n');
    console.log('Published release detected, downloaded and verified through the production updater.');
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
