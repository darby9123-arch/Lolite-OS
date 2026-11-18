-- Ban-screen artwork: a chosen image may appear on an account's ban page.
alter table public.lolite_account_moderation
 add column if not exists ban_image_path text,
 add column if not exists ban_image_enabled boolean not null default false;

create policy "lolite admins upload ban screen art" on storage.objects
 for insert to authenticated with check (
  bucket_id = 'lolite-admin-media'
  and (storage.foldername(name))[1] = 'ban-images'
  and storage.extension(name) in ('png','jpg','jpeg','webp')
  and exists (select 1 from public.lolite_admins a
              where a.user_id=(select auth.uid()))
 );

create or replace function public.lolite_admin_set_ban_image(
 p_target uuid,p_image_path text default null,p_enabled boolean default false
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_actor uuid := auth.uid();
 v_current_path text;
 v_path text;
begin
 if v_actor is null or not exists (
  select 1 from public.lolite_admins a where a.user_id=v_actor
 ) then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_target=v_actor or exists(
  select 1 from public.lolite_admins a where a.user_id=p_target
 ) then raise exception 'Cannot configure ban screen for an administrator' using errcode='42501'; end if;
 select ban_image_path into v_current_path from public.lolite_account_moderation
  where user_id=p_target and action='ban' for update;
 if not found then raise exception 'Ban this account before setting its ban-screen picture'; end if;
 v_path:=coalesce(nullif(btrim(p_image_path),''),v_current_path);
 if p_image_path is not null and nullif(btrim(p_image_path),'') is not null then
  if v_path !~ '^ban-images/[0-9a-f-]{36}\.(png|jpg|jpeg|webp)$'
  then raise exception 'Invalid ban-screen image path'; end if;
 end if;
 if p_enabled then
  if v_path is null then raise exception 'Choose an image first'; end if;
  if not exists (
   select 1 from storage.objects o where o.bucket_id='lolite-admin-media'
    and o.name=v_path and o.metadata->>'mimetype' in ('image/png','image/jpeg','image/webp')
    and coalesce((o.metadata->>'size')::bigint,0) between 1 and 2097152
  ) then raise exception 'Chosen image is missing, too large, or not an image'; end if;
 end if;
 update public.lolite_account_moderation set
  ban_image_path=v_path,ban_image_enabled=p_enabled,
  updated_by=v_actor,updated_at=now()
  where user_id=p_target and action='ban';
 insert into public.lolite_moderation_audit(actor_id,target_id,action,reason)
 values(v_actor,p_target,'notice',case when p_enabled then 'Enabled selected ban-screen image'
  else 'Disabled ban-screen image' end);
 return jsonb_build_object('ok',true,'enabled',p_enabled,'path',v_path);
end;
$$;
revoke all on function public.lolite_admin_set_ban_image(uuid,text,boolean)
 from public,anon,authenticated;
grant execute on function public.lolite_admin_set_ban_image(uuid,text,boolean) to authenticated;
