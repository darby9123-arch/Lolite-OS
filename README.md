# Lolite OS

A Windows-inspired, Lolite-branded web desktop focused on games, creativity and a lightweight UI.

## Current foundation
- Lolite purple/blue desktop
- Startup screen and Lolite logo
- Start menu, taskbar, search and clock
- Draggable app windows
- Minimize / maximize / close controls
- Home dashboard
- World Sandbox live pixel simulation
- Terrain, water flow, forests, deserts, snow, mountains, volcano/lava, people and villages
- Weather states with rain and storms
- AI-first browser/search UI shell
- Game Library catalog
- Persistent Files system
- ZIP extraction and ZIP creation
- Installed game library integration
- Experimental Liquid Glass (OFF by default)
- Reduce Motion option
- Wallpaper switching

## Update Log

### 2026-09-11 — World Sandbox simulation upgrade
- Reworked World Sandbox from simple random painting into a live grid-based simulation.
- Added seeded terrain so each session starts as an actual world.
- Added selectable water, land, forest, desert, snow, mountain, volcano/lava, people and village tools.
- Added live water spreading and terrain changes.
- Added weather cycling between clear, rain and storm.
- Added live simulation status and population display.
- Added clear-world controls and mouse painting across the simulation grid.
- Kept the simulation lightweight so it can run inside the Lolite OS window without needing a backend.

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
The architecture is intentionally split into small files so standalone playable HTML games, persistent Files, ZIP extraction, wallpaper packs, richer World Sandbox simulation, and additional apps can be added without turning Lolite OS into one giant HTML file.

Planned systems include a richer wallpaper library, real app installation workflow, more standalone games, improved window management, notifications/calendar, and a more capable AI-first browser.

## Copyright note
Game titles that reference existing franchises are catalog entries for original implementations or generic mechanics; copyrighted assets/code are not bundled.
