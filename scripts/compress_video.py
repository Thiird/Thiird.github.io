"""
Comprehensive video compression script for the entire website.
Compresses all video files (MP4, AVI, MOV, WEBM) to target quality using FFmpeg.

Key features:
- Scans all website directories for video files
- Skips already-optimized videos at target quality
- Uses H.264 codec with configurable CRF (Constant Rate Factor)
- Scales to maximum resolution if needed
- Only replaces originals if compression provides meaningful savings
- Idempotent - safe to run multiple times

Target locations:
- src/blogs/**/res/ (blog demonstration videos)
- src/resources/videos/ (general video files)
- src/bio/res/ (bio-related videos)

Usage:
    python scripts/compress_video.py
"""

import os
import sys
from pathlib import Path
import subprocess
import tempfile
import json

# ----------------------------- CONFIG -----------------------------
TARGET_CRF = 23              # Constant Rate Factor: 0 = lossless, 51 = worst (18-28 is good)
TARGET_CODEC = 'libx264'     # Video codec (libx264 for H.264)
MAX_WIDTH = 1920             # Maximum video width (0 = no limit)
MAX_HEIGHT = 1080            # Maximum video height (0 = no limit)
TARGET_FPS = 30              # Target framerate (0 = keep original)
MIN_SAVINGS_PERCENT = 10     # Only overwrite if new file is at least this % smaller
CRF_TOLERANCE = 3            # Skip if CRF is within this range of target
# ------------------------------------------------------------------

def get_video_info(video_path):
    """Get video properties using ffprobe."""
    cmd = [
        'ffprobe',
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name,bit_rate,r_frame_rate,pix_fmt',
        '-show_entries', 'format=duration,size,bit_rate',
        '-of', 'json',
        str(video_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            
            info = {}
            
            if 'streams' in data and len(data['streams']) > 0:
                stream = data['streams'][0]
                info['width'] = stream.get('width', 0)
                info['height'] = stream.get('height', 0)
                info['codec'] = stream.get('codec_name', '')
                info['pix_fmt'] = stream.get('pix_fmt', '')
                
                # Parse framerate
                fps_str = stream.get('r_frame_rate', '0/1')
                try:
                    num, denom = fps_str.split('/')
                    info['fps'] = float(num) / float(denom) if float(denom) > 0 else 0
                except:
                    info['fps'] = 0
            
            if 'format' in data:
                info['duration'] = float(data['format'].get('duration', 0))
                info['size'] = int(data['format'].get('size', 0))
                info['bitrate'] = int(data['format'].get('bit_rate', 0))
            
            return info
    except Exception as e:
        print(f"Error getting video info: {e}")
        pass
    
    return None

def needs_compression(video_path, info):
    """Check if video needs compression based on current properties."""
    if info is None:
        return True  # Can't determine, try compressing
    
    # Check if already using target codec
    codec = info.get('codec', '')
    if codec != 'h264':
        return True  # Different codec, needs conversion
    
    # Check resolution
    width = info.get('width', 0)
    height = info.get('height', 0)
    
    if MAX_WIDTH > 0 and width > MAX_WIDTH * 1.1:  # 10% tolerance
        return True
    
    if MAX_HEIGHT > 0 and height > MAX_HEIGHT * 1.1:
        return True
    
    # Check if file size suggests it's already well compressed
    # This is a heuristic - well compressed H.264 video typically has
    # bitrate around 2-5 Mbps for 1080p content
    duration = info.get('duration', 0)
    file_size = info.get('size', 0)
    
    if duration > 0 and file_size > 0:
        pixels = width * height
        # Calculate bytes per pixel per second
        bpps = file_size / (pixels * duration)
        
        # Well compressed video typically has < 0.05 bytes per pixel per second
        # at 1080p with H.264
        if bpps < 0.03 and codec == 'h264':
            return False  # Already well compressed
    
    return True

def compress_video(video_path):
    """Compress video and return temp file path with compressed version."""
    original_size = video_path.stat().st_size
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        temp_path = Path(tmp.name)
    
    # Build FFmpeg command
    cmd = [
        'ffmpeg',
        '-i', str(video_path),
        '-c:v', TARGET_CODEC,
        '-crf', str(TARGET_CRF),
        '-preset', 'medium',  # Encoding speed/quality tradeoff
        '-pix_fmt', 'yuv420p',  # Standard pixel format for compatibility
    ]
    
    # Add resolution scaling if needed
    filters = []
    if MAX_WIDTH > 0 or MAX_HEIGHT > 0:
        scale_filter = f"scale='min({MAX_WIDTH},iw)':'min({MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease"
        filters.append(scale_filter)
    
    # Add framerate filter if specified
    if TARGET_FPS > 0:
        filters.append(f'fps={TARGET_FPS}')
    
    if filters:
        cmd.extend(['-vf', ','.join(filters)])
    
    # Copy audio stream if present, or use AAC
    cmd.extend(['-c:a', 'aac', '-b:a', '128k'])
    
    # Ensure no audio if none present
    cmd.extend(['-map', '0:v:0'])
    
    # Try to map audio stream
    cmd.extend(['-map', '0:a:0?'])
    
    cmd.extend(['-y', str(temp_path)])
    
    # Run FFmpeg
    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    
    if result.returncode != 0:
        print(f"   [FFmpeg error details] {result.stderr[:200]}")
        temp_path.unlink(missing_ok=True)
        return None, original_size
    
    new_size = temp_path.stat().st_size
    return temp_path, new_size

def process_video(video_path):
    """Process a single video file."""
    original_size = video_path.stat().st_size
    
    # Get video info
    info = get_video_info(video_path)
    
    # Display current info
    if info:
        width = info.get('width', 0)
        height = info.get('height', 0)
        codec = info.get('codec', 'unknown')
        fps = info.get('fps', 0)
        duration = info.get('duration', 0)
        bitrate_mbps = info.get('bitrate', 0) / 1_000_000
        
        print(f"   [Current] {video_path.name}")
        print(f"             {width}x{height}, {fps:.1f}fps, {codec}, {bitrate_mbps:.1f}Mbps, {duration:.1f}s")
    else:
        print(f"   [Checking] {video_path.name}")
    
    # Check if compression needed
    if not needs_compression(video_path, info):
        print(f"   [Skipped - already optimized] {video_path.name}")
        return False
    
    # Compress
    print(f"   [Compressing...] {video_path.name}")
    temp_path, new_size = compress_video(video_path)
    
    if temp_path is None:
        print(f"   [FFmpeg error] {video_path.name}")
        return False
    
    # Check if compression provides meaningful savings
    if new_size < original_size * (1 - MIN_SAVINGS_PERCENT / 100):
        savings = (original_size - new_size) / original_size * 100
        print(f"   [Compressed] {video_path.name}")
        print(f"                {original_size//1024//1024} MB → {new_size//1024//1024} MB (-{savings:.1f}%)")
        
        # Replace with .mp4 extension
        new_path = video_path.with_suffix('.mp4')
        temp_path.replace(new_path)
        
        # If original wasn't .mp4, remove it
        if video_path.suffix.lower() != '.mp4':
            video_path.unlink()
        
        return True
    else:
        print(f"   [Skipped - no improvement] {video_path.name}")
        temp_path.unlink()
        return False

def find_all_videos(repo_root):
    """Find all video files in the website directory structure."""
    video_extensions = {'.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv', '.wmv'}
    video_files = []
    
    # Define search paths
    search_paths = [
        repo_root / 'src' / 'blogs',
        repo_root / 'src' / 'resources',
        repo_root / 'src' / 'bio',
    ]
    
    for search_path in search_paths:
        if search_path.exists():
            # Recursively find all video files
            for video_path in search_path.rglob('*'):
                if video_path.is_file() and video_path.suffix.lower() in video_extensions:
                    video_files.append(video_path)
    
    return sorted(video_files)

def check_dependencies():
    """Check if required tools are installed."""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        subprocess.run(['ffprobe', '-version'], capture_output=True, timeout=5)
        return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("\n❌ Error: ffmpeg and ffprobe must be installed and in PATH")
        print("   Install from: https://ffmpeg.org/download.html")
        return False

def main():
    print("\n" + "=" * 80)
    print("🎬 COMPREHENSIVE VIDEO COMPRESSION")
    print("=" * 80)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Get repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    print(f"\nRepository: {repo_root}")
    print(f"Target codec: {TARGET_CODEC}")
    print(f"Target CRF: {TARGET_CRF} (lower = better quality)")
    if MAX_WIDTH > 0 or MAX_HEIGHT > 0:
        print(f"Max resolution: {MAX_WIDTH}x{MAX_HEIGHT}")
    if TARGET_FPS > 0:
        print(f"Target FPS: {TARGET_FPS}")
    print()
    
    # Find all video files
    print("🔍 Scanning for video files...")
    video_files = find_all_videos(repo_root)
    
    if not video_files:
        print("   No video files found.")
        return
    
    print(f"   Found {len(video_files)} video file(s)\n")
    
    # Group by directory for organized output
    videos_by_dir = {}
    for video in video_files:
        dir_path = video.parent
        if dir_path not in videos_by_dir:
            videos_by_dir[dir_path] = []
        videos_by_dir[dir_path].append(video)
    
    # Process each directory
    total_compressed = 0
    total_skipped = 0
    
    for dir_path in sorted(videos_by_dir.keys()):
        rel_path = dir_path.relative_to(repo_root)
        print(f"\n📂 {rel_path}/")
        print("-" * 80)
        
        for video_path in sorted(videos_by_dir[dir_path]):
            if process_video(video_path):
                total_compressed += 1
            else:
                total_skipped += 1
            print()  # Empty line between videos
    
    # Summary
    print("=" * 80)
    print(f"✅ COMPRESSION COMPLETE")
    print(f"   Compressed: {total_compressed}")
    print(f"   Skipped: {total_skipped}")
    print(f"   Total: {len(video_files)}")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
