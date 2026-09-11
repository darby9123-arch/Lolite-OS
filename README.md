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
- **v1.9 window snapping and multitasking**
- Home dashboard
- High-resolution World Sandbox with a 240×120 simulation grid
- Persistent terrain, water/lava, weather, villages and biome simulation
- AI-first browser/search UI shell
- Separate Default Games app and HTML/HTM Game Store
- Persistent Files system with ZIP extraction/creation
- Experimental Liquid Glass (OFF by default)
- Reduce Motion option
- Expanded wallpaper library
- Custom local wallpaper selection with persistence
- Version compatibility warning
- UI presets and accent colours
- **v1.8 five-column desktop icon grid and custom wallpaper app**
- **v1.7 clean X-only window controls and custom window resizing**
- **v1.6 Lolite App Store with one-click app launching**
- **v1.6 responsive Default Games layout so game cards fit smaller windows**
- **v1.6 global dark form/button styling and scrollbar cleanup**
- **v1.6 stronger focus, disabled-state and responsive-window fixes**
- **v1.5 mature-game approval gate for designated Game Store titles**
- **v1.4 real Scramjet web-app launcher using the upstream MercuryWorkshop app**
- Original Lolite game pack including Snake, 2048, Breakout, Sliding Puzzle, Maze, Tetris and Connect Four
- **v1.4 removed broken taskbar pinning**
- **v1.4 fixed window, taskbar and responsive UI overlap issues**
- **v1.3 non-emoji application icon system**
- **v1.3 Paint, Notepad, Calculator, Screen Capture, Clock, Widgets, Battery, Auto Clicker and Terminal apps**
- **v1.3 Minecraft app using an Eaglercraft browser client launcher**
- **v1.3 Lolite AI placeholder marked Coming Soon in v2**
- **v1.3 Update Log inside Settings**

## Mature game access

Lolite marks designated mature Game Store titles as **MATURE**. Mature titles require adult/parent approval on the device before they can be launched. Entering an age by itself is not used as an unlock mechanism.

## Update Log

### 1.9 — 2026-09-11 — Lolite OS v1.9: Window Snapping & Multitasking Update
- Added desktop window snapping when a window is dragged to the left, right or top edge of the screen.
- Added a visual snap preview while dragging a window toward a snap zone.
- Added double-click title-bar maximize/restore behavior for faster multitasking.
- Snapped windows stay within the desktop viewport and update when the browser is resized.
- Resize handles are temporarily hidden on snapped windows so snapping and resizing do not conflict.
- Preserved the existing draggable window and X-only close behavior.
- Checked `html games/` during this build; the existing HTML/HTM files were reviewed and no duplicate game files were identified.

### 1.8 — 2026-09-11 — Lolite OS v1.8: Desktop Grid & Custom Wallpaper Update
- Changed desktop application placement to a **five-column grid**, so icons fill rows instead of stacking in a single column.
- Added a **Custom Wallpaper** desktop app.
- Added local image selection using the browser's file picker.
- Added wallpaper preview and a **Remove wallpaper** control.
- Custom wallpapers are saved locally in the browser and restored when Lolite starts again.
- Added a dedicated Wallpaper desktop icon for quick access.
- Checked `html games/` during this build; the existing HTML/HTM files were reviewed and no duplicate game files were identified.

### 1.7 — 2026-09-11 — Lolite OS v1.7: Window Controls & Resizing Update
- Removed the three colored window-control dots from app title bars.
- Replaced them with a clean, Windows-style **X close button**.
- Added a dedicated bottom-right **window resize handle** with pointer-based resizing.
- Added minimum window sizes and viewport bounds so resized windows stay usable.
- Kept dragging through the title bar while preventing the resize handle from interfering with it.
- Added mobile-friendly resize sizing.
- Checked `html games/` during this build; the existing HTML/HTM files were reviewed and no duplicate game files were identified.

### 1.6 — 2026-09-11 — Lolite OS v1.6: App Store & UI Reliability Update
- Added a dedicated **Lolite App Store** for Paint, Notepad, Calculator, Screen Capture, Clock, Widgets, Battery, Auto Clicker, Terminal, Minecraft, Scramjet and Lolite AI.
- Added app search and category filters to the App Store.
- Added one-click **Open** buttons for the installed Lolite apps.
- Hardened button styling so browser-native white buttons no longer appear unexpectedly on the dark UI.
- Added visible focus and disabled states for controls.
- Styled native scrollbars to match the Lolite dark interface instead of leaving bright default scrollbar tracks/thumbs.
- Fixed responsive game-card sizing so Default Games and HTML games adapt to the available window width instead of overflowing.
- Added additional window, content, grid and toolbar overflow protections to reduce visual overlap.
- Added mobile/small-window breakpoints for app grids, calculators, game cards and toolbars.
- Checked `html games/` during this build; no duplicate game files were identified.

### 1.5 — 2026-09-11 — Lolite OS v1.5: Mature Game Access & Game Store Update
- Added a mature-game access layer for designated Game Store titles.
- Mature titles now show a **MATURE** badge and require adult/parent approval before launching.
- The system deliberately does **not** treat a typed age as sufficient verification or as a bypass.
- Updated Game Store discovery so mature titles are identified consistently.
- Checked `html games/` during this build; no duplicate files were identified.

### 1.4 — 2026-09-11 — Lolite OS v1.4: Scramjet & UI Reliability Update
- Replaced the old Scramjet diagnostic-only panel with a **real launcher/embedded entry point for the upstream MercuryWorkshop Scramjet web app**. If embedding is blocked by the browser, the app provides a direct launch button instead.
- Removed the broken **Pin to taskbar** feature and cleared old pin state so stale pinned entries do not return.
- Removed the old taskbar pin context-menu behavior from the active UI.
- Added stronger window bounds, scroll handling, responsive wrapping and taskbar overflow handling to prevent common UI overlaps.
- Checked `html games/` on this build; existing HTML/HTM games were left intact and no duplicate game entries were found.

### 1.3 — 2026-09-11 — Lolite OS v1.3: App Suite & Desktop Overhaul
- Added a large new built-in app suite: **Paint, Notepad, Calculator, Screen Capture, Clock, Widgets, Battery, Auto Clicker and Terminal**.
- Added a **Lolite AI** app shell that intentionally displays **Coming soon in v2** instead of pretending to have AI functionality.
- Added a **Minecraft** app that launches an Eaglercraft browser client. Eaglercraft is a separate browser-based Minecraft project; Lolite does not copy its third-party client source into this repository.
- Added a **Scramjet** app/status panel tied to Lolite's runtime diagnostics.
- Replaced the desktop's emoji application icons with lightweight CSS-generated application glyphs.
- Added an **Update Log** tab directly inside Settings.

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
- Notifications and calendar
- More original default games
- More capable AI-first browser and Lolite AI in v2
