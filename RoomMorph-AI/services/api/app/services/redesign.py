from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

from app.models.schemas import DesignBrief, DesignConcept


THEME_KITS: dict[str, dict[str, object]] = {
    "modern": {
        "title": "Soft Modern Reset",
        "palette": ["#f3f0e8", "#9aa58f", "#2f3430", "#c7b299"],
        "rationale": "Clean walls, low-profile seating, warm wood, and measured contrast.",
    },
    "luxury": {
        "title": "Quiet Luxury Suite",
        "palette": ["#f6f1e7", "#c4a35a", "#2e2d2a", "#e7dfcf"],
        "rationale": "Layered lighting, richer finishes, brass accents, and softened surfaces.",
    },
    "minimal": {
        "title": "Minimal Calm Plan",
        "palette": ["#f7f6f1", "#d8d5ca", "#6e776d", "#b9aa91"],
        "rationale": "Decluttered layout with pale finishes, hidden storage, and airy negative space.",
    },
    "contemporary": {
        "title": "Contemporary Family Room",
        "palette": ["#ebe7df", "#7d8f8a", "#36424a", "#b98c6b"],
        "rationale": "Balanced color, practical zones, streamlined furniture, and durable materials.",
    },
    "industrial": {
        "title": "Refined Industrial Loft",
        "palette": ["#ddd8cd", "#8b8174", "#303433", "#a96f55"],
        "rationale": "Textured surfaces, darker metal details, and a grounded loft-like composition.",
    },
}


class RedesignGenerator:
    def generate(self, source_path: Path, output_dir: Path, project_id: str, brief: DesignBrief) -> list[DesignConcept]:
        themes = brief.themes or ["modern", "luxury", "minimal", "contemporary"]
        concepts: list[DesignConcept] = []
        for index, theme in enumerate(themes[:5]):
            key = theme.lower().strip()
            kit = THEME_KITS.get(key, THEME_KITS["modern"])
            filename = f"concept-{index + 1}-{key.replace(' ', '-')}.jpg"
            palette = list(kit["palette"])
            if brief.palette:
                palette = (brief.palette + palette)[:4]
            self._render_concept(source_path, output_dir / filename, brief.room_type, key, palette)
            concepts.append(
                DesignConcept(
                    id=f"{project_id}-{index + 1}",
                    projectId=project_id,
                    theme=key,
                    title=str(kit["title"]),
                    rationale=str(kit["rationale"]),
                    previewUrl=f"__ASSET__/{filename}",
                    palette=palette,
                    score=round(0.91 - index * 0.04, 2),
                )
            )
        return concepts

    def _render_concept(
        self,
        source_path: Path,
        output_path: Path,
        room_type: str,
        theme: str,
        palette: list[str],
    ) -> None:
        base = Image.open(source_path).convert("RGB")
        image = ImageEnhance.Color(base).enhance(0.52)
        image = ImageEnhance.Contrast(image).enhance(1.08)
        image = ImageEnhance.Brightness(image).enhance(1.04)
        width, height = image.size
        floor_y = int(height * 0.61)

        wall = _rgba(palette[0], 86)
        floor = _rgba(palette[1], 100)
        accent = _rgba(palette[2], 230)
        secondary = _rgba(palette[3] if len(palette) > 3 else palette[1], 220)

        overlay = Image.new("RGB", image.size, wall[:3])
        image = Image.blend(image, overlay, 0.18)
        draw = ImageDraw.Draw(image, "RGBA")

        draw.rectangle((0, 0, width, floor_y), fill=wall)
        draw.polygon([(0, floor_y), (width, floor_y), (width, height), (0, height)], fill=floor)
        self._soft_room_shadows(draw, width, height, floor_y)
        self._floor_grid(draw, width, height, floor_y)
        self._architectural_features(draw, width, floor_y, accent, theme)
        self._furniture(draw, width, height, room_type.lower(), accent, secondary, theme)
        self._decor(draw, width, height, floor_y, accent, secondary, theme)
        self._lighting(draw, width, height, theme)

        vignette = Image.new("L", image.size, 0)
        vdraw = ImageDraw.Draw(vignette)
        vdraw.ellipse((-width * 0.08, -height * 0.16, width * 1.08, height * 1.18), fill=130)
        vignette = vignette.filter(ImageFilter.GaussianBlur(max(width, height) // 18))
        image = Image.composite(image, Image.new("RGB", image.size, "#161513"), Image.eval(vignette, lambda p: 255 - p))
        image = ImageEnhance.Sharpness(image).enhance(1.08)
        image.save(output_path, format="JPEG", quality=90, optimize=True)

    @staticmethod
    def _floor_grid(draw: ImageDraw.ImageDraw, width: int, height: int, floor_y: int) -> None:
        for index in range(1, 8):
            y = floor_y + int((height - floor_y) * index / 8)
            draw.line((0, y, width, y), fill=(255, 255, 255, 32), width=max(1, width // 620))
        for index in range(-5, 6):
            x = int(width * (0.5 + index * 0.12))
            draw.line((width // 2, floor_y, x, height), fill=(20, 19, 17, 24), width=max(1, width // 760))

    @staticmethod
    def _soft_room_shadows(draw: ImageDraw.ImageDraw, width: int, height: int, floor_y: int) -> None:
        draw.rectangle((0, floor_y - max(3, height // 120), width, floor_y + max(4, height // 100)), fill=(35, 32, 28, 28))
        draw.polygon(
            [
                (0, floor_y),
                (int(width * 0.12), floor_y),
                (int(width * 0.02), height),
                (0, height),
            ],
            fill=(0, 0, 0, 24),
        )
        draw.polygon(
            [
                (int(width * 0.88), floor_y),
                (width, floor_y),
                (width, height),
                (int(width * 0.98), height),
            ],
            fill=(0, 0, 0, 20),
        )

    @staticmethod
    def _architectural_features(
        draw: ImageDraw.ImageDraw,
        width: int,
        floor_y: int,
        accent: tuple[int, int, int, int],
        theme: str,
    ) -> None:
        if theme == "industrial":
            for left in (int(width * 0.08), int(width * 0.72)):
                draw.rectangle((left, int(floor_y * 0.18), left + int(width * 0.18), int(floor_y * 0.78)), outline=(40, 42, 40, 100), width=max(2, width // 280))
            return
        draw.rounded_rectangle(
            (int(width * 0.1), int(floor_y * 0.18), int(width * 0.32), int(floor_y * 0.74)),
            radius=max(8, width // 100),
            outline=(38, 36, 31, 70),
            width=max(2, width // 340),
        )
        draw.rounded_rectangle(
            (int(width * 0.66), int(floor_y * 0.18), int(width * 0.9), int(floor_y * 0.74)),
            radius=max(8, width // 100),
            outline=(38, 36, 31, 70),
            width=max(2, width // 340),
        )
        draw.rounded_rectangle(
            (int(width * 0.43), int(floor_y * 0.2), int(width * 0.57), int(floor_y * 0.34)),
            radius=max(5, width // 160),
            fill=(accent[0], accent[1], accent[2], 140),
        )
        draw.line((int(width * 0.5), int(floor_y * 0.34), int(width * 0.5), floor_y), fill=(20, 20, 18, 18), width=max(1, width // 900))

    @staticmethod
    def _furniture(
        draw: ImageDraw.ImageDraw,
        width: int,
        height: int,
        room_type: str,
        accent: tuple[int, int, int, int],
        secondary: tuple[int, int, int, int],
        theme: str,
    ) -> None:
        dark = (38, 40, 38, 230)
        if "bed" in room_type:
            draw.ellipse((int(width * 0.18), int(height * 0.82), int(width * 0.84), int(height * 0.98)), fill=(0, 0, 0, 34))
            draw.rounded_rectangle((int(width * 0.2), int(height * 0.42), int(width * 0.8), int(height * 0.68)), radius=18, fill=(secondary[0], secondary[1], secondary[2], 190))
            draw.rounded_rectangle((int(width * 0.16), int(height * 0.58), int(width * 0.84), int(height * 0.91)), radius=20, fill=(240, 236, 226, 230))
            draw.rounded_rectangle((int(width * 0.24), int(height * 0.66), int(width * 0.76), int(height * 0.82)), radius=14, fill=(accent[0], accent[1], accent[2], 150))
            draw.rounded_rectangle((int(width * 0.25), int(height * 0.59), int(width * 0.43), int(height * 0.7)), radius=10, fill=(255, 253, 247, 210))
            draw.rounded_rectangle((int(width * 0.57), int(height * 0.59), int(width * 0.75), int(height * 0.7)), radius=10, fill=(255, 253, 247, 210))
            return
        if "kitchen" in room_type:
            draw.ellipse((int(width * 0.25), int(height * 0.84), int(width * 0.76), int(height * 0.98)), fill=(0, 0, 0, 34))
            draw.rounded_rectangle((int(width * 0.08), int(height * 0.48), int(width * 0.92), int(height * 0.72)), radius=12, fill=(secondary[0], secondary[1], secondary[2], 220))
            draw.rectangle((int(width * 0.08), int(height * 0.48), int(width * 0.92), int(height * 0.52)), fill=(245, 242, 233, 210))
            draw.rounded_rectangle((int(width * 0.28), int(height * 0.72), int(width * 0.72), int(height * 0.91)), radius=14, fill=(accent[0], accent[1], accent[2], 160))
            for handle in range(6):
                x = int(width * 0.14) + handle * int(width * 0.12)
                draw.rounded_rectangle((x, int(height * 0.58), x + int(width * 0.035), int(height * 0.595)), radius=3, fill=(45, 43, 38, 85))
            return
        sofa_fill = (accent[0], accent[1], accent[2], 225) if theme in {"contemporary", "industrial"} else (232, 226, 214, 235)
        draw.ellipse((int(width * 0.18), int(height * 0.78), int(width * 0.82), int(height * 0.97)), fill=(accent[0], accent[1], accent[2], 90))
        draw.ellipse((int(width * 0.16), int(height * 0.73), int(width * 0.74), int(height * 0.86)), fill=(0, 0, 0, 30))
        draw.rounded_rectangle((int(width * 0.18), int(height * 0.58), int(width * 0.72), int(height * 0.78)), radius=22, fill=sofa_fill)
        draw.rounded_rectangle((int(width * 0.22), int(height * 0.5), int(width * 0.68), int(height * 0.62)), radius=16, fill=(sofa_fill[0], sofa_fill[1], sofa_fill[2], 215))
        for index in range(1, 3):
            x = int(width * (0.18 + index * 0.18))
            draw.line((x, int(height * 0.59), x, int(height * 0.77)), fill=(255, 255, 255, 46), width=max(1, width // 520))
        draw.rounded_rectangle((int(width * 0.24), int(height * 0.56), int(width * 0.34), int(height * 0.65)), radius=10, fill=(255, 250, 238, 170))
        draw.rounded_rectangle((int(width * 0.56), int(height * 0.56), int(width * 0.66), int(height * 0.65)), radius=10, fill=(secondary[0], secondary[1], secondary[2], 170))
        draw.rounded_rectangle((int(width * 0.34), int(height * 0.8), int(width * 0.64), int(height * 0.89)), radius=12, fill=(secondary[0], secondary[1], secondary[2], 225))
        draw.rounded_rectangle((int(width * 0.35), int(height * 0.795), int(width * 0.65), int(height * 0.815)), radius=8, fill=(255, 255, 255, 84))
        draw.rounded_rectangle((int(width * 0.74), int(height * 0.5), int(width * 0.79), int(height * 0.78)), radius=8, fill=dark)

    @staticmethod
    def _decor(
        draw: ImageDraw.ImageDraw,
        width: int,
        height: int,
        floor_y: int,
        accent: tuple[int, int, int, int],
        secondary: tuple[int, int, int, int],
        theme: str,
    ) -> None:
        planter = (int(width * 0.82), int(height * 0.73), int(width * 0.89), int(height * 0.9))
        draw.rounded_rectangle(planter, radius=max(6, width // 150), fill=(secondary[0], secondary[1], secondary[2], 210))
        stem_x = int(width * 0.855)
        stem_y = int(height * 0.72)
        for offset in (-32, -18, 0, 18, 32):
            draw.line((stem_x, stem_y + int(height * 0.12), stem_x + int(width * offset / 900), stem_y), fill=(67, 91, 67, 190), width=max(2, width // 420))
            draw.ellipse((stem_x + int(width * offset / 900) - 10, stem_y - 14, stem_x + int(width * offset / 900) + 18, stem_y + 12), fill=(81, 111, 78, 150))
        if theme == "luxury":
            draw.rounded_rectangle((int(width * 0.12), int(height * 0.2), int(width * 0.2), int(height * 0.44)), radius=8, fill=(196, 163, 90, 120))
        else:
            draw.rounded_rectangle((int(width * 0.12), int(height * 0.2), int(width * 0.24), int(height * 0.42)), radius=8, fill=(255, 255, 255, 90))
        draw.rounded_rectangle((int(width * 0.735), int(height * 0.39), int(width * 0.825), int(height * 0.43)), radius=6, fill=(accent[0], accent[1], accent[2], 155))

    @staticmethod
    def _lighting(draw: ImageDraw.ImageDraw, width: int, height: int, theme: str) -> None:
        glow = (255, 242, 205, 150) if theme != "industrial" else (245, 215, 170, 130)
        draw.ellipse((int(width * 0.42), int(height * 0.05), int(width * 0.58), int(height * 0.22)), fill=glow)
        draw.ellipse((int(width * 0.35), int(height * 0.18), int(width * 0.65), int(height * 0.66)), fill=(255, 245, 212, 28))


def _rgba(value: str, alpha: int) -> tuple[int, int, int, int]:
    color = value.strip().lstrip("#")
    if len(color) == 3:
        color = "".join(ch * 2 for ch in color)
    if len(color) != 6:
        color = "d8d1c2"
    return (int(color[:2], 16), int(color[2:4], 16), int(color[4:], 16), alpha)
