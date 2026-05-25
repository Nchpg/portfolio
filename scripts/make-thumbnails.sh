#!/usr/bin/env bash
# Regenerate all thumbnail.webp in public/projects/
#
# - original.mp4 → animated webp (12 fps, 300px, max 10s with speedup)
# - original.png → static webp
#
# Usage:
#   scripts/make-thumbnails.sh [projects_dir]
#
# Default projects_dir: public/projects

set -euo pipefail

PROJECTS_DIR="${1:-public/projects}"
FPS=12
WIDTH=300
QUALITY=35
MAX_DURATION=10

FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
CWEBP="${CWEBP:-cwebp}"

if ! command -v "$FFMPEG" >/dev/null 2>&1; then
  echo "error: ffmpeg not found. Set FFMPEG=/path/to/ffmpeg" >&2
  exit 1
fi
if ! command -v "$CWEBP" >/dev/null 2>&1; then
  echo "error: cwebp not found. Set CWEBP=/path/to/cwebp" >&2
  exit 1
fi

for project_dir in "$PROJECTS_DIR"/*/; do
  output="$project_dir/thumbnail.webp"

  # ── MP4 → animated webp ──────────────────────────────────────────────────
  if [ -f "$output" ]; then
    echo "$(basename "$project_dir"): skipped (exists)"
    echo
    continue
  fi

  if [ -f "$project_dir/original.mp4" ]; then
    input="$project_dir/original.mp4"
    duration=$("$FFPROBE" -v error -show_entries format=duration \
      -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)

    pts_filter=""
    if awk "BEGIN { exit !($duration > $MAX_DURATION) }"; then
      speed=$(awk "BEGIN { printf \"%.6f\", $duration / $MAX_DURATION }")
      pts_filter="setpts=PTS/${speed},"
      echo "$(basename "$project_dir") [mp4]: ${duration}s → x${speed} speed"
    else
      echo "$(basename "$project_dir") [mp4]: ${duration}s"
    fi

    "$FFMPEG" -hide_banner -y -i "$input" \
      -vf "${pts_filter}fps=${FPS},scale=${WIDTH}:-2:flags=lanczos" \
      -c:v libwebp -loop 0 -lossless 0 -compression_level 6 \
      -q:v "$QUALITY" -preset picture -an -vsync 0 \
      "$output"

  # ── PNG → static webp ────────────────────────────────────────────────────
  elif [ -f "$project_dir/original.png" ]; then
    input="$project_dir/original.png"
    echo "$(basename "$project_dir") [png]"

    "$CWEBP" -q "$QUALITY" -m 6 -pass 10 -af \
      -resize "$WIDTH" 0 \
      "$input" -o "$output"

  else
    continue
  fi

  out_size=$(stat -c%s "$output")
  echo "  → $output  ($(( out_size / 1024 )) KB)"
  echo
done
