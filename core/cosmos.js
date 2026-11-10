/* Lolite Cosmos desktop: clean desktop with usable shortcuts and terminal. */
(()=>{'use strict';
 const root=document.documentElement;
 const enabled=()=>root.dataset.desktopTheme==='cosmos'&&!root.classList.contains('browsing-mode')&&!root.classList.contains('mobile-mode');
 const icon=id=>window.LoliteIcons?.tile(id)||'';
 const apps=[
  ['files','Files'],['browser','Browser'],['appstore','App Store'],
  ['games','Games'],['music','Lolite Music'],['feature-requests','Feature Requests'],['chatroom','Chat'],['lowlight-ai','AI'],
  ['wallpaper-editor','Wallpaper'],['terminal','Terminal'],['settings','Settings']
 ];
 const quick=[['games','Game Store'],['cloud-gaming','Cloud Gaming'],['minecraft18','Minecraft 1.8'],['academy','Academy'],['appstore','App Store']];
 const safeText=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Preserve existing desktop icons and installed shortcuts.
 function shortcuts(){
   const holder=document.getElementById('icons');
   if(!holder||!enabled())return;
   const existing=new Set(Array.from(holder.querySelectorAll('.desktop-icon'),el=>
     (el.getAttribute('aria-label')||el.textContent||'').replace(/^open\s+/i,'').trim().toLowerCase()));
   const aliases={browser:['browser','ultraviolet browser','lolite browser'],games:['games','game store','default games'],
     'wallpaper-editor':['wallpaper','wallpaper editor']};
   const additions=document.createDocumentFragment();
   for(const [id,title] of apps){
     if((aliases[id]||[title.toLowerCase()]).some(name=>existing.has(name)))continue;
     const button=document.createElement('button');
     button.type='button';button.className='desktop-icon';button.dataset.cosmosShortcut='1';button.dataset.cosmosOpen=id;
     button.setAttribute('aria-label','Open '+title);button.title=title;
     button.innerHTML=icon(id)+'<span>'+safeText(title)+'</span>';
     additions.appendChild(button);
   }
   if(additions.childNodes.length)holder.appendChild(additions);
 }
 function removeExtraShortcuts(){document.querySelectorAll('#icons [data-cosmos-shortcut]').forEach(el=>el.remove())}
 function launch(id){
   if(id==='updates'){window.LoliteWhatsNew?.open?.();if(!window.LoliteWhatsNew?.open)window.openApp?.('updates','What’s New');return}
   if(id==='lowlight-ai'){
     if(typeof window.loliteOpenApp==='function'){window.loliteOpenApp('lowlight-ai');return}
     window.openApp?.('lowlight-ai','Lolite AI');return;
   }
   if(id==='terminal'){window.openApp?.('terminal','Terminal',800,550);return}
   if(id==='wallpaper-editor'){
     if(typeof window.loliteOpenApp==='function'){window.loliteOpenApp('wallpaper-editor');return}
     window.openApp?.('wallpaper-editor','Wallpaper Editor');return;
   }
   if(window.LoliteDesktopShell?.launch){window.LoliteDesktopShell.launch(id);return}
   window.openApp?.(id,apps.find(a=>a[0]===id)?.[1]||id);
 }

 // The Cosmos desktop now has no overlaid header, logo or dashboard widgets.
 // Fade the scrolled ends of the desktop shortcut column without hiding first/last rows.
 function updateIconFade(){
   const holder=document.getElementById('icons');
   if(!holder)return;
   if(!enabled()){
     holder.style.removeProperty('--cosmos-fade-top');
     holder.style.removeProperty('--cosmos-fade-bottom');
     return;
   }
   const remaining=Math.max(0,holder.scrollHeight-holder.clientHeight);
   const top=holder.scrollTop;
   holder.style.setProperty('--cosmos-fade-top',top>6?'28px':'0px');
   holder.style.setProperty('--cosmos-fade-bottom',remaining-top>6?'28px':'0px');
 }
 function apply(){if(enabled())shortcuts();requestAnimationFrame(updateIconFade)}
 // Lightweight local terminal: actual commands, no fake shell execution.
 function terminalMarkup(){
   return '<div class="cosmos-terminal"><div class="cosmos-terminal-intro">Lolite Terminal <small>Local workspace · type help for commands</small></div>'+
     '<div class="cosmos-terminal-history" aria-live="polite"><p>Cosmos shell ready. No system commands are executed on your computer.</p></div>'+
     '<form class="cosmos-terminal-form"><label for="cosmosCommand">›</label><input id="cosmosCommand" autocomplete="off" spellcheck="false" aria-label="Terminal command" placeholder="help"><button type="submit">Run</button></form></div>';
 }
 function attachTerminal(){
   const previous=window.page;
   if(typeof previous==='function')window.page=function(id){return id==='terminal'?terminalMarkup():previous.apply(this,arguments)};
   document.addEventListener('submit',e=>{
     const form=e.target.closest('.cosmos-terminal-form');if(!form)return;
     e.preventDefault();const input=form.querySelector('input'),history=form.parentElement.querySelector('.cosmos-terminal-history');
     const command=input.value.trim().slice(0,200);input.value='';if(!command)return;
     const row=document.createElement('p');row.textContent='› '+command;history.appendChild(row);
     const args=command.split(/\s+/),head=args.shift().toLowerCase();
     let response='';
     if(head==='help')response='help · about · date · time · apps · open <app> · echo <message> · clear';
     else if(head==='about')response='Lolite OS Cosmos — browser-powered desktop. Terminal commands run locally within Lolite only.';
     else if(head==='date')response=new Date().toLocaleDateString();
     else if(head==='time')response=new Date().toLocaleTimeString();
     else if(head==='echo')response=args.join(' ');
     else if(head==='apps')response=apps.map(a=>a[0]).join(' · ');
     else if(head==='clear'){history.replaceChildren();return}
     else if(head==='open'){
       const id=args.join('-').toLowerCase();if(apps.some(a=>a[0]===id)||quick.some(a=>a[0]===id)){response='Opening '+id;launch(id)}
       else response='Unknown app. Type apps to list shortcuts.';
     }else response='Unknown command. Type help for supported commands.';
     const out=document.createElement('p');out.className='cosmos-terminal-response';out.textContent=response;history.appendChild(out);
     history.scrollTop=history.scrollHeight;
   });
 }

 function init(){
   attachTerminal();
   const originalRender=window.renderIcons;
   if(typeof originalRender==='function'){
     window.renderIcons=function(){
       const result=originalRender.apply(this,arguments);
       if(enabled())queueMicrotask(()=>{shortcuts();requestAnimationFrame(updateIconFade)});
       return result;
     };
   }
   apply();
   setTimeout(apply,350);
   setTimeout(apply,900);
   window.addEventListener('lolite:desktopthemechange',()=>{if(!enabled())removeExtraShortcuts();apply()});
   window.addEventListener('lolite:modechange',apply);
   const icons=document.getElementById('icons');
   if(icons){
     icons.addEventListener('scroll',updateIconFade,{passive:true});
     if(typeof ResizeObserver==='function')new ResizeObserver(updateIconFade).observe(icons);
     new MutationObserver(()=>{
       if(enabled())queueMicrotask(()=>{shortcuts();requestAnimationFrame(updateIconFade)});
     }).observe(icons,{childList:true});
     requestAnimationFrame(updateIconFade);
   }
   window.addEventListener('resize',updateIconFade,{passive:true});
   document.addEventListener('click',e=>{
     const shortcut=e.target.closest('#icons [data-cosmos-open]');
     if(shortcut){e.preventDefault();launch(shortcut.dataset.cosmosOpen)}
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
