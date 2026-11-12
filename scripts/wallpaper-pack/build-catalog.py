"""Build the bundled gallery catalog from the verified media release manifest."""
import json, re, sys
from pathlib import Path

base = 'https://github.com/darby9123-arch/Lolite-OS/releases/download/wallpapers-20261113/'
manifest = json.loads(Path(sys.argv[1]).read_text())
assert manifest['total'] == 103 and len(manifest['catalog']) == 103
assert manifest['bytes'] == 2_642_179_179

def category(slug):
    groups = [
        ('Games', r'cyberpunk|dead-by-daylight|fortnite|geometry-dash|gta-vi|minecraft|mimikyu|playstation|razer-logo|starcraft|steam-logo|spider-man-2|zelda'),
        ('Anime', r'borushiki|gojo|gon-killua|hiyuki|isagi|kakashi|kamijou|killua|konata|miku|obito|satoru|subaru-natsuki|sukuna|tanjiro|yuji|yuta'),
        ('Cars', r'audi|motorcycle|nissan|tesla|retro-ocean-highway'),
        ('Space', r'artemis|black-hole|edge-of-the-universe|orbitfall|space-station'),
        ('Art & Fantasy', r'chrome-tree|fantasy|samurai|sakura-blade|whales'),
        ('Nature', r'river|mountain|autumn|sunset|cave|cloud|summer|forest|cherry-blossoms|sakura-tree|tram|railway|wild-nature|rain-drops|flower|boat|mount-fuji'),
    ]
    return next((name for name, pattern in groups if re.search(pattern, slug)), 'Art & Fantasy')

catalog = []
for entry in manifest['catalog']:
    slug = entry['id'].removeprefix('pack-')
    assert re.fullmatch(r'[a-z0-9-]+', slug)
    assert entry['video'] == base + entry['filename']
    assert entry['poster'] == base + entry['posterFilename']
    assert entry['width'] > 0 and entry['height'] > 0 and entry['duration'] > 0
    assert re.fullmatch(r'[0-9a-f]{64}', entry['sha256'])
    name = entry['name'].replace('Black Hole2', 'Black Hole').replace('Purple Sunset2', 'Purple Sunset').replace('Spider Man', 'Spider-Man').replace('Starcraft', 'StarCraft').replace('Japans ', "Japan’s ").replace('Singularitys ', "Singularity’s ")
    wall = {key: entry[key] for key in ['id', 'video', 'poster', 'width', 'height', 'duration', 'bytes', 'sha256']}
    wall.update(name=name, category=category(slug), categories=['Special Live Wallpapers'],
                provider='Lolite Wallpaper Pack', group='Special Live Wallpapers', embedded=False, src=entry['poster'],
                resolution='4K' if entry['width'] >= 3840 else '1080p', tags=slug.split('-'))
    catalog.append(wall)
catalog.sort(key=lambda wall: wall['name'].casefold())
assert len({wall['id'] for wall in catalog}) == 103
output = Path('core/wallpaper-pack-catalog.js')
output.write_text('/* Original user-provided MP4s, hosted in the Lolite wallpaper release. */\n(()=>{\n\'use strict\';\nwindow.LoliteWallpaperPack=Object.freeze(' + json.dumps({'version': '20261113', 'catalog': catalog}, ensure_ascii=False, separators=(',', ':')) + ');\n})();\n')
print(f'Built {len(catalog)} original wallpapers ({sum(w["bytes"] for w in catalog)} bytes).')
