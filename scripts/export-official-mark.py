"""Build ContiHub icon sizes from the official conti-way-mark.png photograph.

Tiles, the signature crop, the favicon, and the Open Graph image are pixels
from that file. Nothing here redraws the C.
"""

from pathlib import Path
import shutil

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MARK_PATH = ROOT / "public/brand/conti-way-mark.png"
KIT = ROOT / "public/brand/kit"
TILES = ROOT / "public/brand/tiles"
APP = ROOT / "app"

BLUE = (0x2F, 0x5B, 0xFF)
GOLD = (0xC4, 0xA5, 0x74)
BLACK = (0x05, 0x03, 0x0A)
CREAM = (0xFF, 0xFD, 0xF8)
BODY = (0xD7, 0xD2, 0xC8)

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SERIF_REG = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

TILE_IDS = [
    "contihub",
    "projects",
    "conticrm",
    "contifield",
    "conticost",
    "contisafety",
    "contitrak",
    "contibid",
    "contireview",
    "changeorders",
]


def tight_square(mark: Image.Image) -> Image.Image:
    """Crop the floor and side margins so the photograph's C fills a square."""
    cropped = mark.crop((36, 28, 552, 470))
    width, height = cropped.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return cropped.crop((left, top, left + side, top + side))


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        trial = word if not current else f"{current} {word}"
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def standard_sheet(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (1600, 900), BLACK)
    placed = mark.resize((560, 560), Image.Resampling.LANCZOS)
    canvas.paste(placed, (980, 150))
    draw = ImageDraw.Draw(canvas)

    about = ImageFont.truetype(SANS_BOLD, 18)
    headline = ImageFont.truetype(SERIF, 58)
    body = ImageFont.truetype(SERIF_REG, 26)
    sub = ImageFont.truetype(SERIF, 32)
    bullet = ImageFont.truetype(SERIF_REG, 26)
    foot = ImageFont.truetype(SANS, 16)

    x = 72
    draw.text((x, 78), "ABOUT", font=about, fill=GOLD)
    draw.rectangle((x, 108, x + 64, 112), fill=BLUE)

    draw.text((x, 140), "A City of Akron firm.", font=headline, fill=CREAM)

    y = 230
    paragraph = (
        "The Conti Way takes a job from first call to closeout. "
        "Leadership stays on it. Built as a local alternative to large, "
        "impersonal corporate CM firms."
    )
    for line in wrap(draw, paragraph, body, 820):
        draw.text((x, y), line, font=body, fill=BODY)
        y += 38

    y += 28
    draw.text((x, y), "The Conti Way. Full project life cycle.", font=sub, fill=GOLD)
    y += 64
    for item in (
        "One team at kickoff",
        "Owner-side preconstruction",
        "Principals through closeout",
    ):
        draw.polygon([(x, y + 8), (x + 14, y + 16), (x, y + 24)], fill=GOLD)
        draw.text((x + 28, y), item, font=bullet, fill=GOLD)
        y += 44

    draw.text(
        (x, 840),
        "CITY OF AKRON  ·  CONTINENTAL CONSTRUCTION OF OHIO",
        font=foot,
        fill=(0x9A, 0x93, 0x88),
    )
    return canvas


def open_graph(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (1200, 630), BLACK)
    placed = mark.resize((560, 560), Image.Resampling.LANCZOS)
    canvas.paste(placed, ((1200 - 560) // 2, (630 - 560) // 2))
    return canvas


def main() -> None:
    mark = Image.open(MARK_PATH).convert("RGB")
    KIT.mkdir(parents=True, exist_ok=True)
    square = tight_square(mark)
    square.save(KIT / "conti-mark-tile@2x.png", optimize=True)
    standard_sheet(mark).save(KIT / "conti-way-cmo-standard.png", optimize=True)

    icon = square.resize((512, 512), Image.Resampling.LANCZOS).convert("RGBA")
    icon.save(APP / "icon.png", optimize=True)
    square.resize((180, 180), Image.Resampling.LANCZOS).convert("RGBA").save(APP / "apple-icon.png", optimize=True)
    open_graph(mark).save(APP / "opengraph-image.png", optimize=True)
    open_graph(mark).save(APP / "twitter-image.png", optimize=True)

    icon.save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    for tile_id in TILE_IDS:
        shutil.copyfile(MARK_PATH, TILES / f"{tile_id}.png")
        svg = TILES / f"{tile_id}.svg"
        if svg.exists():
            svg.unlink()

    for name in (
        "cc-mark.png",
        "cc-mark.svg",
        "cc-mark-on-dark.png",
        "cc-mark-on-dark.svg",
        "cc-mark-chrome.png",
        "cc-mark-chrome.svg",
    ):
        path = ROOT / "public/brand" / name
        if path.exists():
            path.unlink()

    icon_svg = APP / "icon.svg"
    if icon_svg.exists():
        icon_svg.unlink()


if __name__ == "__main__":
    main()
