/* Sandstone keeps its original renderer and gains a direct browsing mode. */
(()=>{
 'use strict';
 const initialized=new WeakSet();
 let queued=false;
 const css=[
  'html,body{height:100%!important;min-height:0!important}',
  'body{width:100%!important;min-width:0!important}',
  '#address_bar{flex:0 0 auto;min-height:34px!important;height:auto!important;align-items:stretch;gap:4px;padding:5px!important;background:#141d2a;color:#e8eef9}',
  '#address_bar input{min-width:0;max-width:100%;background:#0d1725;color:#f0f4ff;border:1px solid #52617a;border-radius:5px;padding:3px 8px}',
  '#loliteSandstoneAddress{flex:1}',
  '#address_bar [hidden],#frame_container[hidden],#options_div[hidden],#loliteSandstoneStatus [hidden]{display:none!important}',
  '#address_bar button{flex:0 0 auto;cursor:pointer;color:#f0f4ff;background:#273752;border:1px solid #566a88;border-radius:5px;padding:4px 10px}',
  '#address_bar button:hover{background:#3b5071}',
  '#favicon_container{flex:0 0 26px;min-width:26px;background:#263247;color:#e4edfb}',
  '#frame_container{flex:1 1 auto!important;min-height:0!important;min-width:0!important;position:relative;overflow:hidden}',
  '#frame_container>iframe{display:block;min-height:0!important;width:100%!important;height:100%!important}',
  '#options_div{max-width:calc(100% - 24px);max-height:calc(100% - 36px);overflow:auto;z-index:10!important;border:1px solid #53647f;border-radius:12px;background:#18263a!important;color:#eff5ff;box-shadow:0 15px 50px #0008}',
  '#options_div input,#options_div textarea{min-width:0;background:#101b2a;color:#eff5ff;border:1px solid #53647f;border-radius:6px;padding:5px}',
  '#options_div button{background:#334762;border:1px solid #627b9e;color:#fff;border-radius:6px;padding:5px 9px;cursor:pointer}',
  '#loliteSandstoneStatus{display:flex;align-items:center;gap:9px;flex:0 0 auto;min-height:28px;max-width:100%;padding:5px 10px;background:#182437;border-bottom:1px solid #34465e;color:#aebfda;font:11px/1.45 system-ui,sans-serif}',
  '#loliteSandstoneStatus[data-error="true"]{color:#ffd5bd;background:#3c2931}',
  '#loliteSandstoneStatus span{flex:1;min-width:0}',
  '#loliteSandstoneStatus button{padding:3px 8px;cursor:pointer;background:#334862;color:#fff;border:1px solid #6a7d9b;border-radius:5px}',
  '.lolite-sandstone-direct{box-sizing:border-box;flex:1 1 auto;height:auto!important;padding:8px 10px 10px;background:#141d2a}',
  '@media(max-width:470px){#address_bar{gap:2px;padding:4px!important}#address_bar button{padding:4px 6px;font-size:11px}#loliteSandstoneStatus{flex-wrap:wrap;padding:5px 7px}}',
  '@media(prefers-reduced-motion:reduce){*{transition:none!important}}'
 ].join('');
 function addDirectMode(doc, address, bar){
  const browser=window.LoliteBrowserNavigation;
  const originalStage=doc.getElementById('frame_container');
  const originalInput=doc.getElementById('url_box');
  const originalGo=doc.getElementById('navigate_button');
  const options=doc.getElementById('options_button');
  const overlay=doc.getElementById('options_div');
  if(!browser||!originalStage||!originalInput||!originalGo||!options||!overlay)return;
  const stylesheet=doc.createElement('link');
  stylesheet.rel='stylesheet';
  stylesheet.href=new URL('core/browser-navigation.css?v=browsers-20261124',document.baseURI).href;
  doc.head.append(stylesheet);

  const input=doc.createElement('input');
  input.id='loliteSandstoneAddress';
  input.type='text';
  input.setAttribute('aria-label','Website address');
  input.placeholder='Enter a website or search the web';
  input.autocomplete='off';
  input.spellcheck=false;
  const go=doc.createElement('button');
  go.type='button';
  go.textContent='Go';
  address.append(input,go);

  const direct=doc.createElement('section');
  direct.className='lolite-web-browser lolite-sandstone-direct';
  direct.dataset.webName='Sandstone Browser';
  direct.append(doc.createRange().createContextualFragment(browser.controls()+browser.stage()));
  originalStage.before(direct);

  const toggle=doc.createElement('button');
  toggle.type='button';
  bar.append(toggle);
  const controller=browser.mount(direct,input);
  const navigate=()=>controller.go(input.value);
  input.addEventListener('keydown',event=>{
   if(event.key==='Enter'&&!event.isComposing){event.preventDefault();navigate()}
  });
  go.addEventListener('click',navigate);

  let original=false;
  function show(next){
   original=next;
   originalStage.hidden=originalInput.hidden=originalGo.hidden=options.hidden=!original;
   overlay.hidden=!original;
   direct.hidden=input.hidden=go.hidden=original;
   bar.querySelector('#loliteSandstoneStatusText').hidden=!original;
   bar.querySelector('[data-sandstone-reload]').hidden=!original;
   toggle.textContent=original?'Direct mode':'Original mode';
   toggle.setAttribute('aria-pressed',String(original));
  }
  toggle.addEventListener('click',()=>{
   if(browser.isAllowed())show(!original);
  });
  show(false);
 }
 function mount(frame){
  if(initialized.has(frame))return;
  initialized.add(frame);
  const content=frame.closest?.('.content');
  if(content){
   content.style.setProperty('padding','0','important');
   content.style.setProperty('overflow','hidden','important');
   content.style.setProperty('min-height','0','important');
   frame.style.setProperty('width','100%','important');
   frame.style.setProperty('height','100%','important');
   frame.style.setProperty('margin','0','important');
   frame.style.setProperty('min-height','0','important');
  }
  function initialise(){
   let doc,win;
   try{doc=frame.contentDocument;win=frame.contentWindow}catch{return}
   if(!doc?.body||!doc.head)return;
   if(!doc.getElementById('loliteSandstoneCompatStyle')){
    const style=doc.createElement('style');
    style.id='loliteSandstoneCompatStyle';style.textContent=css;
    doc.head.appendChild(style);
   }
   const address=doc.getElementById('address_bar');
   if(!address||doc.getElementById('loliteSandstoneStatus'))return;
   let bar=doc.getElementById('loliteSandstoneStatus');
   if(!bar){
    bar=doc.createElement('div');bar.id='loliteSandstoneStatus';
    bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');
    const message=doc.createElement('span');message.id='loliteSandstoneStatusText';
    const reload=doc.createElement('button');reload.type='button';reload.textContent='Reload Sandstone';
    reload.dataset.sandstoneReload='1';
    reload.addEventListener('click',()=>{try{win.location.reload()}catch{}});
    bar.append(message,reload);
    address.insertAdjacentElement('afterend',bar);
   }
   const message=bar.querySelector('#loliteSandstoneStatusText');
   if(!message)return;
   addDirectMode(doc,address,bar);
   const check=()=>{
    const ready=!!win.main_frame?.iframe&&!!doc.querySelector('#frame_container iframe');
    bar.dataset.error=String(!ready);
    message.textContent=ready
     ?'Original Sandstone renderer loaded. Remote pages require an authorised Wisp service; this Lolite host does not supply one.'
     :'Sandstone renderer failed to initialise. Reload to retry; remote-page proxy transport is unavailable here.';
   };
   check();
   win.setTimeout?.(check,1500);
  }
  frame.addEventListener('load',initialise);
  if(frame.contentDocument?.readyState==='complete')initialise();
 }
 function scan(){document.querySelectorAll('iframe[data-sandstone-original="true"]').forEach(mount)}
 function schedule(){if(queued)return;queued=true;Promise.resolve().then(()=>{queued=false;scan()})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
 else scan();
 const root=document.getElementById('windows')||document.body;
 if(root&&typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
 function clearFrames(){
  document.querySelectorAll('iframe[data-sandstone-original="true"]').forEach(frame=>{frame.src='about:blank'});
 }
 window.addEventListener?.('lolite:account-restricted',clearFrames);
 window.addEventListener?.('lolite:browser-signout',clearFrames);
 // The installed desktop blocks subframes on the privileged Lolite app origin.
 if(window.loliteDesktop)window.LoliteBrowserNavigation.register(['sandstone'],'Sandstone Browser');
 window.LoliteSandstoneCompat=Object.freeze({scan});
})();
