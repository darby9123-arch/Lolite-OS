#!/usr/bin/env python3
"""Bundle the two supplied source archives and index their actual launch documents.

Usage: python scripts/bundle-uploaded-game-packs.py --chicken ZIP --genizy ZIP
Only local archives are read. No upstream downloads or site redirects are created.
"""
import argparse
import hashlib
import html
import json
import posixpath
import re
import unicodedata
import zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'html games' / 'collections'


def key(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', value).lower().replace('&', 'and'))


class Tags(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


def archive(path):
    files = {}
    with zipfile.ZipFile(path) as source:
        for info in source.infolist():
            if info.is_dir():
                continue
            parts = PurePosixPath(info.filename).parts
            if len(parts) < 2 or '..' in parts or info.filename.startswith('/') or '\\' in info.filename:
                raise ValueError('Unsafe archive path: ' + info.filename)
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError('Archive contains a symbolic link')
            files['/'.join(parts[1:])] = source.read(info)
    return files


def bundle(files, slug, prefixes):
    count = size = 0
    for name, content in files.items():
        if not any(name.startswith(prefix) for prefix in prefixes):
            continue
        destination = DEST / slug / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        count += 1
        size += len(content)
    return {'files': count, 'bytes': size}


def url(slug, path):
    return '/'.join(quote(part, safe='-._~') for part in ('html games/collections/' + slug + '/' + path).split('/'))


def entry(slug, title, path, cover=''):
    return {'file': 'pack-' + slug + '-' + hashlib.sha256(path.encode()).hexdigest()[:12] + '.html',
            'collection': slug, 'title': title.strip(), 'url': url(slug, path), 'cover': cover}


def is_html(content):
    if not re.search(rb'<(?:html|script|canvas|body|head|div|iframe)\b', content, re.I):
        return False
    # Several source files stop after the shared title/tracking header.
    # A successful HTTP response and an <html> tag do not make those games.
    text = content.decode('utf-8', errors='replace')
    scripts = re.findall(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', text, re.I)
    markup = re.sub(r'<script\b[^>]*>[\s\S]*?</script\s*>', '', text, flags=re.I)
    has_ui = bool(re.search(r'<(?:body|div|canvas|iframe|object|embed)\b', markup, re.I))
    has_code = any(not ('googletag' in attrs or 'gtag(' in code or 'dataLayer' in code)
                   and (attrs.strip() or code.strip()) for attrs, code in scripts)
    return has_ui or has_code


def genizy(files):
    slug = 'genizymath'
    indexed = {}
    by_id = {}
    for name, content in files.items():
        if not name.startswith('games/') or not name.endswith('/index.html'):
            continue
        text = content.decode('utf-8', errors='replace')
        launch = re.search(r'const url = [\'"]/?(iframe/[^\'"]+)[\'"]', text)
        title = re.search(r'<title>Play (.*?) \|', text)
        if not launch or not title:
            continue
        path, title = launch[1], html.unescape(title[1])
        number = re.search(r'iframe/(\d+)', path)[1]
        cover = next((attrs['content'] for tag, attrs in Tags(text).tags
                      if tag == 'meta' and attrs.get('property') == 'og:image'), '')
        indexed[path] = (title, cover)
        by_id.setdefault(number, (path, title, cover))
    selected = json.loads(files['games.json'])
    chosen_ids = {re.search(r'iframe/(\d+)', path)[1] for path in selected}
    # The site's generated pages include games omitted from its games.json.
    selected += [value[0] for number, value in by_id.items() if number not in chosen_ids]
    rows = []
    seen = set()
    corrections = {'0': 'Bowmasters', '85': 'Cut the Rope', '745': 'Tetris (NES)'}
    for path in selected:
        if path not in files:
            raise ValueError('GenizyMath launch document missing: ' + path)
        number = re.search(r'iframe/(\d+)', path)[1]
        if number in seen:
            continue
        seen.add(number)
        title, cover = indexed.get(path, by_id.get(number, ('', '', ''))[1:])
        title = corrections.get(number, title)
        if not title:
            raise ValueError('Cannot identify GenizyMath game: ' + path)
        if number in {'253', '596'}:  # Source-site chatbot and comments, not games.
            continue
        cover = cover or 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main/' + number + '.png'
        if not is_html(files[path]):
            backups = [name for name in files if re.match(r'iframe/' + number + r'(?:[.-])', name)
                       and name.endswith('.html') and is_html(files[name])]
            if not backups:
                raise ValueError('No usable HTML copy for ' + title)
            path = sorted(backups)[-1]
        if not path.endswith('.html'):
            # 615.html-a contains real HTML but static hosts assign the wrong MIME type.
            normalized = 'iframe/' + number + '-uploaded.html'
            files[normalized] = files[path]
            path = normalized
        rows.append(entry(slug, title, path, cover))
    return rows, [], bundle(files, slug, ('iframe/', 'images/'))


def chicken(files):
    slug = 'chicken-kings-vault'
    text = files['games.js'].decode('utf-8')
    cards = re.findall(r'<a\b[^>]*class="game-link"[^>]*>(.*?)</a>', text, re.S)
    links = [attrs for tag, attrs in Tags(text).tags if tag == 'a' and 'game-link' in attrs.get('class', '').split()]
    if len(cards) != len(links):
        raise ValueError('Chicken King catalogue could not be parsed')
    casefold = {path.casefold(): path for path in files}
    raw = {}
    wrappers = {}
    for path, data in files.items():
        if not path.startswith('gamefiles/') or not path.lower().endswith('.html'):
            continue
        content = data.decode('utf-8', errors='replace')
        if 'frame-wrapper' in content and 'gameFrame' in content:
            frames = [attrs.get('src', '') for tag, attrs in Tags(content).tags if tag == 'iframe']
            wrappers[path] = frames[0] if frames else ''
        else:
            raw.setdefault(key(Path(path).stem), []).append(path)
    aliases = {'Stealth Masters': 'Stealth Master', "That's Not My Neighbour": "That's Not My Neighbor"}
    used = set()
    rows, missing = [], []
    for attrs, body in zip(links, cards):
        title_match = re.search(r'<div>(.*?)</div>', body, re.S)
        if not title_match:
            continue
        title = html.unescape(title_match[1]).strip()
        href = unquote(attrs.get('href', ''))
        wrapper = href if href in files else casefold.get(href.casefold(), href)
        source = wrappers.get(wrapper, '')
        target = posixpath.normpath(posixpath.join(posixpath.dirname(wrapper), unquote(source))) if source else ''
        target = target if target in files else casefold.get(target.casefold(), target)
        # Repair misspelled/missing wrapper links using the supplied game file.
        if target not in files or target in wrappers:
            candidates = raw.get(key(aliases.get(title, title)), [])
            if len(candidates) == 1:
                target = candidates[0]
            elif wrapper in files and wrapper not in wrappers and key(Path(wrapper).stem) == key(title):
                target = wrapper
            else:
                missing.append({'title': title, 'wrapper': href, 'missingTarget': source})
                continue
        if target in used:
            continue
        if not is_html(files[target]):
            missing.append({'title': title, 'wrapper': href, 'missingTarget': target,
                            'reason': 'The supplied file is an error message or an incomplete header without game code.'})
            used.add(target)
            continue
        used.add(target)
        images = [a.get('src', '') for t, a in Tags(body).tags if t == 'img']
        image = unquote(images[0]) if images else ''
        image = image if image in files else casefold.get(image.casefold(), '')
        cover = url(slug, image) if image else ''
        rows.append(entry(slug, title, target, cover))
    # Include actual games left out of games.js, but not the source site's apps/navigation.
    site_pages = {'AI', 'Chat', 'Emulator JS', 'Helios Browser', 'Nautilis OS', 'Play!.js',
                  'Ruffle', 'Sandstone Proxy', 'apps', 'gamepage', 'index', 'mobile'}
    for paths in raw.values():
        for path in paths:
            title = Path(path).stem
            if path in used or title in site_pages or len(PurePosixPath(path).parts) != 2:
                continue
            rows.append(entry(slug, title, path))
            used.add(path)
    return rows, missing, bundle(files, slug, ('gamefiles/', 'gameimages/'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chicken', type=Path, required=True)
    parser.add_argument('--genizy', type=Path, required=True)
    args = parser.parse_args()
    games, collections, report = [], [], {'archives': [], 'missing': []}
    for path, slug, name, build in [(args.genizy, 'genizymath', 'GenizyMath', genizy),
                                   (args.chicken, 'chicken-kings-vault', "Chicken King's Vault", chicken)]:
        rows, missing, stats = build(archive(path))
        games += rows
        collections.append({'id': slug, 'name': name, 'count': len(rows)})
        report['archives'].append({'filename': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                                   'collection': slug, 'games': len(rows), **stats})
        report['missing'] += [{'collection': slug, **item} for item in missing]
    games.sort(key=lambda item: (item['collection'], item['title'].casefold(), item['url']))
    data = {'version': 1, 'collections': collections, 'games': games}
    (ROOT / 'core/uploaded-game-packs.js').write_text(
        '/* Generated from the supplied ZIPs by scripts/bundle-uploaded-game-packs.py. */\n'
        'window.LoliteUploadedGamePacks=Object.freeze(' + json.dumps(data, ensure_ascii=True, separators=(',', ':')) + ');\n')
    (DEST / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'collections': collections, 'total': len(games), **report}, indent=2))


if __name__ == '__main__':
    main()
