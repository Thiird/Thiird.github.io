"""
================================================================================
GENERATE CONTENT MANIFESTS (BLOGS & POEMS)
================================================================================

PURPOSE:
    Generate manifest JSON files for all blogs and poems by scanning their
    directories. These manifests are used by the website to display content
    listings and navigation.

WHAT IT DOES:
    1. Scans src/blogs/ directory for all blog folders
    2. Scans src/poems/ directory for all poem folders
    3. Extracts metadata from each content folder:
       - Folder name and number
       - Title/name (formatted from folder name)
       - Date (from markdown file)
       - Audio file (for poems only)
    4. Generates two manifest files:
       - src/blogs/blogs_manifest.json
       - src/poems/poems_manifest.json

MANIFEST STRUCTURE (Blogs):
    [
      {
        "folder": "0_optical_mouse",
        "title": "0 - Optical Mouse",
        "date": "2024-12-15"
      },
      ...
    ]

MANIFEST STRUCTURE (Poems):
    [
      {
        "folder": "5_letter_to_a_faded_friend",
        "name": "5 - Letter To A Faded Friend",
        "audio": "track.mp3",
        "date": "2024-11-20"
      },
      ...
    ]

DATE EXTRACTION:
    Looks for "date: YYYY-MM-DD" or "date: YYYY-MM" line in markdown files.
    Supports both full dates (YYYY-MM-DD) and partial dates (YYYY-MM).
    Entries without dates use empty string and are reported as warnings.

FOLDER NAMING CONVENTION:
    Folders should be named: "<number>_<title_with_underscores>"
    Examples:
      - 0_optical_mouse
      - 5_letter_to_a_faded_friend
    
    The script will:
    - Extract the number prefix
    - Convert underscores to spaces
    - Title-case each word
    - Format as "<number> - <Title>"

SORTING:
    Manifests are sorted by folder number in REVERSE order
    (highest number first), so that:
    - Index 0 in the manifest = lowest numbered folder
    - This allows newest content to be added with higher numbers

BEHAVIOR:
    - OVERWRITES: Existing manifest files are completely replaced
    - VALIDATION: Skips folders without required markdown files
    - WARNING OUTPUT: Reports missing dates or markdown files

DEPENDENCIES:
    - Python 3.6+
    - No external dependencies

USAGE:
    python scripts/generate_content_manifests.py

OUTPUT:
    Prints detailed progress for both blogs and poems:
    - Scanning directory path
    - Each found entry with title and date
    - Warnings for missing files or dates
    - Final manifest location and count

EXAMPLE OUTPUT:
    Manifest Generation
    ----------------------------------------
    
    Generating Blogs Manifest
    ----------------------------------------
    Scanning: /path/to/src/blogs
      0_optical_mouse - 0 - Optical Mouse (2024-12-15)
      1_embedded_systems_overview - 1 - Embedded Systems Overview (2024-12-10)
    
    Saved manifest with 2 blog(s)
    Location: /path/to/src/blogs/blogs_manifest.json
    
    Generating Poems Manifest
    ----------------------------------------
    Scanning: /path/to/src/poems
      5_letter_to_a_faded_friend - 5 - Letter To A Faded Friend (track.mp3) (2024-11-20)
    
    Saved manifest with 1 poem(s)
    Location: /path/to/src/poems/poems_manifest.json
    
    All manifests generated successfully

FILE REQUIREMENTS:
    Blogs: Must have blog.md file in each folder
    Poems: Must have poem.md file in each folder

NOTES:
    - Manifest files are used by the website JavaScript to load content
    - Date format in markdown must be: "date: YYYY-MM-DD" or "date: YYYY-MM"
    - Audio detection looks for any .mp3 file in poem folders
    - Missing dates result in empty string (not null)

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
"""

import json
import os
from pathlib import Path
from datetime import datetime
import re

def get_repo_root():
    """Get the repository root directory."""
    script_dir = Path(__file__).parent
    return script_dir.parent

def extract_date_from_markdown(md_path):
    """Extract date from simple 'date: YYYY-MM-DD' or 'date: YYYY-MM' line (no YAML markers)."""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for simple "date: YYYY-MM-DD" or "date: YYYY-MM" line at start of file
        date_match = re.search(r'^date:\s*(\d{4}-\d{2}(?:-\d{2})?)\s*$', content, re.MULTILINE)
        if date_match:
            return date_match.group(1)
            
    except Exception as e:
        print(f"  Warning: Error reading date from {md_path}: {e}")
    
    # Return empty string if no date found
    return ""

def format_date(date_string):
    """Format date from YYYY-MM-DD to readable format (e.g., 'Jan 15, 2024')."""
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        return date_obj.strftime('%b %d, %Y')
    except:
        return date_string

def parse_date_for_sorting(date_string):
    """Parse date string for sorting. Handles both YYYY-MM-DD and YYYY-MM formats.
    Returns a datetime object, using first day of month for partial dates."""
    if not date_string:
        return datetime(1970, 1, 1)  # Epoch for entries without dates
    try:
        parts = date_string.split('-')
        if len(parts) == 2:
            # Partial date: YYYY-MM -> treat as first day of month
            return datetime.strptime(date_string + '-01', '%Y-%m-%d')
        elif len(parts) == 3:
            # Full date: YYYY-MM-DD
            return datetime.strptime(date_string, '%Y-%m-%d')
        else:
            return datetime(1970, 1, 1)
    except ValueError:
        return datetime(1970, 1, 1)

def make_blog_manifest():
    """Generate blogs_manifest.json from blog folders."""
    print("\nGenerating Blogs Manifest")
    print("-" * 40)
    
    repo_root = get_repo_root()
    blogs_dir = repo_root / 'src' / 'blogs'
    
    if not blogs_dir.exists():
        print(f"Error: Blogs directory not found: {blogs_dir}")
        return False
    
    print(f"Scanning: {blogs_dir}")
    
    blogs = []
    
    for folder in sorted(blogs_dir.iterdir()):
        if not folder.is_dir():
            continue
        
        blog_file = folder / 'blog.md'
        
        if not blog_file.exists():
            print(f"  Skipping {folder.name}: blog.md not found")
            continue
        
        # Extract date from markdown
        date = extract_date_from_markdown(blog_file)
        if not date:
            print(f"  No date found in {folder.name}/blog.md, using empty date")
            date = ""
        
        # Do NOT add formatted date to markdown file anymore
        
        # Extract title from folder name with proper spacing
        folder_name = folder.name
        title = folder_name
        if folder_name[0].isdigit():
            parts = folder_name.split('.', 1)
            if len(parts) > 1:
                title = parts[1].strip()
        
        # Replace underscores with spaces: "1_optical_mouse" → "1 optical mouse"
        title = title.replace('_', ' ')
        # Add spacing around number: "1 optical" → "1 - optical"
        title = re.sub(r'^(\d+)\s+', r'\1 - ', title)
        # Capitalize each word
        title = title.title()
        
        blog_entry = {
            'folder': folder.name,
            'title': title,
            'date': date
        }
        
        blogs.append(blog_entry)
        print(f"  {folder.name} - {title} ({date})")
    
    # Sort by folder number (highest first, so lowest gets index 0 at bottom)
    blogs.sort(key=lambda x: int(re.match(r'^(\d+)', x['folder']).group(1)) if re.match(r'^(\d+)', x['folder']) else 9999, reverse=True)
    
    manifest_path = blogs_dir / 'blogs_manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved manifest with {len(blogs)} blog(s)")
    print(f"Location: {manifest_path}")
    
    return True

def make_poem_manifest():
    """Generate poems_manifest.json from poem folders."""
    print("\nGenerating Poems Manifest")
    print("-" * 40)
    
    repo_root = get_repo_root()
    poems_dir = repo_root / 'src' / 'poems'
    
    if not poems_dir.exists():
        print(f"Error: Poems directory not found: {poems_dir}")
        return False
    
    print(f"Scanning: {poems_dir}")
    
    poems = []
    
    for folder in sorted(poems_dir.iterdir()):
        if not folder.is_dir():
            continue
        
        poem_file = folder / 'poem.md'
        
        if not poem_file.exists():
            print(f"  Skipping {folder.name}: poem.md not found")
            continue
        
        # Extract date from markdown
        date = extract_date_from_markdown(poem_file)
        if not date:
            print(f"  No date found in {folder.name}/poem.md, using empty date")
            date = ""
        
        # Do NOT add formatted date to markdown file anymore
        
        # Check for audio file
        audio_file = None
        for file in folder.iterdir():
            if file.suffix.lower() == '.mp3':
                audio_file = file.name
                break
        
        # Extract name from folder with proper spacing
        folder_name = folder.name
        name = folder_name
        if folder_name[0].isdigit():
            parts = folder_name.split('.', 1)
            if len(parts) > 1:
                name = parts[1].strip()
        
        # Replace underscores and dashes with spaces
        name = name.replace('_', ' ').replace('-', ' ')
        # Add spacing around number: "1 intro" → "1 - intro"
        name = re.sub(r'^(\d+)\s+', r'\1 - ', name)
        # Capitalize each word
        name = name.title()
        
        poem_entry = {
            'folder': folder.name,
            'name': name,
            'audio': audio_file,
            'date': date
        }
        
        poems.append(poem_entry)
        audio_str = f" ({audio_file})" if audio_file else ""
        print(f"  {folder.name} - {name}{audio_str} ({date})")
    
    # Sort by folder number (highest first, so lowest gets index 0 at bottom)
    poems.sort(key=lambda x: int(re.match(r'^(\d+)', x['folder']).group(1)) if re.match(r'^(\d+)', x['folder']) else 9999, reverse=True)
    
    manifest_path = poems_dir / 'poems_manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(poems, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved manifest with {len(poems)} poem(s)")
    print(f"Location: {manifest_path}")
    
    return True

if __name__ == '__main__':
    print("\nManifest Generation")
    print("-" * 40)
    
    blog_success = make_blog_manifest()
    poem_success = make_poem_manifest()
    
    if blog_success and poem_success:
        print("\nAll manifests generated successfully")
    else:
        print("\nSome manifests failed to generate")
    print()
