"""
Process MP3 audio files: convert to 128kbps bitrate, add fade in/out effects,
and clamp duration to 60 seconds maximum using ffmpeg.
"""

import os
import subprocess
import shutil

# 🔧 Change this to adjust the working folder
WORKING_SUBFOLDER = "../poems"

def check_ffmpeg():
    """Check if ffmpeg is available on the system."""
    if shutil.which("ffmpeg") is None:
        print("❌ Error: ffmpeg is not installed or not in PATH.")
        input("Press Enter to exit...")
        exit(1)

def process_mp3_files():
    # Build the target directory path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(current_dir, WORKING_SUBFOLDER)

    if not os.path.exists(target_dir):
        print(f"❌ Error: Directory '{target_dir}' does not exist.")
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

    print("\n✅ All files processed successfully!")
    input("Press Enter to exit...")

if __name__ == "__main__":
    check_ffmpeg()
    process_mp3_files()
