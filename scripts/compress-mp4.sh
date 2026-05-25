#!/usr/bin/env bash
# Batch-encode multi-resolution preview MP4s from original.mp4 in public/projects/
#
# Outputs per project:
#   preview-1280.mp4  — desktop
#   preview-960.mp4   — tablet large
#   preview-640.mp4   — tablet small
#   preview-320.mp4   — mobile
#
# Settings: 25 fps, H.264, no audio, web-optimised (faststart)
#
# Usage:
#   scripts/compress-mp4.sh [projects_dir]
#
# Default projects_dir: public/projects

set -euo pipefail

PROJECTS_DIR="${1:-public/projects}"
FPS=25

FFMPEG="${FFMPEG:-ffmpeg}"

if ! command -v "$FFMPEG" >/dev/null 2>&1; then
  echo "error: ffmpeg not found. Set FFMPEG=/path/to/ffmpeg" >&2
  exit 1
fi

declare -A WIDTHS=([1280]=23 [960]=24 [640]=26 [320]=28)

for project_dir in "$PROJECTS_DIR"/*/; do
  input="$project_dir/original.mp4"
  [ -f "$input" ] || continue

  echo "=== $(basename "$project_dir") ==="

  for width in 1280 960 640 320; do
    crf=${WIDTHS[$width]}
    output="$project_dir/preview-${width}.mp4"

    "$FFMPEG" -hide_banner -y -i "$input" \
      -vf "fps=${FPS},scale=${width}:-2:flags=lanczos" \
      -c:v libx264 -preset medium -crf "$crf" \
      -movflags +faststart \
      -an \
      "$output"

    out_size=$(stat -c%s "$output")
    echo "  preview-${width}.mp4  →  $(( out_size / 1024 )) KB"
  done

  echo
done
