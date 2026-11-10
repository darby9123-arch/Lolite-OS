/* Lolite OS desktop widgets: local layouts and notes; optional ad-free weather. */
(()=>{'use strict';
 const KEY='lolite.widgets.v1';
 const TYPES={
  clock:{title:'Clock',icon:'◷',description:'Live local time and date'},
  calendar:{title:'Calendar',icon:'▦',description:'Browse months and today'},
  notes:{title:'Sticky note',icon:'✎',description:'A note saved in this browser'},
  weather:{title:'Weather',icon:'☁',description:'Current conditions for a city you choose'},
  shortcuts:{title:'Quick launch',icon:'✦',description:'Open your favourite Lolite apps'},
  system:{title:'System info',icon:'▤',description:'Real browser and device information'},
  timer:{title:'Timer',icon:'⌛',description:'A simple countdown'},
  music:{title:'Now playing',icon:'♫',description:'Control Lolite Music from your desktop'}
 };
 const $=s=>document.querySelector(s);
 const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const bounded=(n,min,max)=>Math.max(min,Math.min(max,n));
 const initial={items:[{id:'clock-1',type:'clock',x:-1,y:22},{id:'calendar-1',type:'calendar',x:-1,y:225}],note:'',weatherCity:''};
 let data=read(),layer=null,picker=null,button=null,drag=null;
 const months=new Map(),timers=new Map(),weatherCache=new Map();
 let weatherPending=null;
 function read(){
  try{
   const value=JSON.parse(localStorage.getItem(KEY)||'null');
   if(value&&Array.isArray(value.items)){
    const seen=new Set();
    const items=value.items.filter(w=>w&&TYPES[w.type]&&typeof w.id==='string'&&!seen.has(w.type)&&seen.add(w.type)).slice(0,8)
      .map(w=>({id:w.id.slice(0,80),type:w.type,x:Number.isFinite(w.x)?w.x:-1,y:Number.isFinite(w.y)?w.y:22,
       width:Number.isFinite(w.width)?bounded(w.width,240,520):null,
       height:Number.isFinite(w.height)?bounded(w.height,150,560):null}));
    return {items,note:typeof value.note==='string'?value.note.slice(0,10000):'',weatherCity:typeof value.weatherCity==='string'?value.weatherCity.slice(0,70):''};
   }
  }catch(e){console.warn('Lolite widgets: saved layout unavailable',e)}
  return JSON.parse(JSON.stringify(initial));
 }
 function save(){
  try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn('Lolite widgets: could not save settings',e)}
 }
 function desktopWidth(){return layer?.clientWidth||window.innerWidth}
 function desktopHeight(){return layer?.clientHeight||Math.max(200,window.innerHeight-60)}
 function widthFor(){return window.innerWidth<=700?240:286}
 function position(w,el){
  if(el){
   el.classList.toggle('lw-resized',!!(w.width||w.height));
   el.style.width=w.width?Math.min(w.width,Math.max(240,desktopWidth()-10))+'px':'';
   el.style.height=w.height?w.height+'px':'';
  }
  const maxX=Math.max(0,desktopWidth()-(el?.offsetWidth||widthFor())-10);
  const maxY=Math.max(0,desktopHeight()-(el?.offsetHeight||195)-10);
  const x=w.x<0?maxX:bounded(w.x,0,maxX),y=bounded(w.y,0,maxY);
  if(el){el.style.left=x+'px';el.style.top=y+'px'}
  return {x,y};
 }
 function clockMarkup(){
  const now=new Date();
  return '<div class="lw-clock-time" data-lw-clock>'+safe(now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))+'</div>'+
   '<div class="lw-clock-date" data-lw-date>'+safe(now.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'}))+'</div>'+
   '<div class="lw-clock-zone">'+safe(Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time')+'</div>';
 }
 function calendarMarkup(id){
  const offset=months.get(id)||0,now=new Date(),view=new Date(now.getFullYear(),now.getMonth()+offset,1);
  const year=view.getFullYear(),month=view.getMonth(),first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();
  let grid='<div class="lw-calendar-grid">'+['S','M','T','W','T','F','S'].map(d=>'<span class="lw-day-name">'+d+'</span>').join('');
  for(let i=0;i<first;i++)grid+='<span class="lw-other-month"></span>';
  for(let d=1;d<=days;d++)grid+='<span class="'+(year===now.getFullYear()&&month===now.getMonth()&&d===now.getDate()?'lw-today':'')+'">'+d+'</span>';
  return '<div class="lw-month-nav"><button type="button" data-lw-month="-1" aria-label="Previous month">‹</button><b>'+safe(view.toLocaleDateString([],{month:'long',year:'numeric'}))+'</b><button type="button" data-lw-month="1" aria-label="Next month">›</button></div>'+grid+'</div>';
 }
 function notesMarkup(){return '<textarea class="lw-note" data-lw-note aria-label="Sticky note" maxlength="10000" placeholder="Write something to remember…">'+safe(data.note)+'</textarea><p class="lw-hint">Auto-saved locally · not shared with other devices</p>'}
 function shortcutsMarkup(){
  return '<div class="lw-quick-grid">'+[['files','▤','Files'],['games','▣','Games'],['appstore','✦','App Store'],['settings','⚙','Settings']].map(a=>
   '<button type="button" data-lw-app="'+a[0]+'"><span>'+a[1]+'</span>'+a[2]+'</button>').join('')+'</div>';
 }
 function systemMarkup(){
  const rows=[
   ['Connection',navigator.onLine?'Online':'Offline'],
   ['CPU threads',navigator.hardwareConcurrency?String(navigator.hardwareConcurrency)+' reported':'Not available'],
   ['Device memory',navigator.deviceMemory?String(navigator.deviceMemory)+' GB (approx.)':'Not available'],
   ['Platform',navigator.userAgentData?.platform||navigator.platform||'Not available']
  ];
  return rows.map(([k,v],i)=>'<div class="lw-system-line"><span>'+safe(k)+'</span><b'+(i===0&&navigator.onLine?' class="lw-positive"':'')+'>'+safe(v)+'</b></div>').join('')+
   '<p class="lw-hint">Browser-reported specs, not live CPU or RAM usage.</p>';
 }
 function weatherMarkup(){
  const city=data.weatherCity,stored=weatherCache.get(city.toLowerCase());
  const display=stored?'<div class="lw-weather-main"><span class="lw-weather-icon">'+stored.icon+'</span><div><div class="lw-weather-temp">'+safe(stored.temp)+'°C</div><div class="lw-weather-sub">'+safe(stored.condition)+'</div></div></div><div class="lw-weather-city">'+safe(stored.city)+'</div><div class="lw-weather-sub">Feels like '+safe(stored.feels)+'°C · Humidity '+safe(stored.humidity)+'%</div>':
   '<div class="lw-weather-sub" data-lw-weather-status>'+ (city?'Loading weather for '+safe(city)+'…':'Choose a city to see its weather. No location tracking or ads.')+'</div>';
  return display+'<form class="lw-weather-set" data-lw-weather-form><input type="search" name="city" aria-label="Weather city" autocomplete="off" maxlength="70" placeholder="City (e.g. Adelaide)" value="'+safe(city)+'"><button type="submit">Go</button></form>';
 }
 function timerState(id){
  if(!timers.has(id))timers.set(id,{seconds:300,until:0,running:false});
  return timers.get(id);
 }
 function fmtTimer(seconds){const s=Math.max(0,Math.ceil(seconds));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
 function timerMarkup(id){
  const s=timerState(id);
  return '<div class="lw-timer-time" data-lw-timer-time>'+fmtTimer(s.seconds)+'</div>'+
   '<div class="lw-timer-actions"><label>Minutes <input data-lw-timer-minutes type="number" min="1" max="180" step="1" value="'+Math.max(1,Math.ceil(s.seconds/60))+'"></label>'+
   '<button type="button" data-lw-timer-toggle>'+(s.running?'Pause':'Start')+'</button><button type="button" data-lw-timer-reset>Reset</button></div>'+
   '<p class="lw-hint" data-lw-timer-status>Timer works while Lolite stays open.</p>';
 }
 function musicMarkup(){
  const state=window.LoliteMusic?.getState?.()||{};
  return '<div class="lw-music-line">'+safe(state.title||'Nothing playing')+'</div>'+
   '<span class="lw-music-artist">'+safe(state.artist||'Open Lolite Music to choose a song')+'</span>'+
   '<div class="lw-music-actions"><button type="button" data-lw-music="previous" aria-label="Previous song">⏮</button>'+
   '<button type="button" data-lw-music="toggle" aria-label="Play or pause">'+(state.playing?'Pause':'Play')+'</button>'+
   '<button type="button" data-lw-music="next" aria-label="Next song">⏭</button>'+
   '<button type="button" data-lw-music="open">Open Music</button></div>'+
   '<div class="lw-music-hint">Playback stays inside Lolite Music.</div>';
 }
 function updateMusicWidget(){
   const node=layer?.querySelector('[data-lw-type="music"] .lw-body');
   if(node)node.innerHTML=musicMarkup();
 }
 function body(type,id){
  if(type==='clock')return clockMarkup();
  if(type==='calendar')return calendarMarkup(id);
  if(type==='notes')return notesMarkup();
  if(type==='shortcuts')return shortcutsMarkup();
  if(type==='system')return systemMarkup();
  if(type==='weather')return weatherMarkup();
  if(type==='timer')return timerMarkup(id);
  if(type==='music')return musicMarkup();
  return '';
 }
 function paint(){
  if(!layer)return;
  layer.replaceChildren();
  for(const w of data.items){
   const el=document.createElement('section');el.className='lw-card';el.dataset.lwId=w.id;el.dataset.lwType=w.type;
   el.setAttribute('role','region');el.setAttribute('aria-label',TYPES[w.type].title+' widget');
   el.innerHTML='<div class="lw-header"><span class="lw-symbol" aria-hidden="true">'+TYPES[w.type].icon+'</span><strong>'+TYPES[w.type].title+'</strong>'+
     '<button class="lw-remove" type="button" data-lw-remove title="Remove widget" aria-label="Remove '+TYPES[w.type].title+' widget">×</button></div>'+
     '<div class="lw-body">'+body(w.type,w.id)+'</div>'+ 
     '<button class="lw-resize" type="button" data-lw-resize aria-label="Resize '+TYPES[w.type].title+' widget" title="Drag to resize">◢</button>';
   layer.append(el);position(w,el);
  }
  if(data.weatherCity&&data.items.some(w=>w.type==='weather'))refreshWeather(data.weatherCity);
  updateTicks();
  updatePicker();
 }
 function pickerMarkup(){
  return '<div class="lw-picker-head"><div><strong>Desktop widgets</strong><small>Add, drag and personalise your desktop.</small></div>'+
   '<button type="button" data-lw-close aria-label="Close widget picker">×</button></div><div class="lw-picker-list">'+
   Object.entries(TYPES).map(([type,o])=>{
    const present=data.items.some(w=>w.type===type);
    return '<button type="button" data-lw-add="'+type+'" '+(present?'disabled':'')+'><span class="lw-picker-icon">'+o.icon+'</span><span class="lw-picker-copy"><b>'+o.title+'</b><small>'+o.description+'</small></span><span class="lw-picker-add">'+(present?'✓':'+')+'</span></button>';
   }).join('')+'</div>';
 }
 function updatePicker(){if(picker&&!picker.hidden)picker.innerHTML=pickerMarkup()}
 function togglePicker(force){
  if(!picker)return;
  const show=typeof force==='boolean'?force:picker.hidden;
  picker.hidden=!show;
  button?.setAttribute('aria-expanded',String(show));
  if(show){updatePicker();picker.querySelector('[data-lw-close]')?.focus()}
 }
 function findFreePosition(type){
  const cardWidth=widthFor(),heights={clock:174,calendar:310,notes:250,weather:210,shortcuts:205,system:265,timer:190,music:190};
  const height=heights[type]||210,space=desktopHeight(),width=desktopWidth();
  const occupied=data.items.map(w=>{
   const el=Array.from(layer?.children||[]).find(node=>node.dataset.lwId===w.id);
   const p=position(w,el);
   return {x:p.x,y:p.y,w:el?.offsetWidth||cardWidth,h:el?.offsetHeight||210};
  });
  const cols=Math.max(1,Math.floor(width/(cardWidth+16)));
  for(let column=0;column<cols;column++){
   const x=Math.max(0,width-cardWidth-18-column*(cardWidth+16));
   let y=22;
   for(let pass=0;pass<occupied.length+1;pass++){
    const hit=occupied.find(r=>x<r.x+r.w+12&&x+cardWidth+12>r.x&&y<r.y+r.h+12&&y+height+12>r.y);
    if(!hit)break;
    y=hit.y+hit.h+16;
   }
   if(y+height<=space-10)return {x,y};
  }
  return {x:Math.max(0,width-cardWidth-18),y:Math.max(0,space-height-15)};
 }
 function add(type){
  if(!TYPES[type]||data.items.some(w=>w.type===type))return;
  const {x,y}=findFreePosition(type);
  data.items.push({id:type+'-'+Date.now(),type,x,y});
  save();paint();togglePicker(false);
 }
 function remove(id){
  data.items=data.items.filter(w=>w.id!==id);
  months.delete(id);timers.delete(id);
  save();paint();
 }
 function conditions(code){
  if(code===0)return ['☀️','Clear'];
  if([1,2,3].includes(code))return ['⛅','Partly cloudy'];
  if([45,48].includes(code))return ['🌫️','Fog'];
  if(code>=51&&code<=57)return ['🌦️','Drizzle'];
  if(code>=61&&code<=67)return ['🌧️','Rain'];
  if(code>=71&&code<=77)return ['❄️','Snow'];
  if(code>=80&&code<=82)return ['🌦️','Showers'];
  if(code>=95)return ['⛈️','Thunderstorms'];
  return ['☁️','Cloudy'];
 }
 async function refreshWeather(city){
  const query=String(city||'').trim().slice(0,70);
  if(!query)return;
  const key=query.toLowerCase(),cached=weatherCache.get(key);
  if(cached&&Date.now()-cached.at<15*60*1000){updateWeatherBody();return}
  if(weatherPending===key)return;
  weatherPending=key;
  try{
   const geocode=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(query)+'&count=1&language=en&format=json');
   if(!geocode.ok)throw Error('City lookup failed');
   const place=(await geocode.json()).results?.[0];if(!place)throw Error('City not found');
   const endpoint='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(place.latitude)+'&longitude='+encodeURIComponent(place.longitude)+
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=auto';
   const response=await fetch(endpoint);if(!response.ok)throw Error('Forecast unavailable');
   const current=(await response.json()).current;if(!current||!Number.isFinite(current.temperature_2m))throw Error('No weather available');
   const [icon,condition]=conditions(current.weather_code);
   weatherCache.set(key,{at:Date.now(),city:place.name+(place.country?', '+place.country:''),temp:Math.round(current.temperature_2m),
    feels:Math.round(current.apparent_temperature),humidity:Math.round(current.relative_humidity_2m),icon,condition});
   if(data.weatherCity.toLowerCase()===key)updateWeatherBody();
  }catch(e){
   const message=layer?.querySelector('[data-lw-weather-status]');
   if(message&&data.weatherCity.toLowerCase()===key)message.textContent='Weather unavailable: '+e.message+'. Try another city.';
  }finally{if(weatherPending===key)weatherPending=null}
 }
 function updateWeatherBody(){
  const node=layer?.querySelector('[data-lw-type="weather"] .lw-body');
  if(node){node.innerHTML=weatherMarkup();const item=data.items.find(w=>w.type==='weather');if(item)position(item,node.parentElement)}
 }
 function updateTicks(){
  const now=new Date(),clock=layer?.querySelector('[data-lw-clock]'),date=layer?.querySelector('[data-lw-date]');
  if(clock)clock.textContent=now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  if(date)date.textContent=now.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});
  for(const [id,state] of timers){
   if(state.running){
    state.seconds=Math.max(0,(state.until-Date.now())/1000);
    if(state.seconds===0){state.running=false;const status=layer?.querySelector('[data-lw-id="'+id+'"] [data-lw-timer-status]');if(status)status.textContent='Time is up!'}
   }
   const card=Array.from(layer?.querySelectorAll('.lw-card')||[]).find(el=>el.dataset.lwId===id);
   const text=card?.querySelector('[data-lw-timer-time]');if(text)text.textContent=fmtTimer(state.seconds);
   const toggle=card?.querySelector('[data-lw-timer-toggle]');if(toggle)toggle.textContent=state.running?'Pause':'Start';
  }
 }
 function beginDrag(event,header){
  if(event.button!==0||event.target.closest('button'))return;
  const card=header.closest('.lw-card'),w=data.items.find(item=>item.id===card?.dataset.lwId);
  if(!w)return;
  const box=card.getBoundingClientRect(),origin=layer.getBoundingClientRect();
  drag={id:w.id,pointer:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top};
  try{header.setPointerCapture(event.pointerId)}catch(_){}
  event.preventDefault();
  header.addEventListener('pointermove',moveDrag);
  header.addEventListener('pointerup',endDrag,{once:true});
  header.addEventListener('pointercancel',endDrag,{once:true});
  function moveDrag(e){
   if(!drag||e.pointerId!==drag.pointer)return;
   w.x=bounded(e.clientX-origin.left-drag.dx,0,Math.max(0,desktopWidth()-card.offsetWidth-10));
   w.y=bounded(e.clientY-origin.top-drag.dy,0,Math.max(0,desktopHeight()-card.offsetHeight-10));
   position(w,card);
  }
  function endDrag(e){
   header.removeEventListener('pointermove',moveDrag);header.removeEventListener('pointerup',endDrag);header.removeEventListener('pointercancel',endDrag);
   if(!drag||e.pointerId!==drag.pointer)return;
   drag=null;try{header.releasePointerCapture(e.pointerId)}catch(_){}
   save();
  }
 }
 function beginResize(event,grip){
  if(event.button!==0)return;
  const card=grip.closest('.lw-card'),w=data.items.find(item=>item.id===card?.dataset.lwId);
  if(!w)return;
  event.preventDefault();event.stopPropagation();
  const origin={x:event.clientX,y:event.clientY,width:card.offsetWidth,height:card.offsetHeight};
  const pointer=event.pointerId;
  card.classList.add('lw-resizing','lw-resized');
  try{grip.setPointerCapture(pointer)}catch{}
  const move=e=>{
   if(e.pointerId!==pointer)return;
   const maxWidth=Math.max(240,Math.min(520,desktopWidth()-position(w,card).x-10));
   const maxHeight=Math.max(150,Math.min(560,desktopHeight()-position(w,card).y-10));
   w.width=bounded(origin.width+e.clientX-origin.x,240,maxWidth);
   w.height=bounded(origin.height+e.clientY-origin.y,150,maxHeight);
   position(w,card);
  };
  const end=e=>{
   if(e.pointerId!==pointer)return;
   grip.removeEventListener('pointermove',move);
   grip.removeEventListener('pointerup',end);
   grip.removeEventListener('pointercancel',end);
   try{grip.releasePointerCapture(pointer)}catch{}
   card.classList.remove('lw-resizing');save();
  };
  grip.addEventListener('pointermove',move);
  grip.addEventListener('pointerup',end);
  grip.addEventListener('pointercancel',end);
 }
 function setSize(type,width,height){
  const w=data.items.find(item=>item.type===type);
  if(!w)return false;
  w.width=bounded(Number(width)||286,240,520);
  w.height=bounded(Number(height)||195,150,560);
  save();paint();return true;
 }
 function launch(id){
  if(typeof window.LoliteDesktopShell?.launch==='function')window.LoliteDesktopShell.launch(id);
  else window.openApp?.(id,({files:'Files',games:'Game Store',appstore:'App Store',settings:'Settings'})[id]||id);
 }
 function handleClick(e){
  if(e.target.closest('#loliteWidgetButton')){e.preventDefault();togglePicker();return}
  if(e.target.closest('[data-lw-close]')){togglePicker(false);return}
  const addButton=e.target.closest('[data-lw-add]');if(addButton){add(addButton.dataset.lwAdd);return}
  const rem=e.target.closest('[data-lw-remove]');if(rem){remove(rem.closest('.lw-card').dataset.lwId);return}
  const music=e.target.closest('[data-lw-music]');
  if(music){
   const action=music.dataset.lwMusic;
   if(action==='open')window.LoliteMusic?.open?.();
   else window.LoliteMusic?.[action]?.();
   return;
  }
  const quick=e.target.closest('[data-lw-app]');if(quick){launch(quick.dataset.lwApp);return}
  const month=e.target.closest('[data-lw-month]');if(month){
   const w=month.closest('.lw-card');const id=w.dataset.lwId;
   months.set(id,(months.get(id)||0)+Number(month.dataset.lwMonth));
   w.querySelector('.lw-body').innerHTML=calendarMarkup(id);position(data.items.find(i=>i.id===id),w);return;
  }
  const toggle=e.target.closest('[data-lw-timer-toggle]');
  if(toggle){
   const id=toggle.closest('.lw-card').dataset.lwId,s=timerState(id);
   if(s.running){s.seconds=Math.max(0,(s.until-Date.now())/1000);s.running=false}
   else{if(s.seconds<=0)s.seconds=300;s.until=Date.now()+s.seconds*1000;s.running=true}
   updateTicks();return;
  }
  const reset=e.target.closest('[data-lw-timer-reset]');
  if(reset){
   const card=reset.closest('.lw-card'),id=card.dataset.lwId,s=timerState(id),input=card.querySelector('[data-lw-timer-minutes]');
   s.seconds=bounded(Number(input?.value)||5,1,180)*60;s.running=false;
   const status=card.querySelector('[data-lw-timer-status]');if(status)status.textContent='Timer ready.';
   updateTicks();return;
  }
  if(picker&&!picker.hidden&&!picker.contains(e.target)&&!button.contains(e.target))togglePicker(false);
 }
 function handleSubmit(e){
  const form=e.target.closest('[data-lw-weather-form]');if(!form)return;
  e.preventDefault();const city=form.elements.city.value.trim().slice(0,70);
  if(!city)return;
  data.weatherCity=city;save();
  const body=form.closest('.lw-body');if(body)body.innerHTML=weatherMarkup();
  refreshWeather(city);
 }
 function fitAll(){for(const w of data.items){const el=Array.from(layer?.children||[]).find(e=>e.dataset.lwId===w.id);position(w,el)}}
 function init(){
  const desktop=$('#desktop'),bar=$('#taskbar'),tray=bar?.querySelector('.tray');
  if(!desktop||!tray||$('#lolite-widget-layer'))return;
  layer=document.createElement('div');layer.id='lolite-widget-layer';layer.setAttribute('aria-label','Desktop widgets');
  desktop.insertBefore(layer,$('#windows')||null);
  button=document.createElement('button');button.id='loliteWidgetButton';button.className='task';button.type='button';
  button.setAttribute('title','Desktop widgets');button.setAttribute('aria-label','Add desktop widgets');button.setAttribute('aria-controls','loliteWidgetPicker');
  button.setAttribute('aria-expanded','false');button.innerHTML='<span class="lw-task-glyph" aria-hidden="true">▦</span>';
  tray.insertBefore(button,tray.querySelector('#settingsBtn')||tray.firstChild);
  picker=document.createElement('div');picker.id='loliteWidgetPicker';picker.className='lw-picker';picker.hidden=true;
  picker.setAttribute('role','dialog');picker.setAttribute('aria-label','Add desktop widgets');
  document.body.appendChild(picker);
  paint();
  document.addEventListener('click',handleClick);
  layer.addEventListener('pointerdown',e=>{const grip=e.target.closest('[data-lw-resize]');if(grip){beginResize(e,grip);return}const h=e.target.closest('.lw-header');if(h)beginDrag(e,h)});
  document.addEventListener('submit',handleSubmit);
  document.addEventListener('input',e=>{if(e.target.matches('[data-lw-note]')){data.note=e.target.value.slice(0,10000);save()}});
  document.addEventListener('change',e=>{if(e.target.matches('[data-lw-timer-minutes]')){const card=e.target.closest('.lw-card'),timer=timerState(card.dataset.lwId);if(!timer.running){timer.seconds=bounded(Number(e.target.value)||5,1,180)*60;updateTicks()}}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!picker.hidden)togglePicker(false)});
  window.addEventListener('resize',fitAll,{passive:true});
  window.addEventListener('online',()=>{const node=layer?.querySelector('[data-lw-type="system"] .lw-body');if(node)node.innerHTML=systemMarkup()});
  window.addEventListener('offline',()=>{const node=layer?.querySelector('[data-lw-type="system"] .lw-body');if(node)node.innerHTML=systemMarkup()});
  window.addEventListener('lolite:modechange',()=>togglePicker(false));
  window.addEventListener('lolite:musicstate',updateMusicWidget);
  setInterval(updateTicks,1000);
  window.LoliteWidgets={open:()=>togglePicker(true),add,remove,setSize,list:()=>data.items.map(w=>w.type),reset:()=>{data=JSON.parse(JSON.stringify(initial));save();paint()}};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
