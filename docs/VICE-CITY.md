# Vice City loading

Both Vice City HTML entries are generated from `core/vice-city-shell.html`, `core/vice-city-loader.js`, `core/vice-city-runtime.js`, and the existing MIT-licensed `html games/gamepademulator.js`. Run `python3 scripts/build-vice-city.py` after changing these sources; `--check` verifies the generated pages.

The runtime is adapted from `game.js` at the game's existing pinned CDN base, `web-ports/vice-city@796678be4ed26a13c1256be98781ca9b90beb981`. Game data and engine binaries still come from that external host. They are not copied into Lolite by this change.

Fixes:

- IndexedDB is optional, with a bounded wait; sandbox storage failures and quota failures do not stop loading.
- The previously installed GamepadEmulator is bundled into both launch pages, preserving its license and avoiding origin-dependent paths.
- GamepadEmulator, IDBFS, and the runtime load in order. Three download workers assemble 36 resource parts.
- The UI reports actual network bytes, cached bytes, completed resource files, and the engine download phase. Failed/stalled requests have bounded retries and an explicit retry button.
- The ready-to-play screen is visible. The runtime catches inaccessible localStorage, rejected keyboard locks, failed engine loads, WebAssembly errors and graphics context loss.
- WebGL is checked before the large transfer. Lolite's game sandbox remains isolated from account storage.

Verification covers 36-part loading with blocked storage, cache-open timeouts, HTTP/HTML errors, bounded retry counts, missing graphics and identical generated pages. The available cloud QA browser has no WebGL, so it verifies the graphics error UI; full gameplay rendering remains unverified here.
