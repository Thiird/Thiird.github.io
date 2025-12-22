#!/usr/bin/env python3
"""
Generate `overview_manifest.json` from files in `src/resources/images/overview`.

Usage:
  python scripts/generate_overview_manifest.py [SRC_DIR] [OUT_FILE]

If no arguments are given, it writes to `src/resources/images/overview/overview_manifest.json`.
"""
from pathlib import Path
import sys
import json
import re

DEFAULT_SRC = Path("src/resources/images/overview")
DEFAULT_OUT = DEFAULT_SRC / "overview_manifest.json"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"}


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    if not src.exists() or not src.is_dir():
        print(f"Source directory not found: {src}", file=sys.stderr)
        sys.exit(2)

    files = [p.name for p in src.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS]

    # Natural / alphanumeric sort: split digits and non-digits so '2.jpg' comes before '10.jpg'
    def alphanum_key(s):
        parts = re.split(r'(\d+)', s)
        return [int(p) if p.isdigit() else p.lower() for p in parts]

    files.sort(key=alphanum_key)

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(files, indent=2, ensure_ascii=False))
    print(f"Wrote {len(files)} entries to {out}")


if __name__ == "__main__":
    main()
