-- Lolite Music: community track moderation, playlists and song requests.
create table public.lolite_music_tracks(
 id uuid primary key default gen_random_uuid(),
 uploader_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 120),
 artist text not null check(length(trim(artist)) between 1 and 80),
 album text not null default '' check(length(album)<=80),
 storage_path text not null unique check(length(storage_path) between 38 and 160),
 mime_type text not null check(mime_type in ('audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/webm','audio/aac')),
 file_bytes bigint not null check(file_bytes between 1 and 20971520),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 reviewed_by uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 constraint music_owner_path check(storage_path like uploader_id::text || '/%')
);
create index music_tracks_status_idx on public.lolite_music_tracks(status,created_at desc);
create index music_tracks_uploader_idx on public.lolite_music_tracks(uploader_id,created_at desc);
alter table public.lolite_music_tracks enable row level security;
grant select,insert,update,delete on public.lolite_music_tracks to authenticated;
create policy "music track read" on public.lolite_music_tracks for select to authenticated using(
 status='approved' or uploader_id=auth.uid() or exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()));
create policy "music track submit" on public.lolite_music_tracks for insert to authenticated with check(
 uploader_id=auth.uid() and (status='pending' or
 (status='approved' and exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()))));
create policy "music track moderate" on public.lolite_music_tracks for update to authenticated
 using(exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()))
 with check(exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()));
create policy "music track remove" on public.lolite_music_tracks for delete to authenticated
 using((uploader_id=auth.uid() and status<>'approved')
 or exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()));

create table public.lolite_music_playlists(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 80),
 created_at timestamptz not null default now()
);
create index music_playlists_owner_idx on public.lolite_music_playlists(owner_id,created_at desc);
alter table public.lolite_music_playlists enable row level security;
grant select,insert,update,delete on public.lolite_music_playlists to authenticated;
create policy "music playlists read" on public.lolite_music_playlists for select to authenticated using(owner_id=auth.uid());
create policy "music playlists add" on public.lolite_music_playlists for insert to authenticated with check(owner_id=auth.uid());
create policy "music playlists edit" on public.lolite_music_playlists for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "music playlists remove" on public.lolite_music_playlists for delete to authenticated using(owner_id=auth.uid());

create table public.lolite_music_playlist_tracks(
 playlist_id uuid not null references public.lolite_music_playlists(id) on delete cascade,
 track_id uuid not null references public.lolite_music_tracks(id) on delete cascade,
 added_at timestamptz not null default now(),
 primary key(playlist_id,track_id)
);
alter table public.lolite_music_playlist_tracks enable row level security;
grant select,insert,delete on public.lolite_music_playlist_tracks to authenticated;
create policy "music playlist entries read" on public.lolite_music_playlist_tracks for select to authenticated
 using(exists(select 1 from public.lolite_music_playlists p where p.id=playlist_id and p.owner_id=auth.uid()));
create policy "music playlist entries add" on public.lolite_music_playlist_tracks for insert to authenticated
 with check(exists(select 1 from public.lolite_music_playlists p where p.id=playlist_id and p.owner_id=auth.uid())
 and exists(select 1 from public.lolite_music_tracks t where t.id=track_id and t.status='approved'));
create policy "music playlist entries remove" on public.lolite_music_playlist_tracks for delete to authenticated
 using(exists(select 1 from public.lolite_music_playlists p where p.id=playlist_id and p.owner_id=auth.uid()));

create table public.lolite_music_requests(
 id uuid primary key default gen_random_uuid(),
 requested_by uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 120),
 artist text not null check(length(trim(artist)) between 1 and 80),
 note text not null default '' check(length(note)<=400),
 status text not null default 'open' check(status in ('open','fulfilled','declined')),
 reviewed_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);
create index music_requests_status_idx on public.lolite_music_requests(status,created_at desc);
alter table public.lolite_music_requests enable row level security;
grant select,insert,update,delete on public.lolite_music_requests to authenticated;
create policy "music requests read" on public.lolite_music_requests for select to authenticated
 using(requested_by=auth.uid() or exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()));
create policy "music requests add" on public.lolite_music_requests for insert to authenticated
 with check(requested_by=auth.uid() and status='open');
create policy "music requests moderate" on public.lolite_music_requests for update to authenticated
 using(exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()))
 with check(exists(select 1 from public.lolite_admins a where a.user_id=auth.uid()));
create policy "music requests retract" on public.lolite_music_requests for delete to authenticated
 using(requested_by=auth.uid() and status='open');

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('lolite-music','lolite-music',false,20971520,
 array['audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/webm','audio/aac']);
create policy "music audio upload" on storage.objects for insert to authenticated with check(
 bucket_id='lolite-music' and (storage.foldername(name))[1]=auth.uid()::text
 and storage.extension(name) in ('mp3','m4a','ogg','wav','webm','aac'));
create policy "music audio read" on storage.objects for select to authenticated using(
 bucket_id='lolite-music' and
 ((storage.foldername(name))[1]=auth.uid()::text
 or exists(select 1 from public.lolite_admins a where a.user_id=auth.uid())
 or exists(select 1 from public.lolite_music_tracks t where t.storage_path=name and t.status='approved')));
create policy "music audio delete" on storage.objects for delete to authenticated using(
 bucket_id='lolite-music' and
 (exists(select 1 from public.lolite_admins a where a.user_id=auth.uid())
 or ((storage.foldername(name))[1]=auth.uid()::text and
 not exists(select 1 from public.lolite_music_tracks t where t.storage_path=name and t.status='approved'))));
