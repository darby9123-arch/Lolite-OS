/* Interactive Lolite wallpaper effects. Original canvas scenes; no embedded video. */
(()=>{'use strict';
 const TAU=Math.PI*2,fract=n=>n-Math.floor(n);
 const particles=(i,seed)=>({x:fract(i*.754877666+seed*.063),y:fract(i*.569840296+seed*.1),z:.23+fract(i*.438103+seed*.19)*.76});
 const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+Math.max(0,Math.min(1,a))+')'};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const PRESETS=[["gravity-well","Gravity Well","gravity","#040d23","#173a65","#70ccff","#ecf7ff"],["magnetic-stars","Magnetic Stars","gravity","#0b0c2c","#34307a","#ae9bff","#eff0ff"],["liquid-cursor","Liquid Cursor","liquid","#071c2d","#125d74","#49e5e4","#e2ffff"],["violet-liquid","Violet Liquid","liquid","#180f32","#593276","#ce8eff","#f7d8ff"],["water-ripples","Water Ripples","ripple","#061b2d","#185170","#76daec","#dffcff"],["moonlit-pond","Moonlit Pond","ripple","#10162f","#343b6c","#b0bfff","#e7efff"],["neon-grid-3d","Neon Grid 3D","grid","#070e29","#253b65","#40e4ff","#9ff9ff"],["retro-grid","Retro Grid","grid","#230b36","#60357f","#ff79d1","#ffe9a4"],["constellation","Interactive Constellations","constellation","#060b20","#243963","#83b5ff","#f7fcff"],["celestial-map","Celestial Map","constellation","#081821","#20545a","#82eece","#e4fff5"],["nebula-portal","Nebula Portal","portal","#0c0c30","#453985","#c089ff","#f5d3ff"],["cosmic-vortex","Cosmic Vortex","portal","#06142b","#164b7f","#66d2ff","#d6f3ff"],["electric-field","Electric Field","electric","#071528","#15526c","#5eeafa","#e0feff"],["plasma-storm","Plasma Storm","electric","#1c102d","#643b76","#df8dff","#ffe5f9"],["firefly-garden","Firefly Garden","fireflies","#061a16","#164837","#abf297","#f5ffd0"],["golden-dust","Golden Dust","fireflies","#1d1319","#734e38","#ffd483","#fff1d1"]];
 const preview=(scene,palette,index)=>{
  const [dark,mid,accent,light]=palette;
  let shapes='';
  if(scene==='gravity'||scene==='constellation'){
   shapes=Array.from({length:38},(_,i)=>{
    const p=particles(i,index+2);
    return '<circle cx="'+Math.round(p.x*640)+'" cy="'+Math.round(p.y*360)+'" r="'+(1+p.z*2).toFixed(1)+'" fill="'+light+'" opacity="'+(.35+p.z*.5).toFixed(2)+'"/>';
   }).join('')+'<circle cx="340" cy="170" r="70" fill="none" stroke="'+accent+'" opacity=".5"/>';
  }else if(scene==='liquid'||scene==='ripple'){
   shapes=Array.from({length:11},(_,i)=>'<path d="M-20 '+(120+i*17)+' C130 '+(20+i*13)+' 290 '+(255-i*10)+' 680 '+(95+i*16)+'" fill="none" stroke="'+(i%2?accent:light)+'" stroke-width="'+(1+i*.5)+'" opacity="'+(.1+i*.052)+'"/>').join('');
  }else if(scene==='grid'){
   shapes=Array.from({length:15},(_,i)=>'<path d="M320 168 L'+(i*65-100)+' 375" stroke="'+accent+'" opacity=".4"/>').join('')+
    Array.from({length:10},(_,i)=>'<path d="M0 '+(172+i*i*2.4)+' H640" stroke="'+light+'" opacity=".3"/>').join('');
  }else if(scene==='portal'||scene==='electric'){
   shapes=Array.from({length:11},(_,i)=>'<ellipse cx="340" cy="175" rx="'+(30+i*22)+'" ry="'+(20+i*11)+'" fill="none" stroke="'+(i%2?accent:light)+'" opacity="'+(.6-i*.04)+'" stroke-width="'+(1+i*.1)+'" transform="rotate(-19 340 175)"/>').join('');
  }else{
   shapes=Array.from({length:55},(_,i)=>{const p=particles(i,index+8);return '<circle cx="'+Math.round(p.x*640)+'" cy="'+Math.round(p.y*360)+'" r="'+(2+p.z*4)+'" fill="'+accent+'" opacity="'+(.16+p.z*.6)+'"/>'}).join('');
  }
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">'+
   '<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="'+dark+'"/><stop offset=".55" stop-color="'+mid+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient>'+
   '<radialGradient id="r"><stop stop-color="'+accent+'" stop-opacity=".45"/><stop offset="1" stop-color="'+accent+'" stop-opacity="0"/></radialGradient></defs>'+
   '<rect width="640" height="360" fill="url(#g)"/><ellipse cx="360" cy="155" rx="265" ry="180" fill="url(#r)"/>'+shapes+'</svg>';
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
 };
 const catalog=Object.freeze(PRESETS.map(([slug,name,kind,...palette],i)=>{
  const poster=preview(kind,palette,i);
  return Object.freeze({id:'interactive-'+slug,name,category:'Interactive',scene:'interactive-'+kind,
   kind,seed:i+54,palette:Object.freeze(palette),poster,src:poster,provider:'Lolite Original Interactive'});
 }));
 function strokes(ctx,w,h,t,p,kind,cursor){
  const x=cursor.x*w,y=cursor.y*h,intensity=cursor.strength;
  for(let j=0;j<(kind==='electric'?21:14);j++){
   ctx.beginPath();
   const phase=j*.63;
   for(let k=0;k<=72;k++){
    const u=k/72,xx=u*w;
    const bend=Math.sin(u*(kind==='electric'?28:11)+t*.62+phase)*(kind==='electric'?27:53);
    const yy=(.22+j*.038)*h+bend+Math.sin(u*17-t*.31+j)*17;
    const near=Math.exp(-((xx-x)**2+(yy-y)**2)/(Math.max(w,h)**2*.13));
    const shifted=yy+Math.sin(t+phase+u*12)*near*38*intensity;
    if(k===0)ctx.moveTo(xx,shifted);else ctx.lineTo(xx,shifted);
   }
   ctx.strokeStyle=rgba(j%3?p[2]:p[3],.09+j*.015);
   ctx.lineWidth=kind==='electric'?.65+j*.12:1.4+j*.3;
   ctx.stroke();
  }
  if(kind==='electric'){
   ctx.lineWidth=2;
   for(let j=0;j<9;j++){
    const a=j*TAU/9+t*.26,r=(35+j*6)+Math.sin(t+j)*8;
    ctx.beginPath();ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+Math.cos(a+.5)*r*2,y+Math.sin(a+.5)*r*1.2,
     x+Math.cos(a)*r*3,y+Math.sin(a)*r*2);
    ctx.strokeStyle=rgba(p[3],.08+intensity*.25);ctx.stroke();
   }
  }
 }
 function rings(ctx,w,h,t,p,cursor){
  for(let j=0;j<15;j++){
   const cy=h*(.46+j*.025)+Math.sin(t*.31+j)*3;
   ctx.beginPath();
   for(let k=0;k<=100;k++){
    const xx=k*w/100,d=Math.abs(xx-cursor.x*w);
    const wave=Math.exp(-d/Math.max(w*.18,1))*Math.sin(d*.031-t*2+j*.42)*(8+cursor.strength*24);
    const yy=cy+Math.sin(xx*.008+t*.34+j*.7)*18+wave;
    if(k===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
   }
   ctx.strokeStyle=rgba(j%2?p[2]:p[3],.13+j*.009);
   ctx.lineWidth=1+j*.11;ctx.stroke();
  }
 }
 function stars(ctx,w,h,t,p,kind,cursor,seed){
  const count=kind==='fireflies'?130:kind==='gravity'?240:190;
  for(let i=0;i<count;i++){
   const a=particles(i+1,seed);
   let x=a.x*w,y=a.y*h;
   const dx=x-cursor.x*w,dy=y-cursor.y*h;
   const dist=Math.hypot(dx,dy)+.001;
   const reach=Math.min(w,h)*(kind==='gravity'?.45:.29);
   if(dist<reach){
    const influence=(1-dist/reach)**2*cursor.strength;
    if(kind==='gravity'){
     x-=dx*influence*.73;
     y-=dy*influence*.73;
    }else if(kind==='constellation'){
     x+=dx*influence*.16;
     y+=dy*influence*.16;
    }else {
     x+=Math.cos(t*.52+a.x*TAU)*influence*26;
     y+=Math.sin(t*.39+a.y*TAU)*influence*24;
    }
   }
   if(kind==='fireflies'){
    x+=Math.sin(t*.31+a.y*TAU)*16;
    y+=Math.cos(t*.23+a.x*TAU)*14;
   }else{
    x+=Math.sin(t*.1+a.y*TAU)*a.z*6;
    y+=Math.cos(t*.12+a.x*TAU)*a.z*6;
   }
   const opacity=.15+a.z*.55+(Math.sin(t*1.2+i)*.13);
   ctx.fillStyle=rgba(i%3?p[2]:p[3],opacity);
   ctx.beginPath();ctx.arc(x,y,.5+a.z*(kind==='fireflies'?2.8:1.55),0,TAU);ctx.fill();
   if(kind==='constellation'&&i<100){
    const b=particles((i+3)%count,seed);
    const xx=b.x*w,yy=b.y*h;
    if(Math.hypot(x-xx,y-yy)<Math.min(w,h)*.19){
     ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);
     ctx.lineWidth=.5;ctx.strokeStyle=rgba(p[2],.09);ctx.stroke();
    }
   }
  }
 }
 function spiral(ctx,w,h,t,p,cursor){
  const x=w*(.52+(cursor.x-.5)*.18),y=h*(.47+(cursor.y-.5)*.18);
  const size=Math.min(w,h);
  for(let arm=0;arm<7;arm++){
   ctx.beginPath();
   for(let i=0;i<=145;i++){
    const u=i/145,angle=arm*TAU/7+u*TAU*2.9+t*.12,rad=size*(.04+u*.56);
    const px=x+Math.cos(angle)*rad,py=y+Math.sin(angle)*rad*.62;
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
   }
   ctx.strokeStyle=rgba(arm%2?p[2]:p[3],.17+arm*.038);
   ctx.lineWidth=1.2+arm*.2;ctx.stroke();
  }
 }
 function mesh(ctx,w,h,t,p,cursor){
  const horizon=h*(.48+(cursor.y-.5)*.036),focus=w*(.5+(cursor.x-.5)*.14);
  for(let i=-16;i<=16;i++){
   ctx.beginPath();ctx.moveTo(focus,horizon);ctx.lineTo(focus+i*w*.095,h);
   ctx.lineWidth=1;ctx.strokeStyle=rgba(p[2],.12+cursor.strength*.08);ctx.stroke();
  }
  for(let j=0;j<24;j++){
   const u=((j/24+t*.039)%1),yy=horizon+(h-horizon)*u*u;
   ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy);
   ctx.strokeStyle=rgba(p[3],.05+u*.38);ctx.lineWidth=.7+u;ctx.stroke();
  }
 }
 function render(ctx,{wall,t,w,h,cursor}){
  const kind=wall.kind||wall.scene.replace('interactive-','');
  const p=wall.palette;
  const grad=ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0,p[0]);grad.addColorStop(.52,p[1]);grad.addColorStop(1,p[0]);
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(cursor.x*w,cursor.y*h,0,cursor.x*w,cursor.y*h,Math.max(w,h)*.53);
  glow.addColorStop(0,rgba(p[2],.14+cursor.strength*.09));
  glow.addColorStop(1,rgba(p[2],0));
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  if(kind==='gravity'||kind==='constellation'||kind==='fireflies')
   stars(ctx,w,h,t,p,kind,cursor,wall.seed);
  else if(kind==='ripple')
   rings(ctx,w,h,t,p,cursor);
  else if(kind==='grid')
   mesh(ctx,w,h,t,p,cursor);
  else if(kind==='portal')
   spiral(ctx,w,h,t,p,cursor);
  else if(kind==='electric'||kind==='liquid')
   strokes(ctx,w,h,t,p,kind,cursor);
 }
 // Subtle effects also work on ordinary built-in animated wallpapers.
 function overlay(ctx,{wall,t,w,h,cursor,ripples}){
  if(cursor.strength<=.001 && !ripples.length)return;
  const p=wall.palette||['#051526','#193f58','#62bfe9','#def9ff'];
  if(cursor.strength>.001){
   const x=cursor.x*w,y=cursor.y*h;
   const grad=ctx.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.23);
   grad.addColorStop(0,rgba(p[2],.09*cursor.strength));
   grad.addColorStop(1,rgba(p[2],0));
   ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  }
  for(const ripple of ripples){
   const age=t-ripple.at;
   if(age<0||age>2.4)continue;
   const radius=age*Math.min(w,h)*.21;
   ctx.beginPath();ctx.arc(ripple.x*w,ripple.y*h,radius,0,TAU);
   ctx.lineWidth=Math.max(.5,2.3-age*.5);
   ctx.strokeStyle=rgba(p[3],.27*(1-age/2.4)*ripple.power);
   ctx.stroke();
  }
 }
 window.LoliteInteractiveWallpapers=Object.freeze({catalog,render,overlay});
})();