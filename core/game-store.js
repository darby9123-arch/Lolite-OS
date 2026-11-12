/* Lolite OS 3.7.0 — reliable local cover art plus optional remote artwork */
(()=>{
 const CSS=`
 .store-wallet{border:1px solid #358489;border-radius:8px;background:#123943;color:#abf5e8;font-size:11px!important;font-weight:850;padding:10px 12px;white-space:nowrap;cursor:pointer}.store-wallet:hover{background:#205361}
 @media(max-width:760px){.store-wallet{white-space:normal;width:100%}.store-top{flex-wrap:wrap}}

 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
 .store{display:grid;grid-template-columns:226px minmax(0,1fr);height:calc(100% + 40px);min-height:0;margin:-20px;background:#0b0e13;color:#eef2f8;overflow:hidden;font-family:'DM Sans','Segoe UI',sans-serif;letter-spacing:0}
 .store *{box-sizing:border-box}.store button,.store input{font:inherit}.store-side{display:flex;flex-direction:column;gap:22px;background:#0d1118;border-right:1px solid #202834;padding:23px 14px;min-width:0;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-color:#39465b transparent}
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
 .store-cover-picture{width:100%;height:100%;display:block;object-fit:cover;object-position:center;pointer-events:none}
 .store-cover-picture.is-square{object-fit:contain}
 .store-cover-art{background-image:none!important}

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
 .store-main{background-image:radial-gradient(ellipse at 84% -12%,#1b2540 0,transparent 34%),radial-gradient(ellipse at 12% 35%,#17132b55 0,transparent 35%),linear-gradient(120deg,#0b0e13,#0c1018,#0b0e13);background-size:100% 100%,180% 180%,220% 220%;animation:none}
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
 .store-hero-game-logo{display:block;width:72px;height:72px;object-fit:contain;border-radius:16px;box-shadow:0 6px 20px #0008;margin-bottom:11px;filter:drop-shadow(0 3px 7px #0006)}
 @media(max-width:760px){.store-hero-game-logo{width:54px;height:54px;border-radius:12px}}
 .store-hero-dots{display:flex;align-items:center;gap:8px;margin-top:25px}
 .store-hero-dots button{width:7px;height:7px;padding:0;border:0;border-radius:99px;background:#ffffff66;cursor:pointer;transition:width .2s ease,background .2s ease}
 .store-hero-dots button.active{width:25px;background:#fff}
 .store-hero-dots button:focus-visible{outline:2px solid white;outline-offset:4px}
 @media(max-width:760px){.store-featured-hero{min-height:300px}.store-featured-hero .store-hero-side{display:none}.store-featured-hero h1{font-size:32px}.store-hero-dots{margin-top:19px}}


 `;
 if(!document.getElementById('lolite-game-store-style')){const s=document.createElement('style');s.id='lolite-game-store-style';document.head.appendChild(s)}document.getElementById('lolite-game-store-style').textContent=CSS;
 function posterForGame(game){
  return game?.ugsEntry&&window.LoliteUGSPresentation?.poster
   ?window.LoliteUGSPresentation.poster(game)
   :lolitePosterArt(game?.title||'Game',game?.file||'Lolite');
 }
 function lolitePosterArt(title,seed='Lolite'){const safe=String(title||'Game').replace(/[&<>]/g,' ').slice(0,42);let h=0;for(const c of String(seed+title))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;const hue=h%360,hue2=(hue+70+(h%90))%360;const svg="<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='hsl("+hue+",65%,32%)'/><stop offset='1' stop-color='hsl("+hue2+",58%,10%)'/></linearGradient><radialGradient id='glow'><stop stop-color='white' stop-opacity='.34'/><stop offset='1' stop-color='white' stop-opacity='0'/></radialGradient></defs><rect width='1200' height='675' fill='url(#bg)'/><circle cx='900' cy='180' r='330' fill='url(#glow)'/><g fill='none' stroke='white' stroke-opacity='.18' stroke-width='3'><circle cx='930' cy='330' r='205'/><circle cx='930' cy='330' r='150'/><path d='M620 500 L850 70 L1120 510 Z'/><path d='M700 0 L1200 500 M800 0 L1200 400'/></g><rect x='62' y='70' width='11' height='535' rx='5' fill='white' fill-opacity='.8'/><text x='105' y='125' font-family='Arial,sans-serif' font-size='24' font-weight='700' letter-spacing='8' fill='white' fill-opacity='.76'>LOLITE GAME LIBRARY</text><text x='100' y='475' font-family='Arial,sans-serif' font-size='68' font-weight='800' fill='white'>"+safe.replace(/['"]/g,'')+"</text><text x='105' y='530' font-family='Arial,sans-serif' font-size='22' letter-spacing='5' fill='white' fill-opacity='.7'>READY TO PLAY</text><path d='M1030 500 l45 -26 v52 z' fill='white' fill-opacity='.88'/></svg>";return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)}
 const manifest=['Geometry Dash webport.html','Drift-Hunters.html','Grand Theft Auto Vice City.html','clangrybirds2.html','clbadmondaysimulator.html','clbaldicaseoh.html','clbaldisbasics.html','clbaldisbasicsremaster.html','clbitlife.html','clblockblast.html','clcookieclicker.html','clcookieclickermodmenu.html','clcrazycars.html','clcuttherope.html','cldemolitionderbycrashracing.html','cldungeonsanddegenerategambler.html','clescaperoad.html','clescaperoad-2.html','clescaperoad3.html','clfallguys.html','clfireboyandwatergirl2.html','clfireboyandwatergirl3.html','clFNAF.html','clFNAF2.html','clFNAF3.html','clFNAF4.html','clgdbreeze.html','clgorillatag.html','clgranny2.html','clgranny22.html','clgranny3.html','clgrannycreepy.html','clgrannynightmare.html','clgrannyy.html','clgrowagarden.html','clgta3.html','clhalflife.html','clholeio.html','clinfinitecraft.html','clLobotemyDash.html','lolite-2048.html','lolite-pong.html','lolite-sokoban.html','clmario64webgl.html','clmelonplayground.html','clminecraftpocketedition.html','clmotox3m2.html','clmotox3m3.html','clmotox3mm.html','clmotox3mpoolparty.html','clmotox3mspookyland.html','clmotox3mwinter.html','closu.html','clovo2.html','clovodimensions.html','clovofixed.html','clpaperio.html','clpaperio3d.html','clpaperiomania.html','clparkingfury.html','clparkingfury2.html','clparkingfury3.html','clpixelbattlegroundsio.html','clpvz2gardenless.html','PVZM.html','clragollhit.html','clRedBall4.html','clrocketleague.html','clshiftatmidnight.html','slope.html','slope-2-player.html','clslopeplus.html','clsmbremastered.html','clsnowrider.html','clspacewarsbattleground.html','clstickmanhook.html','clsubwaysurfersmiami.html','clsupermariobros.html','clsurvivorio.html','cltemplerun2.html','cltinyfishing.html','clvex3.html','wheely.html','wrestle-bros.html','zombie-rush.html'];
 // Local HTML entrypoints under games/ that were missing from the Game Store.
 const builtInHtmlGames=[{"file":"local-2048-index.html","title":"2048 Classic","url":"games/2048/index.html"},{"file":"local-breakout-index.html","title":"Breakout","url":"games/breakout/index.html"},{"file":"local-connect-four-index.html","title":"Connect Four","url":"games/connect-four/index.html"},{"file":"local-life-rp-index.html","title":"Life RP","url":"games/life-rp/index.html"},{"file":"local-maze-index.html","title":"Maze","url":"games/maze/index.html"},{"file":"local-memory-puzzle-index.html","title":"Memory Puzzle","url":"games/memory-puzzle/index.html"},{"file":"local-minefield-index.html","title":"Minefield","url":"games/minefield/index.html"},{"file":"local-nibbles-index.html","title":"Nibbles","url":"games/nibbles/index.html"},{"file":"local-simon-index.html","title":"Simon","url":"games/simon/index.html"},{"file":"local-sliding-puzzle-index.html","title":"Sliding Puzzle","url":"games/sliding-puzzle/index.html"},{"file":"local-snake-index.html","title":"Snake","url":"games/snake/index.html"},{"file":"local-tetris-index.html","title":"Tetris","url":"games/tetris/index.html"},{"file":"local-tic-tac-toe-index.html","title":"Tic-Tac-Toe","url":"games/tic-tac-toe/index.html"},{"file":"local-world-sandbox-index.html","title":"World Sandbox","url":"games/world-sandbox/index.html"}];
 const pretty=raw=>{const key=raw.replace(/^cl/i,'').replace(/^lolite[-_]/i,'').replace(/\.html?$/i,'').toLowerCase();const known={'angrybirds2':'Angry Birds 2','baldisbasics':'Baldi’s Basics','baldisbasicsremaster':'Baldi’s Basics Remastered','baldicaseoh':'Baldi’s Basics: CaseOh','badmondaysimulator':'Bad Monday Simulator','bitlife':'BitLife','blockblast':'Block Blast','cookieclicker':'Cookie Clicker','cookieclickermodmenu':'Cookie Clicker Mod Menu','crazycars':'Crazy Cars','cuttherope':'Cut the Rope','demolitionderbycrashracing':'Demolition Derby Crash Racing','dungeonsanddegenerategambler':'Dungeons and Degenerate Gamblers','escaperoad':'Escape Road','escaperoad-2':'Escape Road 2','escaperoad3':'Escape Road 3','fallguys':'Fall Guys','fireboyandwatergirl2':'Fireboy and Watergirl 2','fireboyandwatergirl3':'Fireboy and Watergirl 3','fnaf':'Five Nights at Freddy’s','fnaf2':'Five Nights at Freddy’s 2','fnaf3':'Five Nights at Freddy’s 3','fnaf4':'Five Nights at Freddy’s 4','gdbreeze':'Geometry Dash Breeze','gorillatag':'Gorilla Tag','granny2':'Granny 2','granny22':'Granny 2.2','granny3':'Granny 3','grannycreepy':'Granny: Creepy Mod','grannynightmare':'Granny: Nightmare','grannyy':'Granny','growagarden':'Grow a Garden','gta3':'Grand Theft Auto III','grand theft auto vice city':'Grand Theft Auto: Vice City','halflife':'Half-Life','holeio':'Hole.io','infinitecraft':'Infinite Craft','lobotemydash':'Lobotomy Dash','minecraftpocketedition':'Minecraft: Pocket Edition','melonplayground':'Melon Playground','motox3m':'Moto X3M','motox3m2':'Moto X3M 2','motox3m3':'Moto X3M 3','motox3mpoolparty':'Moto X3M Pool Party','motox3mspookyland':'Moto X3M Spooky Land','motox3mwinter':'Moto X3M Winter','ovo2':'OvO 2','ovodimensions':'OvO Dimensions','ovofixed':'OvO','paperio':'Paper.io','paperio3d':'Paper.io 3D','paperiomania':'Paper.io Mania','parkingfury':'Parking Fury','parkingfury2':'Parking Fury 2','parkingfury3':'Parking Fury 3','pixelbattlegroundsio':'Pixel Battlegrounds.io','pvz2gardenless':'Plants vs. Zombies 2: Gardenless','ragollhit':'Ragdoll Hit','redball4':'Red Ball 4','rocketleague':'Rocket League','shiftatmidnight':'Shift at Midnight','slope-2-player':'Slope 2 Player','slopeplus':'Slope Plus','smbremastered':'Super Mario Bros. Remastered','snowrider':'Snow Rider','spacewarsbattleground':'Space Wars Battleground','stickmanhook':'Stickman Hook','subwaysurfersmiami':'Subway Surfers: Miami','supermariobros':'Super Mario Bros.','survivorio':'Survivor.io','templerun2':'Temple Run 2','tinyfishing':'Tiny Fishing','wrestle-bros':'Wrestle Bros'};if(known[key])return known[key];let s=raw.replace(/^cl/i,'').replace(/^lolite[-_]/i,'').replace(/\.html?$/i,'').replace(/[_-]+/g,' ');s=s.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Za-z])([0-9])/g,'$1 $2').replace(/\s+/g,' ').trim().replace(/\b\w/g,m=>m.toUpperCase());return s.replace(/\bPvz\b/gi,'PVZ').replace(/\bFnaf\b/gi,'FNAF').replace(/\bGta\b/gi,'GTA').replace(/\bIo\b/gi,'IO')};
 const categorize=g=>{
   if(/^-(?:3|b)$/i.test(String(g.title||'').trim())||/^-(?:3|b)\s*\(minus\s*(?:3|b)\)/i.test(String(g.title||'')))return 'Baldi’s Basics';
   const title=String(g.title||g.file||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'');
   const file=String(g.file||'').toLowerCase().replace(/^cl/,'').replace(/\.html?$/,'');
   const n=(title+' '+file).replace(/[_-]+/g,' ');
   const has=re=>re.test(n);
   // Baldi fan games often have titles that never mention Baldi.
   if(has(/baldi|raldi|epstein.*basics|caseoh.*basics|caseohs basics|antidisestablishmentari|\b69420\b|basic\s*9\s*re\s*take|breakdi(?:s)?\s*school/))return 'Baldi’s Basics';
   // Lolite's Geometry Dash collection includes every game with "dash" in its name.
   if(/dash/.test(title))return 'Geometry Dash';
   if(has(/friday night funkin|\bfnf\b|sprunki|incredibox|rhythm|piano|music|melody|geometry dash|\bosu\b|lobotomy dash|gd breeze|dance of fire and ice|rhythm heaven|trombone champion|just shapes|magic tiles/))return 'Music & Rhythm';
   if(has(/five nights|\bfnaf\b|granny|slender|backrooms|nightmare|horror|poppy playtime|creep|haunt|amanda the adventurer|fear assessment|\bscp\b|resident evil|the man from the window|shift at midnight|zombie|lethal company|fears to fathom|do not take this cat home|endoparasitic|slendytubbies|hungry lamu|bendy|miside|look outside|yandere simulator/))return 'Horror & Survival';
   if(has(/minecraft|terraria|sandbox|melon playground|people playground|powder toy|sandspiel|world sandbox|grow a garden|little alchemy|infinite craft|infinitecraft|eaglercraft|worldbox|physics sandbox|block craft|hypper sandbox|spaceflight simulator|line rider|line rider/))return 'Sandbox & Building';
   if(has(/\.io\b|paperio|holeio|pixelbattlegroundsio|\bmultiplayer\b|fall guys|stumble guys|agar io|slither io|survivorio|among us|gorilla tag|rooftop snipers|smash karts|bonk io|krunker|bloxd|1v1 lol/))return 'Multiplayer & .io';
   if(has(/\bfootball\b|\bsoccer\b|\bbasket\b|basketball|baseball|golf|tennis|wrestl|\bboxing\b|volley|hockey|\bsports\b|ping pong|pingpong|billiard|bowling|cricket|badminton|skateboard|snowboard|skiing|basket bros|football bros/))return 'Sports';
   if(has(/drive mad|drift|\brace\b|racing|racer|raceway|driving|moto x3m|motox3m|\bslope\b|escape road|escaperoad|parking fury|madalin|highway|\btraffic\b|\btruck\b|\bcars?\b|demolition derby|need for speed|rocket league|wheelie|wheely|stunt car|burnout|snow rider|snowrider|tanuki sunset|tunnel rush|slowroads|offroad|off road|road of fury/))return 'Racing & Driving';
   if(has(/bloons|tower defense|towerdefense|plants vs zombies|\bpvz\b|\bchess\b|checkers|\brisk\b|kingdom rush|strategy|stratego|cell machine|territory|tactical|defense|\bdefend\b|\bwar regions\b|\bcivilization\b|clash royale|battleship|connect four|tic tac toe|minesweeper|minefield|plague inc|ages of conflict|inscryption/))return 'Strategy';
   if(has(/\b2048\b|puzzle|sudoku|wordle|word search|brain|tetris|block blast|blockblast|bloxorz|sokoban|impossible quiz|riddle school|riddle transfer|cut the rope|cuttherope|fireboy and watergirl|fireboyandwatergirl|memory|nonogram|match 3|jigsaw|sliding|mahjong|solitaire|water sort|number merge|there is no game|crossword|logic|poly bridge/))return 'Puzzle & Brain';
   if(has(/papa.s |papas|bitlife|life rp|simulator|simulation|\bthe sims\b|cooking|restaurant|burger|pizza|bakeria|freezeria|hot doggeria|farming|farm life|idle miner|business|city builder|flight sim|train sim|gas station|shop simulator|store simulator|cleaning sim|house flipper|animal crossing|clothing shop|supermarket|fitness empire|sort the court|kindergarten/))return 'Simulation & Life';
   if(has(/cookie clicker|cookieclicker|\bidle\b|clicker|merging|merge |stack |flappy|draw |doodle|tiny fishing|tinyfishing|fishing|\bpou\b|dress up|makeover|coloring|colouring|relax|bubble shooter|pop it|fruit merge|idleminer|learn to fly|stacky dash/))return 'Casual & Idle';
   if(has(/undertale|deltarune|\bzelda\b|\brpg\b|role.?playing|adventure|hollow knight|stardew|spelunky|\bquest\b|metroid|pokemon|final fantasy|earthbound|riddle transfer|omori|mother 3|breath of the wild|shovel knight|dungeon crawler|dungeons and|ace attorney|phoenix wright|binding of isaac|binding of issac|yume nikki|one shot|oneshot/))return 'Adventure & RPG';
   if(has(/\bmario\b|sonic|\bovo\b|vex[0-9 ]|red ball|redball|celeste|cuphead|stickman climb|stickman boost|\bplatform\b|parkour|super meat boy|ninja|doodle jump|jump king|run 3\b|kirby|super mario bros|supermariobros|ice dodo|getting over it|jumpers|roblox obby|angry birds|stickman hook|stickmanhook|dadish|tiny square|worlds hardest game|world's hardest game|clustertruck|cluster rush|jetpack joyride/))return 'Platformers';
   if(has(/pac.?man|donkey kong|\btetris\b|\bsnake\b|breakout|space invaders|\bpong\b|atari|\bnes\b|classic arcade|retro|old school|198[0-9]|199[0-9]|emulator|asteroids|arkanoid|frogger|galaga|pinball|\bsimon\b/))return 'Retro & Classics';
   return 'Arcade & Action';
 };
 const uploadedCollections=new Map((window.LoliteUploadedGamePacks?.collections||[])
  .filter(item=>item&&/^[a-z0-9-]+$/.test(item.id)&&typeof item.name==='string')
  .map(item=>[item.id,item.name]));
 const uploadedCollectionNames=new Set(uploadedCollections.values());
 const categoryNames=["All Games","My Library","Favorites","Recently Played","Featured","Recently Added","Popular Games","Built-in HTML","UGS",...uploadedCollectionNames,"DAKNUX","Gamefiles ZIP","Free to Play","Baldi’s Basics","Sandbox & Building","Adventure & RPG","Platformers","Puzzle & Brain","Racing & Driving","Arcade & Action","Horror & Survival","Sports","Strategy","Simulation & Life","Multiplayer & .io","Music & Rhythm","Casual & Idle","Retro & Classics"];
 const sidebarGamePicks={
  'All Games':['clminecraftpocketedition.html'],
  'My Library':['clminecraftpocketedition.html'],
  'Featured':['Geometry Dash webport.html'],
  'Popular Games':['clblockblast.html','clminecraftpocketedition.html'],
  'Recently Added':['Grand Theft Auto Vice City.html'],
  'Built-in HTML':['local-tetris-index.html','local-world-sandbox-index.html'],
  'UGS':['clgdbreeze.html'],
  'Free to Play':['clminecraftpocketedition.html'],
  'Baldi’s Basics':['clbaldisbasics.html'],
  'Sandbox & Building':['clminecraftpocketedition.html'],
  'Adventure & RPG':['cldungeonsanddegenerategambler.html'],
  'Platformers':['clsupermariobros.html','clRedBall4.html'],
  'Puzzle & Brain':['clblockblast.html'],
  'Racing & Driving':['Drift-Hunters.html'],
  'Arcade & Action':['clragollhit.html'],
  'Horror & Survival':['clFNAF.html'],
  'Sports':['wrestle-bros.html'],
  'Strategy':['clpvz2gardenless.html','PVZM.html'],
  'Simulation & Life':['clbitlife.html'],
  'Multiplayer & .io':['clpaperio.html'],
  'Music & Rhythm':['closu.html'],
  'Casual & Idle':['clcookieclicker.html'],
  'Retro & Classics':['local-snake-index.html']
 };
 // Group popular series without removing games from their existing genre categories.
 // A series appears in the sidebar only if the merged library contains 3+ titles.
 const franchiseRules=[
   {name:'Friday Night Funkin’',mark:'FNF',re:/friday night funkin|\bfnf\b/i},
   {name:'Five Nights at Freddy’s',mark:'FNAF',re:/five nights at freddy|\bfnaf(?:\d|\b)|fazbear/i},
   {name:'Granny',mark:'GRANNY',re:/\bgranny\b|\bgrannyy\b/i},
   {name:'Moto X3M',mark:'MOTO',re:/moto\s*x3m|motox3m/i},
   {name:'Papa’s Games',mark:'PAPA',re:/\bpapa'?s\b|\bpapas\b/i},
   {name:'Sonic',mark:'SONIC',re:/\bsonic\b|\bsonic\.exe\b/i},
   {name:'Super Mario',mark:'MARIO',re:/\bmario\b|supermario/i},
   {name:'Geometry Dash',mark:'GD',re:/dash|\bgdbreeze\b/i},
   {name:'Angry Birds',mark:'BIRDS',re:/angry\s*birds|angrybirds/i},
   {name:'Plants vs. Zombies',mark:'PVZ',re:/plants?\s*(?:vs\.?|versus)\s*zombies|\bpvz(?:m|\d+)?\b/i},
   {name:'Bloons TD',mark:'BLOONS',re:/\bbloons?\b|\bbtd\d+\b/i},
   {name:'Vex',mark:'VEX',re:/\bvex\s*\d+\b|^vex\b/i},
   {name:'Escape Road',mark:'ESCAPE',re:/escape\s*road|escaperoad/i},
   {name:'Paper.io',mark:'PAPER',re:/paper\.?io|paperio/i},
   {name:'Parking Fury',mark:'PARK',re:/parking\s*fury|parkingfury/i},
   {name:'Fireboy & Watergirl',mark:'DUO',re:/fireboy\s*(?:and|&)\s*watergirl|fireboyandwatergirl/i},
   {name:'Subway Surfers',mark:'SUBWAY',re:/subway\s*surfers|subwaysurfers/i},
   {name:'Cookie Clicker',mark:'COOKIE',re:/cookie\s*clicker|cookieclicker/i}
 ];
 const franchiseNames=new Set();
 const franchiseForGame=g=>{
   const title=String(g.title||'');
   // Give dash-titled games Geometry Dash precedence over FNF and other series.
   if(/dash/i.test(title))return 'Geometry Dash';
   const label=title+' '+String(g.file||'');
   const match=franchiseRules.find(entry=>entry.re.test(label));
   return match?match.name:null;
 };
 function buildFranchiseCategories(){
   // Rebuild instead of stacking duplicate franchise names as catalogs change.
   for(const name of franchiseNames){
    const index=categoryNames.indexOf(name);
    if(index>=0)categoryNames.splice(index,1);
   }
   franchiseNames.clear();
   // Run after all external catalogues have been merged and deduplicated.
   const counts=new Map();
   games.forEach(g=>{
     g.franchise=franchiseForGame(g);
     if(g.franchise)counts.set(g.franchise,(counts.get(g.franchise)||0)+1);
   });
   const enabled=franchiseRules.filter(rule=>(counts.get(rule.name)||0)>=3);
   const start=categoryNames.indexOf('Baldi’s Basics')+1;
   categoryNames.splice(start,0,...enabled.map(rule=>rule.name));
   enabled.forEach(rule=>franchiseNames.add(rule.name));
   window.loliteFranchiseCategories=Object.freeze(enabled.map(rule=>({
     name:rule.name,count:counts.get(rule.name)
   })));
 }
 // Show only actual HTML files in the Lolite repository, never substituted remote web pages.
 let games=manifest.map(file=>({
  file,title:window.loliteGameArt?.[file]?.title||pretty(file),
  url:'html%20games/'+encodeURIComponent(file)+(file==='Geometry Dash webport.html'?'?v=gd-gamepad-policy-fix-20261110':''),
  category:categorize({file}),local:true,external:false,source:'Lolite OS · repository HTML',
  recentlyAdded:file==='Geometry Dash webport.html'||file==='Grand Theft Auto Vice City.html',
  addedAt:file==='Grand Theft Auto Vice City.html'?'2026-11-10T14:18:00+10:30':file==='Geometry Dash webport.html'?'2026-11-10T00:00:00+10:30':undefined
 })).concat(builtInHtmlGames.map(item=>({
  file:item.file,title:item.title,url:item.url,
  category:categorize({file:item.file,title:item.title}),
  local:true,external:false,source:'Lolite OS · built-in HTML'
 }))).sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
 
 // Restored upstream HTML filenames were verified against their source repositories.
 // Exclude adult/gambling titles from the restored public catalog.
 const unsuitableRemoteTitle=title=>/(?:porn|hentai|naked|nudity|\bxxx\b|\bnsfw\b|sexual|erotic|strip\s*club|stripper|casino|roulette|blackjack|slot\s*machine|gambling|sports\s*bet|betting|gamble)/i.test(String(title||''));
 const gameNameKey=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
 // Covers for the remaining external provider and shared title matching.
 const externalCovers=new Map();
 const gameTitleKey=name=>String(name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
 const serverNameKey=title=>{
   let text=gameTitleKey(title);
   if(text==='3minus3')text='3';
   if(text==='bminusb')text='b';
   if(/^fnaf(\d|world)?$/.test(text))text=text.replace(/^fnaf/,'fivenightsatfreddys');
   if(/^btd[1-5]$/.test(text))text=text.replace(/^btd/,'bloonstd');
   if(text==='polytrack')return 'polytrack';
   return text;
 };
 function loadAdditionalServers(){
   const incoming=Array.isArray(window.LoliteAdditionalGameServers)?window.LoliteAdditionalGameServers:[];
    if(!incoming.length)return;
   const lookup=new Map();
   games.forEach(g=>{const key=serverNameKey(g.title);if(!lookup.has(key))lookup.set(key,g)});
   let added=0,alternatives=0;
   for(let i=0;i<incoming.length;i++){
     const e=incoming[i];
     if(!e||typeof e.title!=='string'||typeof e.url!=='string')continue;
     if(e.provider!=='DAKNUX')continue;
     const valid=/^https:\/\/cdn\.jsdelivr\.net\/gh\/daknux\/html@main\/[A-Za-z0-9._-]+\.html$/.test(e.url);
      if(!valid)continue;
     const title=e.title.replace(/[<>&"'\x60]/g,'').trim().slice(0,95);
     if(unsuitableRemoteTitle(title))continue;
     const key=serverNameKey(title);
     if(!key)continue;
     const existing=lookup.get(key);
     const server={name:e.provider,url:e.url};
     if(existing){
       if(existing.url!==e.url&&!(existing.servers||[]).some(item=>item.url===e.url)){
         (existing.servers||(existing.servers=[])).push(server);
         alternatives++;
       }
     }else{
       const file='remote-'+e.provider.replace(/[^a-z]/gi,'').toLowerCase()+'-'+i+'.html';
       const game={file,title,url:e.url,source:e.provider,external:true,category:'Arcade & Action'};
       game.category=categorize(game);
       games.push(game);lookup.set(key,game);added++;
       if(e.provider==='DAKNUX'&&/^https:\/\/cdn\.jsdelivr\.net\/gh\/daknux\/covers@main\/\d+\.png$/.test(e.cover||''))externalCovers.set(file,e.cover);
     }
   }
   // The DAKNUX jsDelivr entry for Neon Tide points to HTML deliberately served
   // as text/plain, so it cannot be launched as an iframe document.
   // Use the original creator's official, playable itch.io page instead.
   // Do not mirror the author's unlicensed source code in the Lolite repo.
   const neonTide=games.find(g=>gameTitleKey(g.title)==='neontide');
   if(neonTide){
     // The raw HTML host is now playable using the isolated HTML renderer.
     // Keep the official creator's page first, with the raw HTML as a choice.
     const rawHTML=neonTide.url;
     neonTide.url='https://promptpotatogames.itch.io/neon-tide';
     neonTide.source='Official creator';
     neonTide.external=true;
     neonTide.openExternally=true;
     neonTide.servers=[{name:'DAKNUX (raw HTML)',url:rawHTML}];
     window.loliteNeonTideSource='official-browser-game-and-raw-html';
   }
   games.forEach(g=>g.category=categorize(g));
   games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
   window.loliteExternalServerImport={added,alternatives,total:added+alternatives};
   if(document.querySelector('.store-main'))render();
 }
 // Authorised locally hosted game packages take priority over external URLs.
 // Each game consists of actual HTML and relative assets in the repository.
 async function loadAuthorizedGames(){
   try{
     const response=await fetch('html%20games/authorized/manifest.json',{cache:'no-store'});
     if(!response.ok)throw new Error('Local game manifest unavailable');
     const manifest=await response.json();
     if(manifest.version!==1||!Array.isArray(manifest.games))throw new Error('Invalid local game manifest');
     let added=0,replaced=0;
     const existing=new Map(games.map((game,i)=>[gameTitleKey(game.title),i]));
     for(const entry of manifest.games){
       if(!entry||typeof entry.title!=='string'||typeof entry.slug!=='string'||typeof entry.entry!=='string')continue;
       if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(entry.slug)||
          !entry.entry.toLowerCase().endsWith('.html')||
          entry.entry.split('/').some(segment=>!segment||segment==='.'||segment==='..'||!/^[a-zA-Z0-9._-]+$/.test(segment)))continue;
       const title=entry.title.replace(/[<>&"'\x60]/g,'').slice(0,100).trim(),key=gameTitleKey(title);
       if(!key)continue;
       const url='html%20games/authorized/'+entry.slug+'/'+entry.entry.split('/').map(encodeURIComponent).join('/');
       const n=existing.get(key);
       const local={title,url,source:'Lolite OS (local HTML)',local:true,external:false,hosted:false,
         servers:[]};
       if(n!==undefined){games[n]={...games[n],...local};replaced++;}
       else{
         games.push({...local,file:'authorized-'+entry.slug+'.html',category:categorize({file:entry.slug})});
         existing.set(key,games.length-1);added++;
       }
     }
     games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
     window.loliteAuthorizedGameImport=Object.freeze({added,replaced,total:added+replaced});
     if(document.querySelector('.store-main'))render();
   }catch(error){
     console.warn('Authorized local game catalog could not be read.',error);
   }
 }
 // Real HTML files committed into this repository by the release import workflow.
 function loadBundledGamefiles(){
  const catalog=window.LoliteBundledGamefiles;
  if(!Array.isArray(catalog)||!catalog.length)return;
  const key=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
  const existing=new Map(games.map((g,i)=>[key(g.title),i]));
  let added=0,replaced=0;
  for(const entry of catalog){
   if(!entry||typeof entry.title!=='string'||typeof entry.file!=='string'||typeof entry.url!=='string')continue;
   if(!/^bundle-[a-f0-9]{12}\.html$/.test(entry.file)||!/^html%20games\/gamefiles\/[^\s?#]+\.html?$/i.test(entry.url))continue;
   const title=entry.title.trim().slice(0,90),normal=key(title);
   if(!normal||title.includes('<')||title.includes('>'))continue;
   const found=existing.get(normal);
   if(found!==undefined){
    const current=games[found],backup={...current},alternative={name:current.source||'Previous game server',url:current.url};
    games[found]={...current,title,url:entry.url,local:true,external:false,bundledGameFile:true,
     bundledGameBackup:backup,source:'Gamefiles ZIP (GitHub HTML)',
     servers:[alternative,...(current.servers||[])]};
    replaced++;
   }else{
    const game={file:entry.file,title,url:entry.url,category:categorize({title,file:entry.file}),
     local:true,external:false,bundledGameFile:true,source:'Gamefiles ZIP (GitHub HTML)'};
    games.push(game);existing.set(normal,games.length-1);added++;
   }
  }
  games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
  window.LoliteBundledGamefilesStatus=Object.freeze({added,replaced,total:added+replaced});
 }
 // ZIP launch documents are hosted alongside their original relative assets.
 // Merge duplicate titles into server choices; UGS is applied afterwards.
 function loadUploadedGamePacks(){
  const incoming=window.LoliteUploadedGamePacks?.games;
  if(!Array.isArray(incoming))return;
  const lookup=new Map(games.map(game=>[serverNameKey(game.title),game]));
  let added=0,alternatives=0;
  for(const entry of incoming){
   const name=uploadedCollections.get(entry?.collection);
   if(!name||typeof entry.title!=='string'||typeof entry.url!=='string'||typeof entry.file!=='string')continue;
   if(!/^pack-[a-z0-9-]+-[a-f0-9]{12}\.html$/.test(entry.file))continue;
   if(!entry.url.startsWith('html%20games/collections/'+entry.collection+'/')||!/^html%20games\/collections\/[a-z0-9-]+\/[^\s?#]+\.html?$/i.test(entry.url))continue;
   const title=entry.title.trim(),key=serverNameKey(title);
   if(!key||/[<>]/.test(title))continue;
   let game=lookup.get(key);
   if(game){
    if(game.url!==entry.url&&!(game.servers||[]).some(server=>server.url===entry.url)){
     // Prefer the supplied HTML when the existing default is an external host.
     if(game.external&&!game.local){
      game.servers=[{name:game.source||'Previous server',url:game.url},...(game.servers||[])];
      Object.assign(game,{url:entry.url,source:name,packSource:name,local:true,external:false,openExternally:false});
     }else (game.servers||(game.servers=[])).push({name,url:entry.url});
     alternatives++;
    }
   }else{
    game={file:entry.file,title,url:entry.url,source:name,packSource:name,
     local:true,external:false,recentlyAdded:true,category:categorize({title,file:entry.file})};
    games.push(game);lookup.set(key,game);added++;
   }
   game.uploadedCollections=[...new Set([...(game.uploadedCollections||[]),entry.collection])];
   if(typeof entry.cover==='string'&&(/^(?:html%20games\/collections\/|https:\/\/cdn\.jsdelivr\.net\/gh\/)/.test(entry.cover)))
    externalCovers.set(game.file,entry.cover);
  }
  games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
  window.LoliteUploadedGamePacksStatus=Object.freeze({added,alternatives,total:added+alternatives});
 }
 // User-selected gamefiles.zip games continue to share their on-device assets.
 const gamefilesKey=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
 async function syncGamefilesCollection(){
  const packages=window.LoliteLocalGamePackages;
  if(!packages?.list)return;
  let records;
  try{records=(await packages.list()).filter(rec=>rec.source==='gamefiles-collection'&&rec.packId&&rec.root)}
  catch(error){console.warn('Cannot load gamefiles collection',error);return}
  games=games.filter(game=>!game.gamefilesCreated).map(game=>game.gamefilesBackup||game);
  const existing=new Map(games.map((game,index)=>[gamefilesKey(game.title),index]));
  let added=0,alternates=0;
  for(const record of records){
   const key=gamefilesKey(record.title);if(!key)continue;
   const url='core/local-games/'+encodeURIComponent(record.packId)+'/'+record.root.split('/').map(encodeURIComponent).join('/');
   const found=existing.get(key);
   if(found!==undefined){
    const old=games[found],backup={...old},original={name:old.source||'Lolite OS',url:old.url};
    games[found]={...old,url,local:true,source:'Gamefiles ZIP (installed)',gamefilesRecord:record,gamefilesBackup:backup,servers:[original,...(old.servers||[])]};
    alternates++;
   }else{
    const file='gamefiles-'+record.id;
    games.push({file,title:record.title,url,local:true,source:'Gamefiles ZIP (installed)',gamefilesRecord:record,gamefilesCreated:true,category:categorize({file:record.title})});
    existing.set(key,games.length-1);added++;
   }
  }
  games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
  window.LoliteGamefilesImport=Object.freeze({installed:records.length,added,alternates});
  if(document.querySelector('.store-main'))render();
 }
 // Keep installed ZIP games alongside restored online games.
 window.addEventListener('lolite-local-packages-changed',()=>{void syncGamefilesCollection().then(syncUGSCollection)});
 // Shared admin entries are added only after being published through Supabase RLS.
 // The 97 original games remain actual HTML files in this repository.
 const adminGameArtwork=new Map();
 function syncAdminGameLibrary(items){
  games=games.filter(game=>!game.adminSharedGame);
  adminGameArtwork.clear();
  const published=(Array.isArray(items)?items:[]).filter(item=>item.kind==='game'&&
    /^[0-9a-f-]{36}$/i.test(item.id)&&typeof item.title==='string'&&
    /^https:\/\/[^\s]+$/i.test(item.url));
  for(const item of published){
   const artworkURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
   const iconUrl=artworkURL(item.icon_url),backgroundUrl=artworkURL(item.background_url);
   const game={file:'admin-'+item.id,title:item.title.slice(0,90),url:item.url,
    adminSharedGame:true,external:true,local:false,source:'Admin library',
    iconUrl,backgroundUrl,addedAt:item.created_at||'',category:categorize({title:item.title})};
   games.push(game);
   adminGameArtwork.set(game.file,{icon:iconUrl,background:backgroundUrl});
  }
  games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
  if(document.querySelector('.store-main'))render();
 }
 window.addEventListener('lolite:library-updated',event=>syncAdminGameLibrary(event.detail?.items));

 const serverSelections=new Map();
 // A Google Drive preview is not a playable game server. UGS is available as
 // the default source only after HTML is imported locally on this device.
 const ugsTitleKey=value=>String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
 const ugsFileURL=record=>'core/local-games/'+encodeURIComponent(record.packId||record.id)+'/'+record.root.split('/').map(encodeURIComponent).join('/');
 const ugsSingleKey='loliteUGSSingleInstallsV1';
 const ugsSavedSingles=()=>{
   try{const rows=JSON.parse(localStorage.getItem(ugsSingleKey)||'{}');return rows&&typeof rows==='object'?rows:{}}catch{return {}}
 };
 async function syncUGSCollection(){
   const packages=window.LoliteLocalGamePackages;
   let stored=[];
   try{stored=await (packages?.list?.()||Promise.resolve([]))}catch(error){console.warn("UGS local game database unavailable",error)}
   const byId=new Map(stored.map(rec=>[rec.id,rec]));
   const hosted=window.LoliteUGSHosted&&typeof window.LoliteUGSHosted==='object'?window.LoliteUGSHosted:{};
   const saved=ugsSavedSingles();
   const installedByTitle=new Map();
   for(const rec of stored){
     if(rec.source!=='ugs-collection')continue;
     const key=ugsTitleKey(rec.title);
     if(key&&!installedByTitle.has(key))installedByTitle.set(key,rec);
   }
   // Restore original game entries first to avoid stacking duplicate backup servers.
   games=games.filter(g=>!g.ugsCreated).map(g=>g.ugsBackup||g);
   const existing=new Map(games.map((g,i)=>[ugsTitleKey(g.title),i]));
   const rows=Array.isArray(window.LoliteUGSCatalog)?window.LoliteUGSCatalog:[];
   let listed=0,installed=0,alternatives=0;
   const taken=new Set();
   for(const row of [...rows].sort((a,b)=>(a[2]==='html5'?0:1)-(b[2]==='html5'?0:1))){
     if(!Array.isArray(row)||row.length<5)continue;
     const [id,filename,kind,bytes,sourceTitle]=row;
     const title=window.LoliteUGSPresentation?.title(sourceTitle,filename)||sourceTitle;
     if(!/^[A-Za-z0-9_-]{12,80}$/.test(id)||!/^[-\w ().]+\.html?$/i.test(filename)||!['html5','flash'].includes(kind)||typeof sourceTitle!=='string'||unsuitableRemoteTitle(sourceTitle))continue;
     const key=ugsTitleKey(title);if(!key||taken.has(key))continue;
     const record=byId.get(saved[id])||installedByTitle.get(key)||installedByTitle.get(ugsTitleKey(sourceTitle));
     const hasLocalInstall=!!record&&typeof record.root==='string'&&/^pkg-[a-f0-9-]{16,60}$/.test(record.packId||record.id);
     const hostedURL=typeof hosted[id]==='string'&&/^html%20games\/ugs\/[a-z0-9._-]+\.html?$/i.test(hosted[id])?hosted[id]:'';
     const hasHosted=!!hostedURL; // HTML5 and Ruffle-backed Flash launch pages are real hosted HTML.
     const hasInstall=hasLocalInstall||hasHosted;
     if(!hasInstall)continue; // Drive catalogue entries are not playable game files.
     taken.add(key);listed++;
     const preferredURL=hasLocalInstall?ugsFileURL(record):hostedURL;
     const entry={id,filename,kind,title,sourceTitle,bytes:Number(bytes)||0};
     const index=existing.get(key);
     if(index!==undefined){
       const previous=games[index];
       {
         const old={...previous},fallback={name:previous.source||'Lolite OS',url:previous.url};
         games[index]={...previous,ugsBackup:old,ugsEntry:entry,ugsInstalled:true,ugsRecord:record,
           url:preferredURL,source:'UGS',local:true,external:false,ugsHosted:!hasLocalInstall,
           servers:[...(fallback.url?[fallback]:[]),...(previous.servers||[])]};
         serverSelections.set(games[index].file,0);installed++;alternatives++;
       }
     }else{
       const file='ugs-'+id.replace(/[^a-z0-9-]/gi,'-')+'.html';
       const game={file,title,url:preferredURL||'',source:'UGS',
         local:!!hasInstall,external:false,ugsEntry:entry,ugsCreated:true,
         ugsInstalled:true,ugsHosted:!!hasHosted&&!hasLocalInstall,ugsRecord:hasLocalInstall?record:null,
         category:categorize({file:filename,title})};
       games.push(game);existing.set(key,games.length-1);
       if(hasInstall)installed++;
     }
   }
   games.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'}));
   window.LoliteUGSStatus=Object.freeze({listed,installed,alternatives,hosted:Object.keys(hosted).length,html5:rows.filter(x=>x[2]==='html5').length,flash:rows.filter(x=>x[2]==='flash').length});
   buildFranchiseCategories();
   if(document.querySelector('.store-main'))render();
 }
 const availableServers=g=>{
   const baseName=g.ugsInstalled?'UGS':g.adminSharedGame?'Admin library':g.gamefilesRecord?'Gamefiles ZIP · Local':g.bundledGameFile?'Gamefiles ZIP · GitHub HTML':g.packSource?g.packSource:(g.local||g.url.startsWith('html games/'))?'Lolite OS (local HTML)':g.openExternally?'Official creator':g.source==='DAKNUX'?'DAKNUX':'Lolite OS';
   // Offer each alternate server as its own playable version; skip duplicate URLs.
   const raw=[{name:baseName,url:g.url},...(Array.isArray(g.servers)?g.servers:[])];
   const seen=new Set();
   return raw.filter(x=>{
    if(!x||typeof x.url!=='string')return false;
    const url=x.url.trim();
    if(!url||/^(?:javascript|data):/i.test(url)||seen.has(url))return false;
    seen.add(url);
    return true;
   }).map(x=>({name:String(x.name||'Server'),url:x.url.trim()}));
 };
 const playableVersionCount=list=>list.reduce((total,game)=>total+availableServers(game).length,0);
 // If a public game host has moved or returns 404, try the original
 // HTML file from its verified source repository before giving up.
 // This never imports or publishes third-party code to Lolite's repository.
 const sourceBackup=url=>{
  const routes=[
   [/^https:\/\/cdn\.jsdelivr\.net\/gh\/daknux\/html@main\/([a-z0-9._-]+\.html)$/i,'https://raw.githubusercontent.com/daknux/html/main/']
  ];
  for(const [pattern,root] of routes){const match=String(url||'').match(pattern);if(match)return {name:'Original HTML backup',url:root+match[1]}}
  return null;
 };
 const fallbackSourcesFor=(g,chosen)=>{
  // Keep unsafe titles out of automated alternate-source retrieval.
  if(/casino|poker|blackjack|roulette|slot[\s_-]*machine|sportsbook|betting|wager|porn|adult|sex/i.test(g.title||''))return [];
  const sources=availableServers(g),candidates=[];
  const healthySource=item=>!window.LoliteGameHealth?.isUnavailable?.({url:item.url});
  // Prefer other published, full game hosts to source-only backups that may
  // have missing relative assets. Never retry already-confirmed 404 URLs.
  for(const source of sources)if(source.url!==chosen.url&&healthySource(source))candidates.push(source);
  for(const source of [chosen,...sources]){
   const backup=sourceBackup(source.url);
   if(backup&&healthySource(backup))candidates.push(backup);
  }
  return candidates.slice(0,8);
 };
 const selectedSource=g=>{
   const sources=availableServers(g);
   const i=Math.max(0,Math.min(sources.length-1,Number(serverSelections.get(g.file)||0)));
   const selected=sources[i]||sources[0];
   if(!selected||!window.LoliteGameHealth?.isUnavailable?.({url:selected.url}))return selected;
   const next=sources.find(item=>!window.LoliteGameHealth?.isUnavailable?.({url:item.url}));
   if(next)serverSelections.set(g.file,sources.indexOf(next));
   return next||selected;
 };
 const encodeLabel=t=>String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const serverPickerMarkup=g=>{
  const servers=availableServers(g),chosenServer=selectedSource(g);
  if(!servers.length)return '<span class="store-server-picker"><span>Server</span><span>Unavailable</span></span>';
  const chosen=Math.max(0,servers.indexOf(chosenServer));
  return '<label class="store-server-picker"><span>Server</span><select class="store-server-select" data-source-game="'+encodeLabel(g.file)+'" aria-label="Server for '+encodeLabel(g.title)+'"  '+(servers.length<2?'disabled':'')+'>'+servers.map((v,i)=>{
   const missing=!!window.LoliteGameHealth?.isUnavailable?.({url:v.url});
   return '<option value="'+i+'"'+(chosen===i?' selected':'')+(missing?' disabled':'')+'>'+encodeLabel(v.name)+(missing?' · 404 unavailable':'')+'</option>';
  }).join('')+'</select></label>';
 };
 window.loliteStoreSelectedIndex=file=>Number(serverSelections.get(file)||0);
 window.loliteStoreFileForTitle=title=>games.find(game=>game.title===title)?.file||null;
 window.loliteStoreTryBackupForTitle=title=>{
  const game=games.find(item=>item.title===title);
  if(!game||/casino|poker|blackjack|roulette|slot[\s_-]*machine|sportsbook|betting|wager|porn|adult|sex/i.test(game.title))return false;
  const source=selectedSource(game);
  return !!(source&&window.LoliteGamePlayer?.open({
   title:game.title,file:game.file,url:source.url,source:source.name,
   fallbackSources:fallbackSourcesFor(game,source)
  }));
 };
 window.loliteStorePickServer=(file,index)=>{
  const game=games.find(x=>x.file===file);if(!game)return;
  const sources=availableServers(game),n=Math.max(0,Math.min(sources.length-1,Number(index)||0));
  serverSelections.set(file,n);
  document.querySelectorAll('.store-server-select').forEach(el=>{if(el.dataset.sourceGame===file)el.value=String(n)});
  const selected=sources[n];
  if(selected&&!window.LoliteGameHealth?.isUnavailable?.({url:selected.url}))
   window.LoliteGamePlayer?.switchServer?.(file,selected.url,selected.name,fallbackSourcesFor(game,selected));
 };
 window.loliteStoreOpenSelected=file=>{
  const game=games.find(x=>x.file===file),source=game&&selectedSource(game);
  if(source&&window.LoliteGamePlayer?.open({file,title:game.title,url:source.url,source:source.name,fallbackSources:fallbackSourcesFor(game,source)}))markRecent(file);
 };
 let active='All Games',query='',visibleCount=60;
 // Local-only favourites and recent activity: never invent online friends or play counts.
 const FAV_KEY='loliteGameFavoritesV1',RECENT_KEY='loliteGameRecentlyPlayedV1';
 const getStored=key=>{try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data:[]}catch{return []}};
 const storeSaved=(key,list)=>{try{localStorage.setItem(key,JSON.stringify(list))}catch{}};
 const favouriteIds=new Set(getStored(FAV_KEY).filter(s=>typeof s==='string'&&s.length<150).slice(0,250));
 let recentSessions=getStored(RECENT_KEY).filter(row=>row&&typeof row.file==='string'&&Number.isFinite(row.at)).slice(0,18);
 const isFavourite=file=>favouriteIds.has(file);
 const recentGames=()=>recentSessions.map(item=>games.find(g=>g.file===item.file)).filter(Boolean);
 function refreshActivity(){
  const target=document.querySelector('.store-social-inner');
  if(target)target.innerHTML=activityMarkup();
 }
 function toggleFavourite(file){
  if(!games.some(g=>g.file===file))return false;
  if(isFavourite(file))favouriteIds.delete(file);
  else{if(favouriteIds.size>=250){window.toast?.('Favorites are limited to 250 games.');return false}favouriteIds.add(file)}
  storeSaved(FAV_KEY,[...favouriteIds]);
  window.LoliteActivity?.favorite(file,isFavourite(file));
  if(active==='Favorites')render();
  else document.querySelectorAll('.store-favourite').forEach(button=>{
   if(button.dataset.storeFavorite!==file)return;
   const fav=isFavourite(file);
   button.classList.toggle('is-favourite',fav);
   button.setAttribute('aria-pressed',String(fav));
   button.setAttribute('aria-label',(fav?'Remove from':'Add to')+' Favorites');
  });
  refreshActivity();refreshSidebarIcons();return isFavourite(file);
 }
 function markRecent(file){
  if(!games.some(g=>g.file===file))return;
  recentSessions=[{file,at:Date.now()},...recentSessions.filter(row=>row.file!==file)].slice(0,18);
  storeSaved(RECENT_KEY,recentSessions);
  if(active==='Recently Played')render();else refreshActivity();
  refreshSidebarIcons();
 }
 function activityMarkup(){
  const recent=recentGames().slice(0,5),favCount=games.filter(g=>isFavourite(g.file)).length;
  const relTime=stamp=>{
   const diff=Math.max(0,Date.now()-stamp);
   return diff<60000?'Just now':diff<3600000?Math.max(1,Math.floor(diff/60000))+'m ago':
    diff<86400000?Math.floor(diff/3600000)+'h ago':new Date(stamp).toLocaleDateString();
  };
  return '<h2 class="store-activity-title">Activity <span class="store-activity-status">LOLITE</span></h2>'+
   '<div class="store-activity-heading">RECENTLY PLAYED <span>'+recent.length+'</span></div>'+
   (recent.length?recent.map(g=>{
    const session=recentSessions.find(item=>item.file===g.file);
    const image=encodeLabel(coverFor(g.file)||posterForGame(g));
    return '<div class="store-activity-row"><img class="store-activity-cover" alt="" src="'+image+'" loading="lazy">'+
     '<div class="store-activity-copy"><strong title="'+encodeLabel(g.title)+'">'+encodeLabel(g.title)+'</strong>'+
     '<small>'+encodeLabel(relTime(session?.at||Date.now()))+'</small></div></div>';
   }).join(''):'<p class="store-activity-empty">No games played yet. Launch one to see it here.</p>')+
   '<div class="store-activity-section"><div class="store-activity-heading">YOUR LIBRARY</div>'+
   '<div class="store-social-stats"><div><strong>'+games.length+'</strong><small>Game titles</small></div>'+
   '<div><strong>'+favCount+'</strong><small>Favorites</small></div></div></div>'+
   '<div class="store-activity-section"><div class="store-activity-heading">FRIENDS & CHAT</div>'+
   (window.LoliteActivity?.sidebar()||'<p class="store-activity-empty">Loading player activity…</p>')+
   '<button type="button" class="store-social-button" data-store-open-chat>Open Lolite Chat ↗</button></div>'+
   '<div class="store-social-footer">Your library follows your Lolite account. Guest data stays on this device.</div>';
 }
 const economy=()=>window.LoliteEconomy;
 const gamePrice=g=>economy()?.gamePrice?.(g)??0;
 const hasGame=g=>!!economy()?.hasGame?.(g);
 const priceLabel=g=>gamePrice(g)===0?'FREE':economy()?.money?.(gamePrice(g))||'$'+gamePrice(g);
 const storeWallet=()=>economy()?.money?.(economy().balance())||'—';
 // Popular titles come from real anonymous launch counts, not a keyword list.
 const popularity=()=>window.LoliteGamePopularity;
 const playCount=g=>popularity()?.countFor(g.file)||0;
 const isRanked=g=>playCount(g)>0&&!!popularity()?.isEligible(g);
 const ranked=list=>list.filter(isRanked).sort((a,b)=>playCount(b)-playCount(a)||a.title.localeCompare(b.title));
 const matchesCategory=g=>uploadedCollectionNames.has(active)?availableServers(g).some(server=>server.name===active):franchiseNames.has(active)?g.franchise===active:active==='All Games'||active==='Featured'||active==='Popular Games'?true:active==='Favorites'?isFavourite(g.file):active==='Recently Played'?recentSessions.some(row=>row.file===g.file):active==='Recently Added'?!!g.adminSharedGame||g.recentlyAdded||g.file.startsWith('local-'):active==='My Library'?hasGame(g):active==='Built-in HTML'?g.url.startsWith('games/'):active==='UGS'?!!g.ugsEntry:active==='DAKNUX'?availableServers(g).some(server=>server.name==='DAKNUX'):active==='Gamefiles ZIP'?!!g.gamefilesRecord||!!g.bundledGameFile:active==='Free to Play'?gamePrice(g)===0:g.category===active;
 const broken=g=>{
  const versions=availableServers(g);
  if(!versions.length)return true;
  const known=[...versions,...fallbackSourcesFor(g,versions[0])];
  // Only hide games after every possible URL has returned a real 404/410.
  return known.every(source=>!!window.LoliteGameHealth?.isUnavailable?.({url:source.url}));
 };
 const healthy=list=>list.filter(g=>!broken(g));
 let sortOrder='az';
 const sortGames=list=>{
  if(sortOrder==='za')return list.sort((a,b)=>b.title.localeCompare(a.title,undefined,{numeric:true}));
  if(sortOrder==='servers')return list.sort((a,b)=>availableServers(b).length-availableServers(a).length||a.title.localeCompare(b.title));
  if(sortOrder==='popular')return list.sort((a,b)=>playCount(b)-playCount(a)||a.title.localeCompare(b.title));
  return list.sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true}));
 };
 function closeGameDetail(){
  const node=document.querySelector('#loliteGameDetail');if(node){node.remove();document.querySelector('[data-store-details-return="true"]')?.focus();document.querySelector('[data-store-details-return="true"]')?.removeAttribute('data-store-details-return')}
 }
 function openGameDetail(file,trigger){
  const game=games.find(g=>g.file===file);if(!game||broken(game))return;
  closeGameDetail();
  trigger?.setAttribute('data-store-details-return','true');
  const servers=availableServers(game);
  const panel=document.createElement('div');panel.id='loliteGameDetail';panel.className='lolite-game-detail';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Game details: '+game.title);
  const desc=servers.map(s=>{
   const health=window.LoliteGameHealth?.status?.({url:s.url})||'unverified';
   return '<li>'+encodeLabel(s.name||'Game source')+' · '+encodeLabel(health)+'</li>';
  }).join('');
  panel.innerHTML='<section class="lolite-game-detail-panel"><div class="lolite-game-detail-top"><div><h2>'+encodeLabel(game.title)+'</h2><div class="lolite-game-detail-stat">'+encodeLabel(game.category)+' · '+servers.length+' server'+(servers.length===1?'':'s')+'</div></div>'+
   '<button type="button" class="lolite-game-detail-close" data-game-detail-close aria-label="Close game details">×</button></div>'+
   '<div class="store-detail-artwork"><img class="lolite-game-detail-image" src="'+encodeLabel(game.backgroundUrl||game.iconUrl||coverFor(game.file)||posterForGame(game))+'" alt="Game artwork">'+
   (game.iconUrl?'<img class="store-detail-icon" src="'+encodeLabel(game.iconUrl)+'" alt="Game icon">':'')+'</div>'+
   '<div class="lolite-game-detail-stat">Source: '+encodeLabel(game.source||'Lolite OS')+'</div>'+
   '<div class="lolite-game-detail-stat">Recent launches: '+playCount(game).toLocaleString()+' in the last 30 days (when available)</div>'+
   '<div class="lolite-game-detail-stat">Your playtime: '+(window.LoliteActivity?.duration(window.LoliteActivity?.statsFor(game.file)?.total_seconds||0)||'0 sec')+'</div>'+
   '<button type="button" data-copy-game="'+encodeLabel(game.file)+'">Copy game</button>'+
   '<strong>Available servers</strong><ul>'+desc+'</ul>'+
   '<div class="lolite-game-detail-actions"><button type="button" data-game-detail-play="'+encodeLabel(game.file)+'">'+(hasGame(game)?'Play game':'Unlock game')+'</button></div></section>';
  document.body.append(panel);
  panel.querySelector('[data-game-detail-close]')?.focus();
 }
 document.addEventListener('click',event=>{
  const modal=event.target.closest?.('#loliteGameDetail');if(!modal)return;
  if(event.target===modal||event.target.closest('[data-game-detail-close]')){closeGameDetail();return}
  const launch=event.target.closest('[data-game-detail-play]');
  if(launch){const file=launch.dataset.gameDetailPlay;closeGameDetail();window.loliteStoreAction(file)}
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('#loliteGameDetail')){event.preventDefault();closeGameDetail()}});

 // Avoid issuing thousands of HEAD requests every time the user opens the store.
 // The explicit Check game files action still validates the entire hosted library.
 let lastBackgroundHealthScan=0;
 const requestHealth=()=>{
  // Do not start up to 80 probes every time a user types into Search.
  if(Date.now()-lastBackgroundHealthScan<5*60*1000)return;
  lastBackgroundHealthScan=Date.now();
  void window.LoliteGameHealth?.scan?.(games.filter(g=>g.url?.startsWith('html games/')||g.url?.startsWith('games/')).slice(0,80));
 };
 window.LoliteGameSearch=(text,limit=8)=>{
   const q=String(text||'').trim().toLowerCase();
   if(q.length<2)return [];
   return healthy(games).filter(g=>!/(?:casino|gambling|poker|roulette|slot.?machine|adult)/i.test(g.title+' '+g.category)&&
    (g.title+' '+g.category+' '+(g.franchise||'')).toLowerCase().includes(q))
    .slice(0,Math.min(20,Math.max(1,limit)))
    .map(g=>({file:g.file,title:g.title,category:g.category,unlocked:hasGame(g)}));
 };
 // Search is global, regardless of the currently selected game collection.
 // Match full names, filenames, genre/franchise, common abbreviations and
 // punctuation-free spellings (e.g. GTA4, FNAF, GeometryDash).
 const normalizeGameSearch=value=>String(value||'').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,' ').trim().toLowerCase();
 function matchesGameQuery(game,text){
  const title=String(game.title||''),file=String(game.file||'');
  const aliases=/grand theft auto/i.test(title)?' gta ': /five nights at freddy/i.test(title)?' fnaf ': '';
  const haystack=normalizeGameSearch([title,file,game.category,game.franchise,game.source,aliases,
   ...(Array.isArray(game.servers)?game.servers.map(server=>server.name):[])].filter(Boolean).join(' '));
  const compact=haystack.replace(/ /g,'');
  const tokens=normalizeGameSearch(text).split(' ').filter(Boolean);
  return tokens.every(token=>haystack.includes(token)||compact.includes(token));
 }
 const filtered=(available=healthy(games))=>{
  const searching=!!query.trim();
  const found=available.filter(g=>searching?matchesGameQuery(g,query):matchesCategory(g));
  return searching?found:active==='Popular Games'?ranked(found):active==='Recently Played'?found.sort((a,b)=>(recentSessions.find(row=>row.file===b.file)?.at||0)-(recentSessions.find(row=>row.file===a.file)?.at||0)):active==='Recently Added'?found.sort((a,b)=>Date.parse(b.addedAt||0)-Date.parse(a.addedAt||0)||a.title.localeCompare(b.title)):found;
 };
 const coverPalette=g=>{let hash=0;for(const ch of g.file)hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;const hue=hash%360,hue2=(hue+48+(hash%73))%360;return [`hsl(${hue} 62% 28%)`,`hsl(${hue2} 48% 13%)`,`${12+(hash%13)}s`,String(hash%6),`-${hash%17000}ms`]};
 const card=g=>{
  const colors=coverPalette(g),poster=posterForGame(g),file=encodeLabel(g.file),
   title=encodeLabel(g.title),fav=isFavourite(g.file);
  const plays=active==='Popular Games'?'<small class="store-play-count">'+playCount(g).toLocaleString()+' launches in 30 days</small>':'';
  const mark=g.gamefilesRecord||g.ugsInstalled?'▣':'✧';
  const launchText='▶ Play';
  return '<article class="store-card store-gallery-card" data-game-file="'+file+'">'+
   '<div class="store-cover has-game-art" data-game-file="'+file+'" data-skin="'+colors[3]+'" style="--cover-a:'+colors[0]+';--cover-b:'+colors[1]+';--cover-speed:'+colors[2]+';--cover-delay:'+colors[4]+'">'+
   '<div class="store-cover-art" aria-hidden="true"><img class="store-cover-picture" src="'+poster+'" alt="" loading="lazy" decoding="async"></div>'+
   (g.iconUrl?'<img class="store-uploaded-game-icon" src="'+encodeLabel(g.iconUrl)+'" alt="" loading="lazy" decoding="async">':'')+
   '<button type="button" class="store-cover-launch" data-store-launch="'+file+'" aria-label="Play '+title+'" title="Play '+title+'"></button>'+
   '<span class="store-cover-origin" aria-hidden="true">'+mark+'</span>'+
   '<button type="button" class="store-favourite'+(fav?' is-favourite':'')+'" data-store-favorite="'+file+
   '" aria-label="'+(fav?'Remove from':'Add to')+' Favorites" aria-pressed="'+fav+'" title="'+(fav?'Remove favorite':'Add favorite')+'">'+
   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z"/></svg></button></div>'+
   '<div class="store-card-body"><h3 title="'+title+'">'+title+'</h3>'+plays+
   '<div class="store-card-actions"><button class="store-play" type="button" data-store-launch="'+file+'" aria-label="Play '+title+'">'+launchText+'</button>'+
   serverPickerMarkup(g)+'<button class="store-details" type="button" data-store-details="'+file+'" aria-label="Details for '+title+'">Info</button></div></div></article>';
 };
 const ugsDiscoveredArt=new Map();
 const coverFor=file=>{
  if(file.startsWith('native-'))return null;
  const game=games.find(item=>item.file===file);
  return adminGameArtwork.get(file)?.background||adminGameArtwork.get(file)?.icon||
   externalCovers.get(file)||window.loliteGameArt?.[file]?.src||
   (game?.ugsEntry?.filename?window.loliteGameArt?.[game.ugsEntry.filename]?.src:null)||
   ugsDiscoveredArt.get(file)||null;
 };
 // Local, title-specific artwork is always present; remote images only enhance it.
 const artCache=new Map();
 window.loliteStorePreview=(el,file,title)=>{
   if(!el || el.dataset.artLoading==='1' || el.dataset.artLoaded==='1')return;
   const target=el.querySelector('.store-cover-art');
   const picture=target?.querySelector('.store-cover-picture');
   if(!target || !picture)return;
   const remote=coverFor(file);
   if(!remote){
    // Only the visible UGS cards inspect their same-origin launch page for a
    // genuine icon/cover. Never fetch every game at catalogue startup.
    const ugsGame=games.find(game=>game.file===file&&game.ugsEntry);
    if(ugsGame&&!el.dataset.ugsArtChecked&&window.LoliteUGSPresentation?.discover){
     el.dataset.ugsArtChecked='1';
     void window.LoliteUGSPresentation.discover(ugsGame).then(src=>{
      if(!src)return;
      ugsDiscoveredArt.set(file,src);
      if(el.isConnected){delete el.dataset.artLoaded;window.loliteStorePreview(el,file,title)}
     }).catch(()=>{});
    }
    el.dataset.artLoaded='fallback';return;
   }
   const old=artCache.get(remote);
   if(old?.failed && Date.now()-old.time<60000){el.dataset.artLoaded='fallback';return}
   el.dataset.artLoading='1';
   const loader=new Image();
   loader.decoding='async';
   loader.referrerPolicy='no-referrer';
   let done=false;
   const timer=setTimeout(()=>finish(false),12000);
   function finish(ok){
     if(done)return;
     done=true;
     clearTimeout(timer);
     delete el.dataset.artLoading;
     if(!ok || !loader.naturalWidth || !loader.naturalHeight){
       artCache.set(remote,{failed:true,time:Date.now()});
       el.dataset.artLoaded='fallback';
       return;
     }
     artCache.delete(remote);
     if(!el.isConnected)return;
     const square=loader.naturalWidth/loader.naturalHeight<1.25;
     picture.referrerPolicy='no-referrer';
     picture.onerror=()=>{
       picture.onerror=null;
       picture.src=posterForGame(games.find(item=>item.file===file)||{title:title||file,file});
       picture.classList.remove('is-square');
       el.dataset.artLoaded='fallback';
       artCache.set(remote,{failed:true,time:Date.now()});
     };
     picture.classList.toggle('is-square',square);
     picture.src=remote;
     if(square){
       let backdrop=el.querySelector('.store-cover-art-backdrop');
       if(!backdrop){
         backdrop=document.createElement('div');
         backdrop.className='store-cover-art-backdrop';
         target.before(backdrop);
       }
       backdrop.style.backgroundImage='url('+JSON.stringify(remote)+')';
     }
     el.dataset.artLoaded='1';
   }
   loader.onload=()=>finish(true);
   loader.onerror=()=>finish(false);
   loader.src=remote;
 };
  const featuredGames=[{"file":"Geometry Dash webport.html","title":"Geometry Dash Full","description":"Play the browser-based Geometry Dash webport in Lolite OS.","background":"assets/games/geometry-dash-full-background.svg"},{"file":"clminecraftpocketedition.html","title":"Minecraft: Pocket Edition","description":"Explore the included Minecraft HTML game."},{"file":"clangrybirds2.html","title":"Angry Birds 2","description":"Launch birds and topple structures in this included HTML game."},{"file":"clbaldisbasics.html","title":"Baldi’s Basics","description":"Explore the classic schoolhouse game from Lolite's HTML collection."},{"file":"slope.html","title":"Slope","description":"Stay on the track and test your reflexes."},{"file":"clcookieclicker.html","title":"Cookie Clicker","description":"Keep clicking and build your cookie collection."}];
 let heroIndex=0;
 function heroMarkup(){const g=featuredGames[heroIndex%featuredGames.length];return '<section class="store-hero store-featured-hero" id="store-featured-hero" data-feature-file="'+g.file+'"><div class="store-hero-art" aria-hidden="true"></div><div class="store-hero-copy"><span class="store-eyebrow">'+'FEATURED GAME'+'</span>'+(g.file==='Geometry Dash webport.html'?'<img class="store-hero-game-logo" alt="" src="assets/games/geometry-dash-full-logo.svg" loading="lazy">':'')+'<h1>'+g.title+'</h1><p>'+g.description+'</p><button class="store-primary" type="button" onclick=\'window.loliteStoreAction("'+g.file+'")\'>'+(gamePrice(g)===0?'▶ &nbsp; Play':hasGame(g)?'▶ &nbsp; Play now':'◆ &nbsp; Buy for '+priceLabel(g))+'</button><div class="store-hero-dots" role="tablist" aria-label="Featured games">'+featuredGames.map((item,i)=>'<button type="button" class="'+(i===heroIndex?'active':'')+'" aria-label="Show '+item.title.replace(/"/g,'&quot;')+'" aria-selected="'+(i===heroIndex)+'" onclick="window.loliteStoreHeroSelect('+i+')" title="'+item.title.replace(/"/g,'&quot;')+'"></button>').join('')+'</div></div><div class="store-hero-side"><strong>'+String(heroIndex+1).padStart(2,'0')+'</strong><span>FEATURED</span></div></section>'}
 async function loadHeroArt(){const hero=document.getElementById('store-featured-hero');if(!hero)return;const g=featuredGames[heroIndex%featuredGames.length];const poster=lolitePosterArt(g.title,g.file);hero.style.setProperty('--hero-art','url(\"'+poster+'\")');hero.classList.add('has-feature-art');try{const art=g.background||coverFor(g.file);if(!art||!hero.isConnected||hero.dataset.featureFile!==g.file)return;const img=new Image();img.onload=()=>{if(hero.isConnected&&hero.dataset.featureFile===g.file){hero.style.setProperty('--hero-art','url("'+art.replace(/"/g,'%22')+'")');hero.classList.add('has-feature-art');hero.classList.toggle('store-featured-square',img.naturalWidth/img.naturalHeight<1.25)}};img.src=art}catch(_){}}
 window.loliteStoreHeroSelect=index=>{heroIndex=(Number(index)+featuredGames.length)%featuredGames.length;const hero=document.getElementById('store-featured-hero');if(!hero)return;hero.outerHTML=heroMarkup();loadHeroArt()};
 setInterval(()=>{if(document.getElementById('store-featured-hero'))window.loliteStoreHeroSelect(heroIndex+1)},20000);
 const artworkObserver=typeof IntersectionObserver==='function'
   ? new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;artworkObserver.unobserve(el);window.loliteStorePreview(el,el.dataset.gameFile,el.closest('.store-card')?.querySelector('.store-card-body h3')?.textContent||'Game')}},{rootMargin:'240px 0px'})
   : {observe(el){window.loliteStorePreview(el,el.dataset.gameFile,el.closest('.store-card')?.querySelector('.store-card-body h3')?.textContent||'Game')},unobserve(){}};
 // Watch only the active Game Store results, not the entire OS document.
 // Previously every DOM change (including notifications, chat and wallpaper UI)
 // triggered a full Game Store lookup and a rescan of all visible game covers.
 const registerArtwork=el=>{
  if(el.dataset.artObserved==='1')return;
  el.dataset.artObserved='1';artworkObserver.observe(el);
 };
 let artworkRoot=null;
 const artworkMutationObserver=new MutationObserver(records=>{
  for(const change of records)for(const node of change.addedNodes||[]){
   if(node.nodeType!==1)continue;
   if(node.matches?.('.store-cover[data-game-file]'))registerArtwork(node);
   node.querySelectorAll?.('.store-cover[data-game-file]').forEach(registerArtwork);
  }
 });
 const watchArtwork=()=>{
  const root=document.querySelector('.store-main');
  if(root===artworkRoot)return;
  artworkMutationObserver.disconnect?.();artworkRoot=root;
  if(!root)return;
  artworkMutationObserver.observe(root,{childList:true,subtree:true});
  root.querySelectorAll?.('.store-cover[data-game-file]').forEach(registerArtwork);
 };
 const listCards=list=>{const showing=list.slice(0,visibleCount);return '<div class="store-grid">'+showing.map(card).join('')+'</div>'+(showing.length<list.length?'<div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:28px 6px;color:#a9b6cb;font-size:12px">Showing '+showing.length+' of '+list.length+' <button class="store-play" type="button" style="max-width:170px" onclick="window.loliteStoreMore()">Load more games ↓</button></div>':'')};
 const section=(title,list)=>list.length?'<section class="store-section"><div class="store-section-head"><div><h2>'+title+'</h2><p>'+list.length+' games to explore</p></div><button type="button" onclick=\'window.loliteStoreCategory("'+title+'")\'>View collection →</button></div><div class="store-grid">'+list.slice(0,8).map(card).join('')+'</div></section>':'';
 const gallerySizer=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{
  for(const entry of entries){
   const width=entry.contentRect.width;
   const mode=width<660?'small':width<930?'compact':'wide';
   if(entry.target.dataset.size!==mode)entry.target.dataset.size=mode;
  }
 }):null;
 // Search/sort rerenders update results without destroying the focused toolbar.
 function render({keepToolbar=false,resetScroll=false}={}){
  const root=document.querySelector('.store-main');if(!root)return;
  const previousScroll=root.scrollTop||0;
  const store=root.closest('.store-v41');
  if(store&&gallerySizer&&!store.dataset.galleryObserved){
   store.dataset.galleryObserved='1';gallerySizer.observe(store);
  }
  requestHealth();
  const healthStatus=window.LoliteGameHealth?.summary?.();
  const totalGames=healthy(games);
  const hiddenCount=games.length-totalGames.length;
  const healthText=hiddenCount?hiddenCount+' missing hidden':'Check game files';
  const totalPlayable=playableVersionCount(totalGames);
  const sortMenu='<label class="store-sort-label">Sort <select data-store-sort aria-label="Sort games"><option value="az"'+(sortOrder==='az'?' selected':'')+'>A–Z</option><option value="za"'+(sortOrder==='za'?' selected':'')+'>Z–A</option><option value="servers"'+(sortOrder==='servers'?' selected':'')+'>Most servers</option><option value="popular"'+(sortOrder==='popular'?' selected':'')+'>Most launched</option></select></label>';
  const categoryJump='<label class="store-category-jump">Collection <select data-store-category-jump aria-label="Choose game collection">'+
    categoryNames.map(name=>'<option value="'+encodeLabel(name)+'"'+(active===name?' selected':'')+'>'+encodeLabel(name)+'</option>').join('')+
    '</select></label>';
  const top='<div class="store-top"><div class="store-search-wrap"><span class="store-search-mark" aria-hidden="true">⌕</span><input class="store-search" type="search" aria-label="Search all games" placeholder="Search all games…" autocomplete="off" spellcheck="false" value="'+encodeLabel(query)+'"><button type="button" class="store-clear-search" data-store-clear-search aria-label="Clear game search" title="Clear search" '+(query.trim()?'':'hidden')+'>×</button></div>'+sortMenu+'<button class="store-health-check" type="button" onclick="window.loliteStoreCheckFiles()" aria-label="Check game files" title="'+encodeLabel(healthText)+'">⚙</button><span class="store-count-pill" title="Every distinct server counts as one playable version">'+totalPlayable.toLocaleString()+' games incl. servers ('+totalGames.length+' titles)</span>'+categoryJump+'</div>';
  let list;
  if(query.trim())list=filtered(totalGames);
  else if(active==='Featured'){
   const picks=featuredGames.map(item=>games.find(g=>g.file===item.file)).filter(Boolean);
   list=[...picks,...ranked(games)].filter((g,i,all)=>all.findIndex(item=>item.file===g.file)===i);
  }else if(active==='All Games')list=healthy(games);
  else list=filtered(totalGames);
  // Featured can add titles from the full catalogue; verify they are playable.
  if(active==='Featured'&&!query.trim())list=healthy(list);
  if(query.trim()||active==='All Games'||active==='My Library'||active==='Favorites'||active==='UGS')list=sortGames(list);
  const showFeatured=!query.trim()&&active==='Featured';
  const livePopularity=active==='Popular Games'&&!query.trim();
  const popularityStatus=popularity()?.getStatus()?.status||'loading';
  const summary=livePopularity
    ?'Most launched in Lolite · Last 30 days · Anonymous totals'
    :active==='UGS'?list.length.toLocaleString()+' UGS HTML games included in Lolite · Choose Play to launch'
    :playableVersionCount(list).toLocaleString()+' playable versions · '+list.length+' unique titles';
  const empty=livePopularity
    ?(popularityStatus==='loading'||popularityStatus==='refreshing'
      ?'Loading real game launch counts…'
      :popularityStatus==='unavailable'
        ?'Live popularity counts are unavailable. Try reopening this category.'
        :'No game launches counted yet. Popular Games will fill in as people play.')
      :'No games found. Try another search or category.';
  const privacy=livePopularity
    ?'<div class="store-popularity-privacy"><label><input type="checkbox" onchange="window.LoliteGamePopularity?.setSharingEnabled(this.checked)" '+(popularity()?.shareEnabled()?'checked':'')+'> Count my game launches anonymously</label><small>Only game launch totals are kept, not player accounts or profiles.</small></div>'
    :'';
  const content=(showFeatured?heroMarkup():'')+
    '<section class="store-section"><div class="store-section-head"><div><h2>'+
    (query.trim()?'Search results for “'+encodeLabel(query.trim())+'”':encodeLabel(active))+'</h2><p>'+summary+'</p></div></div>'+
    privacy+(list.length?listCards(list):'<div class="store-empty">'+empty+'</div>')+
    '</section>';
  const toolbar=root.querySelector('.store-top'),results=root.querySelector('.store-results');
  const searchFocused=!!document.activeElement?.matches?.('.store-v41 .store-search');
  // Async health, popularity, wallet and catalogue updates must not replace the
  // input while the user is typing. Keep its selection and focus intact.
  if(toolbar&&results&&(keepToolbar||query.trim()||searchFocused)){
   results.innerHTML=content;
   const searchInput=toolbar.querySelector?.('.store-search');
   if(searchInput&&searchInput.value!==query)searchInput.value=query;
   const clear=toolbar.querySelector?.('[data-store-clear-search]');
   if(clear)clear.hidden=!query.trim();
   const category=toolbar.querySelector?.('[data-store-category-jump]');
   if(category&&category.value!==active)category.value=active;
   const count=toolbar.querySelector?.('.store-count-pill');
   if(count)count.textContent=totalPlayable.toLocaleString()+' games incl. servers ('+totalGames.length+' titles)';
   const check=toolbar.querySelector?.('.store-health-check');
   if(check){check.title=healthText;check.setAttribute('aria-label',healthText)}
  }else root.innerHTML=top+'<div class="store-results">'+content+'</div>';
  root.scrollTop=resetScroll?0:previousScroll;
  watchArtwork();
  if(showFeatured)loadHeroArt();
  // The sidebar may contain thousands of games. Recomputing all 20+ category
  // thumbnails on every keypress caused a serious search typing slowdown.
  if(!keepToolbar&&!query.trim()){refreshActivity();refreshSidebarIcons()}
  else if(!keepToolbar)refreshActivity();
 }
 // The art shown in the left navigation is a real member of the named collection.
 // Empty collections use the existing Games app image, never a text abbreviation.
 const sidebarFallback='assets/icons/cosmos/selected/games.png';
 const failedSidebarImages=new Set();
 function sidebarCandidates(category){
  if(franchiseNames.has(category))return games.filter(g=>g.franchise===category&&!broken(g));
  return games.filter(g=>{
   if(broken(g))return false;
   if(category==='Favorites')return isFavourite(g.file);
   if(category==='Recently Played')return recentSessions.some(row=>row.file===g.file);
   if(category==='Recently Added')return !!g.adminSharedGame||g.recentlyAdded||g.file.startsWith('local-');
   if(category==='My Library')return hasGame(g);
   if(category==='Built-in HTML')return g.url.startsWith('games/');
   if(category==='UGS')return !!g.ugsEntry;
   if(uploadedCollectionNames.has(category))return availableServers(g).some(server=>server.name===category);
  if(category==='DAKNUX')return availableServers(g).some(server=>server.name==='DAKNUX');
   if(category==='Gamefiles ZIP')return !!g.gamefilesRecord||!!g.bundledGameFile;
   if(category==='Free to Play')return gamePrice(g)===0;
   if(category==='Featured')return featuredGames.some(item=>item.file===g.file);
   if(category==='All Games'||category==='Popular Games')return true;
   return g.category===category;
  });
 }
 function sidebarRepresentative(category){
  const candidates=sidebarCandidates(category);
  if(!candidates.length)return null;
  if(category==='Recently Played'){
   return candidates.sort((a,b)=>(recentSessions.find(x=>x.file===b.file)?.at||0)-(recentSessions.find(x=>x.file===a.file)?.at||0))[0];
  }
  const popular=candidates.filter(isRanked).sort((a,b)=>playCount(b)-playCount(a))[0];
  if(popular)return popular;
  const preferred=sidebarGamePicks[category]||[];
  const known=preferred.map(file=>candidates.find(g=>g.file===file)).find(Boolean);
  return known||candidates.find(g=>!!coverFor(g.file))||candidates[0];
 }
 function sidebarImage(category){
  const game=sidebarRepresentative(category);
  if(!game)return sidebarFallback;
  const candidate=coverFor(game.file)||posterForGame(game);
  return failedSidebarImages.has(candidate)?sidebarFallback:candidate;
 }
 function sidebarIcon(category){
  return '<span class="nav-mark nav-game-art" aria-hidden="true">'+
   '<img class="nav-game-thumb" src="'+encodeLabel(sidebarImage(category))+'" alt="" loading="lazy" decoding="async"></span>';
 }
 function refreshSidebarIcons(){
  const store=document.querySelector('.store-v41');
  if(!store)return;
  store.querySelectorAll?.('.store-nav button[data-category]').forEach(button=>{
   const image=button.querySelector('.nav-game-thumb');
   if(!image)return;
   const url=sidebarImage(button.dataset.category);
   if(image.getAttribute('src')!==url)image.setAttribute('src',url);
  });
 }
 document.addEventListener('error',event=>{
  const image=event.target;
  if(!image?.classList?.contains('nav-game-thumb'))return;
  const brokenImage=image.getAttribute('src');
  if(brokenImage!==sidebarFallback){failedSidebarImages.add(brokenImage);image.setAttribute('src',sidebarFallback)}
 },true);
 function shell(){
  const quick=['All Games','My Library','Favorites','Recently Played','Featured','Popular Games'];
  const navButton=cat=>'<button type="button" class="'+(active===cat?'active':'')+'" data-category="'+encodeLabel(cat)+
    '" aria-pressed="'+(active===cat)+'" title="'+encodeLabel(cat)+'">'+sidebarIcon(cat)+
    '<span class="store-nav-title">'+encodeLabel(cat)+'</span></button>';
  const other=categoryNames.filter(cat=>!quick.includes(cat));
  return '<div class="store store-v41"><aside class="store-side" aria-label="Game library navigation">'+
   '<div class="store-brand"><span class="store-logo-symbol" aria-hidden="true"><i></i><i></i><i></i></span>'+
   '<span class="store-brand-copy">Lolite <span>GAME LIBRARY</span></span></div>'+
   '<div class="store-nav-group"><div class="store-nav-label">MY GAMES</div>'+
   '<nav class="store-nav" aria-label="Main game sections">'+quick.map(navButton).join('')+'</nav></div>'+
   '<details class="store-categories"><summary>MORE COLLECTIONS</summary>'+
   '<nav class="store-nav store-nav-extra" aria-label="Game categories">'+other.map(navButton).join('')+'</nav></details>'+
   '<div class="store-profile"><span class="store-profile-avatar" aria-hidden="true">L</span>'+
   '<div><strong>'+encodeLabel(window.LoliteAccounts?.getProfile()?.display_name||'Guest player')+'</strong><small>'+(window.LoliteAccounts?.getUser()?'Lolite account':'Guest library')+'</small></div></div></aside>'+
   '<main class="store-main"><div class="store-empty">Loading your library…</div></main>'+
   '<aside class="store-social" aria-label="Recent game activity"><div class="store-social-inner">'+activityMarkup()+'</div></aside></div>';
 }
 window.loliteStoreCategory=c=>{
  if(!categoryNames.includes(c)&&!['IO Games','Arcade','IO & Casual'].includes(c))return;
  active=c;query='';visibleCount=60;
  document.querySelectorAll('.store-v41 .store-nav button').forEach(b=>{
   const on=b.dataset.category===c;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));
  });
  if(c==='Popular Games')void popularity()?.refresh();
  render({resetScroll:true});
 };
 window.loliteStoreSearch=q=>{
  const next=String(q??'').slice(0,160);
  if(query===next)return;
  query=next;visibleCount=next.trim()?30:60;
  render({keepToolbar:true,resetScroll:true});
 };
 window.loliteStoreMore=()=>{visibleCount+=60;render({keepToolbar:true})};
 window.loliteStoreAction=file=>{
  const g=games.find(g=>g.file===file);if(!g)return;
  if(hasGame(g)){window.loliteStorePlay(file);return}
  const result=economy()?.buyGame?.(g);
  if(!result?.ok){toast(result?.reason||'Lolite Dollars wallet is unavailable.');return}
  toast('Purchased '+g.title+'. Play it from My Library.');render();
 };
 window.loliteStorePlay=file=>{
  const game=games.find(g=>g.file===file);if(!game)return;
  const ugsSelection=Number(serverSelections.get(file)||0);
  if(game.ugsInstalled&&game.ugsRecord&&ugsSelection===0){
   void window.LoliteLocalGamePackages.launchUrl(game.ugsRecord).then(url=>{
     if(window.LoliteGamePlayer?.open({file:game.file,title:game.title,url,source:'UGS · Local HTML',fallbackSources:availableServers(game).filter(x=>x.name!=='UGS')}))markRecent(file);
   }).catch(err=>window.toast?.(err?.message||'Could not launch installed UGS game'));return;
  }
  if(broken(game)){window.toast?.('This game is missing on this host. Try another game or rescan.');return}
  const chosen=Number(serverSelections.get(file)||0);
  if(game.gamefilesRecord&&chosen===0){
   const packages=window.LoliteLocalGamePackages;
   if(!packages?.launchUrl){window.toast?.('Local HTML game support is unavailable.');return}
   void packages.launchUrl(game.gamefilesRecord).then(url=>{
    if(window.LoliteGamePlayer?.open({file:game.file,title:game.title,url,source:'gamefiles.zip · Local HTML'}))markRecent(file);
   }).catch(error=>window.toast?.(error?.message||'Could not open installed HTML game'));
   return;
  }
  if(!hasGame(game)){window.toast?.('This game is not unlocked.');return}
  const source=selectedSource(game);if(!source)return;
  if(!window.LoliteGamePlayer?.open({title:game.title,file:game.file,url:source.url,source:source.name,fallbackSources:fallbackSourcesFor(game,source)})){
   window.toast?.('Could not start this game inside Lolite.');
  }else markRecent(file);
 };

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
 window.loliteStoreCheckFiles=()=>window.LoliteGameHealth?.scan?.(games,{force:true});
 document.addEventListener('click',event=>{
  const clear=event.target.closest?.('.store-v41 [data-store-clear-search]');
  if(clear){event.preventDefault();window.loliteStoreSearch('');document.querySelector('.store-v41 .store-search')?.focus?.();return}
  const node=event.target.closest?.('.store-v41 [data-store-favorite],.store-v41 [data-store-launch],.store-v41 [data-store-details],.store-v41 [data-store-open-chat],.store-v41 [data-category]');
  if(!node)return;
  if(node.dataset.storeFavorite){toggleFavourite(node.dataset.storeFavorite);event.preventDefault();return}
  if(node.dataset.storeLaunch){window.loliteStoreAction(node.dataset.storeLaunch);event.preventDefault();return}
  if(node.dataset.storeDetails){openGameDetail(node.dataset.storeDetails,node);event.preventDefault();return}
  if(node.hasAttribute('data-store-open-chat')){
   if(window.LoliteDesktopShell?.launch)window.LoliteDesktopShell.launch('chatroom');
   else window.openApp?.('chatroom','Lolite Chat');
   event.preventDefault();return;
  }
  if(node.dataset.category){window.loliteStoreCategory(node.dataset.category);event.preventDefault()}
 });
 // Coalesce bursts of keystrokes. Rebuilding dozens of card DOM nodes for
 // every keypress on a thousand-game library caused visible typing delays.
 let searchTimer=0;
 const flushSearch=input=>{
  clearTimeout(searchTimer);searchTimer=0;
  if(input&&input.isConnected!==false&&input.matches?.('.store-v41 .store-search'))
   window.loliteStoreSearch(input.value);
 };
 document.addEventListener('input',event=>{
  const input=event.target.closest?.('.store-v41 .store-search');
  if(input&&!event.isComposing){
   clearTimeout(searchTimer);
   searchTimer=setTimeout(()=>flushSearch(input),110);
  }
 });
 document.addEventListener('compositionend',event=>{
  const input=event.target.closest?.('.store-v41 .store-search');
  if(input)flushSearch(input);
 });
 document.addEventListener('search',event=>{
  const input=event.target.closest?.('.store-v41 .store-search');
  if(input)flushSearch(input);
 });
 document.addEventListener('keydown',event=>{
  const input=event.target.closest?.('.store-v41 .store-search');
  if(input&&event.key==='Escape'&&input.value){
   event.preventDefault();input.value='';flushSearch(input);
  }
 });
 document.addEventListener('change',event=>{
  const category=event.target.closest?.('.store-v41 [data-store-category-jump]');
  if(category){window.loliteStoreCategory(category.value);return}
  const select=event.target.closest?.('.store-v41 [data-store-sort]');
  if(select&&['az','za','servers','popular'].includes(select.value)){
   sortOrder=select.value;render({keepToolbar:true});
  }
  const source=event.target.closest?.('.store-v41 .store-server-select');
  if(source)window.loliteStorePickServer(source.dataset.sourceGame,source.value);
 });
 window.LoliteGameStoreGallery=Object.freeze({
  isFavorite:isFavourite,toggleFavorite:toggleFavourite,
  getFavorites:()=>[...favouriteIds],getRecent:()=>recentSessions.map(row=>({...row})),
  recordRecent:markRecent,getActivityMarkup:activityMarkup,
  getGame:file=>{const g=games.find(g=>g.file===file);return g?{file:g.file,title:g.title}:null},
  replaceFavorites:ids=>{favouriteIds.clear();ids.filter(id=>typeof id==='string').slice(0,250).forEach(id=>favouriteIds.add(id));storeSaved(FAV_KEY,[...favouriteIds]);refreshActivity();}
 });
 window.addEventListener('lolite:activitychange',refreshActivity);
 window.addEventListener('lolite:gamehealthchange',()=>{if(document.querySelector('.store-main'))render({keepToolbar:true})});
 window.addEventListener('lolite:popular-games',()=>{if((active==='Popular Games'||active==='Featured')&&document.querySelector('.store-main'))render({keepToolbar:true})});
 window.addEventListener('lolite-store-purchase',()=>render());
 window.addEventListener('lolite-wallet-updated',()=>render());
 const oldPage=window.page;window.page=function(id){if(id==='games'){setTimeout(render,0);return shell()}return oldPage(id)};
 // Keep the remaining provider's alternative HTML servers.
  loadAdditionalServers();
 buildFranchiseCategories();
 void loadAuthorizedGames().finally(async()=>{
  loadBundledGamefiles();
  loadUploadedGamePacks();
  await syncGamefilesCollection();
  await syncUGSCollection();
  buildFranchiseCategories();
  if(document.querySelector('.store-main'))render();
 });
})();
