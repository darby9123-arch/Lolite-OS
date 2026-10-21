/* Lolite Movies starter catalogue. These are title metadata and TMDB IDs, not movie files.
   A listed title does not guarantee availability from any external player. */
(()=>{
'use strict';
const data=[
['Interstellar',157336,2014,'movie','Sci-Fi'],['Inception',27205,2010,'movie','Sci-Fi'],
['The Dark Knight',155,2008,'movie','Action'],['The Matrix',603,1999,'movie','Sci-Fi'],
['Avatar',19995,2009,'movie','Sci-Fi'],['Avatar: The Way of Water',76600,2022,'movie','Sci-Fi'],
['Titanic',597,1997,'movie','Drama'],['Jurassic Park',329,1993,'movie','Adventure'],
['Jurassic World',135397,2015,'movie','Adventure'],['Back to the Future',105,1985,'movie','Sci-Fi'],
['E.T. the Extra-Terrestrial',601,1982,'movie','Family'],['Star Wars',11,1977,'movie','Sci-Fi'],
['The Empire Strikes Back',1891,1980,'movie','Sci-Fi'],['Return of the Jedi',1892,1983,'movie','Sci-Fi'],
['Star Wars: The Phantom Menace',1893,1999,'movie','Sci-Fi'],
['Star Wars: Revenge of the Sith',1895,2005,'movie','Sci-Fi'],
['Star Wars: The Force Awakens',140607,2015,'movie','Sci-Fi'],
['Rogue One',330459,2016,'movie','Sci-Fi'],['The Batman',414906,2022,'movie','Action'],
['Batman Begins',272,2005,'movie','Action'],['Barbie',346698,2023,'movie','Comedy'],
['Dune',438631,2021,'movie','Sci-Fi'],['Dune: Part Two',693134,2024,'movie','Sci-Fi'],
['Spider-Man: No Way Home',634649,2021,'movie','Action'],
['Spider-Man: Into the Spider-Verse',324857,2018,'movie','Animation'],
['Spider-Man: Across the Spider-Verse',569094,2023,'movie','Animation'],
['Spider-Man',557,2002,'movie','Action'],['Spider-Man 2',558,2004,'movie','Action'],
['The Avengers',24428,2012,'movie','Action'],['Avengers: Infinity War',299536,2018,'movie','Action'],
['Avengers: Endgame',299534,2019,'movie','Action'],
['Guardians of the Galaxy',118340,2014,'movie','Action'],['Iron Man',1726,2008,'movie','Action'],
['Black Panther',284054,2018,'movie','Action'],['Doctor Strange',284052,2016,'movie','Action'],
['Shrek',808,2001,'movie','Animation'],['Shrek 2',809,2004,'movie','Animation'],
['Toy Story',862,1995,'movie','Animation'],['Toy Story 2',863,1999,'movie','Animation'],
['Toy Story 3',10193,2010,'movie','Animation'],['Toy Story 4',301528,2019,'movie','Animation'],
['Cars',920,2006,'movie','Animation'],['Cars 2',49013,2011,'movie','Animation'],
['Cars 3',260514,2017,'movie','Animation'],['Finding Nemo',12,2003,'movie','Animation'],
['Finding Dory',127380,2016,'movie','Animation'],['The Incredibles',9806,2004,'movie','Animation'],
['Incredibles 2',260513,2018,'movie','Animation'],['Ratatouille',2062,2007,'movie','Animation'],
['WALL-E',10681,2008,'movie','Animation'],['Up',14160,2009,'movie','Animation'],
['Inside Out',150540,2015,'movie','Animation'],['Inside Out 2',1022789,2024,'movie','Animation'],
['Coco',354912,2017,'movie','Animation'],['Moana',277834,2016,'movie','Animation'],
['Encanto',568124,2021,'movie','Animation'],['Frozen',109445,2013,'movie','Animation'],
['Frozen II',330457,2019,'movie','Animation'],['The Lion King',8587,1994,'movie','Animation'],
['Aladdin',812,1992,'movie','Animation'],['Beauty and the Beast',10020,1991,'movie','Animation'],
['Mulan',10674,1998,'movie','Animation'],['Zootopia',269149,2016,'movie','Animation'],
['Luca',508943,2021,'movie','Animation'],['Turning Red',508947,2022,'movie','Animation'],
['Elemental',976573,2023,'movie','Animation'],
['The Super Mario Bros. Movie',502356,2023,'movie','Animation'],
['Sonic the Hedgehog',454626,2020,'movie','Family'],
['Sonic the Hedgehog 2',675353,2022,'movie','Family'],
['Sonic the Hedgehog 3',939243,2024,'movie','Family'],
['Kung Fu Panda',9502,2008,'movie','Animation'],
['Kung Fu Panda 2',49444,2011,'movie','Animation'],
['Kung Fu Panda 3',140300,2016,'movie','Animation'],
['Kung Fu Panda 4',1011985,2024,'movie','Animation'],
['How to Train Your Dragon',10191,2010,'movie','Animation'],
['How to Train Your Dragon 2',82702,2014,'movie','Animation'],
['How to Train Your Dragon: The Hidden World',166428,2019,'movie','Animation'],
['Despicable Me',20352,2010,'movie','Animation'],
['Despicable Me 2',93456,2013,'movie','Animation'],['Minions',211672,2015,'movie','Animation'],
['The LEGO Movie',137106,2014,'movie','Animation'],
['The LEGO Batman Movie',324849,2017,'movie','Animation'],
['Puss in Boots: The Last Wish',315162,2022,'movie','Animation'],
['Paddington',116149,2014,'movie','Family'],['Paddington 2',346648,2017,'movie','Family'],
['Wonka',787699,2023,'movie','Family'],['Matilda',10830,1996,'movie','Family'],
['Charlie and the Chocolate Factory',118,2005,'movie','Family'],
['Harry Potter and the Philosopher’s Stone',671,2001,'movie','Fantasy'],
['Harry Potter and the Chamber of Secrets',672,2002,'movie','Fantasy'],
['Harry Potter and the Prisoner of Azkaban',673,2004,'movie','Fantasy'],
['Harry Potter and the Goblet of Fire',674,2005,'movie','Fantasy'],
['Harry Potter and the Order of the Phoenix',675,2007,'movie','Fantasy'],
['Harry Potter and the Half-Blood Prince',767,2009,'movie','Fantasy'],
['Harry Potter and the Deathly Hallows: Part 1',12444,2010,'movie','Fantasy'],
['Harry Potter and the Deathly Hallows: Part 2',12445,2011,'movie','Fantasy'],
['The Lord of the Rings: The Fellowship of the Ring',120,2001,'movie','Fantasy'],
['The Lord of the Rings: The Two Towers',121,2002,'movie','Fantasy'],
['The Lord of the Rings: The Return of the King',122,2003,'movie','Fantasy'],
['The Hobbit: An Unexpected Journey',49051,2012,'movie','Fantasy'],
['The Hobbit: The Desolation of Smaug',57158,2013,'movie','Fantasy'],
['The Hobbit: The Battle of the Five Armies',122917,2014,'movie','Fantasy'],
['Stranger Things',66732,2016,'tv','Sci-Fi'],['The Mandalorian',82856,2019,'tv','Sci-Fi'],
['The Simpsons',456,1989,'tv','Animation'],['Family Guy',1434,1999,'tv','Animation'],
['SpongeBob SquarePants',387,1999,'tv','Animation'],
['Avatar: The Last Airbender',246,2005,'tv','Animation'],['Bluey',82728,2018,'tv','Animation'],
['Gravity Falls',40075,2012,'tv','Animation'],['Adventure Time',15260,2010,'tv','Animation'],
['Regular Show',31132,2010,'tv','Animation'],['The Owl House',92685,2020,'tv','Animation'],
['Amphibia',85349,2019,'tv','Animation'],['Phineas and Ferb',1877,2007,'tv','Animation'],
['Pokémon',60572,1997,'tv','Animation'],['One Piece',37854,1999,'tv','Animation'],
['Naruto',46260,2002,'tv','Animation'],['The Last of Us',100088,2023,'tv','Sci-Fi'],
['Loki',84958,2021,'tv','Sci-Fi'],['WandaVision',85271,2021,'tv','Sci-Fi'],
['Moon Knight',92749,2022,'tv','Sci-Fi'],['Andor',83867,2022,'tv','Sci-Fi'],
['Obi-Wan Kenobi',92830,2022,'tv','Sci-Fi'],['Ahsoka',114461,2023,'tv','Sci-Fi'],
['Wednesday',119051,2022,'tv','Fantasy'],['The Umbrella Academy',75006,2019,'tv','Fantasy'],
['The Office',2316,2005,'tv','Comedy'],['Friends',1668,1994,'tv','Comedy'],
['The Big Bang Theory',1418,2007,'tv','Comedy'],
['Brooklyn Nine-Nine',48891,2013,'tv','Comedy'],['Modern Family',1421,2009,'tv','Comedy'],
['The Good Place',66573,2016,'tv','Comedy']
].map(([title,tmdb,year,type,genre])=>({title,tmdb:String(tmdb),year,type,genre}));
const favKey='loliteMoviesCatalogFavouritesV1';
let favourites=[];
try{favourites=JSON.parse(localStorage.getItem(favKey)||'[]')}catch(e){}
const fav=new Set(Array.isArray(favourites)?favourites:[]);
const saveFav=()=>{try{localStorage.setItem(favKey,JSON.stringify([...fav]))}catch(e){}};
const state={search:'',category:'All'};
const styles=[
'.lmcatalog{margin:0 0 25px;background:linear-gradient(120deg,#101a2a,#171629);border:1px solid #3b4363;border-radius:13px;padding:20px;color:#f4f7ff}',
'.lmcatalog *{box-sizing:border-box}.lmcatalog h2{font-size:23px;margin:7px 0 5px}',
'.lmcatalog-kicker{font-size:11px;color:#b0a0ff;font-weight:800;letter-spacing:.1em}',
'.lmcatalog-desc{font-size:12px;color:#abbad2;line-height:1.6;margin-bottom:14px}',
'.lmcatalog-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}',
'.lmcatalog-controls input{min-width:180px;flex:1;background:#101a2c;color:#fff;border:1px solid #42516d;border-radius:8px;padding:12px;font:inherit}',
'.lmcatalog-count{font-size:11px;color:#c1c9d8}',
'.lmcatalog-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}',
'.lmcatalog-tabs button{background:#232b40;color:#edf0ff;border:1px solid #43516b;border-radius:7px;padding:8px 11px;cursor:pointer;font-size:11px}',
'.lmcatalog-tabs button[aria-pressed=true]{background:#6556b2;border-color:#a799ee}',
'.lmcatalog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(157px,1fr));gap:12px}',
'.lmcatalog-card{display:flex;flex-direction:column;background:#1a2336;border:1px solid #394560;border-radius:10px;overflow:hidden}',
'.lmcatalog-art{display:flex;flex-direction:column;justify-content:space-between;padding:12px;aspect-ratio:5/6;min-height:174px;background:radial-gradient(circle at 90% 10%,#ffffff35,transparent 45%),linear-gradient(150deg,var(--poster-a),var(--poster-b));color:#fff}',
'.lmcatalog-pill{width:max-content;font-size:10px;letter-spacing:.05em;padding:5px 7px;background:#090e1eab;border-radius:5px}',
'.lmcatalog-art-title{font-size:17px;font-weight:850;line-height:1.2;overflow-wrap:anywhere;text-shadow:0 3px 10px #0008}',
'.lmcatalog-details{flex:1;display:flex;flex-direction:column;gap:7px;padding:11px}',
'.lmcatalog-title{font-size:12px;font-weight:750;line-height:1.35;min-height:32px}',
'.lmcatalog-meta{color:#a7b7d1;font-size:11px}',
'.lmcatalog-actions{display:flex;gap:6px;margin-top:auto;padding-top:6px}',
'.lmcatalog-actions button{padding:9px 6px;border:1px solid #6c6d91;border-radius:6px;color:white;font-size:11px;cursor:pointer}',
'.lmcatalog-play{flex:1;background:#6759b5}.lmcatalog-fav{flex:0 0 33px;background:#303750}',
'.lmcatalog-empty{padding:24px;border:1px dashed #4d5774;color:#aebbd3;border-radius:9px}',
'@media(max-width:540px){.lmcatalog{padding:11px}.lmcatalog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.lmcatalog-art{min-height:145px;padding:9px}.lmcatalog-art-title{font-size:14px}}'
].join('');
const style=document.createElement('style');style.textContent=styles;document.head.append(style);
const el=(tag,cls,value)=>{
 const e=document.createElement(tag);if(cls)e.className=cls;
 if(value!==undefined)e.textContent=value;
 return e;
};
function makeCard(item,index){
 const card=el('article','lmcatalog-card');
 const art=el('div','lmcatalog-art');
 const colours=[['#364e84','#171c36'],['#65448f','#22223e'],['#36747a','#172c45'],['#965367','#2b2038'],['#5e773d','#222a34'],['#8b6939','#31233e']];
 const clr=colours[(index+item.title.length)%colours.length];
 art.style.setProperty('--poster-a',clr[0]);art.style.setProperty('--poster-b',clr[1]);
 art.append(el('span','lmcatalog-pill',item.type==='tv'?'TV SHOW':'MOVIE'),el('strong','lmcatalog-art-title',item.title));
 const body=el('div','lmcatalog-details');
 body.append(el('div','lmcatalog-title',item.title),el('div','lmcatalog-meta',item.year+' · '+item.genre));
 const actions=el('div','lmcatalog-actions');
 const play=el('button','lmcatalog-play','Choose servers');play.type='button';
 play.addEventListener('click',()=>{
   if(!window.LoliteCinextma?.openCatalogItem?.(item)&&typeof window.toast==='function'){
      window.toast('Movie servers are not available. Reopen Lolite Movies and try again.');
   }
 });
 const favourite=el('button','lmcatalog-fav',fav.has(item.type+item.tmdb)?'★':'☆');
 favourite.type='button';favourite.title='Toggle favourite';
 favourite.addEventListener('click',()=>{
   const id=item.type+item.tmdb;
   if(fav.has(id))fav.delete(id);else fav.add(id);
   saveFav();favourite.textContent=fav.has(id)?'★':'☆';
   if(state.category==='Favourites')draw(card.closest('.lmcatalog'));
 });
 actions.append(play,favourite);body.append(actions);card.append(art,body);
 return card;
}
function draw(section){
 if(!section)return;
 const grid=section.querySelector('.lmcatalog-grid');
 const count=section.querySelector('.lmcatalog-count');
 if(!grid)return;
 const q=state.search.trim().toLowerCase();
 const matching=data.filter(item=>{
   if(q&&!(item.title+' '+item.year+' '+item.genre).toLowerCase().includes(q))return false;
   if(state.category==='Movies')return item.type==='movie';
   if(state.category==='TV Shows')return item.type==='tv';
   if(state.category==='Favourites')return fav.has(item.type+item.tmdb);
   return state.category==='All'||item.genre===state.category;
 });
 grid.replaceChildren();count.textContent=matching.length+' titles';
 if(!matching.length){
   grid.append(el('div','lmcatalog-empty','No titles match this search. Try another category or add a custom movie ID from Streaming sources.'));
   return;
 }
 const frag=document.createDocumentFragment();
 matching.forEach((item,i)=>frag.append(makeCard(item,i)));
 grid.append(frag);
}
function mount(root){
 if(root.querySelector('#lmcatalog'))return;
 const catalog=root.querySelector('#lmCatalog');
 if(!catalog)return; // user still at ad blocker confirmation, or window not ready
 const section=el('section','lmcatalog');section.id='lmcatalog';
 section.append(el('div','lmcatalog-kicker','LOLITE MOVIES · EXPLORE'));
 section.append(el('h2',null,'Movies & TV shows'));
 section.append(el('p','lmcatalog-desc',
   'Browse the built-in starter catalogue instantly—no TMDB ID or API key required. Choose a title to see third-party player options. Available playback and rights are not guaranteed.'));
 const controls=el('div','lmcatalog-controls');
 const search=el('input');search.type='search';search.value=state.search;search.placeholder='Search movies and TV shows…';
 search.setAttribute('aria-label','Search movies and TV shows');
 search.addEventListener('input',()=>{state.search=search.value;draw(section)});
 const count=el('span','lmcatalog-count');
 controls.append(search,count);section.append(controls);
 const tabs=el('div','lmcatalog-tabs');
 for(const category of ['All','Movies','TV Shows','Animation','Sci-Fi','Action','Fantasy','Family','Adventure','Comedy','Favourites']){
   const b=el('button',null,category);b.type='button';b.setAttribute('aria-pressed',String(category===state.category));
   b.addEventListener('click',()=>{
     state.category=category;
     for(const child of tabs.querySelectorAll('button'))child.setAttribute('aria-pressed',String(child===b));
     draw(section);
   });
   tabs.append(b);
 }
 section.append(tabs);
 section.append(el('div','lmcatalog-grid'));
 const localSearch=catalog.querySelector('.lm-search');
 if(localSearch)catalog.insertBefore(section,localSearch);else catalog.append(section);
 draw(section);
}
let queued=false;
const observer=new MutationObserver(()=>{
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;
   const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
   if(root)mount(root);
 });
});
observer.observe(document.documentElement,{childList:true,subtree:true});
function init(){
 const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
 if(root)mount(root);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
window.LoliteMoviesCatalog=Object.freeze({count:data.length});
})();