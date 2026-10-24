/* Lolite Browser Style themes: all five share the same running apps, games and account state.
   Only the presentation and navigation surfaces change. */
(()=>{
  'use strict';
  const KEY='loliteBrowserTheme';
  const THEMES=Object.freeze([
    {id:'crimson',number:1,name:'Lolite Crimson',tag:'The new Lolite',description:'Focused navigation, charcoal panels and a distinctive red identity.'},
    {id:'firefox',number:2,name:'Firefox Flow',tag:'Colourful and familiar',description:'Bright tabbed layout, rounded search and smooth purple accents.'},
    {id:'opera',number:3,name:'Opera GX Gaming',tag:'Built for play',description:'Dark red-and-black gaming interface with a bold sidebar and quick tabs.'},
    {id:'arc',number:4,name:'Arc Workspace',tag:'Focus on spaces',description:'Tall organised sidebar, floating controls and a distraction-free workspace.'},
    {id:'zen',number:7,name:'Zen Minimal',tag:'Just the essentials',description:'Ultra-compact navigation rail that expands when you need it.'},
    {id:'brave',number:8,name:'Brave Dashboard',tag:'Your starting point',description:'Scenic dashboard, translucent app tiles and fast access to your favourites.'}
  ]);
  const IDS=new Set(THEMES.map(t=>t.id));
  const QUICK=[
    {id:'home',label:'Home',symbol:'⌂'},
    {id:'games',label:'Games',symbol:'▣'},
    {id:'appstore',label:'Apps',symbol:'▦'},
    {id:'files',label:'Files',symbol:'▤'},
    {id:'chatroom',label:'Chat',symbol:'◉'}
  ];
  const root=document.documentElement;
  const $=s=>document.querySelector(s);
  let current='crimson';
  function storedTheme(){
    try{const t=localStorage.getItem(KEY);return IDS.has(t)?t:'crimson'}catch(_){return 'crimson'}
  }
  function getTheme(){return current}
  function syncQuickTabs(id){
    const shell=$('#loliteBrowseShell');
    if(!shell)return;
    const active=id||'home';
    shell.querySelectorAll('.lbt-shortcut[data-lb-open]').forEach(btn=>{
      const selected=btn.dataset.lbOpen===active;
      btn.classList.toggle('active',selected);
      if(selected)btn.setAttribute('aria-current','page');
      else btn.removeAttribute('aria-current');
    });
  }
  function enhanceShell(){
    const shell=$('#loliteBrowseShell');
    if(!shell||!root.classList.contains('browsing-mode'))return;
    const header=shell.querySelector('.lb-header');
    if(!header)return;
    if(!header.querySelector('#lbThemeSwitch')){
      const button=document.createElement('button');
      button.type='button';
      button.id='lbThemeSwitch';
      button.className='lb-theme-switch';
      button.title='Change Browser Lolite theme';
      button.setAttribute('aria-label','Change Browser Lolite theme');
      button.innerHTML='<span aria-hidden="true" class="lb-theme-switch-symbol">◈</span><span class="lb-theme-switch-label">Themes</span>';
      button.addEventListener('click',()=>open());
      header.insertBefore(button,header.querySelector('#lbSwitch'));
    }
    if(!shell.querySelector('#lbThemeTabs')){
      const tabs=document.createElement('nav');
      tabs.id='lbThemeTabs';
      tabs.className='lb-theme-tabs';
      tabs.setAttribute('aria-label','Quick app navigation');
      QUICK.forEach(item=>{
        const button=document.createElement('button');
        button.type='button';button.className='lbt-shortcut';
        button.dataset.lbOpen=item.id;
        button.title='Open '+item.label;
        button.innerHTML='<span aria-hidden="true" class="lbt-shortcut-icon">'+item.symbol+'</span><span>'+item.label+'</span>';
        tabs.appendChild(button);
      });
      header.after(tabs);
    }
    const currentNav=shell.querySelector('.lb-nav-item.active');
    syncQuickTabs(currentNav?.dataset.lbOpen||'home');
  }
  function setTheme(id,persist=true){
    if(!IDS.has(id))return false;
    current=id;
    root.dataset.browserTheme=id;
    if(persist){try{localStorage.setItem(KEY,id)}catch(_){}}
    enhanceShell();
    window.dispatchEvent(new CustomEvent('lolite:browserthemechange',{detail:{theme:id}}));
    return true;
  }
  function close(){
    $('#loliteBrowserThemePicker')?.remove();
  }
  function open(options={}){
    close();
    const previousFocus=document.activeElement;
    const onSelect=typeof options.onSelect==='function'?options.onSelect:()=>{};
    const onBack=typeof options.onBack==='function'?options.onBack:()=>{};
    let candidate=current;
    const picker=document.createElement('section');
    picker.id='loliteBrowserThemePicker';
    picker.setAttribute('role','dialog');
    picker.setAttribute('aria-modal','true');
    picker.setAttribute('aria-labelledby','lbtPickerTitle');
    const cards=THEMES.map(theme=>[
      '<label class="lbt-choice',candidate===theme.id?' is-selected':'','" data-lbt-card="',theme.id,'">',
      '<input type="radio" name="lbt-browser-theme" value="',theme.id,'"',candidate===theme.id?' checked':'','>',
      '<span class="lbt-preview lbt-preview-',theme.id,'" aria-hidden="true">',
       '<span class="lbt-preview-top"><i></i><i></i><i></i></span>',
       '<span class="lbt-preview-side"><i></i><i></i><i></i><i></i></span>',
       '<span class="lbt-preview-page"><b></b><i></i><i></i><i></i></span>',
       '<span class="lbt-preview-tabs"><i></i><i></i><i></i></span>',
      '</span>',
      '<span class="lbt-choice-row"><strong>',theme.name,'</strong><span class="lbt-picked" aria-hidden="true">',candidate===theme.id?'✓':'','</span></span>',
      '<span class="lbt-choice-tag">',theme.tag,'</span>',
      '<span class="lbt-choice-desc">',theme.description,'</span>',
      '</label>'
    ].join('')).join('');
    picker.innerHTML=[
      '<div class="lbt-container"><div class="lbt-heading-row">',
       '<div class="lbt-identity"><img src="assets/lolite-glass-logo.svg" alt=""><span>LOLITE OS <small>/ BROWSER STYLE</small></span></div>',
       '<button type="button" class="lbt-back" id="lbtBack">← Back</button>',
      '</div><p class="lbt-overline">PERSONALISE YOUR WORKSPACE</p>',
      '<h1 id="lbtPickerTitle">Choose your browser theme</h1>',
      '<p class="lbt-subtitle">Six different ways to experience the same Lolite apps, games, chats and files. Your choice is saved.</p>',
      '<div class="lbt-theme-grid" role="radiogroup" aria-label="Browser theme">',cards,'</div>',
      '<div class="lbt-actions"><p>All six themes use your existing Lolite apps, accounts and game library. You can switch themes later without restarting.</p>',
      '<button type="button" class="lbt-launch" id="lbtLaunch">Launch Browser Lolite <span aria-hidden="true">→</span></button></div></div>'
    ].join('');
    function mark(){
      picker.querySelectorAll('[data-lbt-card]').forEach(label=>{
        const chosen=label.dataset.lbtCard===candidate;
        label.classList.toggle('is-selected',chosen);
        label.querySelector('.lbt-picked').textContent=chosen?'✓':'';
      });
    }
    function back(){
      close();
      onBack();
      if(!options.onBack&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    }
    picker.addEventListener('change',event=>{
      if(event.target.matches('input[name="lbt-browser-theme"]')){
        candidate=event.target.value;mark();
      }
    });
    picker.querySelector('#lbtBack').addEventListener('click',back);
    picker.querySelector('#lbtLaunch').addEventListener('click',()=>{
      setTheme(candidate);
      close();
      onSelect(candidate);
      if(!options.onSelect&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    });
    picker.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();back()}
      if(event.key==='Tab'){
        const focusables=Array.from(picker.querySelectorAll('button,input:not([disabled])')).filter(el=>el.getClientRects().length);
        if(!focusables.length)return;
        const first=focusables[0],last=focusables[focusables.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      }
    });
    document.body.appendChild(picker);
    picker.querySelector('input[name="lbt-browser-theme"]:checked')?.focus({preventScroll:true});
  }
  function init(){
    current=storedTheme();
    // Adding this attribute does not select Browser Style; themes are scoped to browsing-mode.
    root.dataset.browserTheme=current;
    window.LoliteBrowserThemes={
      themes:THEMES.map(({id,number,name,description})=>({id,number,name,description})),
      open,close,getTheme,setTheme,restore:()=>setTheme(storedTheme(),false),enhanceShell
    };
    window.addEventListener('lolite:modechange',event=>{
      if(event.detail?.mode==='browsing')enhanceShell();
    });
    window.addEventListener('lolite:browsingnavigate',event=>syncQuickTabs(event.detail?.appId));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
