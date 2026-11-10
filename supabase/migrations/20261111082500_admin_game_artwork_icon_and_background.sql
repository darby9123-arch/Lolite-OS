-- Admin-published games can have a dedicated icon and landscape background.
-- Metadata stays behind the existing admin-only write RLS policy.
alter table public.lolite_library_items
 add column if not exists icon_url text,
 add column if not exists background_url text;
alter table public.lolite_library_items
 add constraint lolite_library_items_icon_url_check
 check (icon_url is null or (kind='game' and char_length(icon_url) between 12 and 2048 and icon_url ~ '^https://[^[:space:]]+$'));
alter table public.lolite_library_items
 add constraint lolite_library_items_background_url_check
 check (background_url is null or (kind='game' and char_length(background_url) between 12 and 2048 and background_url ~ '^https://[^[:space:]]+$'));
