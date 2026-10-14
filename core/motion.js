/* Lolite OS Motion — responsive Windows-inspired animations.
   Uses composited transforms and opacity. No perpetual observers/animation loops. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const reduced=()=>root.classList.contains('reduce')||root.classList.contains('reduce-motion')||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const moving=new WeakMap();
 function animate(el,frames,options){
  if(!el||!el.isConnected||reduced()||!el.animate)return null;
  moving.get(el)?.cancel();
  const animation=el.animate(frames,{duration:200,easing:'cubic-bezier(.2,.8,.2,1)',fill:'none',...options});
  moving.set(el,animation);
  const finish=()=>{if(moving.get(el)===animation)moving.delete(el)};
  animation.addEventListener('finish',finish,{once:true});
  animation.addEventListener('cancel',finish,{once:true});
  return animation;
 }
 const viewport=()=>({width:innerWidth,height:innerHeight});
 const openFrames=[{opacity:0,transform:'translate3d(0,12px,0) scale(.975)'},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}];
 const revealFrames=[{opacity:.35,transform:'translate3d(0,8px,0) scale(.98)'},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}];
 // Wrap stable OS actions once, without changing application IDs or handlers.
 const oldOpen=window.openApp;
 if(typeof oldOpen==='function'){
  window.openApp=function(...args){
   const id=args[0],old=document.querySelectorAll('#windows .window');
   const result=oldOpen.apply(this,args);
   const active=document.querySelector('#windows .window[data-window-id="'+CSS.escape(String(id))+'"]');
   if(active&&!Array.from(old).includes(active))animate(active,openFrames,{duration:235});
   return result;
  };
 }
 const oldClose=window.closeWin;
 if(typeof oldClose==='function'){
  const closing=new WeakSet();
  window.closeWin=function(id){
   const el=document.querySelector('#windows .window[data-window-id="'+CSS.escape(String(id))+'"]');
   if(!el||reduced()||closing.has(el))return el&&closing.has(el)?undefined:oldClose.call(this,id);
   closing.add(el);
   const motion=animate(el,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translate3d(0,9px,0) scale(.972)'}],{duration:145,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
   if(motion){
    const finish=()=>{if(el.isConnected)oldClose.call(window,id)};
    motion.addEventListener('finish',finish,{once:true});
    motion.addEventListener('cancel',finish,{once:true});
   }else oldClose.call(this,id);
  };
 }
 const oldMin=window.minWin;
 if(typeof oldMin==='function'){
  window.minWin=function(id){
   const el=document.querySelector('#windows .window[data-window-id="'+CSS.escape(String(id))+'"]');
   if(!el||reduced())return oldMin.call(this,id);
   const motion=animate(el,[{opacity:1,transform:'translate3d(0,0,0) scale(1)'},{opacity:0,transform:'translate3d(0,22px,0) scale(.94)'}],{duration:170,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
   if(!motion)return oldMin.call(this,id);
   motion.addEventListener('finish',()=>{if(el.isConnected)oldMin.call(window,id)},{once:true});
  };
 }
 const oldRestore=window.restoreWin;
 if(typeof oldRestore==='function'){
  window.restoreWin=function(id){
   const el=document.querySelector('#windows .window[data-window-id="'+CSS.escape(String(id))+'"]');
   const hidden=el?.style.display==='none';
   const result=oldRestore.call(this,id);
   if(el&&hidden)animate(el,revealFrames,{duration:195});
   return result;
  };
 }
 const oldMax=window.maxWin;
 if(typeof oldMax==='function'){
  window.maxWin=function(id){
   const el=document.querySelector('#windows .window[data-window-id="'+CSS.escape(String(id))+'"]');
   if(!el||reduced())return oldMax.call(this,id);
   const a=el.getBoundingClientRect();
   const result=oldMax.call(this,id);
   const b=el.getBoundingClientRect();
   if(!a.width||!a.height||!b.width||!b.height)return result;
   const sx=Math.max(.1,a.width/b.width),sy=Math.max(.1,a.height/b.height);
   animate(el,[{transform:'translate3d('+(a.left-b.left)+'px,'+(a.top-b.top)+'px,0) scale('+sx+','+sy+')'},{transform:'translate3d(0,0,0) scale(1,1)'}],{duration:265,easing:'cubic-bezier(.18,.8,.2,1)'});
   return result;
  };
 }
 // Menu reveals: observe only the two existing panels and only their class changes.
 // No body/document subtree observer; no class writes from these callbacks.
 function wirePanel(id){
  const panel=document.getElementById(id);
  if(!panel)return;
  let wasOpen=!panel.classList.contains('hidden');
  new MutationObserver(()=>{
   const open=!panel.classList.contains('hidden');
   if(open&&!wasOpen){
    animate(panel,[{opacity:0,transform:id==='start'?'translate3d(0,10px,0) scale(.98)':'translate3d(-50%,10px,0) scale(.98)'},{opacity:1,transform:id==='start'?'translate3d(0,0,0) scale(1)':'translate3d(-50%,0,0) scale(1)'}],{duration:175});
   }
   wasOpen=open;
  }).observe(panel,{attributes:true,attributeFilter:['class']});
 }
 wirePanel('start');wirePanel('searchPanel');
 // Opening feedback remains light and instant even on slower machines.
 document.addEventListener('pointerdown',event=>{
  const btn=event.target.closest?.('#icons .desktop-icon, #start .start-list button, #taskbar .task, #taskbar .taskwin, .lm-app-icon');
  if(!btn||reduced())return;
  animate(btn,[{transform:'scale(1)'},{transform:'scale(.965)'},{transform:'scale(1)'}],{duration:165,easing:'ease-out'});
 },{passive:true});
 window.LoliteMotion={reduced,animate};
})();
