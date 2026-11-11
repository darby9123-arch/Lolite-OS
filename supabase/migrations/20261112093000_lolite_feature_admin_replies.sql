-- Admin replies and optional screenshots for Lolite Feature Requests.
-- "Done" replies atomically move requests to the existing public shipped state.
create table public.lolite_feature_replies (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.lolite_feature_requests(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 kind text not null default 'update' check(kind in ('update','done')),
 message text not null check(char_length(btrim(message)) between 1 and 1200),
 screenshot_path text check(
  screenshot_path is null or (
   char_length(screenshot_path) between 80 and 220
   and screenshot_path like request_id::text || '/' || author_id::text || '/%'
   and screenshot_path ~* '\.(png|jpe?g|webp)$'
  )
 ),
 created_at timestamptz not null default now()
);
create index lolite_feature_replies_request_time_idx
 on public.lolite_feature_replies(request_id,created_at asc);
alter table public.lolite_feature_replies enable row level security;
grant select,insert on public.lolite_feature_replies to authenticated;

create policy "feature replies visible to allowed request readers"
on public.lolite_feature_replies for select to authenticated
using (exists (
 select 1 from public.lolite_feature_requests r
 where r.id=request_id
 and (r.status in ('open','planned','in_progress','shipped')
  or r.submitted_by=(select auth.uid())
  or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid())))
));
create policy "feature replies are admin-only"
on public.lolite_feature_replies for insert to authenticated
with check (
 author_id=(select auth.uid())
 and exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
);

-- Trigger execution is never granted to members. RLS on replies verifies the
-- admin at insertion time; a Done reply and the status change commit together.
create function public.lolite_feature_reply_done()
returns trigger
language plpgsql
security definer
set search_path=pg_catalog,public
as $$
begin
 if NEW.kind='done' then
  update public.lolite_feature_requests
   set status='shipped',updated_at=now()
   where id=NEW.request_id;
 end if;
 return NEW;
end;
$$;
revoke all on function public.lolite_feature_reply_done() from public,anon,authenticated;
create trigger lolite_feature_reply_done_trigger
 after insert on public.lolite_feature_replies
 for each row execute function public.lolite_feature_reply_done();

-- Existing server-side INSERT policy already blocks upvotes on shipped items.
-- Also block removing old votes after an item has been completed.
drop policy if exists "feature voters remove own vote" on public.lolite_feature_votes;
create policy "feature voters remove own vote" on public.lolite_feature_votes
 for delete to authenticated using (
 voter_id=(select auth.uid())
 and exists (
  select 1 from public.lolite_feature_requests r
  where r.id=request_id and r.status in ('open','planned','in_progress')
 )
 );

-- Private screenshots are readable only for requests visible to the member.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values('lolite-feature-proofs','lolite-feature-proofs',false,5242880,
 array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "feature proof upload admin only"
on storage.objects for insert to authenticated
with check (
 bucket_id='lolite-feature-proofs'
 and (storage.foldername(name))[2]=(select auth.uid())::text
 and storage.extension(name) in ('png','jpg','jpeg','webp')
 and exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
 and exists(
  select 1 from public.lolite_feature_requests r
  where r.id::text=(storage.foldername(name))[1]
 )
);
create policy "feature proof view allowed request"
on storage.objects for select to authenticated
using (
 bucket_id='lolite-feature-proofs'
 and exists (
  select 1 from public.lolite_feature_requests r
  where r.id::text=(storage.foldername(name))[1]
  and (r.status in ('open','planned','in_progress','shipped')
   or r.submitted_by=(select auth.uid())
   or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid())))
 )
);
create policy "feature proof cleanup by uploader admin"
on storage.objects for delete to authenticated
using (
 bucket_id='lolite-feature-proofs'
 and (storage.foldername(name))[2]=(select auth.uid())::text
 and exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
);
