# Liquid Glass 6.0 — Real Desktop Integration

This document describes Lolite OS's **production** Liquid Glass effect added on 18 November 2026. The earlier interactive prototype remains available at [Lolite UI Lab](https://darby9123-arch.github.io/Lolite-OS/ui-preview/).

## How to use it

In Lolite OS, open **Settings → Appearance → Liquid Glass 6.0** and enable the effect. Choose **Balanced** (default) or **High**, and adjust refraction, edge thickness and reflection strength.

Existing users' Glass preference (`localStorage.glass`) is respected. The feature does not forcibly turn on for everyone. Switching Glass off removes the active WebGL surface and releases its context. Preferences for effect intensity and quality use `lolite.liquidGlass.v1` and are unrelated to account data, wallpaper favourites or app settings.

## How the effect works

`core/liquid-glass.js` uses one shared WebGL1 rendering context and one transparent, pointer-ignored canvas inserted between the desktop wallpaper and interactive OS chrome. It uploads an **accessible current wallpaper image** (or a static poster from the chosen live wallpaper) into a single GPU texture. Its fragment shader samples that texture from **displaced UV coordinates** near the rounded edges of a glass pane, adds subtle colour separation and lighting, and uses scissor rectangles so only glass regions receive GPU output.

The integration currently includes the Windows-style or Cosmos taskbar, Start menu, search panel, quick-settings/calendar panels and the active window's titlebar. Actual applications, window controls and taskbar buttons remain regular HTML. Their original internal content and event handlers are unchanged.

The production effect **does not sample the arbitrary webpage DOM, game content or third-party video frames**. External images require browser-approved CORS access; there is no attempt to bypass that rule. If a wallpaper image isn't accessible or WebGL fails, Lolite retains its normal CSS frosted-glass appearance rather than replacing it with a mismatched illustration.

For live/video wallpapers, the GPU currently refracts the still **poster** representing the same wallpaper. The live wallpaper continues playing normally behind the glass, but its continuously changing video frames are **not** being sampled, and the Settings description makes that distinction clear.

## Performance safeguards

- Exactly **one shared WebGL context**, never one context per window or widget.
- Balanced raster caps at about **600,000 rendered pixels**; High at about **1,100,000**. Uploaded image textures are downscaled to roughly **1,400,000 pixels** before upload.
- **Event-driven rendering** only: wallpaper changes, glass settings, window/panel changes, drags or resizing. No permanent frame loop or extra wallpaper video decoder.
- Redraws are throttled to approximately **30 FPS maximum during interaction**. Idle GPU activity is absent.
- Lite Mode, Data Saver, hidden tabs and browsing-mode changes trigger CSS fallback or pause.
- No global DOM subtree observation. Root class, selected panel and direct window-list changes are monitored narrowly.
- WebGL failure, image CORS rejection and missing wallpapers all retain normal Lolite functionality.
- Reduced-motion users keep a **static** refractive effect without continuous movement.

## Files changed

- `core/liquid-glass.js` — production single-context GPU renderer and Appearance control HTML.
- `core/liquid-glass-6.css` — renderer canvas, translucent panel chrome and Appearance controls.
- `core/crimson.js` — Liquid Glass section in native Settings → Appearance.
- `index.html` — load the new stylesheet and update cache keys.
- `tests/liquid-glass-os.test.cjs` — focused integration, performance and fallback tests.
- `.github/workflows/verify-lolite-4.yml` — run syntax and regression checks when relevant files change.

## Validation status

The focused integration tests run in a mocked DOM/WebGL environment, not a hardware browser. They check resource counts, wallpaper changes, safe fallbacks, Settings wiring and GPU work throttling. Real-world frame rates and CDN CORS permissions require browser validation. If a site update appears cached, refresh with **Ctrl + F5**.
