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
- Game Library catalog
- Persistent Files system
- ZIP extraction and ZIP creation
- Installed game library integration
- Experimental Liquid Glass (OFF by default)
- Reduce Motion option
- Wallpaper switching

## Update Log

### 2026-09-11 — World Sandbox high-resolution upgrade
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

### 2026-09-11 — Files & ZIP system
- Added persistent browser-based file storage using IndexedDB.
- Added file uploads and folder creation.
- Added ZIP extraction directly inside Lolite OS.
- Added ZIP creation for stored files.
- Added automatic detection of games containing `index.html`.
- Added installed-game persistence and launching from the Game Library.
- Split the Files functionality into `core/files.js` and integration logic into `core/integration.js`.
- Improved the Files app UI with a dedicated toolbar, file list, status text, and empty state.

### 2026-09-11 — Standalone game expansion
- Added standalone playable HTML games to the repository.
- Expanded the Game Library architecture so games can be launched as separate modules.
- Fixed the Nibbles game launch/runtime issue.

## Roadmap
The architecture is intentionally split into small files so standalone playable HTML games, persistent Files, ZIP extraction, wallpaper packs, additional apps, and more simulation systems can be added without turning Lolite OS into one giant HTML file.

Planned systems include a richer wallpaper library, real app installation workflow, more standalone games, improved window management, notifications/calendar, and a more capable AI-first browser.

## Copyright note
Game titles that reference existing franchises are catalog entries for original implementations or generic mechanics; copyrighted assets/code are not bundled.
