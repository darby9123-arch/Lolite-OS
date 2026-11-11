# MotionBGS remote wallpapers in Lolite

Lolite has a separate **Embedded Wallpapers** filter in Settings → Wallpapers.

- 16 MotionBGS catalogue entries are linked to their official source pages.
- Playback uses the website's published **HD and (where offered) 4K video download routes** inside the browser's native `<video>` element. It does not create a hidden iframe or host MP4 copies in Lolite.
- The original 840 Lively wallpapers are unchanged, and MotionBGS entries do **not** appear in the regular **All** category.
- Video playback is muted, loops when supported and pauses under Reduced Motion, Performance Mode, or when Lolite is not visible.
- Posters are **illustrative placeholders**, not frames taken from copyrighted videos. If remote video loading fails, the poster stays visible instead of a black area.
- Each card links to its original MotionBGS page for credit and access.

## Important playback limitation

MotionBGS applies anti-bot / access-control rules. A GitHub Actions probe of several official `/dl/hd/` video links on 12 November 2026 returned HTTP **403** (HTML error pages, not MP4). The catalogue and UI tests passed, but **actual video playback is unverified** and may be blocked by the source host or browser.

MotionBGS's ordinary webpages also have embedding restrictions, so embedding the complete webpage in an iframe is not a viable video player.

If MotionBGS restricts cross-origin video streaming, Lolite cannot fix that on its own. The source pages remain available through the credit link. For reliable playback, a provider-authorized public MP4 URL or supported official embed API would be required.
