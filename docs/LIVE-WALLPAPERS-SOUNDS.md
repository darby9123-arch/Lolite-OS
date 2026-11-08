# Built-in live wallpapers and system sounds — November 2026

## Wallpaper library

Settings → Wallpapers now includes **36 original animated Lolite scenes** alongside the **10 existing still backgrounds**. Categories include Space, Nature, City, Neon and Abstract. Every live scene has a preview image generated as lightweight SVG and plays directly inside the desktop—there is no MP4 installation flow, no local video download UI, no remote streaming host and no broken video placeholder.

Live wallpapers are procedural Canvas 2D animations, not downloadable or prerecorded 4K MP4 videos. Each is drawn directly at the current display's pixel density. The quality selector offers:

- **Highest · native / 4K+** (default): native display pixels, with a 16-megapixel safety budget for extremely high-DPI screens.
- **Balanced:** pixel budget of 6 megapixels and a lower density cap.
- **Performance:** pixel budget of 2.1 megapixels and a lower frame rate.

These are actual canvas render resolutions, not upscaled video sources. 3840×2160 on a 4K desktop monitor renders at 3840×2160 in Highest mode. Frames are capped at 30 fps on 8 MP+ canvases and 45 fps below that, with further reductions in quality modes.

The browser creates only one live canvas at a time, stops its previous animation when a wallpaper changes, and pauses animation whenever the tab is hidden, the user switches to Browsing Style, a system reduced-motion setting is active, or the user turns off Live motion. Preferences persist in localStorage, including a user's uploaded static image.

Legacy saved wallpaper IDs migrate to suitable new built-in scenes so old preferences don't leave a blank desktop. The previous browser-only 20-MP4 importer was deleted; the uploaded MP4s themselves were never hosted in this GitHub repository.

## System sounds

Settings → Sounds retains 36 original Web Audio cues in seven categories. The existing sound preferences, interaction-gated audio unlock, disabled typing/hover effects, repeated-sound limit, hidden-tab cleanup and master volume controls are unchanged. Games, media and calls keep independent audio controls.

## Verification

- `node --test tests/local-live-wallpapers.test.cjs tests/crimson.test.cjs` covers 36 live scenes, distinct SVG artwork, single-renderer lifecycle, 4K resolution scaling, quality selection, pause/resume, legacy preference migration, custom wallpaper uploads, and system sounds.
- GitHub Actions workflow: `Verify built-in live wallpapers`.
- The catalog and renderer are `core/live-wallpapers-catalog.js` and `core/wallpapers.js`. Live video support remains in the renderer for any **genuinely hosted** video files added in the future, but the current catalog uses original built-in animations only.
