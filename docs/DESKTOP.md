# Lolite OS for Windows

The `desktop/` project packages the existing Lolite OS files into Electron. It does not load GitHub Pages and does not run the proxy server. The web deployment remains independent.

## Install and use

Download **LoliteOS-Setup.exe** from the official [Lolite OS releases](https://github.com/darby9123-arch/Lolite-OS/releases). Choose an installation directory and finish Setup. Open **Lolite Launcher** to check releases, download updates, view notes, repair the installation, or launch the desktop. **Lolite OS** is also available as a direct shortcut. Windows 10/11 x64 is the supported target.

The installation contains real **Lolite OS.exe** and **Lolite Launcher.exe** executables, Chromium/Electron runtime files, and bundled application resources. Neither executable is a portable single-file app: keep the installed files together. The two entry points share the same runtime and single main process. Opening both does not create duplicate desktops or competing data profiles.

F11 toggles fullscreen; Escape exits native fullscreen. Normal window placement is remembered and checked against attached monitors. Hardware acceleration uses Electron's defaults. Closing every Lolite window exits the process; there is no tray daemon or startup service.

## Data and native files

All personal state lives in `%APPDATA%\Lolite OS`, outside the installation folder:

- `profile/`: Chromium IndexedDB, local storage, caches, installed app state and virtual Lolite files.
- `launcher.json`: settings, window positions, update history and recovery state.
- `launcher.log`: bounded diagnostic log, rotated at 2 MB.
- `updates/`: partial downloads and verified installers, including a recovery copy when available.

**Open from PC** uses a native Windows picker and imports a copy into the current Lolite folder. **Browse PC folder** grants read access only to a selected folder for the current desktop session; folder tokens expire when the desktop closes. Paths, parent traversal, Windows alternate data streams and symlink escapes are checked in the main process. Save/export operations use a native Save dialog. Drag-and-drop file importing remains supported by the existing Explorer. Native bridge transfers have a 256 MB file/batch limit; the existing file-input and drag/drop paths handle larger browser File objects subject to storage capacity. Neither mechanism exposes unrestricted native paths to web content.

The website and installed app have separate browser profiles. To migrate, export a ZIP from the website's File Explorer and import/extract it in the desktop app. Browser settings and login sessions do not automatically migrate. Updates preserve the desktop profile and do not delete projects, wallpapers, or settings. The uninstaller preserves data by default and offers a separate, default-No deletion prompt during interactive uninstall. Silent uninstall and upgrade always preserve data.

## Build locally

Use Windows 10/11 x64 and Node.js 24:

```powershell
cd desktop
npm ci
npm test
npm run build:win
```

Outputs:

| File | Purpose |
| --- | --- |
| `desktop/dist/LoliteOS-Setup.exe` | Windows NSIS installer |
| `desktop/dist/win-unpacked/Lolite OS.exe` | Main application, with adjacent runtime/resources |
| `desktop/dist/win-unpacked/Lolite Launcher.exe` | Dedicated launcher entry point, with the same runtime/resources |
| `desktop/dist/lolite-desktop.json` | Version, channel, exact installer size and SHA-512 |
| `desktop/dist/SHA512SUMS` | Human-readable installer checksum |

`npm start` opens the launcher in development; `npm run start:os` opens the desktop. `npm run pack:win` prepares an unpacked Windows app. Windows is the supported build environment; cross-building NSIS on Linux additionally requires Wine. Do not rename the two entry executables: their names select the requested initial window.

`scripts/prepare.mjs` copies the original web app and games into a generated folder, substitutes pinned local libraries, bundles the font, and renders the existing official SVG into a PNG/Windows ICO. Generated files are ignored by Git. The main app remains the existing app, including its desktop, taskbar, device selection, windows, settings, apps, cursors and games. The desktop adapter adds native integration without replacing those components.

## Releases and updates

The `Build and release Lolite Desktop` workflow builds on Windows, runs security/updater tests, then installs and launches both actual Windows executables. Before publication, that packaged runtime must also download and verify an existing public desktop installer through Chromium networking; it does not execute that older installer. This gate requires an existing official desktop release. It installs again to verify IndexedDB survives an upgrade and checks that silent uninstall preserves data. Screenshots and health reports are included with the workflow artifact. The reinstall test deliberately removes the application archive and verifies that Setup restores it while preserving IndexedDB.

Pull requests build test artifacts. A successful build on `main` publishes a new Windows release for changed application sources. If the requested package version is already released, the workflow selects the next patch version (or next beta prerelease), updates the build copy of the package/lockfile, and packages that version. Rebuilding an already published source commit does not replace its release. A `desktop-v*` tag must still match the explicit package version. To request a specific version:

1. Increment `desktop/package.json` using semantic versioning and update its lockfile. Use `3.16.0-beta.1` for a beta or `3.16.0` for stable.
2. Update `desktop/RELEASE-NOTES.md` with the actual changes.
3. Merge to `main` (or push a matching `desktop-v3.16.0` tag).
4. Wait for the complete Windows job and release job. The installer, metadata and checksum file must all be present.

Existing releases are never overwritten automatically. Application changes, including core files and the README, trigger the Windows workflow. Each newly published binary has a distinct version; `lolite-desktop.json` also records the exact source commit. The release job uses the built manifest version, which can be newer than the version in the source checkout. Do not publish the source ZIP as the desktop download. The GitHub App/Actions integration needs permission to modify workflows; the release job needs `contents: write`. The workflow uses the repository's short-lived `GITHUB_TOKEN`, not an embedded personal token. Public clients query published releases without credentials.

The launcher only accepts release metadata from `darby9123-arch/Lolite-OS`. It validates the exact `desktop-vVERSION` tag, stable/beta flag, architecture, asset name, size and hash. Redirects are restricted to GitHub's HTTPS release delivery hosts. It downloads to app data, verifies the complete SHA-512 before installation, and verifies again immediately before execution. Failed verification deletes the partial installer. Partial downloads resume with validated HTTP Range responses; servers that return a full response safely restart the download.

The desktop and launcher both check on startup when enabled. Opening Updates from the desktop requests a fresh check; manual Check for updates always queries the official feed. The launcher displays the last successful check time and never treats a failed or incomplete release response as “up to date.” The installed app uses an isolated Chromium network session to respect Windows proxy settings and bypass cached responses.

**Reinstall latest files** is available even when versions match. It checks the official feed again, discards cached installer/partial bytes for the target, downloads the complete package, verifies it, then offers **Reinstall files**. It refuses a downgrade. This refresh installs the latest **published Windows release**, not executable files from a raw source branch. New source changes become available when the Windows build and tests finish.

**GitHub README** displays the current repository README with a Refresh button and safe Markdown rendering. It saves the last fetched copy as `readme-cache.json` in application data and includes a bundled copy for first-run offline use. External links still ask before opening.

Auto-download is optional and disabled initially. Installation is explicit and can be postponed. A running desktop must close before installing. The installer waits for both entry processes to exit and never force-kills them. Windows Setup displays the real extraction/install progress after the launcher hands off. Update checks may be rate limited by GitHub; the launcher reports that and allows retries.

Repair hashes installed program files against the build-generated manifest. If files are damaged, it fetches the matching version's verified installer. The profile is never included in repair. If the integrity manifest is missing, use **Reinstall latest files**. If neither executable can start, rerun the official installer manually.

Before a version change, the updater attempts to cache the current version's official installer. If the new desktop crashes or fails its 30-second readiness check before it has been marked healthy, the launcher can automatically run that verified previous installer. Recovery requires the previous release to remain published or cached and the new launcher/runtime to start. This is not a guarantee against power loss, a broken Electron main process, operating-system failure, or a crash after the new version has already been confirmed healthy. It never rolls back or deletes user data.

## Offline behavior

The application loads from `lolite://app/index.html` inside the package. It bundles the essential HTML, CSS, JavaScript, official logo, font, built-in games and file-viewer libraries (PDF, spreadsheets, images, archives, Markdown/code, 3D models). Core desktop operation does not depend on GitHub Pages or a running web server.

Third-party HTML games in the existing repository may still fetch their own remote assets; those are not falsely advertised as offline games. Chat, external websites, online game servers, remote artwork, and first-time AI model downloads need a network connection. The app displays an offline notice and a message for online-only frames. Existing codec and external website embedding restrictions still apply. The desktop app does not enable or expose the proxy backend.

## Security and signing

Renderers use `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, web security, and disabled webviews. Every IPC handler validates the exact top-level page and role. Launcher controls are not available to the desktop renderer. Native file commands are not available to the launcher, game frames, uploaded HTML, or external websites. Main-frame scripts are bundled locally; CSP rejects remote executable scripts. Packaged games use a separate origin, while uploaded HTML stays sandboxed without same-origin access. External links ask before opening in the user's default application. Device and website permissions are denied unless explicitly supported.

The default configuration does **not** pretend to have a Windows signing certificate. Unsigned releases have HTTPS/repository trust and SHA-512 integrity checks; those checks are not an independent publisher signature and do not protect against compromise of the repository. Windows may display an unknown-publisher/SmartScreen prompt until valid signing is configured.

To enable Authenticode signing:

1. Obtain a valid Windows code-signing certificate through your chosen provider. Do not commit certificates, passwords, or private keys.
2. Configure Actions secrets `WINDOWS_CSC_LINK` and `WINDOWS_CSC_KEY_PASSWORD` (electron-builder's supported PFX/base64 or certificate download configuration). A hardware-backed service may require a custom signing hook instead.
3. Set `publisher` in `desktop/signing.json` to the certificate's **exact subject distinguished name**. Check it with `Get-AuthenticodeSignature` on a signed executable.
4. Build and verify the installer on Windows. When `publisher` is configured, builds require code signing and the launcher requires a valid Authenticode signature matching that subject before executing future updates.

The launcher executable is copied from the main executable after signing so both retain the original Authenticode signature. Do not edit executable resources afterward. Certificate rotation requires an intentional migration release. Protect repository write access, release assets and Actions secrets, and update Electron regularly.

## Verification and diagnostics

`npm test` exercises manifest/source validation, fresh same-version reinstalls, failed-feed invalidation, channel/downgrade rules, download corruption, Range resume, redirect restrictions, README offline fallback, release-version allocation, native path boundaries, settings persistence and repair. After publication, the separate verification workflow uses the live public feed to download and install the release, checks GitHub through the installed launcher’s Chromium network client, downloads the same version again, deletes the installed app archive, reinstalls it, and verifies that IndexedDB and personal files survived. `scripts/smoke-windows.ps1` runs the real installer lifecycle on a Windows runner. Logs are available through **Settings → Open application data**. A repository build or a generated EXE alone is not proof of Windows runtime correctness: check the Windows smoke-test reports before distribution.

Upstream references: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security), [Electron custom protocols](https://www.electronjs.org/docs/latest/api/protocol), [electron-builder NSIS](https://www.electron.build/nsis.html).
