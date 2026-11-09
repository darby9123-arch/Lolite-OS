# Lolite OS 4.0 — Desktop reliability and navigation

Version: **4.0.0 (web)**. The Windows `desktop/packaging` installer has a separate SemVer release number and is never overwritten with an unverified binary.

## 1. Game Library Repair

- `core/game-health.js` checks only repository-hosted HTML entry URLs with HEAD, at up to six concurrent requests.
- Only confirmed **HTTP 404** and **HTTP 410** mark a game missing. Offline, CORS, timeouts and servers that do not support HEAD report `unknown`, not missing.
- Game Store hides a confirmed missing game only when it has no alternative server. The Game Store's **Check game files** button refreshes checks immediately.
- The in-game loader reports a confirmed 404 to the Game Store. A 200 response does not prove every embedded asset works; games can still have broken assets and should show their own recovery messages.
- `tests/lolite-4.test.cjs` covers status classification, non-hosted URLs and scanner integration. `tests/game-launches.test.cjs` covers current Geometry Dash Full fallback and local game manifests.

## 2. Windows release publishing

`.github/workflows/desktop-windows.yml` now compares the published `lolite-desktop.json` and `SHA512SUMS` to the verified Windows build before handling an existing release tag:

- If source commit, version, size, and installer SHA-512 are identical, treat the existing release as successfully published.
- If any differ, fail without overwriting the existing release and request a fresh run with a newer version.
- The Windows runner still has to complete installation, launch, upgrade and uninstall smoke tests before the publishing job executes.

These changes prevent duplicated successful releases from being reported as failures. They do not bypass or replace actual Windows installer verification.

## 3. Hosting Status

Open the desktop context menu and choose **Hosting status**, or press **Ctrl + Space** and search for Hosting Status.

- Checks GitHub Pages, Vercel, Vercel Play, Railway and Railway Mirror.
- GitHub Pages stamps its deployment artifact with `core/lolite-build.json` containing the **actual GitHub Actions SHA**.
- Node/Vercel/Railway expose public, cache-free `/healthz` build metadata, including the Git commit when the provider supplies it.
- Compares each available SHA against the latest public GitHub `main` SHA. The interface distinguishes **Current**, **Behind**, **Online but commit unknown**, and **Could not verify**.
- A blocked request cannot be called offline. The status panel displays the limitation rather than making up uptime statistics.

This panel checks versions; it does not secretly deploy new builds. Deploying each provider from `main` is still the release operation.

## 4. Taskbar

- Right-click running or pinned apps to **Pin / Unpin**, **Open** or **Close**.
- Taskbar pins are stored in `loliteTaskbarPinsV2` and remain across visits.
- Hover or keyboard-focus a taskbar app for a lightweight **live window-state preview** with its title, state, size, and controls; these are deliberately not fake screenshots of the window contents.
- Notification badge API: `window.LoliteTaskbar4.badge('chatroom',3)` or `window.dispatchEvent(new CustomEvent('lolite:notificationcount',{detail:{appId:'chatroom',count:3}}))`. No fabricated notification counts.

## 5. Window Management

- Existing edge snapping and the seven snap layouts are preserved.
- Drag a window to the top, sides or four screen corners to snap it. The preview shows the destination.
- **Ctrl + Alt + Left / Right**: half-screen snap.
- **Ctrl + Alt + Up**: maximize.
- **Ctrl + Alt + Down**: minimize.
- **Ctrl + Alt + Shift + Arrow**: snap to a corner. Left is top-left; Right is top-right; Down is bottom-left; Up is bottom-right.
- Saved normal rectangles and snap positions are stored locally under `loliteWindowLayoutsV4`. Each app restores its geometry when reopened, fitted safely to the current screen size. No window content is stored in layout preferences.

### Virtual desktops

- Lolite now has **three independent desktops**. The Windows-style taskbar's **Desk 1 / Desk 2 / Desk 3** button cycles between them.
- Press **Ctrl + Alt + 1 / 2 / 3** to jump to a specific desktop. The selected desktop persists in localStorage under `loliteCurrentDesktopV4`.
- Apps remain open when switching desktops; off-desktop windows and their taskbar buttons are hidden, not closed.
- When an existing app is launched from another desktop, it moves to the active desktop and is restored there.

## 6. Spotlight Search

Press **Ctrl + Space** or click Search on the taskbar. Search across:

- Installed apps and tools;
- Game Store games (locked games open the store rather than bypassing purchase controls);
- File names in the local IndexedDB file system (no file contents are uploaded);
- Settings actions, including Wallpaper Settings, Hosting Status and Check Game Files.

Use **↑ / ↓** to navigate, **Enter** to open and **Esc** to close. Spotlight does not search browser history or read personal messages.

## Tests

`Verify Lolite OS 4.0` runs syntax checks and the core Windows-shell, game launcher, popularity, tab-cloaking and new 4.0 tests. The feature code remains in the actual GitHub repository and loads from `index.html`; it is not a standalone demo.

## What remains

Full physical Windows installer release verification is separate from CI source tests, and host freshness depends on each provider successfully deploying the latest commit. The in-app Hosting Status panel helps identify stale hosts. Rich app thumbnails, multi-workspace desktop sessions, notification producers and embedded game asset diagnostics can be added incrementally.
