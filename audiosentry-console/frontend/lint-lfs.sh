#!/bin/bash
# Ensures Git LFS doesn't accidentally track frontend config files

# Run git lfs ls-files and get the names of the tracked files
LFS_FILES=$(git lfs ls-files --name-only 2>/dev/null)

if [ -z "$LFS_FILES" ]; then
    echo "LFS Check Passed: No files tracked by LFS yet."
    exit 0
fi

FORBIDDEN_FOUND=0

for file in $LFS_FILES; do
    if [[ "$file" == *"package.json"* || "$file" == *"package-lock.json"* || "$file" == *"vite.config"* || "$file" == *".eslintrc"* ]]; then
        echo "❌ ERROR: Forbidden frontend configuration file tracked by Git LFS: $file"
        FORBIDDEN_FOUND=1
    fi
done

if [ "$FORBIDDEN_FOUND" -eq 1 ]; then
    echo ""
    echo "🛑 VALIDATION FAILED: LFS should only track engine model weights (*.pt, *.bin, etc)."
    echo "Please run the following commands to fix this:"
    echo "  git lfs untrack \"*.json\""
    echo "  git rm --cached <file_paths>"
    echo "  git add <file_paths>"
    exit 1
fi

echo "✅ LFS Check Passed: No frontend config files are tracked by LFS."
exit 0
