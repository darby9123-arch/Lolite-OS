-- Lolite Clips: private uploads until explicitly approved by authorised Lolite admins.
-- Browser-saved clips live only in IndexedDB and do not touch these cloud tables.
create table public.lolite_clips (
 id uuid primary key default gen_random_uuid(),
 uploader_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(btrim(title)) between 3 and 100),
 storage_path text not null unique check (char_length(storage_path) between 40 and 130),
 mime_type text not null check (mime_type in ('video/webm','video/mp4')),
 file_bytes bigint not null check (file_bytes between 1 and 20971520),
 duration_seconds integer not null check (duration_seconds between 1 and 120),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 reviewer_id uuid references auth.users(id) on delete set null,
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 constraint lolite_clip_owner_path check (
  storage_path = uploader_id::text || '/' || id::text ||
  case when mime_type='video/webm' then '.webm' else '.mp4' end
 )
);
create index lolite_clips_status_date_idx on public.lolite_clips(status,created_at desc);
create index lolite_clips_owner_date_idx on public.lolite_clips(uploader_id,created_at desc);
alter table public.lolite_clips enable row level security;
grant select,insert,delete on public.lolite_clips to authenticated;
grant update (status,reviewer_id,reviewed_at) on public.lolite_clips to authenticated;
create policy "clips member approved and own review" on public.lolite_clips for select to authenticated
using (
 status='approved' or uploader_id=(select auth.uid())
 or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
);
create policy "clips own pending only" on public.lolite_clips for insert to authenticated
with check (
 uploader_id=(select auth.uid()) and status='pending'
 and reviewer_id is null and reviewed_at is null
);
create policy "clips admin moderation" on public.lolite_clips for update to authenticated
using(exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid())))
with check(exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid())));
create policy "clips owner can unshare or admin remove" on public.lolite_clips for delete to authenticated
using (
 uploader_id=(select auth.uid())
 or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
);

-- Private-by-default storage: screenshot or desktop recordings can contain sensitive information.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('lolite-clips','lolite-clips',false,20971520,array['video/webm','video/mp4'])
on conflict (id) do nothing;
create policy "clips upload only own folder" on storage.objects for insert to authenticated
with check(
 bucket_id='lolite-clips' and (storage.foldername(name))[1]=(select auth.uid())::text
 and storage.extension(name) in ('webm','mp4')
);
create policy "clips view only approved or own or admin" on storage.objects for select to authenticated
using(
 bucket_id='lolite-clips'
 and (
   (storage.foldername(name))[1]=(select auth.uid())::text
   or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
   or exists(select 1 from public.lolite_clips c
     where c.storage_path=name and c.status='approved')
 )
);
create policy "clips owner or admin delete upload" on storage.objects for delete to authenticated
using(
 bucket_id='lolite-clips'
 and (
   (storage.foldername(name))[1]=(select auth.uid())::text
   or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
 )
);
