"""
Comprehensive audio compression script for the entire website.
Compresses all audio files (MP3, WAV, OGG, FLAC) to target bitrate using FFmpeg.

Key features:
- Scans all website directories for audio files
- Skips already-optimized audio at target bitrate
- Applies fade in/out effects (3 seconds)
- Clamps duration to maximum length (60 seconds default)
- Only replaces originals if compression provides meaningful savings
- Idempotent - safe to run multiple times

Target locations:
- src/poems/** (audio tracks for poems)
- src/bio/res/ (background music)
- src/resources/audio/ (general audio files)
- src/blogs/**/res/ (blog-related audio)

Usage:
    python scripts/compress_audio.py
"""

import os
import sys
from pathlib import Path
import subprocess
import tempfile
import json

# ----------------------------- CONFIG -----------------------------
TARGET_BITRATE = '64k'       # Target audio bitrate (64k is good for voice/music)
MAX_DURATION = 60            # Maximum duration in seconds (0 = no limit)
FADE_IN_DURATION = 3         # Fade in duration in seconds
FADE_OUT_DURATION = 3        # Fade out duration in seconds
MIN_SAVINGS_PERCENT = 5      # Only overwrite if new file is at least this % smaller
BITRATE_TOLERANCE_PERCENT = 10  # Skip if within 10% of target bitrate
# ------------------------------------------------------------------

def get_audio_info(audio_path):
    """Get audio bitrate, duration, and format using ffprobe."""
    cmd = [
        'ffprobe',
        '-v', 'error',
        '-select_streams', 'a:0',
        '-show_entries', 'stream=bit_rate,duration,codec_name',
        '-show_entries', 'format=duration,bit_rate',
        '-of', 'json',
        str(audio_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            
            # Try to get bitrate from stream first, then format
            bitrate = None
            duration = None
            codec = None
            
            if 'streams' in data and len(data['streams']) > 0:
                stream = data['streams'][0]
                bitrate = stream.get('bit_rate')
                duration = stream.get('duration')
                codec = stream.get('codec_name')
            
            if 'format' in data:
                if bitrate is None:
                    bitrate = data['format'].get('bit_rate')
                if duration is None:
                    duration = data['format'].get('duration')
            
            # Convert to appropriate types
            bitrate = int(bitrate) if bitrate else None
            duration = float(duration) if duration else None
            
            return {
                'bitrate': bitrate,
                'duration': duration,
                'codec': codec
            }
    except Exception:
        pass
    
    return None

def parse_bitrate(bitrate_str):
    """Parse bitrate string like '64k' to bits per second."""
    bitrate_str = bitrate_str.lower()
    if bitrate_str.endswith('k'):
        return int(bitrate_str[:-1]) * 1000
    elif bitrate_str.endswith('m'):
        return int(bitrate_str[:-1]) * 1000000
    else:
        return int(bitrate_str)

def needs_compression(audio_path, info):
    """Check if audio needs compression based on current properties."""
    if info is None:
        return True  # Can't determine, try compressing
    
    current_bitrate = info.get('bitrate')
    current_duration = info.get('duration')
    
    # Check if bitrate is already at or below target (within tolerance)
    if current_bitrate:
        target_bps = parse_bitrate(TARGET_BITRATE)
        tolerance = target_bps * BITRATE_TOLERANCE_PERCENT / 100
        
        if current_bitrate <= target_bps + tolerance:
            # Already at target bitrate
            if MAX_DURATION == 0 or (current_duration and current_duration <= MAX_DURATION + 1):
                # Duration is also fine
                return False
    
    return True

def compress_audio(audio_path):
    """Compress audio and return temp file path with compressed version."""
    original_size = audio_path.stat().st_size
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
        temp_path = Path(tmp.name)
    
    # Build FFmpeg command
    cmd = [
        'ffmpeg',
        '-i', str(audio_path),
        '-map', '0:a',  # Map audio stream
        '-b:a', TARGET_BITRATE,
        '-vn',  # No video
    ]
    
    # Add duration limit if specified
    if MAX_DURATION > 0:
        cmd.extend(['-t', str(MAX_DURATION)])
    
    # Add fade effects
    if FADE_IN_DURATION > 0 or FADE_OUT_DURATION > 0:
        filters = []
        if FADE_IN_DURATION > 0:
            filters.append(f'afade=t=in:ss=0:d={FADE_IN_DURATION}')
        if FADE_OUT_DURATION > 0:
            # Fade out starts at (duration - fade_out_duration)
            fade_out_start = MAX_DURATION - FADE_OUT_DURATION if MAX_DURATION > 0 else 57
            filters.append(f'afade=t=out:st={fade_out_start}:d={FADE_OUT_DURATION}')
        
        if filters:
            cmd.extend(['-af', ','.join(filters)])
    
    cmd.extend(['-y', str(temp_path)])
    
    # Run FFmpeg
    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if result.returncode != 0:
        temp_path.unlink(missing_ok=True)
        return None, original_size
    
    new_size = temp_path.stat().st_size
    return temp_path, new_size

def process_audio(audio_path):
    """Process a single audio file."""
    original_size = audio_path.stat().st_size
    
    # Get audio info
    info = get_audio_info(audio_path)
    
    # Display current info
    if info:
        bitrate_kb = info['bitrate'] // 1000 if info['bitrate'] else 0
        duration = info['duration'] if info['duration'] else 0
        codec = info['codec'] if info['codec'] else 'unknown'
        print(f"   [Current] {audio_path.name} | {bitrate_kb}kbps, {duration:.1f}s, {codec}")
    else:
        print(f"   [Checking] {audio_path.name}")
    
    # Check if compression needed
    if not needs_compression(audio_path, info):
        print(f"   [Skipped - already optimized] {audio_path.name}")
        return False
    
    # Compress
    temp_path, new_size = compress_audio(audio_path)
    
    if temp_path is None:
        print(f"   [FFmpeg error] {audio_path.name}")
        return False
    
    # Check if compression provides meaningful savings or if it's a format conversion
    if new_size < original_size * (1 - MIN_SAVINGS_PERCENT / 100) or info.get('codec') != 'mp3':
        if new_size < original_size:
            savings = (original_size - new_size) / original_size * 100
            print(f"   [Compressed] {audio_path.name} | {original_size//1024} KB → {new_size//1024} KB (-{savings:.1f}%)")
        else:
            print(f"   [Converted] {audio_path.name} | {original_size//1024} KB → {new_size//1024} KB")
        temp_path.replace(audio_path.with_suffix('.mp3'))  # Ensure .mp3 extension
        
        # If original wasn't .mp3, remove it
        if audio_path.suffix.lower() != '.mp3':
            audio_path.unlink()
        
        return True
    else:
        print(f"   [Skipped - no improvement] {audio_path.name}")
        temp_path.unlink()
        return False

def find_all_audio(repo_root):
    """Find all audio files in the website directory structure."""
    audio_extensions = {'.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'}
    audio_files = []
    
    # Define search paths
    search_paths = [
        repo_root / 'src' / 'poems',
        repo_root / 'src' / 'bio',
        repo_root / 'src' / 'resources' / 'audio',
        repo_root / 'src' / 'blogs',
    ]
    
    for search_path in search_paths:
        if search_path.exists():
            # Recursively find all audio files
            for audio_path in search_path.rglob('*'):
                if audio_path.is_file() and audio_path.suffix.lower() in audio_extensions:
                    audio_files.append(audio_path)
    
    return sorted(audio_files)

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
    print("\nAudio Compression")
    print("-" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Get repository root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    print(f"\nRepository: {repo_root}")
    print(f"Target bitrate: {TARGET_BITRATE}")
    if MAX_DURATION > 0:
        print(f"Max duration: {MAX_DURATION} seconds")
    if FADE_IN_DURATION > 0 or FADE_OUT_DURATION > 0:
        print(f"Fade effects: {FADE_IN_DURATION}s in, {FADE_OUT_DURATION}s out")
    print()
    
    # Find all audio files
    print("Scanning for audio files...")
    audio_files = find_all_audio(repo_root)
    
    if not audio_files:
        print("   No audio files found.")
        return
    
    print(f"   Found {len(audio_files)} audio file(s)\n")
    
    # Group by directory for organized output
    audio_by_dir = {}
    for audio in audio_files:
        dir_path = audio.parent
        if dir_path not in audio_by_dir:
            audio_by_dir[dir_path] = []
        audio_by_dir[dir_path].append(audio)
    
    # Process each directory
    total_compressed = 0
    total_skipped = 0
    
    for dir_path in sorted(audio_by_dir.keys()):
        rel_path = dir_path.relative_to(repo_root)
        print(f"\n{rel_path}/")
        print("-" * 40)
        
        for audio_path in sorted(audio_by_dir[dir_path]):
            if process_audio(audio_path):
                total_compressed += 1
            else:
                total_skipped += 1
    
    # Summary
    print(f"\nCompressed: {total_compressed}, Skipped: {total_skipped}, Total: {len(audio_files)}\n")

if __name__ == "__main__":
    main()
