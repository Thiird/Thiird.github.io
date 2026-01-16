"""
================================================================================
MASTER WEBSITE UPDATE SCRIPT
================================================================================

PURPOSE:
    Orchestrate all website maintenance tasks in the correct order to prepare
    the website for deployment. This is the main entry point for updating all
    website content, compressing media, and generating necessary metadata files.

WHAT IT DOES:
    Runs all necessary maintenance scripts in the correct sequence:
    
    1. COMPRESS IMAGES (compress_all_website_images.py)
       - Compresses all JPG/PNG images across the entire site
       - Optimizes file sizes while maintaining quality
       - Skips already-optimized images
    
    2. COMPRESS AUDIO (compress_all_audio_files.py)
       - Compresses all audio files to target bitrate (64kbps)
       - Adds fade-in/fade-out effects
       - Clamps duration to 60 seconds maximum
       - Converts all audio to MP3 format
    
    3. GENERATE CONTENT MANIFESTS (generate_content_manifests.py)
       - Scans blogs and poems directories
       - Generates blogs_manifest.json
       - Generates poems_manifest.json
       - Extracts titles, dates, and metadata
    
    4. GENERATE OVERVIEW MANIFEST (generate_overview_manifest.py)
       - Scans overview image directory
       - Generates overview_manifest.json
       - Lists all showcase images
    
    5. UPDATE SITE HISTORY (update_site_history.py)
       - Reads all manifests
       - Generates history.json with 5 most recent updates
       - Displays on homepage

EXECUTION ORDER:
    The order is important because:
    - Media must be compressed before manifests are generated
    - Manifests must exist before history can be updated
    - All changes should be complete before deployment

BEHAVIOR:
    - SEQUENTIAL: Runs one script at a time
    - PROGRESS TRACKING: Shows status of each step
    - ERROR HANDLING: Continues even if one step fails
    - SUMMARY REPORT: Shows final results for all steps
    - EXIT CODE: Returns 0 if all succeed, 1 if any fail

IDEMPOTENCY:
    All compression scripts are idempotent, meaning:
    - Safe to run multiple times
    - Skip already-optimized files
    - Only process files that need updating
    - No degradation from repeated runs

SCRIPT INVOCATION:
    Each script is run as a subprocess with:
    - Current working directory: Repository root
    - Output: Displayed in real-time
    - Error handling: Captures exit codes
    - Isolation: Each script runs independently

DEPENDENCIES:
    - Python 3.6+
    - All individual maintenance scripts must exist
    - ffmpeg/ffprobe (for compression scripts)

USAGE:
    python scripts/update_website.py

OUTPUT:
    Shows progress for each step with status indicators:
    
    Website Update Script
    ----------------------------------------
    
    Running: Compressing all images
      [... output from compress_all_website_images.py ...]
      Completed: Compressing all images
    
    Running: Compressing all audio files
      [... output from compress_all_audio_files.py ...]
      Completed: Compressing all audio files
    
    Running: Generating content manifests
      [... output from generate_content_manifests.py ...]
      Completed: Generating content manifests
    
    Running: Generating overview manifest
      [... output from generate_overview_manifest.py ...]
      Completed: Generating overview manifest
    
    Running: Updating site history
      [... output from update_site_history.py ...]
      Completed: Updating site history
    
    Summary:
    ----------------------------------------
      PASS: Images
      PASS: Audio
      PASS: Manifests
      PASS: Overview
      PASS: History
    
    All updates completed (5/5)

ERROR HANDLING:
    If a script fails:
    - Prints "Failed: <description> (exit code X)"
    - Continues with remaining scripts
    - Reports failure in final summary
    - Returns exit code 1

WHEN TO RUN:
    Run this script:
    - Before deploying website updates
    - After adding new blogs or poems
    - After adding new images to overview
    - After modifying any content
    - To optimize all media files

WHAT IT DOESN'T DO:
    This script does NOT:
    - Deploy the website (separate process)
    - Create backups (make backups separately)
    - Modify source markdown files
    - Delete any files (only optimizes)

TYPICAL WORKFLOW:
    1. Add new content (blogs, poems, images)
    2. Run this script to process everything
    3. Review changes with git diff
    4. Commit and push to deploy

TIME ESTIMATE:
    - Small changes: 10-30 seconds
    - Full site update: 1-5 minutes
    - Depends on amount of new/modified media

DIRECTORY STRUCTURE:
    Repository root/
    ├── scripts/
    │   ├── update_website.py (this script)
    │   ├── compress_all_website_images.py
    │   ├── compress_all_audio_files.py
    │   ├── generate_content_manifests.py
    │   ├── generate_overview_manifest.py
    │   └── update_site_history.py
    └── src/
        ├── blogs/
        ├── poems/
        └── resources/

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
"""

import sys
import subprocess
from pathlib import Path
import os

def run_script(script_name, description):
    """Run a Python script and report results."""
    print(f"Running: {description}")
    
    script_path = Path(__file__).parent / script_name
    
    if not script_path.exists():
        print(f"  Warning: {script_name} not found, skipping")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=Path(__file__).parent.parent,
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print(f"  Completed: {description}")
            return True
        else:
            print(f"  Failed: {description} (exit code {result.returncode})")
            return False
            
    except Exception as e:
        print(f"  Error: {description} - {e}")
        return False

def main():
    print("\nWebsite Update Script")
    print("-" * 40)
    
    results = {}
    
    # Step 1: Compress all images
    results['images'] = run_script('compress_all_website_images.py', 'Compressing all images')
    
    # Step 2: Compress all audio files
    results['audio'] = run_script('compress_all_audio_files.py', 'Compressing all audio files')
    
    # Step 3: Generate manifests (blogs and poems)
    results['manifests'] = run_script('generate_content_manifests.py', 'Generating content manifests')
    
    # Step 4: Generate overview image manifest
    results['overview'] = run_script('generate_overview_manifest.py', 'Generating overview manifest')
    
    # Step 5: Update history
    results['history'] = run_script('update_site_history.py', 'Updating site history')
    
    # Summary
    print("\nSummary:")
    print("-" * 40)
    
    success_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    
    for step, success in results.items():
        status = "PASS" if success else "FAIL"
        print(f"  {status}: {step.capitalize()}")
    
    if success_count == total_count:
        print(f"\nAll updates completed ({success_count}/{total_count})")
    else:
        print(f"\nSome updates failed ({success_count}/{total_count} successful)")
    print()
    
    # Exit with error code if any step failed
    sys.exit(0 if success_count == total_count else 1)

if __name__ == "__main__":
    main()
