# Adding complete local HTML games to Lolite

Lolite's GenizyMath category already contains **links and titles** from the public GenizyMath catalogue. Those links are not complete game packages. A GitHub repository being public does not mean that every game, image, sound or asset inside it is licensed for redistribution.

To put **actual playable HTML game files** in Lolite (not an external website iframe), use source folders that you created or are permitted to redistribute.

## Import from folders

1. In your own checkout of Lolite, put each permitted game in its own folder under a separate directory, such as `my-games/my-game/index.html`, with its JS, CSS and assets.
2. Create `my-games/games.json` with entries such as:

```json
[
  {
    "title": "My Game",
    "slug": "my-game",
    "entry": "index.html",
    "rightsConfirmed": true,
    "rightsNote": "I own and authored this game."
  }
]
```

3. Preview: `node scripts/import-authorized-games.mjs --source ./my-games --manifest ./my-games/games.json --dry-run`
4. Import: `node scripts/import-authorized-games.mjs --source ./my-games --manifest ./my-games/games.json`
5. Commit the new contents of `html games/authorized/`. The generated `manifest.json` is read by Lolite automatically.

The importer copies the **real game HTML and its assets** into `html games/authorized/<slug>/`. Existing Lolite games with matching titles are replaced by the local package at launch time; new titles are added to the store. A source game whose HTML is merely an iframe to an external website is rejected.

For personal, browser-only installs, the Game Store also accepts a game ZIP or entire game folder. It can replace an existing installed package without losing the previous one if importing the replacement fails. Browser-only packages remain in that device's local storage, while the repository importer makes packages available to all Lolite users.

**Note:** GenizyMath's repository includes third-party works and does not supply a repository-wide redistribution licence. Do not treat a source-site credit or public GitHub URL as permission to republish the games.

## Import a GenizyMath source ZIP privately in the browser

The Lolite Game Store includes **Import GenizyMath ZIP**. It accepts the
`genizymath.github.io-main.zip` source archive from the user. Select the ZIP
from your own computer; Lolite matches the 850 catalogued titles to their
`iframe/*.html` launch documents and stores those HTML documents in IndexedDB.
It does not publish them to this repository.

The original uploaded archive contains 850 selected game HTML documents. Thirteen
of them contain iframe tags and are intentionally skipped (the goal is direct
HTML launches, not a nested website embed); up to 837 games can be installed.
Existing local games are kept rather than duplicated.

Once imported, open **GenizyMath** in the Game Store. For matching titles, **Play**
opens the installed HTML document as a top-level page (use browser Back to
return to Lolite). The import also offers a **Play installed HTML** control.
Because many source documents reference external CDN resources via `<base>` or
external scripts, importing a file does **not** make its entire game offline.
Some games might fail if upstream assets disappear or require their original
origin. Only import third-party HTML whose code and sources you trust.

The archive is not bundled into Lolite, and installing its contents is local to
that browser profile. To put games into the public repository for every user,
verify each game's redistribution rights first and use the authorized importer
above for complete, licensed packages.
