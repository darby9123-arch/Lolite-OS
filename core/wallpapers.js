/* Lolite OS wallpaper library: lightweight CSS-only wallpapers with persistent selection. */
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
    ]
  };
  const all=Object.values(wallpapers).flat();
  const find=id=>all.find(x=>x[1]===id)||all[0];
  const apply=id=>{const w=find(id);if(!w)return;const el=document.getElementById('wallpaper');if(el)el.style.background=w[2];localStorage.wallpaperId=w[1];localStorage.wallpaper=w[1]};
  window.loliteWallpaper=apply;
  const style=document.createElement('style');style.textContent=`.wallpaper-cats{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 14px}.wallpaper-cat{padding:8px 11px;border-radius:999px;background:#ffffff08;border:1px solid #ffffff10}.wallpaper-cat.active{border-color:#8b5cf6aa;background:#8b5cf622}.wallpaper-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px}.wallpaper-card{padding:0;overflow:hidden;text-align:left;background:#ffffff06;border:1px solid #ffffff10;border-radius:14px}.wallpaper-preview{height:82px}.wallpaper-card b{display:block;padding:9px 10px;font-size:12px}.wallpaper-card.active{outline:2px solid #8b5cf6;outline-offset:1px}`;document.head.append(style);
  const originalPage=window.page;
  window.page=function(id){
    if(id!=='settings')return originalPage(id);
    const active=localStorage.wallpaperId||'lolite-aurora';
    const cats=Object.keys(wallpapers);
    const renderCat=cat=>`<div class="wallpaper-grid">${wallpapers[cat].map(w=>`<button class="wallpaper-card ${active===w[1]?'active':''}" onclick="loliteWallpaper('${w[1]}');openApp('settings','Settings')"><div class="wallpaper-preview" style="background:${w[2]}"></div><b>${w[0]}</b></button>`).join('')}</div>`;
    const chosen=localStorage.wallpaperCategory||'Lolite';
    return `<h2>Settings</h2><div class="card"><h3>Appearance</h3><label><input type="checkbox" ${localStorage.glass==='true'?'checked':''} onchange="toggleGlass(this.checked)"> Experimental Liquid Glass</label><p class="muted">OFF by default. Lightweight translucent UI treatment.</p></div><div class="card"><h3>Accessibility</h3><label><input type="checkbox" ${localStorage.reduce==='true'?'checked':''} onchange="toggleReduce(this.checked)"> Reduce Motion</label></div><div class="card"><h3>🖼️ Wallpaper Library</h3><p class="muted">Choose a wallpaper from Lolite's built-in lightweight library.</p><div class="wallpaper-cats">${cats.map(c=>`<button class="wallpaper-cat ${c===chosen?'active':''}" onclick="localStorage.wallpaperCategory='${c}';openApp('settings','Settings')">${c}</button>`).join('')}</div>${renderCat(wallpapers[chosen]?chosen:'Lolite')}</div>`;
  };
  setTimeout(()=>{const saved=localStorage.wallpaperId;if(saved)apply(saved)},0);
})();
