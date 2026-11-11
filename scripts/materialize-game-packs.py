#!/usr/bin/env python3
"""Restore byte-identical uploaded assets from pinned public source snapshots.

The manifest contains Git blob checksums calculated from the user's ZIPs.
Files that differed upstream are committed separately from the uploaded bytes.
Nothing is copied without verifying its checksum against the tested bundle.
"""
import hashlib
import json
import tempfile
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'scripts/uploaded-game-pack-files.json').read_text())
count = 0
for source in manifest['sources']:
    with tempfile.TemporaryDirectory() as temporary:
        archive = Path(temporary) / 'source.zip'
        url = 'https://codeload.github.com/' + source['repository'] + '/zip/' + source['commit']
        print('Fetching pinned source:', source['repository'], source['commit'], flush=True)
        urllib.request.urlretrieve(url, archive)
        with zipfile.ZipFile(archive) as downloaded:
            prefix = downloaded.namelist()[0].split('/')[0] + '/'
            for name, expected in source['files']:
                if '..' in PurePosixPath(name).parts or name.startswith('/') or '\\' in name:
                    raise ValueError('Unsafe asset path')
                original = source.get('aliases', {}).get(name, name)
                data = downloaded.read(prefix + original)
                actual = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
                if actual != expected:
                    raise ValueError('Uploaded asset checksum mismatch: ' + name)
                target = ROOT / 'html games/collections' / source['collection'] / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
                count += 1
print('Restored and verified', count, 'uploaded asset files.')
