# Lolite OS

A Lolite-branded browser desktop with a dark purple/blue interface, apps, games, files, wallpapers, AI and responsive PC/mobile layouts.

## Installation guide
1. Download the complete repository/archive.
2. **Extract All** — do not run a single file from inside the ZIP.
3. Keep `core/`, `games/`, `html games/`, `styles.css`, `app.js` and `index.html` together.
4. Open `index.html` in a modern browser, or serve the folder from a local development server.
5. The Game Store discovers `.html`, `.htm` and `.zip` game packs from `html games/`.

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
- Game Library 2.9 with ZIP game pack discovery and browser-side extraction
- ZIP packs can contain multiple HTML/HTM games and are presented with a game picker
- Individual `.html` and `.htm` games continue to launch normally
- Game install state and dedicated game player controls
- Utilities Pack 2.6 with Calculator, Notepad, Paint, Clock, Stopwatch, Timer, Screenshotter, Terminal, System Information, Storage Manager, Network Monitor, Unit Converter, Music Player and Quick Notes
- Local persistence for Notepad and Quick Notes
- Utility desktop shortcut and responsive utility grid
- Utility Store with optional installations
- Customisation 2.7 with themes, accent colours, wallpapers, slideshow/random wallpaper, icon sizing, taskbar position and Desktop Studio controls
- Persistent customisation settings stored locally in the browser
- Widgets 2.8 with Clock, Calendar, Weather placeholder, Battery, Storage, Network, Quick Notes, Recently Played, Favourite Apps and World Sandbox cards
- Quick Settings 2.8 with Liquid Glass, Reduce Motion, Gaming Mode, Do Not Disturb, Brightness and Volume controls
- Persistent widget/quick-setting preferences stored locally
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
The Game Store accepts standalone `.html` and `.htm` games plus `.zip` game packs. Game Library 2.9 downloads ZIP packs in the browser, extracts them with JSZip, detects HTML/HTM entries and provides a picker when a pack contains multiple games. Individual HTML/HTM games continue to launch directly. ZIP games that depend on unusual server-side behavior or dynamic relative requests may not work in a browser-only extracted environment.

## Temporary game source
`TEMP-GAME-SOURCE.txt` is a temporary placeholder for a public large HTML-game collection URL. It is intended to support the future V3 game importer and should be removed for V3.1.

## Versioned core files
New Lolite feature layers use a version number in the filename, including the dot, such as `core/v2.4.js`, `core/v2.5.js`, `core/v2.6.js`, `core/v2.7.js`, `core/v2.8.js` and `core/v2.9.js`, so each update layer is easy to identify and track.

## Copyright
Copyright © 2026 Darby9 / Lolite OS. Original Lolite OS code, UI, branding and original game implementations are protected by applicable copyright law unless a file states another license.

Third-party projects and trademarks remain the property of their respective owners and are used according to their applicable licenses.

## Update Log

### 2.9 — Game Library ZIP Packs — 2026-09-13
- Added the versioned `core/v2.9.js` Game Library layer.
- Added automatic `.zip` discovery alongside `.html` and `.htm` games in `html games/`.
- Added browser-side ZIP extraction using JSZip loaded when a ZIP pack is opened.
- Added detection of HTML/HTM games inside ZIP packs.
- Added a game picker for ZIPs containing multiple HTML games.
- Added basic asset URL rewriting for extracted games so common images, stylesheets, scripts, audio and video can load from the extracted pack.
- Kept direct standalone HTML/HTM game launching unchanged.
- Added ZIP-pack labels and icons in the Game Library.
- Checked `html games/`; no ZIP game pack is currently present and no duplicate game files were added.

### 2.8 — Widgets & Quick Settings — 2026-09-13
- Added the versioned `core/v2.8.js` Widgets and Quick Settings layer.
- Added Widgets for Clock, Calendar, Weather placeholder, Battery, Storage, Network, Quick Notes, Recently Played, Favourite Apps and World Sandbox.
- Added widget hide controls and refresh handling.
- Added live browser-local Clock, Calendar, Network, Storage and Battery information when supported.
- Added Quick Settings for Liquid Glass, Reduce Motion, Gaming Mode and Do Not Disturb.
- Added Brightness and Volume sliders with persistent local settings.
- Added responsive widget and quick-setting layouts.
- Updated the version checker to 2.8.
- Checked `html games/`; the existing collection remains present and no new duplicate original-game files were added.

### 2.7 — Customisation — 2026-09-13
- Added the versioned `core/v2.7.js` customisation layer.
- Added theme presets: Dark, Light, Midnight, Aurora, Retro, Minimal, Pixel and AMOLED.
