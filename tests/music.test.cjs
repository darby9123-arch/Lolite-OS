const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('Music script parses and is loaded by the desktop',()=>{
 const js=read('core/music.js');assert.doesNotThrow(()=>new Function(js));
 const html=read('index.html');assert.match(html,/core\/music\.js\?v=/);assert.match(html,/core\/music\.css\?v=/);
});
test('Music has real audio and storage-backed sharing rather than an iframe',()=>{
 const js=read('core/music.js');
 for(const term of ['new Audio()','createSignedUrl','lolite_music_tracks','lolite_music_playlists','lolite_music_playlist_tracks','lolite_music_requests','data-lm-form="upload"','data-lm-action="approve"'])assert.ok(js.includes(term),term);
 assert.doesNotMatch(js,/<iframe/i);
});
test('Music moderation and playlists are protected by Postgres RLS',()=>{
 const sql=read('supabase/migrations/20261110083000_lolite_music_catalog_playlists_requests.sql');
 for(const name of ['lolite_music_tracks','lolite_music_playlists','lolite_music_playlist_tracks','lolite_music_requests'])assert.match(sql,new RegExp('alter table public\\.'+name+' enable row level security'));
 assert.match(sql,/status='approved' and exists\(select 1 from public\.lolite_admins/);
 assert.match(sql,/public=false|false,20971520/);
 assert.match(sql,/storage\.foldername\(name\)/);
});
test('Music is on the Start menu and App Store',()=>{
 assert.match(read('core/interface.js'),/\['music','Lolite Music'/);
 assert.match(read('core/app-store.js'),/id:'music',name:'Lolite Music'/);
 assert.match(read('core/economy-store.js'),/FREE_APPS=.*"music"/);
});
