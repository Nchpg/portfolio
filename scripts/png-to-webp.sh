#!/usr/bin/env bash

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 file.png [quality]"
    exit 1
fi

INPUT="$1"
QUALITY="${2:-75}"

if [ ! -f "$INPUT" ]; then
    echo "File not found: $INPUT"
    exit 1
fi

OUTPUT="${INPUT%.png}.webp"

cwebp \
  -q "$QUALITY" \
  -m 6 \
  -pass 10 \
  -af \
  "$INPUT" \
  -o "$OUTPUT"

echo "Done: $OUTPUT"

echo "Original:"
du -h "$INPUT"

echo "Compressed:"
du -h "$OUTPUT"
