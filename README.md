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
- Custom Scramjet browser interface
- World Sandbox
- Reduce Motion and performance-oriented UI
- Version compatibility warning
- Settings update log

## Lolite AI
Lolite AI uses a server-side API route so the API key is never placed in browser code. Configure `OPENAI_API_KEY` as a server/Vercel environment variable. The implementation uses the OpenAI Responses API and the current server-side JavaScript pattern. citeturn1search0

## Utility installation
Utilities are optional. The Utility Store keeps installation state in browser storage. Installing a utility adds it to the desktop; uninstalling removes it from the desktop.

## Game Store
The Game Store accepts standalone `.html` and `.htm` games and checks the repository game folder for duplicates. The current original HTML pack includes 2048, Pong and Sokoban.

## Copyright
Copyright © 2026 Darby9 / Lolite OS. Original Lolite OS code, UI, branding and original game implementations are protected by applicable copyright law unless a file states another license.

Third-party projects and trademarks remain the property of their respective owners and are used according to their applicable licenses.

## Update Log

### 2.0 — Biggest Update — 2026-09-12
- Added PC/mobile setup immediately after startup.
- Added responsive phone-style mobile layout.
- Added optional Utility Store with persistent installation state.
- Added real Lolite AI interface and server-side `/api/ai`.
- Added OpenAI Responses API integration with server-side key handling. citeturn1search0
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
