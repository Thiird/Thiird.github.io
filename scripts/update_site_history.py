"""
================================================================================
UPDATE SITE HISTORY
================================================================================

PURPOSE:
    Update the site history by scanning all content manifests (poems, blogs)
    and generating a chronological history.json file with the 5 most recent
    updates. This history is displayed on the website homepage.

WHAT IT DOES:
    1. Reads src/blogs/blogs_manifest.json
    2. Reads src/poems/poems_manifest.json
    3. Extracts all entries that have dates
    4. Combines and sorts all entries by date (most recent first)
    5. Takes the 5 most recent entries
    6. Writes to src/resources/history.json

HISTORY ENTRY STRUCTURE:
    [
      {
        "type": "blog",
        "name": "Optical Mouse",
        "date": "2024-12-15",
        "link": "src/blogs.html?blog=0"
      },
      {
        "type": "poem",
        "name": "Letter To A Faded Friend",
        "date": "2024-11-20",
        "link": "src/poems.html?poem=5"
      },
      ...
    ]

DATE HANDLING:
    - Supports both full dates (YYYY-MM-DD) and partial dates (YYYY-MM)
    - Partial dates are treated as first day of month for sorting
    - Entries without dates are skipped (not included in history)
    - Dates are sorted in descending order (newest first)

NAME PROCESSING:
    - Removes leading number prefixes (e.g., "5 - Title" → "Title")
    - Uses clean names without folder numbering
    - Preserves proper title casing from manifests

LINK GENERATION:
    - Blog links: src/blogs.html?blog=<folder_number>
    - Poem links: src/poems.html?poem=<folder_number>
    - Folder numbers extracted from manifest folder names

MAXIMUM ENTRIES:
    - History is limited to 5 most recent entries
    - Older entries are automatically trimmed
    - This keeps the homepage history section concise

DEPENDENCIES:
    - Python 3.6+
    - Requires existing manifest files:
      - src/blogs/blogs_manifest.json
      - src/poems/poems_manifest.json

USAGE:
    python scripts/update_site_history.py

OUTPUT:
    Prints detailed progress:
    - Manifest reading status
    - Number of entries found in each manifest
    - List of entries being processed
    - Warnings for entries without dates
    - Final sorted history (5 entries)
    - Most recent and oldest entries in final history

EXAMPLE OUTPUT:
    History Update Script
    ----------------------------------------
    
    Updating History
    ----------------------------------------
    
    Repository root: /path/to/Thiird.github.io
    Blogs directory: /path/to/src/blogs
    Poems directory: /path/to/src/poems
    History file: /path/to/src/resources/history.json
    
    Reading blogs manifest...
      Path: /path/to/src/blogs/blogs_manifest.json
      Found 2 blog(s) in manifest
        • [0] Optical Mouse
          Date: 2024-12-15
          Link: src/blogs.html?blog=0
    
    Added 2 blog entries
    
    Reading poems manifest...
      Path: /path/to/src/poems/poems_manifest.json
      Found 6 poem(s) in manifest
        • [5] Letter To A Faded Friend
          Date: 2024-11-20
          Link: src/poems.html?poem=5
    
    Added 6 poem entries
    
    Total entries collected: 8
    
    Sorting entries by date (most recent first)...
    Trimmed to last 5 entries
    
    Final history entries (last 5):
      1. [BLOG] Optical Mouse
         Date: 2024-12-15 | Link: src/blogs.html?blog=0
      2. [POEM] Letter To A Faded Friend
         Date: 2024-11-20 | Link: src/poems.html?poem=5
      ...
    
    Ensured resources directory exists: /path/to/src/resources
    
    Saving to history.json...
      Successfully saved /path/to/src/resources/history.json
    
    Successfully updated history.json with 5 entries
    Most recent entry: Optical Mouse (2024-12-15)
    Oldest entry: Some Older Entry (2024-01-10)
    
    Update completed successfully

ERROR HANDLING:
    - Missing manifest files: Prints warning, continues with other sources
    - JSON decode errors: Prints error, returns None for that manifest
    - Missing dates: Prints warning, skips that entry
    - No entries found: Prints error, returns False

BEHAVIOR:
    - OVERWRITES: Existing history.json is completely replaced
    - AUTO-CREATE: Creates src/resources/ directory if it doesn't exist
    - VALIDATION: Only includes entries with valid dates
    - SORTED: Entries are chronologically sorted (newest first)

NOTES:
    - This script should be run after generate_content_manifests.py
    - History.json is used by the website homepage JavaScript
    - The 5-entry limit is hardcoded (not configurable)
    - Date parsing handles both full and partial date formats

AUTHOR: Website maintenance scripts
LAST MODIFIED: 2026-01-16
================================================================================
"""

import json
import os
import re
from pathlib import Path
from datetime import datetime

def strip_number_prefix(name):
    """Remove leading 'X - ' prefix from name (e.g., '1 - Title' -> 'Title')."""
    return re.sub(r'^\d+\s*-\s*', '', name)

def get_repo_root():
    """Get the repository root directory."""
    script_dir = Path(__file__).parent
    return script_dir.parent

def load_json(filepath):
    """Load JSON file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"  File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"  JSON decode error in {filepath}: {e}")
        return None
    except Exception as e:
        print(f"  Error loading {filepath}: {e}")
        return None

def save_json(filepath, data):
    """Save JSON file with pretty formatting."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  Successfully saved {filepath}")
        return True
    except Exception as e:
        print(f"  Error saving {filepath}: {e}")
        return False

def parse_date(date_string):
    """Parse date string, handling both YYYY-MM-DD and YYYY-MM formats.
    Returns a datetime object for comparison, using first day of month for partial dates."""
    try:
        parts = date_string.split('-')
        if len(parts) == 2:
            # Partial date: YYYY-MM -> treat as first day of month
            return datetime.strptime(date_string + '-01', '%Y-%m-%d')
        elif len(parts) == 3:
            # Full date: YYYY-MM-DD
            return datetime.strptime(date_string, '%Y-%m-%d')
        else:
            # Invalid format, return epoch
            return datetime(1970, 1, 1)
    except ValueError:
        # If parsing fails, return epoch
        return datetime(1970, 1, 1)

def get_blog_entries(blogs_dir):
    """Extract blog entries from blogs_manifest.json."""
    manifest_path = blogs_dir / 'blogs_manifest.json'
    
    print("\nReading blogs manifest...")
    print(f"  Path: {manifest_path}")
    
    if not manifest_path.exists():
        print("  Blogs manifest not found")
        return []
    
    manifest = load_json(manifest_path)
    if not manifest:
        return []
    
    print(f"  Found {len(manifest)} blog(s) in manifest")
    
    entries = []
    for idx, blog in enumerate(manifest):
        folder = blog.get('folder', '')
        title = blog.get('title', folder.replace('_', ' ').title())
        date = blog.get('date', '')
        
        # Skip entries without dates (empty string)
        if not date:
            print(f"    Skipping [{idx}] {title} - no date")
            continue
        
        # Extract folder number from folder name (e.g., "1_embedded_systems_intro" -> "1")
        folder_match = re.match(r'^(\d+)', folder)
        folder_num = folder_match.group(1) if folder_match else str(idx)
        
        entry = {
            'type': 'blog',
            'name': strip_number_prefix(title),
            'date': date,
            'link': f'src/blogs.html?blog={folder_num}'
        }
        entries.append(entry)
        print(f"    • [{idx}] {strip_number_prefix(title)}")
        print(f"      Date: {date}")
        print(f"      Link: {entry['link']}")
    
    return entries

def get_poem_entries(poems_dir):
    """Extract poem entries from poems_manifest.json."""
    manifest_path = poems_dir / 'poems_manifest.json'
    
    print("\nReading poems manifest...")
    print(f"  Path: {manifest_path}")
    
    if not manifest_path.exists():
        print("  Poems manifest not found")
        return []
    
    manifest = load_json(manifest_path)
    if not manifest:
        return []
    
    print(f"  Found {len(manifest)} poem(s) in manifest")
    
    entries = []
    for idx, poem in enumerate(manifest):
        folder = poem.get('folder', '')
        name = poem.get('name', folder.replace('_', ' ').title())
        date = poem.get('date', '')
        
        # Skip entries without dates (empty string)
        if not date:
            print(f"    Skipping [{idx}] {name} - no date")
            continue
        
        # Extract folder number from folder name (e.g., "5_letter_to_a_faded_friend" -> "5")
        folder_match = re.match(r'^(\d+)', folder)
        folder_num = folder_match.group(1) if folder_match else str(idx)
        
        entry = {
            'type': 'poem',
            'name': strip_number_prefix(name),
            'date': date,
            'link': f'src/poems.html?poem={folder_num}'
        }
        entries.append(entry)
        print(f"    • [{idx}] {strip_number_prefix(name)}")
        print(f"      Date: {date}")
        print(f"      Link: {entry['link']}")
    
    return entries

def update_history():
    """Main function to update history.json."""
    print("\nUpdating History")
    print("-" * 40)
    
    repo_root = get_repo_root()
    
    # Paths
    blogs_dir = repo_root / 'src' / 'blogs'
    poems_dir = repo_root / 'src' / 'poems'
    history_path = repo_root / 'src' / 'resources' / 'history.json'
    
    print(f"\nRepository root: {repo_root}")
    print(f"Blogs directory: {blogs_dir}")
    print(f"Poems directory: {poems_dir}")
    print(f"History file: {history_path}")
    
    # Gather all entries
    all_entries = []
    
    # Get blog entries
    if blogs_dir.exists():
        blog_entries = get_blog_entries(blogs_dir)
        all_entries.extend(blog_entries)
        print(f"\nAdded {len(blog_entries)} blog entries")
    else:
        print(f"\nBlogs directory not found: {blogs_dir}")
    
    # Get poem entries
    if poems_dir.exists():
        poem_entries = get_poem_entries(poems_dir)
        all_entries.extend(poem_entries)
        print(f"Added {len(poem_entries)} poem entries")
    else:
        print(f"Poems directory not found: {poems_dir}")
    
    if not all_entries:
        print("\nNo entries found!")
        return False
    
    print(f"\nTotal entries collected: {len(all_entries)}")
    
    # Sort by date (most recent first) using the new parse_date function
    print("\nSorting entries by date (most recent first)...")
    all_entries.sort(key=lambda x: parse_date(x['date']), reverse=True)
    
    # Keep only the last 5 entries
    all_entries = all_entries[:5]
    print(f"Trimmed to last 5 entries")
    
    # Display sorted list
    print("\nFinal history entries (last 5):")
    for idx, entry in enumerate(all_entries, 1):
        print(f"  {idx}. [{entry['type'].upper()}] {entry['name']}")
        print(f"     Date: {entry['date']} | Link: {entry['link']}")
    
    # Create resources directory if it doesn't exist
    history_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"\nEnsured resources directory exists: {history_path.parent}")
    
    # Save to history.json
    print("\nSaving to history.json...")
    if save_json(history_path, all_entries):
        print(f"\nSuccessfully updated history.json with {len(all_entries)} entries")
        print(f"Most recent entry: {all_entries[0]['name']} ({all_entries[0]['date']})")
        print(f"Oldest entry: {all_entries[-1]['name']} ({all_entries[-1]['date']})")
        return True
    
    return False

if __name__ == '__main__':
    print("\nHistory Update Script")
    print("-" * 40)
    
    success = update_history()
    
    if success:
        print("\nUpdate completed successfully")
    else:
        print("\nUpdate failed")
    print()
