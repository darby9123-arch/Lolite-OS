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

 // Expanded gaming-language dictionary for filenames that contain no word separators.
 // Only split a word when EVERY segment is recognised; made-up proper nouns are kept.
 const extraWords=('about blank launcher apes helium arch ess apelago chess archess '+
  'duty demands assessment examination question aviators aviation masters buggy '+
  'baby sniper vietnam bad time balls bricks bas bash ballistic beararians bears '+
  'battle karts bite boomslingers bowmaster blow blastronaut blaze blazed drifter '+
  'burrito bison launch libre revenge buildnowgg build now board brawlstars '+
  'call battle captain capuchin capuchins capybara canyon ramp police chase police '+
  'car king arena modern castle wars caves cave crawler cast away cell cellar door '+
  'champion island checkers cheese reason rolling chat room cheshire classic class '+
  'chibi knight chicken scream coffee maker cold front pines combo pool copper '+
  'code name gordon count masters stickman orange cover journey gangsters knights '+
  'pirates player pack splash splashy creatures creature card idle customer support '+
  'cookie clicker mod menu crazy cattle motorcycle penguin catapult plane landing '+
  'crossy road candy cannon daddy dad dadish dash arena io date dinosaur dodo '+
  'demon bluff diamond hollow dig china dimensional incident dino run dire decks '+
  'doblox dodeca dragons doge miner doki literature club dont do not escape '+
  'doodle jump goober doom emscripten doors castle douche bag draw climber line '+
  'dread head drift boss hunters merge russia drive dr dta gta duck life ducklings '+
  'dumb ways die dune buggy dash dungeon deck raid dusk child dying dreams '+
  'earn earth taken edy scar simulator effing hail machines worms eggy car '+
  'elastic face elytra flight endless war escalating duel eugene life eurovision '+
  'evil glitch exit path exo observation extreme factory balls fairy tale one piece '+
  'fancy pants adventure snowboarding fashion battle fatty genius fear assessment '+
  'fears fathom home alone feed void find alien fisheat fish eat getting big '+
  'fish aquarium fisquarium five nights freddy shrek yoshi flappy bird flood runner '+
  'folder dungeon football bros legends fork sausage fort zone free rider gemas '+
  'from rust ash funny battle racing fused gangsta bean gangster garden banban '+
  'geometry vibes george printer get top getting over it get yoked gimmie airpod '+
  'gladi gladi hoppers glory hunters goal south africa going gold digger grand '+
  'grand shift auto escape prison greener grass awaits grind craft grow denmi '+
  'guess their answer gym stack hands of war hardware harold bad day harvest '+
  'haunted school haunt house helix jump hell take taker help no brakes '+
  'high stakes highway hill climb racing lite hipster kickball hit stun fly '+
  'home sheep hooked hot dog bush hot wax hover racer huggy wuggy pixel '+
  'human expenditure program hungry knight lamu pumpkin hyper sandbox '+
  'ice dodo icy purple head idle dice football manager game dev miner '+
  'indestructo tank infinite craft interactive buddy into ruins deep web '+
  'iron snout ironsnout islander is that a it gets so lonely here '+
  'jack smith encrypted jail break jazz rabbit jet pack joy ride jet rush '+
  'jet ski johnny trigger upgrade journey downhill jumping shell jungle deer hunting '+
  'just a platformer hit button one boss kanye zone karate bros kirby '+
  'kitten cannon knock knock koopas koopa last horizon leader strike leaf blower '+
  'learn fly learning level devil lever warriors line rider little runmo lock door '+
  'lone wolf los angeles shark low knight lucky blocks lumber obby '+
  'madalin stunt cars multiplayer madness accelerant combat defense nexus gemini '+
  'hydraulic interactive off color premeditation stand mage tower idle make sure its closed '+
  'mana god marble racer masked forces unlimited master mind world conqueror '+
  'matrix rampage meat boy medal honor medieval shark mega chess miner '+
  'melon playground meow merge round racers miami micro mighty mimic mind scape '+
  'mind wave mine caves minesweeper plus min hero flips tooth miragine '+
  'mom sleeping momos crushers money rush monkey mart monster derby tracks truck '+
  'curfew port stunt mother load motor road rash mountain biker mr racer '+
  'multi task off road master my friend pedro arena tear drop natural selection '+
  'neon rider net attack never ending legacy new grounds rumble super bowser '+
  'new york shark next door ng idle night club showdown ninja obby parkor '+
  'nitro must die not your pawn nubby number factory odd bot out off line '+
  'paradise oh flip omega layers one night as only up opposite day orb creation '+
  'paper mania parking fury rush peace keeper penalty kicks penguin diner pass '+
  'perfect hotel pet world pico driller hot life night punkin school versus beard '+
  'pieces cake ping pong chaos pixel battlegrounds lost idols pixel warfare pizza '+
  'please touch anything plinko plonky poke academy poly track pom gets internet '+
  'poor bunny pork like portal defenders flash porter possess quest potato man '+
  'seeks roof potty racers prank call practice praxis fighter prehistoric '+
  'civilization bronze age processor tycoon prodigy entrapta pull frog pumpkin '+
  'punch push luck raft wars ragdoll achievement archers drop hit recoil '+
  'reach core reacti core red alert hand handed blue reign centipede renegades '+
  'resize resizer resort empire retro bowl college highway ping pong return to '+
  'riddle school middle transfer university revolution idle rise higher road fury '+
  'rocket goal io rocket pult roller baller rolling sky rolly vortex poly monster '+
  'roof top rooftop run rubble trouble moscow new york tokyo russian car driver '+
  'santa run scale depths seven days shadow courier shape transform shred mill '+
  'sauce side effects silk melody six cats under six ways die slice it all '+
  'slide woods slip ways slow roads smash karts snake like sniper shot '+
  'soccer bros random soda solar smash sort court space bar click company '+
  'speed per click spiral roll squid playground steal brain rot stealth master '+
  'steel surge steep descent stick archers defenders fighter jet challenge '+
  'stickman gta stealing diamond stickmin airship breaking bank escaping prison '+
  'flee complex sub way subway surfers barcelona beijing berlin havana houston '+
  'iceland london mexico miami monaco new orleans st petersburg winter holiday zurich '+
  'sugary spire suika summer rider super cold dark deception falling fred '+
  'kid liquid soccer oliver pickle ball adventure santa kicker supreme duelist '+
  'survivor io sushi unroll swing brainrots tablet tanks taco stand '+
  'tail dragon tall tanuki sunset tap road telephone trouble tempo overdose '+
  'terra thanks reminding had fix this dead seat dude man window there is no file '+
  'they are coming three goblets throw potato tiberian dawn time warriors toast '+
  'arling toaster ball tomorrow yesterday tower wizard town scraper trap cat '+
  'trapped jester treacherous trials trees hate you trivia crack truck sim '+
  'tung tung sahur basics tunnel rush ultimate car driving simulator ufo swamp '+
  'un canny uncanny cat golf under tale undertale yellow unfair undyne unicycle '+
  'unit res dreams upgrade complete vampires survivors vapor trails '+
  'vincent mansion dead volley challenge vortex wacky flip water works web '+
  'fishing whack thief boss computer wheelie bike winter falling wolfen stein '+
  'wood worm wrestle bros zombie zombotron reboot zuma').split(/\s+/);
 for(const word of extraWords)if(word)dictionary.add(word);

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

 // Curated names where generic segmentation can be misleading (proper nouns,
 // punctuation, official spellings, or historically malformed source filenames).
 Object.assign(names,{
  aboutblankhtmllauncher:'About:blank HTML Launcher',
  achillies:'Achilles', achillies2:'Achilles 2',
  apesvshelium:'Apes vs. Helium', asdutydemands:'As Duty Demands',
  asssesmentexaminationque:'Assessment Examination',
  aviamastersbuggy:'Avia Masters (Buggy)', babysniperinvietnam:'Baby Sniper in Vietnam',
  badtimesim:'Bad Time Simulator', ballsandbricksgood:'Balls and Bricks',
  bindingofisaccsheeptime:'The Binding of Isaac: Sheep Time',
  bitburner:'Bitburner', blightborne:'Blightborne',
  buildnowgg:'BuildNow GG', capybaraclicker:'Capybara Clicker',
  careatscar2deluxe:'Car Eats Car 2 Deluxe',
  carrampvspolicechase:'Car Ramp vs Police Chase',
  championisland:'Champion Island', chessclassic:'Chess Classic',
  codenamegordon:'Codename: Gordon', coffeemaker:'Coffee Maker',
  cookieclickermodmenu:'Cookie Clicker: Mod Menu', 
  coverorange:'Cover Orange', coverorange2:'Cover Orange 2',
  crazycattle3d:'Crazy Cattle 3D', csgoclicker:'CS:GO Clicker',
  cuttherope:'Cut the Rope', dbzdevolution:'DBZ Devolution',
  deadfrontieroutbreak:'Dead Frontier: Outbreak',
  deadfrontieroutbreak2:'Dead Frontier: Outbreak 2',
  deltatraveler:'Deltatraveler', demolitionderbycrashracing:'Demolition Derby Crash Racing',
  dokidokiliteratureclub:'Doki Doki Literature Club',
  dontescape:'Don’t Escape', dontescape2:'Don’t Escape 2',dontescape3:'Don’t Escape 3',
  doomemscripten:'DOOM (Emscripten)', ducklife:'Duck Life',
  ducklingsio:'Ducklings.io', dumbwaystodie:'Dumb Ways to Die',
  earthtaken:'Earth Taken', 
  edyscarsimulator:'Edy’s Car Simulator',
  epicbattlefantasy5:'Epic Battle Fantasy 5',
  eurovisionsim:'Eurovision Simulator', factoryballs:'Factory Balls',
  fancypantsadventure:'Fancy Pants Adventure',
  fireboyandwatergirl:'Fireboy and Watergirl',
  fnaf:'Five Nights at Freddy’s',
  flappybird:'Flappy Bird', footballbros:'Football Bros',
  gdbreeze:'Geometry Dash Breeze', gdlite:'Geometry Dash Lite',
geometryvibes:'Geometry Vibes',
  gettingoverit:'Getting Over It', 
  grandshiftauto:'Grand Shift Auto',
  growdenio:'Growden.io', hitstunfly:'Hitstun Fly',
  hotdogbush:'Hot Dog Bush', hungrylamu:'Hungry Lamu',
  hyppersandbox:'Hypper Sandbox', indestructotank:'Indestructo Tank',
  jacksmithencryptedorsmthn:'Jacksmith (Encrypted)',
  jetpackjoyride:'Jetpack Joyride',
  kirbysoftandwet:'Kirby: Soft and Wet',
  leveldevil:'Level Devil',
  linerider:'Line Rider', mario64webgl:'Super Mario 64',
  madnessaccelerant:'Madness Accelerant',
  madnesscombatnexus:'Madness Combat: Nexus',
  madalinstuntcarsmultiplayerfixed:'Madalin Stunt Cars Multiplayer',
  maskedforcesunlimited:'Masked Forces Unlimited',
  melonplayground:'Melon Playground',
  meowio:'Meow.io', minesweeperplus:'Minesweeper Plus',
  mrmine:'Mr. Mine',
  monkeymart:'Monkey Mart',
  myfriendpedro:'My Friend Pedro', myfriendpedroarena:'My Friend Pedro: Arena',
  newgroundsrumble:'Newgrounds Rumble',
  ninjaobbyparkor:'Ninja Obby Parkour',
  nubbysnumberfactory:'Nubby’s Number Factory',
  oddbotout:'Odd Bot Out', onenightasfreddy:'One Night as Freddy',
  onlyup:'Only Up', oppositeday:'Opposite Day',
  papabakeria:'Papa’s Bakeria', papadonut:'Papa’s Donuteria',
  papashotdoggeria:'Papa’s Hot Doggeria',
  papaspastaria:'Papa’s Pastaria',papasscooperia:'Papa’s Scooperia',
  papastacomia:'Papa’s Taco Mia',
  papalouiewhenburgersattack:'Papa Louie: When Burgers Attack',
  papalouiewhenpizzasattack:'Papa Louie: When Pizzas Attack',
  papalouiewhensundaesattack:'Papa Louie: When Sundaes Attack',
  paperiomania:'Paper.io Mania',
  parkingfury:'Parking Fury',
  pixelbattlegroundsio:'Pixel Battlegrounds.io',
  plazmaburst:'Plazma Burst',
  pleasedonttouchanything:'Please, Don’t Touch Anything',
  polytrackworksnow:'PolyTrack',
  potatomanseeksthetroof:'Potatoman Seeks the Troof',
  pvz:'Plants vs. Zombies',
  qwop:'QWOP',
  ragollhit:'Ragdoll Hit', raldiscrackhouse:'Raldi’s Crackhouse',
  retrobowl:'Retro Bowl', retrobowlcollege:'Retro Bowl College',
  riddleschool:'Riddle School', riddletransfer:'Riddle Transfer',
  roadoffury:'Road of Fury',
  sandboxels:'Sandboxels',
  shiftatmidnight:'Shift at Midnight', slowroads:'Slow Roads',
  smashkartsworking:'Smash Karts',
  spacecompany:'Space Company',
  stickmanhook:'Stickman Hook',
  stickminbreakingbank:'The Henry Stickmin Collection: Breaking the Bank',
  stickminescapingprison:'The Henry Stickmin Collection: Escaping the Prison',
  stickminairship:'The Henry Stickmin Collection: Infiltrating the Airship',
  stickminfleecomplex:'The Henry Stickmin Collection: Fleeing the Complex',
  tanukisunset:'Tanuki Sunset',
  thedeadseat:'The Dead Seat',
  thereisnofile:'There Is No File',
  towerwizard:'Tower Wizard',
  townscraper:'Townscaper',
  trechoroustrials:'Treacherous Trials',
  tunnelrush:'Tunnel Rush',
  undertaleyellow:'Undertale Yellow',
  vampiresurvivors:'Vampire Survivors',
  webfishing:'Webfishing', whackthetheif:'Whack the Thief',
  worldshardestgame:'World’s Hardest Game',
  yumenikki:'Yume Nikki',
  zombotronreboot:'Zombotron: Reboot'
 });


 // Corrections for clearly multi-word names that are not reliably dictionary-splittable.
 Object.assign(names,{
  assesmentexaminationque:'Assessment Examination',
  brawlstars:'Brawl Stars',
  blobsstory2:'Blob’s Story 2',
  boxinglive2:'Boxing Live 2',
  cactusmccoy:'Cactus McCoy', cactusmccoy2:'Cactus McCoy 2',
  capuchinsf:'Capuchin SF',
  cheshireinachatroom:'Cheshire in a Chat Room',
  clashnslash:'Clash ’n Slash',
  classof09:'Class of ’09',
  clmadnessambulation:'Madness Ambulation',
  clubbytheseal:'Clubby the Seal',
  clusterrush:'Cluster Rush',
  coldpines:'Cold Pines',
  cotlk:'Cult of the Lamb',
  dadgame:'Dad Game',dadnme:'Dad ’n Me',
  dandysworldclicker:'Dandy’s World Clicker',
  datewithiraq:'Date with Iraq',
  decisionmedieval:'Decision: Medieval',
  deepersleep:'Deeper Sleep',
  defendyournuts:'Defend Your Nuts',
  dinorun:'Dino Run',dinorunenterplanetd:'Dino Run: Enter Planet D',
  dogeminer:'Doge Miner',
  domeromantik:'Dorfromantik',
  doomori:'DOOMORI',
  drweedgaster:'Dr. Weed Gaster',
  ducklife:'Duck Life',
  edyscarsimulator:'Edy’s Car Simulator',
  eggycar:'Eggy Car',
  eugeneslife:'Eugene’s Life',
  fallguys:'Fall Guys',
  ffaf:'FFAF',
  fivenightsatshreks:'Five Nights at Shrek’s',
  fivenightsatyoshis:'Five Nights at Yoshi’s',
  forksausage:'Fork ’n Sausage',
  gartenofbanban:'Garten of Banban',
  genericfightermaybe:'Generic Fighter (Maybe)',
  gettothetopalthoughthereisnotop:'Get to the Top Although There Is No Top',
  gladdihoppers:'Gladihoppers',
  glfighters:'GL Fighters',
  gotobed:'Go to Bed',
  grannycreepy:'Granny: Creepy',
  grannyy:'Granny',
  grassmowing:'Grass Mowing',
  gtamods:'GTA Mods',
  halflife:'Half-Life',
  happywheels:'Happy Wheels',
  haroldsbadday:'Harold’s Bad Day',
  hotwax:'Hot Wax',
  icantbelievegoogleflaggedmeforthenameofthefilelol:'I Can’t Believe Google Flagged This File',
  icedodo:'Ice Dodo',
  indestructotankae:'Indestructo Tank AE',
  inkgame:'Ink Game',
  isthatagubby:'Is That a Gubby?',
  itgetssolonelyhere:'It Gets So Lonely Here',
  iqball:'IQ Ball',
  iwbtg:'I Wanna Be the Guy',
  jellytruckgood:'Jelly Truck',
  jetrush:'Jet Rush',
  justaplatformer:'Just a Platformer',
  justhitthebutton:'Just Hit the Button',
  justoneboss:'Just One Boss',
  kartbros:'Kart Bros',
  learntoflyidlehack:'Learn to Fly Idle (Hack)',
  letitconsume:'Let It Consume',
  madalinstuntcarsmultiplayerfixed:'Madalin Stunt Cars Multiplayer',
  madnesspremediation:'Madness Premeditation',
  mastermindworldconquerer:'Mastermind: World Conqueror',
  minhero:'Min Hero',
  momimsleeping:'Mom, I’m Sleeping',
  mrracer:'Mr. Racer',
  mxoffroadmaster:'MX Offroad Master',
  nitromemustdie:'Nitrome Must Die',
  obbycart:'Obby Cart',
  obbyfriends:'Obby Friends',
  obbyyardsale:'Obby Yard Sale',
  obeythegame:'Obey the Game',
  onepiecefighting:'One Piece Fighting',
  oneshotold:'OneShot (Old)',
  ovodimensions:'OvO Dimensions',ovofixed:'OvO',
  picohot:'PICOHOT',
  picosschool:'Pico’s School',
  picovsbeardx:'Pico vs. Beard',
  pizzapapa:'Pizza Papa',
  plangman:'Plangman',
  pokeacademylifeforever:'Poké Academy Life Forever',
  precivilationbronzeage:'Pre-Civilization: Bronze Age',
  pvzm:'PVZM',
  ragdollachivement:'Ragdoll Achievement',
  realflightsim:'Real Flight Simulator',
  redball:'Red Ball',redvbluefix:'Red vs Blue',
  riddleuneversityfix:'Riddle University',
  rolypolymonster:'Roly Poly Monster',
  runningfred:'Running Fred',
  saulgoodmanrun:'Saul Goodman Run',
  sfklaststand:'SFK: Last Stand',
  sfkleague:'SFK League',
  siloshowdow:'Silo Showdown',
  skibidiinthebackrooms:'Skibidi in the Backrooms',
  slopeplus:'Slope Plus',
  smbremastered:'Super Mario Bros. Remastered',
  soccerrandomgood:'Soccer Random',
  souljumper:'Soul Jumper',
  spacewarsbattleground:'Space Wars Battleground',
  sprunkipyramixed:'Sprunki Pyramixed',
  stationmeltdown:'Station Meltdown',stationsaturn:'Station Saturn',
  stateio:'State.io',
  stickslasher:'Stick Slasher',
  strikerdummies:'Striker Dummies',
  superdromebugs:'Super Drome Bugs',
  tabletanks:'Table Tanks',
  taproad:'Tap Road',
  tboidemo:'The Binding of Isaac Demo', tboilambeternal:'The Binding of Isaac: Lamb Eternal',
  tempoverdose:'Tempo Overdose',
  thanksforremindingmeihadtofixthis:'Thanks for Reminding Me I Had to Fix This',
  thedude:'The Dude',
  throwapotatoagain:'Throw a Potato Again',
  tommorowandyesterday:'Tomorrow and Yesterday',
  tsuzukimaze:'Tsuzuki Maze',
  ucds:'Ultimate Car Driving Simulator',
  ufoswampoddysey:'UFO Swamp Odyssey',
  undertalelb:'Undertale: Last Breath',
  vollyballchallenge:'Volleyball Challenge',
  whackyourboss:'Whack Your Boss',
  whackyourcomputer:'Whack Your Computer',
  windowsdoors:'Windows Doors',
  yanderesimulator:'Yandere Simulator',
  yohohoio:'YoHoHo.io',
  yourturntodie:'Your Turn to Die',
  zombotronreboot:'Zombotron Reboot'
 });

 function title(value,filename=''){
  // Only bundled file paths use the "cl" prefix. Legitimate names such as
  // "Clash" and "Climb" must never lose their first two letters.
  const supplied=String(value||'').trim();
  let s=(supplied||String(filename||'').replace(/^.*[\\/]/,'')
   .replace(/\.html?$/i,'').replace(/^cl(?=[a-z0-9])/i,''))
   .replace(/\s*\(\d+\)$/,'').trim();
  const key=s.toLowerCase().replace(/[^a-z0-9]/g,'');
  if(names[key])return names[key];
  // Frequent multi-game families, whose concatenated download names are predictable.
  const subway=key.match(/^subwaysurfers(.+)$/);
  if(subway){
   const places={neworeleans:'New Orleans',stpetersburg:'St. Petersburg',winterholiday:'Winter Holiday'};
   return 'Subway Surfers'+(subway[1]?': '+(places[subway[1]]||subway[1].replace(/([a-z])([0-9])/g,'$1 $2').replace(/^./,ch=>ch.toUpperCase())):'');
  }
  const cover=key.match(/^coverorangejourney(.+)$/);
  if(cover)return 'Cover Orange: Journey '+cover[1].charAt(0).toUpperCase()+cover[1].slice(1);
  const gameNumber=key.match(/^(ducklife|badicecream|factoryballs|feedus|floodrunner|zombotron|wheely|amigopancho|bobtherobber|bloons)([2-9])$/);
  if(gameNumber){
   const base={ducklife:'Duck Life',badicecream:'Bad Ice-Cream',factoryballs:'Factory Balls',
    feedus:'Feed Us',floodrunner:'Flood Runner',zombotron:'Zombotron',wheely:'Wheely',
    amigopancho:'Amigo Pancho',bobtherobber:'Bob the Robber',bloons:'Bloons'}[gameNumber[1]];
   return base+' '+gameNumber[2];
  }

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


 // Genre matching uses BOTH the cleaned name and compressed original filename:
 // old UGS source titles often omit every space, punctuation mark and word boundary.
 const GENRES=Object.freeze([
  ['Baldi’s Basics',/baldi|raldi|caseohs?basics|basic9retake/],
  ['Music & Rhythm',/geometrydash|gdbreeze|gdlite|gdwave|fnf|fridaynightfunkin|rhythm|music|melody|piano|osu|sprunki|sprunked|incredibox|dubstep|danceoffire|trombone|magictiles/],
  ['Horror & Survival',/fivenightsat|fnaf|fnaw|fnac|gartenofbanban|humanexpenditure|deadestate|dreadhead|deeper sleep|deepersleep|ghost|creature|granny|slender|backrooms|horror|nightmare|poppyplaytime|creep|haunted|haunt|deadplate|deadseat|hungrylamu|badparenting|doki.?doki|lethalcompany|scp|fearassessment|fearstofathom|bendy|slendytubbies|zombie|skinwalker|slideinthewoods|themaninthewindow|yanderesimulator/],
  ['Sandbox & Building',/minecraft|eagler|terraria|growyourgarden|build|construction|blockcraft|grindcraft|sandbox|sandtris|sandboxels|melonplayground|powdertoy|worldbox|buildnow|infinitecraft|grindcraft|russiansandbox|spaceflightsim|peopleplayground|littlealchemy|creeperworld|towerscraper|townscraper|physicsplayground|solarsandbox/],
  ['Strategy',/bloons|towerdefense|towerdef|pvz|ageofwar|castlewars|endlesswar|handsofwar|strategy|strategic|battleof|defend|defense|defence|swordsand|landgrab|warriors|battleships|creeperworld|plantsvszombies|chess|checkers|kingdomrush|stickdefenders|cellmachine|clashof|warfare19|warfare194|warof|battleship|redalert|rebuild|civilization|precivilization|decisionmedieval|crusader|defendyournuts|defendyourcastle|strategy|tiberiandawn|miraginewar|monstertracks/],
  ['Puzzle & Brain',/2048|hextris|wordle|slices|amigopancho|badpiggies|appleworm|bejeweled|bdfia5b|bfdia5b|coverorange|bobtherobber|catslovecake|achievementunlocked|iqball|archess|coreball|bridgeconstruction|fancysnowboarding|chuzzle|plangman|sortthecourt|threegoblets|sudoku|tetris|blockblast|bloxorz|riddleschool|riddletransfer|riddleuniversity|sokoban|cuttherope|fireboyandwatergirl|civiballs|impossiblequiz|jigsaw|waterworks|puzzles?|brain|escape|theimpossiblequiz|factoryballs|fourcolors|solitaire|mahjong|portalflash|baba.?is.?you|logic|minesweeper|numberfactory|triviacrack|shapetransform/],
  ['Sports',/football|basketball|basket|archery|baseball|crunchball|kickball|8ballpool|poolball|batterup|soccer|tennis|golf|boxing|wrestle|wrestling|volley|hockey|penaltykick|unicyclehero|pingpong|pickleball|billiard|retrobowl|sport|karatebros/],
  ['Racing & Driving',/drift|drivemad|driving|drive|crazycars|^car|\bcars?\b|buggy|rider|free.?rider|dunedash|dunebuggy|eggycar|eggycar|deathchase|speedracing|racing|racer|moto|carcrash|carkingarena|carramp|crazycattle|demolitionderby|madalin|hillclimb|highway|retro|kart|wheely|wheelie|traffic|trucks?|tunnelrush|slowroads|offroad|needforspeed|nitro|retrohighway|deathchase|roadfury|roadsoffury|rollerballer|tanukisunset|hoverracer|jetskiracing|goalsouthafrica/],
  ['Multiplayer & .io',/aquaparkio|harvestio|meowio|yohohoio|growdenio|ducklingsio|paperiomania|agar\.?io|slither\.?io|bonk\.?io|state\.?io|paper\.?io|hole\.?io|survivor\.?io|rocketgoalio|yohoho\.?io|ducklings\.?io|ducklingsio|pixelbattlegroundsio|smashkarts|1v1|multiplayer|amongus|krunker|bloxd|brawlstars|basketbros|footballbros|gorillatag|fallguys|stumbleguys|rooftopsnipers/],
  ['Simulation & Life',/papas|papalouie|tycoon|ducklife|schoolboy|growyourgarden|hotel|idlefootballmanager|shop|management|simulator|sim\b|bitlife|chicken|animalcrossing|monkeymart|store|shop|restaurant|pizza|sushi|cooking|idlefootballmanager|hardwaretycoon|microlife|farming|farmlife|kindergarten|sortthecourt|realsim|citybuilder|russiancardriver|edyscarsimulator/],
  ['Casual & Idle',/cookieclicker|clicker|idle|antimatterdimensions|celltosingularity|dogeminer|fishing|fisquarium|grassmowing|candybox|learn to fly|learntofly|fish|falling|egg|sortthecourt|solarsmash|flappy|fish|fishing|bubbleshooter|stack|suika|taproad|rolling|ballblast|drawing|doodle|learntofly|learntofly|drag|helixjump|slide|ballz|eggycar|mrg|mrmine|revolutionidle/],
  ['Adventure & RPG',/undertale|deltarune|deltatraveler|zelda|cultofthelamb|riddletransfer|cavestory|cavecrawler|cactusmccoy|islander|island|quest|fantasy|story|adventure|pokemon|stardew|hollowknight|spelunky|cavestory|cavecrawler|dungeon|rpg|adventure|epicbattlefantasy|earthbound|omori|oneshot|yumenikki|finalfantasy|mariorpg|jacksmith|bindingofisaac|bindingofisacc|tboi|vault|quest|madnessnexus|landsof/],
  ['Platformers',/mario|sonic|vex\d|badicecream|subwaysurfers|stickmin|henrystickmin|floodrunner|dinosaur|dino|gettothetop|gettingoverit|happywheels|runfrom|runningfred|dunebuggy|amidsky|amidstthesky|redball|redball|redball|ovo|celeste|bouncy|jump|platform|parkour|angrybirds|ninja|dadish|supermeatboy|ice dodo|icedodo|run3|dinorun|dinorun|worldshardestgame|worlds hardest game|cluster rush|clusterrush|tiny square|stickmanhook|pandas|burritobison|jetpackjoyride|rungame|geometryvibes|slope|kittycannon|kitten cannon/],
  ['Retro & Classics',/pacman|pac.?man|googledino|chessclassic|tetris|pong|asteroids|spaceinvaders|breakout|frogger|galaga|pinball|retro|atari|oldschool|donkeykong|snake|hextris|doom|wolfenstein|dukenukem|supersmashflash|minesweeper/]
 ]);
 function category(game){
  const titleText=String(typeof game==='string'?game:game?.title||'');
  const filename=String(typeof game==='string'?'':game?.filename||game?.file||'');
  const text=(titleText+' '+filename).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'');
  const compact=text.replace(/[^a-z0-9]/g,'');
  // Explicit exceptions prevent a broad keyword such as "escape" or "dino"
  // from placing racing or puzzle titles in the wrong section.
  if(/escaperoad|drivemad|roadfury|streetracing/.test(compact))return 'Racing & Driving';
  if(/(?:^|[^a-z])(?:slither|bonk|agar|krunker|hole|state)\.io\b/.test(text)||
     /^(?:slither|bonk|agar|krunker|hole|state)io/.test(compact))return 'Multiplayer & .io';
  for(const [genre,pattern] of GENRES){
   if(pattern.test(text)||pattern.test(compact))return genre;
  }
  return 'Arcade & Action';
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
  'Arcade & Action':'<g fill="none" stroke="#d6eaff" stroke-width="15"><circle cx="727" cy="233" r="127"/><path d="M727 72v42m0 238v50M566 233h-50m372 0h50"/></g><path d="M726 96l34 99 99 35-99 34-34 101-35-101-100-34 100-35z" fill="#f5d495"/>',
  'Adventure & RPG':'<path d="M498 440L655 130l123 168 87-122 116 264Z" fill="#92c9db"/><path d="M655 130l-51 101h102zM865 176l-34 65h65z" fill="#e8f6ff"/><path d="M586 389l52-36 47 31 80-40" stroke="#f9d99b" stroke-width="13" stroke-dasharray="8 19" fill="none"/><circle cx="648" cy="348" r="17" fill="#fff"/>',
  'Multiplayer & .io':'<g fill="#d6ecff"><circle cx="635" cy="166" r="47"/><circle cx="812" cy="166" r="47"/><circle cx="728" cy="320" r="50"/></g><g fill="none" stroke="#b6c9f5" stroke-width="25" stroke-linecap="round"><path d="M520 329c22-103 208-116 230-7m-10 0c26-98 203-91 230 7M611 425c23-100 216-97 237 0"/></g>',
  'Horror & Survival':'<circle cx="795" cy="143" r="105" fill="#e2e6ff" opacity=".78"/><path d="M795 44a90 90 0 1 0 95 137 94 94 0 0 1-95-137" fill="#57608a"/><path d="M506 415q50-260 144-205 75-116 139 0 101-46 165 205Z" fill="#1c2945"/><path d="M650 280h22m126 0h22" stroke="#c1e2ff" stroke-width="15" stroke-linecap="round"/>',
  'Baldi’s Basics':'<rect x="554" y="110" width="325" height="296" rx="12" fill="#d8e9f4"/><rect x="591" y="145" width="250" height="220" fill="#c0e2d7"/><path d="M620 203h191m-191 40h165m-165 40h135" stroke="#5a91ac" stroke-width="14" stroke-linecap="round"/><path d="M879 165l63 68-63 84" stroke="#f4ca88" stroke-width="21" stroke-linejoin="round" fill="none"/>',
  'Geometry Dash':'<rect x="611" y="154" width="226" height="226" rx="19" fill="#96dff0" transform="rotate(-12 724 267)"/><rect x="672" y="204" width="40" height="40" fill="#2f647a" transform="rotate(-12 724 267)"/><rect x="756" y="204" width="40" height="40" fill="#2f647a" transform="rotate(-12 724 267)"/><path d="M674 313l56 27 59-27" stroke="#2f647a" stroke-width="18" fill="none" stroke-linecap="round"/>',
  'Music & Rhythm':'<circle cx="730" cy="246" r="160" fill="#a8bafd" opacity=".32"/><path d="M720 132v222m0-222l145-36v210" stroke="#e8f5ff" stroke-width="22" fill="none" stroke-linecap="round"/><ellipse cx="676" cy="360" rx="65" ry="30" fill="#e8f5ff" transform="rotate(-23 676 360)"/><ellipse cx="821" cy="315" rx="65" ry="30" fill="#e8f5ff" transform="rotate(-23 821 315)"/>'
 };
 function poster(game){
  const key=String(game?.file||'game')+'|'+String(game?.title||'')+'|'+String(game?.category||'');
  if(posterCache.has(key))return posterCache.get(key);
  let hash=0;for(const ch of key)hash=(Math.imul(hash,33)+ch.charCodeAt(0))>>>0;
  const hue=hash%360,other=(hue+70)%360;
  const kind=String(game?.category||'');
  const illustration=SCENES[kind]||'<circle cx="727" cy="220" r="180" fill="#b5d5fa" opacity=".22"/><circle cx="727" cy="220" r="110" fill="none" stroke="#eaf6ff" stroke-width="21" opacity=".8"/><path d="M726 62l26 83 85 26-85 26-26 84-27-84-85-26 85-26z" fill="#f8d88b"/>';
  const safeText=value=>String(value).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const words=String(game?.title||'Game').trim().split(/\s+/);
  const lines=[''];
  for(const word of words){
   const last=lines.length-1;
   if(lines[last]&&(lines[last].length+word.length+1>24)&&lines.length<2)lines.push(word);
   else lines[last]+=(lines[last]?' ':'')+word;
  }
  lines[0]=(lines[0]||'Game').slice(0,32);
  if(lines.length>1)lines[1]=lines[1].length>32?lines[1].slice(0,29)+'…':lines[1];
  const fontSize=lines.some(x=>x.length>25)?40:lines.some(x=>x.length>19)?45:54;
  const titleSvg=lines.map((line,index)=>'<text x="50" y="'+(lines.length===1?465:427+index*47)+'" fill="#f8fbff" font-size="'+fontSize+
   '" font-weight="800" font-family="system-ui, sans-serif">'+safeText(line)+'</text>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">'+
   '<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="hsl('+hue+' 65% 29%)"/><stop offset="1" stop-color="hsl('+other+' 59% 15%)"/></linearGradient>'+
   '<linearGradient id="shade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#081120" stop-opacity="0"/><stop offset="1" stop-color="#081120" stop-opacity=".94"/></linearGradient></defs>'+
   '<rect width="960" height="540" fill="url(#bg)"/>'+
   '<circle cx="810" cy="130" r="260" fill="#ffffff" opacity=".07"/>'+
   illustration+
   '<rect x="0" y="345" width="960" height="195" fill="url(#shade)"/>'+
   titleSvg+
   '<text x="55" y="503" fill="#d0e2fa" font-size="16" font-family="system-ui, sans-serif" letter-spacing="3">LOLITE GAME LIBRARY</text></svg>';
  const url='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  posterCache.set(key,url);
  return url;
 }

 const discovered=new Map();
 function imageURL(raw,base){
  if(!raw||/^(?:data|blob|javascript):/i.test(raw))return '';
  try{
   const url=new URL(raw,base);
   // Icons must be ordinary HTTPS images. Never insert markup/JS/data URLs from a game.
   return url.protocol==='https:'&&url.href.length<=1600?url.href:'';
  }catch{return ''}
 }
 async function scan(game){
  if(!game?.ugsEntry||!/^html%20games\/ugs\/[-\w.]+\.html?$/i.test(game.url||''))return [];
  try{
   const response=await fetch(game.url,{cache:'force-cache',credentials:'same-origin'});
   if(!response.ok)return [];
   let html='';
   if(response.body?.getReader){
    const reader=response.body.getReader(),decoder=new TextDecoder();
    try{
     while(html.length<65536){
      const next=await reader.read();if(next.done)break;
      html+=decoder.decode(next.value,{stream:true});
     }
    }finally{await reader.cancel().catch(()=>{})}
   }else{
    // Some older browsers cannot stream; avoid deliberately reading enormous files.
    if(Number(response.headers?.get?.('content-length')||0)>262144)return [];
    html=(await response.text()).slice(0,65536);
   }
   const doc=new DOMParser().parseFromString(html,'text/html');
   const absolute=new URL(game.url,document.baseURI).href;
   const base=imageURL(doc.querySelector('base[href]')?.getAttribute('href'),absolute)||absolute;
   const candidates=[];
   const selectors=[
    'meta[property="og:image"]','meta[name="twitter:image"]',
    'meta[property="twitter:image"]','meta[name="twitter:image:src"]',
    'link[rel="apple-touch-icon"]','link[rel~="icon"]',
    'video[poster]','img[src*="cover"]','img[src*="logo"]',
    'img[src*="thumb"]','img[src*="splash"]'
   ];
   for(const selector of selectors){
    const nodes=doc.querySelectorAll?Array.from(doc.querySelectorAll(selector)):
     [doc.querySelector(selector)].filter(Boolean);
    for(const tag of nodes.slice(0,6)){
     const src=imageURL(tag.getAttribute('content')||tag.getAttribute('href')||
      tag.getAttribute('poster')||tag.getAttribute('src'),base);
     if(src&&/\.(?:png|jpe?g|webp|gif|svg|ico|avif)(?:[?#]|$)/i.test(src)
      &&!candidates.includes(src))candidates.push(src);
     if(candidates.length>=8)return candidates;
    }
   }
   return candidates;
  }catch(error){/* Broken metadata or a missing image should not break the Game Store. */}
  return [];
 }
 // Limit simultaneous HTML metadata reads while scrolling through many games.
 // All image candidates are cached per entrypoint; broken images can be skipped.
 const queue=[];let running=0;
 function pump(){
  while(running<3&&queue.length){
   const {game,resolve}=queue.shift();running++;
   Promise.resolve().then(()=>scan(game)).then(resolve,()=>resolve([]))
    .finally(()=>{running--;pump()});
  }
 }
 function candidates(game){
  const key=game?.url||'';
  if(!key)return Promise.resolve([]);
  if(!discovered.has(key))discovered.set(key,new Promise(resolve=>{
   queue.push({game,resolve});pump();
  }));
  return discovered.get(key);
 }
 const discover=async game=>(await candidates(game))[0]||'';
 const next=async(game,badUrl)=>{
  const urls=await candidates(game);
  const index=urls.indexOf(badUrl);
  return urls[index+1]||'';
 };
 window.LoliteUGSPresentation=Object.freeze({title,category,discover,next,poster});
})();