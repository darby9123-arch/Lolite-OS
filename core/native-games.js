/* Lolite Native Arcade — 3 original, self-contained canvas games.
 * No iframes, web proxies or remotely downloaded game code are used.
 */
(()=>{
"use strict";
const WIDTH=960, HEIGHT=520;
const CATALOG=Object.freeze([
 {file:"native-pulse-run",title:"Pulse Run",category:"Music & Rhythm",native:true,source:"Lolite OS",description:"An original one-button neon obstacle runner."},
 {file:"native-neon-paddle",title:"Neon Paddle",category:"Arcade & Action",native:true,source:"Lolite OS",description:"An original paddle match against the computer."},
 {file:"native-circuit-snake",title:"Circuit Snake",category:"Retro & Classics",native:true,source:"Lolite OS",description:"Collect energy cells and grow your snake."}
]);
const GAMES=new Map(CATALOG.map(entry=>[entry.file,entry]));
const safeRead=id=>{try{return Math.max(0,Number(localStorage.getItem("lolite-native-best-"+id)||0)||0)}catch{return 0}};
const safeWrite=(id,value)=>{try{localStorage.setItem("lolite-native-best-"+id,String(value))}catch{}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rand=(a,b)=>a+(b-a)*Math.random();
const rect=(ctx,x,y,w,h,color,shadow=0)=>{
 ctx.save();ctx.fillStyle=color;if(shadow){ctx.shadowColor=color;ctx.shadowBlur=shadow}
 ctx.fillRect(x,y,w,h);ctx.restore();
};
function text(ctx,message,x,y,size=22,color="#f4f8ff",align="left"){
 ctx.fillStyle=color;ctx.font="700 "+size+"px system-ui,Segoe UI,sans-serif";
 ctx.textAlign=align;ctx.fillText(message,x,y);
}
function background(ctx,t,accent="#35b4ff"){
 const gradient=ctx.createLinearGradient(0,0,WIDTH,HEIGHT);
 gradient.addColorStop(0,"#091a2a");gradient.addColorStop(.55,"#10172d");gradient.addColorStop(1,"#130f29");
 ctx.fillStyle=gradient;ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle=accent;ctx.lineWidth=1;
 const offset=(t*19)%42;
 for(let x=offset;x<WIDTH;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,HEIGHT);ctx.stroke()}
 for(let y=offset;y<HEIGHT;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke()}
 ctx.restore();
}
function overlay(ctx,heading,description){
 ctx.fillStyle="#060b19bf";ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.save();ctx.textAlign="center";
 text(ctx,heading,WIDTH/2,HEIGHT/2-15,42,"#eef2ff","center");
 text(ctx,description,WIDTH/2,HEIGHT/2+36,19,"#b7c8e9","center");
 ctx.restore();
}
function pulse(){
 const id="native-pulse-run",GROUND=HEIGHT-85,SIZE=42,PLAYER_X=145;
 let t=0,score=0,best=safeRead(id),state="ready",y=GROUND-SIZE,vy=0,spawn=.65,speed=360,obstacles=[],grounded=true;
 function restart(){t=0;score=0;state="ready";y=GROUND-SIZE;vy=0;spawn=.6;speed=360;obstacles=[];grounded=true}
 function finish(){state="over";if(score>best){best=score;safeWrite(id,best)}}
 function act(){
  if(state==="over")restart();
  if(state==="ready")state="running";
  if(state==="running"&&grounded){vy=-680;grounded=false}
 }
 function update(dt){
  if(state!=="running")return;
  t+=dt;speed=Math.min(670,360+t*8);
  vy+=1750*dt;y+=vy*dt;
  if(y>=GROUND-SIZE){y=GROUND-SIZE;vy=0;grounded=true}
  spawn-=dt;
  if(spawn<=0){
   const w=rand(25,38),h=rand(32,68);
   obstacles.push({x:WIDTH+20,w,h,passed:false});
   spawn=rand(.87,1.3)*(400/speed);
  }
  for(const o of obstacles){
   o.x-=speed*dt;
   if(!o.passed && o.x+o.w<PLAYER_X){o.passed=true;score+=10}
   if(PLAYER_X+SIZE-7>o.x+6&&PLAYER_X+7<o.x+o.w-4&&y+SIZE-5>GROUND-o.h+6&&y+5<GROUND){finish();break}
  }
  obstacles=obstacles.filter(o=>o.x+o.w>-20);
 }
 function draw(ctx){
  background(ctx,t,"#ed6f9b");
  rect(ctx,0,GROUND,WIDTH,3,"#6ed5fa",12);
  for(let i=0;i<20;i++){
   const x=(i*88-(t*speed*.5)%88+WIDTH)%WIDTH;
   rect(ctx,x,GROUND+18,50,3,"#293f66");
  }
  ctx.save();
  for(const o of obstacles){
   ctx.beginPath();ctx.moveTo(o.x,GROUND);ctx.lineTo(o.x+o.w/2,GROUND-o.h);ctx.lineTo(o.x+o.w,GROUND);ctx.closePath();
   ctx.fillStyle="#f277a0";ctx.shadowColor="#fa417f";ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;
  }
  ctx.translate(PLAYER_X+SIZE/2,y+SIZE/2);
  if(!grounded)ctx.rotate(clamp(vy/900,-.5,.5));
  rect(ctx,-SIZE/2,-SIZE/2,SIZE,SIZE,"#7bc7ff",13);
  rect(ctx,-SIZE/2+9,-SIZE/2+9,24,24,"#112f59");
  rect(ctx,-SIZE/2+15,-SIZE/2+14,5,5,"#cbf5ff");
  ctx.restore();
  text(ctx,"PULSE RUN",29,44,21,"#cbdcff");
  text(ctx,"SCORE "+score,29,82,16);
  text(ctx,"BEST "+best,WIDTH-29,44,16,"#afc1dd","right");
  if(state==="ready")overlay(ctx,"PULSE RUN","Press Space, Up or Jump to begin");
  if(state==="over")overlay(ctx,"RUN COMPLETE","Score "+score+"  ·  Press Space or Restart");
 }
 return {restart,update,draw,action:act,key(key){if([" ","ArrowUp","w","W"].includes(key))act()},help:"Press Space or ↑ to jump. Avoid the obstacles!",score:()=>score};
}
function paddle(){
 const id="native-neon-paddle";const PY=92,BALL=13;
 let t=0,score=0,best=safeRead(id),state="ready",left=HEIGHT/2-PY/2,right=HEIGHT/2-PY/2,bx=WIDTH/2,by=HEIGHT/2,vx=360,vy=175;
 let pressedUp=false,pressedDown=false;
 function serve(direction=1){
  bx=WIDTH/2;by=HEIGHT/2;vx=direction*340;vy=rand(-190,190);
  if(Math.abs(vy)<70)vy=90;
 }
 function restart(){t=0;score=0;left=HEIGHT/2-PY/2;right=HEIGHT/2-PY/2;state="ready";pressedUp=false;pressedDown=false;serve()}
 function action(){if(state==="over")restart();state="running"}
 function update(dt){
  if(state!=="running")return;
  t+=dt;
  const velocity=510*dt;
  if(pressedUp)left-=velocity;
  if(pressedDown)left+=velocity;
  left=clamp(left,18,HEIGHT-PY-18);
  const aiGoal=by-PY/2;
  right+=clamp(aiGoal-right,-320*dt,320*dt);
  right=clamp(right,18,HEIGHT-PY-18);
  bx+=vx*dt;by+=vy*dt;
  if(by<22){by=22;vy=Math.abs(vy)}
  if(by>HEIGHT-22){by=HEIGHT-22;vy=-Math.abs(vy)}
  if(bx-BALL<54&&bx>29&&by>left-7&&by<left+PY+7&&vx<0){
   bx=54+BALL;vx=Math.abs(vx)*1.06;vy+=(by-(left+PY/2))*4;
  }
  if(bx+BALL>WIDTH-54&&bx<WIDTH-28&&by>right-7&&by<right+PY+7&&vx>0){
   bx=WIDTH-54-BALL;vx=-Math.abs(vx)*1.06;vy+=(by-(right+PY/2))*4;
  }
  vy=clamp(vy,-510,510);
  if(bx<0){serve(1)}
  if(bx>WIDTH){score++;if(score>best){best=score;safeWrite(id,best)};serve(-1)}
  if(score>=7){state="over"}
 }
 function draw(ctx){
  background(ctx,t,"#59bfff");
  ctx.save();ctx.setLineDash([13,17]);ctx.strokeStyle="#8291b35a";ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(WIDTH/2,12);ctx.lineTo(WIDTH/2,HEIGHT-12);ctx.stroke();ctx.restore();
  rect(ctx,35,left,17,PY,"#78d7ff",17);
  rect(ctx,WIDTH-52,right,17,PY,"#ff99c6",17);
  ctx.save();ctx.beginPath();ctx.arc(bx,by,BALL,0,Math.PI*2);
  ctx.fillStyle="#f7ffff";ctx.shadowColor="#8ab8ff";ctx.shadowBlur=24;ctx.fill();ctx.restore();
  text(ctx,"NEON PADDLE",26,42,21,"#d8dfff");
  text(ctx,"POINTS "+score,26,80,16);
  text(ctx,"BEST "+best,WIDTH-27,42,16,"#b9c8dc","right");
  if(state==="ready")overlay(ctx,"NEON PADDLE","Press Space or Start · Move with ↑/↓ or W/S");
  if(state==="over")overlay(ctx,"YOU WIN!","7 points scored · Press Space or Restart");
 }
 function key(k,isDown){
  if(k==="ArrowUp"||k==="w"||k==="W")pressedUp=isDown;
  if(k==="ArrowDown"||k==="s"||k==="S")pressedDown=isDown;
  if(isDown&&k===" ")action();
 }
 function pointer(event,canvas){
  const rectBox=canvas.getBoundingClientRect();
  if(rectBox.height){const y=(event.clientY-rectBox.top)/rectBox.height*HEIGHT;left=clamp(y-PY/2,18,HEIGHT-PY-18)}
  if(state==="ready")action();
 }
 return {restart,update,draw,action,key,pointer,help:"Move with ↑/↓ or W/S (or drag). Score 7 points against the computer.",score:()=>score,
  direction:(dir,down)=>key(dir==="up"?"ArrowUp":"ArrowDown",down)};
}
function snake(){
 const id="native-circuit-snake",CELL=25,COLS=30,ROWS=16,OX=105,OY=64;
 let t=0,score=0,best=safeRead(id),state="ready",parts=[],food=null,dir={x:1,y:0},next={x:1,y:0},clock=0;
 const randomFood=()=>{
  const empty=[];
  for(let x=0;x<COLS;x++)for(let y=0;y<ROWS;y++)if(!parts.some(p=>p.x===x&&p.y===y))empty.push({x,y});
  return empty[Math.floor(Math.random()*empty.length)]||null;
 };
 function restart(){
  t=0;score=0;state="ready";dir={x:1,y:0};next={x:1,y:0};clock=0;
  parts=[{x:10,y:8},{x:9,y:8},{x:8,y:8}];food=randomFood();
 }
 function action(){if(state==="over")restart();state="running"}
 function turn(k){
  const nextDir={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}}[k];
  if(!nextDir)return;
  if(nextDir.x===-dir.x&&nextDir.y===-dir.y)return;
  next=nextDir;
  if(state==="ready")state="running";
 }
 function update(dt){
  if(state!=="running")return;
  t+=dt;clock+=dt;
  const interval=Math.max(.068,.14-score*.0005);
  if(clock<interval)return;
  clock=0;dir=next;
  const head={x:parts[0].x+dir.x,y:parts[0].y+dir.y};
  const eating=food&&head.x===food.x&&head.y===food.y;
  const tailIgnored=eating?parts:parts.slice(0,-1);
  if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||tailIgnored.some(p=>p.x===head.x&&p.y===head.y)){
   state="over";return;
  }
  parts.unshift(head);
  if(eating){
   score+=10;
   if(score>best){best=score;safeWrite(id,best)}
   food=randomFood();
   if(!food){state="over";return}
  }else parts.pop();
 }
 function draw(ctx){
  background(ctx,t,"#5bdfa8");
  rect(ctx,OX-4,OY-4,COLS*CELL+8,ROWS*CELL+8,"#12283a");
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
   rect(ctx,OX+x*CELL+1,OY+y*CELL+1,CELL-2,CELL-2,(x+y)%2?"#14263a":"#182b40");
  }
  if(food){
   ctx.beginPath();ctx.arc(OX+food.x*CELL+CELL/2,OY+food.y*CELL+CELL/2,CELL*.36,0,Math.PI*2);
   ctx.fillStyle="#ffc47e";ctx.shadowColor="#ffa54f";ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;
  }
  for(let i=parts.length-1;i>=0;i--){
   const part=parts[i];rect(ctx,OX+part.x*CELL+2,OY+part.y*CELL+2,CELL-4,CELL-4,i===0?"#c3ffe0":"#45d6a7",i===0?9:0);
  }
  text(ctx,"CIRCUIT SNAKE",24,43,21,"#c1ffe0");
  text(ctx,"SCORE "+score,OX+COLS*CELL+31,100,16);
  text(ctx,"BEST "+best,OX+COLS*CELL+31,132,15,"#b8c8d9");
  if(state==="ready")overlay(ctx,"CIRCUIT SNAKE","Use arrows or WASD to start moving");
  if(state==="over")overlay(ctx,"GAME OVER","Score "+score+" · Press Restart to try again");
 }
 function key(k,down){
  if(!down)return;
  if(k===" "){action();return}
  turn(k);
 }
 return {restart,update,draw,action,key,turn,help:"Use arrows or WASD to collect energy. Avoid walls and your tail.",score:()=>score};
}
const factories={"native-pulse-run":pulse,"native-neon-paddle":paddle,"native-circuit-snake":snake};
const STYLE=[
 ".native-arcade{height:100%;min-height:0;margin:-18px;display:flex;flex-direction:column;gap:12px;overflow:auto;background:#080e1a;color:#eff6ff;padding:18px;font:13px/1.5 system-ui,'Segoe UI',sans-serif}",
 ".native-arcade *{box-sizing:border-box}",
 ".native-arcade-header{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}",
 ".native-arcade-heading strong{font-size:18px;display:block;letter-spacing:-.3px}",
 ".native-arcade-heading small{font-size:11px;color:#91a7c4}",
 ".native-arcade-controls{display:flex;gap:8px;flex-wrap:wrap}",
 ".native-arcade button{font:600 12px system-ui;border:1px solid #4c658a;border-radius:8px;background:#1f314d;color:#eff6ff;padding:9px 13px;cursor:pointer}",
 ".native-arcade button:hover,.native-arcade button:focus-visible{background:#30496e}",
 ".native-arcade-stage{display:block;min-height:0;flex:1 0 auto;outline:none;max-height:calc(100% - 128px)}",
 ".native-arcade-stage:focus-visible{outline:2px solid #9abbff;outline-offset:4px}",
 ".native-arcade canvas{display:block;width:100%;height:auto;max-height:100%;aspect-ratio:960 / 520;object-fit:contain;background:#0d1628;border-radius:11px;border:1px solid #385070;touch-action:none}",
 ".native-arcade-hint{color:#aabed8;font-size:12px;line-height:1.6}",
 ".native-arcade-mobile{display:flex;gap:7px;flex-wrap:wrap}",
 ".native-arcade-mobile button{min-width:48px;touch-action:manipulation}",
 "@media(max-width:650px){.native-arcade{padding:10px;margin:-12px}.native-arcade-header{align-items:flex-start}.native-arcade button{padding:8px 10px}}"
].join("\n");
const style=document.createElement("style");style.textContent=STYLE;document.head.append(style);
function open(file){
 const entry=GAMES.get(file);
 if(!entry)return false;
 const windowId="lolite-arcade-"+file;
 window.openApp(windowId,entry.title,1000,720);
 let tries=0;
 function mount(){
  const host=document.querySelector('.window[data-window-id="'+windowId+'"] .content');
  if(!host){if(++tries<30)setTimeout(mount,35);return}
  const existing=host.querySelector(".native-arcade");
  if(existing){existing.focus({preventScroll:true});return}
  host.innerHTML="";
  const root=document.createElement("section");
  root.className="native-arcade";root.tabIndex=0;
  root.setAttribute("aria-label",entry.title+" native game");
  root.innerHTML='<header class="native-arcade-header"><div class="native-arcade-heading"><strong></strong><small>Native Lolite game · no external embed</small></div>'+
    '<div class="native-arcade-controls"><button type="button" data-game-action="start">Start</button><button type="button" data-game-action="restart">Restart</button>'+
    '<button type="button" data-game-action="pause">Pause</button><button type="button" data-game-action="fullscreen">Fullscreen</button></div></header>'+
    '<div class="native-arcade-stage" tabindex="0"><canvas width="'+WIDTH+'" height="'+HEIGHT+'" aria-label="'+entry.title+' game board"></canvas></div>'+
    '<div class="native-arcade-hint" role="status"></div><div class="native-arcade-mobile"></div>';
  host.append(root);
  const canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d");
  if(!ctx){root.querySelector(".native-arcade-hint").textContent="Canvas is not available in this browser.";return}
  root.querySelector(".native-arcade-heading strong").textContent=entry.title;
  const game=factories[file]();
  game.restart();
  root.querySelector(".native-arcade-hint").textContent=game.help;
  const mobile=root.querySelector(".native-arcade-mobile");
  const buttons=file==="native-circuit-snake"?[["↑","ArrowUp"],["←","ArrowLeft"],["↓","ArrowDown"],["→","ArrowRight"]]:
    file==="native-neon-paddle"?[["↑ Up","ArrowUp"],["↓ Down","ArrowDown"]]:[["JUMP"," "]];
  let paused=false,latest=performance.now(),raf=0;
  function control(key,isDown){
   if(key==="Escape")return;
   if(game.key)game.key(key,isDown);
   if(!isDown&&key===" "&&file==="native-pulse-run")return;
  }
  for(const [label,key] of buttons){
   const b=document.createElement("button");b.type="button";b.textContent=label;
   b.setAttribute("aria-label",label+" control");
   b.addEventListener("pointerdown",event=>{event.preventDefault();control(key,true);root.focus({preventScroll:true})});
   b.addEventListener("pointerup",()=>control(key,false));
   b.addEventListener("pointercancel",()=>control(key,false));
   mobile.append(b);
  }
  const keys=new Set([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"]);
  root.addEventListener("keydown",event=>{
   if(!keys.has(event.key))return;
   event.preventDefault();
   if(event.repeat&&file==="native-pulse-run")return;
   control(event.key,true);
  });
  root.addEventListener("keyup",event=>{if(keys.has(event.key)){event.preventDefault();control(event.key,false)}});
  canvas.addEventListener("pointerdown",event=>{
   root.focus({preventScroll:true});
   if(file==="native-pulse-run")game.action();
   else if(file==="native-neon-paddle")game.pointer(event,canvas);
  });
  canvas.addEventListener("pointermove",event=>{
   if(file==="native-neon-paddle"&&event.buttons)game.pointer(event,canvas);
  });
  root.querySelector(".native-arcade-controls").addEventListener("click",event=>{
   const action=event.target.closest("[data-game-action]")?.dataset.gameAction;
   if(!action)return;
   if(action==="start"){paused=false;game.action()}
   if(action==="restart"){game.restart();paused=false;game.action()}
   if(action==="pause"){paused=!paused;event.target.textContent=paused?"Resume":"Pause"}
   if(action==="fullscreen")root.requestFullscreen?.().catch(()=>{});
   root.focus({preventScroll:true});
  });
  function frame(now){
   if(!root.isConnected)return;
   const dt=Math.min(.04,Math.max(0,(now-latest)/1000));latest=now;
   if(!paused&&!document.hidden)game.update(dt);
   game.draw(ctx);
   if(paused)overlay(ctx,"PAUSED","Click Resume to continue");
   raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  root.focus({preventScroll:true});
 }
 mount();
 return true;
}
window.LoliteNativeGames=Object.freeze({
 catalog:CATALOG,isNative:file=>GAMES.has(file),open
});
})();