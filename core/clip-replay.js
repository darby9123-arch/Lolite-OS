/* Permissioned instant replay. One recorder, bounded memory, private snapshots. */
((global)=>{'use strict';
 class ReplayRecorder{
  static mimeType(){
   if(typeof MediaRecorder==='undefined'||!navigator.mediaDevices?.getDisplayMedia)return '';
   return ['video/webm;codecs=vp8,opus','video/webm;codecs=vp8','video/webm'].find(type=>
    !MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(type))||'';
  }
  constructor({seconds=30,bitrate=1500000,onUpdate=()=>{},onError=()=>{},onStop=()=>{}}={}){
   this.seconds=seconds===60?60:30;this.bitrate=bitrate;this.onUpdate=onUpdate;
   this.onError=onError;this.onStop=onStop;this.phase='off';this.generation=0;
   this.buffer=null;this.stream=null;this.recorder=null;this.queue=Promise.resolve();
   this.queuedBytes=0;this.pendingSave=null;
  }
  status(){return {phase:this.phase,active:this.phase==='buffering',requesting:this.phase==='requesting',
   saving:!!this.pendingSave,seconds:this.seconds,...(this.buffer?.status()||{bufferedSeconds:0,bytes:0,limited:false})};}
  update(){this.onUpdate(this.status());}
  fail(message){this.stop();this.onError(message);}
  async start(){
   if(this.phase!=='off')return false;
   const mimeType=ReplayRecorder.mimeType();
   if(!mimeType||!global.LoliteReplayBuffer){this.onError('Instant replay needs screen capture and WebM recording support. You can still use regular recording.');return false;}
   const token=++this.generation;this.phase='requesting';this.update();
   try{
    // This call stays in the button's user gesture. Nothing resumes after reload.
    const stream=await navigator.mediaDevices.getDisplayMedia({
     video:{frameRate:30,width:{ideal:1920},height:{ideal:1080}},audio:true,
     preferCurrentTab:true,selfBrowserSurface:'include'
    });
    if(token!==this.generation){for(const t of stream.getTracks())t.stop();return false;}
    this.stream=stream;
    const video=stream.getVideoTracks()[0];
    if(!video||video.readyState!=='live')throw Error('Choose a game tab or screen with video.');
    this.buffer=new global.LoliteReplayBuffer({seconds:this.seconds});
    const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:this.bitrate,
     audioBitsPerSecond:96000,videoKeyFrameIntervalDuration:1000});
    this.recorder=recorder;this.queue=Promise.resolve();this.queuedBytes=0;
    recorder.addEventListener('dataavailable',event=>{
     if(token!==this.generation)return;
     const save=this.pendingSave&&!this.pendingSave.captured?this.pendingSave:null;
     if(save)save.captured=true;
     const length=event.data?.size||0;this.queuedBytes+=length;
     if(this.queuedBytes>16*1024*1024){this.fail('Replay could not keep up with capture. Try Compact quality.');return;}
     // Blob reads must remain in emission order, even when a read is delayed.
     this.queue=this.queue.then(async()=>{
      try{
       const bytes=length?await event.data.arrayBuffer():null;
       if(token!==this.generation)return;
       this.queuedBytes-=length;
       if(bytes)this.buffer.push(bytes);
       if(save&&this.pendingSave===save){
        this.pendingSave=null;clearTimeout(save.timer);
        try{save.resolve(this.buffer.snapshot(this.seconds));}catch(error){save.reject(error);}
       }
       this.update();
      }catch(error){if(token===this.generation)this.fail('Replay stopped: '+(error?.message||error));}
     });
    });
    recorder.addEventListener('error',event=>{if(token===this.generation)this.fail(event.error?.message||'Replay recording failed.');});
    recorder.addEventListener('stop',()=>{if(token===this.generation){this.stop();this.onStop('Replay capture ended. Its temporary buffer was cleared.');}});
    video.addEventListener('ended',()=>{if(token===this.generation){this.stop();this.onStop('Screen sharing ended. Instant replay is off.');}},{once:true});
    recorder.start(1000);this.phase='buffering';this.update();return true;
   }catch(error){
    if(token!==this.generation)return false;
    this.stop();this.onError(error?.name==='NotAllowedError'?'Capture cancelled. Instant replay is off.':
     'Cannot enable instant replay: '+(error?.message||error));return false;
   }
  }
  save(){
   if(this.phase!=='buffering'||!this.recorder||this.recorder.state!=='recording')return Promise.reject(Error('Enable instant replay first.'));
   if(this.pendingSave)return Promise.reject(Error('A replay is already being saved.'));
   return new Promise((resolve,reject)=>{
    const request={resolve,reject,captured:false,timer:null};this.pendingSave=request;
    request.timer=setTimeout(()=>{
     if(this.pendingSave!==request)return;
     this.pendingSave=null;reject(Error('Capture did not respond. Try saving again.'));this.update();
    },10000);
    try{this.recorder.requestData();this.update();}
    catch(error){clearTimeout(request.timer);this.pendingSave=null;reject(error);this.update();}
   });
  }
  stop(){
   ++this.generation;
   if(this.pendingSave){clearTimeout(this.pendingSave.timer);this.pendingSave.reject(Error('Replay stopped before the moment could be saved.'));this.pendingSave=null;}
   const recorder=this.recorder,stream=this.stream;
   this.recorder=null;this.stream=null;this.phase='off';this.queuedBytes=0;
   try{if(recorder&&recorder.state!=='inactive')recorder.stop();}catch(_){/* Already ended. */}
   if(stream)for(const track of stream.getTracks())track.stop();
   this.buffer?.clear();this.buffer=null;this.update();
  }
 }
 global.LoliteReplayRecorder=ReplayRecorder;
})(typeof window==='undefined'?globalThis:window);
