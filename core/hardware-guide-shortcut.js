/* Lolite OS — browser hardware acceleration help shortcut */
(()=> {
  function addGuideShortcut(){
    const icons=document.getElementById('icons');
    if(icons && !document.getElementById('hardware-acceleration-shortcut')){
      const b=document.createElement('button');
      b.id='hardware-acceleration-shortcut';
      b.className='desktop-icon';
      b.innerHTML='<b class="app-symbol" aria-hidden="true" style="display:grid;place-items:center;font-size:22px;color:#bdb5ff">⚡</b><span>Hardware Acceleration Guide</span>';
      b.addEventListener('dblclick',()=>window.loliteOpenAccelerationGuide?.());
      icons.appendChild(b);
    }
    const features=document.querySelector('.home-feature-grid');
    if(features && !document.getElementById('home-hardware-guide')){
      const card=document.createElement('article');
      card.id='home-hardware-guide';
      card.className='home-feature';
      card.innerHTML='<div class="home-feature-icon">⚡</div><h3>Hardware Acceleration Guide</h3><p>Get browser-specific steps for Brave, Opera GX, Firefox, Chrome or Safari.</p><button type="button">Learn more →</button>';
      card.querySelector('button').addEventListener('click',()=>window.loliteOpenAccelerationGuide?.());
      features.appendChild(card);
    }
  }
  // Avoid watching the entire document: Lolite's animated desktop changes DOM often,
  // and a document-wide observer can make Firefox report that the page is slowing down.
  addGuideShortcut();
  document.addEventListener('DOMContentLoaded',addGuideShortcut,{once:true});
  window.setTimeout(addGuideShortcut,400);
  window.setTimeout(addGuideShortcut,1200);
})();
