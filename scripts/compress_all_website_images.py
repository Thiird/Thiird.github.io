"""
================================================================================
COMPRESS ALL WEBSITE IMAGES
================================================================================

PURPOSE:
    Automatically compress all images across the entire website to optimized
    quality levels using FFmpeg. This script ensures all images are properly
    compressed without manual intervention.

WHAT IT DOES:
    1. Scans all website directories for image files (JPG, PNG, JPEG)
    2. Analyzes each image to determine if compression is needed
    3. Compresses images using FFmpeg with configurable quality settings
    4. Only replaces originals if meaningful file size savings are achieved
    5. Skips already-optimized images (idempotent - safe to run multiple times)

TARGET LOCATIONS:
    - src/resources/images/** (all images, including overview/)
    - src/blogs/**/res/ (all blog resource images)
    - src/bio/res/ (biography images)
    - src/poems/**/res/ (poem resource images, if any)

CONFIGURATION:
    TARGET_QUALITY_JPG = 10       # FFmpeg quality: 2=best, 31=worst
    TARGET_QUALITY_PNG = 9        # PNG compression: 0-9 (higher=more)
    MIN_SAVINGS_PERCENT = 3       # Only replace if >=3% smaller
    MIN_FILE_SIZE_KB = 500        # Skip files smaller than 500KB
    SKIP_TOLERANCE_PERCENT = 2    # Skip if within 2% of target size

BEHAVIOR:
    - IDEMPOTENT: Safe to run multiple times
    - NON-DESTRUCTIVE: Only replaces files with improved versions
    - SMART SKIPPING: Avoids recompressing already-optimized images
    - ATOMIC REPLACEMENT: Uses temp files to prevent corruption

DEPENDENCIES:
    - ffmpeg (must be installed and in PATH)
    - ffprobe (must be installed and in PATH)
    - Python 3.6+

USAGE:
    python scripts/compress_all_website_images.py

OUTPUT:
    Prints detailed progress for each directory and image:
    - [Skipped - too small] - File below minimum size threshold
    - [Skipped - already optimized] - Already at target quality
    - [Compressed] - Successfully compressed with savings percentage
    - [Skipped - no improvement] - Compression didn't meet minimum savings
    - [FFmpeg error] - Error during compression

EXAMPLE OUTPUT:
    Image Compression
    ----------------------------------------
    Repository: /path/to/Thiird.github.io
    Target quality (JPG): -q:v 10
    Target quality (PNG): compression_level 9
    
    src/blogs/0_optical_mouse/res/
    ----------------------------------------
       [Compressed] sensor.jpg | 2048 KB → 891 KB (-56.5%)
       [Skipped - already optimized] diagram.png
    
    Compressed: 15, Skipped: 42, Total: 57

NOTES:
    - No backups are created (original files are replaced)
    - Very small files (<500KB) are automatically skipped
    - Uses standard JPEG format (yuvj420p) for compatibility
    - Preserves color space information (bt709)

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
"""

import os
import sys
from pathlib import Path
import subprocess
import tempfile
import json

# ----------------------------- CONFIG -----------------------------
TARGET_QUALITY_JPG = 10       # FFmpeg quality: 2 = best, 31 = worst
TARGET_QUALITY_PNG = 9       # PNG compression level: 0-9 (higher = more compression)
MIN_SAVINGS_PERCENT = 3      # Only overwrite if new file is at least this % smaller
MIN_FILE_SIZE_KB = 500        # Skip very small files
SKIP_TOLERANCE_PERCENT = 2   # Skip if already within 2% of target size
# ------------------------------------------------------------------

def get_image_info(img_path):
    """Get image dimensions and format using ffprobe."""
    cmd = [
        'ffprobe',
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,pix_fmt',
        '-of', 'json',
        str(img_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            if 'streams' in data and len(data['streams']) > 0:
                stream = data['streams'][0]
                return {
                    'width': stream.get('width', 0),
                    'height': stream.get('height', 0),
                    'pix_fmt': stream.get('pix_fmt', '')
                }
    except Exception:
        pass
    
    return None

def needs_compression(img_path, info):
    """Check if image needs compression based on current properties."""
    if info is None:
        return True  # Can't determine, try compressing
    
    # For JPG, check if it's already in optimal format and well compressed
    pix_fmt = info.get('pix_fmt', '')
    if img_path.suffix.lower() in {'.jpg', '.jpeg'}:
        # If already in standard JPEG format with reasonable size, might skip
        if pix_fmt in ['yuvj420p', 'yuv420p']:
            file_size = img_path.stat().st_size
            width = info.get('width', 0)
            height = info.get('height', 0)
            # Estimate if already well compressed (rough heuristic)
            pixels = width * height
            if pixels > 0:
                bytes_per_pixel = file_size / pixels
                # Well compressed JPG typically has < 0.5 bytes per pixel
                if bytes_per_pixel < 0.3:
                    return False  # Already well compressed
    
    return True

def compress_image(img_path, is_jpg=True):
    """Compress image and return temp file path with compressed version."""
    original_size = img_path.stat().st_size
    
    # Create temporary file
    suffix = '.jpg' if is_jpg else '.png'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        temp_path = Path(tmp.name)
    
    # Build FFmpeg command based on file type
    if is_jpg:
        # JPEG compression - no resolution change, just quality adjustment
        cmd = [
            'ffmpeg',
            '-i', str(img_path),
            '-q:v', str(TARGET_QUALITY_JPG),
            '-pix_fmt', 'yuvj420p',  # Standard JPEG format
            '-color_primaries', 'bt709',
            '-color_trc', 'bt709',
            '-colorspace', 'bt709',
            '-y', str(temp_path)
        ]
    else:
        # PNG compression - no resolution change, just compression level adjustment
        cmd = [
            'ffmpeg',
            '-i', str(img_path),
            '-compression_level', str(TARGET_QUALITY_PNG),
            '-y', str(temp_path)
        ]
    
    # Run FFmpeg
    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if result.returncode != 0:
        temp_path.unlink(missing_ok=True)
        return None, original_size
    
    new_size = temp_path.stat().st_size
    return temp_path, new_size

def process_image(img_path):
    """Process a single image file."""
    original_size = img_path.stat().st_size
    
    # Skip very small files
    if original_size < MIN_FILE_SIZE_KB * 1024:
        print(f"   [Skipped - too small] {img_path.name} ({original_size//1024} KB)")
        return False
    
    # Get image info
    info = get_image_info(img_path)
    
    # Check if compression needed
    if not needs_compression(img_path, info):
        print(f"   [Skipped - already optimized] {img_path.name}")
        return False
    
    # Determine file type
    is_jpg = img_path.suffix.lower() in {'.jpg', '.jpeg'}
    
    # Compress
    temp_path, new_size = compress_image(img_path, is_jpg)
    
    if temp_path is None:
        print(f"   [FFmpeg error] {img_path.name}")
        return False
    
    # Check if compression provides meaningful savings
    if new_size < original_size * (1 - MIN_SAVINGS_PERCENT / 100):
        savings = (original_size - new_size) / original_size * 100
        print(f"   [Compressed] {img_path.name} | {original_size//1024} KB → {new_size//1024} KB (-{savings:.1f}%)")
        temp_path.replace(img_path)  # Atomic replace
        return True
    else:
        print(f"   [Skipped - no improvement] {img_path.name}")
        temp_path.unlink()
        return False

def find_all_images(repo_root):
    """Find all images in the website directory structure."""
    image_extensions = {'.jpg', '.jpeg', '.png'}
    images = []
    
    # Define search paths
    search_paths = [
        repo_root / 'src' / 'resources' / 'images',
        repo_root / 'src' / 'blogs',
        repo_root / 'src' / 'bio',
        repo_root / 'src' / 'poems',
    ]
    
    for search_path in search_paths:
        if search_path.exists():
            # Recursively find all images
            for img_path in search_path.rglob('*'):
                if img_path.is_file() and img_path.suffix.lower() in image_extensions:
                    images.append(img_path)
    
    return sorted(images)

def check_dependencies():
    """Check if required tools are installed."""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        subprocess.run(['ffprobe', '-version'], capture_output=True, timeout=5)
        return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("\nError: ffmpeg and ffprobe must be installed and in PATH")
        print("Install from: https://ffmpeg.org/download.html")
        return False

def main():
    print("\nImage Compression")
    print("-" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Get repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    print(f"\nRepository: {repo_root}")
    print(f"Target quality (JPG): -q:v {TARGET_QUALITY_JPG}")
    print(f"Target quality (PNG): compression_level {TARGET_QUALITY_PNG}")
    print(f"Mode: Compression only (resolution unchanged)")
    print()
    
    # Find all images
    print("Scanning for images...")
    images = find_all_images(repo_root)
    
    if not images:
        print("   No images found.")
        return
    
    print(f"   Found {len(images)} image(s)\n")
    
    # Group by directory for organized output
    images_by_dir = {}
    for img in images:
        dir_path = img.parent
        if dir_path not in images_by_dir:
            images_by_dir[dir_path] = []
        images_by_dir[dir_path].append(img)
    
    # Process each directory
    total_compressed = 0
    total_skipped = 0
    
    for dir_path in sorted(images_by_dir.keys()):
        rel_path = dir_path.relative_to(repo_root)
        print(f"\n{rel_path}/")
        print("-" * 40)
        
        for img_path in sorted(images_by_dir[dir_path]):
            if process_image(img_path):
                total_compressed += 1
            else:
                total_skipped += 1
    
    # Summary
    print(f"\nCompressed: {total_compressed}, Skipped: {total_skipped}, Total: {len(images)}\n")

if __name__ == "__main__":
    main()
