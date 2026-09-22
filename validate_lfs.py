import sys
import os

GITATTRIBUTES_PATH = ".gitattributes"

def validate_gitattributes():
    if not os.path.exists(GITATTRIBUTES_PATH):
        print(f"Error: {GITATTRIBUTES_PATH} not found.")
        sys.exit(1)
        
    allowed_patterns = {
        "*.pt",
        "*.pth",
        "*.bin",
        "*.wav",
        "audiosentry-engine/weights/*.json",
        "weights/*.json"
    }

    with open(GITATTRIBUTES_PATH, "r") as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        parts = line.split()
        pattern = parts[0]
        
        # Check if it is an LFS tracking line
        is_lfs = any("filter=lfs" in p for p in parts)
        
        if is_lfs:
            if pattern == "*.json":
                print("ERROR: Global *.json LFS tracking is strictly prohibited! It corrupts package.json.")
                sys.exit(1)
                
            if pattern not in allowed_patterns:
                print(f"ERROR: LFS tracking for '{pattern}' is not explicitly allowed.")
                print(f"Allowed patterns are: {', '.join(allowed_patterns)}")
                sys.exit(1)

    print("SUCCESS: .gitattributes validation passed. No global *.json tracking found.")
    print("SUCCESS: LFS tracking is strictly locked down to allowed models/assets.")

if __name__ == "__main__":
    validate_gitattributes()
