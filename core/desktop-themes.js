/* Lolite desktop themes — visual shell only, no application or file mutations. */
(()=>{
  'use strict';
  const KEY='loliteDesktopTheme';
  const THEMES=[
    {id:'windowsxp',name:'Windows XP',desc:'Bright blue window frames and a green launcher.',featured:true},
    {id:'macos',name:'macOS',desc:'A floating frost-white dock and softly rounded silver window chrome.',featured:true},
    {id:'windows11',name:'Windows 11',desc:'Cool blue surfaces, rounded windows and a centred taskbar.',featured:true},
    {id:'windows10',name:'Windows 10',desc:'Charcoal panels, clean corners and a classic left-aligned taskbar.',featured:true},
    {id:'paper-studio',name:'Paper Studio',desc:'Warm paper-toned panels, plum accents and slim window borders.',featured:true},
    {id:'vaporwave',name:'Vaporwave',desc:'A violet dock and neon pink windows with cyan highlights.',featured:true},
    {id:'amber-terminal',name:'Amber Terminal',desc:'Amber-on-black controls and monospace window titles.',featured:true},
    {id:'cosmos',name:'Lolite Cosmos',desc:'An original orbital desktop with glass panels, cyan lighting and a floating dock.',preview:'cosmos'},
    {id:'crimson',name:'Lolite Crimson',desc:'Charcoal surfaces, precise red accents and a quiet, compact desktop.',preview:'crimson'},
    {id:'aero7',name:'Windows 7 Aero',desc:'Luminous glass edges, translucent blue taskbar and classic Start placement.',preview:'aero'},
    {id:'plasma',name:'KDE Plasma',desc:'Floating panel, violet accents and a flexible desktop workspace.',preview:'plasma'},
    {id:'gnome',name:'GNOME Minimal',desc:'Dark top bar, clean windows and a quiet distraction-free layout.',preview:'gnome'},
    {id:'deepin',name:'Deepin Elegant',desc:'Centered translucent dock, soft curves and bright polished surfaces.',preview:'deepin'}
  ];
  const VALID=new Set(THEMES.map(theme=>theme.id));
  const root=document.documentElement;
  let chosen='cosmos';
  const $=selector=>document.querySelector(selector);
  const saved=()=>{
    try{const value=localStorage.getItem(KEY);return VALID.has(value)?value:'cosmos'}
    catch(_){return 'cosmos'}
  };
  const setTheme=(value,save=true)=>{
    if(!VALID.has(value))return false;
    chosen=value;
    root.dataset.desktopTheme=value;
    if(save){try{localStorage.setItem(KEY,value)}catch(_){}}
    window.dispatchEvent(new CustomEvent('lolite:desktopthemechange',{detail:{theme:value}}));
    return true;
  };
  function previewMarkup(id){
    const theme=THEMES.find(item=>item.id===id);
    if(!theme)return '';
    return '<span class="ldt-scene'+(theme.preview?' '+theme.preview:'')+'" data-ldt-preview="'+id+'" aria-hidden="true">'+
      '<span class="ldt-window"></span><span class="ldt-dock"><i></i><i></i><i></i><i></i><i></i></span></span>';
  }
  function close(){const picker=$('#loliteDesktopThemePicker');if(picker)picker.remove()}
  function open(options={}){
    close();
    const onSelect=typeof options.onSelect==='function'?options.onSelect:()=>{};
    const onBack=typeof options.onBack==='function'?options.onBack:()=>{};
    let candidate=saved();
    const picker=document.createElement('section');
    picker.id='loliteDesktopThemePicker';
    picker.setAttribute('role','dialog');
    picker.setAttribute('aria-modal','true');
    picker.setAttribute('aria-label','Choose Desktop Lolite theme');
    const cards=THEMES.map(theme=>[
       '<button type="button" class="ldt-card" role="radio" aria-checked="',String(candidate===theme.id),
       '" data-ldt-theme="',theme.id,'">',
       previewMarkup(theme.id),
       '<span class="ldt-name">',theme.name,'<span class="ldt-check" aria-hidden="true">',candidate===theme.id?'✓':'','</span></span>',
       '<span class="ldt-desc">',theme.desc,'</span></button>'
    ].join('')).join('');
    picker.innerHTML=[
      '<div class="ldt-wrap">',
       '<div class="ldt-header"><span class="ldt-eyebrow">LOLITE OS / DESKTOP</span><button class="ldt-back" type="button" id="ldtBack">← Back</button></div>',
       '<h1>Choose your desktop theme</h1>',
       '<p class="ldt-intro">Choose a style for the taskbar, menus and window frames.</p>',
       '<div class="ldt-grid" role="radiogroup" aria-label="Desktop theme">',cards,'</div>',
       '<div class="ldt-actions"><span class="ldt-note">Your files and installed apps are shared between every theme. Your selection is remembered on this device.</span>',
       '<button type="button" class="ldt-launch" id="ldtLaunch">Launch Desktop →</button></div>',
      '</div>'
    ].join('');
    function highlight(){
      picker.querySelectorAll('[data-ldt-theme]').forEach(button=>{
        const active=button.dataset.ldtTheme===candidate;
        button.setAttribute('aria-checked',String(active));
        button.querySelector('.ldt-check').textContent=active?'✓':'';
      });
    }
    picker.addEventListener('click',event=>{
      const choice=event.target.closest('[data-ldt-theme]');
      if(choice){candidate=choice.dataset.ldtTheme;highlight()}
    });
    picker.querySelector('#ldtBack').addEventListener('click',()=>{close();onBack()});
    picker.querySelector('#ldtLaunch').addEventListener('click',()=>{
      setTheme(candidate);
      close();
      onSelect(candidate);
    });
    picker.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();onBack()}
      if(event.key==='Enter'&&event.target.matches('[data-ldt-theme]')){
        event.preventDefault();candidate=event.target.dataset.ldtTheme;highlight();
        picker.querySelector('#ldtLaunch').focus();
      }
    });
    document.body.appendChild(picker);
    picker.querySelector('[aria-checked="true"]')?.focus({preventScroll:true});
  }
  function init(){
    // Loading a saved theme does not select Desktop Style or start any apps.
    window.LoliteDesktopThemes={themes:THEMES.map(({id,name,desc,featured})=>({id,name,desc,featured:!!featured})),
      open,setTheme,getTheme:()=>chosen,restore:()=>setTheme(saved(),false),close,previewMarkup};
    setTheme(saved(),false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
