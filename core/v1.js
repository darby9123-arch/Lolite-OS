/* Lolite OS v1 feature layer: themes, UI presets, performance controls and browser engine diagnostics. */
(()=>{
 const presets={
  windows:{name:'Windows',radius:14,glass:false,compact:false},
  aurora:{name:'Aurora',radius:22,glass:true,compact:false},
  classic:{name:'Classic',radius:8,glass:false,compact:true},
  minimal:{name:'Minimal',radius:6,glass:false,compact:true}
 };
 const accents={purple:'#8b5cf6',blue:'#3b82f6',cyan:'#06b6d4',green:'#22c55e',pink:'#ec4899',orange:'#f97316'};
 const apply=()=>{const d=document.documentElement,p=presets[localStorage.uiPreset||'windows']||presets.windows;d.dataset.ui=presetKey();d.style.setProperty('--ui-radius',p.radius+'px');d.style.setProperty('--accent',accents[localStorage.accent||'purple']);d.classList.toggle('glass',localStorage.glass==='true'||p.glass);d.classList.toggle('compact',localStorage.compact==='true'||p.compact);d.classList.toggle('reduce',localStorage.reduce==='true');d.classList.toggle('no-animations',localStorage.animations==='false');document.body.dataset.taskbar=localStorage.taskbar||'bottom'};
 const presetKey=()=>localStorage.uiPreset||'windows';
 window.LoliteV1={apply,presets,accents};
 const oldLoad=window.loadPrefs;window.loadPrefs=()=>{oldLoad?.();apply()};
 const oldPage=window.page;
 window.page=function(id){
  if(id!=='settings')return oldPage(id);
  const p=presetKey(),a=localStorage.accent||'purple';
  return `<h2>⚙ Settings</h2><p class="muted">v1 gives Lolite OS a much deeper customization system.</p>
  <div class="settings-tabs"><button class="soft" onclick="settingsSection('appearance')">🎨 Appearance</button><button class="soft" onclick="settingsSection('behavior')">🧩 Behavior</button><button class="soft" onclick="settingsSection('browser')">🌐 Browser</button><button class="soft" onclick="settingsSection('system')">💻 System</button></div>
  <div id="settings-body">${appearance()}</div>`;
 };
 function appearance(){const p=presetKey(),a=localStorage.accent||'purple';return `<div class="card"><h3>UI style</h3><div class="preset-grid">${Object.entries(presets).map(([k,v])=>`<button class="ui-preset ${p===k?'selected':''}" onclick="setUIPreset('${k}')"><b>${v.name}</b><span>${k==='windows'?'Familiar desktop':k==='aurora'?'Liquid glass':k==='classic'?'Compact classic':'Clean minimal'}</span></button>`).join('')}</div></div><div class="card"><h3>Accent</h3><div class="accent-grid">${Object.entries(accents).map(([k,v])=>`<button class="accent-dot ${a===k?'selected':''}" title="${k}" style="--dot:${v}" onclick="setAccent('${k}')"></button>`).join('')}</div></div><div class="card"><h3>Effects</h3><label><input type="checkbox" ${localStorage.glass==='true'?'checked':''} onchange="setPref('glass',this.checked)"> Experimental Liquid Glass</label><br><label><input type="checkbox" ${localStorage.animations!=='false'?'checked':''} onchange="setPref('animations',this.checked)"> Smooth animations</label><br><label><input type="checkbox" ${localStorage.compact==='true'?'checked':''} onchange="setPref('compact',this.checked)"> Compact UI</label><p class="muted">Liquid Glass is still experimental and can be turned off at any time.</p></div>`}
 function behavior(){return `<div class="card"><h3>Taskbar</h3><select class="settings-select" onchange="setTaskbar(this.value)"><option value="bottom" ${localStorage.taskbar!=='top'?'selected':''}>Bottom</option><option value="top" ${localStorage.taskbar==='top'?'selected':''}>Top</option></select></div><div class="card"><h3>Clock</h3><select class="settings-select" onchange="localStorage.clock=this.value;toast('Clock preference saved')"><option value="24" ${localStorage.clock!=='12'?'selected':''}>24-hour</option><option value="12" ${localStorage.clock==='12'?'selected':''}>12-hour</option></select></div><div class="card"><h3>Accessibility</h3><label><input type="checkbox" ${localStorage.reduce==='true'?'checked':''} onchange="setPref('reduce',this.checked)"> Reduce Motion</label></div><div class="card"><h3>Startup</h3><label><input type="checkbox" ${localStorage.startHome!=='false'?'checked':''} onchange="localStorage.startHome=this.checked"> Open Home on startup</label></div>`}
 function browser(){return `<div class="card"><h3>🌐 Browser engine</h3><select class="settings-select" onchange="setBrowserEngine(this.value)"><option value="native" ${localStorage.browserEngine!=='scramjet'?'selected':''}>Lolite Native</option><option value="scramjet" ${localStorage.browserEngine==='scramjet'?'selected':''}>Scramjet — Experimental</option></select><div id="sj-status" class="engine-status">Checking Scramjet runtime…</div><p class="muted">Scramjet is an interception-based web proxy. Its current upstream architecture requires a controller, service worker and proxy transport; v1 checks for those pieces instead of pretending a static page is fully proxied.</p></div><div class="card"><h3>Search</h3><label><input type="checkbox" ${localStorage.aiSearch!=='false'?'checked':''} onchange="localStorage.aiSearch=this.checked"> AI search overview</label><p class="muted">Keeps the current lightweight local search experience.</p></div>`}
 function system(){return `<div class="card"><h3>🛠 Lolite OS v1</h3><p>Major release with UI presets, deeper settings, browser engine diagnostics, HTML game pack additions and performance controls.</p><button class="soft" onclick="localStorage.clear();location.reload()">Reset Lolite preferences</button></div><div class="card"><h3>Compatibility</h3><p class="muted">Current build: ${window.LoliteVersion?.current||'1.0'}. Older builds can trigger the compatibility warning.</p></div>`}
 window.settingsSection=s=>{const b=document.getElementById('settings-body');if(!b)return;b.innerHTML=s==='appearance'?appearance():s==='behavior'?behavior():s==='browser'?browser():system();if(s==='browser')setTimeout(()=>window.LoliteScramjet?.check(),0)};
 window.setUIPreset=k=>{localStorage.uiPreset=k;apply();openApp('settings','Settings')};
 window.setAccent=k=>{localStorage.accent=k;apply();openApp('settings','Settings')};
 window.setPref=(k,v)=>{localStorage[k]=v;apply();toast('Setting saved')};
 window.setTaskbar=v=>{localStorage.taskbar=v;apply();toast('Taskbar position saved')};
 window.setBrowserEngine=v=>{localStorage.browserEngine=v;toast(v==='scramjet'?'Scramjet experimental mode selected':'Native browser selected');window.LoliteScramjet?.check()};
 setTimeout(()=>apply(),0);
})();
