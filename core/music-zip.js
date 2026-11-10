/* Local, bounded ZIP reader for Lolite Music. Archives never upload; only approved audio entries do. */
(()=>{
 'use strict';
 const MIME=Object.freeze({mp3:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav',webm:'audio/webm',aac:'audio/aac'});
 const MAX_TRACK_BYTES=50*1024*1024,MAX_TRACKS=3000,MAX_HEADERS=20000,MAX_TABLE_BYTES=64*1024*1024;
 const decoder=new TextDecoder('utf-8');
 const table=new Uint32Array(256);
 for(let n=0;n<256;n++){let c=n;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}
 const crcUpdate=(crc,data)=>{for(let i=0;i<data.length;i++)crc=table[(crc^data[i])&255]^(crc>>>8);return crc>>>0};
 const u16=(d,p)=>d.getUint16(p,true),u32=(d,p)=>d.getUint32(p,true);
 function u64(d,p){const n=Number(d.getBigUint64(p,true));if(!Number.isSafeInteger(n))throw Error('ZIP is too large for this browser.');return n}
 function safeName(name){
  if(!name||name.length>1024||/[\u0000-\u001f\u007f]/.test(name))return false;
  const s=name.replace(/\\/g,'/');
  return !s.startsWith('/')&&!/^[a-z]:/i.test(s)&&s.split('/').every(x=>x&&x!=='.'&&x!=='..'&&!x.includes(':'));
 }
 function guess(path,defaultArtist='',defaultAlbum=''){
  let base=path.split('/').pop().replace(/\.[^.]+$/,'').replace(/_/g,' ').trim();
  base=base.replace(/^\d{1,3}[.\s_-]+/,'');
  const match=base.match(/^(.+?)\s+-\s+(.+)$/);
  const artist=(defaultArtist||match?.[1]||'Unknown Artist').trim().slice(0,80);
  const title=(match?.[2]||base||'Untitled').trim().slice(0,120);
  const parts=path.split('/');
  const album=(defaultAlbum||(parts.length>1?parts[parts.length-2]:'')).trim().slice(0,80);
  return {title,artist,album};
 }
 async function inspect(file){
  if(!file||!(/\.zip$/i).test(file.name||'')||!file.size)throw Error('Choose a non-empty .zip file.');
  // Read only the final ZIP directory and each selected song: huge ZIP packs don't fill memory.
  const tailStart=Math.max(0,file.size-65557);
  const tail=new Uint8Array(await file.slice(tailStart).arrayBuffer());
  const td=new DataView(tail.buffer);
  let eocd=-1;
  for(let p=tail.length-22;p>=0;p--){
   if(u32(td,p)===0x06054b50&&p+22+u16(td,p+20)===tail.length){eocd=p;break}
  }
  if(eocd<0)throw Error('Invalid ZIP file (end directory missing).');
  if(u16(td,eocd+4)||u16(td,eocd+6))throw Error('Multi-volume ZIP archives are not supported.');
  let count=u16(td,eocd+10),size=u32(td,eocd+12),offset=u32(td,eocd+16);
  if(count===65535||size===0xffffffff||offset===0xffffffff){
   if(eocd<20||u32(td,eocd-20)!==0x07064b50)throw Error('ZIP64 archive directory is missing.');
   const locator=new DataView(tail.buffer,eocd-20,20);
   if(u32(locator,4)!==0||u32(locator,16)!==1)throw Error('Multi-volume ZIP64 is not supported.');
   const pos=u64(locator,8);
   if(pos+56>file.size)throw Error('Invalid ZIP64 directory offset.');
   const d=new DataView(await file.slice(pos,pos+56).arrayBuffer());
   if(u32(d,0)!==0x06064b50||u32(d,16)!==0||u32(d,20)!==0)throw Error('Invalid ZIP64 directory.');
   count=u64(d,32);size=u64(d,40);offset=u64(d,48);
  }
  if(count<1||count>MAX_HEADERS||size>MAX_TABLE_BYTES||offset+size>file.size||size<46)throw Error('ZIP contains too many files or an invalid directory.');
  const bytes=new Uint8Array(await file.slice(offset,offset+size).arrayBuffer());
  const d=new DataView(bytes.buffer);
  let p=0;const entries=[];
  for(let i=0;i<count;i++){
   if(p+46>bytes.length||u32(d,p)!==0x02014b50)throw Error('ZIP directory is damaged.');
   const flags=u16(d,p+8),method=u16(d,p+10),crc=u32(d,p+16);
   let packed=u32(d,p+20),unpacked=u32(d,p+24),local=u32(d,p+42);
   const nameSize=u16(d,p+28),extraSize=u16(d,p+30),commentSize=u16(d,p+32);
   const end=p+46+nameSize+extraSize+commentSize;
   if(end>bytes.length)throw Error('ZIP directory contains an invalid entry.');
   const name=decoder.decode(bytes.subarray(p+46,p+46+nameSize));
   if(packed===0xffffffff||unpacked===0xffffffff||local===0xffffffff){
    let found=false;
    for(let x=p+46+nameSize;x+4<=p+46+nameSize+extraSize;){
     const id=u16(d,x),len=u16(d,x+2),from=x+4;
     if(from+len>p+46+nameSize+extraSize)throw Error('Invalid ZIP64 metadata.');
     if(id===1){
      let q=from;
      if(unpacked===0xffffffff){if(q+8>from+len)throw Error('Incomplete ZIP64 data.');unpacked=u64(d,q);q+=8}
      if(packed===0xffffffff){if(q+8>from+len)throw Error('Incomplete ZIP64 data.');packed=u64(d,q);q+=8}
      if(local===0xffffffff){if(q+8>from+len)throw Error('Incomplete ZIP64 data.');local=u64(d,q);q+=8}
      found=true;break;
     }
     x=from+len;
    }
    if(!found)throw Error('Missing ZIP64 file size information.');
   }
   p=end;
   if(name.endsWith('/')||name.startsWith('__MACOSX/')||/(?:^|\/)\.DS_Store$/i.test(name))continue;
   const ext=name.split('.').pop().toLowerCase();
   if(!MIME[ext])continue; // ignore covers, playlists, documents and system files
   if(!safeName(name))throw Error('Unsafe song path inside ZIP.');
   if(flags&1)throw Error('Password-protected music ZIPs are not supported.');
   if(method!==0&&method!==8)throw Error('Unsupported ZIP compression for '+name);
   if(!unpacked||unpacked>MAX_TRACK_BYTES)throw Error(name+' exceeds the 50 MB per-song storage limit.');
   if(packed>MAX_TRACK_BYTES+1024*1024||local+30>offset||local+30+packed>file.size)throw Error('Invalid compressed song size or location.');
   if(entries.length>=MAX_TRACKS)throw Error('ZIP contains more than '+MAX_TRACKS+' songs. Split it into smaller ZIPs.');
   entries.push({path:name,ext,type:MIME[ext],method,crc,packed,unpacked,local});
  }
  if(!entries.length)throw Error('No supported songs found. Include MP3, M4A, OGG, WAV, WebM or AAC files.');
  return entries;
 }
 async function extract(file,entry){
  const header=new DataView(await file.slice(entry.local,entry.local+30).arrayBuffer());
  if(header.byteLength!==30||u32(header,0)!==0x04034b50||u16(header,8)!==entry.method)throw Error('Invalid ZIP song header: '+entry.path);
  const nameLen=u16(header,26),extraLen=u16(header,28),start=entry.local+30+nameLen+extraLen;
  if(start+entry.packed>file.size)throw Error('ZIP song is incomplete.');
  const packed=file.slice(start,start+entry.packed);
  const stream=entry.method===8
   ?packed.stream().pipeThrough(new DecompressionStream('deflate-raw'))
   :packed.stream();
  let total=0,crc=0xffffffff;const chunks=[];
  const reader=stream.getReader();
  try{
   while(true){
    const {value,done}=await reader.read();if(done)break;
    total+=value.byteLength;
    if(total>entry.unpacked||total>MAX_TRACK_BYTES){await reader.cancel();throw Error('ZIP song expands beyond its declared size.')}
    crc=crcUpdate(crc,value);chunks.push(value);
   }
  }catch(e){try{await reader.cancel()}catch{}throw Error('Could not extract '+entry.path+': '+(e.message||e))}
  if(total!==entry.unpacked||((crc^0xffffffff)>>>0)!==entry.crc)throw Error('ZIP checksum failed for '+entry.path);
  return new Blob(chunks,{type:entry.type});
 }
 window.LoliteMusicZip=Object.freeze({inspect,extract,guess,MAX_TRACK_BYTES,MAX_TRACKS});
})();
