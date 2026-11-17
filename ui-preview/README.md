# Lolite UI Lab — 6.0 design preview

**Website:** https://darby9123-arch.github.io/Lolite-OS/ui-preview/

This is a **separate interactive concept website** for testing Lolite OS interface ideas before they are implemented in the real operating system. It is not a replacement for the main desktop and does not access Lolite accounts, game files, Supabase or any backend.

## What you can preview

Use the left navigation to switch among **Desktop**, **Start menu**, **Windows**, **Game Store**, **Lolite Chat**, **Settings**, **Wallpapers**, and **UI components**. The large central preview is an interactive mock operating system. Its taskbar, Start search, mock Chat messages, window buttons, game categories, preview wallpapers and Quick Settings have working demo interactions. The window titlebar can be dragged; maximize and restore operate inside the preview. The Expand button uses the browser Fullscreen API when available.

These are interactive **design demos**, not the real Game Store or Chat. A demo game will not launch an actual game; a demo Chat message is not sent to anyone.

## Cursor Glow 2.0 experiment

The right-hand inspector controls a Windows-style cursor-follow effect on explicitly marked UI components only:

- Enable or disable the glow.
- Adjust intensity (5–100%) and glow spread (70–310 px).
- Select blue, purple, cyan or white.
- Select buttons, cards and taskbar icons independently.

The effect uses pointer movement to update a radial CSS gradient. It is not an always-on pointer trail and is limited to interactive surfaces. Touch-only devices and reduced-motion preferences suppress the hover effect. No game or app iframe is captured or modified.

## Other controls

- Switch between Cosmos, Aero and Minimal **preview themes**.
- Switch between three original **prototype wallpaper** designs.
- Click **Copy design settings** to copy your chosen settings as JSON (clipboard permission may be needed).
- Reset the current preview scene or reset design controls.
- Press **Ctrl+K** (or **Cmd+K**) to open the Start search while the page has focus; **Escape** dismisses open menus.
- Settings are saved under the isolated browser key `loliteUiLabV1`. Reset controls restores the design defaults. These settings do **not** affect the main Lolite OS.

## Files

- `index.html` — accessible standalone page and SVG icon definitions.
- `styles.css` — responsive OS mockup and hover-glow visuals.
- `app.js` — preview controls, event handling, window interactions and saved preview settings.
- `../tests/ui-preview.test.cjs` — standalone scene, CSS, state and security regression tests.

For local development, serve the repository root over HTTP (the logo uses a relative `../assets/` path), then open `/ui-preview/`. The GitHub Pages workflow uploads the entire repository, so the directory is published at the website URL above when a deployment completes.

## Design goals

Keep the preview faithful to Lolite's Windows-like design direction: calm colours, legible type, consistent alignment, deliberate hover glow, realistic small-window behaviour, no massive effects, and no changes to the working OS while testing ideas. Once a design is approved, implement it separately in the real Lolite OS and verify the actual app.
