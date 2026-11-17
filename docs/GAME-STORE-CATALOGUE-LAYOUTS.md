# Game Store catalogue, artwork, genres and layouts

This update keeps Lolite's existing game launchers and server selection intact while improving browsing across the hosted UGS catalogue and the broader Game Store.

## Browsing layouts
Choose a view in the Game Store toolbar:
- **Gallery** — full game cover cards with Play, server, Info and feedback actions.
- **Compact** — denser tiles to browse more games at once.
- **List** — one game per row with a thumbnail, its readable title, category and launch controls.

The layout persists per browser through `loliteGameLayoutV2`. App-window responsive rules adapt list rows and buttons to Lolite's resizable desktop windows; they do not rely only on the outer browser viewport. The saved selection changes appearance, never game IDs, availability or launch URLs.

## UGS titles
The hosted UGS catalogue comes from `core/ugs-catalog.js` and `core/ugs-hosted-catalog.js`.
`core/ugs-presentation.js` repairs compressed names with:
- Explicit corrections for known series and special spellings.
- A deliberately constrained gaming-word splitter (it never splits an unknown proper noun unless it can produce a complete, recognised sequence).
- Capitalisation, word separators, preserved numeric sequels and common acronyms.
- Unmodified original filenames and titles available in search.

Legitimate one-word brand names remain one word. Ambiguous or incomplete original filenames may still need manual title overrides in `names` within `core/ugs-presentation.js`.

## Genre and game-type filters
In the **UGS** collection, choose **Genre** (including Sports, Strategy, Puzzle, Platformers, Racing and others) and **Game Type** (HTML5 or Flash). The filter menus display catalogue counts and support **Clear filters**.

Game genre is derived from the cleaned title *and* the original filename, so compressed UGS filenames are still classified. The primary category is shown on the game card, in compact tiles, and in list rows. Genre inference is best-effort and can be refined with additional matches or explicit exceptions.

## Game pictures
The Game Store first tries verified game artwork already configured for that game. For hosted UGS games, visible cards can then inspect the first 64 KB of the **same-origin game HTML** for images explicitly declared by the game itself: Open Graph/Twitter images, favicons, apple-touch icons, posters and named logo/cover/splash thumbnails.

Image candidates are cached; a failed URL can be followed by the next candidate instead of immediately giving up. Only a small number of metadata scans run concurrently. Rendering uses an original, game-category illustration when no usable real artwork is provided. Those illustrations **are not game screenshots or official cover art**. Every game has a visual fallback; this does not imply every UGS game provides an actual thumbnail.

No game HTML or server URL was changed, and no silent game-launch capture or image scraping from unrelated games was added.

## Testing
- `tests/ugs-presentation.test.cjs` checks game names, genre classification, fallback poster generation and multiple artwork candidates.
- `tests/game-store-search.test.cjs` checks persistent Gallery/Compact/List modes, real UGS category/type filtering, sorting, search and reset behaviour.
- `.github/workflows/verify-game-launches.yml` runs these as part of the game-launcher suite.

Manual browser spot-checks remain valuable for very unusual game names and external image hosts, since the original game asset links can change.
