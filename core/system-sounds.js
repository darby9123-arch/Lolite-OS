/* Original synthesized UI tones. One AudioContext, gesture unlock, no remote audio or autoplay. */
(()=>{'use strict';
 const read=(k,d)=>{try{return localStorage.getItem(k)??d}catch{return d}},save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let enabled=read('loliteSounds','true')!=='false',volume=Math.max(0,Math.min(1,Number(read('loliteSoundVolume','0.22'))||0));
 let context=null,master=null,unlocked=false,last=0,played=0,started=false;
 const tones={startup:[[330,0,.19],[440,.09,.19],[660,.19,.32]],open:[[520,0,.08],[780,.04,.11]],close:[[440,0,.09],[330,.03,.1]],minimise:[[460,0,.07],[350,.03,.08]],restore:[[450,0,.08],[600,.04,.1]],notification:[[740,0,.13],[990,.12,.19]],select:[[630,0,.055]]};
 function unlock(){if(!enabled)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!context){context=new Audio();master=context.createGain();master.gain.value=volume;master.connect(context.destination)}if(context.state==='suspended')context.resume().catch(()=>{});unlocked=true}catch{}}
 function play(name,preview=false){
  if(!enabled||!volume)return false;if(preview)unlock();if(!unlocked||!context||context.state!=='running'||document.hidden)return false;
  const now=performance.now();if(!preview&&now-last<90)return false;last=now;
  const score=tones[name];if(!score)return false;
  for(const [hz,offset,length] of score){const osc=context.createOscillator(),gain=context.createGain(),start=context.currentTime+offset;osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.16,start+.008);gain.gain.exponentialRampToValueAtTime(.001,start+length);osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+length+.02);osc.onended=()=>{osc.disconnect();gain.disconnect()}}
  played++;return true;
 }
 function gesture(e){if(e.isTrusted)unlock()}
 document.addEventListener('pointerdown',gesture,{capture:true,passive:true});document.addEventListener('keydown',gesture,{capture:true});
 const wraps={openApp:'open',closeWin:'close',minWin:'minimise',restoreWin:'restore',toast:'notification'};
 for(const [fn,sound] of Object.entries(wraps)){const old=window[fn];if(typeof old!=='function')continue;window[fn]=function(...args){const result=old.apply(this,args);play(sound);return result}}
 addEventListener('lolite:modechange',e=>{if(e.detail?.mode!=='chooser'&&!started){started=true;play('startup')}});
 addEventListener('lolite:wallpaperchange',()=>play('select'));
 window.LoliteSounds={play,unlock,setEnabled:value=>{enabled=!!value;save('loliteSounds',String(enabled));if(enabled)unlock();if(master)master.gain.setValueAtTime(enabled?volume:0,context.currentTime)},setVolume:value=>{volume=Math.min(1,Math.max(0,Number(value)||0));save('loliteSoundVolume',String(volume));if(master)master.gain.setValueAtTime(enabled?volume:0,context.currentTime)},state:()=>({enabled,volume,unlocked,contextState:context?.state||'locked',played})};
})();
