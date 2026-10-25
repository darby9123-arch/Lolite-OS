/* Original, locally synthesised UI sounds. One gesture-unlocked context; no audio downloads. */
(()=>{'use strict';
 const read=(k,d)=>{try{return localStorage.getItem(k)??d}catch{return d}},save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let enabled=read('loliteSounds','true')!=='false',volume=Math.max(0,Math.min(1,Number(read('loliteSoundVolume','0.22'))||0));
 const groups=[
  ['windows','Windows','Open, close, minimise, restore, snap, move and resize.',true],
  ['controls','Menus & controls','Start, panels, buttons, switches, tabs and selections.',true],
  ['files','Files & tools','Create, save, rename, copy, import, export and Trash.',true],
  ['notifications','Notifications','Messages, confirmations and errors.',true],
  ['personalisation','Personalisation','Wallpapers, themes, workspace style and fullscreen.',true],
  ['typing','Typing','Soft key taps in Lolite text fields. Password fields stay silent.',false],
  ['hover','Hover','A subtle tick when moving onto a button.',false]
 ].map(([id,name,description,on])=>({id,name,description,enabled:read('loliteSoundGroup:'+id,String(on))!=='false'}));
 const sounds={
  startup:['Welcome','windows',[[330,0,.19],[440,.09,.19],[660,.19,.32]]],
  open:['Open an app','windows',[[520,0,.08],[780,.04,.11]]],
  close:['Close an app','windows',[[440,0,.09],[330,.03,.1]]],
  minimise:['Minimise','windows',[[460,0,.07],[350,.03,.08]]],
  restore:['Restore','windows',[[450,0,.08],[600,.04,.1]]],
  maximise:['Maximise','windows',[[480,0,.09],[720,.06,.13]]],
  snap:['Snap a window','windows',[[560,0,.055],[840,.055,.075]]],
  focus:['Switch windows','windows',[[410,0,.045]]],
  move:['Place a window','windows',[[310,0,.06],[420,.025,.06]]],
  resize:['Resize a window','windows',[[370,0,.045],[490,.035,.05]]],
  menuOpen:['Open a menu','controls',[[540,0,.055],[680,.035,.07]]],
  menuClose:['Close a menu','controls',[[500,0,.06],[410,.025,.05]]],
  click:['Button click','controls',[[740,0,.035]]],
  select:['Selection','controls',[[630,0,.055]]],
  navigate:['Navigate','controls',[[520,0,.045],[620,.04,.06]]],
  toggleOn:['Switch on','controls',[[460,0,.06],[690,.045,.08]]],
  toggleOff:['Switch off','controls',[[650,0,.06],[430,.045,.08]]],
  slider:['Adjust volume','controls',[[590,0,.06]]],
  create:['Create a file','files',[[530,0,.06],[800,.05,.09]]],
  save:['Save','files',[[600,0,.06],[750,.07,.11]]],
  rename:['Rename','files',[[570,0,.07],[640,.06,.07]]],
  copy:['Copy or cut','files',[[640,0,.045],[640,.065,.045]]],
  paste:['Paste','files',[[510,0,.07],[720,.05,.08]]],
  trash:['Move to Trash','files',[[380,0,.09],[240,.06,.11]]],
  recover:['Restore a file','files',[[400,0,.06],[600,.055,.09],[760,.11,.1]]],
  download:['Export or download','files',[[880,0,.07],[660,.065,.07],[520,.13,.11]]],
  complete:['Import complete','files',[[520,0,.07],[660,.06,.08],[830,.12,.13]]],
  calculate:['Calculation result','files',[[660,0,.05],[990,.055,.09]]],
  notification:['Notification','notifications',[[740,0,.13],[990,.12,.19]]],
  error:['Error','notifications',[[290,0,.1],[265,.13,.13]]],
  wallpaper:['Change wallpaper','personalisation',[[440,0,.09],[550,.06,.1],[660,.13,.16]]],
  theme:['Change theme','personalisation',[[520,0,.08],[780,.08,.16]]],
  fullscreen:['Fullscreen','personalisation',[[440,0,.07],[880,.08,.12]]],
  type:['Key tap','typing',[[420,0,.022]]],
  erase:['Backspace','typing',[[320,0,.027]]],
  hover:['Hover tick','hover',[[810,0,.018]]]
 };
 let context=null,master=null,unlocked=false,last=-Infinity,played=0,started=false,activeWindow=null,resuming=null,pending=null,pendingTimer=0,lastName='',startupWaiting=false;
 const voices=new Set();
 const allowed=name=>enabled&&volume>0&&sounds[name]&&groups.find(g=>g.id===sounds[name][1])?.enabled;
 function unlock(){
  if(!enabled)return Promise.resolve(false);
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return Promise.resolve(false);
   if(!context){context=new Audio();master=context.createGain();master.gain.value=volume;master.connect(context.destination)}
   unlocked=true;
   if(context.state==='suspended'&&!resuming)resuming=Promise.resolve(context.resume()).catch(()=>{}).finally(()=>{resuming=null});
   return resuming||Promise.resolve(true);
  }catch{return Promise.resolve(false)}
 }
 function silence(){
  pending=null;clearTimeout(pendingTimer);pendingTimer=0;
  for(const voice of voices){try{voice.osc.stop();voice.osc.disconnect();voice.gain.disconnect()}catch{}}
  voices.clear();
 }
 function play(name,preview=false){
  if(!enabled||!volume||!sounds[name]||(!preview&&!allowed(name)))return false;
  if(preview)unlock();
  if(!unlocked||!context||context.state!=='running'||document.hidden)return false;
  const now=performance.now(),quiet=['type','erase','hover','focus','click'].includes(name);
  if(!preview&&now-last<(quiet?65:40))return false;
  const score=sounds[name][2];if(voices.size+score.length>12)return false;
  last=now;lastName=name;
  for(const [hz,offset,length] of score){
   const osc=context.createOscillator(),gain=context.createGain(),start=context.currentTime+offset,voice={osc,gain};
   osc.type='sine';osc.frequency.value=hz;
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(quiet?.055:.16,start+.006);gain.gain.exponentialRampToValueAtTime(.001,start+length);
   osc.connect(gain);gain.connect(master);voices.add(voice);osc.onended=()=>{osc.disconnect();gain.disconnect();voices.delete(voice)};osc.start(start);osc.stop(start+length+.02);
  }
  played++;return true;
 }
 // Coalesce feedback from one action: its specific result wins over a generic button click.
 function request(name,priority=2){
  if(!allowed(name)||document.hidden)return;
  if(!pending||priority>=pending.priority)pending={name,priority};
  if(!pendingTimer)pendingTimer=setTimeout(()=>{pendingTimer=0;const next=pending;pending=null;if(next)play(next.name)},36);
 }
 function gesture(e){if(e.isTrusted)unlock().then(()=>{if(startupWaiting){startupWaiting=false;request('startup',8)}})}
 document.addEventListener('pointerdown',gesture,{capture:true,passive:true});document.addEventListener('keydown',gesture,{capture:true});
 addEventListener('lolite:windowchange',e=>{
  const {type,id,kind}=e.detail||{};
  if(type==='focus'){if(id&&activeWindow&&activeWindow!==id)request('focus',1);activeWindow=id;return}
  request(type==='layout'?(kind==='max'?'maximise':kind?'snap':'restore'):type,5);
 });
 addEventListener('lolite:panelchange',e=>request(e.detail?.open?'menuOpen':'menuClose',3));
 addEventListener('lolite:uieffect',e=>request(e.detail?.sound,6));
 addEventListener('lolite:wallpaperchange',()=>request('wallpaper',6));
 for(const event of ['lolite:desktopthemechange','lolite:browserthemechange'])addEventListener(event,()=>request('theme',6));
 addEventListener('lolite:browsingnavigate',()=>request('navigate',4));
 addEventListener('lolite:modechange',e=>{if(e.detail?.mode==='chooser')return;if(!started){started=true;if(unlocked)request('startup',8);else startupWaiting=true}else request('theme',6)});
 const toast=window.toast;if(typeof toast==='function')window.toast=function(...args){const result=toast.apply(this,args);request(/fail|error|could not|unable|invalid|cannot|too large/i.test(String(args[0]))?'error':'notification',4);return result};
 document.addEventListener('click',e=>{
  const el=e.target.closest?.('button,a[href],summary,[role="button"],[role="option"],.desktop-icon');
  if(!el||el.disabled||el.getAttribute('aria-disabled')==='true'||el.closest('.titlebar .controls')||el.matches('[data-cr-sound],[data-cr-sound-group],[data-cr-sounds]'))return;
  if(el.matches('[data-cr-tab],[data-wall-filter],[data-cr-theme-mode],[data-tab],[data-path],[data-calendar-step]'))request('navigate',2);
  else if(el.matches('[role="option"],.desktop-icon'))request('select',1);
  else if(el.matches('a[download]'))request('download',4);
  else request('click',0);
 },true);
 document.addEventListener('change',e=>{
  const el=e.target;
  if(el.matches?.('input[type="checkbox"],input[type="radio"]'))request(el.checked?'toggleOn':'toggleOff',2);
  else if(el.matches?.('select'))request('select',2);
  else if(el.matches?.('[data-cr-volume],[data-shell-volume]'))request('slider',3);
 });
 document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing||!e.target.matches?.('input:not([type="password"]):not([type="range"]),textarea,[contenteditable="true"]'))return;
  if(e.key.length===1||e.key==='Enter')request('type',0);else if(e.key==='Backspace'||e.key==='Delete')request('erase',0);
 });
 document.addEventListener('pointerover',e=>{const el=e.target.closest?.('button,a[href],[role="button"]');if(el&&!el.disabled&&!el.contains(e.relatedTarget))request('hover',0)},{passive:true});
 document.addEventListener('fullscreenchange',()=>request('fullscreen',4));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)silence()});
 window.LoliteSounds={
  play,request,unlock,
  preview:async name=>{await unlock();silence();return play(name,true)},
  catalog:()=>Object.entries(sounds).map(([id,[name,group]])=>({id,name,group})),
  groups:()=>groups.map(g=>({...g})),
  setGroup:(id,value)=>{const group=groups.find(g=>g.id===id);if(!group)return;group.enabled=!!value;save('loliteSoundGroup:'+id,String(group.enabled));if(!group.enabled)silence()},
  setEnabled:value=>{enabled=!!value;save('loliteSounds',String(enabled));if(enabled)unlock();else silence();if(master)master.gain.setValueAtTime(enabled?volume:0,context.currentTime)},
  setVolume:value=>{volume=Math.min(1,Math.max(0,Number(value)||0));save('loliteSoundVolume',String(volume));if(!volume)silence();if(master)master.gain.setValueAtTime(enabled?volume:0,context.currentTime)},
  state:()=>({enabled,volume,unlocked,contextState:context?.state||'locked',played,lastName,activeVoices:voices.size})
 };
})();
