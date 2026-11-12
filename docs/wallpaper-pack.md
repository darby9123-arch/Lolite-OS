# Original live wallpaper pack

The November 2026 pack contains 103 user-provided MP4s (2,642,179,179 bytes). The original videos are published as assets of the `wallpapers-20261113` release, alongside 103 JPEG thumbnails, a manifest and SHA-256 checksums. They are not stored in Git history or included in every Vercel build.

Lolite plays the MP4s directly through its normal wallpaper player. They appear in **All**, **Special Live Wallpapers** and their subject categories. LivelyWallpaper.app and MotionBGS entries remain in **Embedded Wallpapers**. Favourites, Random sorting, playback quality and motion preferences work with the pack.

Release: https://github.com/darby9123-arch/Lolite-OS/releases/tag/wallpapers-20261113

To regenerate the bundled catalog from a downloaded release manifest:

```sh
python3 scripts/wallpaper-pack/build-catalog.py /path/to/manifest.json
node --test tests/wallpaper-pack.test.cjs tests/wallpaper-favourites.test.cjs
```

The importer verified each original byte count, SHA-256 digest and video metadata with ffprobe, then extracted a thumbnail with ffmpeg. Release uploads were checked against the original byte counts. The temporary authenticated source handoff was retired after publication. No private Drive download links are part of the application.

Keep this media release separate from desktop app releases and do not mark it as the latest application release.
