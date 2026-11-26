#!/usr/bin/env python3
"""Build one self-contained HTML file: index.html + models (registry, model.json, weights).

The weights are stored as base64 text inside <script type="text/plain"> blocks, which the
browser keeps as inert text. By default each float16 shard is byte-shuffled (high bytes,
then low bytes) and deflated first, which makes the file about 14 % smaller; the page
undoes both with DecompressionStream and checks every shard against its SHA-256.

Usage:
  python3 web/tools/build_single_html.py                  # -> web/dist/ct-segment-webgpu.html
  python3 web/tools/build_single_html.py --models dentalsegmentator --out my.html
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import sys
import zlib
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]


def json_for_html(obj) -> str:
    # "</" would close the <script> element early
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--index", type=Path, default=WEB / "index.html")
    ap.add_argument("--models-dir", type=Path, default=WEB / "models")
    ap.add_argument("--models", nargs="*", help="model ids to embed (default: every model in registry.json)")
    ap.add_argument("--out", type=Path, default=WEB / "dist" / "ct-segment-webgpu.html")
    ap.add_argument("--raw", action="store_true", help="embed plain base64 (no shuffle / deflate)")
    args = ap.parse_args()

    registry = json.loads((args.models_dir / "registry.json").read_text())
    wanted = args.models or [m["id"] for m in registry["models"]]
    registry = {**registry, "models": [m for m in registry["models"] if m["id"] in wanted]}
    if not registry["models"]:
        raise SystemExit("no models selected")

    manifests, blocks = {}, []
    for entry in registry["models"]:
        mid = entry["id"]
        manifest = json.loads((args.models_dir / mid / "model.json").read_text())
        manifests[mid] = manifest
        for shard in manifest["weights"]["shards"]:
            raw = (args.models_dir / mid / shard["file"]).read_bytes()
            if hashlib.sha256(raw).hexdigest() != shard["sha256"]:
                raise SystemExit(f"{mid}/{shard['file']}: checksum differs from model.json")
            if args.raw:
                data, encoding = raw, "base64"
            else:
                data, encoding = zlib.compress(raw[1::2] + raw[0::2], 9), "base64+deflate+shuffle2"
            b64 = base64.b64encode(data).decode("ascii")
            lines = "\n".join(b64[i : i + 1024] for i in range(0, len(b64), 1024))
            blocks.append(f'<script type="text/plain" data-shard="{mid}/{shard["file"]}" data-encoding="{encoding}">\n{lines}\n</script>')
            print(f"  {mid}/{shard['file']}: {len(raw) / 2**20:.1f} MiB -> {len(b64) / 2**20:.1f} MiB text")

    html = args.index.read_text()
    marker = '<script type="module">'
    if html.count(marker) != 1:
        raise SystemExit("could not find the module script in index.html")
    payload = (
        f'<script type="application/json" id="embedded-models">{json_for_html({"registry": registry, "models": manifests})}</script>\n'
        + "\n".join(blocks)
        + "\n"
    )
    html = html.replace(marker, payload + marker)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html)
    print(f"wrote {args.out} ({args.out.stat().st_size / 2**20:.1f} MiB, models: {', '.join(manifests)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
