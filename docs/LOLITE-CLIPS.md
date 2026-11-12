# Lolite Clips — Game Recording and Community Gallery

Lolite Clips is a built-in recording app in the desktop, modern Start menu, Cosmos and App Store. It records an explicitly selected game tab or display using the browser's built-in permission chooser.

## Capture and keybind
1. Open **Lolite Clips** and choose **Record**.
2. Press **Start recording** or the default **Alt+Shift+C** keyboard shortcut while Lolite has keyboard focus.
3. In your browser's screen-sharing prompt, select the game tab/window/screen you want to capture. Capture cannot start without this explicit permission.
4. Press **Alt+Shift+C** again (or Stop & save clip) to stop. You can choose automatic limits of **15, 30, 60 or 90 seconds**, and change the shortcut to **Ctrl+Shift+Y**.
5. A recording indicator is shown while capture is active. Saving a clip automatically stops screen sharing; you can also use **Stop sharing screen** to release the capture source.

**Important browser limitations:** This records **from the time you start recording**; it does not retrieve the last 30 seconds retroactively (no background replay buffer). The keyboard shortcut works when Lolite or a same-origin game iframe has keyboard focus. Cross-origin game iframes can intercept it, so use the capture controls in those games. Screen/tab capture requires a supported browser and HTTPS. Game/tab audio is included only if the browser supports it and you choose to share audio. Capture will stop if you end browser screen sharing.

## Clips 2.0 recording controls
- **Pause / Resume:** While recording, select **Pause recording** to temporarily stop adding footage. Choose **Resume** to continue within the same file. The time limit counts actual recorded time, not paused time. **Stop & save** also works while paused.
- **Live progress:** The Record page shows elapsed time, seconds left and a progress indicator. The always-visible recording status also says when recording is paused.
- **Video quality:** Choose **Compact** (800 kbps), **Balanced** (1.5 Mbps, default), or **High** (3 Mbps). Higher quality can create larger files and may exceed the 20 MB community-sharing limit; saved local videos have no fixed 20 MB cap beyond browser storage.
- Capture always requires choosing a source in the browser permission prompt. Settings never begin a capture by themselves.

## My Clips: private local library
Recordings are saved as **WebM or MP4** in the browser's **IndexedDB** storage. They are not sent to Lolite servers automatically. **My Clips** lets you watch, rename, favourite, search, sort, download and delete each clip. Favourites and new titles are stored alongside the private local clip and are not shared automatically. Download any clip you want to preserve: clearing browser storage or changing devices may remove local videos. If browser storage fails when a recording ends, the app offers the recording as a download instead.

The library shows the total number of clips, local storage used and favourites. Sort newest/oldest, biggest file, or favourites first. Clip downloads use a readable filename based on your saved title. Actual bitrate/file size depends on the browser and gameplay. Browser storage quotas still apply.

## Share with the community
To share a local clip, choose **Share**, set a title, confirm you have checked it for private details and have permission to share, and then select **Submit for review**. You must be signed into your existing Lolite account. **The recording stays private until you explicitly submit it**, and community clips appear publicly to signed-in Lolite members **only after an authorised admin approves them**.

Uploads are limited to **20 MB** per clip, stored in a private Supabase bucket named `lolite-clips`. Approved clips can be watched in **Community**. Your own unapproved uploads appear in **My submitted clips** under Community; admins see the moderation queue in **Admin review**.

Members can delete their shared clips to unshare them. A local copy stays on the original device unless separately deleted. Video preview links are time-limited and require a member with access to request them.

## Technical notes
- Client-side recorder: `core/clips.js` and `core/clips.css`. Uses user-initiated `getDisplayMedia()`, `MediaRecorder`, and IndexedDB.
- Cloud schema and access policies: `supabase/migrations/20261112070000_lolite_clips.sql`.
- Supabase RLS: only clip owners/admins can read pending or rejected metadata; approved metadata is visible to authenticated Lolite users. Only admins can approve/reject uploads.
- Storage policies: uploads are restricted to the signed-in user's folder; playback is limited to the clip owner, admin, or members watching approved clips. Files must be WebM/MP4.
- No background/silent capture, service-role keys, or automatic uploads.
- Regression suite: `tests/lolite-clips.test.cjs`. Browser-specific recording and audio support still require a manual browser test.

## Clips 3.0 UI and reliability fixes (13 November 2026)

- The app now opens on **Record**, with a clean, responsive layout that fits narrow and maximised windows.
- Clips has its own DOM root (`#loliteClipsRoot`), `lclip-` CSS classes, and data-action attributes. These intentionally do not overlap with Lolite Chat's `#lcRoot` / `lc-` styles or handlers.
- Once the browser screen picker finishes, the **Stop & save clip** button is active. Capture permission is released after saving.
- Videos use stable local object URLs until a clip is deleted or its underlying video changes. Searching, sorting, renaming and favouriting local clips update only the relevant cards to prevent playback jumping back to the beginning.
- Background account refresh no longer rebuilds the private video gallery. Videos without an automatically loaded community preview offer **Load video** to request a fresh, access-controlled link.
- Sharing a clip shows an uploading state and leaves the locally saved copy unchanged. Uploads still require user confirmation and admin approval to appear in the community.
- Regression coverage: `tests/lolite-clips.test.cjs`. Browser-specific capture, audio and mobile resizing should still be tested in the deployed app.
