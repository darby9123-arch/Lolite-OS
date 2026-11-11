/* UGS metadata: readable game names and real images when the original game provides one.
 * Never changes playable files or server URLs. */
(()=>{
 'use strict';
 const names={
  '1on1soccer':'1 on 1 Soccer','1v1tennis':'1v1 Tennis',
  '3pandas':'3 Pandas','3pandasbrazil':'3 Pandas: Brazil','3pandasfantasy':'3 Pandas: Fantasy',
  '3pandasjapan':'3 Pandas: Japan','3pandasnight':'3 Pandas: Night',
  '8ballpool':'8 Ball Pool','40xescape':'40x Escape',
  'agariolite':'Agar.io Lite','adventurecapatalist':'AdVenture Capitalist',
  'antarttycoon':'Antarctic Tycoon','antimatterdimensions':'Antimatter Dimensions',
  'akoopasrevenge2':'A Koopa’s Revenge 2','arcadevolley':'Arcade Volley',
  'acegangstertaxi':'Ace Gangster Taxi','alienhominid':'Alien Hominid','achievmentunlocked2':'Achievement Unlocked 2',
  'achievmentunlocked3':'Achievement Unlocked 3','badicecream':'Bad Ice-Cream',
  'badicecream2':'Bad Ice-Cream 2','badicecream3':'Bad Ice-Cream 3',
  'basketrandom':'Basket Random','baseballbros':'Baseball Bros',
  'badpiggieslatest':'Bad Piggies (Latest)','bballlegend':'Basketball Legend',
  'battlekarts':'Battle Karts','beachboxingsim':'Beach Boxing Simulator',
  'blightborne':'Blightborne','boxhead2playrooms':'Boxhead 2Play Rooms',
  'burritobisonlaunchalibre':'Burrito Bison: Launcha Libre','btd5':'Bloons TD 5',
  'bloonspp1':'Bloons Player Pack 1','bloonspp2':'Bloons Player Pack 2',
  'bloonspp3':'Bloons Player Pack 3','bloonspp4':'Bloons Player Pack 4',
  'bloonspp5':'Bloons Player Pack 5','bloonstd6scratch':'Bloons TD 6 (Scratch)',
  'bfdia5b':'BFDIA 5B','btts':'BTTS','btts2':'BTTS 2',
  'papaspizzeria':'Papa’s Pizzeria','papasfreezeria':'Papa’s Freezeria',
  'papasburgeria':'Papa’s Burgeria','papasdonuteria':'Papa’s Donuteria',
  'papasbakeria':'Papa’s Bakeria','papaspancakeria':'Papa’s Pancakeria',
  'papaswingeria':'Papa’s Wingeria','papassushiria':'Papa’s Sushiria',
  'papascheeseria':'Papa’s Cheeseria','papascupcakeria':'Papa’s Cupcakeria',
  'worldshardestgame':'World’s Hardest Game','worldshardestgame2':'World’s Hardest Game 2',
  'worldshardestgame3':'World’s Hardest Game 3','worldshardestgame4':'World’s Hardest Game 4',
  'webecomewhatwebehold':'We Become What We Behold','pokepath':'PokéPath TD',
  'bitlife':'BitLife','fnaf':'Five Nights at Freddy’s'
 };
 const short={io:'io',td:'TD',rpg:'RPG',fps:'FPS',gta:'GTA',fnaf:'FNAF',btd:'BTD',
  bfdi:'BFDI',bfdia:'BFDIA',frvr:'FRVR',x3m:'X3M',hd:'HD',vr:'VR'};
 const wordBank=('a an the and or of on in to for from with without vs at by is are has '+
  'one two three more all game games ball balls football basketball baseball soccer tennis '+
  'pandas brazil fantasy japan night slices pool seconds burger run escape bullets '+
  'abandoned absolute madness achievement unlocked adventure capital capitalist '+
  'age war clash vikings airline tycoon idle alien aliens transporter amidst sky amigo pancho ancient sins '+
  'angry birds space animal crossing anti matter dimensions apple worm aqua park arcade '+
  'archery world tour armor mayhem awesome pirates planes tanks axis league babel tower '+
  'baby backyard bacon may die bad ice cream parenting piggies times simulator '+
  'blast bodyguard bodyguards banana bananas barry secret bart basket legends legend stars superstars super '+
  'random slam dunk batter up beach boxing bear bejeweled twist flash bergen truck '+
  'big flappy neon tiny square shot binding sheep bit burner life black knight smith '+
  'lab blazed blight borne blob story stories block craft parkour post pig blocky demolition '+
  'derby bloons player pack bloxorz blumgi racers rocket boba bob robber bottle cracks '+
  'bounce back masters bouncy motors bounty bow box head play rooms brain rot brawl volley volleyball '+
  'bread skate bridge race battle bunny land bubble tank arenas build now '+
  'burrito bison launch libre revenge cactus mccoy candy box cannon city car cars cat '+
  'click clicker chicken chill cookie core crazy crash crush cut dash dark day days dead '+
  'deep defend defense desert dino dinosaur dog doodle down drag draw dragon dream drift '+
  'drive driver driving duck duel dungeon earth egg eggy elastic element empire end evil '+
  'evolution fall fast final fire fish fishing flip flappy flight flying fly food forest '+
  'formula free fruit future galaxy garden geometry ghost glass go golf google gorilla '+
  'granny gravity great grow happy hard hardest head hero heroes hextris hole home hop '+
  'hot house idle impossible infinite island jet jump jelly king kingdom last level '+
  'light little logic lost love lucky mad magical mario math maze meme merge miner mine '+
  'mini mining moon moto motor mountain mouse music mystery ninja noob ocean office '+
  'online open over paper party path perfect physics pixel planet plant plants platform '+
  'platformer puzzle puzzles quest rainbow red rise road roads robot robots roll room '+
  'rush run school season secret shadow shark sky slide slime snake snow soccer solar '+
  'sonic soul sound speed spin sprint stack steam stick stickman stone street stunt '+
  'summer sun survive survival surfer surfers sword swing switch tag temple test three '+
  'throw time town train trial trials truck ultimate upgrade vampire vector versus '+
  'village villager water wave waves wheel wheelie wheely what when where who why wind '+
  'winter witch word wordle wrestle wrestling world xmas you your yellow zelda zen '+
  '2d 3d 4k 8k td rpg fps btd bfdi bfdia frvr x3m hd vr io').split(/\s+/);
 const dictionary=new Set(wordBank);
 function splitWord(str){
  const s=str.toLowerCase(),n=s.length;
  if(n<8||dictionary.has(s))return [str];
  const dp=Array(n+1).fill(null);dp[n]=[];
  for(let i=n-1;i>=0;i--){
   for(let j=n;j>i;j--){
    const term=s.slice(i,j);if(!dictionary.has(term)||!dp[j])continue;
    const candidate=[term,...dp[j]];
    if(!dp[i]||candidate.length<dp[i].length)dp[i]=candidate;
   }
  }
  return dp[0]&&dp[0].length>1?dp[0]:[str];
 }
 function title(value,filename=''){
  // Only bundled file paths use the "cl" prefix. Legitimate names such as
  // "Clash" and "Climb" must never lose their first two letters.
  const supplied=String(value||'').trim();
  let s=(supplied||String(filename||'').replace(/^.*[\\/]/,'')
   .replace(/\.html?$/i,'').replace(/^cl(?=[a-z0-9])/i,''))
   .replace(/\s*\(\d+\)$/,'').trim();
  const key=s.toLowerCase().replace(/[^a-z0-9]/g,'');
  if(names[key])return names[key];
  s=s.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Z])([A-Z][a-z])/g,'$1 $2')
   .replace(/[_-]+/g,' ').replace(/(\d)([A-Za-z])/g,'$1 $2')
   .replace(/([A-Za-z])(\d)/g,'$1 $2').replace(/\s+/g,' ').trim();
  return s.split(' ').flatMap(w=>/^[a-z]{8,}$/i.test(w)?splitWord(w):[w])
   .filter(Boolean).map(w=>short[w.toLowerCase()]||(/^\d+$/.test(w)?w:
    w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()))
   .join(' ').replace(/\s+io\b/gi,'.io')
   .replace(/\b([2348]) D\b/g,'$1D')
   .replace(/^(\S+) Of (\S+)/,'$1 of $2')
   .replace(/\s+(?:The|Of|And|In|On|For|To|A)\s+/g,m=>m.toLowerCase())||'Untitled Game';
 }
 const discovered=new Map();
 function imageURL(raw,base){
  if(!raw||/^(?:data|blob|javascript):/i.test(raw))return '';
  try{const url=new URL(raw,base);return url.protocol==='https:'&&url.href.length<=1600?url.href:''}catch{return ''}
 }
 async function scan(game){
  if(!game?.ugsEntry||!/^html%20games\/ugs\/[-\w.]+\.html?$/i.test(game.url||''))return '';
  try{
   const response=await fetch(game.url,{cache:'force-cache',credentials:'same-origin'});
   if(!response.ok)return '';
   let text='';
   if(response.body?.getReader){
    const reader=response.body.getReader(),decoder=new TextDecoder();
    try{
     while(text.length<65536){
      const next=await reader.read();if(next.done)break;
      text+=decoder.decode(next.value,{stream:true});
     }
    }finally{await reader.cancel().catch(()=>{})}
   }else text=(await response.text()).slice(0,65536);
   const doc=new DOMParser().parseFromString(text,'text/html');
   const absolute=new URL(game.url,document.baseURI).href;
   const base=imageURL(doc.querySelector('base[href]')?.getAttribute('href'),absolute)||absolute;
   for(const query of ['meta[property="og:image"]','meta[name="twitter:image"]',
    'link[rel="apple-touch-icon"]','link[rel~="icon"]',
    'img[src*="cover"]','img[src*="logo"]','img[src*="thumb"]','img[src*="splash"]']){
    const tag=doc.querySelector(query);if(!tag)continue;
    const url=imageURL(tag.getAttribute('content')||tag.getAttribute('href')||tag.getAttribute('src'),base);
    if(url&&/\.(?:png|jpe?g|webp|gif|svg|ico|avif)(?:[?#]|$)/i.test(url))return url;
   }
  }catch(error){/* No image is a normal fallback, not a game launch failure. */}
  return '';
 }
 // Keep art scans throttled while browsing a large catalogue.
 const queue=[];let running=0;
 function pump(){
  while(running<3&&queue.length){
   const {game,resolve}=queue.shift();running++;
   Promise.resolve().then(()=>scan(game)).then(resolve,()=>resolve('')).finally(()=>{running--;pump()});
  }
 }
 const discover=game=>{
  const key=game?.url||'';
  if(!key)return Promise.resolve('');
  if(!discovered.has(key))discovered.set(key,new Promise(resolve=>{queue.push({game,resolve});pump()}));
  return discovered.get(key);
 };
 window.LoliteUGSPresentation=Object.freeze({title,discover});
})();