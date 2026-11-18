# Lolite OS — Account moderation and ban-screen pictures

Updated 18 November 2026.

## Admin Center → Accounts & moderation

The account directory lists signed-in user profiles and account creation dates. It does not reveal passwords, email addresses, or personal game files. Server-authorised administrators can manage accounts, and each moderation action is recorded in Supabase.

### Ban and unban

1. Open **Admin Center → Accounts & moderation** and select a non-admin account.
2. To ban, choose **Ban**, enter a clear reason, and select **Apply moderation**.
3. While the account is banned, a dedicated **Unban account** button appears.
4. Click **Unban account** and confirm. The restriction is removed from Supabase, and the account will regain access at its next moderation check or sign-in.

**Classroom Pause** is separate. It applies a 45-minute timeout with the reason “Using Lolite during class”. The moderation form also supports general timeouts and removal of those restrictions.

### Ban-screen picture

When an account is actively banned, the selected account panel also displays **Ban screen picture**.

- Choose a PNG, JPG, or WebP image from your computer, maximum 2 MB. The file is uploaded to the existing admin media bucket in a protected `ban-images/` path. Admin role is verified before upload.
- The selected image is attached to that ban and **enabled** automatically.
- Click **Hide ban picture** to turn it off without unbanning. Click **Show ban picture** to turn it back on; you can also choose another file.
- The banned user sees the chosen image beside the ban message, together with the reason and sign-out/switch-account option.
- A timeout does **not** show a ban picture. The ban picture is removed with the ban record on unban.

Images sent in a ChatGPT conversation are **not automatically transferred** into the Lolite storage bucket; use the chooser in Admin Center to select the desired saved image file. Do not upload personal or humiliating photos of other people.

### Announcements

One-time staff notices are separate from bans. Notices can be dismissed. The “surprise” action is not part of the Admin Center interface.

### Safety and limitations

Account bans and timeouts are **Lolite account restrictions**, not computer or browser locks. The restricted account can still sign out or close Lolite. The active tab checks Supabase roughly every 30 seconds and when the tab becomes active. Removing a ban is server-logged and requires an authorised admin account; it does not forcibly close other websites or revoke every existing Supabase access token.

The Admin Center file-upload and role checks run against Supabase. A web client alone is not a complete enforcement boundary for every possible API endpoint. Keep appropriate server-side checks on sensitive actions.

### Implementation

- `core/lolite-admin-accounts.js` — account list, direct Unban button, ban image upload and toggle, moderation and notices
- `core/accounts.js` — account restriction modal, ban image display and refresh checks
- `core/lolite-admin-moderation.css` — Admin Center and ban image styles
- `supabase/migrations/20261118090000_lolite_account_moderation_and_notices.sql` — moderated account status and audit
- `supabase/migrations/20261118143000_lolite_ban_screen_art_controls.sql` — selected picture storage rules and admin RPC
- `tests/admin-surprise-classroom.test.cjs` — permission, button actions, artwork rendering and asset checks (legacy test filename)

Seven focused mocked integration tests passed. Supabase schema grants and upload policy were independently verified; actual deployment/browser rendering was not verified in this change.
