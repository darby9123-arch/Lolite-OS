const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const join=parts=>Buffer.concat(parts.map(p=>Buffer.from(p)));
const uint=n=>{const out=[];do{out.unshift(n%256);n=Math.floor(n/256)}while(n);return Buffer.from(out)};
const size=n=>{let width=1;while(n>=2**(7*width)-1)width++;const b=Buffer.alloc(width);
 for(let i=width-1;i>=0;i--){b[i]=n%256;n=Math.floor(n/256)}b[0]|=1<<(8-width);return b};
const element=(id,...parts)=>{const data=join(parts);return join([uint(id),size(data.length),data])};
const num=(id,n)=>element(id,uint(n));
const ascii=(id,s)=>element(id,Buffer.from(s));
function init(){return join([
 element(0x1a45dfa3,num(0x4286,1),num(0x42f7,1),num(0x42f2,4),num(0x42f3,8),ascii(0x4282,'webm'),num(0x4287,4),num(0x4285,2)),
 uint(0x18538067),Buffer.from([1,255,255,255,255,255,255,255]),
 element(0x1549a966,num(0x2ad7b1,1000000)),
 element(0x1654ae6b,element(0xae,num(0xd7,1),num(0x73c5,1),num(0x83,1),ascii(0x86,'V_VP8'),num(0x23e383,100000000),
  element(0xe0,num(0xb0,160),num(0xba,90))))
])}
function cluster(at,{seconds=1,unknown=false,group=false,payloadBytes=20,keyframe=true}={}){
 const blocks=[];
 for(let ms=0;ms<seconds*1000;ms+=100){
  const payload=Buffer.alloc(payloadBytes+4,7);payload[0]=129;payload.writeInt16BE(ms,1);payload[3]=ms===0&&keyframe?128:0;
  blocks.push(group?element(0xa0,element(0xa1,payload),...(ms?[num(0xfb,100)]:[])):element(0xa3,payload));
 }
 const payload=join([num(0xe7,at),...blocks]);
 return unknown?join([uint(0x1f43b675),Buffer.from([255]),payload]):element(0x1f43b675,payload);
}
function load(extra={}){
 const scope={Blob,TextEncoder,Uint8Array,DataView,console,setTimeout,clearTimeout,...extra};
 vm.createContext(scope);
 for(const file of ['core/clip-replay-buffer.js','core/clip-replay.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../..',file),'utf8'),scope);
 return scope;
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function recorderHarness({supported=true,deferred=false}={}){
 let captures=0,resolveCapture,lastRecorder;const updates=[],errors=[],stops=[];
 const handlers={};const track={readyState:'live',stop(){this.readyState='ended'},addEventListener(name,fn){handlers[name]=fn}};
 const stream={getTracks:()=>[track],getVideoTracks:()=>[track]};
 class Recorder{
  static isTypeSupported(){return supported}
  constructor(stream,options){this.stream=stream;this.options=options;this.state='inactive';this.listeners={};lastRecorder=this;}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
  emit(name,event={}){for(const fn of this.listeners[name]||[])fn(event)}
  start(){this.state='recording'}
  stop(){this.state='inactive';this.emit('stop')}
  requestData(){this.requests=(this.requests||0)+1}
  data(bytes){this.emit('dataavailable',{data:new Blob([bytes],{type:'video/webm'})})}
 }
 const scope=load({MediaRecorder:Recorder,navigator:{mediaDevices:{getDisplayMedia(){captures++;
  return deferred?new Promise(resolve=>{resolveCapture=resolve}):Promise.resolve(stream)}}}});
 const replay=new scope.LoliteReplayRecorder({onUpdate:s=>updates.push(s),onError:m=>errors.push(m),onStop:m=>stops.push(m)});
 return {replay,scope,updates,errors,stops,track,get captures(){return captures},get recorder(){return lastRecorder},
  grant:()=>resolveCapture(stream),end:()=>{track.readyState='ended';handlers.ended()},tick};
}
module.exports={init,cluster,load,tick,join,recorderHarness};
