# Lolite OS — Feature Requests

Feature Requests is a built-in, free community app. Open it from the desktop shortcut, the Cosmos desktop, or the App Store. It uses the **existing Lolite Chat account** and the live Lolite Supabase project. No new password or third-party service is needed.

## For members
1. Open **Feature Requests**, sign in with Lolite Chat if needed, and select **Suggest**.
2. Enter a clear title (6–120 characters), category, and description (15–2000 characters).
3. The idea is saved as **Awaiting review**. It is visible to you under **My requests** and to admins, not to the general community.
4. When an admin approves it, the idea appears under **Community ideas**. Other logged-in members can give it one vote each, remove their vote, search by text, filter by category/status, and sort by votes/date.
5. Follow its status: Open, Planned, In progress, Released, or Not planned. Admin notes show progress and decision context. Declined requests remain visible only to their authors and admins.

The app doesn't automatically implement ideas. Admins decide which ones to build. Do not include private account details in submissions.

## For admins
Use **Admin review** (shown only to authorised Lolite admins) to see pending and existing ideas. Select a status and optionally add a team note, then save. Only the authorised admin role can update statuses or team notes. The server checks this via Postgres RLS.

## Data and security
- The app uses the same Supabase browser client as Lolite Chat; no secret key is embedded.
- `public.lolite_feature_requests`: authenticated users can submit requests only as themselves, initially pending. All members can read approved requests; pending/declined items are private to their author and admins.
- `public.lolite_feature_votes`: one vote per authenticated member per request, enforced by a composite primary key. Members can read and remove only their own votes.
- A database trigger maintains `vote_count` so members can see totals without reading each other's voter identities. Clients cannot update vote counts directly.
- Schema and RLS: `supabase/migrations/20261111090000_lolite_feature_requests.sql`.
- UI: `core/feature-requests.js` and `core/feature-requests.css`.
- Automated regression coverage: `tests/feature-requests.test.cjs`.

This release relies on the live Lolite Supabase project and internet access; anonymous/offline submission is not supported. It does not modify existing chat, music or game tables.

## Admin replies and proof screenshots (2026-11-12)

Admins can open **Admin review** and use **Reply as admin** on any request. Write an update and optionally attach a PNG, JPEG or WebP screenshot up to 5 MB; choose **Post reply** to add a dated message to the existing conversation. The original request and previous replies remain visible.

Choose **Mark Done + Reply** to publish the message and screenshot and automatically set that request's status to **Done**. Completed requests remain visible under Community ideas and My requests, with their earlier vote total and an explicit **Voting closed** label. Users cannot cast or remove votes after completion: both the browser and Postgres row-level security enforce this.

Screenshot uploads use the private `lolite-feature-proofs` Supabase Storage bucket, limited to admins and these image types. Signed URLs are created only for members authorised to read the request and expire after an hour; use **Refresh** if a picture expires. The database retains the screenshot path rather than a permanent public URL.

The reply history is stored in `public.lolite_feature_replies` (RLS enabled, admin-only insertion). A database trigger marks a request Done atomically when its corresponding Done reply is inserted. See `supabase/migrations/20261112093000_lolite_feature_admin_replies.sql`. The original status dropdown and admin notes remain available for earlier workflows.
