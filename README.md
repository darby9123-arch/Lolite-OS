## Launch Lolite OS

- **[Download Lolite OS for Windows](https://github.com/darby9123-arch/Lolite-OS/releases)** — install `LoliteOS-Setup.exe` from a desktop release; includes the app and dedicated launcher
- **[Windows build, update and distribution guide](docs/DESKTOP.md)**
- **[Launch Lolite OS on GitHub Pages](https://darby9123-arch.github.io/Lolite-OS/)** — play and use Lolite OS in your browser
- **[Open Lolite OS on Vercel](https://lolite-os.vercel.app/)** — alternate hosted version

# Lolite OS

**Browser hosting note:** GitHub Pages is a static preview and cannot run the proxy backend. Scramjet also needs a persistent WebSocket-capable Node host. See [Browser Hosting Requirements](docs/BROWSER-HOSTING.md); the repository now includes a `Dockerfile` and `render.yaml` for that host.

The Vercel version includes Ultraviolet runtime files and the Bare HTTP endpoint, but its service worker currently fails in browser testing. Scramjet's proxy runtime is unavailable on Vercel. Both browser apps now offer a standard, non-proxy embedded browsing mode for sites that permit framing, with an Open in tab option.

A Lolite-branded browser desktop with a dark purple/blue interface, apps, games, files, wallpapers, AI and a responsive desktop layout.

## Update Log

### 3.15.1 — Reliable desktop updates and fresh reinstall — 2026-10-19
- Added **Reinstall latest files**: recheck GitHub, download a fresh verified installer even at the current version, then replace program files while keeping personal data.
- Desktop and launcher startup now check the official release feed; the desktop has direct **Updates** and **README** buttons.
- Added the GitHub README inside the launcher, with refresh, a saved offline copy and safe Markdown rendering.
- Added last-successful-check timestamps, clearer errors, Windows system-proxy networking and stale-download protection.
- Changed Windows release automation to assign a new patch version when application files change, so new source changes reach desktop users.
- Removed Vice City from the game catalogue and featured carousel.

### 3.15.0 — Windows desktop and Lolite Launcher — 2026-10-18
- Added a bundled Electron desktop application and a separate Lolite Launcher entry executable.
- Added native file dialogs, selected-folder import, local fonts and offline file-viewer libraries.
- Added verified GitHub release downloads, pause/resume, stable/beta settings, repair checks and recovery installers.
- Added an NSIS installer with shortcuts and data-preserving upgrades/uninstall, plus Windows build and release automation.
- Desktop signing credentials are optional and never stored in the repository. See the desktop guide for verification status and configuration.

### 3.14.0 — File viewers and Explorer workspace — 2026-10-16
- Added media playback, subtitles, image transforms/export, PDF pages/search, code editing, CSV tables, spreadsheet values, document text previews, fonts and 3D models.
- Added a tempo-aware MIDI parser and basic synthesizer.
- Added worker-based ZIP/TAR/GZ/TGZ inspection/extraction with integrity and path checks.
- Added tabs, Recent, Favorites, recoverable Trash, filters, thumbnails, internal drag/drop and an optional preview/properties pane.
- Optional decoders load on demand; media codec support varies by browser. See [File viewer compatibility](docs/FILE-VIEWERS.md) for exact support and limitations.
- Preserves original files; edits require Save or export. Archive extraction uses a separate destination folder.

### 3.13.0 — Windows-inspired File Explorer — 2026-10-16
- Rebuilt Files with a Windows-style command bar, address breadcrumbs, editable paths, sidebar and status bar.
- Added Details / Large icons views, sorting, folder search, multi-selection, context menus and keyboard shortcuts.
- Added transactional copy, cut, paste, rename and delete, with collision-safe imports and folder-boundary checks.
- Added safe image/text previews, downloads and ZIP extraction into the current folder.
- Fixed the storage API exposure that prevented the previous Explorer module from initializing.
- Files remain stored locally in browser IndexedDB; this does not provide unrestricted access to the computer filesystem.

### 3.12.0 — A unified Lolite interface — 2026-10-16
- Redesigned desktop, full-width taskbar, Start menu and Home dashboard.
- Shared slate surfaces, accent colours, typography and controls across Settings, Files, Game Store, App Store, Chat, AI, browsers and creative tools.
- Refreshed device chooser, mobile surfaces and welcome screen.
- Added visible keyboard focus, labelled window controls, responsive layouts and reduced-motion support.
- Existing app functionality, files, preferences and optional Liquid Glass are preserved.

### 3.11.3 — Firefox search and iframe handling — 2026-10-16
- DuckDuckGo, Google, and Bing prevent their pages from being embedded inside Lolite's standard browser windows.
- When users search or open these sites, Lolite opens a normal browser tab instead of displaying Firefox's "Can't Open This Page" iframe error.
- Added a clean built-in browser home, a clear "Open in a browser tab" fallback, and improved Home, Reload, and Open in tab buttons.
- Both browser apps continue to support ordinary embedded browsing for sites that allow it. The proxy transports remain disabled.

### 3.11.2 — Browser account and fallback fixes — 2026-10-15
- Fixed both browser apps attempting unavailable proxy transports, which could leave blank or failed pages.
- Both browser apps now present standard embedded browsing after signing in with an existing Lolite Chat account, with Open in tab for websites that block embedding.
- Improved account-session error handling. Logging in through Lolite Chat can unlock open browser windows; logging out locks them again.
- **Proxy status:** Scramjet and Ultraviolet transport remains disabled, so this is standard web browsing, not a working proxy.

### 3.11.1 — Shared browser account sign-in — 2026-10-15
- Scramjet and Ultraviolet browser windows now ask for a Lolite Chat username and password before browsing.
- Reused the existing Supabase Auth accounts and registration flow instead of storing passwords in a new database.
- Added a backend account-token verification endpoint and closed the unauthenticated Bare and Wisp transport routes. General-purpose proxies are not enabled on the public host.
- Standard embedded browsing remains available after sign-in on websites that allow it.

### 3.11.0 — Minecraft 1.8 and browser fallback improvements — 2026-10-15
- Changed the Game Store's Minecraft entry to the upstream-hosted EaglercraftX 1.8 client from [Eaglercraft Extras](https://github.com/x8rr/Eaglercraft-Extras). The game opens in a Lolite window using the official hosted client; Lolite does not bundle copyrighted game files.
- Added Minecraft 1.8 shortcuts on the desktop, in the Start menu, Search, and the Phone/Tablet launchers.
- Added normal embedded browsing and an Open in tab option to Scramjet when the proxy runtime is unavailable. Added a corresponding Browse directly fallback to Ultraviolet when its service worker cannot initialize. Standard browsing does not bypass network restrictions and some websites block embedding.
- Kept the existing Minecraft Pocket Edition HTML file in the repository for compatibility, but replaced the visible Store listing with Minecraft 1.8.


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

