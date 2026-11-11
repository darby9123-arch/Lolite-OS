'use strict';
const net=require('node:net');
const path=require('node:path');
const crypto=require('node:crypto');
const validId=id=>typeof id==='string'&&/^\d{17,20}$/.test(id);
function packet(op,data){const body=Buffer.from(JSON.stringify(data));const header=Buffer.alloc(8);header.writeUInt32LE(op,0);header.writeUInt32LE(body.length,4);return Buffer.concat([header,body]);}
function sanitize(value){
 if(value===null)return null;
 if(!value||typeof value!=='object'||!['online','playing','chatting','settings','browsing','idle','offline'].includes(value.kind))throw Error('Invalid Discord activity.');
 if(['idle','offline'].includes(value.kind))return null;
 const title=typeof value.title==='string'?value.title.replace(/[\x00-\x1f\x7f]/g,'').slice(0,100):'';
 const start=Number(value.startedAt);
 return {type:0,details:value.kind==='playing'?'Playing '+(title||'a game'):({chatting:'Chatting on Lolite',settings:'Changing settings',browsing:'Browsing the game library',online:'On Lolite'})[value.kind],state:'Lolite OS',...(Number.isFinite(start)&&start>0&&start<=Date.now()+60000?{timestamps:{start:Math.floor(start/1000)}}:{}),instance:false};
}
class DiscordPresence{
 constructor({clientId='',connect=options=>net.createConnection(options),platform=process.platform,env=process.env,interval=15000}={}){
  this.clientId=validId(clientId)?clientId:'';this.connect=connect;this.platform=platform;this.env=env;this.desired=null;this.socket=null;this.ready=false;this.connecting=false;this.message=this.clientId?'Open desktop Discord to connect.':'Discord setup needs a Lolite application ID.';this.lastSent=0;this.lastPayload='';this.interval=interval;
  this.timer=setInterval(()=>this.tick(),interval);this.timer.unref?.();
 }
 status(){return {configured:!!this.clientId,connected:this.ready,message:this.message};}
 configure(id){if(!validId(id))throw Error('Enter a valid Discord application ID (17–20 digits).');this.disconnect();this.clientId=id;this.message='Connecting to desktop Discord…';this.tick();return this.status();}
 update(value){const next=sanitize(value);this.desired=next;if(next===null){this.send(true);this.message=this.ready?'Discord activity is hidden.':this.message;}else this.tick();return this.status();}
 endpoint(i){if(this.platform==='win32')return '\\\\?\\pipe\\discord-ipc-'+i;const base=this.env.XDG_RUNTIME_DIR||this.env.TMPDIR||this.env.TMP||this.env.TEMP||'/tmp';return path.join(base,'discord-ipc-'+i);}
 tick(){if(!this.clientId||!this.desired)return;if(this.ready){this.send();return;}if(!this.connecting)this.open(0);}
 open(i){
  if(i>=10||!this.clientId||!this.desired){this.connecting=false;this.message='Desktop Discord is not connected. Open Discord; Lolite will retry.';return;}
  this.connecting=true;const socket=this.connect({path:this.endpoint(i)});this.socket=socket;let buffer=Buffer.alloc(0),settled=false;
  const timer=setTimeout(()=>socket.destroy(),3000);timer.unref?.();
  const fail=()=>{clearTimeout(timer);if(settled)return;settled=true;if(this.socket!==socket)return;this.socket=null;this.ready=false;this.connecting=false;if(this.desired&&i<9)this.open(i+1);else this.message='Desktop Discord is not connected. Open Discord; Lolite will retry.';};
  socket.on('error',()=>socket.destroy());socket.on('close',fail);
  socket.on('connect',()=>socket.write(packet(0,{v:1,client_id:this.clientId})));
  socket.on('data',chunk=>{
   buffer=Buffer.concat([buffer,chunk]);if(buffer.length>262144){socket.destroy();return;}
   while(buffer.length>=8){const op=buffer.readUInt32LE(0),length=buffer.readUInt32LE(4);if(length>65536){socket.destroy();return;}if(buffer.length<length+8)return;
    const raw=buffer.subarray(8,8+length);buffer=buffer.subarray(8+length);let value;try{value=JSON.parse(raw.toString());}catch{socket.destroy();return;}
    if(op===3){socket.write(packet(4,value));continue;}if(op===2){socket.destroy();return;}
    if(op!==1)continue;
    if(value.evt==='READY'){clearTimeout(timer);this.ready=true;this.connecting=false;this.lastSent=0;this.lastPayload='';this.message='Connected to Discord.';this.send(true);}
    else if(value.evt==='ERROR'){this.message='Discord rejected the activity. Check the application ID and Discord activity settings.';}
    else if(value.cmd==='SET_ACTIVITY')this.message=this.desired?'Sharing your activity with Discord.':'Discord activity is hidden.';
   }
  });
 }
 send(force=false){if(!this.ready||!this.socket)return;const payload=JSON.stringify(this.desired);if(!force&&(payload===this.lastPayload||Date.now()-this.lastSent<this.interval))return;this.lastSent=Date.now();this.lastPayload=payload;this.socket.write(packet(1,{cmd:'SET_ACTIVITY',args:{pid:process.pid,activity:this.desired},nonce:crypto.randomUUID()}));}
 disconnect(){const socket=this.socket;if(socket){if(this.ready)socket.end(packet(1,{cmd:'SET_ACTIVITY',args:{pid:process.pid,activity:null},nonce:crypto.randomUUID()}));else socket.destroy();}this.socket=null;this.ready=false;this.connecting=false;}
 close(){clearInterval(this.timer);this.desired=null;this.disconnect();}
}
module.exports={DiscordPresence,sanitize,packet,validId};
