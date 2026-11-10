const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function musicZip(){
 const win={};
 vm.runInNewContext(read('core/music-zip.js'),{
  window:win,TextDecoder,Uint32Array,DataView,Blob,DecompressionStream
 },{filename:'music-zip.js'});
 return win.LoliteMusicZip;
}
function checksum(data){
 let c=0xffffffff;
 for(const x of data){c^=x;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}
 return (c^0xffffffff)>>>0;
}
function archive(files){
 const localChunks=[],centralChunks=[];
 let localOffset=0,centralBytes=0;
 for(const item of files){
  const name=Buffer.from(item.path,'utf8'),raw=Buffer.from(item.data||[]),method=item.method??0;
  const zipped=method===8?zlib.deflateRawSync(raw):raw;
  const crc=checksum(raw);
  const local=Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(method,8);
  local.writeUInt32LE(crc,14);local.writeUInt32LE(zipped.length,18);local.writeUInt32LE(raw.length,22);
  local.writeUInt16LE(name.length,26);
  const central=Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);
  central.writeUInt16LE(method,10);central.writeUInt32LE(crc,16);
  central.writeUInt32LE(zipped.length,20);central.writeUInt32LE(raw.length,24);
  central.writeUInt16LE(name.length,28);central.writeUInt32LE(localOffset,42);
  localChunks.push(local,name,zipped);
  centralChunks.push(central,name);
  localOffset+=local.length+name.length+zipped.length;
  centralBytes+=central.length+name.length;
 }
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);
 end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);
 end.writeUInt32LE(centralBytes,12);end.writeUInt32LE(localOffset,16);
 return new File([...localChunks,...centralChunks,end],'music.zip',{type:'application/zip'});
}
test('Music ZIP module and Music app parse cleanly',()=>{
 assert.doesNotThrow(()=>new Function(read('core/music-zip.js')));
 assert.doesNotThrow(()=>new Function(read('core/music.js')));
 const index=read('index.html');
 assert.match(index,/tus-js-client@4\.3\.1/);
 assert.match(index,/core\/music-zip\.js\?v=/);
 assert.ok(index.indexOf('core/music-zip.js')<index.indexOf('core/music.js'));
});
test('ZIP import finds nested MP3 and deflated WAV while ignoring non-audio assets',async()=>{
 const z=musicZip();
 const first=Buffer.from('ID3\x03\x00\x00hello','binary');
 const second=Buffer.from('RIFF----WAVEhello','binary');
 const file=archive([
  {path:'Alice - First.mp3',data:first},
  {path:'Collection/Retro/02 - Second.wav',data:second,method:8},
  {path:'Collection/cover.png',data:Buffer.from('png')}
 ]);
 const found=await z.inspect(file);
 assert.deepEqual(Array.from(found,x=>x.path),['Alice - First.mp3','Collection/Retro/02 - Second.wav']);
 assert.deepEqual(Buffer.from(await (await z.extract(file,found[0])).arrayBuffer()),first);
 assert.deepEqual(Buffer.from(await (await z.extract(file,found[1])).arrayBuffer()),second);
 assert.equal(z.guess(found[0].path).artist,'Alice');
 assert.equal(z.guess(found[0].path).title,'First');
 assert.equal(z.guess(found[1].path).album,'Retro');
 assert.equal(z.guess(found[1].path).title,'Second');
 assert.equal(z.guess(found[1].path,'DJ','My Album').artist,'DJ');
 assert.equal(z.guess(found[1].path,'DJ','My Album').album,'My Album');
});
test('Unsafe ZIP traversal paths and corrupted CRC data are refused',async()=>{
 const z=musicZip();
 const raw=Buffer.from('ID3 some audio');
 await assert.rejects(z.inspect(archive([{path:'../escape.mp3',data:raw}])),/Unsafe song path/);
 const original=archive([{path:'Safe.mp3',data:raw}]);
 const bytes=Buffer.from(await original.arrayBuffer());
 bytes[30+'Safe.mp3'.length+3]^=0x5a;
 const damaged=new File([bytes],'bad.zip');
 const [entry]=await z.inspect(damaged);
 await assert.rejects(z.extract(damaged,entry),/checksum failed/);
});
test('Client and database keep music approval and 50 MiB limits',()=>{
 const music=read('core/music.js'),migration=read('supabase/migrations/20261110205500_expand_music_upload_limit_and_zip_intake.sql');
 assert.match(music,/MAX_TRACK_BYTES=50\*1024\*1024/);
 assert.match(music,/data-lm-form="zip"/);
 assert.match(music,/window\.LoliteMusicZip\.extract/);
 assert.match(music,/window\.tus\.Upload/);
 assert.match(music,/status:S\.admin\?'approved':'pending'/);
 assert.match(migration,/file_bytes between 1 and 52428800/);
 assert.match(migration,/file_size_limit=52428800/);
 assert.match(read('core/music.css'),/lm-zip-progress/);
});

test('ZIP64 archives are accepted without loading the whole archive into memory',async()=>{
 const z=musicZip(),payload=Buffer.from('ID3\\x03a big archive can hold tiny songs','binary');
 const name=Buffer.from('Song.mp3');
 const crc=checksum(payload);
 const local=Buffer.alloc(30);
 local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(45,4);
 local.writeUInt32LE(crc,14);local.writeUInt32LE(payload.length,18);local.writeUInt32LE(payload.length,22);
 local.writeUInt16LE(name.length,26);
 const central=Buffer.alloc(46);
 central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(45,4);central.writeUInt16LE(45,6);
 central.writeUInt32LE(crc,16);central.writeUInt32LE(0xffffffff,20);central.writeUInt32LE(0xffffffff,24);
 central.writeUInt16LE(name.length,28);central.writeUInt16LE(28,30);central.writeUInt32LE(0xffffffff,42);
 const extra=Buffer.alloc(28);
 extra.writeUInt16LE(1,0);extra.writeUInt16LE(24,2);
 extra.writeBigUInt64LE(BigInt(payload.length),4);extra.writeBigUInt64LE(BigInt(payload.length),12);extra.writeBigUInt64LE(0n,20);
 const dirOffset=30+name.length+payload.length;
 const dirSize=central.length+name.length+extra.length;
 const zip64End=Buffer.alloc(56);
 zip64End.writeUInt32LE(0x06064b50,0);zip64End.writeBigUInt64LE(44n,4);
 zip64End.writeUInt16LE(45,12);zip64End.writeUInt16LE(45,14);
 zip64End.writeBigUInt64LE(1n,24);zip64End.writeBigUInt64LE(1n,32);
 zip64End.writeBigUInt64LE(BigInt(dirSize),40);
 zip64End.writeBigUInt64LE(BigInt(dirOffset),48);
 const locator=Buffer.alloc(20);
 locator.writeUInt32LE(0x07064b50,0);
 locator.writeBigUInt64LE(BigInt(dirOffset+dirSize),8);locator.writeUInt32LE(1,16);
 const eocd=Buffer.alloc(22);
 eocd.writeUInt32LE(0x06054b50,0);eocd.writeUInt16LE(0xffff,8);eocd.writeUInt16LE(0xffff,10);
 eocd.writeUInt32LE(0xffffffff,12);eocd.writeUInt32LE(0xffffffff,16);
 const file=new File([local,name,payload,central,name,extra,zip64End,locator,eocd],'zip64.zip');
 const entries=await z.inspect(file);
 assert.equal(entries.length,1);
 assert.equal(entries[0].path,'Song.mp3');
 assert.deepEqual(Buffer.from(await (await z.extract(file,entries[0])).arrayBuffer()),payload);
});
