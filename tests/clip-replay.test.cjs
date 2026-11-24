const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {init,cluster,load,tick,join,recorderHarness}=require('./clips/replay-harness.cjs');

test('Replay parses split element headers and unknown-sized clusters',async()=>{
 const {LoliteReplayBuffer:BufferClass}=load();
 const bytes=join([init(),cluster(0,{unknown:true}),cluster(1000,{unknown:true}),cluster(2000)]);
 for(const length of [1,7,103,8191]){
  const buffer=new BufferClass();
  for(let i=0;i<bytes.length;i+=length)buffer.push(bytes.subarray(i,i+length));
  assert.equal(buffer.snapshot().duration,3);
  assert.equal(buffer.frames.filter(f=>f.key).length,3);
  assert.equal(buffer.pending.length,0);
 }
});
test('Long captures keep only the recent window and snapshots rebase time to zero',()=>{
 const {LoliteReplayBuffer:BufferClass}=load(),buffer=new BufferClass({seconds:30});
 buffer.push(init());
 for(let second=0;second<1200;second++)buffer.push(cluster(second*1000));
 assert.equal(buffer.frames[0].at,1170000);
 assert.equal(buffer.status().bufferedSeconds,30);
 assert.equal(buffer.frames.length,300);
 assert.ok(buffer.status().bytes<15000);
 const snapshot=buffer.snapshot();assert.equal(snapshot.duration,30);
 assert.equal(snapshot.blob.type,'video/webm');
});
test('Warmup saves the available footage and keyframe groups survive remuxing',()=>{
 const {LoliteReplayBuffer:BufferClass}=load(),buffer=new BufferClass({seconds:60});
 assert.throws(()=>buffer.snapshot(),/warming up/);
 buffer.push(join([init(),cluster(0,{group:true}),cluster(1000,{group:true})]));
 assert.equal(buffer.snapshot().duration,2);
 const saved=buffer.snapshot().blob;
 buffer.push(cluster(2000,{group:true}));
 assert.equal(buffer.snapshot().duration,3);
 assert.ok(saved.size<buffer.snapshot().blob.size);
});
test('The byte cap clears old footage at keyframes and reset releases all video data',()=>{
 const {LoliteReplayBuffer:BufferClass}=load(),buffer=new BufferClass({seconds:60,maxBytes:1200});
 buffer.push(init());for(let second=0;second<10;second++)buffer.push(cluster(second*1000));
 assert.ok(buffer.status().bytes<=1200);assert.equal(buffer.status().limited,true);
 assert.ok(buffer.frames[0].key);assert.ok(buffer.snapshot().duration<10);
 buffer.clear();assert.equal(buffer.status().bytes,0);assert.equal(buffer.status().bufferedSeconds,0);
 assert.equal(buffer.header,null);assert.equal(buffer.tracks,null);
});
test('An encoder that withholds keyframes cannot retain footage indefinitely',()=>{
 const {LoliteReplayBuffer:BufferClass}=load(),buffer=new BufferClass({seconds:30});
 buffer.push(init());buffer.push(cluster(0));
 for(let second=1;second<100;second++)buffer.push(cluster(second*1000,{keyframe:false}));
 assert.equal(buffer.status().bytes,0);assert.equal(buffer.status().bufferedSeconds,0);
 assert.throws(()=>buffer.snapshot(),/keyframe/);
 buffer.push(cluster(100000));assert.equal(buffer.snapshot().duration,1);
});
test('Enabling replay requests permission once; saving keeps capture alive',async()=>{
 const h=recorderHarness();assert.equal(h.captures,0);
 assert.equal(await h.replay.start(),true);assert.equal(h.captures,1);
 h.recorder.data(join([init(),cluster(0),cluster(1000)]));await h.replay.queue;
 const saving=h.replay.save();assert.equal(h.recorder.requests,1);
 await assert.rejects(h.replay.save(),/already/);
 h.recorder.data(cluster(2000));const first=await saving;
 assert.equal(first.duration,3);assert.equal(h.replay.status().active,true);
 assert.equal(h.track.readyState,'live');
 h.recorder.data(cluster(3000));await h.replay.queue;
 const secondSave=h.replay.save();h.recorder.data(cluster(4000));
 assert.equal((await secondSave).duration,5);assert.equal(first.duration,3);
 assert.equal(h.captures,1);h.replay.stop();assert.equal(h.track.readyState,'ended');
 assert.equal(h.replay.status().bytes,0);
});
test('Stopping while the permission chooser is open releases a late-granted source',async()=>{
 const h=recorderHarness({deferred:true});const starting=h.replay.start();
 assert.equal(h.replay.status().requesting,true);h.replay.stop();h.grant();
 assert.equal(await starting,false);assert.equal(h.track.readyState,'ended');
 assert.equal(h.replay.status().active,false);
});
test('Ending screen sharing rejects a pending save and discards the temporary buffer',async()=>{
 const h=recorderHarness();await h.replay.start();
 h.recorder.data(join([init(),cluster(0)]));await h.replay.queue;
 const save=assert.rejects(h.replay.save(),/stopped/);h.end();await save;
 assert.equal(h.replay.status().active,false);assert.equal(h.replay.status().bytes,0);
 assert.equal(h.stops.length,1);
});
test('Corrupt data and unsupported formats fail cleanly without leaving screen capture active',async()=>{
 const h=recorderHarness();await h.replay.start();h.recorder.data(new Uint8Array([0,0,0]));
 await h.replay.queue;assert.equal(h.track.readyState,'ended');assert.equal(h.errors.length,1);
 const unsupported=recorderHarness({supported:false});assert.equal(await unsupported.replay.start(),false);
 assert.equal(unsupported.captures,0);assert.match(unsupported.errors[0],/WebM/);
});
test('Blob reads remain ordered when the first MediaRecorder chunk is delayed',async()=>{
 const h=recorderHarness();await h.replay.start();let release;
 const bytes=join([init(),cluster(0)]);
 h.recorder.emit('dataavailable',{data:{size:bytes.length,arrayBuffer:()=>new Promise(resolve=>{release=()=>resolve(bytes)})}});
 h.recorder.data(cluster(1000));await tick();assert.equal(h.replay.status().bufferedSeconds,0);
 release();await h.replay.queue;assert.equal(h.replay.status().bufferedSeconds,2);h.replay.stop();
});

const ffmpegAvailable=spawnSync('ffmpeg',['-version'],{stdio:'ignore'}).status===0;
test('Real VP8 + Opus snapshots decode and seek after 30/60-second pruning', {skip:!ffmpegAvailable,timeout:30000},async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lolite-replay-'));
 try{
  const input=path.join(temp,'source.webm');
  const encode=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=160x90:rate=10',
   '-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','68','-c:v','libvpx','-deadline','realtime','-cpu-used','8',
   '-b:v','70k','-g','10','-c:a','libopus','-b:a','16k','-cluster_time_limit','1000','-y',input],{encoding:'utf8'});
  assert.equal(encode.status,0,encode.stderr);
  const data=fs.readFileSync(input),{LoliteReplayBuffer:BufferClass}=load();
  for(const seconds of [30,60]){
   const buffer=new BufferClass({seconds});
   for(let i=0;i<data.length;i+=8191)buffer.push(data.subarray(i,i+8191));
   const snapshot=buffer.snapshot(),output=path.join(temp,'replay-'+seconds+'.webm');
   assert.ok(snapshot.duration>=seconds&&snapshot.duration<seconds+1.1);
   fs.writeFileSync(output,Buffer.from(await snapshot.blob.arrayBuffer()));
   const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name','-of','json',output],{encoding:'utf8'});
   assert.equal(probe.status,0,probe.stderr);
   const metadata=JSON.parse(probe.stdout);assert.ok(Math.abs(Number(metadata.format.duration)-snapshot.duration)<0.1);
   assert.deepEqual(metadata.streams.map(s=>s.codec_name),['vp8','opus']);
   for(const offset of [0,seconds-2]){
    const decode=spawnSync('ffmpeg',['-hide_banner','-v','error','-ss',String(offset),'-i',output,'-t','1','-f','null','-'],{encoding:'utf8'});
    assert.equal(decode.status,0,decode.stderr);assert.equal(decode.stderr,'');
   }
  }
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
});
