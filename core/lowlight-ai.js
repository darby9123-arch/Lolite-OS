/* Lolite AI — private, local browser inference powered by WebLLM. */
(()=>{
 const css=`.lowlight-ai{height:100%;margin:-18px;background:#0d1016;display:flex;flex-direction:column;color:#e8edf5}.ai-head{padding:16px 20px;border-bottom:1px solid #292f3a;background:linear-gradient(180deg,#171b27,#11151c)}.ai-head h1{margin:3px 0 7px;font-size:24px}.ai-subtitle{font-size:12px;color:#aab5c5}.ai-status-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:12px}.ai-status{font-size:12px;color:#b6c1d2;flex:1;min-width:150px}.ai-load{padding:8px 12px;border:1px solid #5c56b8;border-radius:8px;background:#262348;color:#fff;font-weight:700;cursor:pointer}.ai-load:disabled{opacity:.55;cursor:wait}.ai-progress{height:4px;background:#262c38;border-radius:5px;overflow:hidden;margin-top:9px}.ai-progress>i{display:block;width:0;height:100%;background:#8c83ff;transition:width .2s}.ai-chat{flex:1;overflow:auto;padding:20px;display:flex;flex-direction:column;align-items:stretch;gap:12px}.ai-msg{max-width:84%;padding:11px 13px;border-radius:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}.ai-user{align-self:flex-end;background:#6f65dc;color:white}.ai-bot{align-self:flex-start;background:#1b212b;border:1px solid #2b3441;color:#dbe1e9}.ai-compose{display:flex;gap:8px;padding:12px;border-top:1px solid #292f3a}.ai-compose textarea{flex:1;min-width:0;min-height:44px;max-height:130px;resize:vertical;background:#11161d;color:#fff;border:1px solid #303845;border-radius:9px;padding:10px;outline:0;font:inherit}.ai-compose button{padding:0 16px;border:0;border-radius:9px;background:#7166df;color:#fff;font-weight:750;cursor:pointer}.ai-compose button:disabled{opacity:.5;cursor:wait}.ai-note{font-size:11px;color:#8e9bad;margin-top:5px}`;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const MODEL='Qwen2-0.5B-Instruct-q4f16_1-MLC';
 let engine=null,loading=false,history=[];
 const escapeText=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 function page(){return `<div class="lowlight-ai"><header class="ai-head"><div class="muted">LOLITE OS</div><h1>✨ Lolite AI</h1><div class="ai-subtitle">Runs on your device. Your prompts are not sent to an AI server.</div><div class="ai-status-row"><div class="ai-status" id="lowlightStatus">Local model not loaded. First setup downloads the model to this browser.</div><button class="ai-load" id="lowlightLoad" type="button">Load local AI</button></div><div class="ai-progress"><i id="lowlightProgress"></i></div><div class="ai-note">Model: Qwen2 0.5B · Download once, then reuse from browser cache · WebGPU required</div></header><div class="ai-chat" id="lowlightChat"><div class="ai-msg ai-bot">Hi! I’m Lolite AI. I run locally in your browser, so there’s no shared API quota. Select “Load local AI” (or send your first message) to download and prepare the model. The first setup can take a while.</div></div><form class="ai-compose" id="lowlightForm"><textarea id="lowlightInput" placeholder="Ask Lolite AI…" required></textarea><button id="lowlightSend" type="submit">Send</button></form></div>`}
 function status(text,progress){const el=document.getElementById('lowlightStatus');if(el)el.textContent=text;const bar=document.getElementById('lowlightProgress');if(bar&&Number.isFinite(progress))bar.style.width=Math.max(0,Math.min(100,progress))+'%';}
 function addMessage(text,role){const chat=document.getElementById('lowlightChat');const node=document.createElement('div');node.className='ai-msg '+(role==='user'?'ai-user':'ai-bot');node.textContent=text;chat.appendChild(node);chat.scrollTop=chat.scrollHeight;return node;}
 function controls(busy){const load=document.getElementById('lowlightLoad'),send=document.getElementById('lowlightSend');if(load){load.disabled=loading;load.textContent=engine?'Local AI ready':loading?'Loading model…':'Load local AI'}if(send)send.disabled=busy||loading}
 async function loadModel(){
  if(engine)return engine;
  if(loading)throw new Error('The local model is already loading. Please wait.');
  if(!('gpu' in navigator))throw new Error('This browser does not appear to support WebGPU. Try a recent version of Chrome or Edge on a compatible device.');
  loading=true;controls(true);status('Loading WebLLM runtime…',2);
  try{
   const webllm=await import('https://esm.run/@mlc-ai/web-llm');
   engine=await webllm.CreateMLCEngine(MODEL,{initProgressCallback:p=>{
    const progress=typeof p.progress==='number'?p.progress*100:undefined;
    const label=p.text||p.stage||'Preparing local model…';
    status(progress===undefined?label:`${label} (${Math.round(progress)}%)`,progress);
   }});
   status('Local AI is ready. Your messages stay on this device.',100);
   return engine;
  }catch(err){engine=null;const msg=err?.message||String(err);status('Could not load the local model. Check WebGPU support and available memory.');throw new Error(msg)}
  finally{loading=false;controls(false)}
 }
 async function ask(){
  const input=document.getElementById('lowlightInput');if(!input)return;
  const message=input.value.trim();if(!message||loading)return;
  input.value='';addMessage(message,'user');
  const reply=addMessage('Preparing local model…','bot');controls(true);
  try{
   const local=await loadModel();
   reply.textContent='Thinking…';
   history.push({role:'user',content:message});
   const messages=[{role:'system',content:'You are Lolite AI, the friendly built-in assistant for Lolite OS. Be concise, helpful and age-appropriate. Help with Lolite OS, coding, games, school-safe questions and creative ideas. You run locally in the browser. Never claim to have performed actions you did not perform.'},...history.slice(-10)];
   const result=await local.chat.completions.create({messages,max_tokens:512,temperature:0.7});
   const answer=result.choices?.[0]?.message?.content;
   if(!answer)throw new Error('The local model returned an empty response. Please try again.');
   reply.textContent=answer;history.push({role:'assistant',content:answer});status('Local AI ready · No cloud quota');
  }catch(err){reply.textContent='Lolite AI: '+(err?.message||'Something went wrong while running the local model.');}
  finally{controls(false);const chat=document.getElementById('lowlightChat');if(chat)chat.scrollTop=chat.scrollHeight}
 }
 window.lowlightAsk=ask;
 const oldPage=window.page;window.page=function(id){if(id==='lowlight-ai')return page();return oldPage(id)};
 document.addEventListener('click',async e=>{if(e.target?.id==='lowlightLoad'){try{await loadModel()}catch(err){status('Model setup failed: '+(err?.message||'Unknown error'))}}});
 document.addEventListener('submit',e=>{if(e.target?.id==='lowlightForm'){e.preventDefault();ask()}});
})();