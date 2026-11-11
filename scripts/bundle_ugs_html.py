#!/usr/bin/env python3
"""Bundle permitted UGS HTML launch files directly into Lolite's source tree.

UGS's published document permits use of files on websites and requests credit.
Individual games remain the property of their respective creators. This tool
skips large, unsupported, and age-restricted entries; never executes a game.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import json
import re
import requests
import sys
import time

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "core/ugs-catalog.js"
HOSTED = ROOT / "core/ugs-hosted-catalog.js"
TARGET = ROOT / "html games/ugs"
MAX_FILE = 85000
# Store only small HTML launch pages, not very large game binaries.
BLOCKED = re.compile(
    r"casino|poker|blackjack|roulette|slot|betting|gambl|wager|"
    r"porn|adult|hentai|nud|erot|sex|nsfw|"
    r"beer|alcohol|drug|meth|cigarette|vape|smok|"
    r"blood|gore|suicid|selfharm|gun|shoot|knife|weapon|kill|"
    r"murder|zombi|sword|horror|scary|nightmare|"
    r"fnaf|baldi|angrybird|mario|pokemon|sonic|naruto|"
    r"spiderman|minecraft|disney|spongebob|simpsons|wwe|squidgame",
    re.IGNORECASE,
)
NAME = re.compile(r"^[a-zA-Z0-9._-]+\.html?$")
HTML = re.compile(r"<!doctype\s+html\b|<html[\s>]", re.IGNORECASE)


def catalog_rows():
    src = CATALOG.read_text(encoding="utf-8")
    return json.loads(src.split("window.LoliteUGSCatalog=", 1)[1].strip().rstrip(";"))


def existing_map():
    src = HOSTED.read_text(encoding="utf-8")
    match = re.search(r"Object\.freeze\((\{[^\n]+\})\);", src)
    if not match:
        raise RuntimeError("Existing UGS hosted catalogue not recognised")
    return json.loads(match.group(1))


def clean_html(data):
    if len(data) < 350 or len(data) > MAX_FILE + 4000:
        return None
    text = data.decode("utf-8-sig", errors="replace")
    if not HTML.search(text):
        return None
    low = text[:3000].lower()
    if "google drive - virus scan warning" in low or "you need access" in low:
        return None
    if "google drive" in low and "sign in" in low and "drive.google.com" in low:
        return None
    if re.match(r"^\s*<Module\b", text, re.IGNORECASE):
        begin = HTML.search(text)
        end = text.lower().rfind("</html>")
        if begin is None or end < begin.start():
            return None
        text = text[begin.start():end + len("</html>")]
    if "<html" not in text.lower():
        return None
    if not re.search(r"<(?:head|body|script|canvas|div)\b", text, re.IGNORECASE):
        return None
    # Pure embedded wrappers are not actual hosted HTML games.
    if "<iframe" in text.lower() and "<script" not in text.lower() and "<canvas" not in text.lower():
        return None
    return text


def download_game(row):
    file_id, name = row[:2]
    urls = (
        f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t",
        f"https://drive.google.com/uc?export=download&id={file_id}",
    )
    for url in urls:
        try:
            response = requests.get(url, timeout=(5, 9), headers={
                "User-Agent": "Mozilla/5.0 (compatible; LoliteUGSGameBundler/1.0)",
                "Accept": "text/html,application/octet-stream,*/*",
            })
            if response.status_code != 200:
                continue
            html = clean_html(response.content)
            if html is not None:
                return row, html
        except requests.RequestException:
            continue
    return row, None


def main():
    hosted = existing_map()
    TARGET.mkdir(parents=True, exist_ok=True)
    options = []
    seen = set()
    for row in catalog_rows():
        if not isinstance(row, list) or len(row) < 5:
            continue
        file_id, filename, kind, size, title = row
        if kind != "html5" or not isinstance(size, int):
            continue
        if size < 550 or size > MAX_FILE or file_id in hosted:
            continue
        if not NAME.fullmatch(filename) or BLOCKED.search(filename + " " + title):
            continue
        if filename.lower() in seen or (TARGET / filename).exists():
            continue
        seen.add(filename.lower())
        options.append(row)

    print(f"UGS: checking {len(options)} public HTML files; {len(hosted)} already bundled", flush=True)
    added, skipped = 0, 0
    with ThreadPoolExecutor(max_workers=9) as pool:
        pending = {pool.submit(download_game, row): row for row in options}
        for future in as_completed(pending):
            row, html = future.result()
            if html is None:
                skipped += 1
                continue
            file_id, filename = row[:2]
            (TARGET / filename).write_text(html, encoding="utf-8")
            hosted[file_id] = "html%20games/ugs/" + filename
            added += 1
            if added % 40 == 0:
                print(f"UGS: bundled {added} real HTML pages ({skipped} skipped)", flush=True)

    HOSTED.write_text(
        "/* Repository-hosted UGS HTML games; creator credits in html games/ugs/README.md. */\n"
        "window.LoliteUGSHosted=Object.freeze(" +
        json.dumps(hosted, separators=(",", ":"), ensure_ascii=False) +
        ");\n",
        encoding="utf-8",
    )
    print(f"UGS: added {added}, skipped {skipped}; now {len(hosted)} game HTML files total", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
