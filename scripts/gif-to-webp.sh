#!/usr/bin/env bash
# Convert an animated GIF to an animated WebP (smaller, better quality).
#
# Usage:
#   scripts/gif-to-webp.sh <input.gif> [output.webp] [width] [quality]
#
# Defaults: width=0 (keep original), quality=70.
# If output path is omitted, writes <input>.webp next to the source.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <input.gif> [output.webp] [width=0 (orig)] [quality=70]" >&2
  exit 1
fi

input="$1"
output="${2:-${input%.*}.webp}"
width="${3:-0}"
quality="${4:-70}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found in PATH" >&2
  exit 1
fi

if [ ! -f "$input" ]; then
  echo "error: input file not found: $input" >&2
  exit 1
fi

if [ "$width" -gt 0 ]; then
  vf="scale=${width}:-2:flags=lanczos"
else
  vf="null"
fi

ffmpeg -hide_banner -y -i "$input" \
  -vf "$vf" \
  -c:v libwebp -loop 0 -lossless 0 -compression_level 6 \
  -q:v "$quality" -preset picture -an -vsync 0 \
  "$output"

in_size=$(stat -c%s "$input")
out_size=$(stat -c%s "$output")
ratio=$(awk "BEGIN { printf \"%.1f\", ${out_size}*100/${in_size} }")
echo
echo "done: $output"
echo "  ${in_size} B -> ${out_size} B (${ratio}% of original)"
