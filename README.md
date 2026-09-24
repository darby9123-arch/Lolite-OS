## [Launch Lolite OS](https://darby9123-arch.github.io/Lolite-OS/)

**Open Lolite OS online:** https://darby9123-arch.github.io/Lolite-OS/

# Lolite OS

A Lolite-branded browser desktop with a dark purple/blue interface, apps, games, files, wallpapers, AI and responsive PC/mobile layouts.

## Update Log

### 3.2.3 — Fullscreen System — 2026-09-24
- Added a real Lolite OS fullscreen toggle using the browser Fullscreen API.
- Added a dedicated Fullscreen button to the taskbar.
- The taskbar button now changes state when Lolite enters or exits fullscreen.
- Added fullscreen error handling and a browser-availability check.
- Game/app fullscreen requests can now use the same browser-controlled fullscreen system where supported.
- Checked the `html games/` folder for identical duplicate files; no identical duplicate groups were found.

### 3.2.2 — Store Controls & Selection Fix — 2026-09-24
- Fixed App Store category/filter buttons so every tab reliably responds to clicks.
- Added persistent selected states to App Store filters with accessible pressed-state feedback.
- Fixed Game Store category navigation so selected categories are tracked directly instead of relying on button text.
- Added more reliable active-state updates when switching Game Store categories.
- Kept the existing game catalogue intact.
- Checked the `html games/` folder for identical duplicate files; no identical duplicate groups were found.

### 3.2.1 — UI Redesign — 2026-09-24
- Redesigned the Lolite desktop with a cleaner Windows-inspired visual hierarchy.
- Refined windows, title bars, controls, cards, inputs, buttons and panels with consistent spacing and borders.
- Reworked the taskbar into a cleaner centered layout with stronger active states.
- Refined desktop icons and the wallpaper backdrop for a cleaner desktop.
- Redesigned the Start and Search panels.
- Refined the App Store with a cleaner header, search bar, category tabs, metadata and app cards.
- Improved mobile spacing and touch-friendly controls.
- Added clearer keyboard focus states and more consistent interactive feedback.
- Kept Liquid Glass disabled by default; the normal interface now uses crisp surfaces rather than unnecessary blur.
- Checked the `html games/` folder for identical duplicate files; no identical duplicate groups were found.

### 3.2.0 — App Store 2.0 — 2026-09-24
- Reworked the App Store with **All, Featured, Installed and category filters**.
- Added app search across names and descriptions.
- Added app categories and version badges to every store card.
- Improved the installed-app library so installed apps can be opened or uninstalled directly from the store.
- Added clearer empty-search states and a more organised storefront layout.
- Kept app installation local and preserved the existing desktop-shortcut system.
- Checked the `html games/` folder for identical duplicate files; no identical duplicate groups were found.

### 3.1.0 — Desktop Polish — 2026-09-24
- Added working window **minimise** and **maximise** controls.
- Added double-click titlebar maximise/restore behaviour.
- Added edge snapping: drag windows to the left/right edge for split layouts and to the top edge for maximise.
- Improved taskbar window buttons with active-window highlighting.
- Added **Alt + Tab** window switching and **Esc** shortcuts for closing transient panels.
- Added a faster global Search panel for Lolite apps and system entry points.
- Improved small-screen window sizing so apps stay inside the viewport.
- Added a clickable clock area that shows the full current date.
- Updated the version checker to **3.1.0**.
- Checked the `html games/` folder for identical duplicate files; no identical duplicate groups were found.

### 3.0.9 — AI Repair & App Icon Polish — 2026-09-14
- Fixed the server-side OpenAI Responses API handler with safer response parsing and clearer HTTP/API error reporting.
- Added support for `OPENAI_MODEL` while keeping `gpt-5.6-luna` as the default model.
- Renamed the user-facing assistant from **Low Light AI** to **Lolite AI** while preserving the existing app ID so installed apps do not break.
- Improved Lolite AI so server errors are shown directly instead of the generic disconnected message.
- Replaced emoji-based installed-app desktop icons with consistent Lolite CSS icons that match the built-in icon system.
- Added dedicated icons for Lolite AI and Wallpaper Editor.
- Redesigned the **App Store** desktop icon so it matches the same size, shape, border and visual language as the other Lolite icons.
- Updated the App Store cards to use the same icon system as desktop shortcuts.

### 3.0.8 — Creative Studio & Settings Overhaul — 2026-09-14
- Fixed Settings controls by replacing the broken wallpaper re-open flow with reliable persistent controls.
- Added **Cursor** settings with Default, Pointer, Crosshair and Hidden options.
- Added persistent **Accent Colour** settings and a system reset option.
- Added stronger Reduce Motion persistence and Liquid Glass state handling.
- Added **Wallpaper Editor** to the App Store; it must be installed before use and then adds a desktop shortcut.
- Added Wallpaper Editor tools for draw, glow, text, multiple fonts, shapes, gradients, colour, sizing, undo and custom wallpaper export.
- Enhanced **Lolite Paint** with Pen, Marker, Highlighter, Eraser, Line, Box, Circle, brush size and colour controls.
- Added **Save as Wallpaper** alongside Save as PDF and PNG.
- Reworked Liquid Glass toward a more liquid/refractive appearance using SVG displacement, specular-style highlights and reduced blur instead of a simple frosted-glass effect.

### 3.0.7 — Lolite OS Apps, AI & Browser Refresh — 2026-09-14
- Added a first-run **Welcome to Lolite OS** screen with **What's New** and **Best Features** sections.
- Added a polished **Lolite Browser** shell with address/search navigation and browser-style controls.
- Added a new **App Store** with installable apps including Lolite AI, Lolite Browser, Quick Notes, Calculator and Lolite Paint.
- Apps must be installed before use and installed apps receive desktop shortcuts.
- Added a new **Lolite AI** app connected to the existing secure server-side OpenAI Responses API endpoint.
- Kept the OpenAI API key server-side through `OPENAI_API_KEY`; no API key is placed in the browser code.
- Expanded the Game Store with **Popular Games** and **IO Games** sections.
- Removed the visible **HTML game** label from game cards while keeping all actual game files intact.
- Added cleaner game-store navigation and category coverage across the full collection.

### 3.0.6 — Game Store Polish & Play Fixes — 2026-09-14
- Added cleaner spacing to **all game names**, including camel-case and numbered titles such as FNAF 2 and Angry Birds 2.
- Reworked the Game Store so the **Featured** page shows every major category, not only Baldi’s Basics.
- Added clearer **Baldi’s Basics, Horror, Racing, Puzzle, Arcade and IO & Casual** collections.
- Reworked the storefront with a more polished dark theme, better cards, hover states, search styling, spacing and navigation.
- Removed the harsh white browser-style scrolling look from Lolite windows and replaced it with subtle dark scrollbars that match the UI.
- Refined the taskbar with a more Windows-like layout, stronger separation, better task buttons, improved tray styling and responsive mobile behaviour.
- Fixed the game launcher path handling so filenames with spaces and special characters are encoded correctly.
- Improved **Play** buttons with a real in-window game player, larger game windows and an **Open separately** fallback for games that need their own tab.
- Kept every existing game file in `html games/` intact.

### 3.0.5 — New Steam-Inspired Game Store — 2026-09-14
- Replaced the old Games entry point with a polished **Lolite Game Store** interface inspired by modern PC game storefronts.
- Added a dark storefront layout with sidebar navigation, search, featured content, game cards and category sections.
- Added **Baldi’s Basics**, Horror, Racing, Puzzle, Arcade and IO & Casual categories.
- Added a dedicated **Baldi’s Basics** collection that automatically groups matching games from `html games/`.
- Added automatic discovery of HTML games directly from the repository's `html games/` folder.
- Added playable game cards that launch the actual local HTML files in Lolite windows.
- Renamed the desktop Games icon to **Game Store** and updated the Start menu entry.
- Kept all existing game files and folders in the repository; the store only provides a new way to browse and launch them.

### 3.0.4 — Embedded Game Center — 2026-09-14
- Replaced the broken/fake game-window launch path with a real embedded HTML game player.
- Added automatic discovery of the actual `.html` game files in `html games/` through the GitHub repository contents API.
- Made **Play** open a real Lolite window containing the selected game's actual HTML file in an iframe.
- Added iframe permissions for fullscreen, gamepad, autoplay and pointer lock where supported.
- Added **Open separately** for games that need their own browser tab.
- Improved game titles so internal IDs are no longer shown as the playable game name.
- Kept Game Center search and refresh functionality.
- Kept `html games/` as the source of truth for the playable collection.

### 3.0.3 — Stability & Uploaded Game Launcher Fixes — 2026-09-14
- Added V3.0.3 stability hardening.
- Reworked uploaded HTML/HTM game launching to use the actual files in `html games/`.
- Fixed internal game IDs such as `v29-game-clangrybirds2-html` from being displayed as the game itself.
- Added safer filename handling for spaces and special characters.
- Improved game window sizing and fullscreen handling.
- Kept `html games/` as the source of truth for local games.

### 3.0.2 — Game Launcher Repair — 2026-09-14
- Repaired V3 local HTML/HTM game launching.
- Fixed local `html games` paths and filename encoding.
- Improved game windows and fullscreen handling.
- Added recently played tracking for launched games.
- Kept ZIP game-pack support.

### 3.0.1 — App & Settings Stability — 2026-09-14
- Added app installation controls to the V3 App Store.
- Added Install, Open and Uninstall states for optional utilities.
- Added V3 Settings controls for Liquid Glass, Reduce Motion, wallpapers and appearance reset.
- Added responsive App Store and Settings layouts.
- Added a V3 stability layer for controls.

### 3.0 — Lolite OS: Reborn — 2026-09-13
- Added the versioned `core/v3.0.js` platform/game-library layer.
- Reworked desktop entry points around App Store, Game Store and Settings.
- Added redesigned Game Store browsing with search, categories, favourites, recently played and Series & Collections.
- Added Puzzle & Classic, Sports, Racing, IO Games, Strategy and Arcade sections.
- Added a 70-game V3 HTML catalogue using remote playable entries instead of copying large game binaries into Lolite-OS.
- Added fullscreen HTML game player windows and a new V3 visual layer.
- Kept local HTML/HTM and ZIP game support.
- Updated the version checker to 3.0.

### 2.9 — Game Library ZIP Packs — 2026-09-13
- Added the versioned `core/v2.9.js` Game Library layer.
- Added `.zip` game-pack discovery alongside `.html` and `.htm` games.
- Added browser-side ZIP extraction with JSZip.
- Added HTML/HTM detection, multi-game ZIP pickers and basic extracted-asset URL rewriting.
- Kept standalone HTML/HTM launching and added ZIP labels/icons.

### 2.8 — Widgets & Quick Settings — 2026-09-13
- Added the versioned `core/v2.8.js` Widgets and Quick Settings layer.
- Added Clock, Calendar, Weather placeholder, Battery, Storage, Network, Quick Notes, Recently Played, Favourite Apps and World Sandbox widgets.
- Added live browser-local information where supported.
- Added Quick Settings for Liquid Glass, Reduce Motion, Gaming Mode and Do Not Disturb.
- Added persistent Brightness and Volume controls.
- Updated the version checker to 2.8.

### 2.7 — Customisation — 2026-09-13
- Added the versioned `core/v2.7.js` customisation layer.
- Added Dark, Light, Midnight, Aurora, Retro, Minimal, Pixel and AMOLED themes.
- Added accent colours, wallpaper controls, slideshow/random wallpaper, icon/taskbar controls and Desktop Studio.
- Added persistent local customisation settings.

### 2.6 — Utilities Pack — 2026-09-13
- Added the versioned `core/v2.6.js` Utilities Pack layer.
- Added Calculator, Notepad, Paint, Clock, Stopwatch, Timer, Screenshotter, Terminal, System Information, Storage Manager, Network Monitor, Unit Converter, Music Player and Quick Notes.
- Added local persistence for Notepad and Quick Notes.
- Added responsive utility layouts and utility installation support.

### 2.5 — Game Library 2.0 — 2026-09-13
- Added the versioned `core/v2.5.js` Game Library layer.
- Added automatic discovery of standalone `.html` and `.htm` games in `html games/`.
- Added Game Store search, category filtering, favourites, recently played, install state, game metadata and dedicated player windows.
- Added direct launching for individual HTML/HTM games.

### 2.4 — Files & App Store Polish — 2026-09-13
- Added the versioned `core/v2.4.js` Files and App Store polish layer.
- Added Files 2.0 and improved App Store entry points, version badges, responsive cards and controls.
- Improved access to Files and the Game Store from the Start menu.

### 2.3 — Desktop Polish & Window Reliability — 2026-09-13
- Added the versioned `core/v2.3.js` desktop polish layer.
- Improved desktop icon selection, active-window states, window shadows, focus, dragging, taskbar states and workspace reliability.
- Added toast notifications, responsive desktop behaviour, reduced-motion handling and improved window clamping on resize.
