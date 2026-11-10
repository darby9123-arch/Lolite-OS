/* Lolite OS blue/purple branded icon pack; keep the local icon fallback. */
(()=>{'use strict';
 const previous=window.LoliteIcons;if(!previous)return;
 // Simplified recognisable brand glyphs; all colours share Lolite's blue/violet palette.
 const glyphs=Object.freeze({
 music:'<circle cx="16" cy="16" r="12" fill="#eef7ff"/><path d="M9.5 12c4.3-1.3 9.5-.9 13.4 1.3M10.5 16.9c3.3-.8 7.4-.5 10.5.9M11.5 21c2.6-.5 5.3-.2 7.7.7" fill="none" stroke="#6356d9" stroke-width="2.2" stroke-linecap="round"/>',
 spotify:'<circle cx="16" cy="16" r="12" fill="#eef7ff"/><path d="M9.5 12c4.3-1.3 9.5-.9 13.4 1.3M10.5 16.9c3.3-.8 7.4-.5 10.5.9M11.5 21c2.6-.5 5.3-.2 7.7.7" fill="none" stroke="#6356d9" stroke-width="2.2" stroke-linecap="round"/>',
 steam:'<circle cx="22" cy="10.6" r="5" fill="#f1f8ff"/><circle cx="22" cy="10.6" r="2.8" fill="#6259d8"/><path d="m17.9 13.9-6 5.6a5.1 5.1 0 1 0 2 3.8l6-7.4" fill="#dfebff"/><circle cx="9.2" cy="23" r="2.8" fill="#6458d7"/><path d="m5 20.7 4.2 2.3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
 youtube:'<rect x="3" y="8.5" width="26" height="15" rx="5.5" fill="#edf7ff"/><path d="m13.5 12 8 4-8 4z" fill="#6855dc"/>',
 discord:'<path d="m9 8.5 4 1.2a13 13 0 0 1 6 0l4-1.2c2.5 3.4 3.8 7.3 4 11.3a20 20 0 0 1-5.4 3.5l-1.7-2.5a10 10 0 0 1-7.8 0l-1.7 2.5A20 20 0 0 1 5 19.8c.2-4 1.5-7.9 4-11.3z" fill="#eef7ff"/><ellipse cx="12.3" cy="16.6" rx="1.5" ry="1.9" fill="#6656d9"/><ellipse cx="19.7" cy="16.6" rx="1.5" ry="1.9" fill="#6656d9"/>',
 roblox:'<path d="m10.3 3.3 18.4 5-5.1 20.4-20.3-5.1z" fill="#f1f8ff"/><path d="m13.8 12.5 6 1.7-1.7 6-6-1.7z" fill="#6859de"/>',
 github:'<path d="M16 4a12 12 0 0 0-3.8 23.4v-4.2c-3.7.8-4.3-1.6-4.8-2.4-.4-.8-1-1.4-1.6-1.8 2.2-.2 2.2 1.6 3.1 2.1 1.1.6 2.2.4 3.4.1.1-1.1.5-1.9 1.1-2.4-3.2-.4-6.6-1.8-6.6-6.2 0-1.3.5-2.6 1.3-3.6-.2-1-.2-2.4.2-3.5 1.5.1 2.6.9 3.4 1.5a11 11 0 0 1 5.8 0c.8-.6 1.9-1.4 3.4-1.5.4 1.1.4 2.5.2 3.5.8 1 1.3 2.3 1.3 3.6 0 4.4-3.3 5.8-6.6 6.2.9.8 1.2 1.9 1.2 3.3v3.5A12 12 0 0 0 16 4z" fill="#f1f8ff"/>',
 docs:'<path d="M8 3h12l5 5v20H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#f0f7ff"/><path d="M20 3v5h5" fill="#aed3ff"/><path d="M11 14h10M11 18h10M11 22h7" fill="none" stroke="#6258dc" stroke-width="2" stroke-linecap="round"/>',
 sheets:'<path d="M8 3h12l5 5v20H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#f0f7ff"/><path d="M20 3v5h5" fill="#aed3ff"/><rect x="11" y="13.5" width="11" height="10" rx="1" fill="none" stroke="#6258dc" stroke-width="1.8"/><path d="M16.5 14v9m-5.5-4.5h11" stroke="#6258dc" stroke-width="1.6"/>',
 slides:'<path d="M8 3h12l5 5v20H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#f0f7ff"/><path d="M20 3v5h5" fill="#aed3ff"/><rect x="10.5" y="13" width="12" height="8" rx="1" fill="none" stroke="#6258dc" stroke-width="2"/><path d="M16.5 21.5V25m-3 0h6" stroke="#6258dc" stroke-width="2" stroke-linecap="round"/>',
 browser:'<circle cx="16" cy="16" r="12" fill="#eff7ff"/><circle cx="16" cy="16" r="5" fill="#6559d9"/><path d="M5.5 10.5h11.9m-4.6 16.2 5.5-9.7m8-4.5-6.4 10.1" stroke="#84cfff" stroke-width="3" stroke-linecap="round" fill="none"/>',
 files:'<path d="M3.8 10a2.4 2.4 0 0 1 2.4-2.4h6.7l3 3h10.1A2.4 2.4 0 0 1 28.4 13v11.1a2.9 2.9 0 0 1-2.9 2.9H6.7a2.9 2.9 0 0 1-2.9-2.9z" fill="#f0f8ff"/><path d="M4.5 15h23l-2.3 10.4H6.8z" fill="#98c8ff"/>',
 settings:'<path d="m14 2 5 0 1 3.4 2.4 1 3.1-1.6 3.7 3.7-1.7 3.1 1 2.4L32 15v5l-3.5 1-1 2.4 1.7 3.1-3.7 3.7-3.1-1.7-2.4 1L19 33h-5l-1-3.5-2.4-1-3.1 1.7-3.7-3.7 1.7-3.1-1-2.4L1 20v-5l3.5-1 1-2.4-1.7-3.1 3.7-3.7 3.1 1.6 2.4-1z" transform="translate(1 1) scale(.88)" fill="#eef7ff"/><circle cx="16" cy="16" r="6.8" fill="#695bdc"/><circle cx="16" cy="16" r="3.6" fill="#c4e7ff"/>',
 appstore:'<path d="M7 10h18l3 18H4z" fill="#eff7ff"/><path d="M11.5 11V8.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke="#b4d8ff" stroke-width="2.4" stroke-linecap="round"/><path d="m16 15-5.5 9M16 15l5.5 9m-8.5-3.3h6" fill="none" stroke="#6958dc" stroke-width="2.4" stroke-linecap="round"/>',
 camera:'<rect x="3.5" y="9" width="25" height="18" rx="4" fill="#eff7ff"/><path d="m10 9 2-3.5h8L22 9" fill="#c2dcff"/><circle cx="16" cy="18" r="6.2" fill="#6258dc"/><circle cx="16" cy="18" r="3.2" fill="#bfe8ff"/><circle cx="25" cy="13" r="1.1" fill="#6459db"/>',
 photos:'<rect x="4.5" y="5" width="23" height="22" rx="3" fill="#eff7ff"/><circle cx="21" cy="12" r="3" fill="#9edcff"/><path d="m6 23 7-9 5 5 3-3 5 7v2H6z" fill="#6559da"/>',
 mail:'<rect x="3.5" y="7.5" width="25" height="18" rx="3.5" fill="#eff7ff"/><path d="M5 10 16 18l11-8" fill="none" stroke="#6758dd" stroke-width="2.5" stroke-linejoin="round"/><path d="m5 23 7-5m15 5-7-5" fill="none" stroke="#a6b6f5" stroke-width="1.8"/>',
 calendar:'<rect x="4.5" y="6" width="23" height="22" rx="3" fill="#eff7ff"/><path d="M4.5 13h23" stroke="#6757dc" stroke-width="3"/><path d="M11 4v5m10-5v5" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="10.5" y="17" width="4.2" height="4.2" rx=".7" fill="#7e75ee"/><rect x="17.5" y="17" width="4.2" height="4.2" rx=".7" fill="#7e75ee"/>',
 weather:'<circle cx="12" cy="12" r="6.5" fill="#c2e8ff"/><path d="M8.7 25.5a6.2 6.2 0 0 1-.9-12.1 8.1 8.1 0 0 1 15.2 3.1 4.7 4.7 0 0 1-.3 9z" fill="#f0f8ff"/><path d="m10 29 2-3m6 3 2-3" stroke="#a1d5ff" stroke-width="2.2" stroke-linecap="round"/>',
 chatroom:'<path d="M6.5 5h19A3.5 3.5 0 0 1 29 8.5v12A3.5 3.5 0 0 1 25.5 24H15l-7.5 5v-5h-1A3.5 3.5 0 0 1 3 20.5v-12A3.5 3.5 0 0 1 6.5 5z" fill="#eff7ff"/><circle cx="10" cy="15" r="2" fill="#6758dc"/><circle cx="16" cy="15" r="2" fill="#6758dc"/><circle cx="22" cy="15" r="2" fill="#6758dc"/>'
 });
 const aliases=Object.freeze({
 'app-music':'music','lolite-music':'music','music-player':'music','app-spotify':'spotify',
 'app-steam':'steam','app-youtube':'youtube','app-discord':'discord','app-roblox':'roblox','app-github':'github',
 'google-docs':'docs','google-sheets':'sheets','google-slides':'slides',
 'app-browser':'browser','ultraviolet':'browser','ultraviolet-browser':'browser','lolite-browser':'browser',
 'app-files':'files','file-explorer':'files','app-settings':'settings','app-store':'appstore',
 'app-camera':'camera','app-photos':'photos','app-mail':'mail','app-calendar':'calendar','app-weather':'weather',
 'app-chat':'chatroom','chat':'chatroom','lolite-chat':'chatroom'
 });
 const css=[
 '.lolite-icon.lolite-icon--brand-real{display:inline-grid!important;place-items:center!important;flex:0 0 auto!important;vertical-align:middle;line-height:0!important;padding:0!important;text-align:center!important;',
 'background:linear-gradient(145deg,#4eaeed 0%,#597ae4 45%,#8352d4 100%)!important;border:1px solid rgba(218,231,255,.42)!important;border-radius:24%!important;',
 'box-shadow:inset 0 1px rgba(255,255,255,.3),0 3px 10px rgba(21,18,66,.26)!important;isolation:isolate;overflow:hidden!important;}',
 '.lolite-icon.lolite-icon--brand-real::before{display:none!important}',
 '.lolite-icon.lolite-icon--brand-real svg{display:block!important;position:static!important;width:81%!important;height:81%!important;justify-self:center!important;align-self:center!important;margin:0!important;overflow:visible!important;filter:none!important;transform:none!important;}',
 'html[data-lolite-design][data-desktop-experience][data-desktop-theme] #icons .desktop-icon .lolite-icon.lolite-icon--brand-real,',
 'html[data-lolite-design] #icons .desktop-icon .lolite-icon.lolite-icon--brand-real,',
 'html[data-lolite-design] #taskbar .lolite-icon.lolite-icon--brand-real{background:linear-gradient(145deg,#4eaeed 0%,#597ae4 45%,#8352d4 100%)!important;border:1px solid rgba(218,231,255,.42)!important;border-radius:24%!important;box-shadow:inset 0 1px rgba(255,255,255,.3),0 3px 10px rgba(21,18,66,.26)!important;}',
 '#icons .desktop-icon > .lolite-icon--brand-real,.appstore-icon > .lolite-icon--brand-real,.lm-app-icon > .lolite-icon--brand-real{align-self:center!important;margin-inline:auto!important;}'
 ].join('');
 if(!document.getElementById('lolite-brand-real-icons-style')){
   const style=document.createElement('style');style.id='lolite-brand-real-icons-style';
   style.textContent=css;document.head.appendChild(style);
 }
 function resolve(id){
   const raw=String(id||'').trim().toLowerCase(),key=aliases[raw]||raw;
   if(Object.prototype.hasOwnProperty.call(glyphs,key))return key;
   const resolved=previous.resolve?.(raw)||key;
   return aliases[resolved]||resolved;
 }
 function tile(id){
   const key=resolve(id);
   if(!Object.prototype.hasOwnProperty.call(glyphs,key))return previous.tile(id);
   return '<span class="lolite-icon lolite-icon--'+key+' lolite-icon--brand-real" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+glyphs[key]+'</svg></span>';
 }
 window.LoliteIcons=Object.freeze({
  tile,resolve,names:Object.freeze([...new Set([...(previous.names||[]),...Object.keys(glyphs)])]),classic:previous.classic||previous
 });
})();