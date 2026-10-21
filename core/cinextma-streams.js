/* CINEXTMA movie/TV source chooser for Lolite. Host patterns are taken from
   https://github.com/wisnuwirayuda15/cinextma (MIT).
   Not a streaming host, ad blocker, rights verifier or downloader.
*/
(()=>{
'use strict';
const KEY='loliteCinextmaMoviesV1';
const hosts=[
['VidLink',1,1,1,'vidlink'],['VidLink 2',1,1,1,'vidlink2'],['VidKing',1,1,0,'vidking'],
['<Embed>',0,0,1,'embed'],['SuperEmbed',0,1,1,'superembed'],
['FilmKu',0,0,1,'filmku'],['NontonGo',0,0,1,'nontongo'],
['AutoEmbed 1',0,1,1,'autoembed1'],['AutoEmbed 2',0,0,1,'autoembed2'],
['2Embed',0,0,1,'twoembed'],
['VidSrc 1',0,0,1,'vidsrc1'],['VidSrc 2',0,0,1,'vidsrc2'],
['VidSrc 3',0,0,1,'vidsrc3'],['VidSrc 4',0,0,1,'vidsrc4'],
['VidSrc 5',1,1,1,'vidsrc5'],['MoviesAPI',0,0,1,'moviesapi']
];
let titles=[],viewing=null,activeHost=null,attachedRoot=null;
try{
 const value=JSON.parse(localStorage.getItem(KEY)||'[]');
 if(Array.isArray(value))titles=value.filter(m=>m&&typeof m.title==='string'&&/^[0-9]{1,12}$/.test(m.tmdb||'')&&['movie','tv'].includes(m.type)).slice(0,80);
}catch(e){console.warn('Movie source list storage error',e)}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(titles))}catch(e){console.warn(e)}};
const node=(tag,cls,text)=>{
 const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;
};
const valid=(n,max)=>/^[0-9]{1,12}$/.test(String(n))&&Number(n)>=1&&Number(n)<=max;
function url(m,key){
 const id=m.tmdb,season=m.season||1,episode=m.episode||1,tv=m.type==='tv';
 const tail=tv?'tv/'+id+'/'+season+'/'+episode:'movie/'+id;
 switch(key){
 case 'vidlink':return 'https://vidlink.pro/'+tail+'?player=jw&autoplay=false';
 case 'vidlink2':return 'https://vidlink.pro/'+tail+'?autoplay=false';
 case 'vidking':return 'https://www.vidking.net/embed/'+tail+'?color=7161d6&autoplay=false';
 case 'embed':return 'https://embed.su/embed/'+tail;
 case 'superembed':return 'https://multiembed.mov/directstream.php?video_id='+id+'&tmdb=1'+(tv?'&s='+season+'&e='+episode:'');
 case 'filmku':return tv?'https://filmku.stream/embed/series?tmdb='+id+'&sea='+season+'&epi='+episode:'https://filmku.stream/embed/'+id;
 case 'nontongo':return 'https://www.nontongo.win/embed/'+tail;
 case 'autoembed1':return tv?'https://autoembed.co/tv/tmdb/'+id+'-'+season+'-'+episode:'https://autoembed.co/movie/tmdb/'+id;
 case 'autoembed2':return 'https://player.autoembed.cc/embed/'+tail;
 case 'twoembed':return tv?'https://www.2embed.cc/embedtv/'+id+'&s='+season+'&e='+episode:'https://www.2embed.cc/embed/'+id;
 case 'vidsrc1':return 'https://vidsrc.xyz/embed/'+tail;
 case 'vidsrc2':return 'https://vidsrc.to/embed/'+tail;
 case 'vidsrc3':return 'https://vidsrc.icu/embed/'+tail;
 case 'vidsrc4':return 'https://vidsrc.cc/v2/embed/'+tail+'?autoPlay=false';
 case 'vidsrc5':return 'https://vidsrc.cc/v3/embed/'+tail+'?autoPlay=false';
 case 'moviesapi':return tv?'https://moviesapi.club/tv/'+id+'-'+season+'-'+episode:'https://moviesapi.club/movie/'+id;
 default:return null;
 }
}
const css=[
'.lmc-hosts{margin:10px 0 22px;padding:20px;border:1px solid #444968;border-radius:12px;background:linear-gradient(120deg,#1b2335,#1c2033);color:#eaf0ff}',
'.lmc-hosts h2{font-size:21px;margin:7px 0}.lmc-hosts p{font-size:12px;line-height:1.6;color:#aebbd1}',
'.lmc-kicker{font-size:10px;font-weight:800;letter-spacing:.12em;color:#bcaaff}',
'.lmc-entry{display:grid;grid-template-columns:minmax(145px,2fr) minmax(95px,.8fr) minmax(110px,.9fr) 65px 65px auto;gap:8px;margin:16px 0}',
'.lmc-entry label{display:block;color:#c3cee3;font-size:11px;margin-bottom:6px}',
'.lmc-hosts input,.lmc-hosts select{width:100%;box-sizing:border-box;min-width:0;background:#121b2a;border:1px solid #42516c;border-radius:7px;padding:9px;color:#fff;font:inherit}',
'.lmc-hosts button{border:1px solid #515d7a;color:#ecf1fb;background:#222d43;border-radius:8px;padding:9px 12px;cursor:pointer;font:inherit}',
'.lmc-hosts button:hover{background:#36445f}.lmc-hosts button.lmc-primary{background:#6655ba;border-color:#9580ea}',
'.lmc-titles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:14px}',
'.lmc-title{background:#121b2c;border:1px solid #394860;border-radius:9px;padding:12px}',
'.lmc-title strong{font-size:13px;display:block;overflow-wrap:anywhere}',
'.lmc-title small{font-size:11px;color:#9baac1;display:block;margin-top:8px}',
'.lmc-row{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}',
'.lmc-servers{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:8px;margin:15px 0}',
'.lmc-servers button{text-align:left;display:flex;flex-direction:column;gap:6px;align-items:flex-start}',
'.lmc-servers button[aria-pressed=true]{border-color:#bba2ff;background:#3a3462}',
'.lmc-servers small{color:#bec8da;font-size:10px;line-height:1.5}',
'.lmc-player{background:#000;aspect-ratio:16/9;width:100%;border:1px solid #334057;border-radius:8px;overflow:hidden}',
'.lmc-player iframe{width:100%;height:100%;border:0;display:block}',
'.lmc-player:fullscreen{width:100vw!important;height:100vh!important;border:0;border-radius:0}',
'.lmc-error{font-size:12px;color:#ffb5bc!important}',
'@media(max-width:850px){.lmc-entry{grid-template-columns:repeat(2,minmax(0,1fr))}.lmc-entry label:first-child{grid-column:1/-1}}',
'@media(max-width:520px){.lmc-entry{grid-template-columns:1fr}.lmc-entry label:first-child{grid-column:auto}}'
].join('');
const sheet=node('style');sheet.textContent=css;document.head.append(sheet);
function button(text,onClick,primary){
 const b=node('button',primary?'lmc-primary':null,text);b.type='button';b.addEventListener('click',onClick);return b;
}
function input(labelText,kind,placeholder){
 const holder=node('label');
 holder.append(node('span',null,labelText));
 const control=node('input');
 control.type=kind;control.placeholder=placeholder;holder.append(control);
 return{holder,control};
}
function findCurrent(){return titles.find(t=>t.id===viewing)}
function render(holder){
 if(!holder.isConnected)return;
 holder.replaceChildren();
 holder.append(node('div','lmc-kicker','CINEXTMA THIRD-PARTY PLAYERS'));
 holder.append(node('h2',null,'Movie & TV streaming sources'));
 holder.append(node('p',null,
  'Choose from '+hosts.length+' external hosts sourced from CINEXTMA. Streaming providers are not operated or verified by Lolite. Some may contain pop-up or in-player ads, or may not have content rights.'));
 holder.append(node('p',null,'Ad blocker required. Use only content you are permitted to watch. Lolite restricts iframe pop-ups and top-page redirects but cannot block advertising inside the player.'));
 if(viewing){renderPlayer(holder);return}
 const form=node('form','lmc-entry');
 const title=input('Title','text','Movie or show');
 title.control.required=true;title.control.maxLength=110;
 const tmdb=input('TMDB ID','text','e.g. 550');tmdb.control.required=true;tmdb.control.inputMode='numeric';
 const typeLabel=node('label');typeLabel.append(node('span',null,'Type'));
 const type=node('select');
 for(const [id,name] of [['movie','Movie'],['tv','TV show']]){const opt=node('option',null,name);opt.value=id;type.append(opt)}
 typeLabel.append(type);
 const season=input('Season','number','1');season.control.value='1';season.control.min='1';season.control.max='999';
 const episode=input('Episode','number','1');episode.control.value='1';episode.control.min='1';episode.control.max='999';
 const add=node('button','lmc-primary','Add title');add.type='submit';
 form.append(title.holder,tmdb.holder,typeLabel,season.holder,episode.holder,add);
 const error=node('p','lmc-error');error.setAttribute('role','alert');
 type.addEventListener('change',()=>{
   const on=type.value==='tv';season.holder.hidden=!on;episode.holder.hidden=!on
 });type.dispatchEvent(new Event('change'));
 form.addEventListener('submit',e=>{
   e.preventDefault();
   const id=tmdb.control.value.trim(),name=title.control.value.trim();
   const sea=season.control.value.trim(),ep=episode.control.value.trim();
   if(!name){error.textContent='Please enter a title.';return}
   if(!valid(id,999999999999)){error.textContent='Please enter a valid numeric TMDB ID.';return}
   if(type.value==='tv'&&(!valid(sea,999)||!valid(ep,999))){error.textContent='Season and episode must be 1–999.';return}
   const entry={id:'cin-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),
     title:name.slice(0,110),tmdb:id,type:type.value,
     season:type.value==='tv'?Number(sea):1,episode:type.value==='tv'?Number(ep):1};
   titles.unshift(entry);titles=titles.slice(0,80);save();viewing=entry.id;activeHost=null;render(holder);
 });
 holder.append(form,error);
 const help=node('p',null,'You can find numeric title IDs on ');
 const link=node('a',null,'The Movie Database');
 link.href='https://www.themoviedb.org/';link.target='_blank';link.rel='noopener noreferrer';link.style.color='#c1a8ff';
 help.append(link,document.createTextNode('.'));holder.append(help);
 const grid=node('div','lmc-titles');
 for(const entry of titles){
   const card=node('article','lmc-title');
   card.append(node('strong',null,entry.title));
   card.append(node('small',null,entry.type==='tv'
     ?'TV · S'+entry.season+' E'+entry.episode+' · TMDB '+entry.tmdb
     :'Movie · TMDB '+entry.tmdb));
   const row=node('div','lmc-row');
   row.append(button('Select servers',()=>{viewing=entry.id;activeHost=null;render(holder)},true));
   row.append(button('Remove',()=>{
     if(!confirm('Remove '+entry.title+' from streaming sources?'))return;
     titles=titles.filter(t=>t.id!==entry.id);save();render(holder);
   }));
   card.append(row);grid.append(card);
 }
 if(!titles.length)holder.append(node('p',null,'No titles added. Add a movie or show to choose a server.'));
 holder.append(grid);
}
function renderPlayer(holder){
 const media=findCurrent();
 if(!media){viewing=null;activeHost=null;render(holder);return}
 holder.append(button('← All titles',()=>{viewing=null;activeHost=null;render(holder)}));
 holder.append(node('h2',null,media.title+(media.type==='tv'?' · S'+media.season+' E'+media.episode:'')));
 holder.append(node('p',null,'Pick a server below. The third-party site is not loaded until you select one.'));
 const grid=node('div','lmc-servers');
 const player=node('div','lmc-player');
 const status=node('p',null,'No external server loaded.');
 for(const [name,recommended,fast,ads,key] of hosts){
   const choose=node('button');
   choose.type='button';choose.setAttribute('aria-pressed','false');
   choose.append(node('strong',null,name));
   let tags=[];
   if(recommended)tags.push('Recommended');
   if(fast)tags.push('Fast');
   tags.push(ads?'Ads reported':'Ads not flagged');
   choose.append(node('small',null,tags.join(' · ')));
   choose.addEventListener('click',()=>{
     const src=url(media,key);if(!src)return;
     player.replaceChildren();
     const iframe=node('iframe');iframe.title=media.title+' · '+name;
     iframe.src=src;
     iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
     iframe.setAttribute('allow','fullscreen; encrypted-media; autoplay; picture-in-picture');
     iframe.referrerPolicy='no-referrer';iframe.allowFullscreen=true;
     player.append(iframe);activeHost=key;
     grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===choose)));
     status.textContent=name+' loaded. In-player ads may still appear; popup and parent-navigation permissions are disabled.';
   });
   grid.append(choose);
 }
 holder.append(grid,player,status);
 const actions=node('div','lmc-row');
 actions.append(button('Fullscreen',async()=>{
   if(!player.querySelector('iframe')){status.textContent='Choose a server first.';return}
   try{if(document.fullscreenElement===player)await document.exitFullscreen();else await player.requestFullscreen()}
   catch(e){status.textContent='Fullscreen is unavailable in this browser.'}
 },true));
 actions.append(button('Stop playback',()=>{
   player.replaceChildren();activeHost=null;
   grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
   status.textContent='External iframe unloaded.';
 }));
 holder.append(actions);
 holder.append(node('p',null,'Third-party hosts control their own ads, content and availability. Confirmation of an ad blocker is not a technical check.'));
}
function inject(){
 const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
 if(!root||!root.querySelector('#lmCatalog'))return; // entry acknowledgment not yet passed
 const pane=root.querySelector('.lms-view');
 if(!pane||pane.hidden||pane.querySelector('#lmcSourcePanel')||pane.querySelector('.lms-player'))return;
 if(root!==attachedRoot){
   attachedRoot=root;
   root.addEventListener('click',e=>{
     if(e.target.closest('[data-lm="browse"]')){
       root.querySelector('#lmcSourcePanel .lmc-player')?.replaceChildren();
       viewing=null;activeHost=null;
     }
   },true);
 }
 const panel=node('section','lmc-hosts');panel.id='lmcSourcePanel';
 const before=pane.querySelector('.lms-panel');
 if(before)pane.insertBefore(panel,before);else pane.append(panel);
 if(!viewing)activeHost=null;render(panel);
}
let scheduled=false;
const watcher=new MutationObserver(()=>{
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;inject()});
});
watcher.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});
else inject();
function openCatalogItem(item){
 if(!item||typeof item.title!=='string'||!['movie','tv'].includes(item.type)||!valid(item.tmdb,999999999999))return false;
 const name=item.title.trim().slice(0,110);
 if(!name)return false;
 let entry=titles.find(t=>t.tmdb===String(item.tmdb)&&t.type===item.type);
 if(!entry){
   entry={id:'cin-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),
     title:name,tmdb:String(item.tmdb),type:item.type,season:1,episode:1};
   titles.unshift(entry);titles=titles.slice(0,80);save();
 }
 viewing=entry.id;activeHost=null;
 const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
 if(!root)return false;
 const go=()=>{
   const open=root.querySelector('.lms-open');
   if(!open)return false;
   open.click();
   const pane=root.querySelector('#lmcSourcePanel');
   if(pane)render(pane);
   return true;
 };
 if(!go()){
   let attempts=0;
   const retry=()=>{if(go()||++attempts>22)return;requestAnimationFrame(retry)};
   requestAnimationFrame(retry);
 }
 return true;
}
window.LoliteCinextma=Object.freeze({providerNames:()=>hosts.map(h=>h[0]),count:hosts.length,openCatalogItem});
})();