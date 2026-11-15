/* Restrained Fluent-style reveal: one hovered UI surface, no idle animation loop. */
(()=>{'use strict';
 const root=document.documentElement;
 const fine=matchMedia('(any-hover: hover) and (any-pointer: fine)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const targets='button,[role="button"],.desktop-icon,.store-gallery-card,.appstore-card,.cr-theme-choice,.ldt-card,.lbt-choice';
 const excluded='input,textarea,select,option,canvas,video,audio,iframe,object,embed,[contenteditable]:not([contenteditable="false"]),[inert],[aria-disabled="true"],[data-reveal="off"],:disabled';
 const classes=['lolite-reveal-before','lolite-reveal-after','lolite-reveal-edge','lolite-reveal-position','lolite-reveal-visible'];
 const properties=['--reveal-x','--reveal-y','--reveal-radius'];
 let active=null,saved=null,frame=0,fade=0,latest=null;
 function enabled(){
  return fine.matches&&!reduced.matches&&!document.hidden&&
   !root.matches('.reduce,.reduce-motion,.no-animations,.lolite-lite-mode,[data-lolite-motion="off"],[data-reveal="off"]');
 }
 function restore(){
  if(fade){clearTimeout(fade);fade=0}
  if(active){
   active.classList.remove(...classes);
   for(const [name,value,priority] of saved||[]){
    if(value)active.style.setProperty(name,value,priority);else active.style.removeProperty(name);
   }
  }
  active=null;saved=null;
 }
 function clear(immediate=false){
  if(frame){cancelAnimationFrame(frame);frame=0}
  latest=null;
  if(immediate){restore();return}
  if(!active||fade)return;
  active.classList.remove('lolite-reveal-visible');
  fade=setTimeout(restore,180);
 }
 function targetAt(node){
  if(!(node instanceof Element)||node.closest(excluded))return null;
  const el=node.closest(targets);
  return el&&!el.closest(excluded)?el:null;
 }
 function freePseudo(el,pseudo){
  const content=getComputedStyle(el,pseudo).content;
  return !content||content==='none'||content==='normal';
 }
 function attach(el){
  restore();
  // Keep existing badges, active indicators and decorative pseudo-elements intact.
  const before=freePseudo(el,'::before'),after=freePseudo(el,'::after');
  if(!before&&!after)return false;
  active=el;saved=properties.map(name=>[name,el.style.getPropertyValue(name),el.style.getPropertyPriority(name)]);
  const position=getComputedStyle(el).position;
  if(!position||position==='static')el.classList.add('lolite-reveal-position');
  el.classList.add(before?'lolite-reveal-before':'lolite-reveal-after');
  if(before&&after)el.classList.add('lolite-reveal-edge');
  return true;
 }
 function paint(){
  frame=0;
  const point=latest;
  if(!point||!enabled()){clear(true);return}
  const hit=document.elementFromPoint?.(point.x,point.y)||point.node;
  const el=targetAt(hit);
  if(!el?.isConnected){clear();return}
  if(el!==active&&!attach(el))return;
  const rect=el.getBoundingClientRect();
  if(!rect.width||!rect.height||point.x<rect.left||point.x>rect.right||point.y<rect.top||point.y>rect.bottom){clear();return}
  const style=getComputedStyle(el);
  // Convert viewport coordinates back into the control's local coordinates (also at zoom/scale).
  const width=el.offsetWidth||rect.width,height=el.offsetHeight||rect.height;
  const x=(point.x-rect.left)*width/rect.width-(parseFloat(style.borderLeftWidth)||0);
  const y=(point.y-rect.top)*height/rect.height-(parseFloat(style.borderTopWidth)||0);
  if(fade){clearTimeout(fade);fade=0}
  el.style.setProperty('--reveal-x',x.toFixed(1)+'px');
  el.style.setProperty('--reveal-y',y.toFixed(1)+'px');
  el.style.setProperty('--reveal-radius',Math.min(150,Math.max(82,Math.min(width,height)*1.25))+'px');
  el.classList.add('lolite-reveal-visible');
 }
 function move(event){
  if((event.pointerType!=='mouse'&&event.pointerType!=='pen')||event.buttons||!enabled()){clear(true);return}
  latest={node:event.target,x:event.clientX,y:event.clientY};
  if(!frame)frame=requestAnimationFrame(paint);
 }
 document.addEventListener('pointermove',move,{passive:true});
 document.addEventListener('pointerover',move,{passive:true});
 document.addEventListener('pointerup',move,{passive:true});
 document.addEventListener('pointerout',event=>{
  if(!event.relatedTarget||!active?.contains(event.relatedTarget)||event.relatedTarget.closest?.(excluded))clear();
 },{passive:true});
 document.addEventListener('pointerdown',()=>clear(true),{passive:true});
 document.addEventListener('pointercancel',()=>clear(true),{passive:true});
 document.addEventListener('scroll',()=>clear(true),{capture:true,passive:true});
 document.addEventListener('keydown',()=>clear(true));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear(true)});
 window.addEventListener('blur',()=>clear(true));
 window.addEventListener('resize',()=>clear(true),{passive:true});
 const policyChanged=()=>{if(!enabled())clear(true)};
 fine.addEventListener('change',policyChanged);reduced.addEventListener('change',policyChanged);
 window.addEventListener('lolite:performancechange',policyChanged);
 window.addEventListener('lolite:motionmode',policyChanged);
 new MutationObserver(policyChanged).observe(root,{attributes:true,attributeFilter:['class','data-lolite-motion','data-reveal']});
})();
