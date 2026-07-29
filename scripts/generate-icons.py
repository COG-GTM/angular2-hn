#!/usr/bin/env python3
"""Generates the PWA / favicon assets for the Vantage 4% cash card app.

Run with: python3 scripts/generate-icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BRAND_GREEN = (6, 118, 71)
CARD_WHITE = (255, 255, 255)
STRIPE_GREEN = (15, 157, 88)
CHIP_GREY = (199, 217, 208)
BASE = 512
ICONS_DIR = Path(__file__).resolve().parent.parent / "public" / "assets" / "icons"
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def render_base() -> Image.Image:
    image = Image.new("RGBA", (BASE, BASE), BRAND_GREEN + (255,))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((80, 152, 432, 376), radius=32, fill=CARD_WHITE)
    draw.rectangle((80, 204, 432, 244), fill=STRIPE_GREEN)
    draw.rounded_rectangle((124, 292, 228, 316), radius=12, fill=CHIP_GREY)
    font = ImageFont.truetype(FONT_PATH, 76)
    draw.text((336, 316), "4%", font=font, fill=BRAND_GREEN, anchor="mm")
    return image


def main() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    base = render_base()

    for size in (144, 192, 256, 512):
        base.resize((size, size), Image.LANCZOS).save(ICONS_DIR / f"android-chrome-{size}x{size}.png")

    for size in (60, 76, 120, 152, 180):
        base.resize((size, size), Image.LANCZOS).save(ICONS_DIR / f"apple-touch-icon-{size}x{size}.png")
    base.resize((180, 180), Image.LANCZOS).save(ICONS_DIR / "apple-touch-icon.png")

    for size in (16, 32):
        base.resize((size, size), Image.LANCZOS).save(ICONS_DIR / f"favicon-{size}x{size}.png")
    base.resize((150, 150), Image.LANCZOS).save(ICONS_DIR / "mstile-150x150.png")

    favicon = ICONS_DIR.parent.parent / "favicon.ico"
    base.resize((64, 64), Image.LANCZOS).save(favicon, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])


if __name__ == "__main__":
    main()
