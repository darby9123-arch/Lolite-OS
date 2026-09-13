/* Lolite OS 2.7 — Customisation */
(()=>{
 const V='2.7', KEY='lolite-v27-customisation';
 const defaults={theme:'midnight',accent:'#8b7cff',wallpaper:'',wallpapers:[],slideshow:false,random:false,iconSize:'medium',taskbar:'bottom',transparency:0.82,radius:14,shadow:0.7,animation:1};
 const themes={
  dark:{bg:'#090714',surface:'#151126',surface2:'#211a3b',text:'#f7f4ff',muted:'#aaa3c4'},
  light:{bg:'#f5f3fb',surface:'#ffffff',surface2:'#ebe7f5',text:'#171321',muted:'#686174'},
  midnight:{bg:'#070817',surface:'#10142b',surface2:'#18204a',text:'#f4f6ff',muted:'#a8afd0'},
  aurora:{bg:'#071713',surface:'#10251f',surface2:'#173c31',text:'#effff8',muted:'#a7c8bd'},
  retro:{bg:'#18120a',surface:'#282016',surface2:'#3b2d1d',text:'#fff4df',muted:'#c9b89e'},
  minimal:{bg:'#111',surface:'#1a1a1a',surface2:'#242424',text:'#f4f4f4',muted:'#aaa'},
  pixel:{bg:'#100b1d',surface:'#211633',surface2:'#35234f',text:'#fff7ff',muted:'#c7afd0'},
  amoled:{bg:'#000',surface:'#050505',surface2:'#101010',text:'#fff',muted:'#999'}
 };
 let state={...defaults}; try{state={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}
 const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
 const root=document.documentElement;
 function apply(){
  const t=themes[state.theme]||themes.midnight;
  root.style.setProperty('--v27-bg',t.bg);root.style.setProperty('--v27-surface',t.surface);root.style.setProperty('--v27-surface2',t.surface2);root.style.setProperty('--v27-text',t.text);root.style.setProperty('--v27-muted',t.muted);root.style.setProperty('--v27-accent',state.accent);
  root.style.setProperty('--v27-alpha',String(state.transparency));root.style.setProperty('--v27-radius',state.radius+'px');root.style.setProperty('--v27-shadow',String(state.shadow));root.style.setProperty('--v27-animation',String(state.animation));
  document.body.dataset.v27Theme=state.theme;document.body.dataset.v27IconSize=state.iconSize;document.body.dataset.v27Taskbar=state.taskbar;
  document.body.classList.toggle('v27-no-motion',state.animation===0);
  applyWallpaper(); save();
 }
 function applyWallpaper(){const w=document.querySelector('#wallpaper');if(!w)return;w.style.backgroundImage=state.wallpaper?`url("${state.wallpaper}")`:'';w.style.backgroundSize='cover';w.style.backgroundPosition='center';w.style.backgroundRepeat='no-repeat'}
 function cycleWallpaper(){if(!state.wallpapers.length)return;let i=Math.floor(Math.random()*state.wallpapers.length);if(!state.random){const cur=state.wallpapers.indexOf(state.wallpaper);i=(cur+1)%state.wallpapers.length}state.wallpaper=state.wallpapers[i];apply();}
 function hex(v){return /^#[0-9a-f]{6}$/i.test(v)?v:'#8b7cff'}
 function page(){return `<div class="v27-settings"><div class="v27-head"><div><h2>🎨 Customisation 2.7</h2><p>Make Lolite feel like your own desktop.</p></div><button id="v27-reset" class="soft">Reset</button></div>
 <section class="v27-section"><h3>Themes</h3><div class="v27-theme-grid">${Object.keys(themes).map(k=>`<button class="v27-theme ${state.theme===k?'selected':''}" data-theme="${k}"><span style="background:${themes[k].bg}"><i style="background:${state.accent}"></i></span><b>${k[0].toUpperCase()+k.slice(1)}</b></button>`).join('')}</div></section>
 <section class="v27-section"><h3>Accent</h3><div class="v27-row"><input id="v27-accent" type="color" value="${hex(state.accent)}"><input id="v27-accent-text" value="${hex(state.accent)}" aria-label="Accent hex colour"><button id="v27-random-accent" class="soft">Random accent</button></div></section>
 <section class="v27-section"><h3>Wallpaper</h3><div class="v27-row"><input id="v27-wallpaper-file" type="file" accept="image/*" multiple><button id="v27-cycle" class="soft">${state.random?'Random wallpaper':'Next wallpaper'}</button><label class="v27-check"><input id="v27-random" type="checkbox" ${state.random?'checked':''}> Random</label><label class="v27-check"><input id="v27-slideshow" type="checkbox" ${state.slideshow?'checked':''}> Slideshow</label></div><p id="v27-wallpaper-count" class="muted">${state.wallpapers.length} custom wallpaper${state.wallpapers.length===1?'':'s'} saved.</p></section>
 <section class="v27-section"><h3>Desktop Studio</h3><div class="v27-controls">
 <label>Icon size <select id="v27-icon"><option value="small" ${state.iconSize==='small'?'selected':''}>Small</option><option value="medium" ${state.iconSize==='medium'?'selected':''}>Medium</option><option value="large" ${state.iconSize==='large'?'selected':''}>Large</option></select></label>
 <label>Taskbar <select id="v27-task"><option value="bottom" ${state.taskbar==='bottom'?'selected':''}>Bottom</option><option value="top" ${state.taskbar==='top'?'selected':''}>Top</option></select></label>
 <label>Transparency <input id="v27-transparency" type="range" min="0.45" max="1" step="0.01" value="${state.transparency}"><output id="v27-transparency-out">${Math.round(state.transparency*100)}%</output></label>
 <label>Corner radius <input id="v27-radius" type="range" min="4" max="28" value="${state.radius}"><output id="v27-radius-out">${state.radius}px</output></label>
 <label>Window shadow <input id="v27-shadow" type="range" min="0" max="1" step="0.05" value="${state.shadow}"><output id="v27-shadow-out">${Math.round(state.shadow*100)}%</output></label>
 <label>Animation <select id="v27-animation"><option value="1" ${state.animation===1?'selected':''}>Full</option><option value="0.5" ${state.animation===0.5?'selected':''}>Reduced</option><option value="0" ${state.animation===0?'selected':''}>Off</option></select></label>
 </div></section><p class="v27-note">Settings are saved locally in this browser. Animated wallpapers are intentionally not forced on, keeping performance predictable.</p></div>`}
 function bind(c){
  c.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{state.theme=b.dataset.theme;apply();render()});
  const accent=c.querySelector('#v27-accent'),at=c.querySelector('#v27-accent-text'); const setAccent=v=>{state.accent=hex(v);accent.value=state.accent;at.value=state.accent;apply()}; accent.oninput=()=>setAccent(accent.value);at.onchange=()=>setAccent(at.value);c.querySelector('#v27-random-accent').onclick=()=>{const n=Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');setAccent('#'+n)};
  c.querySelector('#v27-wallpaper-file').onchange=e=>{[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{state.wallpapers.push(String(r.result));if(!state.wallpaper)state.wallpaper=String(r.result);save();apply();render()};r.readAsDataURL(f)})};
  c.querySelector('#v27-cycle').onclick=cycleWallpaper;c.querySelector('#v27-random').onchange=e=>{state.random=e.target.checked;save();render()};c.querySelector('#v27-slideshow').onchange=e=>{state.slideshow=e.target.checked;save();apply()};
  c.querySelector('#v27-icon').onchange=e=>{state.iconSize=e.target.value;apply()};c.querySelector('#v27-task').onchange=e=>{state.taskbar=e.target.value;apply()};
  const range=(id,key,out,unit)=>{const x=c.querySelector(id),o=c.querySelector(out);x.oninput=()=>{state[key]=+x.value;o.textContent=unit(+x.value);apply()}};
  range('#v27-transparency','transparency','#v27-transparency-out',v=>Math.round(v*100)+'%');range('#v27-radius','radius','#v27-radius-out',v=>v+'px');range('#v27-shadow','shadow','#v27-shadow-out',v=>Math.round(v*100)+'%');
  c.querySelector('#v27-animation').onchange=e=>{state.animation=+e.target.value;apply()};c.querySelector('#v27-reset').onclick=()=>{state={...defaults};apply();render()};
 }
 function render(){const w=window.state?.windows?.settings?.el?.querySelector('.content');if(w){w.innerHTML=page();bind(w)}}
 const oldPage=window.page;window.page=function(id){if(id==='customisation'||id==='customization'||id==='settings')return page();return oldPage?.(id)};
 const oldOpen=window.openApp;window.openApp=function(id,...rest){const r=oldOpen?.(id,...rest);if(id==='customisation'||id==='customization'||id==='settings')setTimeout(render,40);return r};
 const style=document.createElement('style');style.textContent=`
 :root{--v27-bg:#070817;--v27-surface:#10142b;--v27-surface2:#18204a;--v27-text:#f4f6ff;--v27-muted:#a8afd0;--v27-accent:#8b7cff;--v27-alpha:.82;--v27-radius:14px;--v27-shadow:.7;--v27-animation:1}
 body.v27-no-motion *,body.v27-no-motion *::before,body.v27-no-motion *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}
 #wallpaper{background-color:var(--v27-bg)!important}
 #desktop{color:var(--v27-text)}
 .window{border-radius:var(--v27-radius)!important;box-shadow:0 18px 55px rgba(0,0,0,calc(.55 * var(--v27-shadow)))!important;background:color-mix(in srgb,var(--v27-surface) calc(var(--v27-alpha)*100%),transparent)!important}
 .window .titlebar{border-radius:var(--v27-radius) var(--v27-radius) 0 0!important}
 button.primary,.v27-settings button.selected{background:var(--v27-accent)!important;color:#fff!important}
 .v27-settings{padding:22px;max-width:900px;margin:auto;color:var(--v27-text)}.v27-settings h2{margin:0 0 4px}.v27-settings h3{margin:0 0 12px}.v27-settings p{color:var(--v27-muted)}
 .v27-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.v27-section{background:color-mix(in srgb,var(--v27-surface) 88%,transparent);border:1px solid #ffffff12;border-radius:var(--v27-radius);padding:16px;margin:12px 0}.v27-theme-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}.v27-theme{display:grid;gap:8px;padding:10px;border:1px solid #ffffff12;border-radius:12px;background:var(--v27-surface2);color:inherit;text-align:left;cursor:pointer}.v27-theme span{height:45px;border-radius:8px;display:block;padding:7px}.v27-theme span i{display:block;width:20px;height:20px;border-radius:50%}.v27-theme.selected{outline:2px solid var(--v27-accent)}.v27-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.v27-row input:not([type=color]),.v27-controls select{background:var(--v27-surface2);color:inherit;border:1px solid #ffffff18;border-radius:9px;padding:9px}.v27-row input[type=color]{width:48px;height:38px;border:0;background:none}.v27-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.v27-controls label{display:grid;gap:7px;background:var(--v27-surface2);padding:12px;border-radius:10px}.v27-controls input[type=range]{width:100%}.v27-controls output{color:var(--v27-muted);font-size:.85rem}.v27-check{display:flex;gap:6px;align-items:center}.v27-note{font-size:.85rem}.v27-settings .soft{background:var(--v27-surface2);color:inherit;border:1px solid #ffffff12;padding:9px 12px;border-radius:9px}
 body[data-v27-icon-size=small] .desktop-icon{transform:scale(.88)}body[data-v27-icon-size=large] .desktop-icon{transform:scale(1.12)}
 body[data-v27-taskbar=top] #taskbar{top:0!important;bottom:auto!important;border-radius:0 0 14px 14px}body[data-v27-taskbar=top] #icons{padding-top:70px}
 @media(max-width:700px){.v27-controls{grid-template-columns:1fr}.v27-settings{padding:14px}.v27-head{align-items:flex-start}}
 `;document.head.appendChild(style);
 let slideTimer;function startSlide(){clearInterval(slideTimer);if(state.slideshow)slideTimer=setInterval(cycleWallpaper,30000)}
 apply();startSlide();addEventListener('load',()=>{apply();startSlide()});
 window.LoliteV27={version:V,getState:()=>({...state}),apply,cycleWallpaper};
})();
