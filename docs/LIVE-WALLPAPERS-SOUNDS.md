# Built-in live wallpapers and system sounds — November 2026

## Wallpaper library

Settings → Wallpapers now includes **52 original animated Lolite scenes**, including **16 interactive wallpapers** alongside the **10 existing still backgrounds**. Categories include Space, Nature, City, Neon, Abstract and Interactive. Every built-in live scene has a preview image generated as lightweight SVG and plays directly inside the desktop—there is no MP4 installation flow, no local video download UI, and no broken video placeholder.

Live wallpapers are procedural Canvas 2D animations, not downloadable or prerecorded 4K MP4 videos. Each is drawn directly at the current display's pixel density. The quality selector offers:

- **Highest · native / 4K+** (default): native display pixels, with a 16-megapixel safety budget for extremely high-DPI screens.
- **Balanced:** pixel budget of 6 megapixels and a lower density cap.
- **Performance:** pixel budget of 2.1 megapixels and a lower frame rate.

These are actual canvas render resolutions, not upscaled video sources. 3840×2160 on a 4K desktop monitor renders at 3840×2160 in Highest mode. Frames are capped at 30 fps on 8 MP+ canvases and 45 fps below that, with further reductions in quality modes.

The browser creates only one live canvas at a time, stops its previous animation when a wallpaper changes, and pauses animation whenever the tab is hidden, the user switches to Browsing Style, a system reduced-motion setting is active, or the user turns off Live motion. Preferences persist in localStorage, including a user's uploaded static image.

Legacy saved wallpaper IDs migrate to suitable new built-in scenes so old preferences don't leave a blank desktop. The previous browser-only MP4 importer remains removed.

## Interactive effects

Choose the **Interactive** filter to try 16 additional animated scenes. Move the mouse to bend particles, liquid patterns, gravity wells, waves and geometric fields. Clicking empty desktop space sends out temporary light ripple rings. These effects are drawn behind app windows, do not capture pointer input, and stop if Reduce Motion is enabled. **Interactive mouse effects** and the interaction-strength slider are stored as local preferences.

All 52 live scenes use a single drawing loop and a single canvas. Reactive overlay lighting also works on the original 36 scenes.

## Original user-supplied MP4s

The site can now discover the 20 previously supplied filenames inside `assets/wallpapers/videos/`, including their original 1080p and 4K resolution suffixes and `motorcycle-parked.3840x2160(1).mp4`. On wallpaper page open, a HEAD request checks for each file. It only adds a video card when the actual MP4 is hosted and does not return a 404 or HTML page. A real hosted MP4 uses the original resolution and loops muted with existing video error handling.

The MP4 bytes **are not in the GitHub repository yet**, despite being available as earlier ChatGPT uploads. The connected GitHub integration can edit text files but cannot push those large binary files from the conversation. The files need to be pushed to that exact directory via GitHub Desktop or another Git client. No video card is shown until the asset is actually uploaded. This is separate from the 52 built-in procedural scenes.

## System sounds

Settings → Sounds retains 36 original Web Audio cues in seven categories. The existing sound preferences, interaction-gated audio unlock, disabled typing/hover effects, repeated-sound limit, hidden-tab cleanup and master volume controls are unchanged. Games, media and calls keep independent audio controls.

## Verification

- `node --test tests/local-live-wallpapers.test.cjs tests/interactive-wallpapers.test.cjs tests/crimson.test.cjs` covers 52 live scenes, distinct SVG artwork, single-renderer lifecycle, 4K resolution scaling, quality selection, pause/resume, legacy preference migration, custom wallpaper uploads, and system sounds.
- GitHub Actions workflow: `Verify live and interactive wallpapers`.
- The catalogs are `core/live-wallpapers-catalog.js`, `core/interactive-wallpapers.js`, and `core/uploaded-wallpapers-catalog.js`; `core/wallpapers.js` is the shared rendering engine. Hosted video cards are conditional on real files passing a HEAD check.
