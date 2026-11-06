#!/usr/bin/env python3
"""Install original user-supplied HTML files/assets from a GitHub release ZIP.

Run by the repository's release workflow. Never fetches third-party game sites.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import re
import shutil
import sys
import unicodedata
import zipfile
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / "html games" / "gamefiles"
CATALOG = ROOT / "core" / "gamefiles-bundled-catalog.js"
TYPES = {
    ".html", ".htm", ".css", ".js", ".mjs", ".json", ".wasm", ".png",
    ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".mp3", ".wav",
    ".ogg", ".mp4", ".webm", ".otf", ".ttf", ".woff", ".woff2",
    ".manifest", ".bin", ".data", ".xml"
}
SKIP = re.compile(
    r"^(?:apps|gamepage|index|home|ai|search|settings|sandstoneproxy|"
    r"heliosbrowser|nautilisos|sites|about|faq|credits|login|register|options|"
    r"games|tools)$", re.I
)
BLOCK = re.compile(
    r"(?:casino|poker|blackjack|roulette|slot[\s_-]*machine|"
    r"sportsbook|betting|wager|porn|adult|sex)", re.I
)

def title_key(name: str) -> str:
    ascii_name = unicodedata.normalize("NFKD", name)
    return re.sub(r"[^a-z0-9]", "", ascii_name.lower())

def allowed_path(name: str) -> bool:
    if not name.startswith("gamefiles/") or name.endswith("/") or "\\" in name:
        return False
    rel = name[len("gamefiles/"):]
    parts = rel.split("/")
    return all(p and p not in (".", "..") and ":" not in p and not p.startswith(".") for p in parts)

def import_zip(filename: pathlib.Path) -> None:
    with zipfile.ZipFile(filename) as archive:
        infos = {
            i.filename: i for i in archive.infolist()
            if allowed_path(i.filename)
            and pathlib.PurePosixPath(i.filename).suffix.lower() in TYPES
            and i.file_size < 50 * 1024 * 1024
        }
        if len(archive.infolist()) > 5000 or sum(i.file_size for i in infos.values()) > 150 * 1024 * 1024:
            raise ValueError("The supplied archive exceeds the supported extraction limits")
        selected: dict[str, tuple[int, str, str]] = {}
        skipped_wrappers = 0
        for name, entry in infos.items():
            if not re.fullmatch(r"gamefiles/[^/]+\.html?", name, re.I):
                continue
            title = name[len("gamefiles/"):].rsplit(".", 1)[0]
            key = title_key(title)
            if len(key) < 2 or SKIP.fullmatch(key) or BLOCK.search(title) or entry.file_size < 700:
                continue
            html = archive.read(entry).decode("utf-8", errors="replace")
            # Do not list iframe wrappers or Google gadget XML as standalone games.
            if re.search(r"<Module\s*>|<iframe\b", html, re.I):
                skipped_wrappers += 1
                continue
            if not re.search(r"<(?:html|head|body|canvas|script|div)\b", html, re.I):
                continue
            score = (4 if re.search(r"[A-Z]", title) else 0) + (2 if " " in title else 0) + (1 if entry.file_size > 7000 else 0)
            if key not in selected or score > selected[key][0]:
                selected[key] = (score, name, title)
        if "gamefiles/idle-shark/index.html" in infos:
            selected["idleshark"] = (10, "gamefiles/idle-shark/index.html", "Idle Shark")
        if not selected:
            raise ValueError("The ZIP contains no supported standalone HTML games")
        entries = {value[1] for value in selected.values()}
        keep = {
            name: meta for name, meta in infos.items()
            if not re.fullmatch(r"gamefiles/[^/]+\.html?", name, re.I) or name in entries
        }
        # Remove only the generated game folder, never the rest of Lolite OS.
        if DEST.is_dir():
            shutil.rmtree(DEST)
        DEST.mkdir(parents=True, exist_ok=True)
        for name, entry in keep.items():
            rel = name[len("gamefiles/"):]
            target = DEST.joinpath(*rel.split("/"))
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(archive.read(entry))
        games = []
        for _, name, title in selected.values():
            rel = name[len("gamefiles/"):]
            games.append({
                "file": "bundle-" + hashlib.sha256(name.encode()).hexdigest()[:12] + ".html",
                "title": title,
                "url": "html%20games/gamefiles/" + quote(rel, safe="/")
            })
        games.sort(key=lambda g: g["title"].lower())
        CATALOG.parent.mkdir(parents=True, exist_ok=True)
        CATALOG.write_text(
            "/* Actual HTML games extracted from the user-supplied gamefiles.zip. */\n"
            + "window.LoliteBundledGamefiles="
            + json.dumps(games, ensure_ascii=False, separators=(",", ":"))
            + ";\n", encoding="utf-8"
        )
        print(f"Committed-ready: {len(games)} distinct HTML titles and {len(keep)} source files/assets.")
        print(f"Skipped {skipped_wrappers} iframe or gadget wrappers.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import_gamefiles_release.py <gamefiles.zip>")
    import_zip(pathlib.Path(sys.argv[1]))
