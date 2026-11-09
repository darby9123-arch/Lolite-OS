/* Lolite OS 4.0: taskbar context controls, live window-state previews and badges. */
(()=>{'use strict';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 let pop=null,menu=null,hoverTimer=null,hideTimer=null,activeId=null;
 const notifications=new Map();
 const apps=()=>window.LoliteDesktopShell?.apps||[];
 const record=id=>window.LoliteWindowManager?.getWindow?.(id)||null;
 const label=id=>apps().find(a=>a[0]===id)?.[1]||record(id)?.title||id;
 const status=id=>{const w=record(id);return !w?'Not open':w.minimised?'Minimised':w.closing?'Closing':window.LoliteWindowManager?.activeWindowId?.()===id?'Active window':'Open in background'};
 const getId=target=>{
  const el=target?.closest?.('[data-task-app],#tasks .taskwin');
  if(!el)return null;
  const id=el.dataset.taskApp||el.dataset.appId;
  return /^(?:[a-z0-9_-]){1,80}$/i.test(id)?id:null;
 };
 function closePreview(){if(hideTimer){clearTimeout(hideTimer);hideTimer=null}if(pop){pop.remove();pop=null}activeId=null}
 function closeMenu(){menu?.remove();menu=null}
 function locate(target,popup){
  const rect=target.getBoundingClientRect(),width=popup.offsetWidth||250;
  popup.style.left=Math.max(8,Math.min(innerWidth-width-8,rect.left+(rect.width-width)/2))+'px';
  const taskbar=document.getElementById('taskbar')?.getBoundingClientRect();
  popup.style.bottom=Math.max(58,innerHeight-(taskbar?.top??innerHeight-56)+12)+'px';
 }
 function preview(target){
  const id=getId(target);if(!id){closePreview();return}
  const w=record(id);if(!w){closePreview();return}
  closePreview();activeId=id;
  pop=document.createElement('section');
  pop.className='lolite-task-preview';
  pop.setAttribute('role','status');
  pop.setAttribute('aria-label','Window preview for '+label(id));
  const dimensions=w.el?.getBoundingClientRect?.();
  const footprint=dimensions?.width>0&&dimensions.height>0?Math.round(dimensions.width)+' × '+Math.round(dimensions.height):'Window';
  pop.innerHTML='<div class="lolite-task-preview-head">'+
    '<span class="lolite-task-preview-icon">'+(window.LoliteIcons?.tile?.(id)||'◫')+'</span>'+
    '<div><strong>'+escape(label(id))+'</strong><small data-preview-state>'+escape(status(id))+'</small></div></div>'+
    '<p class="lolite-task-preview-info">'+escape(footprint)+' · Lolite desktop</p>'+
    '<div class="lolite-task-preview-actions"><button type="button" data-preview-action="focus">Open</button>'+
    '<button type="button" data-preview-action="min">Minimise</button>'+
    '<button type="button" data-preview-action="close">Close</button></div>';
  pop.dataset.appId=id;document.body.appendChild(pop);locate(target,pop);
  pop.addEventListener('pointerenter',()=>{if(hideTimer){clearTimeout(hideTimer);hideTimer=null}});
  pop.addEventListener('pointerleave',closePreview);
 }
 function renderBadges(){
  document.querySelectorAll('#taskbar [data-task-app],#taskbar .taskwin').forEach(el=>{
   const id=getId(el),count=notifications.get(id)||0;
   let badge=el.querySelector('.lolite-task-count');
   if(!count){badge?.remove();return}
   if(!badge){badge=document.createElement('small');badge.className='lolite-task-count';el.appendChild(badge)}
   badge.textContent=count>99?'99+':String(count);
   badge.setAttribute('aria-label',count+' unread notifications');
  });
 }
 function badge(id,count){
  if(!/^[a-z0-9_-]{1,80}$/i.test(String(id)))return;
  const n=Math.max(0,Math.min(999,Number(count)||0));
  if(n)notifications.set(id,n);else notifications.delete(id);
  renderBadges();
 }
 function menuFor(target,x,y){
  const id=getId(target);if(!id)return;
  closeMenu();closePreview();
  menu=document.createElement('section');menu.className='lolite-task-context';
  menu.setAttribute('role','menu');menu.setAttribute('aria-label',label(id)+' options');
  menu.dataset.appId=id;
  const pinned=window.LoliteDesktopShell?.getPins?.().includes(id);
  const running=!!record(id)&&!record(id).closing;
  menu.innerHTML='<strong>'+escape(label(id))+'</strong>'+
   '<button type="button" role="menuitem" data-task-action="pin">'+(pinned?'Unpin from taskbar':'Pin to taskbar')+'</button>'+
   (running?'<button type="button" role="menuitem" data-task-action="focus">Open window</button>'+
    '<button type="button" role="menuitem" data-task-action="close">Close window</button>':'');
  document.body.appendChild(menu);
  menu.style.left=Math.max(8,Math.min(innerWidth-(menu.offsetWidth||215)-8,x))+'px';
  menu.style.top=Math.max(8,Math.min(innerHeight-(menu.offsetHeight||154)-8,y-(menu.offsetHeight||154)))+'px';
  menu.querySelector('button')?.focus();
 }
 const init=()=>{
  const bar=document.getElementById('taskbar');if(!bar)return;
  bar.addEventListener('pointerover',e=>{
   if(e.pointerType==='touch'||menu)return;
   const id=getId(e.target);if(!id||id===activeId)return;
   if(hoverTimer)clearTimeout(hoverTimer);
   hoverTimer=setTimeout(()=>{hoverTimer=null;const button=bar.querySelector('[data-task-app="'+id+'"],#task-'+id);if(button)preview(button)},320);
  });
  bar.addEventListener('pointerout',e=>{
   if(hoverTimer){clearTimeout(hoverTimer);hoverTimer=null}
   if(hideTimer)clearTimeout(hideTimer);
   hideTimer=setTimeout(()=>{hideTimer=null;closePreview()},220);
  });
  bar.addEventListener('focusin',e=>{
   const button=e.target.closest?.('[data-task-app],.taskwin');if(button)preview(button);
  });
  bar.addEventListener('contextmenu',e=>{
   const button=e.target.closest?.('[data-task-app],.taskwin');if(!button)return;
   e.preventDefault();menuFor(button,e.clientX,e.clientY);
  });
  document.addEventListener('click',e=>{
   const p=e.target.closest?.('[data-preview-action]');
   if(p&&pop?.contains(p)){
    const id=pop.dataset.appId,action=p.dataset.previewAction;
    closePreview();
    if(action==='close')window.closeWin?.(id);
    else if(action==='min')window.minWin?.(id);
    else window.restoreWin?.(id);
    return;
   }
   const b=e.target.closest?.('[data-task-action]');
   if(b&&menu?.contains(b)){
    const id=menu.dataset.appId,action=b.dataset.taskAction;
    if(action==='pin'){
     const shell=window.LoliteDesktopShell,old=shell?.getPins?.().includes(id);
     const changed=old?shell?.unpin?.(id):shell?.pin?.(id);
     if(changed)window.toast?.((old?'Unpinned ':'Pinned ')+label(id)+(old?'':' to taskbar'));
     renderBadges();
    }else if(action==='close')window.closeWin?.(id);
    else window.restoreWin?.(id);
    closeMenu();return;
   }
   if(!e.target.closest?.('.lolite-task-context'))closeMenu();
   if(!e.target.closest?.('.lolite-task-preview'))closePreview();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closePreview()}});
  window.addEventListener('lolite:windowchange',e=>{
   if(pop&&e.detail?.id===pop.dataset.appId){
    const state=pop.querySelector('[data-preview-state]');if(state)state.textContent=status(e.detail.id);
    if(e.detail.type==='close')closePreview();
   }
   renderBadges();
  });
  window.addEventListener('lolite:notificationcount',e=>badge(e.detail?.appId,e.detail?.count));
  window.addEventListener('lolite:modechange',()=>{closeMenu();closePreview()});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.LoliteTaskbar4=Object.freeze({badge,preview,closePreview,closeMenu});
})();
