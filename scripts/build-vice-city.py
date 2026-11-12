#!/usr/bin/env python3
"""Keep both Vice City entries self-contained inside the opaque game sandbox."""
import argparse
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
sources = [
    ('vc-gamepad', 'html games/gamepademulator.js'),
    ('vc-runtime', 'core/vice-city-runtime.js'),
    (None, 'core/vice-city-loader.js'),
]
parts = []
for identifier, filename in sources:
    source = (root / filename).read_text()
    if '</script' in source.lower():
        raise ValueError(f'{filename} contains an unescaped script terminator')
    attributes = f' type="text/plain" id="{identifier}"' if identifier else ''
    parts.append(f'<script{attributes}>\n{source}\n</script>')
page = (root / 'core/vice-city-shell.html').read_text().replace('<!-- LOLITE_VICE_BUNDLES -->', '\n'.join(parts))
for filename in ['html games/Grand Theft Auto Vice City.html',
                 'html games/collections/chicken-kings-vault/gamefiles/Grand Theft Auto Vice City.html']:
    target = root / filename
    if args.check:
        if target.read_text() != page:
            raise SystemExit(f'{filename} needs rebuilding')
    else:
        target.write_text(page)
