/* Interruptible desktop motion. Reduced motion always takes priority. */
(()=>{'use strict';
 const root=document.documentElement,active=new Map(),media=matchMedia('(prefers-reduced-motion: reduce)');
 const reduced=()=>media.matches||['reduce','reduce-motion','no-animations'].some(c=>root.classList.contains(c));
 function cancel(el){const job=active.get(el);if(job){active.delete(el);job.animation.cancel()}}
 function animate(el,frames,options={},done){
  cancel(el);if(!el?.isConnected||reduced()||!el.animate){done?.();return null}
  const animation=el.animate(frames,{duration:200,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both',...options});active.set(el,{animation,done});
  animation.finished.then(()=>{if(active.get(el)?.animation!==animation)return;active.delete(el);done?.();animation.cancel()},()=>{});return animation;
 }
 function settle(){if(!reduced())return;for(const [el,job] of active){active.delete(el);job.done?.();job.animation.cancel()}}
 media.addEventListener?.('change',settle);new MutationObserver(settle).observe(root,{attributes:true,attributeFilter:['class']});
 window.LoliteMotion={reduced,animate,cancel};
})();
