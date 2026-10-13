/* Slightly wider, shorter default proportions for Lolite app windows. */
(()=>{
  const original=window.openApp;
  if(typeof original!=='function'||window.loliteWindowSizingApplied)return;
  window.loliteWindowSizingApplied=true;
  window.openApp=function(id,title,w=560,h=420){
    return original.call(this,id,title,Math.round(w*1.12),Math.round(h*0.88));
  };
})();
