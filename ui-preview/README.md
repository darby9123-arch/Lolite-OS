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

## Actual Liquid Glass — WebGL1 refraction (18 November 2026)

The **Real Liquid Glass** section has three performance presets: **Off**, **Balanced** and **High**. Balanced is the default. Adjust **Refraction**, **Glass thickness**, **Edge reflections**, or switch optional **Animated wallpaper** on. Drag the transparent **Real Liquid Glass** lens over the wallpaper to see actual background pixels bend around its curved edges.

Unlike blur-only glassmorphism, `liquid-glass.js` uses a **single shared WebGL1 context**. It first renders an original wallpaper scene into a framebuffer-attached texture, then draws a normal background pass and refractive glass passes. The refraction shader samples **displaced coordinates in that wallpaper texture**, including a slight edge chromatic shift. It only draws refraction inside bounded glass regions (lens, Start menu, window, quick panel, taskbar) using `gl.scissor` and rounded-rectangle masking. The controls and text remain real interactive HTML on top.

### Performance rules

- **One WebGL canvas/context**, regardless of how many preview windows appear. No individual GPU context per UI element.
- **No continuous redraw by default.** Renders on interactions, resize, wallpaper changes or scene updates. Optional wallpaper motion caps draws to **20 FPS**.
- Balanced caps the canvas at approximately **750,000 device pixels**; High at **1,250,000**. On devices under 4 GB reported RAM or with Data Saver, the cap drops to **450,000** and animation pauses.
- Rendering pauses while the tab is hidden or the preview is out of view. Reduced-motion preferences disable the optional animated wallpaper, retaining static refraction.
- On WebGL initialization, shader or framebuffer failure, the website displays the original background with a CSS frosted-glass fallback. GPU context loss is handled. Switching Off stops GPU painting without touching the real Lolite desktop.
- `tests/liquid-glass.test.cjs` provides shader, framebuffer, single-context, resolution, fallback and visibility checks.

### Scope / limitation

**The glass genuinely refracts the original UI Lab wallpaper texture.** It cannot transparently sample arbitrary DOM/windows, embedded game frames, or cross-origin live video. Browsers restrict third-party media as WebGL textures unless their servers grant appropriate cross-origin permission. The preview is designed so the background is **under our control**; extending it to real Lolite wallpapers requires a separate permitted-texture pipeline and browser-specific fallbacks. This is why the production OS still uses its existing readable CSS glass as the fallback instead of silently replacing live content with a potentially inaccurate snapshot.

The main Lolite OS's legacy decorative glass renderer is separately optimized to use at most **two visible GPU contexts**, lower texture resolution, a roughly 15 FPS cap, no subtree-wide DOM mutation observation and automatic deactivation in Lite Mode, reduced motion or a hidden tab. That legacy effect is **not** the same as the UI Lab's true wallpaper refraction yet.
