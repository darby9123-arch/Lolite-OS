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

## Update Log

### 0.9 — 2026-09-11 — Version Compatibility Warning
- Added a version checker that tracks the Lolite OS build used by the browser.
- Older saved builds are now warned that the latest version should be downloaded because some features may not work properly.
- Added a clear latest-version number to the warning.
- Added a **Later** button so the notice can be dismissed.
- Added a dedicated `core/version-check.js` module instead of mixing version logic into the main app.
- Added a polished Lolite-styled update warning that works on desktop and smaller screens.
- Checked the `html games/` folder during this build; no duplicate games were found to remove.

### 0.8 — 2026-09-11 — Default Games & Game Store
- Split the game experience into two apps: **Default Games** for built-in Lolite games and **Game Store** for repository HTML/HTM games.
- Added a dedicated `core/game-library.js` module to keep the game-store logic separate from the main desktop code.
- Added separate desktop and Start menu entries for Default Games and Game Store.
- Moved repository HTML/HTM game browsing out of the default game library.
- Game Store automatically discovers both `.html` and `.htm` files and can refresh the repository list.
- Checked the `html games/` folder on this build and added the newly discovered repository games to the store automatically: Slope 2 Player, Slope, Wheely, Wrestle Bros and Zombie Rush.
- No exact duplicate filenames were found, so no game files were deleted.

### 0.7 — 2026-09-11 — HTML/HTM Game Support
- Updated repository game discovery to recognize both `.html` and `.htm` files.
- Kept automatic discovery and the Refresh action working for both extensions.
- Updated filename-to-game-name handling so either extension is removed when generating display names.
- Kept repository games launching inside Lolite OS windows.
- Checked the `html games/` folder as part of this update; no duplicate game entries were found to remove.

### 0.6 — 2026-09-11 — Wallpaper Library
- Added a dedicated `core/wallpapers.js` module so the wallpaper system stays separate from the main desktop code.
- Added wallpaper categories: Lolite, Abstract, Nature, Space, Pixel, Gaming, Dark, Minimal, Retro and World Sandbox.
- Added multiple lightweight CSS-only wallpapers in each category.
- Added wallpaper previews and category switching inside Settings.
- Added persistent wallpaper selection with localStorage.
- Kept wallpapers image-free and lightweight for fast loading.

### 0.5 — 2026-09-11 — HTML Games auto-discovery
- Upgraded the HTML Games section to discover `.html` files directly from the repository's `html games/` folder.
- Added a Refresh action so newly added repository HTML games can appear without manually editing the game list.
- Kept the existing built-in game list as a fallback if GitHub discovery is unavailable.
- Added safer display-name handling for discovered filenames.
- Kept the repository launch flow inside Lolite OS windows.
- Updated `core/integration.js` only, keeping the main app.js architecture clean.

### 0.4 — 2026-09-11 — HTML Games integration
- Added the uploaded HTML games to the Lolite Game Library.
- Added a dedicated **HTML Games** section for repository games.
- Added launch buttons that open each game inside a Lolite OS app window.
- Added the current HTML game entries: Granny Original, GTA III, Paper.io 2 and Slope Plus.
- Kept the original files in `html games/` so more games can be added later.
- Added the integration through `core/integration.js` instead of expanding the main app.js file.
- Note: these uploaded HTML wrappers load some of their game assets/code from external hosts, so their availability can depend on those hosts.

### 0.3 — 2026-09-11 — World Sandbox high-resolution upgrade
- Replaced the small paint-only sandbox experience with a standalone high-resolution 240×120 pixel simulation.
- Added persistent terrain generation so land remains in the world instead of disappearing each update.
- Added flowing water and lava with simple gravity and sideways spreading.
- Added lava cooling when it contacts water.
- Added grass, forests and natural tree spreading.
- Added people that wander across the world and village growth mechanics.
- Added mountains, rocks, deserts, snow and volcano/lava materials.
- Added clear, rain and storm weather with rainfall effects.
- Added brush-size control, simulation speed, pause/resume, clear, random-world and rain controls.
- Added live population, tree, village, water, lava and tick statistics.
- Moved the simulation into `games/world-sandbox/index.html` and connected it to the Lolite OS World Sandbox app.
- Kept the simulation self-contained and lightweight for browser performance.

### 0.2 — 2026-09-11 — Files & ZIP system
- Added persistent browser-based file storage using IndexedDB.
- Added file uploads and folder creation.
- Added ZIP extraction directly inside Lolite OS.
- Added ZIP creation for stored files.
- Added automatic detection of games containing `index.html`.
- Added installed-game persistence and launching from the Game Library.
- Split the Files functionality into `core/files.js` and integration logic into `core/integration.js`.
- Improved the Files app UI with a dedicated toolbar, file list, status text, and empty state.

### 0.1 — 2026-09-11 — Standalone game expansion
- Added standalone playable HTML games to the repository.
- Expanded the Game Library architecture so games can be launched as separate modules.
- Fixed the Nibbles game launch/runtime issue.

## Roadmap
The architecture is intentionally split into small files so standalone playable HTML games, persistent Files, ZIP extraction, wallpaper packs, additional apps, and more simulation systems can be added without turning Lolite OS into one giant HTML file.

Planned systems include a richer wallpaper library, real app installation workflow, more standalone games, improved window management, notifications/calendar, and a more capable AI-first browser.

## Copyright note
Game titles that reference existing franchises are catalog entries for original implementations or generic mechanics; copyrighted assets/code are not bundled.
