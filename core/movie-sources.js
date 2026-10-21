/* Lolite Movies: authorized third-party video links with protected embedding.
   Inspired by Cinextma's source picker, but without its unverified streaming hosts.
   Embedded sites may display their own ads; this file does not claim to filter them.
*/
(()=>{
  'use strict';
  const STORAGE_KEY='loliteMoviesTrustedSourcesV1';
  const validId=/^[a-zA-Z0-9_-]{11}$/;
  const validArchive=/^[a-zA-Z0-9._-]{1,120}$/;
  let sources=[];
  let active=null;
  let currentRoot=null;
  let videoObject=null;
  let search='';
  let typeFilter='all';
  try {
    const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    // Stored URLs must be validated again, not merely trusted because they came
    // from localStorage. Never load arbitrary iframe hosts or executable URLs.
    if(Array.isArray(stored))sources=stored.slice(0,250).flatMap(s=>{
      if(!s||typeof s.url!=='string'||typeof s.title!=='string')return [];
      const valid=classify(s.url);
      if(!valid)return [];
      const id=typeof s.id==='string'&&/^source-[a-z0-9-]{1,70}$/i.test(s.id)?s.id:'source-'+Math.random().toString(36).slice(2,12);
      return [{id,title:s.title.slice(0,110),type:s.type==='tv'?'tv':'movie',kind:valid.kind,provider:valid.provider,url:valid.url}];
    });
  }catch(error){console.warn('Movies sources storage unavailable',error)}
  const save=()=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sources))}
    catch(error){console.warn('Unable to save Movies sources',error)}
  };
  const tell=message=>{if(typeof window.toast==='function')window.toast(message);else console.info(message)};
  function classify(raw){
    let url;
    try{url=new URL(String(raw).trim())}catch{return null}
    if(url.protocol!=='https:'||url.username||url.password)return null;
    const host=url.hostname.toLowerCase(),path=url.pathname;
    if(host==='youtu.be'||host==='www.youtu.be'){
      const id=path.split('/')[1];
      if(!validId.test(id||''))return null;
      return {kind:'iframe',provider:'YouTube',url:'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1'};
    }
    if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com','youtube-nocookie.com'].includes(host)){
      const parts=path.split('/').filter(Boolean);
      let id=path==='/watch'?url.searchParams.get('v'):((parts[0]==='shorts'||parts[0]==='embed'||parts[0]==='live')?parts[1]:null);
      if(!validId.test(id||''))return null;
      return {kind:'iframe',provider:'YouTube',url:'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1'};
    }
    if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(host)){
      const match=path.match(/(?:^|\/)(?:video\/)?(\d{5,14})(?:\/|$)/);
      if(!match)return null;
      return {kind:'iframe',provider:'Vimeo',url:'https://player.vimeo.com/video/'+match[1]+'?dnt=1'};
    }
    if(host==='archive.org'||host==='www.archive.org'){
      const match=path.match(/^\/(?:details|embed)\/([^/?#]+)/);
      const id=match?.[1]||'';
      if(!validArchive.test(id))return null;
      return {kind:'iframe',provider:'Internet Archive',url:'https://archive.org/embed/'+encodeURIComponent(id)};
    }
    if(/\.(?:mp4|m4v|webm|ogv|ogg|mov|m3u8)$/i.test(path)){
      if(host==='localhost'||host.endsWith('.local')||host==='127.0.0.1'||host==='[::1]')return null;
      return {kind:'video',provider:'Direct video',url:url.href};
    }
    return null;
  }
  function el(tag,className,textContent){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(textContent!==undefined)node.textContent=textContent;
    return node;
  }
  const css=[
    '.lm-movies .lms-open{border-color:#8d7ce0;background:#2d294c}',
    '.lms-view{flex:1;min-height:0;overflow:auto;background:#0d1018;color:#f2f5ff;padding:22px}',
    '.lms-view[hidden]{display:none!important}',
    '.lms-view input,.lms-view select{border:1px solid #3c4860;border-radius:7px;background:#111927;color:#f6f8ff;padding:11px;min-width:0;font:inherit}',
    '.lms-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}',
    '.lms-head h2{font-size:23px;line-height:1.3;margin:0}',
    '.lms-muted{color:#a6b3c7;font-size:12px;line-height:1.65}',
    '.lms-panel{padding:18px;border:1px solid #30394c;background:#141c2b;border-radius:11px;margin-bottom:18px}',
    '.lms-field-row{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(110px,.55fr) auto;gap:8px;margin-top:13px}',
    '.lms-field-row input,.lms-field-row select{width:100%;box-sizing:border-box}',
    '.lms-view button{font:inherit;border-radius:7px;color:white;border:1px solid #44516a;background:#212c3e;padding:10px 13px;cursor:pointer}',
    '.lms-view button:hover{background:#34415a}',
    '.lms-view button.lms-primary{background:#6754c0;border-color:#8874df}',
    '.lms-source-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px}',
    '.lms-card{border:1px solid #333f52;background:#171f30;border-radius:10px;padding:16px;min-width:0}',
    '.lms-provider{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#ad9bf7;font-weight:700}',
    '.lms-card h3{font-size:15px;margin:12px 0 9px;overflow-wrap:anywhere}',
    '.lms-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
    '.lms-search{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}',
    '.lms-search input{flex:1;min-width:180px}',
    '.lms-player{aspect-ratio:16/9;background:#000;position:relative;border-radius:10px;overflow:hidden;margin-top:15px}',
    '.lms-player iframe,.lms-player video{width:100%;height:100%;border:0;background:#000;display:block}',
    '.lms-player:fullscreen,.lms-player:-webkit-full-screen{width:100vw!important;height:100vh!important;max-width:none!important;border-radius:0!important}',
    '.lms-player:fullscreen iframe,.lms-player:fullscreen video{width:100%;height:100%}',
    '.lms-frame-note{color:#b5c0d1;font-size:12px;line-height:1.6;padding:12px 0}',
    '.lms-form-error{color:#ffb6bc;margin-top:8px;font-size:12px}',
    '@media(max-width:730px){.lms-view{padding:12px}.lms-field-row{grid-template-columns:minmax(0,1fr)}.lms-field-row button{width:100%}}'
  ].join('');
  const sheet=el('style');sheet.textContent=css;document.head.append(sheet);
  function createView(root){
    if(root.querySelector('.lms-view'))return;
    currentRoot=root;
    const menu=root.querySelector('.lm-top .lm-actions');
    if(!menu)return;
    const open=el('button','lms-open','Streaming sources');
    open.type='button';
    open.addEventListener('click',()=>showSources(root));
    menu.prepend(open);
    const pane=el('section','lms-view');pane.hidden=true;pane.setAttribute('aria-label','Third-party video sources');
    const catalog=root.querySelector('#lmCatalog');
    if(catalog)catalog.insertAdjacentElement('afterend',pane);
    root.addEventListener('click',event=>{
      if(!pane.hidden&&event.target.closest('[data-lm="browse"]'))hideSources(root);
    },true);
    draw(root);
  }
  function clearPlayer(){
    if(!currentRoot)return;
    const pane=currentRoot.querySelector('.lms-view');
    const frame=pane?.querySelector('.lms-player');
    if(frame)frame.replaceChildren();
    videoObject=null;
    active=null;
  }
  function showSources(root){
    const video=root.querySelector('#lmVideo');
    if(video)video.pause();
    root.querySelector('#lmCatalog').style.display='none';
    root.querySelector('#lmPlayerPage').classList.remove('active');
    const pane=root.querySelector('.lms-view');
    pane.hidden=false;
    draw(root);
  }
  function hideSources(root){
    clearPlayer();
    root.querySelector('.lms-view').hidden=true;
    root.querySelector('#lmCatalog').style.display='';
    draw(root);
  }
  function formError(node,msg){node.textContent=msg;}
  function draw(root){
    if(!root)return;
    const pane=root.querySelector('.lms-view');if(!pane||pane.hidden)return;
    pane.replaceChildren();
    const head=el('div','lms-head');
    head.append(el('h2',null,active?'Watch from a third-party source':'Streaming sources'));
    const back=el('button',null,active?'← All sources':'← My Library');
    back.type='button';
    back.addEventListener('click',()=>{if(active){clearPlayer();draw(root)}else{hideSources(root)}});
    head.append(back);pane.append(head);
    if(active){playerPage(pane,root);return}
    const description=el('p','lms-muted','Add authorized video sources from YouTube, Vimeo, Internet Archive or a direct HTTPS video URL. Sources open inside Lolite without permission to spawn pop-up windows or navigate the parent tab. In-player ads may still appear.');
    pane.append(description);
    const form=el('form','lms-panel');
    const label=el('strong',null,'Add a streaming link');
    const row=el('div','lms-field-row');
    const url=el('input');url.type='url';url.required=true;url.placeholder='Paste an authorized video link (https://...)';url.setAttribute('aria-label','Video URL');
    const title=el('input');title.placeholder='Title (optional)';title.maxLength=110;title.setAttribute('aria-label','Title');
    const type=el('select');type.setAttribute('aria-label','Video type');
    for(const [value,text]of [['movie','Movie'],['tv','TV episode']]){
      const option=el('option',null,text);option.value=value;type.append(option);
    }
    const submit=el('button','lms-primary','Add link');submit.type='submit';
    row.append(url,title,type,submit);
    const message=el('div','lms-form-error');message.setAttribute('role','alert');
    form.append(label,row,message);
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const parsed=classify(url.value);
      if(!parsed){formError(message,'Supported links: YouTube, Vimeo, Internet Archive or an HTTPS MP4/WebM/OGV/MOV/M3U8 file.');return}
      const name=title.value.trim()||parsed.provider+' video';
      const id='source-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
      sources.unshift({id,title:name.slice(0,110),type:type.value,provider:parsed.provider,url:parsed.url,kind:parsed.kind});
      sources=sources.slice(0,250);save();
      search='';draw(root);tell('Streaming link saved to Lolite Movies.');
    });
    pane.append(form);
    const searchRow=el('div','lms-search');
    const searchField=el('input');searchField.type='search';searchField.placeholder='Search saved sources…';searchField.value=search;
    searchField.setAttribute('aria-label','Search saved sources');
    const kind=el('select');kind.setAttribute('aria-label','Filter saved sources');
    for(const [value,text] of [['all','All'],['movie','Movies'],['tv','TV shows']]){
      const opt=el('option',null,text);opt.value=value;opt.selected=typeFilter===value;kind.append(opt);
    }
    searchField.addEventListener('input',()=>{search=searchField.value;drawCards(pane)});
    kind.addEventListener('change',()=>{typeFilter=kind.value;drawCards(pane)});
    searchRow.append(searchField,kind);pane.append(searchRow);
    const grid=el('div','lms-source-grid');grid.id='lmsGrid';pane.append(grid);drawCards(pane);
  }
  function drawCards(pane){
    const grid=pane.querySelector('#lmsGrid');if(!grid)return;
    grid.replaceChildren();
    const filtered=sources.filter(source=>(typeFilter==='all'||source.type===typeFilter)&&source.title.toLowerCase().includes(search.toLowerCase()));
    if(!filtered.length){grid.append(el('p','lms-muted','No streaming sources saved. Paste an authorized video link above to add one.'));return}
    for(const entry of filtered){
      const card=el('article','lms-card');
      card.append(el('div','lms-provider',entry.provider),el('h3',null,entry.title));
      card.append(el('p','lms-muted',entry.type==='tv'?'TV episode':'Movie'));
      const actions=el('div','lms-actions');
      const play=el('button','lms-primary','Play');
      play.addEventListener('click',()=>{active=entry.id;draw(currentRoot)});
      const remove=el('button',null,'Remove');
      remove.addEventListener('click',()=>{if(!confirm('Remove "'+entry.title+'" from saved streaming sources?'))return;sources=sources.filter(s=>s.id!==entry.id);save();draw(currentRoot)});
      actions.append(play,remove);card.append(actions);grid.append(card);
    }
  }
  function playerPage(pane,root){
    const entry=sources.find(s=>s.id===active);
    if(!entry){active=null;draw(root);return}
    pane.append(el('div','lms-provider',entry.provider));
    pane.append(el('h2',null,entry.title));
    const sameTitle=sources.filter(s=>s.title.toLowerCase()===entry.title.toLowerCase());
    if(sameTitle.length>1){
      const selector=el('select');selector.setAttribute('aria-label','Select streaming source');
      for(const s of sameTitle){const option=el('option',null,s.provider);option.value=s.id;option.selected=s.id===active;selector.append(option)}
      selector.addEventListener('change',()=>{active=selector.value;draw(root)});
      pane.append(selector);
    }
    const frame=el('div','lms-player');
    if(entry.kind==='iframe'){
      // Deny popups and top-navigation from third-party documents. Scripts are
      // permitted so legitimate video playback works. Do not load arbitrary hosts.
      const iframe=el('iframe');iframe.title=entry.title;
      iframe.src=entry.url;
      iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
      iframe.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');
      iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      iframe.allowFullscreen=true;
      iframe.loading='eager';
      frame.append(iframe);
    } else {
      const video=el('video');video.controls=true;video.playsInline=true;video.preload='metadata';
      video.src=entry.url;videoObject=video;
      frame.append(video);
    }
    pane.append(frame);
    const actions=el('div','lms-actions');
    const fullscreen=el('button','lms-primary','Fullscreen');
    fullscreen.addEventListener('click',async()=>{
      try{
        if(document.fullscreenElement===frame)await document.exitFullscreen();
        else await frame.requestFullscreen();
      }catch(error){tell('Fullscreen was blocked by the browser.')}
    });
    const switchBack=el('button',null,'Change source');switchBack.addEventListener('click',()=>{clearPlayer();draw(root)});
    actions.append(fullscreen,switchBack);pane.append(actions);
    pane.append(el('p','lms-frame-note','Popup and top-window navigation permissions are disabled. Third-party in-player ads cannot be removed from a different website by Lolite; providers may refuse playback when embedded. For personal or appropriately licensed content only.'));
  }
  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
      if(root&&root!==currentRoot){active=null;currentRoot=root;createView(root)}
    });
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
      if(root)createView(root);
    },{once:true});
  } else {
    const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
    if(root)createView(root);
  }
  window.LoliteMovieSources=Object.freeze({supported:()=>['YouTube','Vimeo','Internet Archive','Direct HTTPS video']});
})();