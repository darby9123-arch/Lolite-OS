/* Lolite OS Cosmos generated PNG icons.
 * Loads after core/app-icon-art.js to retain the existing SVG fallback.
 * All image paths are repository-local (GitHub Pages compatible).
 */
(()=>{'use strict';
  const base=window.LoliteIcons;
  if(!base)return;
  const ROOT='assets/icons/cosmos/selected/';
  const selected={"home":"home.png","files":"files.png","browser":"browser.png","scramjet":"scramjet.png","games":"games.png","appstore":"appstore.png","settings":"settings.png","chatroom":"chatroom.png","lowlight-ai":"lowlight-ai.png","terminal":"terminal.png","notes":"notes.png","calculator":"calculator.png","paint":"paint.png","wallpaper":"wallpaper.png","wallpaper-editor":"wallpaper-editor.png","minecraft18":"minecraft18.png","world":"world.png","clock":"clock.png","widgets":"widgets.png","battery":"battery.png","capture":"capture.png","utilities":"utilities.png","academy":"academy.png","guide":"guide.png","cloud-gaming":"cloud-gaming.png","life-rp":"life-rp.png","quests":"quests.png","sounds":"sounds.png","focus":"focus.png","music":"music.png","video-editor":"video-editor.png","voice-call":"voice-call.png","photos":"photos.png","videos":"videos.png","camera":"camera.png","calendar":"calendar.png","contacts":"contacts.png","weather":"weather.png","news":"news.png","mail":"mail.png","code":"code.png","youtube":"youtube.png","spotify":"spotify.png","discord":"discord.png","roblox":"roblox.png","github":"github.png","updates":"updates.png","power":"power.png","credits":"credits.png","about":"about.png","recycle-bin":"recycle-bin.png","system-info":"system-info.png","help":"help.png","drive":"drive.png","translate":"translate.png","docs":"docs.png","sheets":"sheets.png","slides":"slides.png","task-manager":"task-manager.png","feedback":"feedback.png","lolite-hub":"lolite-hub.png","run":"run.png","maps":"maps.png","extras":"extras.png"};
  const aliases={"app-home":"home","app-files":"files","file-explorer":"files","app-browser":"browser","ultraviolet":"browser","ultraviolet-browser":"browser","app-games":"games","game-store":"games","app-store":"appstore","app-settings":"settings","app-chat":"chatroom","lolite-chat":"chatroom","app-ai":"lowlight-ai","lolite-ai":"lowlight-ai","app-terminal":"terminal","app-notepad":"notes","notepad":"notes","quick-notes":"notes","app-calculator":"calculator","app-paint":"paint","app-wallpaper":"wallpaper-editor","app-clock":"clock","app-widgets":"widgets","app-battery":"battery","app-capture":"capture","screen-capture":"capture","app-utilities":"utilities","app-scramjet":"scramjet","scramjet-browser":"scramjet","app-minecraft18":"minecraft18","minecraft":"minecraft18","minecraft-1.8":"minecraft18","eaglercraft":"minecraft18","world-sandbox":"world","hardware-guide":"guide","hardware-acceleration-guide":"guide","app-academy":"academy","lolite-academy":"academy","course":"academy","app-life-rp":"life-rp","lolite-life-rp":"life-rp","app-life":"life-rp","app-cloud-gaming":"cloud-gaming","cloudgaming":"cloud-gaming","lolite-quests":"quests","app-quests":"quests","app-music":"music","lolite-music":"music","music-player":"music","videoeditor":"video-editor","pitchroom":"voice-call","voice-calls":"voice-call","app-focus":"focus","focus-board":"focus","app-youtube":"youtube","app-spotify":"spotify","app-discord":"discord","app-github":"github","app-updates":"updates","app-news":"news","feature-requests":"feedback","feature-request":"feedback","app-feature-requests":"feedback","clips":"video-editor","app-clips":"video-editor"};
  const escapeAttribute=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));
  // Artwork already contains its own rounded-square background and should
  // not get another glossy tile behind it.
  const css=`
    /* Centre the rendered artwork inside the actual icon box, not its surrounding text/line box. */
    .lolite-icon.lolite-icon--generated{display:inline-grid!important;place-items:center!important;flex:0 0 auto!important;vertical-align:middle;line-height:0!important;text-align:center!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;isolation:isolate;padding:0!important}
    .lolite-icon.lolite-icon--generated::before{display:none!important}
    .lolite-icon--generated .lolite-generated-png{display:block!important;position:static!important;justify-self:center!important;align-self:center!important;width:100%!important;height:100%!important;max-width:100%;max-height:100%;margin:0!important;padding:0!important;object-fit:contain!important;object-position:center center!important;border-radius:inherit;filter:none!important;transform:none!important}
    /* A centred icon keeps its own horizontal axis in desktop, mobile and gallery layouts. */
    #icons .desktop-icon > .lolite-icon--generated,
    .lm-app-icon > .lolite-icon--generated,
    .appstore-icon > .lolite-icon--generated{align-self:center!important;margin-inline:auto!important}
    #icons .desktop-icon{align-items:center!important;text-align:center!important}
    html[data-lolite-design="cosmos"] #icons .desktop-icon .lolite-icon--generated{background:transparent!important;border:0!important;box-shadow:none!important}
    html[data-lolite-design="cosmos"] #taskbar .lolite-icon--generated{background:transparent!important;border:0!important;box-shadow:none!important}
    html[data-lolite-design="cosmos"] .cosmos-tile .lolite-icon--generated{background:transparent!important;border:0!important;box-shadow:none!important}
  `;
  const style=document.createElement('style');style.id='lolite-generated-icon-styles';style.textContent=css;document.head.appendChild(style);
  function resolve(id){
    const idString=String(id||'').toLowerCase().trim();
    const alias=aliases[idString]||idString;
    if(Object.prototype.hasOwnProperty.call(selected,alias))return alias;
    const prior=base.resolve(idString);
    return Object.prototype.hasOwnProperty.call(selected,prior)?prior:prior;
  }
  function tile(id){
    const key=resolve(id);
    if(!Object.prototype.hasOwnProperty.call(selected,key))return base.tile(id);
    const filename=selected[key];
    // Keys and paths come from a fixed source-controlled object, not input text.
    return '<span class="lolite-icon lolite-icon--'+escapeAttribute(key)+' lolite-icon--generated" aria-hidden="true">'+
       '<img class="lolite-generated-png" src="'+ROOT+escapeAttribute(filename)+'" alt="" draggable="false" loading="eager" decoding="async"></span>';
  }

  // If a PNG is unavailable, retain the existing vector icon.
  document.addEventListener('error',event=>{
    const image=event.target;
    if(!image?.classList?.contains('lolite-generated-png'))return;
    const parent=image.closest('.lolite-icon--generated');
    const key=(image.getAttribute('src')||'').match(/\/([a-z0-9-]+)\.png(?:\?|$)/);
    if(parent&&key)parent.outerHTML=base.tile(key[1]);
  },true);
  window.LoliteIcons=Object.freeze({tile,resolve,names:Object.freeze([...new Set([...base.names,...Object.keys(selected)])]),classic:base});
})();