# Live wallpapers and system sounds — 3.18.0

Settings → Wallpapers opens the new MotionBGS collection. There are 24 remote video wallpapers, eight local canvas live scenes and nine local still wallpapers. Search works with names, categories and provider names. Category filters and source links stay available with keyboard controls.

MotionBGS retains the video and poster hosting. Each catalog entry links to its original page. HD sources and the published 960×540 alternatives were read from those pages on 2026-10-25. Internet access is required for this collection. No videos are bundled in the installer; existing local wallpapers still work offline.

The player is muted and loops only the selected scene. Switching pauses, clears, reloads and removes the previous video element. Live motion pauses with the tab hidden, in Browsing Style, or under reduced motion. User pause, wallpaper and quality preferences persist. HD errors fall back once to the published preview; final failure leaves the poster and offers Try again. Cards load still posters lazily and never play preview videos.

Settings → Sounds offers 36 original Web Audio cues in seven categories. Windows, controls, files, notifications and personalisation are enabled by default; typing and hover are optional. Existing master mute/volume preferences are preserved. The engine uses one AudioContext unlocked by interaction, prioritises semantic feedback over a generic click, limits repeated cues and caps simultaneous voices at 12. Muting and hiding the page stop active voices and clear queued sounds. Games, media and calls keep their own audio controls.

## Validation

- `node --test tests/*.test.cjs`: 30 passing checks, including classic-script parsing, wallpaper lifecycle, video cleanup, pause/resume, source fallback, stale play promises, preference restoration, sound categories, priority, voice cap, mute, gesture unlock, window management, notes and calculator.
- Browser playback: all 24 MotionBGS HD videos reached readyState 4 with exactly one player and no media error; all had at least 1920 horizontal pixels. Detailed observations: `motionbgs-playback-checks.json`.
- Data saver switched to a 960-pixel video. Live motion stopped playback. Browsing Style paused the player and Desktop Style resumed it.
- Search for GTA returned IV, VI and V scenes. Gaming category posters loaded. The chosen scene survived reload.
- Sound preview confirmed that the real browser AudioContext accepted a cue; master mute disabled previews. Per-category and master preferences survived reload.
- At a 390px viewport the wallpaper panel had equal client/scroll width (362px), with wrapping filters and a single-column gallery.
- Removed an old File Explorer wrapper's 560×420 defaults for unrelated apps, allowing Settings to use the window manager's intended size.

External media availability depends on MotionBGS. Audio inside cross-origin game/browser frames is outside these interface controls. Sound coverage is action feedback, not a claim that every third-party app has custom cues.
