const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fixture,flush,deferred}=require('./support.cjs');
const setup=async t=>{const f=fixture();t.after(f.close);await f.open();return f};
const voiceSetup=async(t,options={})=>{const f=fixture({scripts:['chat-v2','chat-extras'],...options});t.after(f.close);await f.runTimers(0);await f.open();return f};

test('background updates preserve textarea, caret, selected menu, and unchanged subscription',async t=>{
 const f=await setup(t),input=f.doc.querySelector('textarea'),menu=f.doc.querySelector('details');
 input.value='Still writing';input.focus();input.setSelectionRange(3,7);menu.open=true;
 const channelCount=f.channels.length;
 await f.w.LoliteChat.refresh();await f.w.LoliteChat.refresh();
 assert.equal(f.doc.querySelector('textarea'),input);assert.equal(input.value,'Still writing');assert.equal(input.selectionStart,3);
 assert.equal(f.doc.querySelector('details'),menu);assert.equal(menu.open,true);assert.equal(f.channels.length,channelCount);
});
test('profile form values and focus survive a background refresh',async t=>{
 const f=await setup(t);await f.w.LoliteChat.editProfile();
 const input=f.doc.querySelector('[name=display]');input.value='Unfinished edit';input.focus();
 await f.w.LoliteChat.refresh();assert.equal(f.doc.querySelector('[name=display]'),input);assert.equal(input.value,'Unfinished edit');assert.equal(f.doc.activeElement,input);
});
test('account changes discard the previous composer and never restore another account draft',async t=>{
 const f=await setup(t),old=f.doc.querySelector('textarea');old.value='Alex private unfinished message';
 await f.setUser({id:'b'});await f.open();
 assert.equal(f.w.LoliteChat.getState().user.id,'b');assert.notEqual(f.doc.querySelector('textarea'),old);
 assert.equal(f.doc.querySelector('textarea').value,'');
 f.doc.querySelector('textarea').value='Sam private draft';
 await f.setUser(null);await f.w.LoliteChat.refresh();assert.equal(f.doc.querySelector('textarea'),null);
 await f.setUser({id:'a'});await f.open();assert.equal(f.doc.querySelector('textarea').value,'');
});
test('temporary refresh failure preserves the composer and recovers in place',async t=>{
 const f=await setup(t),input=f.doc.querySelector('textarea');input.value='Keep this';
 f.setHook(q=>q.table==='profiles'?{error:{message:'offline'}}:undefined);await f.w.LoliteChat.refresh();
 assert.equal(f.doc.querySelector('textarea'),input);assert.equal(input.value,'Keep this');assert.match(f.doc.querySelector('[role=status]').textContent,/draft is safe/);
 f.setHook(null);await f.w.LoliteChat.refresh();assert.equal(f.doc.querySelector('.lc-connection-warning'),null);
});
test('a delayed message load cannot paint a different conversation',async t=>{
 const f=await setup(t),wait=deferred();let first=true;
 f.setHook(q=>{if(first&&q.table==='messages'){first=false;return wait.promise}});
 const job=f.w.LoliteChat.refresh();await flush();
 await f.click('[data-lc-action=openConv][data-lc-id=other]');
 wait.resolve({data:[{id:2,conversation_id:'room',sender_id:'b',content:'Wrong room',created_at:new Date().toISOString()}]});await job;
 assert.equal(f.w.LoliteChat.getState().conversationId,'other');assert.doesNotMatch(f.doc.querySelector('.lc-message-scroll').textContent,/Wrong room/);
});
test('duplicate submissions are blocked across rerenders and newer typing survives',async t=>{
 const f=await setup(t),wait=deferred();let inserts=0;
 f.setHook(q=>{if(q.table==='messages'&&q.action==='insert'){inserts++;return wait.promise}});
 let input=f.doc.querySelector('textarea');input.value='First';input.dispatchEvent(new f.w.Event('input',{bubbles:true}));
 input.form.dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();
 await f.click('[data-lc-action=search]');input=f.doc.querySelector('textarea');input.value='Next message';
 input.form.dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();assert.equal(inserts,1);
 wait.resolve({data:[]});await flush();await f.w.LoliteChat.refresh();assert.equal(f.doc.querySelector('textarea').value,'Next message');assert.equal(f.doc.querySelector('.lc-send').disabled,false);
});
test('concurrent voice joins capture the microphone once',async t=>{
 const f=await voiceSetup(t);const [a,b]=await Promise.all([f.w.LoliteChatExtra.joinVoice(),f.w.LoliteChatExtra.joinVoice()]);
 assert.equal(a,true);assert.equal(b,true);assert.equal(f.captures(),1);assert.equal(f.channels.filter(c=>c.name.startsWith('lc-voice')).length,1);
});
test('cancel during microphone permission stops the late stream without joining',async t=>{
 const wait=deferred(),f=await voiceSetup(t,{microphone:()=>wait.promise});
 const join=f.w.LoliteChatExtra.joinVoice();await flush();f.w.LoliteChatExtra.stopVoice();const stream=f.stream();wait.resolve(stream);
 assert.equal(await join,false);assert.equal(stream.track.stopped,true);assert.equal(f.channels.filter(c=>c.name.startsWith('lc-voice')).length,0);
});
test('an offer arriving before presence sync is processed when its peer appears',async t=>{
 const f=await voiceSetup(t);await f.w.LoliteChatExtra.joinVoice();const c=f.channels.at(-1);
 await c.emit('broadcast','rtc',{from:'b',to:'a',kind:'offer',data:{type:'offer',sdp:'early'}});assert.equal(f.pcs.length,0);
 c.presence={a:[{}],b:[{}]};await c.emit('presence','sync');
 assert.equal(f.pcs.length,1);assert.equal(f.pcs[0].remoteDescription.sdp,'early');assert.ok(c.sent.some(m=>m.payload.kind==='answer'));
});
test('late callbacks from a closed room cannot create peers in its replacement',async t=>{
 const f=await voiceSetup(t);await f.w.LoliteChatExtra.joinVoice();const old=f.channels.at(-1);old.presence={b:[{}]};
 f.w.LoliteChatExtra.stopVoice();await f.w.LoliteChatExtra.joinVoice();
 await old.emit('broadcast','rtc',{from:'b',to:'a',kind:'offer',data:{type:'offer'}});await old.emit('presence','sync');assert.equal(f.pcs.length,0);
});
test('failed presence acknowledgement releases the microphone',async t=>{
 const f=await voiceSetup(t),original=f.db.channel;f.db.channel=(...args)=>{const c=original(...args);c.trackResult='timed out';return c};
 assert.equal(await f.w.LoliteChatExtra.joinVoice(),false);assert.equal(f.streams[0].track.stopped,true);assert.equal(f.w.LoliteChatExtra.connectionState().status,'idle');
});
test('connection state follows actual audio and a disconnect restarts ICE',async t=>{
 const f=await voiceSetup(t);await f.w.LoliteChatExtra.joinVoice();const c=f.channels.at(-1);c.presence={b:[{}]};await c.emit('presence','sync');
 assert.equal(f.w.LoliteChatExtra.connectionState().status,'connecting');const pc=f.pcs[0];pc.connect();assert.equal(f.w.LoliteChatExtra.connectionState().status,'connected');
 pc.connect('disconnected');assert.equal(f.w.LoliteChatExtra.connectionState().status,'reconnecting');await f.runTimers(4000);assert.equal(pc.restarts,1);
 f.w.LoliteChatExtra.stopVoice();assert.equal(pc.connectionState,'closed');assert.equal(f.streams[0].track.stopped,true);
});
test('a signalling send timeout is visible instead of pretending to connect',async t=>{
 const f=await voiceSetup(t);await f.w.LoliteChatExtra.joinVoice();const c=f.channels.at(-1);c.sendResult='timed out';c.presence={b:[{}]};await c.emit('presence','sync');
 assert.equal(f.w.LoliteChatExtra.connectionState().status,'failed');assert.match(f.doc.querySelector('.lc-voice-bar').textContent,/Retry audio/);
});
async function callsSetup(t){
 const f=fixture({scripts:['chat-v2','chat-extras','chat-calls']});t.after(f.close);await f.runTimers(0);await f.open();return f;
}
test('accepted invitations do not show connected before audio, and controls survive refresh',async t=>{
 const f=await callsSetup(t);await f.w.LoliteChatCalls.startCall('room');f.rows.chat_call_invites[0].status='accepted';await f.runTimers(5000);
 assert.match(f.doc.querySelector('.lc-active-call-status').textContent,/Connecting audio/);
 const button=f.doc.querySelector('#lcActiveCall [data-lc-call=toggleMute]');button.focus();f.w.LoliteChatCalls.refreshDock();
 assert.equal(f.doc.querySelector('#lcActiveCall [data-lc-call=toggleMute]'),button);assert.equal(f.doc.activeElement,button);assert.equal(f.doc.querySelector('#lcCallDock'),null);
 await f.click('[data-lc-call=minimize]');assert.ok(f.doc.querySelector('#lcCallDock'));assert.equal(f.doc.querySelector('#lcActiveCall'),null);
});
test('a call ends and releases audio when every invite is declined',async t=>{
 const f=await callsSetup(t);await f.w.LoliteChatCalls.startCall('room');f.rows.chat_call_invites[0].status='declined';await f.runTimers(5000);
 assert.equal(f.w.LoliteChatCalls.hasCall(),false);assert.equal(f.rows.chat_calls[0].status,'ended');assert.equal(f.streams[0].track.stopped,true);
});
test('cancel while starting a call cannot create an invitation later',async t=>{
 const f=await callsSetup(t),wait=deferred();let requested=false;f.w.navigator.mediaDevices.getUserMedia=()=>{requested=true;return wait.promise};
 const starting=f.w.LoliteChatCalls.startCall('room');await flush();assert.equal(requested,true);await f.w.LoliteChatCalls.hangup();const stream=f.stream();wait.resolve(stream);await starting;
 assert.equal(f.rows.chat_calls.length,0);assert.equal(f.rows.chat_call_invites.length,0);assert.equal(stream.track.stopped,true);assert.equal(f.doc.querySelector('#lcPendingCall'),null);
});

test('ending a call while the screen picker is pending stops the late capture',async t=>{
 const f=await voiceSetup(t),wait=deferred();await f.w.LoliteChatExtra.joinVoice();
 f.w.navigator.mediaDevices.getDisplayMedia=()=>wait.promise;const share=f.w.LoliteChatExtra.startScreenShare();
 f.w.LoliteChatExtra.stopVoice();const video=f.stream('video');wait.resolve(video);await share;
 assert.equal(video.track.stopped,true);assert.equal(f.doc.querySelector('#lcScreenViewer'),null);
});
test('a second disconnect still retries after the first recovery',async t=>{
 const f=await voiceSetup(t);await f.w.LoliteChatExtra.joinVoice();const c=f.channels.at(-1);c.presence={b:[{}]};await c.emit('presence','sync');
 const pc=f.pcs[0];pc.connect();pc.connect('disconnected');pc.connect();pc.connect('disconnected');await f.runTimers(4000);assert.equal(pc.restarts,1);
});
test('a stale poll cannot hang up a new call',async t=>{
 const f=await callsSetup(t);await f.w.LoliteChatCalls.startCall('room');await flush();
 const wait=deferred();let held=false;
 f.setHook(q=>{if(q.table==='chat_calls'&&q.action==='select'&&q.one&&!held){held=true;return wait.promise}});
 const poll=f.runTimers(5000);await flush();assert.equal(held,true);
 await f.w.LoliteChatCalls.hangup();await f.w.LoliteChatCalls.startCall('room');
 wait.resolve({data:{status:'ended'}});await poll;
 assert.equal(f.w.LoliteChatCalls.hasCall(),true);assert.equal(f.streams.at(-1).track.stopped,false);
});
