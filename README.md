# Lolite OS

A Windows-inspired, Lolite-branded web desktop focused on games, creativity and a lightweight UI.

## Installation guide

Lolite OS is a browser-based desktop and should be run from a complete extracted copy of the repository.

1. **Download the Lolite OS repository/archive.**
2. **Extract all files** — do not open the ZIP and run only a single file from inside it.
3. Keep the folder structure intact, especially `core/`, `games/`, `html games/`, `styles.css`, `app.js` and `index.html`.
4. **Run/open `index.html`** in a modern browser.
5. If you are using a local development/server setup, serve the extracted folder and open **`index.html`** from that server.
6. For HTML Game Store games, keep the `html games/` folder beside the main `index.html`; the Game Store discovers `.html` and `.htm` files from that folder.

> **Important:** Extract All is recommended because Lolite loads several JavaScript modules and game folders using relative paths. Running only a loose `index.html` without the rest of the extracted files will make buttons, apps or games appear missing.

## Current foundation
- Lolite purple/blue desktop
- Startup screen and Lolite logo
- Start menu, taskbar, search and clock
- Draggable app windows
- Minimize / maximize / close controls
- Home dashboard
- High-resolution World Sandbox with a 240×120 simulation grid
- Persistent terrain, water/lava, weather, villages and biome simulation
- AI-first browser/search UI shell
- Separate Default Games app and HTML/HTM Game Store
- Persistent Files system with ZIP extraction/creation
- Experimental Liquid Glass (OFF by default)
- Reduce Motion option
- Expanded wallpaper library
- Version compatibility warning
- UI presets and accent colours
- **v1.4 real Scramjet web-app launcher using the upstream MercuryWorkshop app**
- Original Lolite game pack including Snake, 2048, Breakout, Sliding Puzzle, Maze, Tetris and Connect Four
- **v1.4 removed broken taskbar pinning**
- **v1.4 fixed window, taskbar and responsive UI overlap issues**
- **v1.3 non-emoji application icon system**
- **v1.3 Paint, Notepad, Calculator, Screen Capture, Clock, Widgets, Battery, Auto Clicker and Terminal apps**
- **v1.3 Minecraft app using an Eaglercraft browser client launcher**
- **v1.3 Lolite AI placeholder marked Coming Soon in v2**
- **v1.3 Update Log inside Settings**

## Update Log

### 1.4 — 2026-09-11 — Lolite OS v1.4: Scramjet & UI Reliability Update
- Replaced the old Scramjet diagnostic-only panel with a **real launcher/embedded entry point for the upstream MercuryWorkshop Scramjet web app**. If embedding is blocked by the browser, the app provides a direct launch button instead.
- Removed the broken **Pin to taskbar** feature and cleared old pin state so stale pinned entries do not return.
- Removed the old taskbar pin context-menu behavior from the active UI.
- Added stronger window bounds, scroll handling, responsive wrapping and taskbar overflow handling to prevent common UI overlaps.
- Checked `html games/` on this build; existing HTML/HTM games were left intact and no duplicate game entries were found.
- Removed the temporary GTA Vice City wrapper rather than shipping a third-party hosted game launcher through Lolite.

### 1.3 — 2026-09-11 — Lolite OS v1.3: App Suite & Desktop Overhaul
- Added a large new built-in app suite: **Paint, Notepad, Calculator, Screen Capture, Clock, Widgets, Battery, Auto Clicker and Terminal**.
- Added a **Lolite AI** app shell that intentionally displays **Coming soon in v2** instead of pretending to have AI functionality.
- Added a **Minecraft** app that launches an Eaglercraft browser client. Eaglercraft is a separate browser-based Minecraft project; Lolite does not copy its third-party client source into this repository.
- Added a **Scramjet** app/status panel tied to Lolite's runtime diagnostics.
- Replaced the desktop's emoji application icons with lightweight CSS-generated application glyphs.
- Reworked pinned taskbar app icons to use the same non-emoji icon system.
- Added an **Update Log** tab directly inside Settings.
- Fixed several app-control issues, including Notepad buttons and repeated settings/game rendering.
- Added terminal `?` help with commands for apps, date/time, echo, version, about and clear.
- Added screenshot and screen recording controls using browser media APIs.
- Added battery information when the browser exposes the Battery Status API.
- Kept the app suite lightweight by creating app UI only when the app is opened.

### 1.2 — 2026-09-11 — Lolite OS v1.2: Game Performance & Reliability Update
- Added an Installation Guide before Current foundation.
- Added searchable Default Games and HTML/HTM Game Store libraries.
- Reworked game controls and improved HTML/HTM keyboard focus.
- Reduced Game Store overhead with cached repository discovery.
- Added original playable Sliding Puzzle, Maze, Tetris and Connect Four modules.

### 1.1 — 2026-09-11 — Lolite OS v1.1: Polish & Reliability Update
- Added taskbar pinning, redesigned application presentation, upgraded Liquid Glass and a revamped Files app.
- Improved default game launch paths and game library reliability.

### 1.0 — 2026-09-11 — Lolite OS v1: Major Edition
- Added UI presets, accent colours, advanced Settings, taskbar controls, startup preferences and Scramjet compatibility diagnostics.

### 0.9 — 2026-09-11 — Version Compatibility Warning
- Added version compatibility warning for older Lolite OS builds.

### 0.8 — 2026-09-11 — Default Games & Game Store
- Split built-in games from repository HTML/HTM games into separate apps.

### 0.7 — 2026-09-11 — HTML/HTM Game Support
- Added repository HTML/HTM game support.

### 0.6 — 2026-09-11 — Wallpaper Library
- Added categorized CSS wallpaper library and persistent wallpaper selection.

### 0.5 — 2026-09-11 — HTML Games auto-discovery
- Added automatic HTML game discovery.

### 0.4 — 2026-09-11 — HTML Games integration
- Added HTML game integration.

### 0.3 — 2026-09-11 — World Sandbox high-resolution upgrade
- Expanded the World Sandbox simulation and controls.

### 0.2 — 2026-09-11 — Files & ZIP system
- Added persistent virtual Files system and ZIP tools.

### 0.1 — 2026-09-11 — Standalone game expansion
- Added the first standalone Lolite game modules.

## Copyright & third-party projects

Copyright © 2026 Darby9 / Lolite OS. Original Lolite OS UI, code, branding and original game implementations are protected by applicable copyright law unless a file explicitly states otherwise.

Third-party projects, games, libraries, names and assets remain the property of their respective owners and are used according to their applicable licenses. Lolite OS does not claim ownership of third-party trademarks or projects.

The Scramjet integration launches the upstream web application rather than copying its controller, service-worker and transport source into Lolite OS.

## Roadmap
- More complete Scramjet configuration and local runtime packaging where licensing and browser requirements allow
- Richer app installation and file associations
- Better window snapping and multitasking
- Notifications and calendar
- More original default games
- More capable AI-first browser and Lolite AI in v2
