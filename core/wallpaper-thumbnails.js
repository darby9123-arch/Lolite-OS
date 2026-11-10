/* Extract a true preview frame from a video. New uploads store WebP/PNG in shared
 * Storage; older videos can generate a local thumbnail without republishing. */
(()=>{
 'use strict';
 const cache=new Map();
 function imageBlob(canvas){
  return new Promise((resolve,reject)=>{
   canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not create a wallpaper thumbnail.')),'image/webp',0.85);
  });
 }
 async function capture(source){
  const remote=typeof source==='string';
  const objectURL=remote?source:URL.createObjectURL(source);
  const el=document.createElement('video');
  let timeout;
  try{
   if(remote)el.crossOrigin='anonymous';
   el.muted=true;el.defaultMuted=true;el.playsInline=true;el.preload='auto';
   const frame=await new Promise((resolve,reject)=>{
    let done=false;
    const finish=(error,ok)=>{
     if(done)return;done=true;clearTimeout(timeout);
     el.onloadedmetadata=el.onseeked=el.onloadeddata=el.onerror=null;
     error?reject(error):resolve(ok);
    };
    timeout=setTimeout(()=>finish(Error('Timed out reading the wallpaper video thumbnail.')),12000);
    el.onerror=()=>finish(Error('Video preview could not load. It may be unsupported or cross-origin protected.'));
    el.onseeked=()=>{if(el.readyState>=2)finish(null,true)};
    el.onloadeddata=()=>{if(el.readyState>=2&&el.currentTime>0)finish(null,true)};
    el.onloadedmetadata=()=>{
     const duration=el.duration;
     if(!el.videoWidth||!el.videoHeight||!Number.isFinite(duration)||duration<=0){
      finish(Error('Video has no usable dimensions or duration.'));return;
     }
     const time=Math.max(.02,Math.min(duration*.23,Math.max(.02,duration-.08),1.8));
     if(duration<=.12){finish(null,true);return}
     try{el.currentTime=time}catch(error){finish(error)}
    };
    el.src=objectURL;el.load();
   });
   if(!frame||!el.videoWidth||!el.videoHeight)throw Error('Video preview could not be decoded.');
   const width=560,height=315,canvas=document.createElement('canvas');
   canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d',{alpha:false});
   if(!ctx)throw Error('Browser has no thumbnail canvas support.');
   const factor=Math.max(width/el.videoWidth,height/el.videoHeight);
   const dw=el.videoWidth*factor,dh=el.videoHeight*factor;
   ctx.drawImage(el,(width-dw)/2,(height-dh)/2,dw,dh);
   return imageBlob(canvas);
  }finally{
   clearTimeout(timeout);
   el.pause();el.removeAttribute('src');el.load();
   if(!remote)URL.revokeObjectURL(objectURL);
  }
 }
 async function thumbnailFromURL(url){
  if(typeof url!=='string'||!/^https:\/\//.test(url))throw Error('Invalid video URL.');
  if(cache.has(url))return cache.get(url);
  const task=capture(url).then(blob=>new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>resolve(String(reader.result));
   reader.onerror=()=>reject(Error('Could not read video thumbnail.'));
   reader.readAsDataURL(blob);
  }));
  cache.set(url,task);
  return task.catch(error=>{cache.delete(url);throw error});
 }
 window.LoliteWallpaperThumbnails=Object.freeze({
  capture,fromURL:thumbnailFromURL,
  fileExtension:blob=>blob?.type==='image/png'?'png':'webp'
 });
})();
