-- Preserve real catalog IDs, including filenames with spaces.
create or replace function public.lolite_activity_heartbeat(p_session uuid,p_kind text,p_game_key text default null,p_title text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); prior private.lolite_play_sessions; stamp timestamptz:=clock_timestamp(); elapsed bigint:=0; running bigint:=0; result jsonb;
begin
 if uid is null then raise exception 'Sign in first'; end if;
 if p_session is null or p_kind not in ('online','playing','chatting','settings','browsing','idle','offline') then raise exception 'Invalid activity'; end if;
 if p_kind='playing' and (p_game_key is null or length(p_game_key) not between 1 and 180 or p_game_key ~ '[[:cntrl:]]' or p_title is null or length(p_title) not between 1 and 120) then raise exception 'Invalid game'; end if;
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
 if p_game_key is null or length(p_game_key) not between 1 and 180 or p_game_key ~ '[[:cntrl:]]' or p_title is null or length(p_title) not between 1 and 120 or p_favorite is null then raise exception 'Invalid game'; end if;
 insert into public.lolite_game_stats(user_id,game_key,game_title,favorite) values(auth.uid(),p_game_key,p_title,p_favorite)
 on conflict(user_id,game_key) do update set favorite=excluded.favorite,game_title=excluded.game_title;
end $$;
