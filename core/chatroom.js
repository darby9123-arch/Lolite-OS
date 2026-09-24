/* Lolite Chat — a local-first community chat workspace inspired by modern chat apps. */
(()=>{
 const css=`
 .lolite-chat{display:grid;grid-template-columns:72px 190px 1fr 190px;height:100%;margin:-18px;background:#0b0e14;color:#edf1f7;overflow:hidden}
 .chat-servers{background:#090c12;border-right:1px solid #202631;padding:10px 9px;display:flex;flex-direction:column;gap:8px;align-items:center}
 .chat-server{width:48px;height:48px;border:0;border-radius:15px;background:#171c25;color:#aeb7c6;font-size:20px;cursor:pointer;transition:.15s}
 .chat-server:hover,.chat-server.active{border-radius:13px;background:#7468e8;color:#fff;transform:translateY(-1px)}
 .chat-channels{background:#11151d;border-right:1px solid #202631;display:flex;flex-direction:column;min-width:0}
 .chat-space{height:58px;padding:0 15px;display:flex;align-items:center;font-weight:800;border-bottom:1px solid #242a34}
 .chat-space small{display:block;color:#788396;font-weight:500;font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
 .chat-channel-list{padding:13px 9px;overflow:auto}
 .chat-label{font-size:10px;color:#737e90;font-weight:800;text-transform:uppercase;letter-spacing:.08em;padding:8px 8px 5px}
 .chat-channel{width:100%;border:0;background:transparent;color:#9da7b7;text-align:left;padding:9px 10px;border-radius:7px;cursor:pointer;font:inherit}
 .chat-channel:hover,.chat-channel.active{background:#252b37;color:#fff}
 .chat-main{display:flex;flex-direction:column;min-width:0;background:#151922}
 .chat-head{height:58px;display:flex;align-items:center;gap:9px;padding:0 18px;border-bottom:1px solid #292f3a;box-shadow:0 2px 8px #0002}
 .chat-head strong{font-size:15px}.chat-head span{color:#727d90}.chat-topic{margin-left:auto;color:#7f8999;font-size:11px}
 .chat-messages{flex:1;overflow:auto;padding:18px 20px}
 .chat-message{display:grid;grid-template-columns:38px 1fr;gap:10px;margin-bottom:17px}
 .chat-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#7065d9;color:#fff;font-weight:800}
 .chat-msg-meta{display:flex;align-items:baseline;gap:8px}.chat-msg-meta b{font-size:13px}.chat-msg-meta time{font-size:10px;color:#687386}
 .chat-msg-text{margin-top:3px;color:#c8ced8;line-height:1.45;word-break:break-word}
 .chat-composer{padding:10px 16px 15px}.chat-compose-box{display:flex;align-items:center;background:#202630;border:1px solid #303847;border-radius:10px;padding:5px 7px}
 .chat-compose-box input{flex:1;background:transparent;border:0;outline:0;color:#fff;padding:10px;font:inherit}
 .chat-compose-box button{border:0;border-radius:8px;background:#7166da;color:#fff;padding:9px 12px;cursor:pointer;font-weight:750}
 .chat-members{background:#11151d;border-left:1px solid #202631;padding:14px 12px;overflow:auto}.chat-members h4{margin:5px 7px 13px;color:#7c8798;font-size:10px;text-transform:uppercase;letter-spacing:.08em}
 .chat-member{display:flex;align-items:center;gap:9px;padding:7px;border-radius:7px;color:#b3bdcb;font-size:12px}.chat-member:hover{background:#1d232d}
 .chat-member i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#2a3342;font-style:normal;color:#fff;font-size:11px;font-weight:800}.chat-online{width:7px;height:7px;border-radius:50%;background:#54c27b;margin-left:auto}
 .chat-settings{border-top:1px solid #242a34;margin-top:auto;padding:10px}.chat-settings button{width:100%;background:#1a2029;border:1px solid #2a323e;color:#aeb7c5;border-radius:7px;padding:7px;cursor:pointer}
 .chat-empty{height:100%;display:grid;place-items:center;color:#727d8f;text-align:center}
 @media(max-width:900px){.lolite-chat{grid-template-columns:60px 165px 1fr}.chat-members{display:none}}
 @media(max-width:620px){.lolite-chat{grid-template-columns:1fr}.chat-servers,.chat-channels{display:none}}
 `;
 if(!document.getElementById('lolite-chat-style')){const s=document.createElement('style');s.id='lolite-chat-style';s.textContent=css;document.head.appendChild(s)}
 const channels=[['general','General chat'],['gaming','Games & Game Store'],['off-topic','Anything goes'],['support','Lolite OS help']];
 const members=['Darby','Lolite Bot','Alex','Jamie','Marcus'];
 const key='loliteChatMessages';
 const load=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}};
 const save=x=>localStorage.setItem(key,JSON.stringify(x));
 let channel='general';
 const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const initial=()=>{const all=load();if(Object.keys(all).length)return all;all.general=[{user:'Lolite Bot',text:'Welcome to Lolite Chat! This is your local chat workspace.',time:Date.now()-3600000},{user:'Lolite Bot',text:'Pick a channel on the left and start talking.',time:Date.now()-3500000}];save(all);return all};
 function renderMessages(root){const all=initial(),items=all[channel]||[];const box=root.querySelector('.chat-messages');box.innerHTML=items.length?items.map(m=>`<article class="chat-message"><div class="chat-avatar">${esc(m.user.slice(0,1).toUpperCase())}</div><div><div class="chat-msg-meta"><b>${esc(m.user)}</b><time>${new Date(m.time).toLocaleString()}</time></div><div class="chat-msg-text">${esc(m.text)}</div></div></article>`).join(''):`<div class="chat-empty"><div><strong>No messages yet</strong><br><span>Start the conversation in #${esc(channel)}.</span></div></div>`;box.scrollTop=box.scrollHeight}
 function send(root){const input=root.querySelector('#chatInput');const text=input.value.trim();if(!text)return;const all=initial();(all[channel] ||= []).push({user:localStorage.loliteChatName||'Darby',text,time:Date.now()});save(all);input.value='';renderMessages(root)}
 function shell(){return `<div class="lolite-chat"><aside class="chat-servers"><button class="chat-server active">L</button><button class="chat-server">+</button></aside><aside class="chat-channels"><div class="chat-space"><div>Lolite Community<small>CHATROOM</small></div></div><div class="chat-channel-list"><div class="chat-label">Text channels</div>${channels.map(c=>`<button class="chat-channel ${channel===c[0]?'active':''}" data-channel="${c[0]}"># &nbsp;${c[0]}</button>`).join('')}</div><div class="chat-settings"><button type="button" id="chatNameBtn">Profile: ${esc(localStorage.loliteChatName||'Darby')}</button></div></aside><main class="chat-main"><header class="chat-head"><strong>#</strong><strong id="chatChannelTitle">${channel}</strong><span>•</span><span>${channels.find(c=>c[0]===channel)?.[1]||''}</span><span class="chat-topic">Lolite Chat</span></header><section class="chat-messages"></section><div class="chat-composer"><div class="chat-compose-box"><input id="chatInput" autocomplete="off" placeholder="Message #${channel}"><button id="chatSend" type="button">Send</button></div></div></main><aside class="chat-members"><h4>Members — ${members.length}</h4>${members.map((m,i)=>`<div class="chat-member"><i>${esc(m[0])}</i><span>${esc(m)}</span>${i<2?'<span class="chat-online"></span>':''}</div>`).join('')}</aside></div>`}
 function bind(root){root.querySelectorAll('.chat-channel').forEach(b=>b.onclick=()=>{channel=b.dataset.channel;root.querySelectorAll('.chat-channel').forEach(x=>x.classList.toggle('active',x===b));root.querySelector('#chatChannelTitle').textContent=channel;root.querySelector('#chatInput').placeholder='Message #'+channel;renderMessages(root)});root.querySelector('#chatSend').onclick=()=>send(root);root.querySelector('#chatInput').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(root)}};root.querySelector('#chatNameBtn').onclick=()=>{const n=prompt('Choose your chat display name:',localStorage.loliteChatName||'Darby');if(n?.trim()){localStorage.loliteChatName=n.trim().slice(0,24);root.querySelector('#chatNameBtn').textContent='Profile: '+localStorage.loliteChatName}};renderMessages(root)}
 const oldPage=window.page;window.page=function(id){if(id==='chatroom'){const root=document.createElement('div');root.innerHTML=shell();setTimeout(()=>bind(root.firstElementChild),0);return root.firstElementChild.outerHTML}return oldPage(id)};
 const oldIcons=window.renderIcons;window.renderIcons=function(){oldIcons();const box=document.getElementById('icons');if(!box)return;const b=document.createElement('button');b.className='desktop-icon';b.ondblclick=()=>openApp('chatroom','Lolite Chat',1000,680);b.innerHTML='<b style="font-size:25px">💬</b><span>Lolite Chat</span>';box.appendChild(b)};
 window.loliteOpenChat=()=>openApp('chatroom','Lolite Chat',1000,680);
})();