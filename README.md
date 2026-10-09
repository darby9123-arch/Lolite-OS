## [Launch Lolite OS](https://darby9123-arch.github.io/Lolite-OS/)

**Open Lolite OS online:** https://darby9123-arch.github.io/Lolite-OS/

# Lolite OS

A Lolite-branded browser desktop with a dark purple/blue interface, apps, games, files, wallpapers, AI and a responsive desktop layout.

## Update Log

### 3.9.8 — Ultraviolet Worker Path Fix — 2026-10-09
- Removed the broken mobile startup chooser and restored direct startup to the normal Lolite desktop.
- Added an Ultraviolet Browser app entry in the desktop and Start menu, with address/search input, home, reload and open-in-tab controls.
- Connected the browser UI to the Ultraviolet runtime assets, correctly named handler/service-worker bundles and Bare proxy endpoint.
- Added clearer runtime diagnostics when the site is running on static hosting without a proxy backend.
- Configured Vercel routes for the static desktop plus Ultraviolet runtime and Bare HTTP proxy endpoints. WebSocket-dependent sites may still require a full Node host.


### 3.9.4 — Local Lolite AI — 2026-10-09
- Replaced shared cloud AI requests with WebLLM running the Qwen2 0.5B model directly in the browser using WebGPU.
- Added a local model setup button and download/loading progress; the model is cached by the browser for later use.
- AI prompts and replies are generated on-device and are no longer sent to the Lolite AI API.
- Requires a WebGPU-compatible browser and enough available device memory; the first model download may take a while.

### 3.9.3 — Free Lolite AI — 2026-10-09
- Removed the paid OpenAI API-key requirement from Lolite AI.
- Connected the server-side AI endpoint to LLM7's keyless free-tier route referenced by the InferenceMesh provider registry.
- Added basic per-instance request throttling and clearer unavailable/rate-limit messages.
- Kept the provider call on the server so no provider credential is exposed in browser code. Free-tier availability and quotas may change.
- The InferenceMesh project itself was not installed as an npm dependency because the package was not resolvable from the npm registry in the deployment environment; this update used its provider route directly.

### 3.9.2 — AI Endpoint Routing Fix — 2026-10-09
- Routed the GitHub Pages Lolite AI client to the live `lolite-os.vercel.app/api/ai` endpoint instead of a nonexistent deployment hostname.
- Confirmed the public API health endpoint responds successfully; AI generation still requires the private `OPENAI_API_KEY` environment variable to be configured in Vercel.

### 3.9.1 — Lolite AI API Repair — 2026-10-09
- Switched Lolite AI to the supported `gpt-4.1-mini` default model while preserving the `OPENAI_MODEL` override.
- Improved API health reporting, timeout handling, provider error messages and empty-response handling.
- Increased the client timeout and prepared the client for a dedicated GitHub-linked Vercel API deployment.
- The Vercel deployment must have `OPENAI_API_KEY` configured in its server-side environment; the key is never stored in the browser.

### 3.9.0 — WebGL Liquid Glass & Browser Cleanup — 2026-10-09
- Removed Lolite Browser and Ultraviolet Browser from the desktop, Start menu, search, App Store and loaded runtime; removed their obsolete client modules.
- Replaced the CSS-only liquid-glass highlight with a WebGL shader rendering animated fluid caustics, refractive-style colour flow and specular edge reflections on windows, panels and taskbar.
- Kept translucent backdrop blur as the live background layer, with a CSS fallback when WebGL is unavailable.
- Connected the WebGL effect to the Liquid Glass setting and Reduce Motion; updated cache versions to 3.9.0.

### 3.8.0 — Real File Explorer — 2026-10-09
- Rebuilt Files with sidebar locations, breadcrumbs, back/forward/up navigation and folder-aware browsing.
- Added nested folders, file creation, uploads into the current folder, search, file-type icons and readable sizes.
- Preserved IndexedDB persistence and ZIP extraction/export while making stored paths behave like folders.
- Updated cache versions and compatibility checker to 3.8.0.

### 3.7.3 — Wallpapers That Actually Apply — 2026-10-09
- Fixed wallpaper selection so saved library wallpapers survive startup instead of being overwritten by the legacy default wallpaper.
- Made all still and animated wallpaper backgrounds clearly visible by removing the nearly opaque desktop overlay that was washing them out.
- Added wallpaper-matched accent colours across the OS, including controls, selection states and focus outlines.
- Preserved each animated wallpaper's motion identity and made pixel wallpapers render as a repeating pattern.
- Updated cache versions and the compatibility checker to 3.7.3.

### 3.7.2 — Premium 3D Brand & App Icons — 2026-10-09
- Rebuilt the Lolite logo finish with layered bevels, a glossy highlight, deeper extrusions and cleaner reflections.
- Refined app icon consistency and the desktop visual style.
