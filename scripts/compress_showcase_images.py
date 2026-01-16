"""
================================================================================
COMPRESS SHOWCASE IMAGES (OVERVIEW DIRECTORY)
================================================================================

PURPOSE:
    Compress all JPG/JPEG images in the showcase/overview folder to a
    consistent quality level using FFmpeg with 8-bit per channel depth.

WHAT IT DOES:
    1. Targets a single specific directory: src/resources/images/overview/
    2. Finds all JPG/JPEG images in that directory
    3. Compresses each image to a fixed quality level (configurable)
    4. Forces 8-bit per channel output (standard JPEG format)
    5. Only overwrites originals if compression provides meaningful savings

TARGET LOCATION:
    - src/resources/images/overview/ (FIXED - relative to script location)

CONFIGURATION:
    TARGET_QV = 5                # FFmpeg quality: 2=best, 31=worst
    MIN_SAVINGS_PERCENT = 3      # Only overwrite if >=3% smaller
    TARGET_FOLDER_REL = "../src/resources/images/overview"

KEY FEATURES:
    - Fixed target folder (no directory scanning)
    - Consistent quality across all showcase images
    - 8-bit per channel enforced (standard JPEG)
    - Safe overwriting (only if smaller)
    - Skips very small files automatically

BEHAVIOR:
    - NON-DESTRUCTIVE: Only replaces with improved versions
    - NO BACKUPS: Original files are overwritten
    - SMART SKIPPING: Avoids processing files that won't benefit

DEPENDENCIES:
    - ffmpeg (must be installed and in PATH)
    - Python 3.6+

USAGE:
    python scripts/compress_showcase_images.py

OUTPUT:
    Prints working folder, lists all images found, and shows results:
    - [Compressed] - File successfully compressed
    - [Skipped] - File not improved or too small
    - [Error] - FFmpeg processing error

WARNING:
    No backups are created. Only improved (smaller) files replace originals.
    Make sure you have backups elsewhere if needed.

USE CASE:
    This script is specifically for the overview/showcase image gallery
    that appears on the main page. Use compress_all_website_images.py
    for comprehensive site-wide image compression.

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
"""

import os
from pathlib import Path
import subprocess
import tempfile

# ----------------------------- CONFIG -----------------------------
TARGET_QV = 5          # Quality: 2 = best (large files), 31 = worst (small files).
MIN_SAVINGS_PERCENT = 3 # Only overwrite if new file is at least this % smaller
TARGET_FOLDER_REL = "../src/resources/images/overview"  # Fixed folder relative to script location
# ------------------------------------------------------------------

def compress_and_replace_if_better(img_path):
    original_size = img_path.stat().st_size
    if original_size < 50 * 1024:  # Skip very small files (<50 KB)
        print(f"   [Skipped - too small] {img_path.name}")
        return

    # Temporary file for safe processing
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        temp_path = Path(tmp.name)

    # FFmpeg: fixed quality + force 8-bit per channel
    cmd = [
        'ffmpeg',
        '-i', str(img_path),
        '-q:v', str(TARGET_QV),
        '-pix_fmt', 'yuvj420p',       # Ensures 8-bit per channel (standard JPEG)
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-colorspace', 'bt709',
        '-y',
        str(temp_path)
    ]

    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode != 0:
        print(f"   [FFmpeg error] {img_path.name}")
        temp_path.unlink(missing_ok=True)
        return

    new_size = temp_path.stat().st_size
    if new_size < original_size * (1 - MIN_SAVINGS_PERCENT / 100):
        savings = (original_size - new_size) / original_size * 100
        print(f"   [Compressed] {img_path.name} | {original_size//1024} KB → {new_size//1024} KB (-{savings:.1f}%)")
        temp_path.replace(img_path)  # Safe atomic replace
    else:
        print(f"   [Skipped - no improvement] {img_path.name}")
        temp_path.unlink()

def main():
    # Folder to process: fixed relative path from script location
    script_dir = Path(__file__).parent.resolve()
    target_folder = script_dir / TARGET_FOLDER_REL
    target_folder = target_folder.resolve()  # Normalize path

    if not target_folder.exists():
        print(f"Error: Target folder not found:\n   {target_folder}")
        print("(Make sure the script is placed in the correct location relative to the images folder.)")
        return

    print("JPEG Compression Script")
    print("=" * 60)
    print(f"Search folder: {target_folder}")
    print(f"Target quality: -q:v {TARGET_QV} (8-bit per channel)")
    print()

    # Find all JPG/JPEG files
    jpg_files = sorted([
        p for p in target_folder.iterdir()
        if p.is_file() and p.suffix.lower() in {'.jpg', '.jpeg'}
    ])

    if not jpg_files:
        print("No JPG/JPEG files found in the target folder.")
        return

    print(f"Found {len(jpg_files)} file(s) to analyze:\n")
    for f in jpg_files:
        print(f"   {f.name}")

    print("\n" + "=" * 60)
    print("Starting compression...\n")

    for img_path in jpg_files:
        compress_and_replace_if_better(img_path)

    print("\nDone! All files in the folder have been processed.")

if __name__ == "__main__":
    main()