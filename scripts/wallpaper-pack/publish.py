"""Publish the user-supplied MP4 pack without putting large videos in Git history."""
import concurrent.futures, hashlib, json, os, re, subprocess, time, urllib.request
from pathlib import Path

REPO = 'darby9123-arch/Lolite-OS'
TAG = 'wallpapers-20261113'
ENDPOINT = 'https://rztxhwfdbrzuhdqpegar.supabase.co/functions/v1/lolite-wallpaper-import'
AUDIENCE = 'lolite-wallpaper-pack-20261113'
ROOT = Path(os.environ.get('RUNNER_TEMP', '/tmp')) / 'lolite-wallpaper-pack'

def gh(*args):
    return subprocess.check_output(['gh', *args], text=True)

def read_json(url, headers=None):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers or {}), timeout=60) as response:
        return json.load(response)

def manifest():
    request_url = os.environ['ACTIONS_ID_TOKEN_REQUEST_URL'] + '&audience=' + AUDIENCE
    token = read_json(request_url, {'Authorization': 'Bearer ' + os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})['value']
    return read_json(ENDPOINT, {'Authorization': 'Bearer ' + token})

def clean_name(name):
    title = re.sub(r'\.\d+x\d+\.mp4$', '', name).replace('-', ' ').title()
    for before, after in [('Gta Vi', 'GTA VI'), ('Macos', 'macOS'), ('Xp', 'XP'), ('Rs 7', 'RS 7'), ('Gt R32', 'GT-R32'), ('Playstation Controlle', 'PlayStation Controller')]:
        title = title.replace(before, after)
    return title

def prepare(item):
    name = item['name']
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*\.\d+x\d+\.mp4', name):
        raise ValueError('Invalid source filename')
    if not 0 < item['size'] <= 100_000_000:
        raise ValueError('Invalid source size')
    url = item['downloadUrl']
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if parsed.scheme != 'https' or not (parsed.hostname or '').endswith('.oaiusercontent.com') or parsed.username or parsed.password:
        raise ValueError('Invalid source host')
    video = ROOT / name
    digest = hashlib.sha256()
    written = 0
    with urllib.request.urlopen(url, timeout=120) as response, video.open('wb') as output:
        while chunk := response.read(1024 * 1024):
            written += len(chunk)
            if written > item['size']:
                raise ValueError('Source exceeds declared size')
            digest.update(chunk)
            output.write(chunk)
    if written != item['size']:
        raise ValueError('Incomplete source')
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height:format=duration', '-of', 'json', str(video)], text=True))
    stream = probe['streams'][0]
    if stream['codec_name'] not in ('h264', 'hevc', 'av1', 'vp9'):
        raise ValueError('Unsupported video codec')
    slug = re.sub(r'\.\d+x\d+\.mp4$', '', name)
    poster = ROOT / (slug + '.jpg')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-threads', '1', '-i', str(video), '-frames:v', '1', '-vf', 'scale=960:-2', '-threads', '1', '-q:v', '3', str(poster)], check=True)
    return {'id': 'pack-' + slug, 'name': clean_name(name), 'filename': name, 'posterFilename': poster.name,
            'width': stream['width'], 'height': stream['height'], 'duration': float(probe['format']['duration']),
            'bytes': written, 'sha256': digest.hexdigest()}

def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    try:
        gh('release', 'view', TAG, '--repo', REPO)
    except subprocess.CalledProcessError:
        gh('release', 'create', TAG, '--repo', REPO, '--target', os.environ['GITHUB_SHA'], '--draft', '--latest=false',
           '--title', 'Lolite Live Wallpaper Pack — November 2026', '--notes', '103 user-provided live wallpapers. Original MP4 files and thumbnails for Lolite OS. This is a wallpaper asset pack, not a desktop application update.')
    done, failed_urls = {}, {}
    deadline = time.monotonic() + 5400
    while time.monotonic() < deadline:
        batch = manifest()
        if batch.get('total') != 103:
            raise ValueError('Unexpected pack size')
        ready = [x for x in batch['files'] if x['name'] not in done and failed_urls.get(x['name']) != x['downloadUrl']]
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            futures = {pool.submit(prepare, item): item for item in ready}
            for future in concurrent.futures.as_completed(futures):
                item = futures[future]
                try:
                    entry = future.result()
                except Exception:
                    failed_urls[item['name']] = item['downloadUrl']
                    print('Waiting for a refreshed source: ' + item['name'], flush=True)
                    continue
                gh('release', 'upload', TAG, str(ROOT / entry['filename']), str(ROOT / entry['posterFilename']), '--repo', REPO, '--clobber')
                done[item['name']] = entry
                print('Published file ' + str(len(done)) + '/103: ' + entry['name'], flush=True)
                (ROOT / entry['filename']).unlink()
        if batch.get('sealed') and len(done) == 103:
            break
        time.sleep(15)
    if len(done) != 103:
        raise RuntimeError('The pack is incomplete; draft remains unpublished')
    release = json.loads(gh('api', 'repos/' + REPO + '/releases/tags/' + TAG))
    assets = {}
    for page in range(1, 5):
        rows = json.loads(gh('api', 'repos/' + REPO + '/releases/' + str(release['id']) + '/assets?per_page=100&page=' + str(page)))
        assets.update({row['name']: row for row in rows})
        if len(rows) < 100:
            break
    entries = []
    for entry in sorted(done.values(), key=lambda x: x['name']):
        asset = assets[entry['filename']]
        if asset['size'] != entry['bytes']:
            raise ValueError('Uploaded asset size mismatch')
        entry['video'] = asset['browser_download_url']
        entry['poster'] = assets[entry['posterFilename']]['browser_download_url']
        entries.append(entry)
    payload = {'version': '20261113', 'release': release['html_url'], 'total': len(entries), 'bytes': sum(x['bytes'] for x in entries), 'catalog': entries}
    (ROOT / 'manifest.json').write_text(json.dumps(payload, indent=2) + '\n')
    (ROOT / 'SHA256SUMS').write_text(''.join(x['sha256'] + '  ' + x['filename'] + '\n' for x in entries))
    gh('release', 'upload', TAG, str(ROOT / 'manifest.json'), str(ROOT / 'SHA256SUMS'), '--repo', REPO, '--clobber')
    gh('release', 'edit', TAG, '--repo', REPO, '--draft=false', '--latest=false')
    print('Published all 103 original videos and 103 thumbnails.', flush=True)

if __name__ == '__main__':
    main()
