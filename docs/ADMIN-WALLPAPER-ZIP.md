# Admin wallpaper uploads and MP4 ZIP packs

Lolite OS admins can publish wallpapers to the shared **Settings → Wallpapers** library through the **Admin Center** using the same Lolite Chat login.

## Upload a ZIP pack
1. Open **Admin Center**, choose **Wallpaper**.
2. Select a **.zip** file containing MP4 videos (folders within the ZIP are supported).
3. Lolite checks archive structure, paths, decompression sizes, CRC32 checksums, MP4 container signatures, and whether the browser can read video metadata.
4. Review the videos, play previews, and uncheck anything you do not want to publish.
5. Optionally enter a title prefix; each wallpaper otherwise uses its MP4 filename.
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
- For uploaded videos, the wallpaper picker currently uses a generic fallback image on its card; opening the wallpaper plays the actual original MP4.
