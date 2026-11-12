# LivelyWallpaper.app collection

Updated 11 November 2026. The wallpaper picker now contains the complete
840-entry catalogue from <https://livelywallpaper.app/live-wallpapers/>.
Its previous static, procedural, interactive and known uploaded-file collections
are no longer registered. Saved selections migrate once to Minecraft Aurora
Night Cabin. Existing custom-image data is retained, but its selection resets.
Shared wallpapers created before `2026-11-11T09:14:09Z` are excluded from the
picker; later admin uploads and new custom images still work. No shared storage
objects are deleted.

| Primary category | Wallpapers |
| --- | ---: |
| Games | 195 |
| Anime | 193 |
| Nature | 140 |
| Cars | 130 |
| Art & Fantasy | 100 |
| Space | 82 |

Category filters also match secondary categories, so their displayed counts can
overlap. The source labels 750 wallpapers as 4K; each card displays its actual
published dimensions.

## Playback and browsing

- Original quality is the default and uses the original MP4, up to 4K.
- Balanced uses a separate HD file where verified (240 entries), otherwise the
  original. Performance uses the smaller preview MP4.
- Source failures try the remaining known variants, then keep the poster visible
  and offer Retry video. Looping uses the existing two-video crossfade controller.
- Motion pauses in hidden tabs, Browsing Style, Lite Mode and reduced-motion mode.
- Search covers all entries and their tags. Cards load in batches of 48 with lazy
  image loading. Source links point to each wallpaper's download/details page.
- Colours are sampled from the actual source poster images during catalogue
  generation, so adaptive UI colours work without cross-origin canvas access.

The catalogue is stored in Lolite. Video and poster URLs point directly to
`cdn.livelywallpaper.app`; they require internet and remain dependent on that
provider. No third-party website iframe or site scripts are loaded. These are
source-attributed wallpapers, not original Lolite artwork or an affiliation with
the Lively Wallpaper application developer.

## Verification

- All 840 original video URLs returned HTTP 200 and `video/mp4` on 11 November.
- All 840 poster images downloaded and decoded. Separate HD URLs were checked;
  only the 240 successful MP4 responses were added to the catalogue.
- 61 focused automated checks passed for catalogue completeness, migration,
  filtering, source fallback, playback lifecycle, custom/admin uploads, colours,
  existing sounds and UI integration.
- Browser checks confirmed Minecraft Aurora Night Cabin playing at 3840×2160 and
  1920×1080, and Samurai Girl In The Rain playing at 1280×720 in Performance mode.
  Also checked loop decoder swaps, pause/resume, persisted quality/selection,
  search for the final catalogue entry and expansion from 48 to 96 cards.
- Full suite: 203/205 passed. The two existing `tests/app-icons.test.cjs` failures
  (shortcut icon coverage and the logo URL assertion) are unchanged by this work.

## Catalogue generation

`scripts/build-lively-wallpapers.py` reads the source's public
`https://livelywallpaper.app/data/wallpaper-cards.json`, downloaded 320px cover
images and HEAD-response files for each optional `hd.mp4`. It validates origins
and unique slugs, samples the image palettes, and produces
`core/lively-wallpapers-catalog.js`. Python and Pillow are required only to
regenerate the catalogue, not to run Lolite.

```sh
python scripts/build-lively-wallpapers.py \
  --source-json cards.json \
  --poster-dir posters \
  --hd-headers-dir headers
```

The poster and header directories use `<source-slug>.webp` and
`<source-slug>.txt` filenames respectively. They are build inputs, not shipped
assets. Existing decorative theme artwork remains available to the theme UI;
it is not offered as an old wallpaper selection.

## Favourite wallpapers (12 November 2026)

Open **Settings → Wallpapers** and click the **heart** at the top-right of any wallpaper preview to add it to your favourites, without applying the wallpaper. The **Favourites** category displays your saved wallpapers together; click the heart again to remove one. You can also save the **currently applied wallpaper** from the control above the gallery.

Favourites work for regular and live wallpapers, embedded MotionBGS wallpapers, admin-uploaded wallpapers (including videos uploaded from ZIPs) and a personal custom image saved through **Custom image**. Embedded wallpapers remain excluded from the general **All** category; favouriting one does not change that, but makes it accessible through **Favourites**. Custom images appear in Favourites when explicitly hearted. Unavailable admin wallpapers retain their favourite IDs so they can reappear if restored later.

Favourites are saved in this browser's local storage under `loliteWallpaperFavouritesV1`, separately from wallpaper catalogue versions. They survive normal reloads and catalogue upgrades, but do not automatically sync between browsers or devices. Clearing site storage may delete the favourites list. Existing wallpaper selection, live playback, categories and video quality are unchanged.

Regression tests: `tests/wallpaper-favourites.test.cjs`.
