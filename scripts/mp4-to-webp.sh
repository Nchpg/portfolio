#!/usr/bin/env bash
# Convert an MP4 to an animated WebP suitable for use as a looping thumbnail.
#
# Usage:
#   scripts/mp4-to-webp.sh <input.mp4> [output.webp] [width] [fps] [quality]
#
# Defaults: width=480, fps=15, quality=60 (0-100, higher = better).
# If output path is omitted, writes <input>.webp next to the source.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <input.mp4> [output.webp] [width=480] [fps=15] [quality=60]" >&2
  exit 1
fi

input="$1"
output="${2:-${input%.*}.webp}"
width="${3:-480}"
fps="${4:-15}"
quality="${5:-60}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found in PATH" >&2
  exit 1
fi

if [ ! -f "$input" ]; then
  echo "error: input file not found: $input" >&2
  exit 1
fi

ffmpeg -hide_banner -y -i "$input" \
  -vf "fps=${fps},scale=${width}:-2:flags=lanczos" \
  -c:v libwebp -loop 0 -lossless 0 -compression_level 6 \
  -q:v "$quality" -preset picture -an -vsync 0 \
  "$output"

in_size=$(stat -c%s "$input")
out_size=$(stat -c%s "$output")
ratio=$(awk "BEGIN { printf \"%.1f\", ${out_size}*100/${in_size} }")
echo
echo "done: $output"
echo "  ${in_size} B -> ${out_size} B (${ratio}% of original)"
