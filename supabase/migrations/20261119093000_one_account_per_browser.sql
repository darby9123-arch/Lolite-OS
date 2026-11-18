-- One registered account per browser profile, with a server-side unique claim.
-- The device ID is a randomly generated UUID, not an IP address or device fingerprint.
create table public.lolite_account_registration_devices (
 device_id uuid primary key,
 user_id uuid not null unique references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.lolite_account_registration_devices enable row level security;
revoke all on public.lolite_account_registration_devices from public, anon, authenticated;
grant select, insert, delete on public.lolite_account_registration_devices to service_role;
