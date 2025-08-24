import os
import json
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ====== CONFIG ======
POEMS_SUBFOLDER = "../poems"
BLOGS_SUBFOLDER = "../blogs"

POEMS_DIR = os.path.join(BASE_DIR, POEMS_SUBFOLDER)
BLOGS_DIR = os.path.join(BASE_DIR, BLOGS_SUBFOLDER)

POEMS_MANIFEST_FILE = os.path.join(POEMS_DIR, "poems_manifest.json")
BLOGS_MANIFEST_FILE = os.path.join(BLOGS_DIR, "blogs_manifest.json")
# ====================


def build_poems_manifest():
    """Scan poems/ folder, match .md and .mp3 by number prefix, write poems_manifest.json"""
    if not os.path.exists(POEMS_DIR):
        print(f"❌ Error: Directory '{POEMS_DIR}' does not exist.")
        return

    files = os.listdir(POEMS_DIR)

    md_pattern = re.compile(r'^(\d+)\..+\.md$', re.IGNORECASE)
    mp3_pattern = re.compile(r'^(\d+)\..+\.mp3$', re.IGNORECASE)

    md_files = {}
    mp3_files = {}

    for f in files:
        md_match = md_pattern.match(f)
        if md_match:
            num = md_match.group(1)
            md_files[num] = f
            continue
        mp3_match = mp3_pattern.match(f)
        if mp3_match:
            num = mp3_match.group(1)
            mp3_files[num] = f

    manifest = []
    print("\n📜 Building poems manifest...")
    for num, md_file in md_files.items():
        mp3_file = mp3_files.get(num)
        if mp3_file:
            print(f"  {md_file} <=> {mp3_file}")
            manifest.append({
                "name": md_file,
                "audio": mp3_file
            })
        else:
            print(f"  {md_file} <=> NO AUDIO MATCH")
            manifest.append({
                "name": md_file,
                "audio": None
            })

    # Any mp3s without matching md
    for num, mp3_file in mp3_files.items():
        if num not in md_files:
            print(f"  AUDIO FILE {mp3_file} has NO markdown match")

    with open(POEMS_MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"✅ Poems manifest created with {len(manifest)} entries at {POEMS_MANIFEST_FILE}")


def build_blogs_manifest():
    """Scan blogs/ folder, list subfolders with text.md inside, write blogs_manifest.json"""
    if not os.path.exists(BLOGS_DIR):
        print(f"❌ Error: Directory '{BLOGS_DIR}' does not exist.")
        return

    blog_folders = [
        d for d in os.listdir(BLOGS_DIR)
        if os.path.isdir(os.path.join(BLOGS_DIR, d))
    ]

    manifest = []
    print("\n📝 Building blogs manifest...")
    for folder in sorted(blog_folders):
        text_md_path = os.path.join(BLOGS_DIR, folder, "text.md")
        if os.path.exists(text_md_path):  # only include valid blog posts
            manifest.append({
                "folder": folder,
                "title": format_blog_title(folder)
            })
            print(f"  ✅ Found blog: {folder}")
        else:
            print(f"  ⚠️ Skipping '{folder}' (no text.md)")

    with open(BLOGS_MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"✅ Blogs manifest created with {len(manifest)} entries at {BLOGS_MANIFEST_FILE}")


def format_blog_title(folder_name: str) -> str:
    """Convert folder name like '2025-01_trip' -> '2025 01 Trip'."""
    title = folder_name.replace("_", " ").replace("-", " ")
    return title.strip().title()


if __name__ == "__main__":
    build_poems_manifest()
    build_blogs_manifest()
    print("\n🎉 All manifests generated.")
