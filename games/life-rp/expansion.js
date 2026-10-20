/* Life RP: City Update — interactive shifts, arcade activities, quests, businesses, ranks, memberships and shop. */
(function(){
"use strict";
var bridge=window.LoliteLifeRPBridge;if(!bridge)return;
var catalogue=bridge.catalogue();
var jobs=catalogue.jobs,activities=catalogue.activities,properties=catalogue.properties;
var businessTypes=[
{id:"coffee",name:"Coffee Kiosk",icon:"☕",price:1400,stock:100,revenue:270,rank:0,properties:0,mode:"recipe",desc:"Prepare orders and build a café following."},
{id:"green",name:"Garden Centre",icon:"🌱",price:3600,stock:170,revenue:410,rank:1,properties:0,mode:"pattern",desc:"Look after plants and handle customer requests."},
{id:"garage",name:"Repair Workshop",icon:"🔧",price:6200,stock:235,revenue:610,rank:2,properties:1,mode:"precision",desc:"Tune cars and fix problems with careful work."},
{id:"studio",name:"Media Studio",icon:"🎬",price:9400,stock:350,revenue:850,rank:3,properties:1,mode:"memory",desc:"Deliver creative projects to your customers."},
{id:"arcade",name:"Arcade Lounge",icon:"🕹️",price:15500,stock:480,revenue:1240,rank:4,properties:2,mode:"target",desc:"Own a neighbourhood games venue."},
{id:"lab",name:"Innovation Lab",icon:"🔬",price:32000,stock:720,revenue:2030,rank:5,properties:3,mode:"pattern",member:"pro",desc:"Run advanced research projects; Pro member feature."}
];
var ranks=[
{name:"Newcomer",xp:0,fee:0,shifts:0,activities:0,quests:0,property:0,business:0},
{name:"Apprentice",xp:350,fee:350,shifts:2,activities:1,quests:1,property:0,business:0},
{name:"Resident",xp:1000,fee:900,shifts:5,activities:3,quests:2,property:0,business:0},
{name:"Specialist",xp:2100,fee:1800,shifts:9,activities:5,quests:4,property:1,business:0},
{name:"Entrepreneur",xp:4100,fee:3800,shifts:13,activities:8,quests:6,property:1,business:1},
{name:"Professional",xp:7200,fee:6900,shifts:18,activities:12,quests:9,property:2,business:2},
{name:"City Leader",xp:11500,fee:11000,shifts:25,activities:18,quests:13,property:3,business:3},
{name:"Lolite Legend",xp:18500,fee:19500,shifts:35,activities:26,quests:20,property:4,business:4}
];
var items=[
{id:"theme-ocean",name:"Ocean Horizon",cat:"Themes",icon:"🌊",price:450,theme:"ocean",wall:"ocean-dawn",desc:"Cool blue Life RP theme and matching Lolite wallpaper."},
{id:"theme-forest",name:"Forest Escape",cat:"Themes",icon:"🌲",price:650,theme:"forest",wall:"forest-mist",desc:"Natural green panels and a forest wallpaper."},
{id:"theme-sunset",name:"Retro Sunset",cat:"Themes",icon:"🌅",price:950,theme:"sunset",wall:"retro-sunset",desc:"Warm orange accents and a sunset desktop."},
{id:"theme-neon",name:"Cyber City",cat:"Themes",icon:"🌆",price:1600,theme:"neon",wall:"cyber-grid",desc:"Neon blue panels with the Cyber Grid wallpaper."},
{id:"theme-gold",name:"Golden Skyline",cat:"Themes",icon:"🌟",price:2800,theme:"gold",wall:"animated-solar",member:"plus",desc:"Plus exclusive glowing golden design."},
{id:"theme-pro",name:"Cosmic Pro",cat:"Themes",icon:"🌌",price:5200,theme:"pro",wall:"animated-galaxy",member:"pro",desc:"Pro exclusive animated galactic wallpaper."},
{id:"cursor-glass",name:"Glass Cursor",cat:"Cursors",icon:"🖱️",price:300,cursor:"glass",desc:"Unlock Lolite OS's glass cursor set."},
{id:"cursor-retro",name:"Retro Cursor",cat:"Cursors",icon:"🖱️",price:480,cursor:"retro",desc:"Unlock the retro cursor collection."},
{id:"cursor-neon",name:"Neon Cursor",cat:"Cursors",icon:"🖱️",price:800,cursor:"neon",desc:"Unlock the neon cursor collection."},
{id:"game-pong",name:"Lolite Pong",cat:"Games",icon:"🏓",price:400,game:"pong",desc:"Unlock a shortcut to Lolite's built-in Pong game."},
{id:"game-2048",name:"Lolite 2048",cat:"Games",icon:"🔢",price:650,game:"2048",desc:"Unlock the in-Lolite number puzzle launcher."},
{id:"game-sokoban",name:"Lolite Sokoban",cat:"Games",icon:"📦",price:900,game:"sokoban",desc:"Unlock the classic block-moving puzzle launcher."},
{id:"game-minecraft",name:"Minecraft 1.8 Shortcut",cat:"Games",icon:"⛏️",price:3500,game:"minecraft",desc:"Unlock a shortcut to Lolite's existing Minecraft 1.8 launcher. This is not an official Minecraft license or purchase."},
{id:"decor-lamp",name:"Neon Room Lamp",cat:"Decor",icon:"💡",price:320,title:"Night Owl",desc:"A collectible profile decoration and title."},
{id:"decor-plants",name:"Indoor Plant Set",cat:"Decor",icon:"🪴",price:450,title:"Green Thumb",desc:"A collectible house decoration and profile title."},
{id:"decor-poster",name:"City Poster",cat:"Decor",icon:"🖼️",price:600,title:"City Fan",desc:"Decorate your home and use this profile title."},
{id:"decor-desk",name:"Gamer Desk Setup",cat:"Decor",icon:"🖥️",price:1700,title:"Setup Expert",member:"plus",desc:"Plus members-only collectible desk decoration."},
{id:"decor-stage",name:"Creator Studio Setup",cat:"Decor",icon:"🎙️",price:3200,title:"Studio Legend",member:"pro",desc:"Pro members-only collectible room decoration."}
];
var storyQuests=[
{id:"welcome",title:"Your First Paycheck",desc:"Finish 1 full job shift",event:"shift",goal:1,cash:180,xp:125,pass:120},
{id:"explorer",title:"Weekend Explorer",desc:"Finish 2 activity minigames",event:"activity",goal:2,cash:220,xp:160,pass:140},
{id:"smartshop",title:"Shopping Trip",desc:"Purchase 1 item in the shop",event:"purchase",goal:1,cash:175,xp:105,pass:120,requires:"welcome"},
{id:"home",title:"Moving Day",desc:"Purchase a property",event:"property",goal:1,cash:250,xp:200,pass:165,requires:"welcome"},
{id:"challenge",title:"Skills Test",desc:"Perfectly complete 2 minigames",event:"perfect",goal:2,cash:260,xp:180,pass:170,requires:"explorer"},
{id:"career",title:"Career Explorer",desc:"Complete 6 shifts",event:"shift",goal:6,cash:650,xp:380,pass:260,requires:"welcome"},
{id:"opening",title:"Grand Opening",desc:"Purchase your first business",event:"buybusiness",goal:1,cash:400,xp:260,pass:230,requires:"home"},
{id:"operator",title:"Business Operator",desc:"Serve 4 customers in minigames",event:"business",goal:4,cash:700,xp:500,pass:300,requires:"opening"},
{id:"promotion",title:"Moving Up",desc:"Earn your first rank promotion",event:"rank",goal:1,cash:250,xp:160,pass:200,requires:"welcome"},
{id:"stylist",title:"New Look",desc:"Equip a purchased theme or cursor",event:"equip",goal:1,cash:175,xp:125,pass:140,requires:"smartshop"},
{id:"versatile",title:"A Busy Life",desc:"Complete 15 activities",event:"activity",goal:15,cash:1100,xp:630,pass:360,requires:"explorer"},
{id:"social",title:"Season Collector",desc:"Claim 3 battle pass rewards",event:"pass",goal:3,cash:450,xp:350,pass:250,requires:"career"}
];
var repeatQuests=[
{id:"shift2",title:"Working Day",desc:"Finish 2 work shifts",event:"shift",goal:2,cash:240,xp:140,pass:165},
{id:"activity2",title:"Try Something New",desc:"Finish 2 activity minigames",event:"activity",goal:2,cash:240,xp:140,pass:165},
{id:"precision",title:"Careful Hands",desc:"Complete 1 minigame with perfect accuracy",event:"perfect",goal:1,cash:210,xp:180,pass:180},
{id:"biz1",title:"Customer First",desc:"Finish 1 business order",event:"business",goal:1,cash:310,xp:230,pass:225},
{id:"three",title:"On the Grind",desc:"Complete 5 work shifts",event:"shift",goal:5,cash:760,xp:420,pass:450},
{id:"four",title:"Explore the Districts",desc:"Complete 5 activities",event:"activity",goal:5,cash:640,xp:380,pass:440},
{id:"bigbiz",title:"Busy Shopfront",desc:"Serve 4 business customers",event:"business",goal:4,cash:900,xp:490,pass:510}
];
var questionBank={
"Food & Hospitality":[["A table orders 4 meals at $18 each. What is the total?","$72","$64","$82"],["What helps during a busy food-service shift?","Read tickets in order and confirm details","Ignore special requests","Serve meals without checking"],["A customer asks how long their meal will take.","Give a realistic estimate","Promise it instantly","Avoid responding"],["A delivery arrives warm when it should be chilled.","Follow food safety checks","Store it regardless","Use it quickly without checking"],["Two customers ask for the same last item.","Follow your store's fair ordering process","Sell it to both","Ignore both customers"]],
"Retail & Services":[["A product costs $35 and a customer pays $50. Change due?","$15","$20","$10"],["You notice a shelf item has run out.","Check inventory before restocking","Claim it is still available","Replace with any item"],["A customer wants to return an item.","Check the receipt and return policy","Refuse all returns","Guess the policy"],["You see a long checkout queue.","Call for support if available","Close every checkout","Argue with shoppers"],["What is the best way to plan your shift?","Prioritise tasks and check stock","Wait until closing","Do every task randomly"]],
"Transport":[["A route takes 12 minutes per stop for 3 stops. Total?","36 minutes","24 minutes","40 minutes"],["Your vehicle shows a warning light before starting.","Check safely and follow service procedures","Ignore the warning","Cover the indicator"],["A booking detail does not match the address.","Confirm with dispatch or the customer","Guess the destination","Skip delivery details"],["What's a sensible first step for a trip?","Check route, conditions and schedule","Rush without planning","Disable navigation"],["A passenger asks for an update.","Provide a clear estimate","Make one up","Say nothing"]],
"Public Service":[["You arrive at a community event with conflicting instructions.","Confirm responsibilities with the team leader","Ignore the briefing","Guess your role"],["You need to communicate an important update.","Use clear, verified information","Spread rumours","Wait until it's too late"],["People are confused about an official notice.","Explain the verified notice respectfully","Dismiss questions","Invent a new rule"],["Before handing over a task, you should...","Provide an accurate briefing","Leave no notes","Skip communication"],["Your team identifies a safety concern.","Follow the established safety procedure","Ignore it","Keep it secret"]],
"Healthcare":[["A patient asks something outside your role.","Ask the appropriate qualified colleague","Guess at a diagnosis","Invent an answer"],["Before handing over care, you should...","Share accurate relevant information securely","Skip the handover","Discuss confidential details publicly"],["A plan has changed during your shift.","Check the current authorised instructions","Use yesterday's plan","Make assumptions"],["What protects patient privacy?","Only share details with authorised staff","Post details in public","Leave records unattended"],["You are unsure about an instruction.","Clarify before acting","Guess what was intended","Ignore all guidance"]],
"Education":[["There are 24 students in 4 equal groups. Students per group?","6","8","5"],["A lesson is not engaging the class.","Try a suitable hands-on activity","End the lesson immediately","Ignore the students"],["A learner asks for help with homework.","Break the task into smaller steps","Give no feedback","Shame them for asking"],["What makes feedback useful?","Specific, kind, actionable advice","Only saying wrong","Giving no explanation"],["You have 3 activities and 30 minutes.","Plan time for each and a recap","Use all time on one task","Skip planning"]],
"Trades":[["You need 7 metres of material for 3 jobs. How many metres total?","21","24","14"],["A measurement is different from the plan.","Recheck measurements and ask the supervisor","Guess a replacement","Hide the error"],["A tool is not working as expected.","Stop and check approved procedures","Force it to work","Ignore the issue"],["A customer wants a quote.","Write a clear scope and estimate","Hide costs","Guess the materials"],["A coworker points out a design problem.","Review it together and correct the plan","Dismiss them","Carry on regardless"]],
"Outdoors":[["You water 5 beds using 3 litres each. Total?","15 litres","8 litres","12 litres"],["A new plant needs partial shade.","Choose a suitable location","Place it in constant intense sun","Ignore its requirements"],["Weather changes during outdoor work.","Adjust the schedule safely","Ignore forecasts","Rush every task"],["You spot signs of poor soil drainage.","Check soil conditions and adjust care","Keep watering heavily","Remove every plant"],["How do you care for shared green spaces?","Follow planting and conservation guidelines","Leave litter behind","Damage plants"]],
"Creative":[["A client needs 4 posters at $25 each. Total?","$100","$85","$125"],["A customer requests a smaller version of a design.","Export at the requested size","Ignore the brief","Delete the original"],["You need a second draft.","Save versions and check feedback","Overwrite every file without backup","Use random content"],["Your creative project is due soon.","Prioritise the most important revisions","Ignore the deadline","Add unrelated features"],["You want better accessibility in a layout.","Use readable fonts and contrast","Make text tiny","Hide essential information"]],
"Media":[["You publish 3 videos of 12 minutes each. Total duration?","36 minutes","24 minutes","42 minutes"],["Your microphone peaks during recording.","Lower gain and test again","Turn it up more","Ignore clipping"],["An audience poll suggests a new topic.","Check interest and plan content","Copy someone else's work","Promise daily uploads you can't maintain"],["A thumbnail is hard to read on phones.","Simplify text and improve contrast","Add even more text","Hide the title"],["Your upload is missing a description.","Write a clear relevant summary","Use random tags","Ignore it"]],
"Technology":[["A test suite has 18 tests and 2 fail. How many pass?","16","20","14"],["You find a repeatable software bug.","Record steps and isolate the cause","Delete all logs","Make random changes"],["A colleague requests a new feature.","Clarify requirements before building","Ship something unrelated","Ignore compatibility"],["A change breaks a deployment.","Check errors and revert or fix carefully","Hide the failure","Remove monitoring"],["A user cannot open a file.","Check permissions and supported formats","Delete their files","Assume the user is lying"]]
};
var styles=document.createElement("style");
styles.textContent=[
'.lr-chip{display:inline-block;font-size:10px;font-weight:750;padding:6px 9px;border-radius:8px;background:#1d4057;color:#a7ecf4}',
'.lr-task{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #2c4056}.lr-task:last-child{border:0}.lr-task p{margin:4px 0 0}',
'.lr-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}.lr-answer{border:1px solid #4b6885;background:#1d3450;color:#eef8ff;border-radius:11px;padding:15px;min-height:60px;font-weight:750}.lr-answer:hover{background:#315b77}',
'.lr-swatch{display:flex;align-items:center;gap:10px}.lr-swatch i{display:inline-block;width:17px;height:17px;border-radius:50%;border:1px solid #fff6}',
'.lr-mega{font-size:clamp(28px,4vw,54px);font-weight:850;letter-spacing:-1.3px}',
'.lr-memory{display:grid;grid-template-columns:repeat(3,minmax(70px,1fr));gap:11px;max-width:510px;margin:18px auto}',
'.lr-tile{height:87px;border-radius:13px;background:#254460;color:white;font-size:32px;border:1px solid #4c7292}.lr-tile:disabled{opacity:.5}',
'.lr-progress-number{font-size:12px;color:#9ccfe7;margin-top:8px}',
'.lr-promo{border-color:#669cb1!important;background:linear-gradient(130deg,#17354b,#13203c)!important}',
'.lr-ranks{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}',
'.lr-locked{opacity:.72}.lr-quest{border-left:3px solid #527b97}.lr-quest.ready{border-left-color:#7de1ac}',
'.lr-tab{border-color:#3c708f!important;color:#b8f4ff!important}',
'.lr-banner{border:1px solid #416582;background:#15334b;border-radius:12px;padding:12px;font-size:13px}',
'body[data-life-theme="ocean"]{background:radial-gradient(circle at 80% 0%,#0e6673,transparent 65%),#061727}body[data-life-theme="ocean"] .card,body[data-life-theme="ocean"] .panel{border-color:#225c7b;background:#112d44e8}',
'body[data-life-theme="forest"]{background:radial-gradient(circle at 75% 0%,#145b3b,transparent 60%),#091b1b}body[data-life-theme="forest"] .card,body[data-life-theme="forest"] .panel{border-color:#366957;background:#142e27ed}',
'body[data-life-theme="sunset"]{background:radial-gradient(circle at 80% 0%,#914c39,transparent 60%),#241928}body[data-life-theme="sunset"] .card,body[data-life-theme="sunset"] .panel{border-color:#885665;background:#302333e8}',
'body[data-life-theme="neon"]{background:radial-gradient(circle at 80% 0%,#065e82,transparent 60%),#060d26}body[data-life-theme="neon"] .card,body[data-life-theme="neon"] .panel{border-color:#23638a;background:#0d1d35ef}',
'body[data-life-theme="gold"]{background:radial-gradient(circle at 80% 0%,#816326,transparent 60%),#191721}body[data-life-theme="gold"] .card,body[data-life-theme="gold"] .panel{border-color:#816e44;background:#302a27ec}',
'body[data-life-theme="pro"]{background:radial-gradient(circle at 80% 0%,#50267e,transparent 60%),#080f29}body[data-life-theme="pro"] .card,body[data-life-theme="pro"] .panel{border-color:#665099;background:#201b3fec}',
'.lr-precision{margin:20px 0;padding:13px;background:#12283b;border:1px solid #345774;border-radius:13px}.lr-precision input{width:100%;accent-color:#6adcea}',
'.lr-mini-hint{color:#c1d3e9;font-size:13px;line-height:1.6}.lr-small{font-size:11px;color:#97aec7}'
].join("");
document.head.appendChild(styles);
var challenge=null,shopFilter="All",profileSection="Overview",challengeTimed=null,awaitingSave=false;
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]})}
function find(a,id){return a.find(function(t){return t.id===id})}
function currency(n){return "$"+Math.floor(Math.max(0,n)).toLocaleString("en-AU")}
function choice(a){return a[Math.floor(Math.random()*a.length)]}
function shuffle(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var k=a[i];a[i]=a[j];a[j]=k}return a}
function season(){var start=Date.UTC(2026,9,20),period=28*86400000;return Math.max(1,Math.floor((Date.now()-start)/period)+1)}
function seasonLabel(){var t=new Date(Date.UTC(2026,9,20)+(season()-1)*28*86400000);var end=new Date(t.getTime()+28*86400000);return "Season "+season()+" · "+t.toLocaleDateString("en-AU",{day:"numeric",month:"short",timeZone:"UTC"})+" – "+end.toLocaleDateString("en-AU",{day:"numeric",month:"short",timeZone:"UTC"})}
function day(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function week(){return Math.floor((Date.now()-Date.UTC(2026,9,20))/(7*86400000))}
function defaults(){return {rank:0,membership:"free",owned:[],equipped:{theme:"default",cursor:"classic",title:"Resident"},businesses:{},quests:{},claimedQuests:0,season:season(),perfectGames:0,lastMini:"",questEvents:0}}
function state(){
 var d=bridge.snapshot();var e=d.extras&&typeof d.extras==="object"&&!Array.isArray(d.extras)?d.extras:{};
 var def=defaults();Object.keys(def).forEach(function(k){if(e[k]===undefined||typeof e[k]!==typeof def[k])e[k]=def[k]});
 if(!Array.isArray(e.owned))e.owned=[];if(!e.equipped||typeof e.equipped!=="object")e.equipped=def.equipped;
 if(!e.businesses||typeof e.businesses!=="object")e.businesses={};if(!e.quests||typeof e.quests!=="object")e.quests={};
 if(!Number.isInteger(e.rank)||e.rank<0||e.rank>=ranks.length)e.rank=0;
 if(!["free","plus","pro"].includes(e.membership))e.membership="free";
 if(e.season!==season()){e.season=season();d.passXp=0;d.freeRewards=[];d.premiumRewards=[];d.premium=false}
 d.extras=e;return {s:d,e:e};
}
function update(fn){var x=state();fn(x.s,x.e);bridge.replace(x.s)}
function toast(msg){var el=document.getElementById("toast");if(el){el.textContent=msg;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},3000)}}
function reward(s,name,money,xp,pass){s.cash+=money||0;s.totalXp+=xp||0;s.passXp+=pass||0;s.history=s.history||[];s.history.unshift({label:name,delta:money||0,date:new Date().toLocaleDateString("en-AU")});s.history=s.history.slice(0,15)}
function buy(s,label,amount){if(s.cash<amount){toast("You need "+currency(amount-s.cash)+" more.");return false}s.cash-=amount;s.history.unshift({label:label,delta:-amount,date:new Date().toLocaleDateString("en-AU")});s.history=s.history.slice(0,15);return true}
function owned(id,e){return (e.owned||[]).includes(id)}
function canMember(level,e){return !level||e.membership==="pro"||(level==="plus"&&e.membership==="plus")}
function btn(label,act,id,style,disabled){return '<button type="button" class="btn '+(style||"soft")+'" data-lr="'+esc(act)+'"'+(id!=null?' data-arg="'+esc(id)+'"':"")+(disabled?" disabled":"")+">"+label+"</button>"}
function kicker(title,sub){return '<div class="section-head"><h2>'+title+'</h2><span>'+sub+'</span></div>'}
function tracker(e,id){return Number(e.quests[id]?.count||0)}
function eventUpdate(s,e,what){Object.keys(e.quests).forEach(function(key){var q=questByKey(key);var p=e.quests[key];if(q&&p.status==="active"&&q.event===what){p.count=Math.min(q.goal,p.count+1);if(p.count>=q.goal)p.status="ready"}})}
function record(what){update(function(s,e){eventUpdate(s,e,what)})}
function questByKey(key){var id=key.split("@")[0];return find(storyQuests,id)||find(repeatQuests,id)}
function questsActive(){
 var curr=day(),wk=week();
 return storyQuests.map(function(q){return {q:q,key:q.id}}).concat(repeatQuests.slice(0,4).map(function(q){return {q:q,key:q.id+"@"+curr}}),repeatQuests.slice(4).map(function(q){return {q:q,key:q.id+"@week"+wk}}));
}
function questPage(){
 var x=state(),s=x.s,e=x.e;return '<section class="panel lr-promo"><div class="eyebrow">QUEST BOARD</div><h2>Earn season rewards by actually playing.</h2><p>Accept a quest, complete its specific tasks, then claim cash, resident XP and season XP. Normal shifts no longer automatically level up the battle pass.</p></section>'+
 kicker("Story Quests","One-time progression missions")+
 '<div class="grid">'+questsActive().map(function(ent,i){
 var q=ent.q,key=ent.key,p=e.quests[key],unlock=!q.requires||e.quests[q.requires]?.status==="claimed",count=p?.count||0,status=p?.status||"new";
 return '<article class="card lr-quest '+(status==="ready"?"ready":"")+'"><span class="tag">'+(i<storyQuests.length?"STORY":i<storyQuests.length+4?"DAILY":"WEEKLY")+'</span><h3>'+esc(q.title)+'</h3><p>'+esc(q.desc)+'</p><div class="progress"><span style="width:'+Math.min(100,count/q.goal*100)+'%"></span></div><div class="stats"><span>'+Math.min(q.goal,count)+' / '+q.goal+'</span><span class="money">'+currency(q.cash)+'</span><span>'+q.xp+' XP · '+q.pass+' Season XP</span></div>'+(!unlock?'<p class="lr-small">Requires quest: '+esc(find(storyQuests,q.requires)?.title||q.requires)+'</p>':"")+
 btn(status==="claimed"?"Claimed":status==="ready"?"Claim rewards":status==="active"?"In progress":"Accept quest",status==="ready"?"questclaim":"questaccept",key,status==="ready"?"primary":"soft",!unlock||status==="claimed"||status==="active")+'</article>'
 }).join("")+'</div><p class="hint">Daily and weekly quests reset automatically on your device calendar. Tasks you complete before accepting a quest will not count.</p>';
}

function upgradedHome(){
 var x=state(),p=x.s,e=x.e,job=find(jobs,p.job)||jobs[0],claimed=e.claimedQuests;
 return '<section class="panel hero"><div><div class="eyebrow">YOUR LOLITE CITY</div><h2>Make a living. Build a life.</h2><p>Work hands-on shifts, complete quests, play minigames, build businesses and earn rewards for real progress.</p><div class="selectrow"><button type="button" class="btn primary" data-lr="beginjob" data-arg="'+esc(job.id)+'">Work as '+esc(job.name)+'</button><button type="button" class="btn soft" data-action="tab" data-id="quests">View quests</button></div></div><div class="hero-art" aria-hidden="true">🏙️</div></section>'+
 '<div class="grid" style="margin-top:15px">'+
 '<article class="card"><span class="tag">CAREER</span><h3>'+esc(ranks[e.rank].name)+'</h3><p>Complete shifts and quests to qualify for promotion.</p><button class="btn soft" data-action="tab" data-id="ranks">View ranks</button></article>'+
 '<article class="card"><span class="tag">QUESTS</span><h3>'+claimed+' claims completed</h3><p>Quests are how you earn new seasonal battle-pass XP.</p><button class="btn primary" data-action="tab" data-id="quests">Quest board</button></article>'+
 '<article class="card"><span class="tag">BUSINESSES</span><h3>'+Object.keys(e.businesses).length+' owned</h3><p>Serve customers in minigames and grow your company.</p><button class="btn soft" data-action="tab" data-id="businesses">Manage business</button></article>'+
 '<article class="card"><span class="tag">MEMBERSHIP</span><h3>'+esc(e.membership.toUpperCase())+'</h3><p>Unlock more virtual perks in the shop.</p><button class="btn soft" data-action="tab" data-id="shop">Visit shop</button></article></div>'+
 '<div class="columns" style="margin-top:16px"><section class="panel"><h2>Daily Check-In</h2><p>Claim your bonus when available: $150 and 90 resident XP.</p><button class="btn gold" data-action="daily" '+(p.lastDaily===day()?'disabled':'')+'>Claim daily reward</button></section>'+
 '<section class="panel"><h2>Resident Progress</h2><div class="stats"><span>'+p.shifts+' shifts</span><span>'+p.activities+' activities</span><span>'+p.properties.length+' properties</span></div><div class="selectrow" style="margin-top:15px"><button class="btn primary" data-action="tab" data-id="activities">Play minigames</button><button class="btn soft" data-action="tab" data-id="pass">Season Pass</button></div></section></div>';
}
function seasonPass(){
 var x=state(),s=x.s,e=x.e,step=400,tier=Math.min(18,Math.floor(s.passXp/step));var road="";
 for(var i=1;i<=18;i++){var unlock=i<=tier,free=s.freeRewards.includes(i),paid=s.premiumRewards.includes(i),freeReward=i%5===0?"Exclusive badge":"Cash "+currency(65+i*25),premReward=i%6===0?"Premium collectible":"Cash "+currency(120+i*42);
 road+='<article class="card '+(!unlock?"lr-locked":"")+'"><span class="tag">TIER '+i+'</span><h3>'+i*step+' Season XP</h3><div class="stack"><div class="lr-banner"><b>FREE</b><p>'+freeReward+'</p>'+btn(free?"Claimed":unlock?"Claim":"Locked","passclaim","free:"+i,"soft",free||!unlock)+'</div><div class="lr-banner"><b>PREMIUM</b><p>'+premReward+'</p>'+btn(paid?"Claimed":!s.premium?"Premium locked":unlock?"Claim":"Tier locked","passclaim","premium:"+i,"gold",paid||!s.premium||!unlock)+'</div></div></article>'
 }
 return '<section class="panel lr-promo"><div class="eyebrow">'+esc(seasonLabel())+'</div><h2>Seasonal Battle Pass</h2><p>Unlike the old pass, jobs and minigames do not award battle-pass XP directly. Complete accepted quests and claim their rewards to climb the 18-tier season.</p><div class="progress"><span style="width:'+Math.min(100,s.passXp/7200*100)+'%"></span></div><p>'+s.passXp+' / 7,200 Season XP · Tier '+tier+' of 18</p>'+(s.premium?'<span class="tag gold">PREMIUM ACTIVE THIS SEASON</span>':btn("Buy Premium Pass · "+currency(2800),"premiumseason",null,"gold",s.cash<2800))+'</section>'+
 kicker("Reward Road","Fixed rewards — never random loot boxes")+'<div class="grid">'+road+'</div>';
}
function rankReq(r,s,e){var conditions=[
[s.totalXp>=r.xp,"Resident XP: "+s.totalXp+"/"+r.xp],
[s.shifts>=r.shifts,"Work shifts: "+s.shifts+"/"+r.shifts],
[s.activities>=r.activities,"Activities: "+s.activities+"/"+r.activities],
[e.claimedQuests>=r.quests,"Quests claimed: "+e.claimedQuests+"/"+r.quests],
[s.properties.length>=r.property,"Properties: "+s.properties.length+"/"+r.property],
[Object.keys(e.businesses).length>=r.business,"Businesses: "+Object.keys(e.businesses).length+"/"+r.business],
[s.cash>=r.fee,"Promotion fee: "+currency(r.fee)]
];return conditions}
function rankPage(){
 var x=state(),s=x.s,e=x.e;return '<section class="panel lr-promo"><span class="tag green">CURRENT RANK</span><h2 class="lr-mega">'+esc(ranks[e.rank].name)+'</h2><p>Complete activities, work shifts, claim quests, own property and invest in businesses before paying a promotion fee. You can only buy the <b>next</b> rank.</p></section>'+
 kicker("Career & City Ranks","Eight earned ranks")+'<div class="lr-ranks">'+ranks.map(function(r,i){var req=rankReq(r,s,e),ready=req.every(function(c){return c[0]});return '<article class="card '+(i>e.rank?"":"lr-promo")+'"><span class="tag">'+(i<e.rank?"PROMOTED":i===e.rank?"CURRENT RANK":i===e.rank+1?"NEXT RANK":"LOCKED")+'</span><h3>'+esc(r.name)+'</h3><div class="stack">'+req.slice(0,6).map(function(c){return '<div class="lr-small">'+(c[0]?"✓ ":"○ ")+esc(c[1])+'</div>'}).join("")+'</div><b>Promotion fee '+currency(r.fee)+'</b>'+(i===e.rank+1?btn(ready?"Buy promotion":"Requirements not met","rank",i,ready?"primary":"soft",!ready):i<=e.rank?'<span class="tag green">Unlocked</span>':'<span class="tag">Previous rank required</span>')+'</article>'}).join("")+'</div>';
}
function membershipPage(){
 var x=state(),s=x.s,e=x.e;var level=e.membership,plus=level==="plus"||level==="pro";
 return '<section class="panel lr-promo"><h2>Lolite Memberships</h2><p>These are <b>fictional, one-time in-game purchases</b> using only the cash earned in Life RP. There is no real payment, billing, renewal or subscription.</p></section>'+
 '<div class="grid" style="margin-top:14px"><article class="card"><span class="tag">FREE</span><h3>Standard</h3><p>All 20 careers, all base minigames, normal businesses, the free battle pass, quests and the starter wardrobe.</p>'+btn(level==="free"?"Current plan":"Included","none",null,"soft",true)+'</article><article class="card"><span class="tag gold">PLUS</span><h3>Lolite Plus</h3><p>Unlock 2 Plus-exclusive activities, Golden Skyline shop theme, Gamer Desk collectible, +1 daily shop bonus after a quest claim and special titles.</p><b>'+currency(4500)+' virtual cash</b>'+btn(plus?"Unlocked":"Buy Lolite Plus","member","plus",plus?"soft":"gold",plus||s.cash<4500)+'</article><article class="card lr-promo"><span class="tag gold">PRO</span><h3>Lolite Pro</h3><p>Everything in Plus, plus 2 Pro-exclusive minigames, the Innovation Lab business, Cosmic Pro theme, Creator Studio collectible and exclusive rankside title.</p><b>'+(level==="plus"?"Upgrade for "+currency(8000):currency(12500))+' virtual cash</b>'+btn(level==="pro"?"Unlocked":"Buy Lolite Pro","member","pro",level==="pro"?"soft":"gold",level==="pro"||s.cash<(level==="plus"?8000:12500))+'</article></div>';
}
function shopPage(){
 var x=state(),s=x.s,e=x.e;var categories=["All","Themes","Cursors","Games","Decor"],list=items.filter(function(i){return shopFilter==="All"||shopFilter===i.cat});
 return '<section class="panel"><div class="eyebrow">THE CITY MARKETPLACE</div><h2>Buy games, themes, cursors & collectibles.</h2><p>Everything costs virtual coins earned by actually playing. Some products require Plus or Pro, also purchased using virtual coins. Game purchases unlock shortcuts within Lolite OS, not licenses to third-party paid products.</p><div class="selectrow">'+btn("Memberships","showmembers",null,"gold")+'<span class="lr-chip">Wallet '+currency(s.cash)+'</span></div></section>'+
 '<div class="selectrow" style="margin:17px 0">'+categories.map(function(c){return btn(c,"shopfilter",c,shopFilter===c?"primary":"soft")}).join("")+'</div>'+
 '<div class="grid">'+list.map(function(i){
 var have=owned(i.id,e),gate=!canMember(i.member,e);
 var equip=(i.theme||i.cursor||i.title),equipped=(i.theme&&e.equipped.theme===i.theme)||(i.cursor&&e.equipped.cursor===i.cursor)||(i.title&&e.equipped.title===i.title);
 return '<article class="card"><div class="feature-kicker"><span class="icon-tile">'+i.icon+'</span><span class="tag">'+esc(i.cat)+'</span></div><h3>'+esc(i.name)+'</h3><p>'+esc(i.desc)+'</p><div class="stats"><b>'+currency(i.price)+'</b>'+(i.member?'<span>'+esc(i.member.toUpperCase())+' REQUIRED</span>':"")+'</div><div class="actions">'+(have?'<span class="tag green">Owned</span>':btn(gate?"Membership required":s.cash<i.price?"Not enough cash":"Purchase","buyitem",i.id,gate?"soft":"primary",gate||s.cash<i.price))+
 (have&&equip?btn(equipped?"Equipped":"Equip","equip",i.id,"soft",!!equipped):"")+
 (have&&i.game?btn("Play game →","play",i.id,"gold"):"")+'</div></article>'
 }).join("")+'</div>'+membershipPage();
}
function businessesPage(){
 var x=state(),s=x.s,e=x.e,n=Object.keys(e.businesses).length;
 return '<section class="panel lr-promo"><h2>Run your own business</h2><p>Buy a business, stock supplies, then actually serve customers through interactive minigames. Earn income from completed orders, improve reputation, and upgrade your shop. No passive or automatic customer payments.</p><div class="stats"><b>'+n+' businesses owned</b><span>Rank: '+esc(ranks[e.rank].name)+'</span></div></section>'+
 kicker("Commercial Properties","Rank and property requirements apply")+
 '<div class="grid">'+businessTypes.map(function(b){
 var ownedBiz=e.businesses[b.id],open=e.rank>=b.rank&&s.properties.length>=b.properties&&canMember(b.member,e);
 var stars=ownedBiz?ownedBiz.level:1,stock=ownedBiz?ownedBiz.stock:0,served=ownedBiz?ownedBiz.served:0;
 return '<article class="card"><div class="feature-kicker"><span class="icon-tile">'+b.icon+'</span><span class="tag">'+(ownedBiz?"YOUR BUSINESS":"FOR SALE")+'</span></div><h3>'+esc(b.name)+'</h3><p>'+esc(b.desc)+'</p><div class="stats"><span><b>'+currency(b.price)+'</b> purchase</span><span>Rank '+esc(ranks[b.rank].name)+'</span></div>'+
 (ownedBiz?'<div class="lr-banner"><b>Level '+stars+' · '+served+' orders served</b><p>Supplies '+stock+' · Revenue '+currency(Math.round(b.revenue*(1+(stars-1)*.25)))+'/order</p></div><div class="actions">'+btn("Serve customer","serve",b.id,"primary",stock<1)+btn("Restock "+currency(b.stock),"restock",b.id,"soft",s.cash<b.stock||stock>=5)+btn("Upgrade "+currency(b.price*stars),"upgradebiz",b.id,"gold",s.cash<b.price*stars||stars>=4)+'</div>':
 '<div class="lr-small">'+(open?"Available to buy":b.member&&!canMember(b.member,e)?"Requires Lolite "+b.member.toUpperCase():"Requires "+ranks[b.rank].name+" and "+b.properties+" owned properties")+'</div>'+btn("Buy for "+currency(b.price),"buybiz",b.id,"primary",!open||s.cash<b.price))+'</article>'
 }).join("")+'</div>';
}
function jobPage(){
 var x=state(),s=x.s,e=x.e;
 return '<section class="panel lr-promo"><h2>Actually do the work.</h2><p>Pick a career, answer varied on-the-job scenarios, then complete a skill minigame. You do not get paid for opening a job—you must finish the shift. Higher rank unlocks specialist positions.</p></section>'+
 kicker("Job Board",jobs.length+" careers · new questions each shift")+
 '<div class="grid">'+jobs.map(function(j){var gate=(j.id==="pilot"||j.id==="scientist")?2:(["paramedic","firefighter","nurse","police"].includes(j.id)?1:0),unlocked=e.rank>=gate,chosen=s.job===j.id;
 return '<article class="card"><div class="feature-kicker"><span class="icon-tile">'+j.icon+'</span><span class="tag">'+esc(j.field)+'</span></div><h3>'+esc(j.name)+'</h3><p>Three changing job scenarios and a hands-on skill minigame.</p><div class="stats"><b>'+currency(j.pay)+' base pay</b><span>'+(s.completedJobs[j.id]||0)+' shifts</span></div><div class="actions">'+(chosen?'<span class="tag green">Selected</span>':btn("Select job","selectjob",j.id,"soft",!unlocked))+
 btn(unlocked?"Start shift":"Requires "+ranks[gate].name,"beginjob",j.id,"primary",!unlocked)+'</div></article>'}).join("")+'</div>';
}
var modes={fishing:"precision",cooking:"recipe",photo:"target",recycle:"pattern",garden:"memory",music:"rhythm",sports:"target",pets:"memory",museum:"pattern",arcade:"target",volunteer:"recipe",hiking:"precision"};
var specialtyActivities=[
{id:"plus-delivery",name:"Courier Circuit",icon:"🚚",pay:180,xp:130,desc:"Premium timed sorting challenge.",mode:"target",member:"plus"},
{id:"plus-garden",name:"Botanical Expert",icon:"🌺",pay:190,xp:130,desc:"Special memory garden challenge.",mode:"memory",member:"plus"},
{id:"pro-tech",name:"Hologram Lab",icon:"🧪",pay:290,xp:180,desc:"Precision science simulator.",mode:"precision",member:"pro"},
{id:"pro-music",name:"Studio Rhythm Master",icon:"🎛️",pay:280,xp:175,desc:"Advanced pattern-repeat rhythm game.",mode:"rhythm",member:"pro"}
];
function activityPage(){
 var x=state(),s=x.s,e=x.e;var all=activities.map(function(a){return Object.assign({},a,{mode:modes[a.id]||"pattern"})}).concat(specialtyActivities);
 return '<section class="panel lr-promo"><h2>Play actual minigames.</h2><p>Catch the right moment while fishing, remember the cards, hit moving challenges with a target, create recipes, repeat rhythm patterns and solve visual sequences. Complete the full activity to receive a reward.</p></section>'+
 kicker("Activities & Challenges",all.length+" interactive experiences")+'<div class="grid">'+all.map(function(a){var gate=!canMember(a.member,e);
 return '<article class="card"><div class="feature-kicker"><span class="icon-tile">'+a.icon+'</span><span class="tag">'+esc(a.mode.toUpperCase())+'</span></div><h3>'+esc(a.name)+'</h3><p>'+esc(a.desc)+'</p><div class="stats"><b>'+currency(a.pay)+' base pay</b><span>'+a.xp+' XP</span>'+(a.member?'<span>Requires '+a.member.toUpperCase()+'</span>':"")+'</div>'+
 btn(gate?"Membership required":"Play minigame →","beginact",a.id,"primary",gate)+'</article>'}).join("")+'</div>';
}
function profilePage(){
 var x=state(),s=x.s,e=x.e,stuff=items.filter(function(i){return owned(i.id,e)});
 var nav=["Overview","Wardrobe","Collection","Achievements"],icons=["◉","✦","▦","★"];
 var areas={
Overview:'<div class="columns"><section class="panel"><h2>Resident Identity</h2><div class="feature-kicker"><span class="icon-tile">'+s.avatar+'</span><div><h3>'+esc(s.name)+'</h3><span class="tag">'+esc(ranks[e.rank].name)+'</span> <span class="tag gold">'+esc(e.membership.toUpperCase())+'</span></div></div><form id="lr-name-form" class="selectrow" style="margin:17px 0"><input name="name" class="field" maxlength="24" required value="'+esc(s.name)+'" aria-label="Resident name"><button class="btn primary">Save name</button></form><p>Pick an avatar below:</p><div class="selectrow">'+["🧑","👩","👨","🧑‍💻","👩‍🎨","👨‍🍳","🧑‍🚀","🧑‍🎤"].map(function(a){return btn(a,"avatar",a,a===s.avatar?"primary":"soft")}).join("")+'</div></section><section class="panel"><h2>Your Journey</h2>'+[["Total XP",s.totalXp],["Current rank",ranks[e.rank].name],["Shifts completed",s.shifts],["Activities completed",s.activities],["Properties",s.properties.length],["Businesses",Object.keys(e.businesses).length],["Quests claimed",e.claimedQuests],["Perfect games",e.perfectGames]].map(function(row){return '<div class="log-item"><span>'+row[0]+'</span><b>'+esc(row[1])+'</b></div>'}).join("")+'</section></div>',
Wardrobe:'<section class="panel"><h2>Wear & Equip Your Rewards</h2><p>Equipped title: '+esc(e.equipped.title||"Resident")+' · Theme: '+esc(e.equipped.theme||"default")+' · Cursor: '+esc(e.equipped.cursor||"classic")+'</p>'+btn("Default theme","defaulttheme")+btn("Classic cursor","defaultcursor")+ '<div class="grid" style="margin-top:15px">'+stuff.filter(function(i){return i.theme||i.cursor||i.title}).map(function(i){return '<article class="card"><span class="icon-tile">'+i.icon+'</span><b>'+esc(i.name)+'</b>'+btn("Equip","equip",i.id,"primary")+'</article>'}).join("")+'</div></section>',
Collection:'<section class="panel"><h2>Purchased Collection</h2><p>These products are owned in your Life RP save.</p>'+(stuff.length?'<div class="grid">'+stuff.map(function(i){return '<article class="card"><span class="icon-tile">'+i.icon+'</span><b>'+esc(i.name)+'</b><span class="tag green">OWNED</span>'+(i.game?btn("Play →","play",i.id,"primary"):"")+'</article>'}).join("")+'</div>':'<div class="empty">Nothing purchased yet. Visit the shop to build your collection.</div>')+'</section>',
Achievements:'<section class="panel"><h2>Earned Achievements & Badges</h2><p>Season badges and career missions stay on your resident profile.</p><div class="grid">'+(s.cosmetics||[]).concat((s.achievements||[]).map(function(a){return "Mission: "+a})).map(function(a){return '<div class="card"><b>★ '+esc(a)+'</b></div>'}).join("")+'</div></section>'
};
 return '<div class="selectrow" style="margin-bottom:17px">'+nav.map(function(n,i){return btn(icons[i]+" "+n,"profilesection",n,profileSection===n?"primary":"soft")}).join("")+'</div>'+areas[profileSection];
}
var miniSymbols=["🌲","🍎","🔧","☕","🚕","🎨","🐟","💎","⭐","📦"];
function initMini(mode,advanced){
 var m={kind:mode,round:0,total:advanced?7:5,wins:0,misses:0,matches:0,flipped:[],known:[],value:50,moved:false};
 if(mode==="memory"){var pairs=shuffle(miniSymbols).slice(0,advanced?4:3);m.cards=shuffle(pairs.concat(pairs));m.known=[];m.total=pairs.length}
 else if(mode==="precision"){m.total=advanced?6:4;m.target=25+Math.floor(Math.random()*51)}
 else if(mode==="rhythm"){m.total=advanced?7:5;m.pattern=Array.from({length:m.total},function(){return Math.floor(Math.random()*4)});m.answer=0}
 else{m.targets=Array.from({length:m.total},function(){return Math.floor(Math.random()*4)});m.options=mode==="recipe"?["Prepare","Heat","Plate","Serve"]:mode==="pattern"?["North","East","South","West"]:["◉","◇","★","⬟"]}
 return m;
}
function taskMode(kind,id){
 if(kind==="activity")return modes[id]||find(specialtyActivities,id)?.mode||"pattern";
 if(kind==="business")return find(businessTypes,id)?.mode||"recipe";
 var j=find(jobs,id);if(!j)return "pattern";
 var lookup={"Food & Hospitality":"recipe","Retail & Services":"target","Transport":"pattern","Public Service":"memory","Healthcare":"memory","Education":"pattern","Trades":"precision","Outdoors":"precision","Creative":"target","Media":"rhythm","Technology":"pattern"};
 return lookup[j.field]||"pattern";
}
function launch(kind,id){
 if(challenge)return;
 var x=state(),s=x.s,e=x.e,source=kind==="job"?find(jobs,id):kind==="activity"?(find(activities,id)||find(specialtyActivities,id)):find(businessTypes,id);
 if(!source)return;
 if(kind==="activity"&&source.member&&!canMember(source.member,e))return toast("Membership required.");
 if(kind==="business"&&(!e.businesses[id]||e.businesses[id].stock<1))return toast("Restock supplies before serving customers.");
 var gate=(id==="pilot"||id==="scientist")?2:(["paramedic","firefighter","nurse","police"].includes(id)?1:0);
 if(kind==="job"&&e.rank<gate)return toast("Earn a higher rank to unlock this career.");
 var questions=[];
 if(kind==="job"){
 var bank=(source.questions||[]).concat(questionBank[source.field]||[]);
 questions=shuffle(bank).slice(0,3).map(function(q){return {prompt:q[0],correct:q[1],options:shuffle(q.slice(1))}});
 }
 challenge={kind:kind,id:id,name:source.name,source:source,stage:"intro",questions:questions,step:0,correct:0,mini:null,gameType:taskMode(kind,id),score:0,answered:false};
 bridge.refresh();
}
function finishChallenge(){
 var c=challenge;if(!c)return;challenge=null;
 var all=(c.questions.length+(c.mini?.total||0)),points=c.correct+(c.mini?.wins||0),perfect=points>=all&&(!c.mini||c.mini.misses===0),percent=all?points/all:0;
 var base=c.kind==="job"?c.source.pay:c.kind==="activity"?c.source.pay:Math.round(c.source.revenue*(1+((state().e.businesses[c.id]?.level||1)-1)*.25));
 var gain=Math.round(base*(.6+.65*percent)),xp=Math.round(70+points*16+(c.kind==="business"?40:0));
 update(function(s,e){
  reward(s,(c.kind==="job"?"Shift: ":c.kind==="activity"?"Activity: ":"Customer: ")+c.name,gain,xp,0);
  if(c.kind==="job"){s.job=c.id;s.shifts++;s.completedJobs[c.id]=(s.completedJobs[c.id]||0)+1;eventUpdate(s,e,"shift")}
  if(c.kind==="activity"){s.activities++;s.completedActivities[c.id]=(s.completedActivities[c.id]||0)+1;eventUpdate(s,e,"activity")}
  if(c.kind==="business"){e.businesses[c.id].stock--;e.businesses[c.id].served++;eventUpdate(s,e,"business")}
  if(perfect){e.perfectGames++;eventUpdate(s,e,"perfect")}
  e.lastMini=c.name;
 });
 toast("Completed "+c.name+"! "+currency(gain)+" earned · "+xp+" XP"+(perfect?" · PERFECT!":""));
}
function startMini(){var c=challenge;c.stage="minigame";c.mini=initMini(c.gameType,c.source.member==="pro");bridge.refresh()}
function advanceMini(){
 var c=challenge,m=c.mini;if(!m)return;
 if(m.kind==="memory"){if(m.matches>=m.total)return finishChallenge();return}
 if(m.kind==="rhythm"){if(m.answer>=m.total)return finishChallenge();return}
 if(m.round>=m.total){finishChallenge();return}
 if(m.kind==="precision"){m.target=25+Math.floor(Math.random()*51);m.value=50;m.moved=false}
 bridge.refresh();
}
function handleMini(act,id){
 var c=challenge,m=c?.mini;if(!m)return;
 if(act==="minipick"){
  if(m.kind==="memory"){
   var index=Number(id);
   if(!Number.isInteger(index)||index<0||index>=m.cards.length||m.known.includes(index)||m.flipped.includes(index)||m.flipped.length>=2)return;
   m.flipped.push(index);
   if(m.flipped.length===2){
    var [a,b]=m.flipped;
    if(m.cards[a]===m.cards[b]){
     m.known.push(a,b);m.matches++;m.wins++;m.flipped=[];
     if(m.matches>=m.total){bridge.refresh();setTimeout(finishChallenge,370);return}
    }else{
     m.misses++;bridge.refresh();setTimeout(function(){if(challenge===c&&c.mini===m){m.flipped=[];bridge.refresh()}},600);return;
    }
   }
  }else if(m.kind==="precision")return;
  else if(m.kind==="rhythm"){
   var n=Number(id);
   if(n===m.pattern[m.answer]){m.answer++;m.wins++;if(m.answer>=m.total){bridge.refresh();setTimeout(finishChallenge,350);return}}
   else{m.misses++;m.answer=0;m.wins=0;}
  }else{
   var idx=Number(id);
   if(idx===m.targets[m.round])m.wins++;else m.misses++;
   m.round++;
   if(m.round>=m.total){bridge.refresh();setTimeout(finishChallenge,350);return}
  }
  bridge.refresh();return;
 }
 if(act==="precisioncheck"&&m.kind==="precision"){
  if(!m.moved)return toast("Move the slider to aim before submitting.");
  if(Math.abs(m.value-m.target)<=9)m.wins++;else m.misses++;
  m.round++;advanceMini();
 }
}
function challengeHTML(){
 if(!challenge)return null;
 var c=challenge,m=c.mini;
 var head='<section class="panel lr-promo" style="margin-bottom:15px"><span class="tag">INTERACTIVE '+esc(c.kind.toUpperCase())+'</span><h2>'+esc(c.name)+'</h2><p>Complete each task to receive payment and progress. You can leave, but unfinished challenges give no rewards.</p>'+btn("Leave challenge","leavechallenge",null,"ghost")+'</section>';
 if(c.stage==="intro")return head+'<section class="panel challenge"><span class="tag">BRIEFING</span><h2>Ready to get started?</h2><p>'+(c.kind==="job"?"First, answer three varied work scenarios. Then complete the practical task.":c.kind==="business"?"You'll take care of a customer's order in a minigame. Supplies are spent only when you finish.":"This activity is a complete hands-on minigame. Your accuracy changes your payout.")+'</p><div class="lr-banner">Minigame type: <b>'+esc(c.gameType.toUpperCase())+'</b></div>'+btn("Start challenge →","startchallenge",null,"primary")+'</section>';
 if(c.stage==="questions"){
  var q=c.questions[c.step];
  return head+'<section class="panel challenge"><div class="eyebrow">WORK SHIFT · SITUATION '+(c.step+1)+' / '+c.questions.length+'</div><h2>'+esc(q.prompt)+'</h2><p>Choose the most suitable answer. Each shift randomly selects a new set of questions.</p><div class="answers">'+q.options.map(function(o,i){return '<button type="button" class="answer" data-lr="question" data-arg="'+i+'">'+esc(o)+'</button>'}).join("")+'</div><p class="hint">Correct so far: '+c.correct+' / '+c.step+'</p></section>';
 }
 if(c.stage==="minigame"){
  var body='<span class="tag">MINIGAME · '+esc(m.kind.toUpperCase())+'</span>';
  if(m.kind==="memory"){
   body+='<h2>Memory Match</h2><p>Find matching pairs by turning over the tiles. Match all pairs to complete the task.</p><div class="lr-memory">'+m.cards.map(function(sym,i){var show=m.flipped.includes(i)||m.known.includes(i);return '<button type="button" class="lr-tile" data-lr="minipick" data-arg="'+i+'" '+(m.known.includes(i)?"disabled":"")+' aria-label="Memory card '+(i+1)+'">'+(show?sym:"?")+'</button>'}).join("")+'</div><p class="lr-progress-number">Pairs '+m.matches+'/'+m.total+' · Misses '+m.misses+'</p>';
  }else if(m.kind==="precision"){
   body+='<h2>Precision Challenge</h2><p>Adjust the slider as close as possible to the requested target, then submit. Aim within 9 points to score.</p><div class="lr-mega" style="text-align:center">Target '+m.target+'</div><div class="lr-precision"><label for="lr-range">Your setting: <b id="lr-readout">'+m.value+'</b></label><input id="lr-range" type="range" min="0" max="100" step="1" value="'+m.value+'" data-lr-range></div>'+btn("Lock in setting","precisioncheck",null,"primary")+ '<p class="lr-progress-number">Round '+(m.round+1)+'/'+m.total+' · Accurate '+m.wins+'</p>';
  }else if(m.kind==="rhythm"){
   body+='<h2>Follow the Beat</h2><p>Memorise the colour sequence, then tap the buttons in the same order. A mistake restarts the sequence.</p><div class="selectrow" style="justify-content:center;margin:20px 0">'+m.pattern.map(function(i){return '<span class="lr-chip">'+["Blue","Green","Orange","Pink"][i]+'</span>'}).join(" ")+'</div><div class="lr-buttons">'+["Blue","Green","Orange","Pink"].map(function(col,i){return '<button type="button" class="lr-answer" data-lr="minipick" data-arg="'+i+'">'+col+'</button>'}).join("")+'</div><p class="lr-progress-number">Notes '+m.answer+'/'+m.total+' · Misses '+m.misses+'</p>';
  }else{
   var target=m.targets[m.round],clues=m.options;
   body+='<h2>'+(m.kind==="target"?"Quick Target Practice":m.kind==="recipe"?"Complete the Order":"Navigation Sequence")+'</h2><p>'+(m.kind==="recipe"?"Follow each order instruction by selecting its matching station.":m.kind==="pattern"?"Choose the correct navigation instruction to move along the route.":"Identify the requested symbol and tap it accurately.")+'</p><div class="lr-mega" style="text-align:center;margin:20px 0">Find: '+esc(clues[target])+'</div><div class="lr-buttons">'+shuffle([0,1,2,3]).map(function(i){return '<button type="button" class="lr-answer" data-lr="minipick" data-arg="'+i+'">'+esc(clues[i])+'</button>'}).join("")+'</div><p class="lr-progress-number">Task '+(m.round+1)+'/'+m.total+' · Correct '+m.wins+' · Misses '+m.misses+'</p>';
  }
  return head+'<section class="panel challenge">'+body+'</section>';
 }
 return head;
}
function act(name,id){
 var x=state(),s=x.s,e=x.e;
 if(name==="showmembers"){shopFilter="All";document.getElementById("app")?.scrollTo(0,0);toast("Membership cards are below the shop.");return}
 if(name==="shopfilter"){shopFilter=id;return bridge.refresh()}
 if(name==="profilesection"){profileSection=id;return bridge.refresh()}
 if(name==="beginjob")return launch("job",id);
 if(name==="beginact")return launch("activity",id);
 if(name==="serve")return launch("business",id);
 if(name==="leavechallenge"){challenge=null;return bridge.refresh()}
 if(name==="startchallenge"){if(!challenge)return;return challenge.questions.length?(challenge.stage="questions",bridge.refresh()):startMini()}
 if(name==="question"){
  if(!challenge||challenge.stage!=="questions")return;
  var q=challenge.questions[challenge.step];if(q.options[Number(id)]===undefined)return;
  if(q.options[Number(id)]===q.correct)challenge.correct++;
  challenge.step++;return challenge.step>=challenge.questions.length?startMini():bridge.refresh();
 }
 if(["minipick","precisioncheck"].includes(name))return handleMini(name,id);
 if(name==="selectjob"){if(!find(jobs,id))return;update(function(s){s.job=id});return toast("Career selected!")}
 if(name==="questaccept"){
  var q=questByKey(id);if(!q||!questsActive().some(function(a){return a.key===id}))return;
  if(q.requires&&e.quests[q.requires]?.status!=="claimed")return toast("Complete the required quest first.");
  update(function(s,e){if(!e.quests[id])e.quests[id]={status:"active",count:0}});
  return toast("Quest accepted: "+q.title);
 }
 if(name==="questclaim"){
  var q=questByKey(id);if(!q||!questsActive().some(function(a){return a.key===id}))return;
  if(e.quests[id]?.status!=="ready")return;
  update(function(s,e){e.quests[id].status="claimed";e.claimedQuests++;reward(s,"Quest: "+q.title,q.cash,q.xp,q.pass)});
  return toast("Quest rewards claimed! Season XP +"+q.pass);
 }
 if(name==="member"){
  var price=id==="plus"?4500:e.membership==="plus"?8000:12500;
  if((id==="plus"&&e.membership!=="free")||(id==="pro"&&e.membership==="pro")||!["plus","pro"].includes(id))return;
  if(s.cash<price)return toast("You need more virtual money.");
  update(function(s,e){if(!buy(s,"Lolite "+id,price))return;e.membership=id;e.equipped.title=id==="pro"?"Lolite Pro":"Lolite Plus"});
  return toast("Lolite "+id.toUpperCase()+" unlocked!");
 }
 if(name==="rank"){
  var next=Number(id);if(next!==e.rank+1||!ranks[next])return;
  var req=rankReq(ranks[next],s,e);if(!req.every(function(a){return a[0]}))return toast("Complete the rank requirements first.");
  update(function(s,e){if(!buy(s,"Rank promotion: "+ranks[next].name,ranks[next].fee))return;e.rank=next;eventUpdate(s,e,"rank");reward(s,"Rank promotion bonus",180*next,90*next,0)});
  return toast("Promoted to "+ranks[next].name+"!");
 }
 if(name==="buybiz"){
  var b=find(businessTypes,id);if(!b||e.businesses[id]||e.rank<b.rank||s.properties.length<b.properties||!canMember(b.member,e))return;
  if(s.cash<b.price)return toast("Not enough cash to open this business.");
  update(function(s,e){if(!buy(s,"Bought "+b.name,b.price))return;e.businesses[b.id]={level:1,stock:2,served:0};eventUpdate(s,e,"buybusiness")});
  return toast(b.name+" is now open! 2 starter supply units included.");
 }
 if(name==="restock"){
  var b=find(businessTypes,id);if(!b||!e.businesses[id]||e.businesses[id].stock>=5||s.cash<b.stock)return;
  update(function(s,e){if(!buy(s,"Restock "+b.name,b.stock))return;e.businesses[id].stock+=3});
  return toast("Supplies restocked. Go serve some customers!");
 }
 if(name==="upgradebiz"){
  var b=find(businessTypes,id),bo=e.businesses[id];if(!b||!bo||bo.level>=4||s.cash<b.price*bo.level)return;
  update(function(s,e){if(!buy(s,"Upgrade "+b.name,b.price*e.businesses[id].level))return;e.businesses[id].level++});
  return toast("Business upgraded! Higher revenue per customer.");
 }
 if(name==="buyitem"){
  var it=find(items,id);if(!it||owned(id,e)||!canMember(it.member,e)||s.cash<it.price)return;
  update(function(s,e){if(!buy(s,"Purchased "+it.name,it.price))return;e.owned.push(it.id);eventUpdate(s,e,"purchase")});
  return toast("Purchased "+it.name+"!");
 }
 if(name==="equip"){
  var it=find(items,id);if(!it||!owned(id,e))return;
  update(function(s,e){if(it.theme)e.equipped.theme=it.theme;if(it.cursor)e.equipped.cursor=it.cursor;if(it.title)e.equipped.title=it.title;eventUpdate(s,e,"equip")});
  if(it.theme){document.body.dataset.lifeTheme=it.theme;post("wallpaper",it.wall)}
  if(it.cursor)post("cursor",it.cursor);
  return toast(it.name+" equipped!");
 }
 if(name==="defaulttheme"){update(function(s,e){e.equipped.theme="default"});document.body.dataset.lifeTheme="default";return toast("Default theme equipped.")}
 if(name==="defaultcursor"){update(function(s,e){e.equipped.cursor="classic"});post("cursor","classic");return toast("Classic cursor equipped.")}
 if(name==="play"){
  var it=find(items,id);if(!it?.game||!owned(id,e))return;
  post("game",it.game);return toast("Opening the Lolite game launcher…");
 }
 if(name==="premiumseason"){
  if(s.premium||s.cash<2800)return;
  update(function(s){if(!buy(s,"Season Premium Pass",2800))return;s.premium=true});
  return toast("Premium season reward track unlocked!");
 }
 if(name==="passclaim"){
  var bits=String(id).split(":"),mode=bits[0],tier=Number(bits[1]),premium=mode==="premium";
  if(!["free","premium"].includes(mode)||!Number.isInteger(tier)||tier<1||tier>18||s.passXp<tier*400||premium&&!s.premium)return;
  if((premium?s.premiumRewards:s.freeRewards).includes(tier))return;
  update(function(s,e){
   (premium?s.premiumRewards:s.freeRewards).push(tier);
   if((premium&&tier%6===0)||(!premium&&tier%5===0)){
    var badge=(premium?"Premium ":"Season ")+season()+" · Tier "+tier;
    if(!s.cosmetics.includes(badge))s.cosmetics.push(badge);
   }else{reward(s,"Season tier "+tier,premium?120+tier*42:65+tier*25,0,0)}
   eventUpdate(s,e,"pass");
  });
  return toast("Season tier "+tier+" reward collected!");
 }
 if(name==="avatar"){
  var avatars=["🧑","👩","👨","🧑‍💻","👩‍🎨","👨‍🍳","🧑‍🚀","🧑‍🎤"];if(!avatars.includes(id))return;
  update(function(s){s.avatar=id});return toast("Avatar updated.");
 }
}
function post(kind,value){
 if(window.parent&&window.parent!==window)window.parent.postMessage({type:"lolite-life-rp",kind:kind,value:value},location.origin);
 else if(kind==="game"){var paths={pong:"../../html%20games/lolite-pong.html","2048":"../../html%20games/lolite-2048.html",sokoban:"../../html%20games/lolite-sokoban.html"};if(paths[value])window.open(paths[value],"_blank","noopener,noreferrer");else toast("Open Minecraft from the Lolite OS desktop launcher.")}
}
document.addEventListener("click",function(ev){var b=ev.target.closest("[data-lr]");if(!b||b.disabled)return;ev.preventDefault();act(b.dataset.lr,b.dataset.arg)});
document.addEventListener("input",function(ev){if(ev.target.matches("[data-lr-range]")&&challenge?.mini?.kind==="precision"){challenge.mini.value=Number(ev.target.value);challenge.mini.moved=true;var n=document.getElementById("lr-readout");if(n)n.textContent=String(challenge.mini.value)}});
document.addEventListener("submit",function(ev){if(ev.target.id==="lr-name-form"){ev.preventDefault();var n=ev.target.elements.name.value.trim().slice(0,24);if(!n)return;update(function(s){s.name=n});toast("Profile name updated.")}});
window.LoliteLifeRPExpansion=Object.freeze({
 intercept:function(action,id){if(action==="shift"||action==="activity"){launch(action==="shift"?"job":"activity",id);return true}if(action==="tab"&&challenge){challenge=null}return false},
 challengeHTML:challengeHTML,
 page:function(tab){if(tab==="home")return upgradedHome();if(tab==="quests")return questPage();if(tab==="businesses")return businessesPage();if(tab==="shop")return shopPage();if(tab==="ranks")return rankPage();if(tab==="jobs")return jobPage();if(tab==="activities")return activityPage();if(tab==="profile")return profilePage();if(tab==="pass")return seasonPass();return null},
 onRendered:function(){var e=state().e;document.body.dataset.lifeTheme=e.equipped.theme||"default"}
});
bridge.refresh();
})();