# Lolite OS

A Lolite-branded browser desktop with a dark purple/blue interface, apps, games, files, wallpapers, AI and responsive PC/mobile layouts.

## Update Log

### 2.3 — Desktop Polish & Window Reliability — 2026-09-13
- Added the versioned `core/v2.3.js` desktop polish layer.
- Improved desktop icon selection, active-window states, window shadows, focus, dragging, taskbar states and workspace reliability.
- Added toast notifications, responsive desktop behaviour, reduced-motion handling and improved window clamping on resize.

### 2.4 — Files & App Store Polish — 2026-09-13
- Added the versioned `core/v2.4.js` Files and App Store polish layer.
- Added Files 2.0 and improved App Store entry points, version badges, responsive cards and controls.
- Improved access to Files and the Game Store from the Start menu.

### 2.5 — Game Library 2.0 — 2026-09-13
- Added the versioned `core/v2.5.js` Game Library layer.
- Added automatic discovery of standalone `.html` and `.htm` games in `html games/`.
- Added Game Store search, category filtering, favourites, recently played, install state, game metadata and dedicated player windows.
- Added direct launching for individual HTML/HTM games.

### 2.6 — Utilities Pack — 2026-09-13
- Added the versioned `core/v2.6.js` Utilities Pack layer.
- Added Calculator, Notepad, Paint, Clock, Stopwatch, Timer, Screenshotter, Terminal, System Information, Storage Manager, Network Monitor, Unit Converter, Music Player and Quick Notes.
- Added local persistence for Notepad and Quick Notes.
- Added responsive utility layouts and utility installation support.

### 2.7 — Customisation — 2026-09-13
- Added the versioned `core/v2.7.js` customisation layer.
- Added Dark, Light, Midnight, Aurora, Retro, Minimal, Pixel and AMOLED themes.
- Added accent colours, wallpaper controls, slideshow/random wallpaper, icon/taskbar controls and Desktop Studio.
- Added persistent local customisation settings.

### 2.8 — Widgets & Quick Settings — 2026-09-13
- Added the versioned `core/v2.8.js` Widgets and Quick Settings layer.
- Added Clock, Calendar, Weather placeholder, Battery, Storage, Network, Quick Notes, Recently Played, Favourite Apps and World Sandbox widgets.
- Added live browser-local information where supported.
- Added Quick Settings for Liquid Glass, Reduce Motion, Gaming Mode and Do Not Disturb.
- Added persistent Brightness and Volume controls.
- Updated the version checker to 2.8.

### 2.9 — Game Library ZIP Packs — 2026-09-13
- Added the versioned `core/v2.9.js` Game Library layer.
- Added `.zip` game-pack discovery alongside `.html` and `.htm` games.
- Added browser-side ZIP extraction with JSZip.
- Added HTML/HTM detection, multi-game ZIP pickers and basic extracted-asset URL rewriting.
- Kept standalone HTML/HTM launching and added ZIP labels/icons.

### 3.0 — Lolite OS: Reborn — 2026-09-13
- Added the versioned `core/v3.0.js` platform/game-library layer.
- Reworked desktop entry points around App Store, Game Store and Settings.
- Added redesigned Game Store browsing with search, categories, favourites, recently played and Series & Collections.
- Added Puzzle & Classic, Sports, Racing, IO Games, Strategy and Arcade sections.
- Added a 70-game V3 HTML catalogue using remote playable entries instead of copying large game binaries into Lolite-OS.
- Added fullscreen HTML game player windows and a new V3 visual layer.
- Kept local HTML/HTM and ZIP game support.
- Updated the version checker to 3.0.

### 3.0.1 — App & Settings Stability — 2026-09-14
- Added app installation controls to the V3 App Store.
- Added Install, Open and Uninstall states for optional utilities.
- Added V3 Settings controls for Liquid Glass, Reduce Motion, wallpapers and appearance reset.
- Added responsive App Store and Settings layouts.
- Added a V3 stability layer for controls.

### 3.0.2 — Game Launcher Repair — 2026-09-14
- Repaired V3 local HTML/HTM game launching.
- Fixed local `html games/` paths and filename encoding.
- Improved game windows and fullscreen handling.
- Added recently played tracking for launched games.
- Kept ZIP game-pack support.

### 3.0.3 — Stability & Uploaded Game Launcher Fixes — 2026-09-14
- Added V3.0.3 stability hardening.
- Reworked uploaded HTML/HTM game launching to use the actual files in `html games/`.
- Fixed internal game IDs such as `v29-game-clangrybirds2-html` from being displayed as the game itself.
- Added safer filename handling for spaces and special characters.
- Improved game window sizing and fullscreen handling.
- Kept `html games/` as the source of truth for local games.

### 3.0.4 — Embedded Game Center — 2026-09-14
- Replaced the broken/fake game-window launch path with a real embedded HTML game player.
- Added automatic discovery of the actual `.html` game files in `html games/` through the GitHub repository contents API.
- Made **Play** open a real Lolite window containing the selected game's actual HTML file in an iframe.
- Added iframe permissions for fullscreen, gamepad, autoplay and pointer lock where supported.
- Added **Open separately** for games that need their own browser tab.
- Improved game titles so internal IDs are no longer shown as the playable game name.
- Kept Game Center search and refresh functionality.
- Kept `html games/` as the source of truth for the playable collection.

### 3.0.5 — New Steam-Inspired Game Store — 2026-09-14
- Replaced the old Games entry point with a polished **Lolite Game Store** interface inspired by modern PC game storefronts.
- Added a dark storefront layout with sidebar navigation, search, featured content, game cards and category sections.
- Added **Baldi’s Basics**, Horror, Racing, Puzzle, Arcade and IO & Casual categories.
- Added a dedicated **Baldi’s Basics** collection that automatically groups matching games from `html games/`.
- Added automatic discovery of HTML games directly from the repository's `html games/` folder.
- Added playable game cards that launch the actual local HTML files in Lolite windows.
- Renamed the desktop Games icon to **Game Store** and updated the Start menu entry.
- Kept all existing game files and folders in the repository; the store only provides a new way to browse and launch them.
