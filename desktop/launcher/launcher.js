'use strict';
const api=window.loliteLauncher,$=id=>document.getElementById(id);
const titles={home:'Your space. Ready to go.',updates:'Fresh features. Familiar feeling.',settings:'Settle in. Make it yours.'};
function tab(id){document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));$('pageTitle').textContent=titles[id];}
document.querySelectorAll('[data-tab],[data-go]').forEach(b=>b.onclick=()=>tab(b.dataset.tab||b.dataset.go));
function error(e){$('error').textContent=e.message||String(e);$('error').hidden=false;clearTimeout(error.timer);error.timer=setTimeout(()=>$('error').hidden=true,12000);}
function action(id,fn){$(id).onclick=async()=>{try{$('error').hidden=true;await fn();}catch(e){error(e);}};}
const bytes=value=>value>=1024**3?(value/1024**3).toFixed(2)+' GB':(value/1024**2).toFixed(1)+' MB';
const options=[['checkOnStartup','Check for updates on startup','Check the official release channel when the launcher opens.'],['autoDownload','Automatically download updates','Download in the background. You choose when to install.'],['launchAfterUpdate','Launch Lolite OS after updating','Return to your desktop when installation is complete.'],['beta','Enable beta releases','Receive preview versions as well as stable releases.'],['fullscreen','Launch in fullscreen','Press F11 to toggle fullscreen or Escape to leave it.'],['startMinimized','Start minimized','Keep newly opened launcher and desktop windows in the taskbar.']];
for(const [key,title,description] of options){const label=document.createElement('label');label.className='preference';const copy=document.createElement('div'),strong=document.createElement('strong'),p=document.createElement('p'),input=document.createElement('input');strong.textContent=title;p.textContent=description;input.type='checkbox';input.id='setting-'+key;input.onchange=async()=>{try{await api.settings({[key]:input.checked});}catch(e){input.checked=!input.checked;error(e);}};copy.append(strong,p);label.append(copy,input);$('preferences').append(label);}
let lastHistory='',lastNews='';
function render(s){
  $('installed').textContent=s.installed;$('sideVersion').textContent='Version '+s.installed;$('aboutVersion').textContent=s.installed;
  $('latest').textContent=s.latest||'Not published';$('channel').textContent=s.settings.beta?'BETA CHANNEL':'STABLE CHANNEL';
  $('briefStatus').textContent=({idle:'Ready',checking:'Checking…',available:'Update available',current:'Up to date',downloading:'Downloading…',paused:'Paused',verifying:'Verifying…',ready:'Ready to install',installing:'Installing…',repairing:'Checking files…',error:'Needs attention'})[s.phase]||s.phase;
  $('statusTitle').textContent=$('briefStatus').textContent;$('statusText').textContent=s.message;$('updateMessage').textContent=s.message;
  $('updateHeading').textContent=s.latest?'Lolite OS '+s.latest:'You’re in control.';
  $('progress').value=s.progress||0;$('downloadSize').textContent=s.total?`${bytes(s.transferred||0)} / ${bytes(s.total)}`:'No download active';
  $('speed').textContent=s.speed?bytes(s.speed)+'/s':'';$('eta').textContent=s.eta?Math.ceil(s.eta/60)+' min remaining':'';
  $('download').hidden=!['available','paused','error'].includes(s.phase);$('download').disabled=!s.latest;$('download').textContent=s.phase==='paused'?'Resume download':s.phase==='error'?'Retry download':'Download update';
  $('pause').hidden=s.phase!=='downloading';$('install').hidden=s.phase!=='ready';$('install').textContent=s.running?'Close Lolite and install':'Install update';
  const busy=['checking','downloading','verifying','repairing','installing'].includes(s.phase);
  for(const id of ['check','checkAgain','repair','clear'])$(id).disabled=busy;
  $('launch').disabled=s.phase==='installing';$('launch').firstChild.textContent=s.running?'Return to Lolite OS ':'Launch Lolite OS ';
  $('launchNote').textContent=s.running?'Your desktop is running.':'Your desktop is installed on this computer.';
  $('updateDot').hidden=!['available','ready'].includes(s.phase);
  if(s.notes)$('releaseNotes').textContent=s.notes;
  for(const [key] of options){$('setting-'+key).checked=s.settings[key];$('setting-'+key).disabled=busy;}
  const history=JSON.stringify(s.history);
  if(history!==lastHistory){lastHistory=history;$('history').replaceChildren();if(!s.history.length){const p=document.createElement('p');p.className='muted';p.textContent='No update activity yet.';$('history').append(p);}for(const item of s.history){const row=document.createElement('div');row.className='history-row';for(const text of [new Date(item.date).toLocaleDateString(),item.action+(item.detail?' · '+item.detail:''),item.version]){const span=document.createElement('span');span.textContent=text;row.append(span);}$('history').append(row);}}
  const news=JSON.stringify(s.announcements);
  if(s.announcements?.length&&news!==lastNews){lastNews=news;$('news').replaceChildren();for(const item of s.announcements.slice(0,4)){const article=document.createElement('article'),tag=document.createElement('span'),h=document.createElement('h3'),p=document.createElement('p');tag.className='news-tag';tag.textContent=item.date?new Date(item.date).toLocaleDateString():'OFFICIAL RELEASE';h.textContent='Lolite OS '+item.version;p.textContent=item.notes.slice(0,240)||'A new Lolite OS release is available.';article.append(tag,h,p);$('news').append(article);}}
}
if(api){action('launch',()=>api.launch());for(const id of ['check','checkAgain'])action(id,()=>api.check());action('download',()=>api.download());action('pause',()=>api.pause());action('install',()=>api.install());action('repair',()=>{tab('updates');return api.repair();});action('clear',()=>api.clear());action('installationFolder',()=>api.openFolder('installation'));action('dataFolder',()=>api.openFolder('data'));action('postpone',()=>tab('home'));api.onState(render);api.state().then(render).catch(error);}else{error(Error('Open this launcher using the installed Lolite Launcher application.'));document.querySelectorAll('button,input').forEach(e=>e.disabled=true);}
function connectivity(){$('connection').textContent=navigator.onLine?'Ready when you are':'Offline · local apps ready';}window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);connectivity();
