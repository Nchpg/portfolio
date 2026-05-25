#!/usr/bin/env bash
# Batch-encode previews from original source in public/projects/
#
# - original.mp4 → preview-1280.mp4, preview-960.mp4, preview-640.mp4
# - original.png → preview.webp (1280px wide, quality 80)
#
# Usage:
#   scripts/compress-mp4.sh [projects_dir]
#
# Default projects_dir: public/projects

set -euo pipefail

PROJECTS_DIR="${1:-public/projects}"
FPS=25
PNG_WIDTH=1280
PNG_QUALITY=80

FFMPEG="${FFMPEG:-ffmpeg}"
CWEBP="${CWEBP:-cwebp}"

if ! command -v "$FFMPEG" >/dev/null 2>&1; then
  echo "error: ffmpeg not found. Set FFMPEG=/path/to/ffmpeg" >&2
  exit 1
fi
if ! command -v "$CWEBP" >/dev/null 2>&1; then
  echo "error: cwebp not found. Set CWEBP=/path/to/cwebp" >&2
  exit 1
fi

declare -A WIDTHS=([1280]=23 [960]=24 [640]=26)

for project_dir in "$PROJECTS_DIR"/*/; do
  echo "=== $(basename "$project_dir") ==="

  # ── MP4 → multi-resolution H.264 ─────────────────────────────────────────
  if [ -f "$project_dir/original.mp4" ]; then
    input="$project_dir/original.mp4"
    for width in 1280 960 640; do
      crf=${WIDTHS[$width]}
      output="$project_dir/preview-${width}.mp4"
      if [ -f "$output" ]; then
        echo "  preview-${width}.mp4  →  skipped (exists)"
        continue
      fi
      "$FFMPEG" -hide_banner -y -i "$input" \
        -vf "fps=${FPS},scale=${width}:-2:flags=lanczos" \
        -c:v libx264 -preset medium -crf "$crf" \
        -movflags +faststart -an \
        "$output"
      echo "  preview-${width}.mp4  →  $(( $(stat -c%s "$output") / 1024 )) KB"
    done

  # ── PNG → static webp ─────────────────────────────────────────────────────
  elif [ -f "$project_dir/original.png" ]; then
    input="$project_dir/original.png"
    output="$project_dir/preview.webp"
    if [ -f "$output" ]; then
      echo "  preview.webp  →  skipped (exists)"
    else
      "$CWEBP" -q "$PNG_QUALITY" -m 6 -pass 10 -af \
        -resize "$PNG_WIDTH" 0 \
        "$input" -o "$output"
      echo "  preview.webp  →  $(( $(stat -c%s "$output") / 1024 )) KB"
    fi

  else
    echo "  no source found, skipping"
  fi

  echo
done
