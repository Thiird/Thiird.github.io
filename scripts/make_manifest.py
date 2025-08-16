import os
import json
import re

# 🔧 Change this to adjust the working folder (relative to script)
WORKING_SUBFOLDER = "../poems"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POEMS_DIR = os.path.join(BASE_DIR, WORKING_SUBFOLDER)
MANIFEST_FILE = os.path.join(POEMS_DIR, "poems_manifest.json")

def build_manifest():
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
    print("Matches found:")
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

    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✅ Manifest created with {len(manifest)} entries at {MANIFEST_FILE}")

if __name__ == "__main__":
    build_manifest()
