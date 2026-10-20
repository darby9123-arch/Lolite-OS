/* Lolite Life RP: arcade skill challenges. Inputs are mouse, touch and keyboard. */
(function(){
"use strict";
var active=null,W=760,H=400;
var pick=n=>Math.floor(Math.random()*n),rand=(a,b)=>a+Math.random()*(b-a),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
var C={bg:"#091a29",tile:"#1c3d55",cyan:"#68ddf7",white:"#eef7ff",green:"#6de7aa",gold:"#ffd16b",red:"#ff8093"};
function start(root,opts,done){
 if(active)active.stop();if(!root)return null;
 root.innerHTML='<div class="lrg-head"><strong class="lrg-title"></strong><span class="lrg-clock"></span></div><canvas class="lrg-board" width="760" height="400" tabindex="0"></canvas><p class="lrg-help"></p><div class="lrg-controls"></div>';
 var canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d"),title=root.querySelector(".lrg-title"),clock=root.querySelector(".lrg-clock"),help=root.querySelector(".lrg-help"),ctrl=root.querySelector(".lrg-controls");
 if(!ctx){root.textContent="This browser does not support Canvas.";return null}
 var mode=opts.mode||"target",hard=!!opts.advanced;
 var game={mode:mode,score:0,misses:0,total:hard?10:7,elapsed:0,last:performance.now(),limit:hard?24:31,done:false,raf:0};
 var st={};
 function text(s,x,y,size,color){ctx.fillStyle=color||C.white;ctx.font="700 "+(size||20)+"px system-ui";ctx.textAlign="center";ctx.fillText(String(s),x,y)}
 function box(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
 function base(){box(0,0,W,H,C.bg);for(var y=0;y<10;y++)box(0,y*40,W,1,"#173047")}
 function keyButton(label,v){var b=document.createElement("button");b.type="button";b.className="lrg-key";b.textContent=label;b.addEventListener("click",function(){action(v)});ctrl.appendChild(b)}
 function finish(ok){
  if(game.done)return;game.done=true;cancelAnimationFrame(game.raf);
  game.stop();base();text(ok?"CHALLENGE COMPLETE":"TRY AGAIN",W/2,180,36,ok?C.green:C.red);
  text(ok?"Your skill earned a reward.":"No payout or cooldown for an unsuccessful run.",W/2,230,17);
  if(typeof done==="function")done({success:!!ok,score:game.score,total:game.total,misses:game.misses});
 }
 game.stop=function(){cancelAnimationFrame(game.raf);canvas.removeEventListener("pointerdown",pointer);window.removeEventListener("keydown",key);if(active===game)active=null};
 if(mode==="target"){
  title.textContent="Moving Target";help.textContent="Catch the moving cyan orb. Watch out for the red decoy!";
  game.total=hard?13:9;game.limit=hard?21:25;st.x=360;st.y=180;st.vx=190;st.vy=145;
 }else if(mode==="precision"){
  title.textContent="Timing Lock";help.textContent="Tap or press SPACE when the moving marker is inside the green zone.";
  game.total=hard?9:6;game.limit=hard?25:29;st.phase=0;st.goal=rand(170,590);
 }else if(mode==="rhythm"){
  title.textContent="Rhythm Run";help.textContent="Press A S D F as notes reach the gold line. Missing too many fails the run.";
  game.total=hard?13:10;game.limit=hard?33:29;st.notes=Array.from({length:game.total},(_,i)=>({lane:pick(4),time:2+i*(hard?.73:.91),used:false}));
  ["A","S","D","F"].forEach((s,i)=>keyButton(s,i));
 }else if(mode==="memory"){
  title.textContent="Memory Flip";help.textContent="Find matching pairs before time runs out. Remember where the cards are.";
  game.total=hard?6:5;game.limit=hard?32:36;
  var icons=["★","◆","☀","☘","♬","✦"].slice(0,game.total);st.cards=icons.concat(icons);
  for(var i=st.cards.length-1;i>0;i--){var j=pick(i+1);[st.cards[i],st.cards[j]]=[st.cards[j],st.cards[i]]}
  st.flips=[];st.matched=new Set();st.hideAt=0;
 }else if(mode==="recipe"){
  title.textContent="Kitchen Rush";help.textContent="Follow the changing recipe steps. Tap kitchen stations or press 1 to 4.";
  game.total=hard?16:11;game.limit=hard?30:28;st.steps=Array.from({length:game.total},()=>pick(4));
  ["PREP","HEAT","PLATE","SERVE"].forEach((s,i)=>keyButton(s,i));
 }else{
  game.mode=mode="pattern";game.total=1;game.limit=hard?27:36;
  title.textContent="Maze Escape";help.textContent="Get to the green exit using WASD, arrow keys or tap a nearby square.";
  st.grid=Array.from({length:7},()=>Array(10).fill(1));
  function dig(x,y){st.grid[y][x]=0;var directions=[[2,0],[-2,0],[0,2],[0,-2]].sort(()=>Math.random()-.5);for(var d of directions){var a=x+d[0],b=y+d[1];if(a>0&&a<9&&b>0&&b<7&&st.grid[b][a]){st.grid[y+d[1]/2][x+d[0]/2]=0;dig(a,b)}}}
  dig(1,1);st.x=1;st.y=1;st.goal=[7,5];st.grid[5][7]=0;
  [["↑","up"],["←","left"],["↓","down"],["→","right"]].forEach(x=>keyButton(x[0],x[1]));
 }
 function action(n){
  if(game.done||document.hidden)return;
  if(mode==="precision"){
   var position=105+(Math.sin(st.phase)*.5+.5)*550;
   if(Math.abs(position-st.goal)<24){game.score++;st.goal=rand(160,600);st.phase+=1.2}
   else{game.misses++;st.phase+=.4}
   if(game.score>=game.total)finish(true);else if(game.misses>=5)finish(false);
  }else if(mode==="rhythm"){
   var note=st.notes.find(t=>!t.used&&t.lane===n&&Math.abs(t.time-game.elapsed)<.24);
   if(note){note.used=true;game.score++}else game.misses++;
   if(game.misses>5)finish(false);
  }else if(mode==="recipe"){
   if(n===st.steps[game.score]){game.score++;if(game.score>=game.total)finish(true)}
   else{game.misses++;game.elapsed+=1.25;if(game.misses>=5)finish(false)}
  }else if(mode==="pattern"){
   var vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},step=vectors[n];
   if(!step)return;var x=st.x+step[0],y=st.y+step[1];
   if(x>=0&&x<10&&y>=0&&y<7&&!st.grid[y][x]){st.x=x;st.y=y;if(x===7&&y===5){game.score=1;finish(true)}}else{game.misses++;game.elapsed+=.3}
  }
 }
 function pointer(ev){
  if(game.done)return;var b=canvas.getBoundingClientRect(),x=(ev.clientX-b.left)*W/b.width,y=(ev.clientY-b.top)*H/b.height;canvas.focus();
  if(mode==="target"){
   if(Math.hypot(x-st.x,y-st.y)<34){game.score++;st.vx=(Math.random()<.5?-1:1)*rand(165,280);st.vy=(Math.random()<.5?-1:1)*rand(125,210);if(game.score>=game.total)finish(true)}
   else if(Math.hypot(x-(740-st.x),y-(390-st.y))<27){game.misses++;game.elapsed+=1;if(game.misses>=5)finish(false)}
  }else if(mode==="precision"){action("stop")}
  else if(mode==="memory"){
   var col=Math.floor((x-70)/125),row=Math.floor((y-65)/112),idx=row*6+col;
   if(col<0||col>=6||row<0||row>=2||idx<0||idx>=st.cards.length||st.hideAt||st.matched.has(idx)||st.flips.includes(idx))return;
   st.flips.push(idx);
   if(st.flips.length===2){var a=st.flips[0],b=st.flips[1];if(st.cards[a]===st.cards[b]){st.matched.add(a);st.matched.add(b);st.flips=[];game.score++;if(game.score>=game.total)finish(true)}else{game.misses++;st.hideAt=game.elapsed+.66}}
  }else if(mode==="rhythm"){var lane=Math.floor((x-60)/165);if(lane>=0&&lane<4)action(lane)}
  else if(mode==="recipe"){var n=Math.floor((x-60)/165);if(n>=0&&n<4)action(n)}
  else{var gx=Math.floor((x-100)/55),gy=Math.floor((y-16)/52);if(Math.abs(st.x-gx)+Math.abs(st.y-gy)===1)action(gx<st.x?"left":gx>st.x?"right":gy<st.y?"up":"down")}
 }
 function key(ev){if(game.done||document.hidden||["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;var k=ev.key.toLowerCase();
  if(mode==="precision"&&(k===" "||k==="enter")){ev.preventDefault();action("stop")}
  if(mode==="rhythm"&&"asdf".includes(k)&&k.length===1){ev.preventDefault();action("asdf".indexOf(k))}
  if(mode==="recipe"&&"1234".includes(k)&&k.length===1)action(Number(k)-1);
  if(mode==="pattern"){var n={arrowup:"up",arrowdown:"down",arrowleft:"left",arrowright:"right",w:"up",a:"left",s:"down",d:"right"}[k];if(n){ev.preventDefault();action(n)}}
 }
 function render(){
  base();var remain=Math.max(0,game.limit-game.elapsed);clock.textContent=remain.toFixed(1)+"s • "+game.score+"/"+game.total+" • "+game.misses+" misses";box(24,13,(W-48)*(remain/game.limit),5,remain<6?C.red:C.cyan);
  if(mode==="target"){ctx.fillStyle=C.cyan;ctx.beginPath();ctx.arc(st.x,st.y,29,0,7);ctx.fill();text("✦",st.x,st.y+8,27,"#092235");ctx.fillStyle=C.red;ctx.beginPath();ctx.arc(740-st.x,390-st.y,25,0,7);ctx.fill();text("×",740-st.x,397-st.y,25)}
  if(mode==="precision"){box(100,155,560,30,C.tile);box(st.goal-24,143,48,55,C.green);var pos=105+(Math.sin(st.phase)*.5+.5)*550;box(pos-4,119,8,91,C.gold);text("STOP INSIDE THE GREEN ZONE",W/2,90,22);text("SPACE / TAP",W/2,270,19,C.cyan)}
  if(mode==="rhythm"){for(var i=0;i<4;i++){box(65+i*165,45,150,290,C.tile);text(["A","S","D","F"][i],139+i*165,355,20,C.cyan)}box(62,277,660,5,C.gold);st.notes.forEach(n=>{if(n.used)return;var yy=277-(n.time-game.elapsed)*118;if(yy>45&&yy<330)box(78+n.lane*165,yy-12,120,25,C.cyan)})}
  if(mode==="memory"){for(var i=0;i<st.cards.length;i++){var x=70+(i%6)*125,y=65+Math.floor(i/6)*112,show=st.matched.has(i)||st.flips.includes(i);box(x,y,106,94,st.matched.has(i)?C.green:show?"#306b8c":C.tile);text(show?st.cards[i]:"?",x+53,y+61,37,show?"#082337":C.white)}text("MATCH ALL THE PAIRS",W/2,352,18,C.cyan)}
  if(mode==="recipe"){var labels=["PREP","HEAT","PLATE","SERVE"];text("NEXT STATION",W/2,95,23);text(labels[st.steps[game.score]],W/2,167,45,C.gold);for(var i=0;i<4;i++){box(60+i*165,225,140,85,C.tile);text(labels[i],130+i*165,275,18,C.cyan)}text("1  ·  2  ·  3  ·  4",W/2,355,17)}
  if(mode==="pattern"){for(var y=0;y<7;y++)for(var x=0;x<10;x++)box(100+x*55,16+y*52,49,46,st.grid[y][x]?"#1e3447":"#2b5e76");box(100+7*55,16+5*52,49,46,C.green);box(110+st.x*55,24+st.y*52,28,30,C.gold);text("EXIT",680,105,20,C.green)}
 }
 function tick(t){if(game.done)return;var delta=clamp((t-game.last)/1000,0,.05);game.last=t;if(!document.hidden&&document.hasFocus()){
   game.elapsed+=delta;
   if(mode==="target"){st.x+=st.vx*delta;st.y+=st.vy*delta;if(st.x<34||st.x>726){st.vx*=-1;st.x=clamp(st.x,34,726)}if(st.y<50||st.y>325){st.vy*=-1;st.y=clamp(st.y,50,325)}}
   if(mode==="precision")st.phase+=delta*(hard?6.2:5);
   if(mode==="memory"&&st.hideAt&&game.elapsed>=st.hideAt){st.flips=[];st.hideAt=0}
   if(mode==="rhythm"){st.notes.forEach(n=>{if(!n.used&&game.elapsed>n.time+.3){n.used=true;game.misses++}});if(game.misses>5)return finish(false);if(st.notes.every(n=>n.used))return finish(game.score>=Math.ceil(game.total*.7))}
   if(game.elapsed>=game.limit)return finish(false);
  }
  render();game.raf=requestAnimationFrame(tick);
 }
 canvas.addEventListener("pointerdown",pointer);window.addEventListener("keydown",key);active=game;game.raf=requestAnimationFrame(tick);
 return game;
}
window.LoliteSkillGames=Object.freeze({start:start,stop:function(){active?.stop()},getActive:()=>active});
})();