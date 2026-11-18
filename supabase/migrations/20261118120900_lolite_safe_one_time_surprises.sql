-- Lolite surprise notifications: skippable, self-closing and strictly rate-limited.
-- Applied to the existing Supabase account-notice and audit tables.
alter table public.lolite_account_notices
 add column if not exists kind text not null default 'notice';
alter table public.lolite_account_notices
 add constraint lolite_account_notices_kind_check check (kind in ('notice','surprise'));

create or replace function public.lolite_admin_send_surprise(p_target uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_actor uuid := auth.uid();
 v_notice_id bigint;
begin
 if v_actor is null or not exists(
  select 1 from public.lolite_admins a where a.user_id = v_actor
 ) then raise exception 'Admin access required' using errcode = '42501'; end if;
 if p_target is null or not exists (
  select 1 from public.profiles p where p.id = p_target
 ) then raise exception 'Account was not found'; end if;
 if p_target = v_actor or exists (
  select 1 from public.lolite_admins a where a.user_id = p_target
 ) then raise exception 'Cannot send this surprise to an administrator' using errcode = '42501'; end if;
 if exists (
  select 1 from public.lolite_account_notices n
  where n.target_user_id = p_target and n.kind = 'surprise'
    and n.created_at > now() - interval '24 hours'
 ) then raise exception 'This account has already received a surprise in the past 24 hours'; end if;
 insert into public.lolite_account_notices(target_user_id,created_by,message,kind)
 values(p_target,v_actor,'Surprise from Lolite! Time to take a break.','surprise')
 returning id into v_notice_id;
 insert into public.lolite_moderation_audit(actor_id,target_id,action,reason)
 values(v_actor,p_target,'notice','Sent a skippable Lolite surprise');
 return jsonb_build_object('ok',true,'id',v_notice_id);
end;
$$;
revoke all on function public.lolite_admin_send_surprise(uuid)
 from public,anon,authenticated;
grant execute on function public.lolite_admin_send_surprise(uuid) to authenticated;
