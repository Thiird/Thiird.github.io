#!/usr/bin/env python3
"""
================================================================================
GENERATE OVERVIEW IMAGE MANIFEST
================================================================================

PURPOSE:
    Generate a manifest JSON file listing all images in the overview/showcase
    directory. This manifest is used by the website to display the image
    gallery on the main page.

WHAT IT DOES:
    1. Scans src/resources/images/overview/ directory
    2. Finds all image files (JPG, JPEG, PNG, GIF, WEBP, SVG, BMP)
    3. Creates a JSON array with all image filenames
    4. Writes to src/resources/images/overview/overview_manifest.json

MANIFEST STRUCTURE:
    [
      "image1.jpg",
      "image2.png",
      "image3.gif",
      ...
    ]

SUPPORTED IMAGE FORMATS:
    - JPG/JPEG (most common)
    - PNG (transparency support)
    - GIF (animated images)
    - WEBP (modern format)
    - SVG (vector graphics)
    - BMP (bitmap images)

DEFAULT PATHS:
    Source directory: src/resources/images/overview
    Output file: src/resources/images/overview/overview_manifest.json

COMMAND LINE ARGUMENTS (OPTIONAL):
    python scripts/generate_overview_manifest.py [SRC_DIR] [OUT_FILE]
    
    If no arguments provided, uses defaults above.
    
    Examples:
      python scripts/generate_overview_manifest.py
      python scripts/generate_overview_manifest.py custom/path
      python scripts/generate_overview_manifest.py custom/path output.json

BEHAVIOR:
    - OVERWRITES: Existing manifest file is replaced
    - ALPHABETICAL: Images are sorted alphabetically by filename
    - CASE-INSENSITIVE: File extensions checked with .lower()
    - FILES ONLY: Subdirectories are ignored

DEPENDENCIES:
    - Python 3.6+
    - No external dependencies

USAGE:
    python scripts/generate_overview_manifest.py

OUTPUT:
    Prints the output manifest file path and exits.
    Returns exit code 0 on success, 2 if source directory not found.

EXAMPLE OUTPUT:
    src/resources/images/overview/overview_manifest.json

ERROR HANDLING:
    If source directory doesn't exist:
      - Prints error message to stderr
      - Exits with code 2

NOTES:
    - Manifest includes only filenames, not full paths
    - JavaScript on the website constructs full paths from manifest
    - Files are included in the order they appear in the directory
    - Hidden files (starting with .) are included if they match extensions

USE CASE:
    This manifest is specifically for the overview/showcase image gallery.
    The website uses it to dynamically load and display images without
    hardcoding filenames.

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
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
