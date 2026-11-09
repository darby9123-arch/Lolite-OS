/* Admin ZIP intake: inspect and validate MP4s locally before publishing the files.
 * The ZIP never leaves the device. Only approved entries reach Supabase Storage.
 */
(()=>{
 'use strict';
 const MAX_ARCHIVE=300*1024*1024,MAX_TOTAL=300*1024*1024,MAX_VIDEO=50*1024*1024,MAX_VIDEOS=24,MAX_TABLE_ROWS=1000;
 const decoder=new TextDecoder('utf-8');
 const crcTable=new Uint32Array(256);
 for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;crcTable[n]=c>>>0}
 function crc32(data){
  let crc=0xffffffff;
  for(let i=0;i<data.length;i++)crc=crcTable[(crc^data[i])&255]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
 }
 function filenameOK(raw){
  if(!raw||raw.length>600||/[\u0000-\u001f\u007f]/.test(raw))return false;
  const path=raw.replace(/\\/g,'/');
  return !path.startsWith('/')&&!/^[a-z]:/i.test(path)&&
   path.split('/').every(part=>part&&part!=='.'&&part!=='..'&&!part.includes(':'));
 }
 function titleFromPath(path){
  return path.split('/').pop().replace(/\.mp4$/i,'').replace(/[_-]+/g,' ').trim().slice(0,90)||'Live wallpaper';
 }
 async function inflate(data,expected){
  if(typeof DecompressionStream!=='function')throw Error('ZIP extraction is not supported by this browser.');
  const chunks=[];
  const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  let total=0;
  try{
   while(true){
    const {value,done}=await reader.read();if(done)break;
    total+=value.length;
    if(total>expected||total>MAX_VIDEO){await reader.cancel();throw Error('ZIP entry expanded beyond its declared size.')}
    chunks.push(value);
   }
  }catch(error){throw Error('Could not decompress MP4: '+(error?.message||'invalid ZIP'))}
  const output=new Uint8Array(total);let offset=0;
  for(const part of chunks){output.set(part,offset);offset+=part.length}
  return output;
 }
 async function metadata(blob){
  const url=URL.createObjectURL(blob);
  try{
   return await new Promise((resolve,reject)=>{
    const video=document.createElement('video');
    let completed=false;
    const done=(error,result)=>{
     if(completed)return;completed=true;clearTimeout(timer);
     video.removeAttribute('src');video.load();
     error?reject(error):resolve(result);
    };
    const timer=setTimeout(()=>done(Error('Video metadata could not be read.')),10000);
    video.preload='metadata';video.muted=true;video.playsInline=true;
    video.onloadedmetadata=()=>{
     if(!video.videoWidth||!video.videoHeight||!Number.isFinite(video.duration)||video.duration<=0){
      done(Error('Invalid video dimensions or duration.'));return;
     }
     done(null,{width:video.videoWidth,height:video.videoHeight,duration:video.duration});
    };
    video.onerror=()=>done(Error('This MP4 cannot be opened by the browser.'));
    video.src=url;video.load();
   });
  }finally{URL.revokeObjectURL(url)}
 }
 async function inspect(file){
  if(!(file instanceof File)||!/\.zip$/i.test(file.name))throw Error('Choose a .zip archive of MP4 wallpapers.');
  if(!file.size||file.size>MAX_ARCHIVE)throw Error('The ZIP must be 300 MB or smaller.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const dv=new DataView(bytes.buffer);
  let eocd=-1;
  for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--){
   if(dv.getUint32(p,true)===0x06054b50&&p+22+dv.getUint16(p+20,true)===bytes.length){eocd=p;break}
  }
  if(eocd<0)throw Error('This is not a valid standard ZIP archive.');
  if(dv.getUint16(eocd+4,true)||dv.getUint16(eocd+6,true))throw Error('Multi-volume ZIPs are not supported.');
  const count=dv.getUint16(eocd+10,true),centralSize=dv.getUint32(eocd+12,true),centralOffset=dv.getUint32(eocd+16,true);
  if(count===0||count>MAX_TABLE_ROWS||count===0xffff||centralOffset===0xffffffff)throw Error('ZIP has too many files or uses unsupported ZIP64 metadata.');
  if(centralOffset+centralSize>eocd)throw Error('ZIP file table is damaged.');
  const entries=[];let position=centralOffset,total=0;
  const seen=new Set();
  for(let i=0;i<count;i++){
   if(position+46>eocd||dv.getUint32(position,true)!==0x02014b50)throw Error('ZIP file table is incomplete.');
   const flags=dv.getUint16(position+8,true),method=dv.getUint16(position+10,true);
   const crc=dv.getUint32(position+16,true),compressed=dv.getUint32(position+20,true),uncompressed=dv.getUint32(position+24,true);
   const nameLen=dv.getUint16(position+28,true),extraLen=dv.getUint16(position+30,true),commentLen=dv.getUint16(position+32,true);
   const localOffset=dv.getUint32(position+42,true);
   const end=position+46+nameLen+extraLen+commentLen;
   if(end>eocd)throw Error('ZIP contains a damaged filename.');
   const path=decoder.decode(bytes.subarray(position+46,position+46+nameLen));position=end;
   if(path.endsWith('/')||path.startsWith('__MACOSX/')||/(?:^|\/)\.DS_Store$/.test(path))continue;
   if(!filenameOK(path))throw Error('Unsafe file path inside ZIP.');
   if(!/\.mp4$/i.test(path))continue;
   if(seen.has(path.toLowerCase()))throw Error('Duplicate MP4 filename: '+path);
   seen.add(path.toLowerCase());
   if(entries.length>=MAX_VIDEOS)throw Error('A wallpaper pack can contain at most 24 MP4 videos.');
   if(flags&1)throw Error('Password-protected ZIP entries are not supported.');
   if(method!==0&&method!==8)throw Error('This ZIP uses an unsupported compression method.');
   if(!uncompressed||uncompressed>MAX_VIDEO)throw Error(path+' exceeds the 50 MB video limit.');
   if(compressed>MAX_ARCHIVE||localOffset===0xffffffff||compressed===0xffffffff)throw Error('Unsupported ZIP64 video entry.');
   total+=uncompressed;
   if(total>MAX_TOTAL)throw Error('Unpacked MP4s exceed 300 MB altogether.');
   if(localOffset+30>centralOffset||dv.getUint32(localOffset,true)!==0x04034b50)throw Error('Invalid MP4 entry inside ZIP.');
   const localName=dv.getUint16(localOffset+26,true),localExtra=dv.getUint16(localOffset+28,true);
   const start=localOffset+30+localName+localExtra;
   if(start+compressed>centralOffset)throw Error('Incomplete MP4 data inside ZIP.');
   entries.push({path,name:titleFromPath(path),method,crc,compressed,uncompressed,start});
  }
  if(!entries.length)throw Error('No MP4 files were found. Put your videos inside the ZIP.');
  const videos=[];
  for(const entry of entries){
   const packed=bytes.slice(entry.start,entry.start+entry.compressed);
   const data=entry.method===8?await inflate(packed,entry.uncompressed):packed;
   if(data.length!==entry.uncompressed||crc32(data)!==entry.crc)throw Error('ZIP checksum failed for '+entry.path);
   const signature=decoder.decode(data.subarray(4,8));
   if(signature!=='ftyp')throw Error(entry.path+' is not an MP4 video (invalid file signature).');
   const blob=new Blob([data],{type:'video/mp4'});
   videos.push({name:entry.name,path:entry.path,blob,size:blob.size,selected:true,width:0,height:0,duration:0,error:''});
  }
  // Validate actual browser playback metadata, not just filename or MIME type.
  let next=0;
  await Promise.all(Array.from({length:Math.min(3,videos.length)},async()=>{
   while(next<videos.length){
    const v=videos[next++];
    try{Object.assign(v,await metadata(v.blob))}
    catch(error){v.error=error?.message||'Unsupported MP4';v.selected=false}
   }
  }));
  if(videos.every(v=>v.error))throw Error('None of the MP4s could be opened by this browser.');
  return videos;
 }
 window.LoliteWallpaperZip=Object.freeze({inspect,limits:{maxVideoMB:50,maxArchiveMB:300,maxVideos:24}});
})();
