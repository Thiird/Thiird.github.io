"""
Master script to update the entire website.
Runs all necessary scripts in the correct order to prepare the website for deployment.

Usage:
    python scripts/update_website.py

This script will:
1. Compress all images to optimized levels
2. Compress all audio files to target bitrate
3. Compress all video files to target quality
4. Generate blog and poem manifests
5. Generate overview image manifest
6. Update history.json with latest content

All compression scripts are idempotent - they skip files already at target compression levels.
"""

import sys
import subprocess
from pathlib import Path
import os

def run_script(script_name, description):
    """Run a Python script and report results."""
    print("\n" + "=" * 80)
    print(f"🔄 {description}")
    print("=" * 80)
    
    script_path = Path(__file__).parent / script_name
    
    if not script_path.exists():
        print(f"⚠️  Warning: {script_name} not found, skipping...")
        return False
    
    try:
        # Run the script and capture output
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=Path(__file__).parent.parent,  # Run from repo root
            capture_output=False,  # Show output in real-time
            text=True
        )
        
        if result.returncode == 0:
            print(f"✅ {description} - COMPLETED")
            return True
        else:
            print(f"❌ {description} - FAILED (exit code {result.returncode})")
            return False
            
    except Exception as e:
        print(f"❌ {description} - ERROR: {e}")
        return False

def main():
    print("\n" + "=" * 80)
    print("🚀 WEBSITE UPDATE SCRIPT")
    print("=" * 80)
    print("\nThis will update all website content and optimize all media files.")
    print("Compression scripts are idempotent - already optimized files will be skipped.")
    
    # Track success of each step
    results = {}
    
    # Step 1: Compress all images
    results['images'] = run_script('compress_images.py', 'Compressing all images')
    
    # Step 2: Compress all audio files
    results['audio'] = run_script('compress_audio.py', 'Compressing all audio files')
    
    # Step 3: Compress all video files
    results['video'] = run_script('compress_video.py', 'Compressing all video files')
    
    # Step 4: Generate manifests (blogs and poems)
    results['manifests'] = run_script('make_manifests.py', 'Generating content manifests')
    
    # Step 5: Generate overview image manifest
    results['overview'] = run_script('generate_overview_manifest.py', 'Generating overview manifest')
    
    # Step 6: Update history
    results['history'] = run_script('update_history.py', 'Updating site history')
    
    # Final summary
    print("\n" + "=" * 80)
    print("📊 UPDATE SUMMARY")
    print("=" * 80)
    
    success_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    
    for step, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {step.capitalize()}")
    
    print("\n" + "=" * 80)
    if success_count == total_count:
        print(f"✅ ALL UPDATES COMPLETED SUCCESSFULLY! ({success_count}/{total_count})")
    else:
        print(f"⚠️  SOME UPDATES FAILED ({success_count}/{total_count} successful)")
    print("=" * 80 + "\n")
    
    # Exit with error code if any step failed
    sys.exit(0 if success_count == total_count else 1)

if __name__ == "__main__":
    main()
