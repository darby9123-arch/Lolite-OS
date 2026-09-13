# Lolite OS

A Lolite-branded browser desktop with a dark purple/blue interface, apps, games, files, wallpapers, AI and responsive PC/mobile layouts.

## Installation guide
1. Download the complete repository/archive.
2. **Extract All** — do not run a single file from inside the ZIP.
3. Keep `core/`, `games/`, `html games/`, `styles.css`, `app.js` and `index.html` together.
4. Open `index.html` in a modern browser, or serve the folder from a local development server.
5. The Game Store discovers both `.html` and `.htm` files from `html games/`.

## Current foundation
- PC/mobile setup screen after startup
- Five-column PC desktop and phone-style mobile layout
- Start menu, taskbar, search, clock and draggable/resizable windows
- Edge snapping and maximize/restore
- Dark purple + blue design
- Experimental Liquid Glass
- UI presets and appearance controls
- Custom wallpaper library and local wallpaper picker
- Files app with ZIP extraction/creation
- Files 2.0 and App Store 2.0 polish
- Default Games and HTML/HTM Game Store
- Game Library 2.0 with search, categories, favorites and recently played
- Game install state and dedicated game player controls
- Utilities Pack 2.6 with Calculator, Notepad, Paint, Clock, Stopwatch, Timer, Screenshotter, Terminal, System Information, Storage Manager, Network Monitor, Unit Converter, Music Player and Quick Notes
- Local persistence for Notepad and Quick Notes
- Utility desktop shortcut and responsive utility grid
- Utility Store with optional installations
- Customisation 2.7 with themes, accent colours, wallpapers, slideshow/random wallpaper, icon sizing, taskbar position and Desktop Studio controls
- Persistent customisation settings stored locally in the browser
- Lolite AI
- Notification Center
- Plugin-ready App Store architecture
- Lolite Browser launcher
- World Sandbox
- Reduce Motion and performance-oriented UI
- Version compatibility warning
- Settings update log
- Desktop polish, active-window states and improved workspace reliability

## Lolite AI
Lolite AI uses a server-side API route so the API key is never placed in browser code. Configure `OPENAI_API_KEY` as a server/Vercel environment variable. The implementation uses the OpenAI Responses API.

## Utility installation
Utilities are optional. The Utility Store keeps installation state in browser storage. Installing a utility adds it to the desktop; uninstalling removes it from the desktop. Version 2.6 also provides a built-in Utilities workspace containing the utility tools listed above.

## Game Store
The Game Store accepts standalone `.html` and `.htm` games and checks the repository game folder for duplicates. Game Library 2.0 adds category filtering, search, favorites, recently played games, install state, game-player fullscreen controls and richer game cards. The current original HTML pack includes 2048, Pong and Sokoban, alongside the existing game collection.

## Temporary game source
`TEMP-GAME-SOURCE.txt` is a temporary placeholder for a public large HTML-game collection URL. It is intended to support the future V3 game importer and should be removed for V3.1.

## Versioned core files
New Lolite feature layers use a version number in the filename, including the dot, such as `core/v2.4.js`, `core/v2.5.js`, `core/v2.6.js` and `core/v2.7.js`, so each update layer is easy to identify and track.

## Copyright
Copyright © 2026 Darby9 / Lolite OS. Original Lolite OS code, UI, branding and original game implementations are protected by applicable copyright law unless a file states another license.

Third-party projects and trademarks remain the property of their respective owners and are used according to their applicable licenses.

## Update Log

### 2.7 — Customisation — 2026-09-13
- Added the versioned `core/v2.7.js` customisation layer.
- Added theme presets: Dark, Light, Midnight, Aurora, Retro, Minimal, Pixel and AMOLED.
- Added custom accent colour controls and random accent generation.
- Added local custom wallpaper import with multiple wallpaper support.
- Added Next wallpaper, Random wallpaper and optional 30-second slideshow controls.
- Added Desktop Studio controls for icon size, taskbar position, transparency, corner radius, window shadow and animation level.
- Added persistent local customisation state.
- Added responsive customisation settings UI.
- Updated the version checker to 2.7.
- Checked `html games/`; the existing collection remains present and no new duplicate original-game files were added.

### 2.6 — Utilities Pack — 2026-09-13
- Added the versioned `core/v2.6.js` utilities layer.
- Added a Utilities workspace with built-in tools for Calculator, Notepad, Paint, Clock, Stopwatch, Timer, Screenshotter, Terminal, System Information, Storage Manager, Network Monitor, Unit Converter, Music Player and Quick Notes.
- Added persistent Notepad and Quick Notes storage using browser storage.
- Added a simple Paint canvas with touch/pointer drawing and brush-size control.
- Added Stopwatch and Timer controls with completion notification support.
- Added browser-based screen capture through the Screenshotter when supported by the browser.
- Added a lightweight Terminal with basic informational commands.
- Added system, storage and network information views using browser capabilities.
- Added local audio playback in Music Player.
- Added responsive utility cards and a Utilities desktop shortcut.
- Updated the version checker to 2.6.
- Checked `html games/`; the existing collection remains present and no new duplicate original-game files were added.

### 2.5 — Game Library 2.0 — 2026-09-13
- Added the versioned `core/v2.5.js` Game Library 2.0 layer.
- Added a new searchable game-library presentation with category filtering.
- Added favorites and recently-played tracking using browser storage.
- Added per-game install state and install buttons.
- Added richer game cards with descriptions, categories and game type labels.
- Added a dedicated game player shell with fullscreen and close controls.
- Added responsive game-library and player layouts for smaller screens.
- Added refresh/discovery handling and duplicate-safe HTML/HTM indexing.
- Updated the version checker to 2.5.
- Checked `html games/`; the existing collection remains present and no new duplicate original-game files were added.
- Kept `TEMP-GAME-SOURCE.txt` for the future V3 importer.

### 2.4 — Files & App Store — 2026-09-13
- Added the versioned `core/v2.4.js` layer.
- Added Files 2.0 entry and workspace shortcuts with 2.4 labels.
- Added App Store 2.0 entry and app-store shortcut with 2.4 labels.
- Added responsive 2.4 toolbar, grid, card and badge styling.
- Kept existing Files/ZIP and App Store architecture intact while adding a cleaner 2.4 layer.
- Updated the version checker to 2.4.
- Checked `html games/`; the existing collection is still present and no new duplicate original-game files were added in this update.
- Kept the temporary game-source file available for the future V3 importer.

### 2.3 — Desktop Polish & Reliability — 2026-09-13
- Reworked the versioned `core/v2.3.js` layer around the actual Lolite desktop rather than the browser.
- Improved desktop icon selection and hover states.
- Improved active-window highlighting and taskbar window states.
- Improved window focus/z-index handling when windows are clicked.
- Added double-click titlebar maximize/restore behavior.
- Added viewport clamping so windows are pulled back onscreen after resizing.
- Improved mobile window sizing and taskbar spacing.
- Added clearer Start, Search and Settings accessibility labels/tooltips.
- Added a cleaner 2.3 desktop toast treatment.
- Updated the version checker to 2.3.
- Checked `html games/`; the current folder contains the existing HTML/HTM game collection and no new duplicate original-game files were identified in this update.
- No browser/Scramjet redesign was added to this update.

### 2.2 — Platform Features & App Store Architecture — 2026-09-12
- Added a Notification Center with persistent recent activity.
- Added a versioned `core/v22.js` platform layer.
- Added a plugin-ready App Store architecture for future installable apps, widgets and plugins.
- Added built-in plugin examples for Weather Widget, Quick Notes, Focus Mode and System Info.
- Added persistent plugin installation state.
- Added Lolite AI quick-action hooks for opening supported apps and display tools.
- Added a taskbar notification button.
- Added mobile-responsive Notification Center and App Store layouts.
- Removed the unwanted Vice City HTML game file from `html games/`.
- Checked the HTML game folder again; no duplicate original-game files were identified.
- Updated the version checker to 2.2.
- From this update onward, new core feature files use version numbers in their filenames.

### 2.1 — Display, Clock & Sandbox — 2026-09-12
- Revamped Clock with configurable seconds, minutes, 12/24-hour mode, date visibility and display styles.
- Added desktop right-click **Edit display** menu.
- Added layout presets, icon columns/size controls, taskbar position, Liquid Glass and Reduce Motion controls in Edit display.
- Added persistent display customization.
- Improved World Sandbox canvas resolution and top-down presentation hooks.
- Improved Pong/Game presentation foundation.

### 2.0 — Biggest Update — 2026-09-12
- Added PC/mobile setup immediately after startup.
- Added responsive phone-style mobile layout.
- Added optional Utility Store with persistent installation state.
- Added real Lolite AI interface and server-side `/api/ai`.
- Added OpenAI Responses API integration with server-side key handling.
- Completely redesigned Liquid Glass with stronger blur, saturation, highlights and depth.
- Improved animations and reduced-motion behavior.
- Replaced bright default scrollbars with Lolite styling.
- Added original standalone HTML games: 2048, Pong and Sokoban.
- Removed the previous restricted-game gate and its startup-page script.
- Updated version checking to 2.0.
- Added a mobile/desktop responsive foundation for future phone-specific apps and widgets.

### 1.9 — Window Snapping & Multitasking
- Added edge snapping, snap previews and maximize/restore.

### 1.8 — Desktop Grid & Custom Wallpaper
- Added the five-column desktop grid and custom local wallpapers.

### 1.7 — Window Controls & Resizing
- Added clean X-only window controls and resizing.

### 1.6 — App Store & UI Reliability
- Added the Lolite App Store and improved controls, scrollbars and game sizing.

### 1.4 — Scramjet & UI Reliability
- Added the Scramjet launcher.
- Improved window and responsive UI behavior.

### 1.3 — App Suite & Desktop Overhaul
- Added Paint, Notepad, Calculator, Screen Capture, Clock, Widgets, Battery, Auto Clicker and Terminal.
- Added the Lolite AI shell and browser-client launcher.
- Replaced emoji desktop icons with Lolite CSS glyphs.

### 1.2 — Game Performance & Reliability
- Added installation guidance, game search, improved HTML/HTM focus and more playable games.

### 1.1 — Polish & Reliability
- Improved Files, games, Liquid Glass and UI reliability.

### 1.0 — Major Edition
- Added UI presets, accent colours, advanced Settings and the major Lolite platform architecture.
