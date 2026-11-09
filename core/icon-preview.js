/* Original Lolite icon gallery. Independent preview page only. */
(()=>{'use strict';
 const root=document.getElementById('iconGrid'),api=window.LoliteIcons;
 if(!root||!api)return;
 const labels={"appstore":"App Store","chatroom":"Lolite Chat","lowlight-ai":"Lolite AI","scramjet":"Scramjet","minecraft18":"Minecraft 1.8","life-rp":"Life RP","cloud-gaming":"Cloud Gaming","wallpaper-editor":"Wallpaper Editor","capture":"Screen Capture","autoclick":"Auto Clicker","voice-call":"Voice Call","video-editor":"Video Editor"};
 for(const key of api.names){
  const card=document.createElement('article');card.className='card';
  const title=document.createElement('strong');title.textContent=labels[key]||key.replace(/-/g,' ').replace(/\b\w/g,s=>s.toUpperCase());
  const art=document.createElement('div');art.innerHTML=api.tile(key);
  card.append(...Array.from(art.childNodes),title);root.append(card);
 }
})();
