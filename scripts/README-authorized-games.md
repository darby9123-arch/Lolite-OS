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
