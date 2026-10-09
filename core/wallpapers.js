/* Lolite OS 3.9.0 wallpaper library: reliable static/live wallpaper application and matching UI themes. */
(()=>{
  const wallpapers={
    Lolite:[
      ['Lolite Aurora','lolite-aurora','radial-gradient(circle at 20% 15%,#6d28d9 0,#1e1b4b 35%,#07050d 78%)'],
      ['Purple Bloom','purple-bloom','radial-gradient(circle at 75% 25%,#8b5cf6 0,#2e1065 35%,#090613 75%)'],
      ['Blue Pulse','blue-pulse','radial-gradient(circle at 30% 70%,#2563eb 0,#172554 40%,#050816 78%)']
    ],
    Abstract:[
      ['Liquid Violet','liquid-violet','radial-gradient(circle at 20% 30%,#a855f7 0,transparent 35%),radial-gradient(circle at 80% 70%,#2563eb 0,transparent 40%),#10071d'],
      ['Neon Waves','neon-waves','linear-gradient(135deg,#090613 0 35%,#312e81 50%,#0e7490 70%,#090613)'],
      ['Midnight Mesh','midnight-mesh','radial-gradient(circle at 50% 50%,#334155 0,transparent 25%),linear-gradient(45deg,#0f172a,#1e1b4b,#020617)']
    ],
    Nature:[
      ['Forest Mist','forest-mist','linear-gradient(135deg,#052e16,#14532d 45%,#0f172a)'],
      ['Ocean Dawn','ocean-dawn','linear-gradient(160deg,#082f49,#0369a1 45%,#bae6fd)'],
      ['Mountain Evening','mountain-evening','linear-gradient(180deg,#172554 0,#312e81 48%,#111827 49%,#030712 100%)']
    ],
    Space:[
      ['Deep Space','deep-space','radial-gradient(circle at 75% 25%,#4338ca 0,transparent 18%),radial-gradient(circle at 25% 70%,#1d4ed8 0,transparent 20%),#020617'],
      ['Purple Nebula','purple-nebula','radial-gradient(circle at 50% 45%,#c026d3 0,transparent 20%),radial-gradient(circle at 25% 65%,#4c1d95 0,transparent 35%),#02010a'],
      ['Blue Galaxy','blue-galaxy','radial-gradient(circle at 65% 40%,#60a5fa 0,transparent 10%),radial-gradient(circle at 40% 60%,#1e40af 0,transparent 32%),#020617']
    ],
    Pixel:[
      ['Pixel Night','pixel-night','linear-gradient(45deg,#111827 25%,#1f2937 25% 50%,#111827 50% 75%,#1f2937 75%)'],
      ['Pixel Purple','pixel-purple','linear-gradient(45deg,#2e1065 25%,#4c1d95 25% 50%,#2e1065 50% 75%,#4c1d95 75%)']
    ],
    Gaming:[
      ['Arcade','arcade','linear-gradient(135deg,#111827,#4c1d95 45%,#1e3a8a)'],
      ['Cyber Grid','cyber-grid','linear-gradient(#172554 1px,transparent 1px),linear-gradient(90deg,#172554 1px,transparent 1px),#020617'],
      ['Game Over','game-over','radial-gradient(circle,#7f1d1d 0,#450a0a 35%,#090613 75%)']
    ],
    Dark:[
      ['Obsidian','obsidian','linear-gradient(135deg,#111827,#030712)'],
      ['Dark Violet','dark-violet','linear-gradient(135deg,#1a102b,#080611 65%)']
    ],
    Minimal:[
      ['Soft Slate','soft-slate','linear-gradient(135deg,#334155,#0f172a)'],
      ['Minimal Blue','minimal-blue','linear-gradient(135deg,#1e3a8a,#0f172a)']
    ],
    Retro:[
      ['Vaporwave','vaporwave','linear-gradient(180deg,#701a75,#db2777 50%,#312e81)'],
      ['Retro Sunset','retro-sunset','linear-gradient(180deg,#7c2d12,#ea580c 48%,#312e81)']
    ],
    'World Sandbox':[
      ['World Green','world-green','linear-gradient(180deg,#60a5fa 0 45%,#65a30d 46% 100%)'],
      ['World Snow','world-snow','linear-gradient(180deg,#bfdbfe 0 50%,#e5e7eb 51% 100%)'],
      ['World Desert','world-desert','linear-gradient(180deg,#38bdf8 0 48%,#d6ae59 49% 100%)']
    ],
    Animated:[
      ['Aurora Flow','animated-aurora','radial-gradient(ellipse at 20% 30%,#34d399 0,transparent 35%),radial-gradient(ellipse at 75% 60%,#7c3aed 0,transparent 38%),linear-gradient(135deg,#071a2b,#11102d)', 'aurora'],
      ['Nebula Drift','animated-nebula','radial-gradient(ellipse at 55% 40%,#e879f9 0,transparent 22%),radial-gradient(ellipse at 25% 65%,#6d28d9 0,transparent 40%),#070512', 'nebula'],
      ['Ocean Motion','animated-ocean','linear-gradient(160deg,#082f49,#0369a1 48%,#0c4a6e)', 'ocean'],
      ['Cyber Matrix','animated-matrix','linear-gradient(135deg,#052e16,#064e3b 50%,#020617)', 'matrix'],
      ['Solar Flare','animated-solar','radial-gradient(ellipse at 50% 110%,#fb923c 0,transparent 48%),linear-gradient(180deg,#1e1b4b,#312e81 58%,#090613)', 'solar'],
      ['Galaxy Spiral','animated-galaxy','radial-gradient(ellipse at 70% 25%,#60a5fa 0,transparent 15%),radial-gradient(ellipse at 35% 70%,#7c3aed 0,transparent 38%),#020617', 'galaxy']
    ]
  };
  const all=Object.values(wallpapers).flat();
  const find=id=>all.find(x=>x[1]===id)||null;
  const tones={
    'lolite-aurora':['#8b6cff','#4d8dff'],'purple-bloom':['#c084fc','#8b5cf6'],'blue-pulse':['#3b82f6','#60a5fa'],
    'liquid-violet':['#c084fc','#60a5fa'],'neon-waves':['#22d3ee','#8b5cf6'],'midnight-mesh':['#94a3b8','#818cf8'],
    'forest-mist':['#4ade80','#86efac'],'ocean-dawn':['#38bdf8','#7dd3fc'],'mountain-evening':['#818cf8','#a5b4fc'],
    'deep-space':['#6366f1','#60a5fa'],'purple-nebula':['#e879f9','#a78bfa'],'blue-galaxy':['#60a5fa','#818cf8'],
    'pixel-night':['#9ca3af','#6b7280'],'pixel-purple':['#c084fc','#a78bfa'],'arcade':['#a78bfa','#60a5fa'],
    'cyber-grid':['#4ade80','#22d3ee'],'game-over':['#f87171','#fb7185'],'obsidian':['#9ca3af','#64748b'],
    'dark-violet':['#a78bfa','#818cf8'],'soft-slate':['#cbd5e1','#94a3b8'],'minimal-blue':['#60a5fa','#93c5fd'],
    'vaporwave':['#f472b6','#c084fc'],'retro-sunset':['#fb923c','#f472b6'],'world-green':['#84cc16','#60a5fa'],
    'world-snow':['#e2e8f0','#93c5fd'],'world-desert':['#fbbf24','#38bdf8'],'animated-aurora':['#34d399','#8b5cf6'],
    'animated-nebula':['#e879f9','#8b5cf6'],'animated-ocean':['#38bdf8','#0ea5e9'],'animated-matrix':['#4ade80','#10b981'],
    'animated-solar':['#fb923c','#f43f5e'],'animated-galaxy':['#60a5fa','#a78bfa']
  };
  const apply=id=>{
    const w=find(id);if(!w)return false;
    const el=document.getElementById('wallpaper');
    if(el){el.style.background=w[2];el.dataset.motion=w[3]||'';el.classList.toggle('wallpaper-animated',!!w[3]);el.classList.toggle('wallpaper-pixel',w[1].startsWith('pixel-'))}
    const tone=tones[w[1]]||['#8b6cff','#4d8dff'];
    document.documentElement.style.setProperty('--accent',tone[0]);
    document.documentElement.style.setProperty('--blue',tone[1]);
    document.documentElement.style.setProperty('--wallpaper-accent-soft',tone[0]+'26');
    document.documentElement.dataset.wallpaper=w[1];
    localStorage.wallpaperId=w[1];localStorage.wallpaper=w[1];
    const panel=document.querySelector('[data-window-id="settings"] .content');
    if(panel)panel.innerHTML=window.page('settings');
    return true;
  };
  window.loliteWallpaper=apply;
  window.loliteWallpaperIds=all.map(w=>w[1]);
  window.loliteWallpaperCategory=cat=>{localStorage.wallpaperCategory=cat;const panel=document.querySelector('[data-window-id="settings"] .content');if(panel)panel.innerHTML=window.page('settings')};
  const style=document.createElement('style');style.textContent=`.wallpaper-cats{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 14px}.wallpaper-cat{padding:8px 11px;border-radius:999px;background:#ffffff08;border:1px solid #ffffff10}.wallpaper-cat.active{border-color:#8b5cf6aa;background:#8b5cf622}.wallpaper-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px}.wallpaper-card{padding:0;overflow:hidden;text-align:left;background:#ffffff06;border:1px solid #ffffff10;border-radius:14px}.wallpaper-preview{height:82px;position:relative;overflow:hidden}.wallpaper-preview.wallpaper-motion:after{content:'';position:absolute;inset:-30%;background:radial-gradient(ellipse at 30% 40%,#ffffff33,transparent 30%),radial-gradient(ellipse at 70% 60%,#8b5cf655,transparent 38%);animation:wallpaperPreviewFlow 8s ease-in-out infinite alternate}.wallpaper-preview[data-motion='ocean']:after{background:linear-gradient(160deg,#ffffff00,#67e8f933,#ffffff00);animation-duration:5s}.wallpaper-preview[data-motion='matrix']:after{background:repeating-linear-gradient(90deg,#4ade8020 0 1px,transparent 1px 12px);animation-duration:3s}.wallpaper-card b{display:block;padding:9px 10px;font-size:12px}.wallpaper-card.active{outline:2px solid #8b5cf6;outline-offset:1px}`;document.head.append(style);
  style.textContent+=`\n@keyframes wallpaperPreviewFlow{from{transform:translate3d(-5%,3%,0) rotate(-8deg) scale(.95)}to{transform:translate3d(6%,-4%,0) rotate(8deg) scale(1.15)}}\n@keyframes wallpaperAurora{0%,100%{transform:translate3d(-8%,2%,0) scale(1);filter:hue-rotate(0deg)}50%{transform:translate3d(9%,-5%,0) scale(1.18);filter:hue-rotate(55deg)}}\n@keyframes wallpaperNebula{0%,100%{transform:translate3d(-6%,5%,0) rotate(0deg) scale(1);opacity:.5}50%{transform:translate3d(7%,-7%,0) rotate(18deg) scale(1.28);opacity:.95}}\n@keyframes wallpaperOcean{0%,100%{transform:translateX(-9%) skewY(-5deg);opacity:.35}50%{transform:translateX(10%) skewY(5deg);opacity:.8}}\n@keyframes wallpaperMatrix{0%{transform:translateY(-8%);opacity:.35}100%{transform:translateY(8%);opacity:.8}}\n@keyframes wallpaperSolar{0%,100%{transform:scale(.9) translateY(3%);filter:brightness(.85)}50%{transform:scale(1.18) translateY(-5%);filter:brightness(1.25)}}\n@keyframes wallpaperGalaxy{0%,100%{transform:rotate(-10deg) scale(.95)}50%{transform:rotate(14deg) scale(1.2)}}\n#wallpaper.wallpaper-animated{isolation:isolate;overflow:hidden}\n#wallpaper.wallpaper-animated:before{content:'';position:absolute;inset:-22%;pointer-events:none;background:radial-gradient(ellipse at 25% 40%,#34d39955,transparent 28%),radial-gradient(ellipse at 75% 65%,#8b5cf655,transparent 35%),radial-gradient(ellipse at 55% 15%,#38bdf833,transparent 25%);mix-blend-mode:screen;animation:wallpaperAurora 16s ease-in-out infinite}\n#wallpaper[data-motion='nebula']:before{background:radial-gradient(ellipse at 55% 40%,#e879f966,transparent 24%),radial-gradient(ellipse at 25% 65%,#6d28d966,transparent 40%);animation-name:wallpaperNebula;animation-duration:22s}\n#wallpaper[data-motion='ocean']:before{background:repeating-linear-gradient(170deg,#7dd3fc00 0 12%,#7dd3fc22 13%,#0ea5e922 18%,#7dd3fc00 24%);animation-name:wallpaperOcean;animation-duration:12s}\n#wallpaper[data-motion='matrix']:before{inset:-10%;background:repeating-linear-gradient(90deg,#4ade8020 0 1px,transparent 1px 36px),repeating-linear-gradient(0deg,#4ade8018 0 1px,transparent 1px 36px);animation-name:wallpaperMatrix;animation-duration:8s}\n#wallpaper[data-motion='solar']:before{background:radial-gradient(ellipse at 50% 110%,#fb923caa 0,transparent 48%),radial-gradient(ellipse at 30% 100%,#f43f5e66 0,transparent 40%);animation-name:wallpaperSolar;animation-duration:11s}\n#wallpaper[data-motion='galaxy']:before{background:repeating-radial-gradient(ellipse at 60% 40%,#93c5fd22 0 2px,transparent 3px 28px),radial-gradient(ellipse at 60% 40%,#7c3aed88,transparent 40%);animation-name:wallpaperGalaxy;animation-duration:26s}\n@media(prefers-reduced-motion:reduce){#wallpaper.wallpaper-animated:before,.wallpaper-preview.wallpaper-motion:after{animation:none!important}}`;
  const originalPage=window.page;
  window.page=function(id){
    if(id!=='settings')return originalPage(id);
    const active=localStorage.wallpaperId||'lolite-aurora';
    const cats=Object.keys(wallpapers);
    const renderCat=cat=>`<div class="wallpaper-grid">${wallpapers[cat].map(w=>`<button class="wallpaper-card ${active===w[1]?'active':''}" onclick="loliteWallpaper('${w[1]}')"><div class="wallpaper-preview ${w[3]?'wallpaper-motion':''}" data-motion="${w[3]||''}" style="background:${w[2]}"></div><b>${w[0]}</b></button>`).join('')}</div>`;
    const chosen=localStorage.wallpaperCategory||'Lolite';
    return `<h2>Settings</h2><div class="card"><h3>Appearance</h3><label><input type="checkbox" ${localStorage.glass==='true'?'checked':''} onchange="toggleGlass(this.checked)"> Liquid Glass (WebGL)</label><p class="muted">OFF by default. WebGL-powered fluid reflections, liquid caustics and translucent depth.</p></div><div class="card"><h3>Accessibility</h3><label><input type="checkbox" ${localStorage.reduce==='true'?'checked':''} onchange="toggleReduce(this.checked)"> Reduce Motion</label></div><div class="card"><h3>🖼️ Wallpaper Library</h3><p class="muted">Choose a wallpaper from Lolite's built-in lightweight library.</p><div class="wallpaper-cats">${cats.map(c=>`<button class="wallpaper-cat ${c===chosen?'active':''}" onclick="loliteWallpaperCategory('${c}')">${c}</button>`).join('')}</div>${renderCat(wallpapers[chosen]?chosen:'Lolite')}</div>`;
  };
  setTimeout(()=>{const saved=localStorage.wallpaperId;if(saved)apply(saved)},0);
})();
