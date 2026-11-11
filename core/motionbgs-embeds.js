/* Remote MotionBGS stream collection. Never stores or republishes their MP4s. */
(()=>{'use strict';
 const ITEMS=[["black-hole-in-outer-space","Black Hole in Outer Space","Space","3277",true],["lost-space","Lost Space","Space","7002",true],["overseas","Overseas","Nature","7436",true],["ocean-from-above","Ocean From Above","Nature","4011",true],["ocean-waves","Ocean Waves","Nature","3648",true],["cyberpunk-cityscape","Cyberpunk Cityscape","City","4200",true],["retro-cyberpunk","Retro Cyberpunk","City","3610",true],["pixel-cyberpunk-city","Pixel Cyberpunk City","City","4227",true],["nissan-in-heavy-rain","Nissan in Heavy Rain","Cars","6196",true],["retro-nissan","Retro Nissan","Cars","5739",true],["nissan-r32","Nissan R32","Cars","704",true],["windows-glitch","Windows Glitch","Abstract","5781",true],["windows-11","Windows 11","Abstract","715",true],["hacker-desktop","Hacker Desktop","Technology","4799",false],["brain-interface","Brain Interface","Technology","2976",true],["beneath-the-headlines","Beneath the Headlines","Nature","9519",false]];
 const colours={Space:['#071126','#243e70','#80baff'],Nature:['#051d26','#156877','#93e1d9'],City:['#130e2c','#52356d','#fd81dc'],Cars:['#141626','#3f5480','#d9a5fa'],Abstract:['#121927','#405b88','#a7d3ff'],Technology:['#07171d','#176578','#85e7ff']};
 function preview(group,title){
  const [a,b,c]=colours[group]||colours.Abstract;
  const lines=Array.from({length:8},(_,i)=>'<path d="M-30 '+(80+i*44)+' Q170 '+(20+i*25)+' 330 '+(135+i*25)+' T690 '+(80+i*40)+'" stroke="'+c+'" opacity="'+(.07+i*.018).toFixed(3)+'" stroke-width="2" fill="none"/>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" aria-label="MotionBGS thumbnail placeholder"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="'+a+'"/><stop offset=".6" stop-color="'+b+'"/><stop offset="1" stop-color="'+a+'"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/>'+lines+'<circle cx="498" cy="120" r="97" fill="'+c+'" opacity=".10"/><path d="M299 142l0 80 70-40z" fill="'+c+'" opacity=".6"/><text x="28" y="309" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="27">MOTIONBGS</text><text x="28" y="333" fill="'+c+'" font-family="sans-serif" font-size="13">Remote animated wallpaper · '+group+'</text></svg>';
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
 }
 const catalog=Object.freeze(ITEMS.map(([slug,name,group,id,has4k])=>{
  const poster=preview(group,name);
  return Object.freeze({
   id:'motionbgs-'+slug,name,category:'Embedded Wallpapers',categories:['Embedded Wallpapers'],
   group,tags:[group.toLowerCase(),'motionbgs','embedded','live','remote'],
   provider:'MotionBGS · Remote Embed',embedded:true,
   source:'https://motionbgs.com/'+slug,src:poster,poster,
   video:'https://motionbgs.com/dl/hd/'+id,
   ...(has4k?{src4k:'https://motionbgs.com/dl/4k/'+id}:{}),
   src1080:'https://motionbgs.com/dl/hd/'+id,
   width:1920,height:1080,resolution:has4k?'4K / HD':'HD'
  });
 }));
 window.LoliteMotionBGSEmbeds=Object.freeze({catalog,version:'motionbgs-remote-20261112',source:'https://motionbgs.com'});
})();