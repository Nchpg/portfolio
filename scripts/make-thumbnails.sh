#!/usr/bin/env bash
# Regenerate all thumbnail.webp from original.mp4 in public/projects/
#
# Rules:
#   - 12 fps
#   - width 300px (height auto)
#   - quality 35 (heavy compression for small display)
#   - if duration > 10s: speed up uniformly to land at exactly 10s (no trimming)
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

if ! command -v "$FFMPEG" >/dev/null 2>&1; then
  echo "error: ffmpeg not found. Set FFMPEG=/path/to/ffmpeg" >&2
  exit 1
fi

if ! command -v "$FFPROBE" >/dev/null 2>&1; then
  echo "error: ffprobe not found. Set FFPROBE=/path/to/ffprobe" >&2
  exit 1
fi

for project_dir in "$PROJECTS_DIR"/*/; do
  input="$project_dir/original.mp4"
  output="$project_dir/thumbnail.webp"

  [ -f "$input" ] || continue

  duration=$("$FFPROBE" -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$input" 2>/dev/null)

  # Build setpts filter if speedup needed
  pts_filter=""
  if awk "BEGIN { exit !($duration > $MAX_DURATION) }"; then
    speed=$(awk "BEGIN { printf \"%.6f\", $duration / $MAX_DURATION }")
    pts_filter="setpts=PTS/${speed},"
    echo "$(basename "$project_dir"): ${duration}s → speed x${speed} (capped at ${MAX_DURATION}s)"
  else
    echo "$(basename "$project_dir"): ${duration}s → no speedup needed"
  fi

  "$FFMPEG" -hide_banner -y -i "$input" \
    -vf "${pts_filter}fps=${FPS},scale=${WIDTH}:-2:flags=lanczos" \
    -c:v libwebp -loop 0 -lossless 0 -compression_level 6 \
    -q:v "$QUALITY" -preset picture -an -vsync 0 \
    "$output"

  in_size=$(stat -c%s "$input")
  out_size=$(stat -c%s "$output")
  ratio=$(awk "BEGIN { printf \"%.1f\", ${out_size}*100/${in_size} }")
  echo "  → $output  ($(( out_size / 1024 )) KB, ${ratio}% of source)"
  echo
done
