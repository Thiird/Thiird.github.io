"""
Update the site history by scanning all content (poems, blogs, bio) and generating
a chronological history.json file with the 5 most recent updates.
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
