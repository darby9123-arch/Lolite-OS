# Lolite Crimson — 3.16.0

Crimson is the default desktop and browser theme. Open **Settings → Wallpapers** for the collection and **Settings → Sounds** for volume, mute and previews. The existing five desktop themes and five browser themes are still selectable.

The theme migration runs once and sets Crimson, the red accent and glass off. It does not clear app, account, file, game, wallet or chat data. It keeps the saved wallpaper (legacy IDs map to the closest new collection artwork), preserves accessibility preferences, and retains custom wallpaper data. The advanced settings retain the existing cursor packs and theme controls.

## Assets

App icons and eight landscape/abstract bases are original local SVG artwork. The live effects are canvas animation over those bases or the dunes image. They do not depend on remote video hosting. Still thumbnails never run animation loops. Custom JPG, PNG and WebP uploads are limited to 3 MB and stored locally; storage errors are handled without replacing the current wallpaper.

`assets/wallpapers/crimson-dunes.webp` was created with the built-in image generator and encoded to WebP for delivery. Generation prompt: “Use case: photorealistic-natural. Asset type: desktop wallpaper for Lolite OS, a red and charcoal desktop interface. Create a stunning ultra-wide 16:9 wallpaper, red sandstone dunes at blue-hour dusk, flowing sculptural ridges and fine sand texture, a dark burgundy sky and deep near-black shadows, a narrow vermilion rim of light along the dune crests. Sophisticated landscape photography, restrained cinematic lighting, rich tactile surfaces, natural details rather than synthetic smooth gradients. Dark uncluttered left quarter for desktop icons. Expansive central and right composition with beautiful sweeping dune forms. No people, no objects, no text, no logos, no watermarks, no interface, no frame. Landscape image only. Save as high resolution 16:9 landscape.”

## Verification

Run `node --test tests/crimson.test.cjs`.

Eight tests cover local asset availability, legacy selections, single animation/canvas lifecycle, visibility and reduced-motion pauses, saved wallpaper and pause preferences, custom wallpaper selection, gesture-gated sound synthesis, mute/zero-volume behaviour, sound preference persistence and parsing of the referenced browser scripts.

Browser QA covers the startup chooser, Crimson desktop and browser mode, new Home, wallpaper filter and selection, persisted mute/volume after reload, reduced-motion control, multi-character browser search, Files and Game Store. The Home and wallpaper settings layouts also pass a 390px-wide viewport check with no horizontal overflow. Device speaker output and native Windows packaging are not validated by the browser checks.
