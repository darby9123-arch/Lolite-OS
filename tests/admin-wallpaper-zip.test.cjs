const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const zlib=require('node:zlib');
const {Blob,File}=require('node:buffer');
const source=fs.readFileSync('core/wallpaper-zip.js','utf8');
const table=Array.from({length:256},(_,n)=>{
 let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0
});
function crc32(bytes){
 let c=0xffffffff;for(const byte of bytes)c=table[(c^byte)&255]^(c>>>8);
 return (c^0xffffffff)>>>0;
}
function makeZip(items){
 const locals=[],centers=[];let offset=0;
 for(const item of items){
  const name=Buffer.from(item.name),body=Buffer.from(item.bytes);
  const compressed=item.deflate?zlib.deflateRawSync(body):body;
  const method=item.deflate?8:0;
  const crc=crc32(body);
  const local=Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);
  local.writeUInt16LE(method,8);local.writeUInt32LE(crc,14);
  local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(body.length,22);
  local.writeUInt16LE(name.length,26);
  locals.push(local,name,compressed);
  const central=Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);
  central.writeUInt16LE(method,10);central.writeUInt32LE(crc,16);
  central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(body.length,24);
  central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
  centers.push(central,name);
  offset+=local.length+name.length+compressed.length;
 }
 const centralData=Buffer.concat(centers);
 const eocd=Buffer.alloc(22);
 eocd.writeUInt32LE(0x06054b50,0);eocd.writeUInt16LE(items.length,8);
 eocd.writeUInt16LE(items.length,10);eocd.writeUInt32LE(centralData.length,12);
 eocd.writeUInt32LE(offset,16);
 return Buffer.concat([...locals,centralData,eocd]);
}
const minimalMp4=Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.alloc(32)]);
function inspector(){
 const window={};
 class FakeVideo{
  constructor(){this.videoWidth=1920;this.videoHeight=1080;this.duration=12}
  removeAttribute(){this.src=''}
  load(){if(this.src)queueMicrotask(()=>this.onloadedmetadata?.())}
 }
 const context={
  window,document:{createElement:()=>new FakeVideo()},File,Blob,TextDecoder,
  Uint8Array,Uint32Array,DataView,URL,DecompressionStream,
  setTimeout,clearTimeout,console
 };
 vm.runInNewContext(source,context,{filename:'wallpaper-zip.js'});
 return window.LoliteWallpaperZip;
}
test('ZIP inspector exports limits and reviews real MP4 headers',async()=>{
 const imp=inspector();
 assert.equal(imp.limits.maxVideoMB,50);
 const zip=makeZip([
  {name:'Space/Cosmic_Pulse.mp4',bytes:minimalMp4,deflate:true},
  {name:'Nature/Calm-Sea.mp4',bytes:minimalMp4},
  {name:'notes.txt',bytes:Buffer.from('not a wallpaper')}
 ]);
 const file=new File([zip],'wallpapers.zip',{type:'application/zip'});
 const clips=await imp.inspect(file);
 assert.equal(clips.length,2);
 assert.equal(clips[0].name,'Cosmic Pulse');
 assert.equal(clips[1].name,'Calm Sea');
 assert.equal(clips[0].width,1920);
 assert.equal(clips[0].duration,12);
 assert.ok(clips.every(x=>x.selected&&!x.error&&x.blob.type==='video/mp4'));
});
test('ZIP inspector rejects traversal paths',async()=>{
 const imp=inspector();
 const zip=makeZip([{name:'../hijack.mp4',bytes:minimalMp4}]);
 await assert.rejects(imp.inspect(new File([zip],'unsafe.zip')),/Unsafe file path/);
});
test('ZIP inspector rejects MP4 extension with invalid signature',async()=>{
 const imp=inspector();
 const zip=makeZip([{name:'bad.mp4',bytes:Buffer.from('hello fake mp4')}]);
 await assert.rejects(imp.inspect(new File([zip],'fake.zip')),/not an MP4/);
});
test('ZIP inspector rejects modified contents with mismatched CRC',async()=>{
 const imp=inspector();
 const zip=makeZip([{name:'test.mp4',bytes:minimalMp4}]);
 zip[50]^=0xff;
 await assert.rejects(imp.inspect(new File([zip],'broken.zip')),/checksum failed/);
});
test('Admin integration only publishes selections after review',()=>{
 const admin=fs.readFileSync('core/lolite-admin.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 assert.match(admin,/if\(isZip\)return publishZip\(form,file,title\)/);
 assert.match(admin,/entry\.selected&&!entry\.error&&!entry\.published/);
 assert.match(admin,/storage\.from\(BUCKET\)\.upload\(storagePath,entry\.blob/);
 assert.match(admin,/if\(!state\.admin\|\|!state\.user\|\|!sb\)/);
 assert.ok(html.indexOf('core/wallpaper-zip.js')<html.indexOf('core/lolite-admin.js'));
});


test('Video uploads store generated frame posters beside the original video',()=>{
 const admin=fs.readFileSync('core/lolite-admin.js','utf8');
 assert.match(admin,/uploadPoster\(entry\.blob,storagePath\)/);
 assert.match(admin,/uploadPoster\(file,storagePath\)/);
 assert.match(admin,/poster_url:thumbnail\.url/);
 assert.match(admin,/poster_url:poster\?\.url\|\|null/);
 assert.match(admin,/\.select\('id,kind,title,url,poster_url,storage_path/);
 assert.match(admin,/data-la-action="poster"/);
});
test('Uploaded MP4s use smooth looping and the Special Live Wallpapers filter',()=>{
 const source=fs.readFileSync('core/wallpapers.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 const loop=fs.readFileSync('core/wallpaper-loop.js','utf8');
 assert.match(source,/Special Live Wallpapers/);
 assert.match(source,/wall\.id\.startsWith\('user-'\)/);
 assert.match(source,/window\.LoliteSeamlessVideo\.create/);
 assert.match(source,/item\.poster_url/);
 assert.match(source,/requestPoster\(collection\[collection\.length-1\]\)/);
 assert.match(source,/data-wall-poster-for/);
 assert.match(loop,/els=\[document\.createElement\('video'\),document\.createElement\('video'\)\]/);
 assert.match(loop,/opacity='1'/);
 assert.match(loop,/swap\(\)/);
 assert.ok(html.indexOf('core/wallpaper-thumbnails.js')<html.indexOf('core/wallpapers.js'));
 assert.ok(html.indexOf('core/wallpaper-loop.js')<html.indexOf('core/wallpapers.js'));
});
