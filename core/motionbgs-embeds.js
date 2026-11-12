/* Remote MotionBGS stream collection. Never stores or republishes their MP4s. */
(()=>{'use strict';
 const ITEMS=[["black-hole-in-outer-space","Black Hole in Outer Space","Space","3277",true],["lost-space","Lost Space","Space","7002",true],["overseas","Overseas","Nature","7436",true],["ocean-from-above","Ocean From Above","Nature","4011",true],["ocean-waves","Ocean Waves","Nature","3648",true],["cyberpunk-cityscape","Cyberpunk Cityscape","City","4200",true],["retro-cyberpunk","Retro Cyberpunk","City","3610",true],["pixel-cyberpunk-city","Pixel Cyberpunk City","City","4227",true],["nissan-in-heavy-rain","Nissan in Heavy Rain","Cars","6196",true],["retro-nissan","Retro Nissan","Cars","5739",true],["nissan-r32","Nissan R32","Cars","704",true],["windows-glitch","Windows Glitch","Abstract","5781",true],["windows-11","Windows 11","Abstract","715",true],["hacker-desktop","Hacker Desktop","Technology","4799",false],["brain-interface","Brain Interface","Technology","2976",true],["beneath-the-headlines","Beneath the Headlines","Nature","9519",false],["minecraft-sunset","Minecraft Sunset","Games","2978",true],["gta-4","GTA 4","Games","4144",true],["minecraft-sunset2","Minecraft Sunset2","Games","8302",true],["mysticlight","Mysticlight","Art & Fantasy","8892",true],["minecraft-sunset-farm","Minecraft Sunset Farm","Games","9266",true],["sunset-shader","Sunset Shader","Art & Fantasy","2438",false],["room-at-the-edge","Room At The Edge","Art & Fantasy","8819",true],["control","Control","Art & Fantasy","6375",true],["flowing-dots","Flowing Dots","Art & Fantasy","5582",true],["keep-going","Keep Going","Art & Fantasy","6252",true],["serenity","Serenity","Art & Fantasy","7644",true],["wriothesley","Wriothesley","Games","3990",true],["tech-hud","Tech HUD","Art & Fantasy","5329",true],["cloudscape","Cloudscape","Art & Fantasy","4606",true],["cloud-reflect","Cloud Reflect","Art & Fantasy","6355",true],["pixelated-embrace","Pixelated Embrace","Art & Fantasy","8435",true],["forest-sunset","Forest Sunset","Art & Fantasy","4295",true],["minecraft-in-the-night","Minecraft In The Night","Games","3668",true],["portal-in-minecraft","Portal In Minecraft","Games","1054",true],["enter-the-world-of-minecraft","Enter The World Of Minecraft","Games","895",true],["grand-theft-auto","Grand Theft Auto","Games","463",false],["gta-vi-welcome-to-vice-city","GTA VI Welcome To Vice City","Games","10466",true],["gta-5-night-city","GTA 5 Night City","Games","2534",true],["grand-theft-auto-vi","Grand Theft Auto Vi","Games","4298",true]];
 const colours={Space:['#071126','#243e70','#80baff'],Nature:['#051d26','#156877','#93e1d9'],City:['#130e2c','#52356d','#fd81dc'],Cars:['#141626','#3f5480','#d9a5fa'],Abstract:['#121927','#405b88','#a7d3ff'],Technology:['#07171d','#176578','#85e7ff']};
 function preview(group,title){
  const [a,b,c]=colours[group]||colours.Abstract;
  const lines=Array.from({length:8},(_,i)=>'<path d="M-30 '+(80+i*44)+' Q170 '+(20+i*25)+' 330 '+(135+i*25)+' T690 '+(80+i*40)+'" stroke="'+c+'" opacity="'+(.07+i*.018).toFixed(3)+'" stroke-width="2" fill="none"/>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" aria-label="MotionBGS thumbnail placeholder"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="'+a+'"/><stop offset=".6" stop-color="'+b+'"/><stop offset="1" stop-color="'+a+'"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/>'+lines+'<circle cx="498" cy="120" r="97" fill="'+c+'" opacity=".10"/><path d="M299 142l0 80 70-40z" fill="'+c+'" opacity=".6"/><text x="28" y="309" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="27">MOTIONBGS</text><text x="28" y="333" fill="'+c+'" font-family="sans-serif" font-size="13">Remote animated wallpaper · '+group+'</text></svg>';
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
 }
 const catalog=Object.freeze(ITEMS.map(([slug,name,group,id,has4k])=>{
  const poster=slug==='gta-4'?'https://motionbgs.com/media/4144/gta-4.jpg':preview(group,name);
  return Object.freeze({
   id:'motionbgs-'+slug,name,category:'Embedded Wallpapers',categories:['Embedded Wallpapers'],
   group,tags:[group.toLowerCase(),'motionbgs','embedded','live','remote'],
   provider:'MotionBGS · Remote Embed',embedded:true,
   source:'https://motionbgs.com/'+slug,src:poster,poster,
   video:'https://motionbgs.com/dl/'+(has4k?'4k/':'hd/')+id+'/',
   ...(has4k?{src4k:'https://motionbgs.com/dl/4k/'+id+'/'}:{}),
   src1080:'https://motionbgs.com/dl/hd/'+id+'/',
   ...(slug==='gta-4'?{preview:'https://motionbgs.com/media/4144/gta-4.960x540.mp4'}:{}),
   width:has4k?3840:1920,height:has4k?2160:1080,resolution:has4k?'4K':'HD'
  });
 }));
 window.LoliteMotionBGSEmbeds=Object.freeze({catalog,version:'motionbgs-remote-20261113',source:'https://motionbgs.com'});
})();