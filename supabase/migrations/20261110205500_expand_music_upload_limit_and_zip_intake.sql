-- Lolite Music: accept 50 MiB per audio file on Supabase Free.
-- ZIP archive sizes are not restricted here because the archive stays in the user's browser.
-- On a paid plan, lifting this per-track cap also requires revising the client-side
-- 50 MiB validation and the project's Storage global limit.
alter table public.lolite_music_tracks
 drop constraint if exists lolite_music_tracks_file_bytes_check;
alter table public.lolite_music_tracks
 add constraint lolite_music_tracks_file_bytes_check
 check (file_bytes between 1 and 52428800);
update storage.buckets set file_size_limit=52428800 where id='lolite-music';
