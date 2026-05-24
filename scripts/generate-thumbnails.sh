#!/usr/bin/env bash

set -euo pipefail

# Directory containing projects
PROJECTS_DIR="public/projects"
MAX_DURATION=10

for dir in "$PROJECTS_DIR"/*; do
    if [ -d "$dir" ] && [ -f "$dir/original.mp4" ]; then
        INPUT="$dir/original.mp4"
        OUTPUT="$dir/thumbnail.mp4"
        
        echo "Processing $dir..."
        
        # Get duration
        DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT")
        
        FILTER="scale=480:-2,fps=15"
        
        # If duration > MAX_DURATION, calculate speed factor
        # Using bc for float arithmetic
        if (( $(echo "$DURATION > $MAX_DURATION" | bc -l) )); then
            SPEED_FACTOR=$(echo "$MAX_DURATION / $DURATION" | bc -l)
            echo "Video is ${DURATION}s, accelerating by factor ${SPEED_FACTOR}"
            FILTER="${FILTER},setpts=${SPEED_FACTOR}*PTS"
        fi

        ffmpeg -y -i "$INPUT" \
            -vf "$FILTER" \
            -an \
            -c:v libx264 \
            -preset slow \
            -crf 28 \
            -movflags +faststart \
            "$OUTPUT"
            
        echo "Generated $OUTPUT"
        du -h "$OUTPUT"
    fi
done
