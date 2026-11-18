# Lolite Admin Center — Accounts, Moderation and Surprises

Updated 18 November 2026.

## Admin Center → Accounts & moderation

The Admin Center includes a searchable account directory. Account names and creation dates are read from the existing Supabase `profiles` table; **passwords, emails, private data and game records are not displayed**.

Only accounts listed in the trusted `public.lolite_admins` table are authorised to take moderation actions. The browser cannot grant itself permissions by editing interface code: the Supabase RPC functions verify the caller's `auth.uid()` against that server-side list. Admins cannot ban, time out or send surprises to other admins (or themselves).

Available actions:

- **Classroom Pause:** apply a 45-minute timeout with the reason “Using Lolite during class.” The target's Lolite account displays the expiry and reason and cannot dismiss the in-app timeout. The person can still close the browser or sign out; the control never locks their computer, browser or other tabs.
- **Timeout / ban / remove:** admins can set a reason and a timeout from 10 minutes to 30 days, issue a ban, or remove a restriction. Every action is recorded to an admin-readable audit trail.
- **One-time notice:** a normal dismissible message with an optional, recipient-clicked link to open Lolite in a new tab. Notices have an anti-spam cooldown.
- **One-time surprise:** a harmless, original full-screen **Lolite animation**, separate from the user's uploaded MP4. It stays on screen for a maximum of eight seconds, has a clearly labelled **Skip surprise** button and can be dismissed with Escape. It never autoplays sound, opens extra browser tabs or repeats automatically. Supabase limits surprises to one per recipient per 24 hours, across all admin senders.
- **Preview:** lets an admin play the same surprise locally, without creating a database record or targeting another account.

Notifications wait until the recipient is logged into Lolite and not already capturing clips or running a fullscreen game. If their browser is closed, the unread notice remains queued for the next time they visit.

### Limitations

The timeout is an **in-app Lolite account lock** checked at sign-in and while the account is open (about every 30 seconds). It does not revoke all existing Supabase tokens or control websites outside Lolite. Moderation should be used for legitimate platform administration, not to repeatedly target or embarrass other users.

The uploaded `moderation.mp4` contained a personal insult; it was deliberately **not deployed or distributed** to classmates. The surprise is instead a neutral visual.

## Main files

- `core/lolite-admin-accounts.js` — account directory, admin actions and local preview.
- `core/lolite-account-notices.js` — recipient notices, skippable surprise and auto-dismiss.
- `core/accounts.js` — signed-in moderation checks and reason/expiry lock.
- `core/lolite-admin-moderation.css` — separate moderation and surprise interfaces.
- `supabase/migrations/20261118090000_lolite_account_moderation_and_notices.sql` — moderation tables, RLS, audit log and RPCs.
- `supabase/migrations/20261118120900_lolite_safe_one_time_surprises.sql` — rate-limited surprise kind and server-authorised sender RPC.
- `tests/admin-surprise-classroom.test.cjs` — interaction, permission and fallback regression checks.

## Verification

Focused mocked integration checks cover staff permissions, recipient dismissal, timeout, automatic ending, rate limits, original notices, and live page wiring. This is not proof of real user-browser rendering or completed hosting deployment. Supabase schema and RPC permissions were also checked using the connected project.
