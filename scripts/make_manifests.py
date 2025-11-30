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
    """Extract date from markdown front matter."""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Look for date in YAML front matter (between --- markers)
        yaml_match = re.search(r'^---\s*\n(.*?)\n---', content, re.MULTILINE | re.DOTALL)
        if yaml_match:
            front_matter = yaml_match.group(1)
            date_match = re.search(r'^date:\s*["\']?(\d{4}-\d{2}-\d{2})["\']?', front_matter, re.MULTILINE)
            if date_match:
                return date_match.group(1)
        
        # Fallback: look for date anywhere in the file
        date_match = re.search(r'date:\s*["\']?(\d{4}-\d{2}-\d{2})["\']?', content, re.IGNORECASE)
        if date_match:
            return date_match.group(1)
            
    except Exception as e:
        print(f"  ⚠️  Error reading date from {md_path}: {e}")
    
    # Return empty string instead of None if no date found
    return ""

def format_date(date_string):
    """Format date from YYYY-MM-DD to readable format (e.g., 'Jan 15, 2024')."""
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        return date_obj.strftime('%b %d, %Y')
    except:
        return date_string

def make_blog_manifest():
    """Generate blogs_manifest.json from blog folders."""
    print("\n" + "="*70)
    print("📝 GENERATING BLOGS MANIFEST")
    print("="*70)
    
    repo_root = get_repo_root()
    blogs_dir = repo_root / 'src' / 'blogs'
    
    if not blogs_dir.exists():
        print(f"❌ Blogs directory not found: {blogs_dir}")
        return False
    
    print(f"\n📂 Scanning: {blogs_dir}")
    
    blogs = []
    
    for folder in sorted(blogs_dir.iterdir()):
        if not folder.is_dir():
            continue
        
        blog_file = folder / 'blog.md'
        
        if not blog_file.exists():
            print(f"  ⚠️  Skipping {folder.name}: blog.md not found")
            continue
        
        # Extract date from markdown
        date = extract_date_from_markdown(blog_file)
        if not date:
            print(f"  ⚠️  No date found in {folder.name}/blog.md, using empty date")
            date = ""
        
        # Do NOT add formatted date to markdown file anymore
        
        # Extract title from folder name
        folder_name = folder.name
        title = folder_name
        if folder_name[0].isdigit():
            parts = folder_name.split('.', 1)
            if len(parts) > 1:
                title = parts[1].strip()
        
        title = title.replace('_', ' ').title()
        
        blog_entry = {
            'folder': folder.name,
            'title': title,
            'date': date
        }
        
        blogs.append(blog_entry)
        print(f"  ✅ {folder.name} - {title} ({date})")
    
    blogs.sort(key=lambda x: x['folder'])
    
    manifest_path = blogs_dir / 'blogs_manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(blogs, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved manifest with {len(blogs)} blog(s)")
    print(f"📍 Location: {manifest_path}")
    
    return True

def make_poem_manifest():
    """Generate poems_manifest.json from poem folders."""
    print("\n" + "="*70)
    print("📝 GENERATING POEMS MANIFEST")
    print("="*70)
    
    repo_root = get_repo_root()
    poems_dir = repo_root / 'src' / 'poems'
    
    if not poems_dir.exists():
        print(f"❌ Poems directory not found: {poems_dir}")
        return False
    
    print(f"\n📂 Scanning: {poems_dir}")
    
    poems = []
    
    for folder in sorted(poems_dir.iterdir()):
        if not folder.is_dir():
            continue
        
        poem_file = folder / 'poem.md'
        
        if not poem_file.exists():
            print(f"  ⚠️  Skipping {folder.name}: poem.md not found")
            continue
        
        # Extract date from markdown
        date = extract_date_from_markdown(poem_file)
        if not date:
            print(f"  ⚠️  No date found in {folder.name}/poem.md, using empty date")
            date = ""
        
        # Check for audio file
        audio_file = None
        for file in folder.iterdir():
            if file.suffix.lower() == '.mp3':
                audio_file = file.name
                break
        
        # Extract name from folder
        folder_name = folder.name
        name = folder_name
        if folder_name[0].isdigit():
            parts = folder_name.split('.', 1)
            if len(parts) > 1:
                name = parts[1].strip()
        
        name = name.replace('_', ' ').replace('-', ' ').title()
        
        poem_entry = {
            'folder': folder.name,
            'name': name,
            'audio': audio_file,
            'date': date
        }
        
        poems.append(poem_entry)
        audio_str = f" (♪ {audio_file})" if audio_file else ""
        print(f"  ✅ {folder.name} - {name}{audio_str} ({date})")
    
    poems.sort(key=lambda x: x['folder'])
    
    manifest_path = poems_dir / 'poems_manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(poems, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved manifest with {len(poems)} poem(s)")
    print(f"📍 Location: {manifest_path}")
    
    return True

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 MANIFEST GENERATION SCRIPT")
    print("="*70)
    
    blog_success = make_blog_manifest()
    poem_success = make_poem_manifest()
    
    print("\n" + "="*70)
    if blog_success and poem_success:
        print("✅ ALL MANIFESTS GENERATED SUCCESSFULLY!")
    else:
        print("❌ SOME MANIFESTS FAILED TO GENERATE")
    print("="*70 + "\n")
