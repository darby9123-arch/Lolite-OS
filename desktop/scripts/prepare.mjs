import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {Resvg} from '@resvg/resvg-js';
import {build} from 'esbuild';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.dirname(root),web=path.join(root,'web'),out=path.join(root,'build');
await fs.rm(web,{recursive:true,force:true});await fs.mkdir(web,{recursive:true});await fs.mkdir(out,{recursive:true});
for(const name of ['index.html','app.js','styles.css','core','assets','games','html games','scramjet','uv']) {
  try{await fs.cp(path.join(repo,name),path.join(web,name),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
}
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
// The existing library catalogue must also work without the GitHub contents API.
const gameFiles=(await fs.readdir(path.join(web,'html games'))).filter(name=>/\.html?$/i.test(name));
await fs.writeFile(path.join(web,'game-catalog.json'),JSON.stringify(gameFiles.map(name=>({name,type:'file'}))));
const vendor=path.join(web,'vendor');await fs.mkdir(vendor,{recursive:true});
const packages=path.join(root,'node_modules');
const copy=async (from,to)=>{await fs.mkdir(path.dirname(path.join(vendor,to)),{recursive:true});await fs.copyFile(path.join(packages,from),path.join(vendor,to));};
await copy('@supabase/supabase-js/dist/umd/supabase.js','supabase.js');
await copy('marked/marked.min.js','marked.js');
await copy('heic2any/dist/heic2any.min.js','heic2any.js');
await copy('pako/dist/pako.min.js','pako.js');
await copy('utif/UTIF.js','utif.js');
await copy('pdfjs-dist/build/pdf.min.mjs','pdf.mjs');
await copy('pdfjs-dist/build/pdf.worker.min.mjs','pdf.worker.mjs');
await fs.cp(path.join(packages,'pdfjs-dist/cmaps'),path.join(vendor,'cmaps'),{recursive:true});
await fs.cp(path.join(packages,'pdfjs-dist/standard_fonts'),path.join(vendor,'standard_fonts'),{recursive:true});
await copy('xlsx/dist/xlsx.full.min.js','xlsx.js');
await build({stdin:{contents:'import hljs from "highlight.js";window.hljs=hljs;',resolveDir:root},bundle:true,minify:true,platform:'browser',format:'iife',outfile:path.join(vendor,'highlight.js')});
// All Three add-ons share one module graph; import maps keep class identities consistent.
await copy('three/build/three.module.js','three/three.mjs');
for(const file of ['controls/OrbitControls.js','loaders/OBJLoader.js','loaders/STLLoader.js','loaders/GLTFLoader.js','utils/BufferGeometryUtils.js']) await copy('three/examples/jsm/'+file,'three/'+file);
await build({entryPoints:[require.resolve('@mlc-ai/web-llm')],bundle:true,minify:true,platform:'browser',format:'esm',outfile:path.join(vendor,'webllm.mjs')});
const fontDir=path.join(packages,'@fontsource-variable/plus-jakarta-sans');
await fs.cp(path.join(fontDir,'files'),path.join(vendor,'fonts'),{recursive:true});
let fontCSS=await fs.readFile(path.join(fontDir,'index.css'),'utf8');fontCSS=fontCSS.replaceAll('./files/','./fonts/').replaceAll("'Plus Jakarta Sans Variable'","'Plus Jakarta Sans'");
await fs.writeFile(path.join(vendor,'fonts.css'),fontCSS);
await fs.mkdir(path.join(root,'launcher/fonts'),{recursive:true});
await fs.copyFile(path.join(fontDir,'files/plus-jakarta-sans-latin-wght-normal.woff2'),path.join(root,'launcher/fonts/plus-jakarta-sans-latin-wght-normal.woff2'));
const replacements=new Map([
 ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/dist/umd/supabase.js','lolite://app/vendor/supabase.js'],
 ['https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.11.1/highlight.min.js','lolite://app/vendor/highlight.js'],
 ['https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js','lolite://app/vendor/marked.js'],
 ['https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js','lolite://app/vendor/heic2any.js'],
 ['https://cdn.jsdelivr.net/npm/pako@1.0.11/dist/pako.min.js','lolite://app/vendor/pako.js'],
 ['https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js','lolite://app/vendor/utif.js'],
 ['https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs','lolite://app/vendor/pdf.mjs'],
 ['https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs','lolite://app/vendor/pdf.worker.mjs'],
 ['https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js','lolite://app/vendor/xlsx.js'],
 ['https://esm.sh/three@0.169.0/examples/jsm/','lolite://app/vendor/three/'],
 ['https://esm.sh/three@0.169.0','lolite://app/vendor/three/three.mjs'],
 ['https://esm.run/@mlc-ai/web-llm','lolite://app/vendor/webllm.mjs']
]);
for(const name of ['index.html',...(await fs.readdir(path.join(web,'core'))).filter(n=>n.endsWith('.js')).map(n=>'core/'+n)]){
  const file=path.join(web,name);let source=await fs.readFile(file,'utf8');
  for(const [remote,local] of replacements)source=source.replaceAll(remote,local);
  source=source.replaceAll('https://api.github.com/repos/darby9123-arch/Lolite-OS/contents/html%20games','lolite://app/game-catalog.json');
  // Fonts are bundled; suppress redundant online font requests.
  source=source.replaceAll(/<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/g,'');
  if(name==='index.html')source=source.replace('</head>','<link rel="stylesheet" href="vendor/fonts.css"><link rel="stylesheet" href="desktop-adapter.css"><script type="importmap">{"imports":{"three":"lolite://app/vendor/three/three.mjs"}}</script><script defer src="desktop-adapter.js"></script></head>');
  if(name==='core/version-check.js') source=source.replace(/const CURRENT_VERSION='[^']*'/,`const CURRENT_VERSION='${pkg.version}'`);
  if(name==='core/file-viewers.js')source=source.replace('isEvalSupported:false','isEvalSupported:false,cMapUrl:"lolite://app/vendor/cmaps/",cMapPacked:true,standardFontDataUrl:"lolite://app/vendor/standard_fonts/"');
  // Isolate all frames, including uploaded blob HTML, from the privileged desktop origin.
  source=source.replaceAll('<iframe ','<iframe sandbox="allow-scripts allow-forms allow-pointer-lock allow-downloads allow-modals" ');
  await fs.writeFile(file,source);
}
await fs.copyFile(path.join(root,'src/adapter.js'),path.join(web,'desktop-adapter.js'));
await fs.copyFile(path.join(root,'src/adapter.css'),path.join(web,'desktop-adapter.css'));
const logo=await fs.readFile(path.join(repo,'assets/lolite-glass-logo.svg'));
const png=new Resvg(logo,{fitTo:{mode:'width',value:256}}).render().asPng();
await fs.writeFile(path.join(out,'icon.png'),png);
const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
await fs.writeFile(path.join(out,'icon.ico'),Buffer.concat([header,png]));
await fs.copyFile(path.join(repo,'assets/lolite-glass-logo.svg'),path.join(root,'launcher/logo.svg'));
console.log(`Prepared Lolite OS ${pkg.version}: local application, fonts, icons and viewers.`);
