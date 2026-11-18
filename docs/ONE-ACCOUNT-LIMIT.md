# Lolite account creation limit

A browser profile may **create one Lolite account**. The same account can sign in on
other devices. Existing Lolite Chat usernames, passwords, and accounts still work.

After successful login or account creation, Lolite stores the first account ID under
`lolite-device:first-account-id` in browser local storage. The sign-up button
disappears, but sign-in and account switching remain available. Registration requests
send an opaque, randomly generated browser installation UUID. The Supabase
`lolite-account` Edge Function checks a service-only database table and rejects
a second signup using that ID. A unique database constraint protects against
simultaneous requests; on a duplicate claim, the newly-created Auth user is rolled
back. No existing account rows are deleted by the migration.

**Scope/limitations:** This is *one account per browser profile*, not a verifiable
one account per human. Clearing browser storage, using private browsing, another
browser or another device creates a new browser ID. It does not track IP addresses,
fingerprint devices, verify email or phone numbers, or block account switching.
Shared browser profiles are therefore subject to the same signup limit; people
sharing a computer can still sign in to existing accounts using their own profile
or a separate browser profile.

Deployment order:
1. Run `supabase/migrations/20261119093000_one_account_per_browser.sql`.
2. Publish `supabase/functions/lolite-account/index.ts` with JWT verification off,
   matching the existing public registration endpoint.
3. Release the UI changes in `core/account-storage.js`, `core/accounts.js`,
   `core/chat-v2.js`, and the cache-busting URLs in `index.html`.

Validation: `node --test tests/one-account-limit.test.cjs`, plus existing
`tests/required-account.test.cjs` and chat tests.
