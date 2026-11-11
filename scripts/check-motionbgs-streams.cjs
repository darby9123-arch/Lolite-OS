/* Probe a small sample of MotionBGS's official video URLs without downloading full videos.
 * This is diagnostic only: the provider may block GitHub-hosted checks even
 * when browser playback works. Nothing is cached or redistributed. */
const https=require('node:https');
function probe(url,depth=0){
 return new Promise(resolve=>{
  if(depth>5)return resolve({url,result:'redirect limit'});
  const req=https.get(url,{headers:{'Range':'bytes=0-255','User-Agent':'Mozilla/5.0','Accept':'video/mp4,*/*'}},res=>{
   const status=res.statusCode||0;
   if(status>=300&&status<400&&res.headers.location){
    const next=new URL(res.headers.location,url).href;
    res.resume();resolve(probe(next,depth+1));return;
   }
   const result={url:res.responseUrl||url,status,contentType:res.headers['content-type']||'',length:res.headers['content-length']||''};
   let completed=false;
   const finish=buf=>{if(completed)return;completed=true;result.prefix=buf?.subarray(0,32).toString('latin1').replace(/[^\x20-\x7e]/g,'.')||'';resolve(result);res.destroy()};
   res.on('data',finish);res.on('end',()=>finish());res.on('error',()=>finish());
  });
  req.setTimeout(7000,()=>{req.destroy();resolve({url,result:'timeout'})});
  req.on('error',error=>resolve({url,result:error.code||error.message}));
 });
}
(async()=>{
 for(const id of ['3277','4011','6196','715']){
  const result=await probe('https://motionbgs.com/dl/hd/'+id);
  console.log('MotionBGS remote stream probe:',JSON.stringify(result));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
