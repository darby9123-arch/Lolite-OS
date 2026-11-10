# Lolite OS 4.1 — Desktop polish, Games, Widgets, Music and Lite Mode

This is an additive update to the existing Lolite OS web desktop. Game data, local files, accounts, wallpapers, game links and desktop themes are not migrated or overwritten.

## 1. Icon alignment
- Applies consistent horizontal alignment to desktop app icons and labels, including Cosmos PNG icons.
- Centres taskbar icons within their tiles and avoids reintroducing glossy backgrounds on transparent PNGs.

## 2. Game Store reliability
- Existing same-origin game checks still start with a low-bandwidth HEAD request.
- If HEAD returns **405 Method Not Allowed** or **501 Not Implemented**, the checker retries with a GET Range request for just one byte, then cancels the response body. A server that ignores Range may still send more data before cancellation.
- Only genuine 404 or 410 responses count as missing. Offline, CORS, timeout, and 403 status remain unknown.
- Freshness for cached checks is five minutes. Previously marked missing links expire for retry after ten minutes.
- Checking an entry URL does **not** guarantee that its JavaScript, images or music assets load successfully.

## 6. Widgets 2.0
- Drag the lower-right grip to resize any desktop widget. Dimensions are kept per widget in the existing local widget layout record, with safe size bounds.
- The existing widget types and saved notes continue to work. Saved layouts from earlier releases open at their original sizes.
- Add **Now playing** from the widget picker. It shows the current song and controls the shared Lolite Music player. Audio is not duplicated.

## 7. Music 2.0
- Adds **Favourites** for approved tracks, stored locally per signed-in account (not yet synced between devices).
- Adds Shuffle and three Repeat modes (off / all / one), including correct end-of-queue handling.
- Music broadcasts play and pause state for widget integration.
- Existing admin approvals, private song uploads, playlists, and song requests use the same database tables and permission rules. This release adds no public music downloads or unlicensed catalogue.

## 9. Game Store 3.0
- Game cards offer an **Info** button to open a game detail panel with artwork, source, category, known source health and number of servers.
- Sort All Games, search results, My Library, and Favorites by A–Z, Z–A, most servers, or known 30-day launch counts.
- Existing server selection, purchases, favorites, recent activity and game opening remain wired to the same functions.
- The Info panel does not claim live availability for external game servers.

## 10. Lite Mode
- Use the lightning button in the taskbar tray to toggle Lite Mode on and off.
- Lite Mode is optional and persisted on the current device. It removes costly shell animations and backdrop blurs and pauses live wallpaper rendering.
- It does not change game code, browser access controls, audio playback or account data. This is not a promise of a measured FPS increase.

## Verification
- `tests/lolite-4-1.test.cjs` covers game health fallbacks, caching, offline uncertainty, widgets, music, store wiring, Lite Mode and page script loading.
- The existing Lolite 4.0 workflow now checks the syntax of the updated scripts and runs the new tests alongside existing regression tests.
- Browser interactions and production host freshness must still be checked after the branch lands and deploys.
