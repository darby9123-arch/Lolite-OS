# Lolite OS

A Windows-inspired, Lolite-branded web desktop focused on games, creativity and a lightweight UI.

## Current foundation
- Lolite purple/blue desktop
- Startup screen and Lolite logo
- Start menu, taskbar, search and clock
- Draggable app windows
- Minimize / maximize / close controls
- Home dashboard
- High-resolution World Sandbox with a 240×120 simulation grid
- Persistent terrain that does not disappear during simulation
- Water and lava flow simulation
- Grass, forests and tree spreading
- People movement and villages
- Mountains, rocks, deserts, snow and volcanoes
- Clear, rain and storm weather
- Brush size and simulation speed controls
- Pause/resume, clear, rain burst and random-world generation
- Live simulation statistics
- AI-first browser/search UI shell
- Separate Default Games app for built-in games
- Separate Game Store app for repository HTML/HTM games
- Repository HTML Games section with automatic `.html` and `.htm` discovery
- Persistent Files system
- ZIP extraction and ZIP creation
- Installed game library integration
- Experimental Liquid Glass (OFF by default)
- Reduce Motion option
- Expanded wallpaper library with categories and persistent selection
- Version compatibility warning for older Lolite OS builds
- **v1 UI presets**: Windows, Aurora, Classic and Minimal
- **v1 accent colours** with persistent selection
- **v1 advanced Settings tabs** for Appearance, Behavior, Browser and System
- **v1 taskbar position, clock format, compact mode and startup preferences**
- **v1 Scramjet compatibility diagnostics** that detect whether the required browser runtime pieces are actually bundled
- **v1 HTML game pack additions**: original Lolite Snake, 2048 and Breakout games
- **v1.1 taskbar pinning**, redesigned application icons, upgraded Liquid Glass and a revamped Files app
- **v1.1 playable Default Games library** with fixed launch paths and no fake buttons for missing modules

## Update Log

### 1.1 — 2026-09-11 — Lolite OS v1.1: Polish & Reliability Update
- Added a dedicated `core/v11.js` polish layer instead of making the main app.js even larger.
- Added redesigned desktop application icons with stronger shapes, depth, hover feedback and clearer icon hierarchy.
- Added **right-click application menus** on desktop apps and taskbar app buttons.
- Added **Pin to taskbar / Unpin from taskbar**, with persistent pinned apps stored locally.
- Added a dedicated Settings section for managing pinned apps.
- Upgraded Liquid Glass with stronger translucency, saturation, layered highlights, inset lighting, depth and glass-like surfaces while keeping it OFF by default.
- Revamped the Files app with a sidebar, search, item counts, card/grid view, file-type filters, better empty states and cleaner ZIP/file controls.
- Kept the existing IndexedDB storage and ZIP engine underneath the new Files UI.
- Reworked Default Games so only games with actual playable modules are advertised as playable.
- Added polished original **Snake**, **Breakout** and **2048** standalone games to the Default Games library.
- Wired the existing Minefield, Tic-tac-toe, Memory Puzzle, Simon and Nibbles modules through the same launch path.
- Removed the old misleading “Coming soon” launch behavior from the Default Games view.
- Updated app/game icons and cards for a cleaner, more consistent visual language.
- Added a full copyright/about section in Settings and expanded the repository copyright note.
- Clarified that third-party trademarks, game names, assets and libraries remain the property of their respective owners.
- Updated the compatibility checker from **1.0** to **1.1**.
- Checked the `html games/` folder during this build. No duplicate HTML game files were found, so no duplicates were deleted.

### 1.0 — 2026-09-11 — Lolite OS v1: Major Edition
- Major release rather than a normal 0.x feature update.
- Added a dedicated `core/v1.js` feature layer so the new customization system stays separate from the main app.
- Added four selectable UI presets: **Windows**, **Aurora**, **Classic** and **Minimal**.
- Added six selectable accent colours with persistent localStorage settings.
- Added deeper Settings navigation for Appearance, Behavior, Browser and System.
- Added taskbar position switching between bottom and top.
- Added 12-hour / 24-hour clock preference storage.
- Added Compact UI and Smooth Animations controls.
- Added startup preference for opening Home automatically.
- Kept Experimental Liquid Glass available while allowing the user to disable it independently.
- Added a dedicated `core/scramjet.js` diagnostic layer.
- Checked the current MercuryWorkshop Scramjet architecture before integration. The upstream project currently requires more than a static HTML page: its controller uses a service worker and proxy-transport infrastructure, so Lolite v1 **does not fake a full proxy**. Instead, the Browser Settings page reports whether the required runtime pieces are actually present.
- Added three original HTML games inspired by the kinds of games found in the MIT-licensed Shrimpy Game Box: **Lolite Snake**, **Lolite 2048** and **Lolite Breakout**. They are original Lolite implementations rather than copied source/assets.
- Checked the `html games/` folder on this build. No duplicate filenames were found.
- Bumped the compatibility checker from **0.9** to **1.0**.

### 0.9 — 2026-09-11 — Version Compatibility Warning
- Added a version checker that tracks the Lolite OS build used by the browser.
- Older saved builds are warned that the latest version should be downloaded because some features may not work properly.
- Added a clear latest-version number to the warning.
- Added a **Later** button so the notice can be dismissed.
- Added a dedicated `core/version-check.js` module.

### 0.8 — 2026-09-11 — Default Games & Game Store
- Split the game experience into two apps: **Default Games** for built-in Lolite games and **Game Store** for repository HTML/HTM games.
- Added automatic `.html` and `.htm` discovery.
- Checked the `html games/` folder and added Slope 2 Player, Slope, Wheely, Wrestle Bros and Zombie Rush automatically.

### 0.7 — 2026-09-11 — HTML/HTM Game Support
- Updated repository game discovery to recognize both `.html` and `.htm` files.

### 0.6 — 2026-09-11 — Wallpaper Library
- Added wallpaper categories and persistent wallpaper selection.

### 0.5 — 2026-09-11 — HTML Games auto-discovery
- Added automatic repository HTML game discovery and Refresh support.

### 0.4 — 2026-09-11 — HTML Games integration
- Added the uploaded HTML games to the Lolite Game Library.

### 0.3 — 2026-09-11 — World Sandbox high-resolution upgrade
- Added the 240×120 simulation, terrain, water, lava, weather, people, villages and live statistics.

### 0.2 — 2026-09-11 — Files & ZIP system
- Added persistent IndexedDB files, ZIP extraction/creation and installed-game detection.

### 0.1 — 2026-09-11 — Standalone game expansion
- Added standalone playable HTML games and expanded the Game Library architecture.

## Copyright note
Copyright © 2026 Darby9 / Lolite OS. Original Lolite OS UI, code, branding and original game implementations are protected by applicable copyright law unless a file explicitly states otherwise.

Third-party game names, franchises, trademarks, libraries, assets and other external works remain the property of their respective owners. Lolite OS does not claim ownership of third-party names or assets merely because they appear in a catalog or integration layer.

Open-source components are used according to their applicable licenses. License-specific notices should be kept with the relevant component when required.

## External project note
The v1 Scramjet investigation referenced the public MercuryWorkshop Scramjet project. Its upstream controller package is AGPL-3.0-only, so Lolite does not copy Scramjet source into this repository. The current integration is a diagnostic/adapter layer until a complete runtime can be packaged correctly.

The HTML game-pack search also used the public Shrimpy Game Box as inspiration. Its README describes that collection as MIT-licensed; Lolite's games are original implementations rather than copied source or assets.

## Roadmap
Future major work can focus on a fully bundled Scramjet controller/transport runtime, richer app installation, improved window management, notifications/calendar, more default games, and a more capable AI-first browser.
