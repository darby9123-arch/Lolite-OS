/* Interruptible desktop motion. Reduced motion always takes priority. */
(()=>{'use strict';
 const root=document.documentElement,active=new Map(),media=matchMedia('(prefers-reduced-motion: reduce)');
 const motionModes=['smooth','snappy','off'];
 const storageKey='loliteMotionMode';
 const read=()=>{try{const v=localStorage.getItem(storageKey);return motionModes.includes(v)?v:'smooth'}catch{return 'smooth'}};
 let mode=read();
 const reduced=()=>mode==='off'||media.matches||['reduce','reduce-motion','no-animations'].some(c=>root.classList.contains(c));
 function applyMode(){root.dataset.loliteMotion=mode;if(reduced())settle()}
 function setMode(value){if(!motionModes.includes(value))return false;mode=value;try{localStorage.setItem(storageKey,value)}catch{}applyMode();window.dispatchEvent?.(new CustomEvent('lolite:motionmode',{detail:{mode}}));return true}
 function cancel(el){const job=active.get(el);if(job){active.delete(el);job.animation.cancel()}}
 function animate(el,frames,options={},done){
  cancel(el);if(!el?.isConnected||reduced()||!el.animate){done?.();return null}
  const duration=Math.max(0,Number.isFinite(options.duration)?options.duration:200);
  const animation=el.animate(frames,{easing:'cubic-bezier(.2,.8,.2,1)',fill:'both',...options,duration:mode==='snappy'?Math.max(60,Math.round(duration*.58)):duration});active.set(el,{animation,done});
  animation.finished.then(()=>{if(active.get(el)?.animation!==animation)return;active.delete(el);done?.();animation.cancel()},()=>{});return animation;
 }
 function settle(){if(!reduced())return;for(const [el,job] of active){active.delete(el);job.done?.();job.animation.cancel()}}
 media.addEventListener?.('change',settle);new MutationObserver(settle).observe(root,{attributes:true,attributeFilter:['class']});
 applyMode();
 window.LoliteMotion={reduced,animate,cancel,getMode:()=>mode,setMode};
})();
