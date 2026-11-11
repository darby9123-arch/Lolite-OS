-- One existing Auth identity now owns the desktop, library and social activity.
alter table public.profiles add column if not exists show_activity boolean not null default true;
alter table public.profiles add column if not exists show_games boolean not null default true;
create table public.lolite_account_data (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{}' check(jsonb_typeof(data)='object' and octet_length(data::text)<=131072),
 updated_at timestamptz not null default now()
);
alter table public.lolite_account_data enable row level security;
create policy "account reads own desktop" on public.lolite_account_data for select to authenticated using(user_id=(select auth.uid()));
create policy "account creates own desktop" on public.lolite_account_data for insert to authenticated with check(user_id=(select auth.uid()));
create policy "account updates own desktop" on public.lolite_account_data for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create table public.lolite_game_stats (
 user_id uuid not null references auth.users(id) on delete cascade,
 game_key text not null check(length(game_key) between 1 and 180),
 game_title text not null check(length(game_title) between 1 and 120),
 total_seconds bigint not null default 0 check(total_seconds>=0),
 longest_session_seconds bigint not null default 0 check(longest_session_seconds>=0),
 favorite boolean not null default false,
 last_played timestamptz,
 primary key(user_id,game_key)
);
create index lolite_game_stats_player_time on public.lolite_game_stats(user_id,total_seconds desc);
alter table public.lolite_game_stats enable row level security;
create table public.lolite_presence (
 user_id uuid primary key references auth.users(id) on delete cascade,
 kind text not null check(kind in ('online','playing','chatting','settings','browsing','idle','offline')),
 game_key text, game_title text, started_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.lolite_presence enable row level security;
-- The helper can see blocks in BOTH directions, regardless of a viewer's block RLS.
create or replace function private.lolite_can_view_player(target uuid, games boolean default false)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (target=auth.uid() or (
 exists(select 1 from public.profiles p where p.id=target and (case when games then p.show_games else p.show_activity and p.status<>'invisible' end))
 and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=target) or (b.blocked_id=auth.uid() and b.blocker_id=target))));
$$;
revoke all on function private.lolite_can_view_player(uuid,boolean) from public,anon;
grant execute on function private.lolite_can_view_player(uuid,boolean) to authenticated;
create policy "visible player statistics" on public.lolite_game_stats for select to authenticated using(private.lolite_can_view_player(user_id,true));
create policy "visible player activity" on public.lolite_presence for select to authenticated using(private.lolite_can_view_player(user_id,false));
-- Clients cannot write counters or timestamps. A single row serializes all tabs/devices.
create table private.lolite_play_sessions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 session_id uuid not null, game_key text, game_title text,
 seconds bigint not null default 0, last_at timestamptz not null default now(), started_at timestamptz not null default now()
);
revoke all on private.lolite_play_sessions from public,anon,authenticated;
alter table private.lolite_play_sessions enable row level security;
create or replace function public.lolite_activity_heartbeat(p_session uuid,p_kind text,p_game_key text default null,p_title text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); prior private.lolite_play_sessions; stamp timestamptz:=clock_timestamp(); elapsed bigint:=0; running bigint:=0; result jsonb;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 if p_session is null or p_kind not in ('online','playing','chatting','settings','browsing','idle','offline') then raise exception 'Invalid activity'; end if;
 if p_kind='playing' and (p_game_key is null or length(p_game_key) not between 1 and 180 or p_game_key !~ '^[a-zA-Z0-9_.-]+$' or p_title is null or length(p_title) not between 1 and 120) then raise exception 'Invalid game'; end if;
 insert into private.lolite_play_sessions(user_id,session_id) values(uid,p_session) on conflict do nothing;
 select * into prior from private.lolite_play_sessions where user_id=uid for update;
 -- Never credit gaps (sleep, disconnect), overlapping tabs, or client supplied seconds.
 if prior.session_id=p_session and prior.game_key is not null and stamp-prior.last_at<=interval '45 seconds' then
  elapsed:=greatest(0,floor(extract(epoch from stamp-prior.last_at)))::bigint;
  running:=prior.seconds+elapsed;
  insert into public.lolite_game_stats(user_id,game_key,game_title,total_seconds,longest_session_seconds,last_played)
   values(uid,prior.game_key,prior.game_title,elapsed,running,stamp)
  on conflict(user_id,game_key) do update set total_seconds=lolite_game_stats.total_seconds+elapsed,
   longest_session_seconds=greatest(lolite_game_stats.longest_session_seconds,running),last_played=stamp,game_title=excluded.game_title;
 end if;
 if p_kind<>'playing' then p_game_key:=null;p_title:=null; end if;
 if prior.session_id<>p_session or prior.game_key is distinct from p_game_key or stamp-prior.last_at>interval '45 seconds' then running:=0;prior.started_at:=stamp; end if;
 update private.lolite_play_sessions set session_id=p_session,game_key=p_game_key,game_title=p_title,seconds=running,last_at=stamp,started_at=prior.started_at where user_id=uid;
 insert into public.lolite_presence(user_id,kind,game_key,game_title,started_at,updated_at) values(uid,p_kind,p_game_key,p_title,prior.started_at,stamp)
 on conflict(user_id) do update set kind=excluded.kind,game_key=excluded.game_key,game_title=excluded.game_title,
 started_at=case when lolite_presence.kind=excluded.kind and lolite_presence.game_key is not distinct from excluded.game_key then lolite_presence.started_at else stamp end,updated_at=stamp;
 select to_jsonb(s) into result from public.lolite_game_stats s where s.user_id=uid and s.game_key=coalesce(p_game_key,prior.game_key);
 return coalesce(result,'{}'::jsonb);
end $$;
create or replace function public.lolite_set_favorite(p_game_key text,p_title text,p_favorite boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if p_game_key is null or length(p_game_key) not between 1 and 180 or p_game_key !~ '^[a-zA-Z0-9_.-]+$' or p_title is null or length(p_title) not between 1 and 120 or p_favorite is null then raise exception 'Invalid game'; end if;
 insert into public.lolite_game_stats(user_id,game_key,game_title,favorite) values(auth.uid(),p_game_key,p_title,p_favorite)
 on conflict(user_id,game_key) do update set favorite=excluded.favorite,game_title=excluded.game_title;
end $$;
revoke all on public.lolite_game_stats,public.lolite_presence from anon,authenticated;
grant select on public.lolite_game_stats,public.lolite_presence to authenticated;
grant select,insert,update on public.lolite_account_data to authenticated;
revoke all on function public.lolite_activity_heartbeat(uuid,text,text,text),public.lolite_set_favorite(text,text,boolean) from public,anon;
grant execute on function public.lolite_activity_heartbeat(uuid,text,text,text),public.lolite_set_favorite(text,text,boolean) to authenticated;
