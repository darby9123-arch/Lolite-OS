-- Lolite OS: accountable admin-only account moderation and one-time user notices.
-- Only public profiles are listed; passwords, emails and private account data are never exposed.
create table if not exists public.lolite_account_moderation (
 user_id uuid primary key references auth.users(id) on delete cascade,
 action text not null check (action in ('ban','timeout')),
 reason text not null check (char_length(btrim(reason)) between 3 and 240),
 ends_at timestamptz,
 updated_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now(),
 constraint lolite_moderation_expiry_check check (
  (action='ban' and ends_at is null) or (action='timeout' and ends_at is not null)
 )
);
create index if not exists lolite_moderation_expiry_idx on public.lolite_account_moderation(ends_at) where action='timeout';
alter table public.lolite_account_moderation enable row level security;
revoke all on public.lolite_account_moderation from public,anon,authenticated;
grant select on public.lolite_account_moderation to authenticated;
create policy "moderation own record or authorised admin" on public.lolite_account_moderation
 for select to authenticated using (
  user_id=(select auth.uid()) or
  exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
 );

create table if not exists public.lolite_moderation_audit (
 id bigint generated always as identity primary key,
 actor_id uuid not null references auth.users(id),
 target_id uuid not null references auth.users(id) on delete cascade,
 action text not null check (action in ('ban','timeout','clear','notice')),
 reason text not null check (char_length(btrim(reason)) between 1 and 240),
 ends_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists lolite_moderation_audit_created_idx on public.lolite_moderation_audit(created_at desc);
alter table public.lolite_moderation_audit enable row level security;
revoke all on public.lolite_moderation_audit from public,anon,authenticated;
grant select on public.lolite_moderation_audit to authenticated;
create policy "moderation audit read by authorised admins" on public.lolite_moderation_audit
 for select to authenticated using (
  exists(select 1 from public.lolite_admins a where a.user_id=(select auth.uid()))
 );

create table if not exists public.lolite_account_notices (
 id bigint generated always as identity primary key,
 target_user_id uuid not null references auth.users(id) on delete cascade,
 created_by uuid not null references auth.users(id),
 message text not null check (char_length(btrim(message)) between 3 and 240),
 seen_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists lolite_account_notices_target_idx
 on public.lolite_account_notices(target_user_id,created_at desc);
alter table public.lolite_account_notices enable row level security;
revoke all on public.lolite_account_notices from public,anon,authenticated;
grant select on public.lolite_account_notices to authenticated;
grant update (seen_at) on public.lolite_account_notices to authenticated;
create policy "notices recipients can read" on public.lolite_account_notices
 for select to authenticated using (target_user_id=(select auth.uid()));
create policy "notices recipients can acknowledge" on public.lolite_account_notices
 for update to authenticated using (target_user_id=(select auth.uid()))
 with check (target_user_id=(select auth.uid()));

create or replace function public.lolite_admin_moderate_account(
 p_target uuid,p_action text,p_reason text default null,p_minutes integer default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_actor uuid := auth.uid();
 v_reason text := btrim(coalesce(p_reason,''));
 v_ends timestamptz := null;
begin
 if v_actor is null or not exists(
  select 1 from public.lolite_admins a where a.user_id=v_actor
 ) then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_target is null or not exists(select 1 from public.profiles p where p.id=p_target)
 then raise exception 'Account was not found'; end if;
 if p_target=v_actor or exists(select 1 from public.lolite_admins a where a.user_id=p_target)
 then raise exception 'Administrators cannot moderate themselves or other administrators' using errcode='42501'; end if;
 if p_action not in ('ban','timeout','clear') then raise exception 'Invalid moderation action'; end if;
 if p_action='clear' then
  delete from public.lolite_account_moderation where user_id=p_target;
  v_reason := case when char_length(v_reason) between 3 and 240 then v_reason else 'Moderation removed' end;
 else
  if char_length(v_reason) not between 3 and 240
  then raise exception 'A reason of 3–240 characters is required'; end if;
  if p_action='timeout' then
   if p_minutes is null or p_minutes not between 1 and 43200
   then raise exception 'Timeout must be 1 minute to 30 days'; end if;
   v_ends := now() + make_interval(mins=>p_minutes);
  end if;
  insert into public.lolite_account_moderation(user_id,action,reason,ends_at,updated_by,updated_at)
  values(p_target,p_action,v_reason,v_ends,v_actor,now())
  on conflict(user_id) do update set action=excluded.action,reason=excluded.reason,
   ends_at=excluded.ends_at,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
 end if;
 insert into public.lolite_moderation_audit(actor_id,target_id,action,reason,ends_at)
 values(v_actor,p_target,p_action,v_reason,v_ends);
 return jsonb_build_object('ok',true,'action',p_action,'target',p_target,'ends_at',v_ends);
end;
$$;
revoke all on function public.lolite_admin_moderate_account(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.lolite_admin_moderate_account(uuid,text,text,integer) to authenticated;

create or replace function public.lolite_admin_send_notice(
 p_target uuid,p_message text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_actor uuid := auth.uid();
 v_message text := btrim(coalesce(p_message,''));
 v_id bigint;
begin
 if v_actor is null or not exists(select 1 from public.lolite_admins a where a.user_id=v_actor)
 then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_target is null or not exists(select 1 from public.profiles p where p.id=p_target)
 then raise exception 'Account not found'; end if;
 if char_length(v_message) not between 3 and 240
 then raise exception 'Announcement must be 3–240 characters'; end if;
 -- Anti-spam: at most one notice to a recipient from the same staffer per 15 minutes.
 if exists(
  select 1 from public.lolite_account_notices
  where target_user_id=p_target and created_by=v_actor and created_at>now()-interval '15 minutes'
 ) then raise exception 'Please allow 15 minutes between notices to this account'; end if;
 insert into public.lolite_account_notices(target_user_id,created_by,message)
 values(p_target,v_actor,v_message) returning id into v_id;
 insert into public.lolite_moderation_audit(actor_id,target_id,action,reason)
 values(v_actor,p_target,'notice',v_message);
 return jsonb_build_object('ok',true,'id',v_id);
end;
$$;
revoke all on function public.lolite_admin_send_notice(uuid,text) from public,anon,authenticated;
grant execute on function public.lolite_admin_send_notice(uuid,text) to authenticated;
