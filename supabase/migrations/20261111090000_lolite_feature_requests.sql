-- Lolite OS community Feature Requests
-- Authenticated users suggest ideas privately for review; approved ideas are visible to members.
-- Votes are per user. A trigger maintains public counts without exposing voter IDs.
create table public.lolite_feature_requests (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 6 and 120),
  description text not null check (char_length(btrim(description)) between 15 and 2000),
  category text not null default 'Other' check (category in ('Apps','UI & Themes','Games','Music','Performance','Other')),
  status text not null default 'pending' check (status in ('pending','open','planned','in_progress','shipped','declined')),
  admin_note text not null default '' check (char_length(admin_note) <= 600),
  vote_count integer not null default 0 check (vote_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lolite_feature_requests_status_created_idx on public.lolite_feature_requests(status,created_at desc);
create index lolite_feature_requests_author_idx on public.lolite_feature_requests(submitted_by,created_at desc);

alter table public.lolite_feature_requests enable row level security;
grant select, insert on public.lolite_feature_requests to authenticated;
grant update (status,admin_note,updated_at) on public.lolite_feature_requests to authenticated;

create policy "feature requests browse approved and own" on public.lolite_feature_requests
  for select to authenticated
  using (
    status in ('open','planned','in_progress','shipped') or submitted_by = (select auth.uid())
    or exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
  );
create policy "feature requests submit pending only" on public.lolite_feature_requests
  for insert to authenticated
  with check (
    submitted_by=(select auth.uid()) and status='pending' and admin_note=''
    and vote_count=0
  );
create policy "feature requests admin updates only" on public.lolite_feature_requests
  for update to authenticated
  using (exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid())))
  with check (exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid())));

create table public.lolite_feature_votes (
  request_id uuid not null references public.lolite_feature_requests(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id,voter_id)
);
create index lolite_feature_votes_user_idx on public.lolite_feature_votes(voter_id);
alter table public.lolite_feature_votes enable row level security;
grant select, insert, delete on public.lolite_feature_votes to authenticated;
create policy "feature voters see own vote" on public.lolite_feature_votes
  for select to authenticated
  using (voter_id=(select auth.uid()));
create policy "feature voters upvote approved ideas" on public.lolite_feature_votes
  for insert to authenticated
  with check (
    voter_id=(select auth.uid())
    and exists (
      select 1 from public.lolite_feature_requests r
      where r.id=request_id and r.status in ('open','planned','in_progress')
    )
  );
create policy "feature voters remove own vote" on public.lolite_feature_votes
  for delete to authenticated
  using (voter_id=(select auth.uid()));

-- Server-maintained count: clients cannot update this column.
create function public.lolite_feature_vote_tally()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if TG_OP='INSERT' then
    update public.lolite_feature_requests
      set vote_count=vote_count+1 where id=NEW.request_id;
    return NEW;
  elsif TG_OP='DELETE' then
    update public.lolite_feature_requests
      set vote_count=greatest(0,vote_count-1) where id=OLD.request_id;
    return OLD;
  end if;
  return null;
end;
$$;
revoke all on function public.lolite_feature_vote_tally() from public, anon, authenticated;
create trigger lolite_feature_vote_tally_trigger
  after insert or delete on public.lolite_feature_votes
  for each row execute function public.lolite_feature_vote_tally();
