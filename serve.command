#!/bin/bash
# Double-click in Finder: serves this folder at http://localhost:8000 (this Mac only).
# Ctrl+C or close the window to stop.
cd "$(dirname "$0")" || exit 1
echo "CT Segment WebGPU"
echo "  http://localhost:8000/"
echo "  停止: Ctrl+C またはこのウィンドウを閉じる"
echo
exec python3 -m http.server 8000 --bind 127.0.0.1
