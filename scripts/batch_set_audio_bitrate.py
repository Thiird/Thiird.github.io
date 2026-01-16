"""
================================================================================
BATCH SET AUDIO BITRATE (MANUAL PROCESSING TOOL)
================================================================================

PURPOSE:
    Manually process MP3 audio files in a specific folder by converting them
    to a fixed bitrate (64kbps), adding fade effects, and clamping duration.
    This is a utility script for one-off batch processing tasks.

WHAT IT DOES:
    1. Targets a specific folder (configurable in code)
    2. Processes all MP3 files in that folder
    3. Converts to 64kbps bitrate
    4. Adds 3-second fade-in effect
    5. Adds 3-second fade-out effect (starting at 57 seconds)
    6. Clamps duration to maximum 60 seconds
    7. Replaces original files with processed versions

CONFIGURATION:
    WORKING_SUBFOLDER = "../poems"    # Target folder (relative to script)
    
    Fixed settings:
      - Bitrate: 64kbps (good for voice/music)
      - Max duration: 60 seconds
      - Fade in: 3 seconds (starts at 0s)
      - Fade out: 3 seconds (starts at 57s)

FFMPEG COMMAND BREAKDOWN:
    ffmpeg -y -i input.mp3
      -t 60                    # Clamp to 60 seconds
      -af "afade=t=in:ss=0:d=3,afade=t=out:st=57:d=3"  # Fades
      -map 0:a                 # Map audio stream
      -b:a 64k                 # Set bitrate to 64kbps
      -vn                      # No video
      output.mp3

BEHAVIOR:
    - DESTRUCTIVE: Replaces original files (creates temp then overwrites)
    - REQUIRES CONFIRMATION: Waits for user to press Enter
    - MP3 ONLY: Only processes .mp3 files
    - BATCH PROCESSING: Processes all MP3s in target folder

WORKFLOW:
    1. Script checks for ffmpeg availability
    2. Checks if target directory exists
    3. For each MP3 file:
       a. Creates processed_<filename>.mp3 with ffmpeg
       b. Deletes original file
       c. Renames processed file to original name
    4. Prints success message
    5. Waits for user to press Enter before exiting

DEPENDENCIES:
    - ffmpeg (must be installed and in PATH)
    - Python 3.6+

USAGE:
    1. Edit WORKING_SUBFOLDER in the script to point to target folder
    2. Run: python scripts/batch_set_audio_bitrate.py
    3. Press Enter when complete

OUTPUT:
    Processing track1.mp3 ...
    Processing track2.mp3 ...
    Processing track3.mp3 ...
    
    All files processed successfully!
    Press Enter to exit...

ERROR HANDLING:
    - If ffmpeg not found: Prints error and waits for Enter
    - If directory not found: Prints error and waits for Enter
    - If ffmpeg command fails: Raises exception (check=True)

WARNING:
    This script PERMANENTLY REPLACES original files. There is no undo.
    Make sure you have backups before running this script.

USE CASE:
    This is a manual utility script for one-off batch processing tasks.
    For automated site-wide audio compression, use compress_all_audio_files.py
    instead, which has smarter detection and skipping logic.

DIFFERENCE FROM compress_all_audio_files.py:
    - Manual vs Automated: Requires folder configuration
    - No skipping: Processes all files regardless of current state
    - Simpler: No bitrate detection or smart skipping
    - Fixed settings: No configurable parameters in script
    - Interactive: Waits for user input

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
"""

import os
import subprocess
import shutil

# Change this to adjust the working folder
WORKING_SUBFOLDER = "../poems"

def check_ffmpeg():
    """Check if ffmpeg is available on the system."""
    if shutil.which("ffmpeg") is None:
        print("Error: ffmpeg is not installed or not in PATH.")
        input("Press Enter to exit...")
        exit(1)

def process_mp3_files():
    # Build the target directory path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(current_dir, WORKING_SUBFOLDER)

    if not os.path.exists(target_dir):
        print(f"Error: Directory '{target_dir}' does not exist.")
        input("Press Enter to exit...")
        exit(1)

    for file_name in os.listdir(target_dir):
        if file_name.lower().endswith(".mp3"):
            input_path = os.path.join(target_dir, file_name)
            output_path = os.path.join(target_dir, f"processed_{file_name}")

            # FFmpeg command with fade in/out and clamp to 60s
            command = [
                "ffmpeg",
                "-y",
                "-i", input_path,
                "-t", "60",  # clamp to 1 minute
                "-af", "afade=t=in:ss=0:d=3,afade=t=out:st=57:d=3",  # fade in/out
                "-map", "0:a",
                "-b:a", "64k",
                "-vn",
                output_path
            ]

            print(f"Processing {file_name} ...")
            subprocess.run(command, check=True)

            # Remove original file
            os.remove(input_path)

            # Rename processed file back to original name
            os.rename(output_path, input_path)

    print("\nAll files processed successfully!")
    input("Press Enter to exit...")

if __name__ == "__main__":
    check_ffmpeg()
    process_mp3_files()
