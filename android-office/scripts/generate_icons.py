#!/usr/bin/env python3
"""Generate Android launcher PNGs from the actual official Abu Al Faisal logo.
The supplied asset is a zlib-compressed 96x96 palette index image; no credentials.
"""
import base64
import zlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "assets" / "logo.b64"
blob = zlib.decompress(base64.b64decode(source.read_text().strip()))
assert len(blob) == 96 + 96 * 96, "Unexpected branded icon input"
palette = blob[:96]
pixels = blob[96:]
image = Image.frombytes("P", (96, 96), pixels)
image.putpalette(list(palette) + [0] * (768 - len(palette)))
image = image.convert("RGB")
densities = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}
for density, size in densities.items():
    out = ROOT / "app" / "src" / "main" / "res" / ("mipmap-" + density)
    out.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.Resampling.LANCZOS).save(out / "ic_launcher.png")
print("Official launcher icons generated in 5 Android densities")
