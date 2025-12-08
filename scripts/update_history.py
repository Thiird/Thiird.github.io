"""
Update the site history by scanning all content (poems, blogs, bio) and generating
a chronological history.json file with the 5 most recent updates.
"""

import json
import os
from pathlib import Path
from datetime import datetime

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
        print(f"  ❌ File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"  ❌ JSON decode error in {filepath}: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Error loading {filepath}: {e}")
        return None

def save_json(filepath, data):
    """Save JSON file with pretty formatting."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  ✅ Successfully saved {filepath}")
        return True
    except Exception as e:
        print(f"  ❌ Error saving {filepath}: {e}")
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
    
    print(f"\n📂 Reading blogs manifest...")
    print(f"  Path: {manifest_path}")
    
    if not manifest_path.exists():
        print(f"  ❌ Blogs manifest not found")
        return []
    
    manifest = load_json(manifest_path)
    if not manifest:
        return []
    
    print(f"  ✅ Found {len(manifest)} blog(s) in manifest")
    
    entries = []
    for idx, blog in enumerate(manifest):
        folder = blog.get('folder', '')
        title = blog.get('title', folder.replace('_', ' ').title())
        date = blog.get('date', '')
        
        # Skip entries without dates (empty string)
        if not date:
            print(f"    ⚠️  Skipping [{idx}] {title} - no date")
            continue
        
        entry = {
            'type': 'blog',
            'name': title,
            'date': date,
            'link': f'src/blogs.html?blog={idx}'
        }
        entries.append(entry)
        print(f"    • [{idx}] {title}")
        print(f"      Date: {date}")
        print(f"      Link: {entry['link']}")
    
    return entries

def get_poem_entries(poems_dir):
    """Extract poem entries from poems_manifest.json."""
    manifest_path = poems_dir / 'poems_manifest.json'
    
    print(f"\n📂 Reading poems manifest...")
    print(f"  Path: {manifest_path}")
    
    if not manifest_path.exists():
        print(f"  ❌ Poems manifest not found")
        return []
    
    manifest = load_json(manifest_path)
    if not manifest:
        return []
    
    print(f"  ✅ Found {len(manifest)} poem(s) in manifest")
    
    entries = []
    for idx, poem in enumerate(manifest):
        name = poem.get('name', poem.get('folder', '').replace('_', ' ').title())
        date = poem.get('date', '')
        
        # Skip entries without dates (empty string)
        if not date:
            print(f"    ⚠️  Skipping [{idx}] {name} - no date")
            continue
        
        entry = {
            'type': 'poem',
            'name': name,
            'date': date,
            'link': f'src/poems.html?poem={idx}'
        }
        entries.append(entry)
        print(f"    • [{idx}] {name}")
        print(f"      Date: {date}")
        print(f"      Link: {entry['link']}")
    
    return entries

def update_history():
    """Main function to update history.json."""
    print("\n" + "="*70)
    print("🔄 UPDATING HISTORY.JSON FROM MANIFESTS")
    print("="*70)
    
    repo_root = get_repo_root()
    
    # Paths
    blogs_dir = repo_root / 'src' / 'blogs'
    poems_dir = repo_root / 'src' / 'poems'
    history_path = repo_root / 'src' / 'resources' / 'history.json'
    
    print(f"\n📍 Repository root: {repo_root}")
    print(f"📍 Blogs directory: {blogs_dir}")
    print(f"📍 Poems directory: {poems_dir}")
    print(f"📍 History file: {history_path}")
    
    # Gather all entries
    all_entries = []
    
    # Get blog entries
    if blogs_dir.exists():
        blog_entries = get_blog_entries(blogs_dir)
        all_entries.extend(blog_entries)
        print(f"\n✅ Added {len(blog_entries)} blog entries")
    else:
        print(f"\n⚠️  Blogs directory not found: {blogs_dir}")
    
    # Get poem entries
    if poems_dir.exists():
        poem_entries = get_poem_entries(poems_dir)
        all_entries.extend(poem_entries)
        print(f"✅ Added {len(poem_entries)} poem entries")
    else:
        print(f"⚠️  Poems directory not found: {poems_dir}")
    
    if not all_entries:
        print("\n❌ No entries found!")
        return False
    
    print(f"\n📊 Total entries collected: {len(all_entries)}")
    
    # Sort by date (most recent first) using the new parse_date function
    print("\n🔄 Sorting entries by date (most recent first)...")
    all_entries.sort(key=lambda x: parse_date(x['date']), reverse=True)
    
    # Keep only the last 5 entries
    all_entries = all_entries[:5]
    print(f"\n✂️  Trimmed to last 5 entries")
    
    # Display sorted list
    print("\n📋 Final history entries (last 5):")
    for idx, entry in enumerate(all_entries, 1):
        print(f"  {idx}. [{entry['type'].upper()}] {entry['name']}")
        print(f"     Date: {entry['date']} | Link: {entry['link']}")
    
    # Create resources directory if it doesn't exist
    history_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"\n📁 Ensured resources directory exists: {history_path.parent}")
    
    # Save to history.json
    print(f"\n💾 Saving to history.json...")
    if save_json(history_path, all_entries):
        print(f"\n✅ Successfully updated history.json with {len(all_entries)} entries")
        print(f"📌 Most recent entry: {all_entries[0]['name']} ({all_entries[0]['date']})")
        print(f"📌 Oldest entry: {all_entries[-1]['name']} ({all_entries[-1]['date']})")
        return True
    
    return False

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 HISTORY.JSON UPDATE SCRIPT")
    print("="*70)
    
    success = update_history()
    
    print("\n" + "="*70)
    if success:
        print("✅ UPDATE COMPLETED SUCCESSFULLY!")
    else:
        print("❌ UPDATE FAILED!")
    print("="*70 + "\n")
