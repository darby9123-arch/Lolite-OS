/* Lolite OS 3.7.0 — reliable local cover art plus optional remote artwork */
(()=>{
 const CSS=`
 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
 .store{display:grid;grid-template-columns:226px minmax(0,1fr);height:calc(100% + 40px);min-height:0;margin:-20px;background:#0b0e13;color:#eef2f8;overflow:hidden;font-family:'DM Sans','Segoe UI',sans-serif;letter-spacing:0}
 .store *{box-sizing:border-box}.store button,.store input{font:inherit}.store-side{display:flex;flex-direction:column;gap:22px;background:#0d1118;border-right:1px solid #202834;padding:23px 14px;min-width:0}
 .store-brand{padding:2px 12px 17px;border-bottom:1px solid #202834;font:700 20px 'Space Grotesk','Segoe UI',sans-serif;letter-spacing:-.7px}.store-brand span{display:block;margin-top:4px;font:600 10px 'DM Sans',sans-serif;letter-spacing:2px;color:#7e8a9c}
 .store-nav-label{padding:0 12px 8px;color:#657184;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase}
 .store-nav{display:grid;gap:4px}.store-nav button{display:flex;align-items:center;gap:11px;width:100%;padding:10px 12px;border:1px solid transparent;border-radius:8px;background:transparent;color:#a8b2c1;text-align:left;font-size:13px;cursor:pointer;transition:background .15s,border-color .15s}
 .store-nav button:hover{background:#171e28;color:#f4f6fa}.store-nav button.active{background:#1b2030;border-color:#34324f;color:#fff}.store-nav .nav-mark{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;background:#202937;color:#a7b7d3;font-size:10px;font-weight:700}.store-nav button.active .nav-mark{background:#7167df;color:#fff}
 .store-side-footer{margin-top:auto;padding:13px 12px;border-top:1px solid #202834;color:#657184;font-size:11px;line-height:1.7}
 .store-main{min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;padding:26px clamp(16px,3vw,36px) 72px;background:radial-gradient(ellipse at 84% -12%,#1b2540 0,transparent 34%),#0b0e13;scrollbar-color:#303b4c transparent}
 .store-top{display:flex;align-items:center;gap:14px;position:sticky;top:-26px;z-index:5;padding:0 0 18px;background:linear-gradient(#0b0e13 82%,#0b0e1300)}
 .store-search-wrap{position:relative;flex:1;min-width:0}.store-search-mark{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#77859a;font-size:15px;pointer-events:none}
 .store-search{width:100%;height:43px;padding:0 14px 0 39px;border:1px solid #283241!important;border-radius:8px!important;background:#111720!important;color:#f4f6fb!important;outline:none}.store-search:focus{border-color:#7268dc!important;box-shadow:0 0 0 3px #7268dc20}
 .store-count-pill{white-space:nowrap;color:#8d9aab;font-size:12px}
 .store-hero{position:relative;display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:230px;margin:0 0 31px;padding:clamp(23px,3vw,38px);overflow:hidden;border:1px solid #303c52;border-radius:8px;background:linear-gradient(112deg,#19243a 0%,#151a28 56%,#201d3a 100%);isolation:isolate}
 .store-hero:before{content:'';position:absolute;z-index:-1;width:290px;height:290px;right:7%;top:-105px;border:1px solid #9baaff30;border-radius:50%;box-shadow:0 0 0 28px #9baaff08,0 0 0 58px #9baaff05}
 .store-hero:after{content:'PLAY';position:absolute;right:7%;bottom:-22px;color:#ffffff08;font:700 clamp(66px,10vw,118px)/1 'Space Grotesk',sans-serif;letter-spacing:-8px;pointer-events:none}
 .store-eyebrow{font-size:10px;font-weight:700;letter-spacing:2px;color:#aaa5ff;text-transform:uppercase}.store-hero h1{margin:12px 0 10px;font:700 clamp(27px,3vw,38px)/1.08 'Space Grotesk','Segoe UI',sans-serif;letter-spacing:-1.5px}.store-hero p{max-width:440px;margin:0 0 20px;color:#aab5c6;font-size:13px;line-height:1.7}
 .store-primary{position:relative;z-index:1;padding:10px 15px;border:1px solid #8e85ff;border-radius:8px;background:#7469e8;color:#fff;font-size:12px;font-weight:700;cursor:pointer}.store-primary:hover{background:#8378f5}
 .store-hero-side{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:110px}.store-hero-side strong{font:700 48px 'Space Grotesk',sans-serif;letter-spacing:-3px;color:#d4d0ff}.store-hero-side span{font-size:10px;letter-spacing:1.8px;color:#a4aec2}
 .store-section{margin:0 0 34px}.store-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}.store-section-head h2{margin:0;font:600 19px 'Space Grotesk','Segoe UI',sans-serif;letter-spacing:-.45px}.store-section-head p{margin:5px 0 0;color:#78869a;font-size:12px}.store-section-head button{padding:7px 9px;border:1px solid #293344;border-radius:7px;background:#121823;color:#b8b2ff;font-size:11px;cursor:pointer}.store-section-head button:hover{background:#1c2330}
 .store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,205px),1fr));gap:13px}
 .store-card{min-width:0;overflow:hidden;border:1px solid #242e3b;border-radius:8px;background:#111720;transition:transform .16s,border-color .16s,background .16s}.store-card:hover{transform:translateY(-3px);border-color:#4b4d72;background:#151b27}
 .store-cover{position:relative;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;min-height:117px;padding:14px;overflow:hidden;background:linear-gradient(135deg,var(--cover-a,#202c40),var(--cover-b,#141923))}
 /* Landscape treatment: square logos appear over a soft full-bleed backdrop. */
 .store-cover-art-backdrop{position:absolute;inset:-12px;z-index:0;background-size:cover;background-position:center;filter:blur(13px) brightness(.55);opacity:0;transition:opacity .25s ease;pointer-events:none}
 .store-cover.has-game-art .store-cover-art-backdrop{opacity:.92}
 .store-cover-art{z-index:1;background-position:center!important}
 .store-cover.has-game-art .store-cover-title,.store-cover.has-game-art .store-cover-label{z-index:3}
 .store-featured-square .store-hero-art{display:block;position:absolute;z-index:1;right:0;top:0;bottom:0;width:53%;background-image:var(--hero-art);background-position:center right 12%;background-repeat:no-repeat;background-size:contain;filter:drop-shadow(0 14px 25px #0009);pointer-events:none}
 .store-featured-square .store-hero-copy{max-width:55%}
 @media(max-width:760px){.store-featured-square .store-hero-art{opacity:.35;width:70%}.store-featured-square .store-hero-copy{max-width:100%}}

 .store-cover-art{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.02);transition:opacity .25s ease,transform .4s ease}.store-cover-art:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#070911d9 0%,#0709119c 60%,#07091145 100%),linear-gradient(0deg,#070911a8,transparent 72%)}.store-cover.has-game-art .store-cover-art{opacity:1;transform:scale(1.02)}.store-card:hover .store-cover.has-game-art .store-cover-art,.store-card:focus-within .store-cover.has-game-art .store-cover-art{opacity:1;transform:scale(1.08)}.store-cover.has-game-art .store-cover-title,.store-cover.has-game-art .store-cover-label{z-index:2;text-shadow:0 2px 10px #000}
 .store-cover:before{content:'';position:absolute;width:110px;height:110px;right:-25px;top:-42px;border:1px solid #ffffff22;border-radius:8px;transform:rotate(28deg);box-shadow:0 0 0 14px #ffffff06,0 0 0 29px #ffffff04}
 .store-cover:after{content:'';position:absolute;width:70px;height:70px;right:23px;bottom:-42px;border:1px solid #ffffff19;border-radius:50%}
 .store-cover-label{position:relative;z-index:1;color:#d0d8e6;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}.store-cover-title{position:relative;z-index:1;max-width:90%;font:700 18px/1.1 'Space Grotesk','Segoe UI',sans-serif;letter-spacing:-.45px;color:#fff;text-shadow:0 2px 15px #0005}
 .store-card-body{padding:13px}.store-card h3{overflow:hidden;margin:0 0 6px;font-size:13px;font-weight:700;white-space:nowrap;text-overflow:ellipsis}.store-card-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;color:#78869a;font-size:10px}.store-tag{overflow:hidden;max-width:70%;padding:3px 6px;border:1px solid #30384a;border-radius:4px;color:#a9b2c2;text-overflow:ellipsis;white-space:nowrap}
 .store-play{width:100%;padding:9px 10px;border:1px solid #3b3b65;border-radius:7px;background:#22233b;color:#d9d7ff;font-size:12px;font-weight:700;cursor:pointer}.store-play:hover{background:#34335a;border-color:#6d65b8;color:#fff}
 .store-external-player-note{padding:10px 14px;background:#181b29;border-bottom:1px solid #373d51;color:#c8d2e5;font-size:12px;line-height:1.5}.store-external-player-note strong{color:#fff}.store-external-player-note a{color:#b7b0ff}.store-embed-warning{display:block;color:#f1cb9b;margin-top:3px}
 .store-external-note{margin:9px 0 0;color:#9da9bb;font-size:10px;line-height:1.5}.store-external-note a{color:#b7b0ff;text-decoration:underline;text-underline-offset:2px}.store-external-note a:hover{color:#e0dcff}
 .store-empty{padding:38px 20px;text-align:center;border:1px dashed #303b4a;border-radius:8px;color:#8995a6;font-size:13px}
 .store-player{height:100%;min-height:0;display:flex;flex-direction:column;gap:10px;background:#0b0e13;color:#eef2f8;font-family:'DM Sans','Segoe UI',sans-serif}.store-player-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.store-player-head strong{font:600 16px 'Space Grotesk',sans-serif}.store-player-actions{display:flex;gap:6px;flex-wrap:wrap}.store-player-actions button{background:#171f2b;border:1px solid #303c4d;border-radius:7px;padding:8px 10px;color:#e9edf6;font-size:11px;cursor:pointer}.store-frame{flex:1;min-height:0;width:100%;border:1px solid #283242;border-radius:8px;background:#05070a}
 .store-player-fullscreen{position:fixed!important;inset:0!important;z-index:2147483000!important;height:100dvh!important;width:100vw!important;padding:12px!important;background:#07090d!important}
 .store-player{height:100%;min-height:0;display:flex;flex-direction:column;gap:8px}.store-player-head{flex:0 0 auto}.store-frame{display:block;width:100%;height:calc(100% - 46px);min-height:0!important;flex:1 1 auto;border:0!important;border-radius:8px;background:#05070a}.store-player-fullscreen{display:flex!important;flex-direction:column!important;gap:8px!important}.store-player-fullscreen .store-frame{height:calc(100dvh - 62px)!important;min-height:0!important;flex:1 1 auto}.store-fullscreen-icon{width:38px;height:34px;display:inline-grid;place-items:center;font-size:22px;line-height:1;border:1px solid #394458;border-radius:8px;background:#171e2a;color:#f4f6fb;cursor:pointer}
 @media(max-width:760px){.store{grid-template-columns:1fr}.store-side{display:none}.store-main{padding:17px}.store-top{top:-17px}.store-hero{min-height:205px}.store-hero-side{display:none}.store-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.store-cover{min-height:100px}.store-card-body{padding:10px}.store-card h3{font-size:12px}}
 @media(max-width:430px){.store-grid{grid-template-columns:1fr}.store-hero h1{font-size:27px}}
 /* Animated game-store artwork: slow ambient gradients and decorative geometry. */
 @keyframes storeAurora{0%,100%{background-position:0% 50%,100% 50%}50%{background-position:100% 50%,0% 50%}}
 @keyframes storeOrbit{0%,100%{transform:translate3d(0,0,0) rotate(28deg)}50%{transform:translate3d(-12px,8px,0) rotate(43deg)}}
 @keyframes storeCoverDrift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
 @keyframes storeRingPulse{0%,100%{opacity:.35;transform:scale(.94)}50%{opacity:.8;transform:scale(1.08)}}
 @keyframes storeTextShimmer{0%{background-position:180% 0}100%{background-position:-180% 0}}
 .store-main{background-image:radial-gradient(ellipse at 84% -12%,#1b2540 0,transparent 34%),radial-gradient(ellipse at 12% 35%,#17132b55 0,transparent 35%),linear-gradient(120deg,#0b0e13,#0c1018,#0b0e13);background-size:100% 100%,180% 180%,220% 220%;animation:storeAurora 30s ease-in-out infinite}
 .store-hero{background-image:radial-gradient(ellipse at 88% 15%,#51468a55,transparent 36%),linear-gradient(112deg,#19243a 0%,#151a28 56%,#201d3a 100%),linear-gradient(120deg,#19243a,#28234a,#19243a);background-size:180% 180%,100% 100%,220% 220%;animation:storeAurora 22s ease-in-out infinite}
 .store-hero:before{animation:storeOrbit 18s ease-in-out infinite}
 .store-hero:after{animation:storeRingPulse 7s ease-in-out infinite}
 .store-cover{background-image:radial-gradient(ellipse at 82% 14%,#ffffff24,transparent 35%),linear-gradient(var(--cover-angle,135deg),var(--cover-a,#202c40),var(--cover-b,#141923),var(--cover-a,#202c40));background-size:150% 150%,220% 220%;animation:storeCoverDrift var(--cover-speed,18s) ease-in-out var(--cover-delay,0ms) infinite}
 .store-cover:before{animation:storeOrbit var(--cover-speed,14s) ease-in-out var(--cover-delay,0ms) infinite}
 .store-cover[data-skin="0"]:before{border-radius:50%;transform:rotate(0deg)}
 .store-cover[data-skin="1"]:before{border-radius:2px;clip-path:polygon(50% 0,100% 100%,0 100%)}
 .store-cover[data-skin="2"]:before{border-radius:50% 4px 50% 4px;transform:rotate(45deg)}
 .store-cover[data-skin="3"]:before{border-radius:0;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}
 .store-cover[data-skin="4"]:before{border-radius:50%;box-shadow:0 0 0 12px #ffffff08,0 0 35px var(--cover-a)}
 .store-cover[data-skin="5"]:before{border-radius:10px 50% 10px 50%;transform:rotate(-20deg)}
 .store-cover[data-skin="0"]:after{right:15%;bottom:-35px;width:92px;height:92px}
 .store-cover[data-skin="1"]:after{border-radius:4px;transform:rotate(45deg)}
 .store-cover[data-skin="2"]:after{width:46px;height:46px;right:42px}
 .store-cover[data-skin="3"]:after{border-radius:0;transform:rotate(45deg)}
 .store-cover[data-skin="4"]:after{width:100px;height:100px;right:-10px;bottom:-65px}
 .store-cover[data-skin="5"]:after{border-radius:50% 0 50% 0;transform:rotate(-25deg)}
 .store-cover:after{animation:storeRingPulse 8s ease-in-out infinite}
 .store-card{animation:loliteRiseIn .34s ease-out both}
 .store-card:nth-child(4n+2){animation-delay:.035s}.store-card:nth-child(4n+3){animation-delay:.07s}.store-card:nth-child(4n+4){animation-delay:.105s}
 .store-card:hover .store-cover:before{animation-duration:5s}
 .store-primary,.store-play,.store-nav button,.store-section-head button{transition:transform .18s ease,background .2s,border-color .2s,box-shadow .2s}
 .store-primary:hover,.store-play:hover,.store-section-head button:hover{transform:translateY(-2px);box-shadow:0 7px 20px #7066e52a}
 .store-nav button .nav-mark{transition:transform .18s ease,background .18s}
 .store-nav button:hover .nav-mark{transform:translateX(2px)}
 .store-search{transition:border-color .18s,box-shadow .18s}
 .store-player-head button{transition:background .18s,transform .18s}
 .store-player-head button:hover{transform:translateY(-1px)}
 @media(prefers-reduced-motion:reduce){.store-main,.store-hero,.store-hero:before,.store-hero:after,.store-cover,.store-cover:before,.store-cover:after,.store-card{animation:none!important;transition:none!important}}
 .store-featured-hero{min-height:345px;align-items:flex-end;background:linear-gradient(90deg,#080b12ed 0%,#080b12c9 43%,#080b1250 100%),radial-gradient(ellipse at 85% 20%,#5449a855,transparent 40%),linear-gradient(115deg,#19243a,#201d3a);background-size:cover;background-position:center;transition:background-image .35s ease;isolation:isolate}
 .store-featured-hero:before{right:10%;top:-80px;width:250px;height:250px;z-index:0}
 .store-featured-hero:after{content:''}
 .store-featured-hero.has-feature-art{background-image:linear-gradient(90deg,#070910f2 0%,#070910d9 34%,#07091065 65%,#07091024 100%),var(--hero-art);background-position:center,center 36%;background-size:cover,cover}
 .store-hero-art{display:none}
 .store-hero-copy{position:relative;z-index:2;max-width:620px}
 .store-featured-hero h1{font-size:clamp(32px,4vw,52px);margin:14px 0 10px;letter-spacing:-1.8px}
 .store-featured-hero p{max-width:500px;color:#e1e5ee;font-size:14px;line-height:1.65}
 .store-featured-hero .store-primary{border-color:#fff;background:#fff;color:#10131b;padding:11px 18px}
 .store-featured-hero .store-primary:hover{background:#e7e9ff}
 .store-featured-hero .store-hero-side{align-self:flex-start}
 .store-hero-dots{display:flex;align-items:center;gap:8px;margin-top:25px}
 .store-hero-dots button{width:7px;height:7px;padding:0;border:0;border-radius:99px;background:#ffffff66;cursor:pointer;transition:width .2s ease,background .2s ease}
 .store-hero-dots button.active{width:25px;background:#fff}
 .store-hero-dots button:focus-visible{outline:2px solid white;outline-offset:4px}
 @media(max-width:760px){.store-featured-hero{min-height:300px}.store-featured-hero .store-hero-side{display:none}.store-featured-hero h1{font-size:32px}.store-hero-dots{margin-top:19px}}


 `;
 if(!document.getElementById('lolite-game-store-style')){const s=document.createElement('style');s.id='lolite-game-store-style';document.head.appendChild(s)}document.getElementById('lolite-game-store-style').textContent=CSS;
 function lolitePosterArt(title,seed='Lolite'){const safe=String(title||'Game').replace(/[&<>]/g,' ').slice(0,42);let h=0;for(const c of String(seed+title))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;const hue=h%360,hue2=(hue+70+(h%90))%360;const svg="<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='hsl("+hue+",65%,32%)'/><stop offset='1' stop-color='hsl("+hue2+",58%,10%)'/></linearGradient><radialGradient id='glow'><stop stop-color='white' stop-opacity='.34'/><stop offset='1' stop-color='white' stop-opacity='0'/></radialGradient></defs><rect width='1200' height='675' fill='url(#bg)'/><circle cx='900' cy='180' r='330' fill='url(#glow)'/><g fill='none' stroke='white' stroke-opacity='.18' stroke-width='3'><circle cx='930' cy='330' r='205'/><circle cx='930' cy='330' r='150'/><path d='M620 500 L850 70 L1120 510 Z'/><path d='M700 0 L1200 500 M800 0 L1200 400'/></g><rect x='62' y='70' width='11' height='535' rx='5' fill='white' fill-opacity='.8'/><text x='105' y='125' font-family='Arial,sans-serif' font-size='24' font-weight='700' letter-spacing='8' fill='white' fill-opacity='.76'>LOLITE GAME LIBRARY</text><text x='100' y='475' font-family='Arial,sans-serif' font-size='68' font-weight='800' fill='white'>"+safe.replace(/['"]/g,'')+"</text><text x='105' y='530' font-family='Arial,sans-serif' font-size='22' letter-spacing='5' fill='white' fill-opacity='.7'>READY TO PLAY</text><path d='M1030 500 l45 -26 v52 z' fill='white' fill-opacity='.88'/></svg>";return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}
 const manifest=['clangrybirds2.html','clbadmondaysimulator.html','clbaldicaseoh.html','clbaldisbasics.html','clbaldisbasicsremaster.html','clbitlife.html','clblockblast.html','clcookieclicker.html','clcookieclickermodmenu.html','clcrazycars.html','clcuttherope.html','cldemolitionderbycrashracing.html','cldungeonsanddegenerategambler.html','clescaperoad.html','clescaperoad-2.html','clescaperoad3.html','clfallguys.html','clfireboyandwatergirl2.html','clfireboyandwatergirl3.html','clFNAF.html','clFNAF2.html','clFNAF3.html','clFNAF4.html','clgdbreeze.html','clgorillatag.html','clgranny2.html','clgranny22.html','clgranny3.html','clgrannycreepy.html','clgrannynightmare.html','clgrannyy.html','clgrowagarden.html','clgta3.html','clhalflife.html','clholeio.html','clinfinitecraft.html','clLobotemyDash.html','lolite-2048.html','lolite-pong.html','lolite-sokoban.html','clmario64webgl.html','clmelonplayground.html','clminecraftpocketedition.html','clmotox3m2.html','clmotox3m3.html','clmotox3mm.html','clmotox3mpoolparty.html','clmotox3mspookyland.html','clmotox3mwinter.html','closu.html','clovo2.html','clovodimensions.html','clovofixed.html','clpaperio.html','clpaperio3d.html','clpaperiomania.html','clparkingfury.html','clparkingfury2.html','clparkingfury3.html','clpixelbattlegroundsio.html','clpvz2gardenless.html','PVZM.html','clragollhit.html','clRedBall4.html','clrocketleague.html','clshiftatmidnight.html','slope.html','slope-2-player.html','clslopeplus.html','clsmbremastered.html','clsnowrider.html','clspacewarsbattleground.html','clstickmanhook.html','clsubwaysurfersmiami.html','clsupermariobros.html','clsurvivorio.html','cltemplerun2.html','cltinyfishing.html','clvex3.html','wheely.html','wrestle-bros.html','zombie-rush.html'];
 const pretty=raw=>{const key=raw.replace(/^cl/i,'').replace(/^lolite[-_]/i,'').replace(/\.html?$/i,'').toLowerCase();const known={'angrybirds2':'Angry Birds 2','baldisbasics':'Baldi’s Basics','baldisbasicsremaster':'Baldi’s Basics Remastered','baldicaseoh':'Baldi’s Basics: CaseOh','badmondaysimulator':'Bad Monday Simulator','bitlife':'BitLife','blockblast':'Block Blast','cookieclicker':'Cookie Clicker','cookieclickermodmenu':'Cookie Clicker Mod Menu','crazycars':'Crazy Cars','cuttherope':'Cut the Rope','demolitionderbycrashracing':'Demolition Derby Crash Racing','dungeonsanddegenerategambler':'Dungeons and Degenerate Gamblers','escaperoad':'Escape Road','escaperoad-2':'Escape Road 2','escaperoad3':'Escape Road 3','fallguys':'Fall Guys','fireboyandwatergirl2':'Fireboy and Watergirl 2','fireboyandwatergirl3':'Fireboy and Watergirl 3','fnaf':'Five Nights at Freddy’s','fnaf2':'Five Nights at Freddy’s 2','fnaf3':'Five Nights at Freddy’s 3','fnaf4':'Five Nights at Freddy’s 4','gdbreeze':'Geometry Dash Breeze','gorillatag':'Gorilla Tag','granny2':'Granny 2','granny22':'Granny 2.2','granny3':'Granny 3','grannycreepy':'Granny: Creepy Mod','grannynightmare':'Granny: Nightmare','grannyy':'Granny','growagarden':'Grow a Garden','gta3':'Grand Theft Auto III','halflife':'Half-Life','holeio':'Hole.io','infinitecraft':'Infinite Craft','lobotemydash':'Lobotomy Dash','minecraftpocketedition':'Minecraft: Pocket Edition','melonplayground':'Melon Playground','motox3m':'Moto X3M','motox3m2':'Moto X3M 2','motox3m3':'Moto X3M 3','motox3mpoolparty':'Moto X3M Pool Party','motox3mspookyland':'Moto X3M Spooky Land','motox3mwinter':'Moto X3M Winter','ovo2':'OvO 2','ovodimensions':'OvO Dimensions','ovofixed':'OvO','paperio':'Paper.io','paperio3d':'Paper.io 3D','paperiomania':'Paper.io Mania','parkingfury':'Parking Fury','parkingfury2':'Parking Fury 2','parkingfury3':'Parking Fury 3','pixelbattlegroundsio':'Pixel Battlegrounds.io','pvz2gardenless':'Plants vs. Zombies 2: Gardenless','ragollhit':'Ragdoll Hit','redball4':'Red Ball 4','rocketleague':'Rocket League','shiftatmidnight':'Shift at Midnight','slope-2-player':'Slope 2 Player','slopeplus':'Slope Plus','smbremastered':'Super Mario Bros. Remastered','snowrider':'Snow Rider','spacewarsbattleground':'Space Wars Battleground','stickmanhook':'Stickman Hook','subwaysurfersmiami':'Subway Surfers: Miami','supermariobros':'Super Mario Bros.','survivorio':'Survivor.io','templerun2':'Temple Run 2','tinyfishing':'Tiny Fishing','wrestle-bros':'Wrestle Bros'};if(known[key])return known[key];let s=raw.replace(/^cl/i,'').replace(/^lolite[-_]/i,'').replace(/\.html?$/i,'').replace(/[_-]+/g,' ');s=s.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Za-z])([0-9])/g,'$1 $2').replace(/\s+/g,' ').trim().replace(/\b\w/g,m=>m.toUpperCase());return s.replace(/\bPvz\b/gi,'PVZ').replace(/\bFnaf\b/gi,'FNAF').replace(/\bGta\b/gi,'GTA').replace(/\bIo\b/gi,'IO')};
 const categorize=g=>{const f=g.file.toLowerCase();if(/baldi/.test(f))return 'Baldi’s Basics';if(/fnaf|granny|nightmare|zombie|shiftatmidnight|badmondaysimulator/.test(f))return 'Horror';if(/crazycars|racing|moto|slope|escaperoad|parking|rocketleague|derby|wheely|snowrider/.test(f))return 'Racing';if(/2048|sokoban|blockblast|cookie|cuttherope|fireboy|infinitecraft|ovo|paperio|stickmanhook|tinyfishing/.test(f))return 'Puzzle';if(/growagarden|holeio|pixelbattlegrounds|survivorio|paperio|bitlife|fallguys/.test(f))return 'IO & Casual';if(/minecraft|melonplayground|bitlife|infinitecraft|dungeonsanddegenerategambler|halflife|gta3/.test(f))return 'Simulation & Sandbox';if(/fishing|wrestle|gorilla|football|basketball|sports/.test(f))return 'Sports';if(/mario|angrybirds|pvz|subway|templerun|vex|redball|fireboy|stickman|lobotemy|gd|supermario/.test(f))return 'Platformers & Arcade';return 'Classics'};
 const categoryNames=['All Games','Featured','Popular Games','IO & Casual','Baldi’s Basics','Horror','Racing','Puzzle','Platformers & Arcade','Simulation & Sandbox','Sports','Classics'];
 const navMarks={'All Games':'ALL','Featured':'★','Popular Games':'TOP','IO & Casual':'IO','Baldi’s Basics':'BB','Horror':'HR','Racing':'RACE','Puzzle':'PUZ','Platformers & Arcade':'PLAY','Simulation & Sandbox':'SIM','Sports':'SPRT','Classics':'CL'};
 // External browser port: preserve original game-data checks; no proprietary files are bundled.
 // The original HTML game stays in the repository, but the Minecraft shortcut now opens the requested 1.8 client.
 const minecraft18='https://eaglercraftextras.github.io/clients/1.8/eaglercraftx.html';
 const minecraftSource='https://github.com/x8rr/Eaglercraft-Extras';
 let games=manifest.map(file=>{
   const isMinecraft=file==='clminecraftpocketedition.html';
   return {file,title:isMinecraft?'Minecraft 1.8':window.loliteGameArt?.[file]?.title||pretty(file),
     url:isMinecraft?minecraft18:'html games/'+encodeURIComponent(file),
     category:categorize({file}),hosted:isMinecraft,source:isMinecraft?minecraftSource:undefined};
 });
 let active='Featured',query='';
 const isPopular=g=>/baldi|fnaf|granny|mario|angrybirds|pvz|minecraft|growagarden|slope|escaperoad|gta|cookieclicker/i.test(g.file);
 const matchesCategory=g=>active==='All Games'||active==='Featured'||active==='Popular Games'?true:g.category===active;
 const filtered=()=>games.filter(g=>matchesCategory(g)&&(!query||g.title.toLowerCase().includes(query.toLowerCase())||g.category.toLowerCase().includes(query.toLowerCase()))&&(active!=='Popular Games'||isPopular(g)));
 const coverPalette=g=>{let hash=0;for(const ch of g.file)hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;const hue=hash%360,hue2=(hue+48+(hash%73))%360;return [`hsl(${hue} 62% 28%)`,`hsl(${hue2} 48% 13%)`,`${12+(hash%13)}s`,String(hash%6),`-${hash%17000}ms`]};
 const card=g=>{const colors=coverPalette(g);const poster=lolitePosterArt(g.title,g.file);return '<article class="store-card"><div class="store-cover has-game-art" data-game-file="'+g.file+'" data-skin="'+colors[3]+'" style="--cover-a:'+colors[0]+';--cover-b:'+colors[1]+';--cover-speed:'+colors[2]+';--cover-delay:'+colors[4]+'" onmouseenter=\'window.loliteStorePreview(this,"'+g.file+'","'+g.title.replace(/"/g,'&quot;')+'")\' onfocus=\'window.loliteStorePreview(this,"'+g.file+'","'+g.title.replace(/"/g,'&quot;')+'")\'><div class="store-cover-art" style="background-image:url(&quot;'+poster+'&quot;)" aria-hidden="true"></div><span class="store-cover-label">'+g.category+'</span><strong class="store-cover-title">'+g.title+'</strong></div><div class="store-card-body"><h3 title="'+g.title+'">'+g.title+'</h3><div class="store-card-meta"><span class="store-tag">'+g.category+'</span><span>'+(g.hosted?'Minecraft 1.8 · Hosted client':'In library')+'</span></div><button class="store-play" type="button" title="'+(g.hosted?'Launch Minecraft 1.8 inside Lolite OS':'Launch inside Lolite OS')+'" onclick=\'window.loliteStorePlay("'+g.file+'")\'>'+'Play game'+' <span aria-hidden="true">↗</span></button>'+(g.hosted?'<p class="store-external-note">EaglercraftX 1.8 from <a href="https://github.com/x8rr/Eaglercraft-Extras" target="_blank" rel="noopener noreferrer">Eaglercraft Extras ↗</a>. Playable in Lolite without bundling game files.</p>':'')+(g.recommended?'<div style="margin-top:10px;padding:9px;border:1px solid #4a4773;border-radius:7px;background:#211f38;color:#d9d5ff;font-size:11px;line-height:1.5"><strong>Recommended:</strong> turn on hardware acceleration for smoother performance.<button type="button" class="store-play" style="margin-top:8px" onclick="window.loliteOpenAccelerationGuide()">Learn more</button></div>':'')+'</div></article>'};
 /* Game artwork: individually curated image URLs keyed to the actual game file.
    No Wikipedia fuzzy searches, no stale localStorage art cache, no cross-title borrowing. */
 const coverFor=file=>window.loliteGameArt?.[file]?.src||null;
 // Never bulk preload ~80 remote game covers: visible artwork takes priority.
 const artCache=new Map();
 window.loliteStorePreview=(el,file,title)=>{
    if(!el || el.dataset.artLoading==='1' || el.dataset.artLoaded==='1')return;
    const target=el.querySelector('.store-cover-art');
    if(!target)return;
    const url=coverFor(file);
    if(!url){el.dataset.artLoaded='1';return}
    // Keep the per-game SVG poster visible if a remote image cannot load.
    const previous=artCache.get(url);
    if(previous?.failed && Date.now()-previous.time<60000){
      el.dataset.artLoaded='fallback';
      return;
    }
    if(el.dataset.artLoaded==='fallback' && Date.now()-Number(el.dataset.lastArtAttempt||0)<60000)return;
    el.dataset.artLoading='1';
    el.dataset.lastArtAttempt=String(Date.now());
    const image=new Image();
    image.decoding='async';
    let settled=false;
    const complete=()=>{
      if(settled)return false;
      settled=true;
      clearTimeout(timer);
      delete el.dataset.artLoading;
      return true;
    };
    const timer=setTimeout(()=>{
      if(!complete())return;
      image.onload=null;
      image.onerror=null;
      artCache.set(url,{failed:true,time:Date.now()});
      el.dataset.artLoaded='fallback';
    },12000);
    image.onload=()=>{
      if(!complete())return;
      if(!image.naturalWidth||!image.naturalHeight){
        artCache.set(url,{failed:true,time:Date.now()});
        el.dataset.artLoaded='fallback';
        return;
      }
      artCache.delete(url);
      if(el.isConnected){
        const square=image.naturalWidth/image.naturalHeight<1.25;
        target.style.backgroundImage='url('+JSON.stringify(url)+')';
        target.style.backgroundSize=square?'contain':'cover';
        target.style.backgroundRepeat='no-repeat';
        target.style.backgroundColor=square?'transparent':'#111720';
        if(square){
          let backdrop=el.querySelector('.store-cover-art-backdrop');
          if(!backdrop){
            backdrop=document.createElement('div');
            backdrop.className='store-cover-art-backdrop';
            target.before(backdrop);
          }
          backdrop.style.backgroundImage='url('+JSON.stringify(url)+')';
        }
      }
      el.dataset.artLoaded='1';
    };
    image.onerror=()=>{
      if(!complete())return;
      artCache.set(url,{failed:true,time:Date.now()});
      el.dataset.artLoaded='fallback';
    };
    image.src=url;
  };
  const featuredGames=[{file:'clminecraftpocketedition.html',title:'Minecraft 1.8',description:'EaglercraftX browser edition, hosted by Eaglercraft Extras. Build, explore and play right inside Lolite OS.'},{file:'clbaldisbasics.html',title:'Baldi’s Basics',description:'A weird school trip turns into a frantic arcade-style escape.'},{file:'clangrybirds2.html',title:'Angry Birds 2',description:'Take aim, test your timing, and topple the towers in this colourful classic.'},{file:'clsubwaysurfersmiami.html',title:'Subway Surfers: Miami',description:'Dash through the city, dodge obstacles, and chase your next high score.'},{file:'clmotox3mm.html',title:'Moto X3M',description:'Race through wild obstacle courses and nail the timing to reach the finish.'}];
 let heroIndex=0;
 function heroMarkup(){const g=featuredGames[heroIndex%featuredGames.length];return '<section class="store-hero store-featured-hero" id="store-featured-hero" data-feature-file="'+g.file+'"><div class="store-hero-art" aria-hidden="true"></div><div class="store-hero-copy"><span class="store-eyebrow">'+'HARDWARE ACCELERATION RECOMMENDED'+'</span><h1>'+g.title+'</h1><p>'+g.description+'</p><button class="store-primary" type="button" onclick=\'window.loliteStorePlay("'+g.file+'")\'>'+'▶ &nbsp; Play now'+'</button><div class="store-hero-dots" role="tablist" aria-label="Featured games">'+featuredGames.map((item,i)=>'<button type="button" class="'+(i===heroIndex?'active':'')+'" aria-label="Show '+item.title.replace(/"/g,'&quot;')+'" aria-selected="'+(i===heroIndex)+'" onclick="window.loliteStoreHeroSelect('+i+')" title="'+item.title.replace(/"/g,'&quot;')+'"></button>').join('')+'</div></div><div class="store-hero-side"><strong>'+String(heroIndex+1).padStart(2,'0')+'</strong><span>FEATURED</span></div></section>'}
 async function loadHeroArt(){const hero=document.getElementById('store-featured-hero');if(!hero)return;const g=featuredGames[heroIndex%featuredGames.length];const poster=lolitePosterArt(g.title,g.file);hero.style.setProperty('--hero-art','url(\"'+poster+'\")');hero.classList.add('has-feature-art');try{const art=coverFor(g.file);if(!art||!hero.isConnected||hero.dataset.featureFile!==g.file)return;const img=new Image();img.onload=()=>{if(hero.isConnected&&hero.dataset.featureFile===g.file){hero.style.setProperty('--hero-art','url("'+art.replace(/"/g,'%22')+'")');hero.classList.add('has-feature-art');hero.classList.toggle('store-featured-square',img.naturalWidth/img.naturalHeight<1.25)}};img.src=art}catch(_){}}
 window.loliteStoreHeroSelect=index=>{heroIndex=(Number(index)+featuredGames.length)%featuredGames.length;const hero=document.getElementById('store-featured-hero');if(!hero)return;hero.outerHTML=heroMarkup();loadHeroArt()};
 setInterval(()=>{if(document.getElementById('store-featured-hero'))window.loliteStoreHeroSelect(heroIndex+1)},20000);
 const artworkObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;artworkObserver.unobserve(el);window.loliteStorePreview(el,el.dataset.gameFile,el.querySelector('.store-cover-title')?.textContent||'Game')}} ,{rootMargin:'900px 0px'});
 const artworkMutationObserver=new MutationObserver(()=>{const root=document.querySelector('.store-main');if(!root)return;root.querySelectorAll('.store-cover[data-game-file]').forEach(el=>{if(el.dataset.artObserved==='1')return;el.dataset.artObserved='1';artworkObserver.observe(el)})});
 const watchArtwork=()=>{const root=document.querySelector('.store-main');if(root&&root.dataset.artworkWatching!=='1'){root.dataset.artworkWatching='1';artworkMutationObserver.observe(root,{childList:true,subtree:true});root.querySelectorAll('.store-cover[data-game-file]').forEach(el=>{if(el.dataset.artObserved==='1')return;el.dataset.artObserved='1';artworkObserver.observe(el)})}};
 const storeFinder=new MutationObserver(watchArtwork);storeFinder.observe(document.documentElement,{childList:true,subtree:true});watchArtwork();
 const section=(title,list)=>list.length?'<section class="store-section"><div class="store-section-head"><div><h2>'+title+'</h2><p>'+list.length+' games to explore</p></div><button type="button" onclick=\'window.loliteStoreCategory("'+title+'")\'>View collection →</button></div><div class="store-grid">'+list.slice(0,8).map(card).join('')+'</div></section>':'';
 function render(){const root=document.querySelector('.store-main');if(!root)return;const top='<div class="store-top"><div class="store-search-wrap"><span class="store-search-mark" aria-hidden="true">⌕</span><input class="store-search" aria-label="Search games" placeholder="Search your library…" value="'+query.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" oninput="window.loliteStoreSearch(this.value)"></div><span class="store-count-pill">'+games.length+' titles</span></div>';
 if(query||!['Featured','All Games'].includes(active)){const list=filtered();root.innerHTML=top+'<section class="store-section"><div class="store-section-head"><div><h2>'+active+'</h2><p>'+list.length+' matching games</p></div></div>'+(list.length?'<div class="store-grid">'+list.map(card).join('')+'</div>':'<div class="store-empty">No games found. Try another title or category.</div>')+'</section>';return}
 if(active==='All Games'){root.innerHTML=top+'<section class="store-section"><div class="store-section-head"><div><h2>All games</h2><p>Every game in your Lolite library.</p></div></div><div class="store-grid">'+games.map(card).join('')+'</div></section>';return}
 root.innerHTML=top+heroMarkup()+section('Popular Games',games.filter(isPopular))+section('IO & Casual',games.filter(g=>g.category==='IO & Casual'))+section('Horror',games.filter(g=>g.category==='Horror'))+section('Racing',games.filter(g=>g.category==='Racing'))+section('Platformers & Arcade',games.filter(g=>g.category==='Platformers & Arcade'))+section('Puzzle',games.filter(g=>g.category==='Puzzle'));loadHeroArt()}
 function shell(){return '<div class="store"><aside class="store-side"><div class="store-brand">lolite<span>GAME LIBRARY</span></div><div><div class="store-nav-label">Browse library</div><nav class="store-nav">'+categoryNames.map(c=>'<button type="button" class="'+(active===c?'active':'')+'" data-category="'+c+'" aria-pressed="'+(active===c)+'" onclick=\'window.loliteStoreCategory("'+c+'")\'><span class="nav-mark" aria-hidden="true">'+navMarks[c]+'</span><span>'+c+'</span></button>').join('')+'</nav></div><div class="store-side-footer">LOLITE OS · GAME LIBRARY<br>One place for your collection.</div></aside><main class="store-main"><div class="store-empty">Loading your library…</div></main></div>'}
 window.loliteStoreCategory=c=>{if(!categoryNames.includes(c)&&!['IO Games','Arcade','IO & Casual'].includes(c))return;active=c;query='';document.querySelectorAll('.store-nav button').forEach(b=>{const on=b.dataset.category===c;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});render()};
 window.loliteStoreSearch=q=>{query=q;render()};
 window.loliteStorePlay=file=>{const game=games.find(g=>g.file===file);if(!game)return;const id='store-game-'+file.replace(/[^a-z0-9]/gi,'').slice(0,24);openApp(id,game.title,1000,720);let tries=0;const fill=()=>{const c=state.windows[id]?.el.querySelector('.content');if(!c){if(++tries<40)setTimeout(fill,25);return}c.innerHTML='<div class="store-player"><div class="store-player-head"><strong>'+game.title+'</strong><div class="store-player-actions"><button type="button" class="store-fullscreen-icon" aria-label="Toggle fullscreen; press Escape to exit" title="Fullscreen · press Esc to exit" onclick=\'window.loliteStoreFullscreen("'+id+'")\'>⛶</button><button type="button" onclick=\'window.loliteStoreOpenSeparate("'+game.url+'")\'>Open separately ↗</button></div></div>'+'<iframe class="store-frame" title="'+game.title+'" src="'+game.url+'" allow="fullscreen; gamepad; autoplay; pointer-lock" allowfullscreen loading="eager"></iframe></div>'};fill()};

 window.loliteOpenAccelerationGuide=()=>{const id='browser-acceleration-guide';openApp(id,'Hardware Acceleration Guide',760,650);let tries=0;const fill=()=>{const c=state.windows[id]?.el.querySelector('.content');if(!c){if(++tries<40)setTimeout(fill,25);return}c.innerHTML='<div style="height:100%;overflow:auto;padding:24px;background:#0c1018;color:#eef2f8;font:14px/1.6 Segoe UI,Arial,sans-serif;border-radius:10px"><div style="color:#a9a3ff;font-size:11px;font-weight:700;letter-spacing:2px">LOLITE HELP</div><h1 style="margin:8px 0;font-size:27px">Hardware acceleration</h1><p style="color:#b5c0d0;margin:0 0 18px">Choose the browser you use to see the right steps. Hardware acceleration lets the browser use your graphics hardware for supported tasks and may improve game performance.</p><div id="accel-browser-list" style="display:flex;flex-wrap:wrap;gap:8px;margin:18px 0">'+['Brave','Opera GX','Firefox','Chrome','Safari'].map(b=>'<button type="button" data-browser="'+b+'" onclick=\'window.loliteShowAccelerationSteps("'+b+'")\' style="padding:10px 14px;border:1px solid #38445a;border-radius:8px;background:#171f2d;color:#eef2f8;cursor:pointer">'+b+'</button>').join('')+'</div><section id="accel-steps" style="padding:18px;border:1px solid #2c3749;border-radius:10px;background:#111823"><h2 style="margin:0 0 8px;font-size:18px">Select your browser</h2><p style="margin:0;color:#9daabd">The instructions will appear here.</p></section><p style="margin-top:18px;color:#8c99ac;font-size:12px">Tip: restart the browser after changing a setting. The exact wording can vary by version. Hardware acceleration may not be available on managed devices.</p></div>'};fill()};
 window.loliteShowAccelerationSteps=browser=>{const section=document.getElementById('accel-steps');if(!section)return;const steps={
 'Brave':{title:'Turn on hardware acceleration in Brave',items:['Open Brave and enter brave://settings/system in the address bar.','Turn on “Use graphics acceleration when available”.','Select Relaunch to restart Brave.']},
 'Opera GX':{title:'Turn on hardware acceleration in Opera GX',items:['Open Opera GX Settings (Alt+P on Windows).','Search settings for “hardware acceleration” or open the System section.','Turn on “Use graphics acceleration when available”, then relaunch Opera GX.']},
 'Firefox':{title:'Turn on hardware acceleration in Firefox',items:['Open Settings, then General.','Scroll to Performance. If “Use recommended performance settings” is checked, Firefox chooses the acceleration setting automatically.','To control it manually, untick that option and tick “Use hardware acceleration when available”.','Restart Firefox if prompted.']},
 'Chrome':{title:'Turn on hardware acceleration in Chrome',items:['Open chrome://settings/system in the address bar.','Turn on “Use graphics acceleration when available” (wording may vary).','Select Relaunch to restart Chrome.']},
 'Safari':{title:'Safari on macOS',items:['Safari manages graphics acceleration automatically; it does not provide a general hardware-acceleration on/off switch.','Update macOS and Safari, then close other demanding apps if performance is poor.','For best results, keep your Mac plugged in when appropriate and make sure the website is allowed to run JavaScript.']}
 };const data=steps[browser];if(!data)return;document.querySelectorAll('#accel-browser-list button').forEach(btn=>{const active=btn.dataset.browser===browser;btn.style.background=active?'#4d458f':'#171f2d';btn.style.borderColor=active?'#958aff':'#38445a'});section.innerHTML='<h2 style="margin:0 0 12px;font-size:18px">'+data.title+'</h2><ol style="padding-left:22px;margin:0;color:#d0d8e5">'+data.items.map(x=>'<li style="margin:0 0 10px">'+x+'</li>').join('')+'</ol>'};

 window.loliteStoreFullscreen=async id=>{
   const root=state.windows[id]?.el.querySelector('.content .store-player');if(!root)return;
   try{
     const active=document.fullscreenElement||document.webkitFullscreenElement;
     if(active===root){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);}
     else{const request=root.requestFullscreen||root.webkitRequestFullscreen;if(!request){toast('This browser does not support fullscreen.');return;}await request.call(root);}
   }catch(error){console.error('Game fullscreen failed',error);toast('Game fullscreen could not start. Try again or open the game separately.');}
 };
 const syncGameFullscreen=()=>{
   const active=document.fullscreenElement||document.webkitFullscreenElement;
   document.querySelectorAll('.store-player').forEach(root=>{
     const on=active===root;
     root.classList.toggle('store-player-fullscreen',on);
     const button=root.querySelector('.store-fullscreen-icon');
     if(button){button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'Exit game fullscreen':'Fullscreen game');button.title=on?'Exit fullscreen · press Esc':'Fullscreen';}
   });
   document.body.classList.toggle('lolite-game-fullscreen',!!active?.classList.contains('store-player'));
 };
 document.addEventListener('fullscreenchange',syncGameFullscreen);
 document.addEventListener('webkitfullscreenchange',syncGameFullscreen);
 window.loliteStoreOpenSeparate=url=>window.open(url,'_blank','noopener,noreferrer');
 window.lolitePlayMinecraft=()=>window.loliteStorePlay('clminecraftpocketedition.html');
 const oldPage=window.page;window.page=function(id){if(id==='games'){setTimeout(render,0);return shell()}return oldPage(id)};
})();