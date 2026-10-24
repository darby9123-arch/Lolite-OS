/* Lolite desktop themes — visual shell only, no application or file mutations. */
(()=>{
  'use strict';
  const KEY='loliteDesktopTheme';
  const THEMES=[
    {id:'crimson',name:'Lolite Crimson',desc:'Charcoal surfaces, precise red accents and a quiet, compact desktop.',preview:'crimson'},
    {id:'windows11',name:'Windows 11 Modern',desc:'Centered-feel taskbar, crisp rounded windows and a modern blue interface.',preview:''},
    {id:'aero7',name:'Windows 7 Aero',desc:'Luminous glass edges, translucent blue taskbar and classic Start placement.',preview:'aero'},
    {id:'plasma',name:'KDE Plasma',desc:'Floating panel, violet accents and a flexible desktop workspace.',preview:'plasma'},
    {id:'gnome',name:'GNOME Minimal',desc:'Dark top bar, clean windows and a quiet distraction-free layout.',preview:'gnome'},
    {id:'deepin',name:'Deepin Elegant',desc:'Centered translucent dock, soft curves and bright polished surfaces.',preview:'deepin'}
  ];
  const VALID=new Set(THEMES.map(theme=>theme.id));
  const root=document.documentElement;
  let chosen='crimson';
  const $=selector=>document.querySelector(selector);
  const saved=()=>{
    try{const value=localStorage.getItem(KEY);return VALID.has(value)?value:'crimson'}
    catch(_){return 'crimson'}
  };
  const setTheme=(value,save=true)=>{
    if(!VALID.has(value))return false;
    chosen=value;
    root.dataset.desktopTheme=value;
    if(save){try{localStorage.setItem(KEY,value)}catch(_){}}
    window.dispatchEvent(new CustomEvent('lolite:desktopthemechange',{detail:{theme:value}}));
    return true;
  };
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
       '<div class="ldt-scene ',theme.preview,'" aria-hidden="true"><div class="ldt-window"></div><div class="ldt-dock"><i></i><i></i><i></i><i></i><i></i></div></div>',
       '<span class="ldt-name">',theme.name,'<span class="ldt-check" aria-hidden="true">',candidate===theme.id?'✓':'','</span></span>',
       '<span class="ldt-desc">',theme.desc,'</span></button>'
    ].join('')).join('');
    picker.innerHTML=[
      '<div class="ldt-wrap">',
       '<div class="ldt-header"><span class="ldt-eyebrow">LOLITE OS / DESKTOP</span><button class="ldt-back" type="button" id="ldtBack">← Back</button></div>',
       '<h1>Choose your desktop theme</h1>',
       '<p class="ldt-intro">Six desktop experiences. Same games, apps, files and settings. You can change this anytime.</p>',
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
  function ensureButton(){
    const taskbar=$('#taskbar');
    if(!taskbar||$('#loliteDesktopThemeButton'))return;
    const button=document.createElement('button');
    button.id='loliteDesktopThemeButton';
    button.className='task';
    button.type='button';
    button.title='Change Desktop Lolite theme';
    button.setAttribute('aria-label','Change Desktop Lolite theme');
    button.textContent='Themes';
    const tray=taskbar.querySelector('.tray');
    if(tray)taskbar.insertBefore(button,tray);
    else taskbar.appendChild(button);
    button.addEventListener('click',()=>open({onBack:()=>{}}));
  }
  function init(){
    // Loading a saved theme does not select Desktop Style or start any apps.
    setTheme(saved(),false);
    ensureButton();
    window.LoliteDesktopThemes={themes:THEMES.map(({id,name,desc})=>({id,name,desc})),
      open,setTheme,getTheme:()=>chosen,restore:()=>setTheme(saved(),false),close};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
