#!/bin/bash

echo "===== NOTE: tree command not used, listing files only ======"

find . -type f \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/build/*' \
  -not -path '*/dist/*' \
  -not -path '*.log' \
  -not -path '*.lock' \
  -not -path './dump.txt' \
  -not -path './dump_part_*' \
  -not -path '*/.env*' \
  -not -path '*/package.json' \
  -not -path '*/package-lock.json' \
  -not -path '*/yarn.lock' \
  -not -path '*/tests/*' \
  -not -path '*/api_dump.txt' \
  -not -path '*/.DS_Store' \
  -not -path '*/coverage/*' \
  -not -path '*.min.js' \
  -not -path '*.bundle.js' \
  -print0 | while IFS= read -r -d '' file; do
    echo "===== $file ====="
    cat "$file"
    echo "===== END $file ====="
done