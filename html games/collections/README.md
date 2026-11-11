# Uploaded game collections

These files were extracted from the ChickenKingsVault and GenizyMath ZIPs supplied for Lolite OS on 11 November 2026. Original game code, dependency paths, assets and embedded credits are preserved. Lolite launches the game documents directly inside its existing isolated game player.

The Game Library includes 874 GenizyMath and 828 Chicken King's Vault versions. Matching titles share a card with selectable servers. UGS remains the default where available. The source sites' wrapper pages are not used as game launch targets, and Mountain Games is not restored.

`import-report.json` records source filenames, archive hashes, file counts and incomplete entries. Chicken King's Vault's Only Up, Bullet Force and Please Dont Touch Anything wrappers refer to game files absent from the supplied archive, so those three versions are not listed. Its Serial Experiments Lain document contains an upstream error message; that version is also omitted, while the GenizyMath copy is available. Eight further files (2048, Among Us, Draw Climber, Fireboy and Watergirl 2 and 3, Henry Stickmin: Breaking the Bank, Soccer Random and Three Goblets) contain only headers without game code and are also omitted. GenizyMath Minecraft 1.8.8 uses the valid 181-f.html copy, and the Dave and Bambi launch file is copied to a .html filename for correct MIME handling. Misspelled links with an identifiable game file in the same ZIP are repaired in the generated catalogue.

Many launch documents load additional resources from external CDNs. Bundling their HTML does not make those games offline or guarantee that their upstream assets will stay available. Original site navigation, browser/proxy apps and duplicate historical fixes are not separate game listings; the original dependency directories remain intact.

Rebuild from the original archives:

```sh
python scripts/bundle-uploaded-game-packs.py --chicken /path/ChickenKingsVault-main.zip --genizy /path/genizymath.github.io-main.zip
node --test tests/uploaded-game-packs.test.cjs
```
