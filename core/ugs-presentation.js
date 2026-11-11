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
  'bitlife':'BitLife','fnaf':'Five Nights at Freddy’s',
  'aquaparkio':'Aquapark.io','motox3m':'Moto X3M','motox3m2':'Moto X3M 2',
  'motox3m3':'Moto X3M 3','motox3mwinter':'Moto X3M Winter',
  'motox3mspookyland':'Moto X3M Spooky Land','motox3mpoolparty':'Moto X3M Pool Party'
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

 // Original category illustrations for games that supply no usable cover.
 // These are intentionally not presented as official screenshots or logos.
 const posterCache=new Map();
 const SCENES={
  'Sports':'<circle cx="720" cy="210" r="138" fill="#f4f8ff" opacity=".95"/><path d="M640 144l75-38 76 44-10 86-77 35-73-43z" fill="#233459" opacity=".72"/><path d="M720 73v49m-136 91h54m156 0h54m-128 90v56" stroke="#233459" stroke-width="9" opacity=".6"/>',
  'Racing & Driving':'<path d="M445 485L660 25H803L965 485Z" fill="#152238" opacity=".6"/><path d="M720 110v70m0 56v90m0 58v48" stroke="#edf6ff" stroke-width="14" stroke-dasharray="44 38" opacity=".7"/><path d="M554 248l51-92h188l53 92 23 27v76H528v-76z" fill="#e6edf8"/><rect x="603" y="175" width="177" height="75" rx="14" fill="#7c9ccc"/><circle cx="595" cy="355" r="29" fill="#18223b"/><circle cx="799" cy="355" r="29" fill="#18223b"/>',
  'Puzzle & Brain':'<g transform="translate(600 77) rotate(-10 140 140)"><rect x="0" y="0" width="130" height="130" rx="18" fill="#90baff"/><rect x="145" y="0" width="130" height="130" rx="18" fill="#d5a8f7"/><rect x="0" y="145" width="130" height="130" rx="18" fill="#f7cf81"/><rect x="145" y="145" width="130" height="130" rx="18" fill="#9ee5ce"/></g>',
  'Platformers':'<path d="M490 369h230v31H490zm260-117h200v31H750zM425 175h185v31H425z" fill="#d7ecff" opacity=".85"/><circle cx="712" cy="185" r="47" fill="#f8cf78"/><path d="M712 101l14 34 37 4-28 25 9 37-32-19-33 19 9-37-28-25 37-4z" fill="#fff6ca"/><path d="M490 434c80-59 166-59 240 0" fill="none" stroke="#8dd4ff" stroke-width="16"/>',
  'Sandbox & Building':'<circle cx="771" cy="98" r="54" fill="#f8d28b"/><path d="M420 400l155-220 110 140 114-182 181 262z" fill="#8ad2c3"/><path d="M575 180l-49 74h99zM800 138l-46 74h93z" fill="#e7f8ff"/><path d="M420 401h560v79H420z" fill="#243d56"/><path d="M500 418h65v63h-65zm95-22h78v85h-78zm117 15h90v70h-90z" fill="#d4eefa" opacity=".3"/>',
  'Simulation & Life':'<rect x="490" y="220" width="96" height="260" rx="7" fill="#b4c8ff"/><rect x="608" y="118" width="139" height="362" rx="7" fill="#82b8e6"/><rect x="773" y="205" width="118" height="275" rx="7" fill="#d5b3f0"/><path d="M512 252h55m-55 48h55m-55 48h55m120-198h65m-65 50h65m-65 50h65m-65 50h65m129-63h55m-55 53h55" stroke="#243754" stroke-width="13" opacity=".7"/>',
  'Casual & Idle':'<circle cx="648" cy="230" r="120" fill="#f3bfda"/><circle cx="805" cy="166" r="75" fill="#b9d6ff"/><circle cx="825" cy="336" r="89" fill="#f7dc9e"/><path d="M649 352l-19 88m180-199l-22 200m45-18l-18 32" stroke="#e8f5ff" stroke-width="6" opacity=".8"/>',
  'Strategy':'<path d="M635 135h162v60h-162zM666 195h100l24 176H641zM606 371h220v40H606zM577 413h280v44H577z" fill="#cfe0fd"/><path d="M674 83h85l28 52H645z" fill="#f6dca0"/><rect x="681" y="234" width="62" height="88" rx="27" fill="#617ca8"/><path d="M613 470h230" stroke="#cfe0fd" stroke-width="13"/>',
  'Retro & Classics':'<g fill="#c8d6ff"><rect x="570" y="118" width="54" height="54"/><rect x="678" y="118" width="54" height="54"/><rect x="786" y="118" width="54" height="54"/><rect x="516" y="172" width="54" height="54"/><rect x="570" y="226" width="54" height="54"/><rect x="624" y="226" width="54" height="54"/><rect x="678" y="226" width="54" height="54"/><rect x="732" y="226" width="54" height="54"/><rect x="786" y="172" width="54" height="54"/><rect x="840" y="172" width="54" height="54"/></g><rect x="624" y="172" width="54" height="54" fill="#27395a"/>',
  'Music & Rhythm':'<circle cx="730" cy="246" r="160" fill="#a8bafd" opacity=".32"/><path d="M720 132v222m0-222l145-36v210" stroke="#e8f5ff" stroke-width="22" fill="none" stroke-linecap="round"/><ellipse cx="676" cy="360" rx="65" ry="30" fill="#e8f5ff" transform="rotate(-23 676 360)"/><ellipse cx="821" cy="315" rx="65" ry="30" fill="#e8f5ff" transform="rotate(-23 821 315)"/>'
 };
 function poster(game){
  const key=String(game?.file||game?.title||'game');
  if(posterCache.has(key))return posterCache.get(key);
  let hash=0;for(const ch of key)hash=(Math.imul(hash,33)+ch.charCodeAt(0))>>>0;
  const hue=hash%360,other=(hue+70)%360;
  const kind=String(game?.category||'');
  const illustration=SCENES[kind]||'<circle cx="727" cy="220" r="180" fill="#b5d5fa" opacity=".22"/><circle cx="727" cy="220" r="110" fill="none" stroke="#eaf6ff" stroke-width="21" opacity=".8"/><path d="M726 62l26 83 85 26-85 26-26 84-27-84-85-26 85-26z" fill="#f8d88b"/>';
  const title=String(game?.title||'Game').slice(0,44).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">'+
   '<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="hsl('+hue+' 65% 29%)"/><stop offset="1" stop-color="hsl('+other+' 59% 15%)"/></linearGradient>'+
   '<linearGradient id="shade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#081120" stop-opacity="0"/><stop offset="1" stop-color="#081120" stop-opacity=".94"/></linearGradient></defs>'+
   '<rect width="960" height="540" fill="url(#bg)"/>'+
   '<circle cx="810" cy="130" r="260" fill="#ffffff" opacity=".07"/>'+
   illustration+
   '<rect x="0" y="345" width="960" height="195" fill="url(#shade)"/>'+
   '<text x="52" y="462" fill="#f8fbff" font-size="57" font-weight="800" font-family="system-ui, sans-serif">'+title+'</text>'+
   '<text x="55" y="503" fill="#d0e2fa" font-size="16" font-family="system-ui, sans-serif" letter-spacing="3">LOLITE GAME LIBRARY</text></svg>';
  const url='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  posterCache.set(key,url);
  return url;
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
 window.LoliteUGSPresentation=Object.freeze({title,discover,poster});
})();