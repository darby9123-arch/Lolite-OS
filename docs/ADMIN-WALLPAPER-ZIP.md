# Admin wallpaper uploads and MP4 ZIP packs

Lolite OS admins can publish wallpapers to the shared **Settings → Wallpapers** library through the **Admin Center** using the same Lolite Chat login.

## Upload a ZIP pack
1. Open **Admin Center**, choose **Wallpaper**.
2. Select a **.zip** file containing MP4 videos (folders within the ZIP are supported).
3. Lolite checks archive structure, paths, decompression sizes, CRC32 checksums, MP4 container signatures, and whether the browser can read video metadata.
4. Review the videos, play previews, and uncheck anything you do not want to publish.
5. Optionally enter a title prefix. Lolite automatically turns the MP4 filename into a clean wallpaper title: it removes the `.mp4` extension, any ending numeric suffix (`-003`, `_01`, ` (12)`, etc.), replaces hyphens/underscores with spaces, and capitalizes words. For example, `sunset-beach-003.mp4` becomes **Sunset Beach**, while `gta-vice-city-4.mp4` becomes **GTA Vice City**. The original filename is shown alongside the clean title during review, and the ZIP/MP4 data is never renamed or modified. A typed pack prefix is preserved exactly as entered.
6. Click **Publish to Lolite**. Each selected MP4 is uploaded individually to the shared Supabase storage bucket, and its library row is added after a successful upload.

The original ZIP is **not** published or uploaded. Non-MP4 files are ignored. Bad, unplayable, unsafe, or unsupported archives show an error or mark affected videos unavailable. If part of a pack publishes successfully before an upload fails, published entries are marked complete and retries process only the remaining selections.

## Limits
- 24 MP4s per ZIP.
- 300 MB ZIP size and 300 MB combined uncompressed MP4 bytes.
- 50 MB per wallpaper video (matching the **lolite-admin-media** bucket limit).
- Standard ZIP (stored or DEFLATE compressed); not encrypted, multi-volume, or ZIP64.
- Individual uploads: PNG, JPG, WebP, MP4, WebM, up to 50 MB; HTML game uploads retain a 25 MB cap.
- Real playback depends on browser video codec support. This does not transcode videos or reduce their resolution.

## Access and behavior
- Only users authorized in `lolite_admins` can publish and remove items. Supabase **row-level security policies** enforce database and storage permissions; browser UI checks are not the security boundary.
- Published files are served from Supabase Storage, not committed to GitHub.
- The existing public shared-library feed allows other users to discover new wallpapers without a code deployment.
- Use media you own or are allowed to distribute.
- New uploaded videos get a **560 × 315 thumbnail extracted from an actual video frame**, stored as a WebP/PNG beside the original video. The full MP4 remains untouched and keeps its original resolution.
- Existing videos without a saved poster attempt to extract a real frame in the viewer's browser. Admins can use **Make thumbnail** in the Admin Center to save a persistent shared thumbnail for an older uploaded video.
- Uploaded videos are shown in **Special Live Wallpapers** (and still appear in Videos and Admin Uploads).
- MP4 playback uses two overlapping, preloaded video elements with a short crossfade before the native loop boundary. This avoids brief black decoder resets. If the video itself contains intentionally black footage, those frames may still be visible; source trimming or exporting a clean looping file can improve that.
