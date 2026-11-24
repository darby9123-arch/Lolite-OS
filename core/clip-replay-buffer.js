/* Bounded WebM replay buffer. MediaRecorder timeslices are NOT standalone files.
 * Parse complete EBML blocks, retain a decodable keyframe, and remux timestamps,
 * duration and seek cues when saving. No decoding, re-encoding or network access.
 * Format: https://www.matroska.org/technical/elements.html
 */
((global)=>{'use strict';
 const ID={EBML:0x1a45dfa3,SEGMENT:0x18538067,INFO:0x1549a966,TRACKS:0x1654ae6b,
  CLUSTER:0x1f43b675,TIME:0xe7,SIMPLE:0xa3,GROUP:0xa0,BLOCK:0xa1,REFERENCE:0xfb,
  SCALE:0x2ad7b1,DURATION:0x4489,ENTRY:0xae,NUMBER:0xd7,TYPE:0x83,DEFAULT:0x23e383};
 const LEVEL_ONE=new Set([ID.CLUSTER,ID.INFO,ID.TRACKS,0x114d9b74,0x1c53bb6b,0x1254c367,0x1043a770,0x1941a469]);
 const join=parts=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let pos=0;
  for(const p of parts){out.set(p,pos);pos+=p.length}return out};
 function uint(value,width=0){
  if(!Number.isSafeInteger(value)||value<0)throw Error('Invalid WebM number.');
  if(!width){width=1;while(value>=2**(8*width))width++}
  const out=new Uint8Array(width);for(let i=width-1;i>=0;i--){out[i]=value%256;value=Math.floor(value/256)}return out;
 }
 function size(value){let width=1;while(value>=2**(7*width)-1)width++;
  const out=uint(value,width);out[0]|=1<<(8-width);return out;}
 const element=(id,parts)=>{const data=Array.isArray(parts)?join(parts):parts;return join([uint(id),size(data.length),data])};
 const number=(id,value,width)=>element(id,uint(Math.round(value),width));
 const floating=(id,value)=>{const bytes=new Uint8Array(8);new DataView(bytes.buffer).setFloat64(0,value);return element(id,bytes)};
 const string=(id,value)=>element(id,new TextEncoder().encode(value));
 function vint(bytes,pos,asID=false){
  if(pos>=bytes.length)return null;
  const first=bytes[pos];if(!first)throw Error('Invalid WebM element header.');
  let width=1;while(!(first&(1<<(8-width))))width++;
  if(width>(asID?4:8))throw Error('Unsupported WebM element header.');
  if(pos+width>bytes.length)return null;
  let value=asID?first:first&((1<<(8-width))-1),unknown=!asID&&value===(1<<(8-width))-1;
  for(let i=1;i<width;i++){value=value*256+bytes[pos+i];unknown=unknown&&bytes[pos+i]===255}
  if(!unknown&&!Number.isSafeInteger(value))throw Error('WebM element is too large.');
  return {width,value:unknown?null:value};
 }
 function header(bytes,pos=0){
  const id=vint(bytes,pos,true);if(!id)return null;
  const length=vint(bytes,pos+id.width);if(!length)return null;
  return {id:id.value,size:length.value,start:pos+id.width+length.width,head:id.width+length.width};
 }
 function children(bytes){
  const out=[];let pos=0;
  while(pos<bytes.length){const h=header(bytes,pos);
   if(!h||h.size===null||h.start+h.size>bytes.length)throw Error('Incomplete WebM metadata.');
   out.push({id:h.id,data:bytes.subarray(h.start,h.start+h.size)});pos=h.start+h.size;
  }return out;
 }
 const value=bytes=>{let n=0;for(const b of bytes)n=n*256+b;return n};
 class ReplayBuffer{
  constructor({seconds=30,maxBytes=48*1024*1024}={}){
   this.seconds=seconds;this.maxBytes=maxBytes;this.clear();
  }
  clear(){
   this.pending=new Uint8Array();this.header=null;this.tracks=null;this.trackInfo=new Map();
   this.videoTrack=null;this.scale=1000000;this.context='root';this.clusterLeft=null;
   this.clusterTime=0;this.frames=[];this.bytes=0;this.end=0;this.limited=false;
  }
  push(input){
   const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
   this.pending=join([this.pending,bytes]);let pos=0;
   while(pos<this.pending.length){
    if(this.context==='cluster'&&this.clusterLeft===0)this.context='segment';
    const h=header(this.pending,pos);if(!h)break;
    if(h.id===ID.SEGMENT){pos=h.start;this.context='segment';continue}
    if(this.context==='cluster'&&this.clusterLeft===null&&LEVEL_ONE.has(h.id))this.context='segment';
    if(this.context==='segment'&&h.id===ID.CLUSTER){
     this.context='cluster';this.clusterLeft=h.size;this.clusterTime=0;pos=h.start;continue;
    }
    if(h.size===null)throw Error('Unsupported open WebM element.');
    if(h.size>8*1024*1024)throw Error('Replay data exceeded its memory limit. Try Compact quality.');
    const end=h.start+h.size;if(end>this.pending.length)break;
    const data=this.pending.subarray(h.start,end);
    if(this.context==='cluster'){
     if(this.clusterLeft!==null){this.clusterLeft-=h.head+h.size;if(this.clusterLeft<0)throw Error('Invalid WebM cluster size.');}
     if(h.id===ID.TIME)this.clusterTime=value(data);
     if(h.id===ID.SIMPLE||h.id===ID.GROUP)this.addBlock(h.id,data);
    }else if(h.id===ID.EBML)this.header=this.pending.slice(pos,end);
    else if(h.id===ID.INFO){for(const c of children(data))if(c.id===ID.SCALE){this.scale=value(c.data);
     if(!this.scale)throw Error('Invalid WebM timestamp scale.');}}
    else if(h.id===ID.TRACKS)this.readTracks(data);
    pos=end;
   }
   // Copy only the incomplete element; old MediaRecorder chunks can be collected.
   this.pending=this.pending.slice(pos);
   if(this.pending.length>8*1024*1024)throw Error('Replay data exceeded its memory limit. Try Compact quality.');
   this.prune();
  }
  readTracks(data){
   this.tracks=element(ID.TRACKS,data.slice());
   for(const entry of children(data).filter(c=>c.id===ID.ENTRY)){
    const fields=children(entry.data),get=id=>fields.find(c=>c.id===id)?.data;
    const track=value(get(ID.NUMBER)||[]),type=value(get(ID.TYPE)||[]);
    const duration=value(get(ID.DEFAULT)||[])/this.scale;
    if(!track)throw Error('WebM track number is missing.');
    this.trackInfo.set(track,{type,duration:duration||(type===1?1000000000/30:20000000)/this.scale});
    if(type===1){if(this.videoTrack!==null)throw Error('Replay requires a single video track.');this.videoTrack=track;}
   }
  }
  addBlock(kind,data){
   const fields=kind===ID.GROUP?children(data):null;
   const block=fields?fields.find(c=>c.id===ID.BLOCK)?.data:data;
   if(!block)throw Error('WebM video block is missing.');
   const track=vint(block,0);if(!track||block.length<track.width+3)throw Error('Incomplete WebM video block.');
   const relative=(block[track.width]*256+block[track.width+1]<<16)>>16;
   const at=this.clusterTime+relative,info=this.trackInfo.get(track.value);
   if(!info)throw Error('Replay track metadata is missing.');
   const key=info.type===1&&(fields?!fields.some(c=>c.id===ID.REFERENCE):!!(block[track.width+2]&128));
   const duration=fields?.find(c=>c.id===0x9b)?.data;
   const frame={kind,data:data.slice(),track:track.value,trackWidth:track.width,at,key,
    duration:duration?value(duration):info.duration};
   this.frames.push(frame);this.bytes+=frame.data.length;
   this.end=Math.max(this.end,at+frame.duration);
  }
  prune(){
   const cutoff=this.end-this.seconds*1000000000/this.scale;
   let anchor=null;
   for(const f of this.frames)if(f.key&&f.at<=cutoff)anchor=f.at;
   if(anchor!==null)this.dropBefore(anchor);
   // Browsers may ignore the keyframe-interval hint. Never retain an unbounded
   // GOP just to keep its initial keyframe; wait for a fresh one instead.
   const oldest=this.frames.find(f=>f.key);
   if(oldest&&oldest.at<this.end-(this.seconds+5)*1e9/this.scale){
    this.limited=true;
    const newer=this.frames.find(f=>f.key&&f.at>=cutoff);
    if(newer)this.dropBefore(newer.at);else{this.frames=[];this.bytes=0;}
   }
   while(this.bytes>this.maxBytes){
    this.limited=true;
    const first=this.frames.find(f=>f.key),next=this.frames.find(f=>f.key&&f!==first&&f.at>first.at);
    if(next)this.dropBefore(next.at);
    else{this.frames=[];this.bytes=0;break;}
   }
   // A memory reset may leave only interframes until the next keyframe arrives.
   const firstKey=this.frames.find(f=>f.key);
   if(firstKey)this.dropBefore(firstKey.at);
   else{this.frames=[];this.bytes=0;}
  }
  dropBefore(at){
   this.frames=this.frames.filter(frame=>{if(frame.at>=at)return true;this.bytes-=frame.data.length;return false});
  }
  status(){
   const first=this.frames.find(f=>f.key);
   return {bufferedSeconds:first?Math.max(0,(this.end-first.at)*this.scale/1e9):0,
    bytes:this.bytes+this.pending.length,limited:this.limited};
  }
  snapshot(seconds=this.seconds){
   if(!this.header||!this.tracks||this.videoTrack===null)throw Error('Replay is warming up. Try again in a moment.');
   const keys=this.frames.filter(f=>f.key),cutoff=this.end-seconds*1e9/this.scale;
   const start=[...keys].reverse().find(f=>f.at<=cutoff)||keys[0];
   if(!start)throw Error('Waiting for a video keyframe. Try again in a moment.');
   const frames=this.frames.filter(f=>f.at>=start.at);
   const duration=(this.end-start.at)*this.scale/1e9;
   if(duration<0.25)throw Error('Replay is warming up. Try again in a moment.');
   const info=element(ID.INFO,[number(ID.SCALE,this.scale),floating(ID.DURATION,this.end-start.at),
    string(0x4d80,'Lolite Replay'),string(0x5741,'Lolite Replay')]);
   const clusters=[],cues=[];let parts=[],clusterAt=0,hasKey=false;
   const flush=()=>{if(!parts.length)return;clusters.push(element(ID.CLUSTER,[number(ID.TIME,clusterAt),...parts]));
    cues.push(hasKey?clusterAt:null);parts=[];hasKey=false;};
   for(const frame of frames){
    const at=Math.round(frame.at-start.at);
    if(parts.length&&(frame.key||at-clusterAt>2000*1e6/this.scale||Math.abs(at-clusterAt)>32767))flush();
    if(!parts.length)clusterAt=Math.max(0,at);
    const rewrite=block=>{const out=block.slice(),relative=at-clusterAt;
     out[frame.trackWidth]=(relative>>8)&255;out[frame.trackWidth+1]=relative&255;return out;};
    const data=frame.kind===ID.SIMPLE?rewrite(frame.data):join(children(frame.data)
     .filter(c=>c.id!==0xbf).map(c=>element(c.id,c.id===ID.BLOCK?rewrite(c.data):c.data)));
    parts.push(element(frame.kind,data));hasKey=hasKey||frame.key;
   }
   flush();
   const seek=(infoAt,tracksAt,cuesAt)=>element(0x114d9b74,[[ID.INFO,infoAt],[ID.TRACKS,tracksAt],[0x1c53bb6b,cuesAt]]
    .map(([id,at])=>element(0x4dbb,[element(0x53ab,uint(id)),number(0x53ac,at,8)])));
   const headLength=seek(0,0,0).length,infoAt=headLength,tracksAt=infoAt+info.length;
   let offset=tracksAt+this.tracks.length;const points=[];
   clusters.forEach((cluster,index)=>{
    if(cues[index]!==null)points.push(element(0xbb,[number(0xb3,cues[index]),element(0xb7,
     [number(0xf7,this.videoTrack),number(0xf1,offset)])]));
    offset+=cluster.length;
   });
   const index=element(0x1c53bb6b,points),seekHead=seek(infoAt,tracksAt,offset);
   const length=offset+index.length;
   return {blob:new Blob([this.header,uint(ID.SEGMENT),size(length),seekHead,info,this.tracks,...clusters,index],
    {type:'video/webm'}),duration,limited:this.limited};
  }
 }
 global.LoliteReplayBuffer=ReplayBuffer;
})(typeof window==='undefined'?globalThis:window);
