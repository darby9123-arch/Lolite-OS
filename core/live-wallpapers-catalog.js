/* Built-in original live wallpaper scenes: no downloads or third-party video dependencies. */
(()=>{
 'use strict';
 const presets=[["deep-orbit","Deep Orbit","Space","orbit","#020713","#112957","#6eafff","#d9f5ff"],["starfield","Infinite Starfield","Space","stars","#030916","#0c2750","#8bbcff","#edf8ff"],["nebula-violet","Violet Nebula","Space","nebula","#120820","#302068","#ad82ff","#f6c1ff"],["nebula-crimson","Crimson Nebula","Space","nebula","#170a12","#5a1733","#f58ca5","#ffc7a9"],["meteor-shower","Meteor Shower","Space","meteor","#050c21","#0e234d","#9ab9ff","#edf4ff"],["galactic-drift","Galactic Drift","Space","galaxy","#07091f","#251f6a","#ad9cff","#f2f2ff"],["solar-flare","Solar Flare","Space","solar","#20070c","#7d241a","#ffb05a","#ffe1ac"],["aurora-blue","Arctic Aurora","Nature","aurora","#061b2c","#123d57","#70def1","#a2ffe6"],["aurora-green","Northern Lights","Nature","aurora","#031a20","#094542","#56eec7","#c0ffe0"],["aurora-violet","Polar Glow","Nature","aurora","#120d2d","#263b75","#c089ff","#85e5ff"],["ocean-blue","Ocean Flow","Nature","waves","#041b2e","#124c70","#58c0e4","#c5faff"],["midnight-tide","Midnight Tide","Nature","waves","#050f27","#183a70","#9dc2ff","#e4f2ff"],["turquoise-sea","Turquoise Current","Nature","waves","#052730","#11616d","#60ddd5","#d5fff4"],["mountain-fog","Mountain Fog","Nature","mist","#172435","#486378","#9db8d0","#e1f4ff"],["pink-sky","Pink Sky","Nature","clouds","#32142d","#aa587b","#ffb0c5","#ffe2c6"],["sunset-horizon","Sunset Horizon","Nature","clouds","#25142c","#a74859","#ffb06f","#ffe7bb"],["forest-fireflies","Forest Fireflies","Nature","fireflies","#061c17","#134b3b","#b1e58b","#ffffcd"],["gentle-snow","Snowfall","Nature","snow","#10263a","#406d8b","#c5e9ff","#ffffff"],["rainy-window","Rainy Window","City","rain","#101626","#30435f","#99b8d7","#e2edf9"],["neon-rain","Neon Rain","City","rain","#0b1125","#3e2565","#f277dd","#79d9ff"],["city-at-night","City at Night","City","city","#0b1028","#1f2d5c","#b696fd","#88d7ff"],["cyber-grid","Cyber Grid","Neon","grid","#061426","#103959","#45caff","#b2f9ff"],["synthwave-drive","Synthwave Drive","Neon","grid","#190b29","#6d2c77","#f787d3","#ffe59e"],["digital-rain","Digital Rain","Neon","matrix","#061b17","#0c3b36","#51eab2","#d2ffef"],["electric-cyan","Electric Cyan","Abstract","contour","#061b28","#165370","#55deee","#ccfdff"],["liquid-violet","Liquid Violet","Abstract","liquid","#140e30","#54347a","#b794ff","#f4ceff"],["liquid-silver","Liquid Silver","Abstract","liquid","#16202a","#4e677a","#bdd5e6","#ffffff"],["holographic-waves","Holographic Waves","Abstract","contour","#08142c","#244785","#8ac0ff","#e5e5ff"],["soft-bokeh","Soft Bokeh","Abstract","bokeh","#0e1432","#39346c","#d6aaff","#f6cfee"],["embers","Floating Embers","Abstract","embers","#230e11","#693027","#ff9b61","#ffdea4"],["golden-sparks","Golden Sparks","Abstract","embers","#1b1017","#72462b","#ffd078","#fff0cd"],["prism-flow","Prism Flow","Abstract","prism","#091429","#352f70","#68ccf9","#f4a4ff"],["cosmic-dust","Cosmic Dust","Space","particles","#061126","#25375f","#c8baff","#f5f3ff"],["violet-dream","Violet Dream","Abstract","prism","#180e2c","#633e73","#d4a5ff","#ffd9f0"],["winter-night","Winter Night","Nature","snow","#09142a","#21446c","#85bae8","#d9f4ff"],["misty-lake","Misty Lake","Nature","mist","#102c38","#3f667c","#a2ced9","#e3f7f4"]];
 const sceneArt=(scene,a,b,c,d,index)=>{
  const lines=(path,stroke,opacity=.5,width=2)=>'<path d="'+path+'" fill="none" stroke="'+stroke+'" opacity="'+opacity+'" stroke-width="'+width+'"/>';
  const circles=Array.from({length:34},(_,i)=>{
   const x=(i*79+index*37)%640,y=(i*43+index*19)%360,r=1+(i%4);
   return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(i%2?d:c)+'" opacity="'+(.22+(i%5)*.1)+'"/>';
  }).join('');
  let illustration='';
  if(/orbit|solar/.test(scene))illustration='<circle cx="402" cy="156" r="110" fill="'+c+'" opacity=".09"/><circle cx="402" cy="156" r="58" fill="'+c+'" opacity=".5"/><ellipse cx="402" cy="156" rx="196" ry="61" fill="none" stroke="'+d+'" stroke-width="3" opacity=".6" transform="rotate(-19 402 156)"/>';
  else if(/stars|meteor|galaxy|nebula|particles/.test(scene))illustration=circles+'<ellipse cx="328" cy="158" rx="245" ry="68" fill="'+c+'" opacity=".1" transform="rotate(-24 328 158)"/>';
  else if(/aurora|clouds|mist/.test(scene))illustration='<path d="M0 244 Q120 100 250 180 T640 80 L640 360 H0 Z" fill="'+c+'" opacity=".19"/><path d="M0 330 Q110 180 260 235 T640 150 L640 360 H0 Z" fill="'+d+'" opacity=".15"/>';
  else if(/waves|liquid|contour|prism/.test(scene))illustration=Array.from({length:8},(_,i)=>lines('M-30 '+(160+i*25)+' Q145 '+(70+i*18)+' 320 '+(170+i*23)+' T675 '+(160+i*22),i%2?d:c,.18+i*.065,2+i*.4)).join('');
  else if(/grid|city|matrix/.test(scene))illustration=Array.from({length:13},(_,i)=>lines('M'+(i*65-30)+' 360 L320 190',c,.42,1.5)).join('')+Array.from({length:7},(_,i)=>lines('M0 '+(210+i*i*4)+' H640',d,.18+i*.045)).join('');
  else if(/rain|snow|fireflies|bokeh|embers/.test(scene))illustration=circles+Array.from({length:16},(_,i)=>lines('M'+((i*49)%640)+' '+((i*31)%360)+' l-9 45',d,.12+i*.017,1)).join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs>'+
   '<linearGradient id="bg" x2=".9" y2="1"><stop stop-color="'+a+'"/><stop offset=".55" stop-color="'+b+'"/><stop offset="1" stop-color="'+a+'"/></linearGradient>'+
   '<radialGradient id="gl"><stop stop-color="'+c+'" stop-opacity=".6"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient></defs>'+
   '<rect width="640" height="360" fill="url(#bg)"/><ellipse cx="380" cy="150" rx="320" ry="230" fill="url(#gl)"/>'+illustration+
   '<rect width="640" height="360" fill="none" stroke="'+d+'" stroke-opacity=".11"/></svg>';
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
 };
 const catalog=Object.freeze(presets.map(([slug,name,category,scene,a,b,c,d],index)=>{
  const poster=sceneArt(scene,a,b,c,d,index);
  return Object.freeze({id:'live-'+slug,name,category,scene,motion:scene,
   palette:Object.freeze([a,b,c,d]),seed:index+1,src:poster,poster,
   provider:'Lolite original · Live'});
 }));
 window.LoliteLiveWallpapers=Object.freeze({catalog,version:1});
})();
