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
- Default Games and HTML/HTM Game Store
- Utility Store with optional installations
- Lolite AI
- Notification Center
- Plugin-ready App Store architecture
- Custom Scramjet browser interface
- World Sandbox
- Reduce Motion and performance-oriented UI
- Version compatibility warning
- Settings update log

## Lolite AI
Lolite AI uses a server-side API route so the API key is never placed in browser code. Configure `OPENAI_API_KEY` as a server/Vercel environment variable. The implementation uses the OpenAI Responses API.

## Utility installation
Utilities are optional. The Utility Store keeps installation state in browser storage. Installing a utility adds it to the desktop; uninstalling removes it from the desktop.

## Game Store
The Game Store accepts standalone `.html` and `.htm` games and checks the repository game folder for duplicates. The current original HTML pack includes 2048, Pong and Sokoban, alongside the existing game collection.

## Versioned core files
New Lolite feature layers now use a version number in the filename, such as `core/v22.js`, so the update layer is easy to identify and track.

## Copyright
Copyright © 2026 Darby9 / Lolite OS. Original Lolite OS code, UI, branding and original game implementations are protected by applicable copyright law unless a file states another license.

Third-party projects and trademarks remain the property of their respective owners and are used according to their applicable licenses.

## Update Log

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
- Added layout presets, icon column/size controls, taskbar position, Liquid Glass and Reduce Motion controls in Edit display.
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
- Added the Scramjet launcher and custom browser presentation.
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
