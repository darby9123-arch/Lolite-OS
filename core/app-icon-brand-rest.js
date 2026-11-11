/* Lolite OS — complete the blue/violet app icon collection.
 * Loads after app-icon-brand-pack.js. Every known app remains functional; unknown
 * icon identifiers still use the existing Cosmos PNG/SVG fallback.
 */
(()=>{'use strict';
 const previous=window.LoliteIcons;if(!previous)return;
 const W='#f1f8ff',V='#6559db',B='#b6deff',D='#d9eaff';
 const F=(d,c=W)=>'<path d="'+d+'" fill="'+c+'"/>';
 const S=(d,w=2,c=V)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
 const R=(x,y,w,h,r=2,c=W)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+c+'"/>';
 const O=(x,y,r,c=W)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
 const glyphs=Object.freeze({
  home:F('M2.5 15.4 16 4l13.5 11.4v12.2h-8.3V19h-10v8.6H2.5z')+F('M13.7 21.3h4.6v6.3h-4.6z',B),
  scramjet:O(16,16,12)+S('M4 16h24M16 4c-6 6-6 18 0 24m0-24c6 6 6 18 0 24',1.65)+F('m19 6-9 12h6l-2 9 9-13h-6z',V),
  games:F('M9.4 10h13.2c3.7 0 5.1 2.5 5.9 6l1.2 7c.5 3.8-2.1 5.2-5 2.7l-3.9-3.5h-9.6l-3.9 3.5c-2.9 2.5-5.5 1.1-5-2.7l1.2-7c.8-3.5 2.2-6 5.9-6z')+S('M10 15v7m-3.5-3.5h7',2.2)+O(21,16.5,1.8,V)+O(24.9,20.3,1.8,V),
  'lowlight-ai':O(16,16,11.4,D)+F('m16 3.5 3.7 8.8 8.8 3.7-8.8 3.7-3.7 8.8-3.7-8.8-8.8-3.7 8.8-3.7z',V)+O(25,7,2,B),
  terminal:R(3,5,26,22,3)+S('m9 12 5 5-5 5M18 22h6',2.3)+R(3,5,26,4,2,B),
  notes:R(6,3,21,26,3)+F('M21 3v7h6z',B)+S('M11 14h11M11 19h11M11 24h8',1.9),
  calculator:R(7,2.7,18,26.6,3)+R(10,6,12,6,1,B)+R(10,15,4,4,1,V)+R(16,15,4,4,1,V)+R(10,21,4,4,1,V)+R(16,21,4,4,1,V),
  paint:F('M16 3c-7.2 0-13 5.8-13 13s5.3 13 12.5 13h1c3 0 4.2-3.2 2.3-5 0-2 1.2-4 3.6-4H25c5.3 0 6-6.6 2.1-11C24 5.5 20.2 3 16 3z')+O(9.5,14,2,V)+O(16,9,2,B)+O(23,13,2,V)+O(11,21,2,B),
  wallpaper:R(3,5,26,22,3)+O(22,11,3,B)+F('m5 23 8-9 6.5 6 3-3.5 4.5 6V25H5z',V),
  'wallpaper-editor':R(3,4,25,22,3)+O(20,10,2.6,B)+F('m5 21 7-8 6 6 4-3 4 5v3H5z',V)+S('m20 28 7-7m-5-1 2 2',2.8,W),
  minecraft18:F('M16 2 29 9v15l-13 7L3 24V9z')+S('M3 9 16 16 29 9M16 16v15',1.7)+F('m5 10 11-6 11 6-11 6z',B)+S('m10 11 3-1m6 1 3 1',1.7),
  world:O(16,16,12)+S('M4 16h24M16 4c-5 5-5 19 0 24m0-24c5 5 5 19 0 24M7 9h18M7 23h18',1.5),
  clock:O(16,16,12)+O(16,16,9,B)+S('M16 9v8l5.5 3',2.7),
  widgets:R(3,3,11.5,11.5,2)+R(17.5,3,11.5,18,2)+R(3,17.5,11.5,11.5,2)+R(17.5,24,11.5,5,1,B),
  battery:R(3,8,24.5,16,3)+R(28,13,2.7,6,1,B)+F('m16.5 10-7 8h5l-1 5.5 9-9h-5z',V),
  capture:S('M4 12V6h7m10 0h7v6M4 20v6h7m10 0h7v-6',2.8,W)+R(10,12,12,9,2,D)+O(16,16.5,2.5,V),
  utilities:F('m8 3 4 4-3.5 3.5 13 13 3.5-3.5 4 4-4 4-4-4-3.5 3.5-13-13L3 12 7 8 3 4z')+S('m18 9 4-4m-2 6 6-6',2.7,W),
  academy:F('M1.5 12 16 5l14.5 7L16 19z')+S('M7 15v7q9 7 18 0v-7M29 13v10',2.2,W)+O(29,24,2,B),
  guide:F('M4 5h9q3 0 3 3 0-3 3-3h9v22h-9q-3 0-3 3 0-3-3-3H4z')+S('M16 9v17M7 11h6m6 0h6M7 16h6m6 0h6M7 21h6m6 0h6',1.6),
  'cloud-gaming':F('M9 25a7 7 0 0 1-.8-13.8 9 9 0 0 1 17.2 2.1A6 6 0 0 1 25 25z')+S('M12 18h8m-6-2v4',2)+O(22,17,1.3,V)+O(24.3,20,1.3,V),
  'life-rp':R(5,15,7,13,1,B)+R(12,7,9,21,1)+R(21,12,7,16,1,B)+S('M4 28h25M16 12v2m0 4v2m-7 0v2m16-5v2',1.7,V),
  quests:F('M10 4h12v8a6 6 0 0 1-12 0z')+S('M10 8H4v3q0 5 7 6m11-9h6v3q0 5-7 6M16 18v7m-7 3h14',2,W)+F('m16 6 1.7 3.3 3.8.5-2.8 2.7.7 3.7-3.4-1.7-3.4 1.7.7-3.7-2.8-2.7 3.8-.5z',V),
  sounds:F('M3 12h6l6-6v20l-6-6H3z')+S('M19 11q6 5 0 10m4-14q10 9 0 18',2.5,W),
  focus:O(16,16,12)+O(16,16,8,B)+O(16,16,4,V)+S('M16 3v5m0 16v5M3 16h5m16 0h5',2,W),
  'video-editor':R(3,5,26,22,2)+F('M3 11h26v5H3z',B)+F('m13 15 8 5-8 5z',V)+S('M8 6v4m8-4v4m8-4v4',1.5),
  'voice-call':F('M9 4 4 9c-1 9 10 20 19 19l5-5-6.1-6-4 4q-5-2-7-7l4-4z')+S('M20 5q7 0 7 7M20 10q3 0 3 3',2.3,W),
  videos:R(4,4,24,24,3)+F('m13 10 9 6-9 6z',V)+S('M7 7v18M25 7v18M4 12h4m16 0h4M4 20h4m16 0h4',1.3),
  contacts:R(6,3,21,26,3)+O(17,12,4,V)+S('M10 23c1-7 13-7 14 0',2.6,V)+S('M7 8H4M7 16H4M7 24H4',1.9,W),
  news:R(4,4,24,24,3)+R(8,9,10,9,1,B)+S('M20 10h5m-5 4h5M8 22h17M8 25h17',1.6,V),
  code:S('m11 9-7 7 7 7m10-14 7 7-7 7m-3-18-4 22',2.8,W),
  updates:S('M7 11a10 10 0 0 1 17-3l3 3M25 21A10 10 0 0 1 8 24l-3-3',2.7,W)+F('M20 11h8V3zM12 21H4v8z',B),
  power:S('M16 3v13M9 7.5a12 12 0 1 0 14 0',3,W),
  credits:O(11,12,8,B)+O(20.5,20,8,W)+S('M20.5 15.5v9m-2.5-6.5h5',1.7,V),
  about:O(16,16,12)+O(16,10,1.9,V)+S('M16 15v8',3,V),
  'recycle-bin':F('M8 8h16l-1.6 20H9.6z')+S('M6 7h20M12 4h8m-6 8v11m4-11v11',2,V),
  'system-info':R(7,7,18,18,3)+R(12,12,8,8,1,B)+S('M12 3v4m8-4v4m-8 18v4m8-4v4M3 12h4m-4 8h4m18-8h4m-4 8h4',1.7,W),
  help:O(16,16,12)+S('M12 12a4.5 4.5 0 1 1 6.5 4c-2 1.1-2.5 2.2-2.5 3.4',2.5,V)+O(16,24,1.6,V),
  drive:F('m12 3 8 0 10 18-4.5 8H17l-3.6-7H6z')+F('M12 3h8l10 18h-8z',B)+F('M5.5 21h24.5l-4.5 8H1z',W),
  translate:R(3,5,16,16,2)+R(14,12,15,16,2,B)+S('M7 10h10m-5-3v11m-4-5q4 5 8 6m1-6q-3 5-7 7',1.8)+S('m18 24 4-8 4 8m-6.8-2h5.6',1.8,V),
  'task-manager':R(4,4,24,24,3)+S('M8 23V16m5 7V11m5 12V8m5 15v-9',3,V),
  feedback:F('M4 5h24v17H16l-9 6v-6H4z')+S('m12 14 3 3 6-7',2.6,V),
  'lolite-hub':O(16,16,4)+O(16,4.5,3,B)+O(27,16,3,B)+O(16,27.5,3,B)+O(5,16,3,B)+S('M16 8v4m4 4h4m-8 4v4m-8-8h4',2.5,W),
  run:F('M21 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z')+S('m14 11 5 3 6-2M19 14l-3 7-7 7m7-7 7 7m-9-17-5 6-4 1',2.8,W),
  maps:F('M16 2.5a11 11 0 0 1 11 11c0 8-11 16-11 16s-11-8-11-16a11 11 0 0 1 11-11z')+O(16,13.5,5,V)+O(16,13.5,2.5,B),
  extras:O(8,8,5,B)+O(24,8,5)+O(8,24,5)+O(24,24,5,B),
  autoclick:F('M7 3v25l6-7 5 9 4-2-5-9h9z')+S('M21 4v5m-5-3 3 4m7 1-5 2',2.1,W),
  arcade:R(4,11,24,16,4)+S('M11 15v8m-4-4h8',2.3,V)+O(22,17,2,V)+O(25,21,2,V)+S('M10 11V6m-3 0h6',2,W),
  'feature-request':F('M4 5h24v17H15l-8 6v-6H4z')+S('M11 14h10m-5-5v10',2.6,V),
  'sandstone-browser':O(16,16,12)+S('M7 21q5-10 17-11M6 15q9 2 19-1',2.3,V)+O(20.5,19,4,B)
 });
 const aliases=Object.freeze({
  'app-home':'home','app-games':'games','game-store':'games',
  'app-scramjet':'scramjet','scramjet-browser':'scramjet',
  'app-ai':'lowlight-ai','lolite-ai':'lowlight-ai',
  'app-notepad':'notes','notepad':'notes','quick-notes':'notes',
  'app-terminal':'terminal','app-calculator':'calculator','app-paint':'paint',
  'app-wallpaper':'wallpaper-editor','app-clock':'clock','app-widgets':'widgets',
  'app-battery':'battery','app-capture':'capture','screen-capture':'capture',
  'app-utilities':'utilities','app-academy':'academy','lolite-academy':'academy',
  'app-minecraft18':'minecraft18','minecraft':'minecraft18','minecraft-1.8':'minecraft18','eaglercraft':'minecraft18',
  'world-sandbox':'world','hardware-guide':'guide','app-cloud-gaming':'cloud-gaming',
  'app-life-rp':'life-rp','lolite-life-rp':'life-rp','app-quests':'quests','lolite-quests':'quests','app-focus':'focus',
  'videoeditor':'video-editor','pitchroom':'voice-call','voice-calls':'voice-call',
  'app-updates':'updates','app-news':'news','app-autoclicker':'autoclick','auto-clicker':'autoclick',
  'arcade-shelf':'arcade','feature-requests':'feature-request','feedback-app':'feedback','sandstone':'sandstone-browser',
  'app-sandstone':'sandstone-browser'
 });
 function resolve(id){
   const raw=String(id||'').toLowerCase().trim(),key=aliases[raw]||raw;
   if(Object.prototype.hasOwnProperty.call(glyphs,key))return key;
   const resolved=previous.resolve?.(raw)||key;
   return aliases[resolved]||resolved;
 }
 // Keep pale logo highlights intact, but expose real accent paths as a CSS colour.
 // This recolours SVG ink itself instead of applying a hue filter to the whole logo.
 function themedGlyph(svg){
  return svg.replace(/(fill|stroke)="#([0-9a-f]{6})"/gi,(all,prop,hex)=>{
   const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
   return b>r*1.15&&b>g*1.15&&r<190&&g<190
    ?'style="'+prop+':var(--lic-symbol-color,#'+hex+')"':all;
  });
 }
 function tile(id){
   const key=resolve(id);
   if(!Object.prototype.hasOwnProperty.call(glyphs,key))return previous.tile(id);
   return '<span class="lolite-icon lolite-icon--'+key+' lolite-icon--brand-real" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">'+themedGlyph(glyphs[key])+'</svg></span>';
 }
 window.LoliteIcons=Object.freeze({
   tile,resolve,
   names:Object.freeze([...new Set([...(previous.names||[]),...Object.keys(glyphs)])]),
   classic:previous.classic||previous
 });
})();