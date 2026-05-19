#!/usr/bin/env bash

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 input.mp4 [crf]"
    exit 1
fi

INPUT="$1"
CRF="${2:-23}"
OUTPUT="${INPUT%.mp4}-preview.mp4"

ffmpeg -i "$INPUT" \
  -vf "scale=1280:-2" \
  -c:v libx264 \
  -preset medium \
  -crf "$CRF" \
  -movflags +faststart \
  -c:a aac \
  -b:a 160k \
  "$OUTPUT"

echo "Done: $OUTPUT"

echo "Original:"
du -h "$INPUT"

echo "Preview:"
du -h "$OUTPUT"
