#!/bin/bash
# yt-dlp adds MOV faststart even for MP3/WAV. The audio-only build has no MOV muxer.
args=()
while (($#)); do
  if [[ "$1" == '-movflags' && "${2-}" == '+faststart' ]]; then
    shift 2
  else
    args+=("$1")
    shift
  fi
done
exec "$(cd "$(dirname "$0")" && pwd)/ffmpeg-audio" "${args[@]}"
