const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function harness(games=[]){
 const listeners=new Map(),events=[],requests=[],store=new Map(),session='e54c3c6e-a20a-4f16-82d5-5ce039a5e2af';
 const window={
  dispatchEvent:event=>events.push(event),
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}
 };
 const fetch=async(url,options={})=>{
  requests.push({url,method:options.method||'GET',body:options.body});
  return {ok:true,status:200,json:async()=>options.method==='POST'?{recorded:true}:{periodDays:30,games}};
 };
 const context={window,document:{readyState:'loading',addEventListener:(name,fn)=>listeners.set(name,fn)},
  localStorage:window.localStorage,CustomEvent:class{constructor(type,data){this.type=type;this.detail=data?.detail}},
  crypto:{randomUUID:()=>session},fetch,console,AbortController,setTimeout,clearTimeout,Date,Map,Set};
 vm.runInNewContext(read('core/game-popularity.js'),context);
 return {api:window.LoliteGamePopularity,window,events,requests,store,listeners};
}
test('Popular Games use actual 30-day counts in server response',async()=>{
 const h=harness([{file:'clgdbreeze.html',plays:27},{file:'clblockblast.html',plays:13}]);
 const status=await h.api.refresh();
 assert.equal(status.status,'ready');
 assert.equal(status.periodDays,30);
 assert.equal(h.api.countFor('clgdbreeze.html'),27);
 assert.equal(h.api.countFor('clblockblast.html'),13);
 assert.equal(h.api.countFor('not-counted.html'),0);
 assert.equal(h.requests[0].method,'GET');
 assert.match(h.requests[0].url,/lolite-game-popularity$/);
});
test('Unreported and restricted titles never become popularity recommendations',async()=>{
 const h=harness([{file:'slotmachine.html',plays:300},{file:'clblockblast.html',plays:9}]);
 await h.api.refresh();
 assert.equal(h.api.countFor('slotmachine.html'),0);
 assert.equal(h.api.countFor('clblockblast.html'),9);
 assert.equal(h.api.isEligible({file:'clblockblast.html',title:'Block Blast',category:'Puzzle & Brain'}),true);
 assert.equal(h.api.isEligible({file:'remote-20.html',title:'Casino Slots'}),false);
});
test('Game launches report only file and ephemeral page token and deduplicate repeats',async()=>{
 const h=harness([]);
 await h.api.record('clgdbreeze.html');
 await h.api.record('clgdbreeze.html');
 const post=h.requests.filter(r=>r.method==='POST');
 assert.equal(post.length,1);
 const payload=JSON.parse(post[0].body);
 assert.equal(payload.file,'clgdbreeze.html');
 assert.match(payload.session,/^[a-f0-9-]{36}$/);
 assert.deepEqual(Object.keys(payload).sort(),['file','session']);
 assert.equal(h.store.size,0,'No account or device ID is persisted');
});
test('People can stop contributing anonymous counts without losing rankings',async()=>{
 const h=harness([{file:'clgdbreeze.html',plays:5}]);
 h.api.setSharingEnabled(false);
 const accepted=await h.api.record('clgdbreeze.html');
 assert.equal(accepted,false);
 assert.equal(h.requests.filter(r=>r.method==='POST').length,0);
 await h.api.refresh();
 assert.equal(h.api.countFor('clgdbreeze.html'),5);
 assert.equal(h.api.shareEnabled(),false);
});
test('Store sorts by play counts rather than matching game-name keywords',()=>{
 const store=read('core/game-store.js');
 assert.doesNotMatch(store,/const isPopular=g=>\/baldi\|fnaf/);
 assert.match(store,/const ranked=list=>list\.filter\(isRanked\)\.sort/);
 assert.match(store,/return active==='Popular Games'\?ranked\(found\):/);
 assert.match(store,/active==='Recently Added'\?found\.sort/);
 assert.match(store,/No game launches counted yet/);
 assert.match(store,/Count my game launches anonymously/);
 assert.match(store,/launches in 30 days/);
 assert.match(store,/lolite:popular-games/);
});
test('Player counts launched games after real frame load, not blank or error screens',()=>{
 const player=read('core/game-player.js');
 assert.match(player,/frame\.addEventListener\('load'/);
 assert.match(player,/gameReady!=='1'/);
 assert.match(player,/LoliteGamePopularity\?\.record\?\.\(file\)/);
 assert.match(player,/trackFrame\(frame,file\)/);
 assert.match(player,/frame\.dataset\.gameReady='1'/);
 assert.match(player,/frame\.srcdoc=htmlWithBase/);
});
test('Only an aggregate API is exposed to the site, never a service-role key',()=>{
 const html=read('index.html'),client=read('core/game-popularity.js');
 const backend=read('supabase/functions/lolite-game-popularity/index.ts');
 assert.ok(html.indexOf('core/game-popularity.js')<html.indexOf('core/game-store.js'));
 assert.match(html,/core\/game-popularity\.css/);
 assert.doesNotMatch(client,/SERVICE_ROLE_KEY|sb_secret_|auth\.getUser/);
 assert.match(backend,/SUPABASE_SECRET_KEYS/);
 assert.match(backend,/lolite_record_game_launch/);
 assert.match(backend,/lolite_get_popular_games/);
 assert.match(backend,/allowedOrigins/);
});
