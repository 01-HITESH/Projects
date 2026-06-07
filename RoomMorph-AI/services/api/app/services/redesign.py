from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

from app.core.config import settings
from app.models.schemas import BudgetEstimate, DesignBrief, DesignConcept, MaterialPlanItem, ScoreBreakdown
from app.services.image_generation import OpenAIImageEditProvider


THEME_KITS: dict[str, dict[str, object]] = {
    "modern": {
        "title": "Soft Modern Reset",
        "palette": ["#f3f0e8", "#9aa58f", "#2f3430", "#c7b299"],
        "rationale": "Clean walls, low-profile seating, warm wood, and measured contrast.",
        "highlights": ["Warm neutral shell", "Low clutter furniture", "Balanced ambient lighting"],
        "tradeoffs": ["Light fabrics need routine spot cleaning", "Minimal storage must be planned carefully"],
    },
    "luxury": {
        "title": "Quiet Luxury Suite",
        "palette": ["#f6f1e7", "#c4a35a", "#2e2d2a", "#e7dfcf"],
        "rationale": "Layered lighting, richer finishes, brass accents, and softened surfaces.",
        "highlights": ["Premium finish palette", "Layered ceiling and task lighting", "Statement accent materials"],
        "tradeoffs": ["Higher execution cost", "Metallic finishes require careful contractor detailing"],
    },
    "minimal": {
        "title": "Minimal Calm Plan",
        "palette": ["#f7f6f1", "#d8d5ca", "#6e776d", "#b9aa91"],
        "rationale": "Decluttered layout with pale finishes, hidden storage, and airy negative space.",
        "highlights": ["Open circulation", "Hidden storage strategy", "Easy-to-scan calm composition"],
        "tradeoffs": ["Needs disciplined storage use", "Pale surfaces show dust faster"],
    },
    "contemporary": {
        "title": "Contemporary Family Room",
        "palette": ["#ebe7df", "#7d8f8a", "#36424a", "#b98c6b"],
        "rationale": "Balanced color, practical zones, streamlined furniture, and durable materials.",
        "highlights": ["Durable daily-use materials", "Flexible family seating", "Good color contrast"],
        "tradeoffs": ["More objects in view", "Accent color may need sampling on real walls"],
    },
    "industrial": {
        "title": "Refined Industrial Loft",
        "palette": ["#ddd8cd", "#8b8174", "#303433", "#a96f55"],
        "rationale": "Textured surfaces, darker metal details, and a grounded loft-like composition.",
        "highlights": ["Strong material identity", "Hard-wearing metal and wood details", "High visual contrast"],
        "tradeoffs": ["Dark finishes can reduce perceived brightness", "Texture work needs skilled labor"],
    },
}


class RedesignGenerator:
    def __init__(self) -> None:
        self.image_provider = OpenAIImageEditProvider()

    def generate(
        self,
        source_path: Path,
        output_dir: Path,
        project_id: str,
        brief: DesignBrief,
    ) -> list[DesignConcept]:
        themes = brief.themes or ["modern", "luxury", "minimal", "contemporary"]
        concepts: list[DesignConcept] = []
        for index, theme in enumerate(themes[:5]):
            key = theme.lower().strip()
            kit = THEME_KITS.get(key, THEME_KITS["modern"])
            filename = f"concept-{index + 1}-{key.replace(' ', '-')}.{_output_extension()}"
            palette = list(kit["palette"])
            if brief.palette:
                palette = (brief.palette + palette)[:4]
            preview_url = f"__ASSET__/{filename}"
            output_path = output_dir / filename
            self._generate_concept_image(source_path, output_path, brief, key, palette, str(kit["title"]))
            concepts.append(
                DesignConcept(
                    id=f"{project_id}-{index + 1}",
                    projectId=project_id,
                    theme=key,
                    title=str(kit["title"]),
                    rationale=str(kit["rationale"]),
                    previewUrl=preview_url,
                    palette=palette,
                    score=round(0.91 - index * 0.04, 2),
                    scoreBreakdown=_score_breakdown(brief, key, index),
                    budget=_budget_estimate(brief, key, index),
                    highlights=_highlights(brief, kit, key),
                    tradeoffs=_tradeoffs(brief, kit, key),
                    materialPlan=_material_plan(brief.room_type.lower(), key, palette),
                )
            )
        return concepts

    def _generate_concept_image(
        self,
        source_path: Path,
        output_path: Path,
        brief: DesignBrief,
        theme: str,
        palette: list[str],
        title: str,
    ) -> None:
        provider = settings.image_generation_provider.lower().strip()
        if provider == "local":
            self._render_concept(source_path, output_path, brief.room_type, theme, palette)
            return
        if provider != "openai":
            raise RuntimeError(f"Unsupported IMAGE_GENERATION_PROVIDER: {settings.image_generation_provider}")

        prompt = _image_prompt(brief, theme, palette, title)
        self.image_provider.generate_room_redesign(source_path, output_path, prompt)

    def _render_concept(
        self,
        source_path: Path,
        output_path: Path,
        room_type: str,
        theme: str,
        palette: list[str],
    ) -> None:
        base = ImageOps.exif_transpose(Image.open(source_path)).convert("RGB")
        base = _prepare_render_canvas(base)
        image = ImageEnhance.Color(base).enhance(0.94)
        image = ImageEnhance.Contrast(image).enhance(1.03)
        image = ImageEnhance.Brightness(image).enhance(1.02)
        width, height = image.size
        floor_y = _estimate_floor_line(image)

        wall = _rgba(palette[0], 72)
        floor = _rgba(palette[1], 88)
        accent = _rgba(palette[2], 235)
        secondary = _rgba(palette[3] if len(palette) > 3 else palette[1], 232)

        image = self._redecorate_surfaces(image, width, height, floor_y, wall, floor, theme)
        image = self._architectural_features(image, width, height, floor_y, accent, secondary, theme)
        image = self._furniture(image, width, height, floor_y, room_type.lower(), accent, secondary, theme)
        image = self._decor(image, width, height, floor_y, accent, secondary, theme)
        image = self._lighting(image, width, height, floor_y, theme)
        image = self._finish_like_photo(image, width, height)
        image.save(output_path, format="JPEG", quality=90, optimize=True)

    @staticmethod
    def _redecorate_surfaces(
        image: Image.Image,
        width: int,
        height: int,
        floor_y: int,
        wall: tuple[int, int, int, int],
        floor: tuple[int, int, int, int],
        theme: str,
    ) -> Image.Image:
        overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))

        wall_texture = _texture_layer(image.size, wall[:3], 16, 20)
        floor_texture = _texture_layer(image.size, floor[:3], 26, 26)
        wall_mask = Image.new("L", image.size, 0)
        floor_mask = Image.new("L", image.size, 0)
        mask_draw = ImageDraw.Draw(wall_mask)
        mask_draw.rectangle((0, 0, width, floor_y + max(4, height // 90)), fill=wall[3])
        mask_draw = ImageDraw.Draw(floor_mask)
        mask_draw.polygon([(0, floor_y - max(2, height // 140)), (width, floor_y - max(2, height // 140)), (width, height), (0, height)], fill=floor[3])
        wall_mask = wall_mask.filter(ImageFilter.GaussianBlur(max(4, width // 160)))
        floor_mask = floor_mask.filter(ImageFilter.GaussianBlur(max(5, width // 140)))
        empty = Image.new("RGBA", image.size, (0, 0, 0, 0))
        overlay = Image.alpha_composite(overlay, Image.composite(wall_texture, empty, wall_mask))
        overlay = Image.alpha_composite(overlay, Image.composite(floor_texture, empty, floor_mask))

        room = Image.alpha_composite(image.convert("RGBA"), overlay)
        draw = ImageDraw.Draw(room, "RGBA")
        trim_h = max(5, height // 65)
        draw.rectangle((0, floor_y - trim_h, width, floor_y - max(1, trim_h // 2)), fill=(255, 255, 255, 62))
        draw.rectangle((0, floor_y - max(1, trim_h // 2), width, floor_y + max(2, height // 180)), fill=(36, 34, 30, 28))
        _wood_planks(draw, width, height, floor_y, floor, theme)
        _wall_light_falloff(draw, width, floor_y)
        return room.convert("RGB")

    @staticmethod
    def _architectural_features(
        image: Image.Image,
        width: int,
        height: int,
        floor_y: int,
        accent: tuple[int, int, int, int],
        secondary: tuple[int, int, int, int],
        theme: str,
    ) -> Image.Image:
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        if theme == "industrial":
            for left in (int(width * 0.08), int(width * 0.72)):
                frame = (left, int(floor_y * 0.2), left + int(width * 0.18), int(floor_y * 0.76))
                _photo_round(draw, _offset(frame, max(3, width // 260), max(5, height // 220)), (0, 0, 0, 28), max(8, width // 120), "metal")
                _photo_round(draw, frame, (44, 46, 42, 126), max(8, width // 120), "metal")
                draw.rectangle(_inset(frame, max(7, width // 90)), fill=(220, 225, 216, 26))
            draw.rectangle((int(width * 0.05), int(floor_y * 0.12), int(width * 0.95), int(floor_y * 0.16)), fill=(44, 45, 41, 44))
            return Image.alpha_composite(image.convert("RGBA"), layer).convert("RGB")

        left_panel = (int(width * 0.11), int(floor_y * 0.22), int(width * 0.29), int(floor_y * 0.66))
        right_panel = (int(width * 0.7), int(floor_y * 0.21), int(width * 0.88), int(floor_y * 0.65))
        for panel in (left_panel, right_panel):
            draw.rounded_rectangle(
                _offset(panel, max(3, width // 260), max(5, height // 230)),
                radius=max(8, width // 100),
                fill=(0, 0, 0, 24),
            )
            draw.rounded_rectangle(
                panel,
                radius=max(8, width // 100),
                fill=(255, 255, 255, 24),
                outline=(38, 36, 31, 52),
                width=max(2, width // 340),
            )
            draw.rectangle(
                (panel[0] + max(5, width // 130), panel[1] + max(5, width // 130), panel[2] - max(5, width // 130), panel[3] - max(5, width // 130)),
                fill=(secondary[0], secondary[1], secondary[2], 18),
            )

        draw.rounded_rectangle(
            (int(width * 0.42), int(floor_y * 0.2), int(width * 0.59), int(floor_y * 0.38)),
            radius=max(8, width // 100),
            fill=(accent[0], accent[1], accent[2], 92),
        )
        draw.ellipse((int(width * 0.48), int(floor_y * 0.06), int(width * 0.53), int(floor_y * 0.15)), fill=(255, 244, 210, 78))
        draw.line((int(width * 0.505), int(floor_y * 0.15), int(width * 0.505), int(floor_y * 0.2)), fill=(20, 20, 18, 32), width=max(1, width // 700))
        return Image.alpha_composite(image.convert("RGBA"), layer).convert("RGB")

    @staticmethod
    def _furniture(
        image: Image.Image,
        width: int,
        height: int,
        floor_y: int,
        room_type: str,
        accent: tuple[int, int, int, int],
        secondary: tuple[int, int, int, int],
        theme: str,
    ) -> Image.Image:
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        dark = (38, 40, 38, 238)
        wood = secondary
        stone = (238, 235, 226, 236)
        if "bed" in room_type:
            _soft_shadow(draw, (int(width * 0.17), int(height * 0.82), int(width * 0.85), int(height * 0.98)))
            _photo_round(draw, (int(width * 0.2), int(height * 0.42), int(width * 0.8), int(height * 0.68)), secondary, max(14, width // 50), "wood")
            _photo_round(draw, (int(width * 0.16), int(height * 0.58), int(width * 0.84), int(height * 0.91)), (240, 236, 226, 240), max(18, width // 42), "linen")
            _photo_round(draw, (int(width * 0.24), int(height * 0.66), int(width * 0.76), int(height * 0.82)), (accent[0], accent[1], accent[2], 174), max(12, width // 70), "fabric")
            _photo_round(draw, (int(width * 0.25), int(height * 0.59), int(width * 0.43), int(height * 0.7)), (255, 253, 247, 226), max(8, width // 90), "linen")
            _photo_round(draw, (int(width * 0.57), int(height * 0.59), int(width * 0.75), int(height * 0.7)), (255, 253, 247, 226), max(8, width // 90), "linen")
            return _merge_photo_layer(image, layer)
        if "kitchen" in room_type:
            _soft_shadow(draw, (int(width * 0.22), int(height * 0.82), int(width * 0.78), int(height * 0.98)))
            _photo_round(draw, (int(width * 0.08), int(height * 0.48), int(width * 0.92), int(height * 0.72)), wood, max(10, width // 85), "wood")
            _photo_round(draw, (int(width * 0.08), int(height * 0.47), int(width * 0.92), int(height * 0.53)), stone, max(5, width // 160), "stone")
            _photo_round(draw, (int(width * 0.28), int(height * 0.72), int(width * 0.72), int(height * 0.91)), (accent[0], accent[1], accent[2], 176), max(12, width // 70), "wood")
            _photo_round(draw, (int(width * 0.26), int(height * 0.71), int(width * 0.74), int(height * 0.76)), stone, max(6, width // 150), "stone")
            for handle in range(6):
                x = int(width * 0.14) + handle * int(width * 0.12)
                draw.rounded_rectangle((x, int(height * 0.58), x + int(width * 0.035), int(height * 0.595)), radius=3, fill=(45, 43, 38, 120))
            return _merge_photo_layer(image, layer)
        if "office" in room_type:
            _soft_shadow(draw, (int(width * 0.26), int(height * 0.74), int(width * 0.75), int(height * 0.94)))
            _photo_round(draw, (int(width * 0.2), int(height * 0.55), int(width * 0.78), int(height * 0.64)), wood, max(8, width // 100), "wood")
            for x in (int(width * 0.25), int(width * 0.73)):
                _photo_round(draw, (x, int(height * 0.62), x + int(width * 0.035), int(height * 0.85)), dark, max(3, width // 200), "metal")
            _photo_round(draw, (int(width * 0.43), int(height * 0.65), int(width * 0.58), int(height * 0.86)), (accent[0], accent[1], accent[2], 224), max(10, width // 80), "fabric")
            _photo_round(draw, (int(width * 0.08), int(height * 0.34), int(width * 0.18), int(height * 0.8)), wood, max(8, width // 100), "wood")
            return _merge_photo_layer(image, layer)

        sofa_fill = (
            (accent[0], accent[1], accent[2], 238)
            if theme in {"contemporary", "industrial"}
            else (210, 204, 192, 246)
        )
        sofa_top = max(floor_y + int((height - floor_y) * 0.12), int(height * 0.54))
        sofa_seat = max(floor_y + int((height - floor_y) * 0.24), int(height * 0.63))
        sofa_bottom = min(height - int(height * 0.12), floor_y + int((height - floor_y) * 0.68))
        rug = (int(width * 0.14), sofa_bottom - int(height * 0.04), int(width * 0.78), min(height - int(height * 0.04), sofa_bottom + int(height * 0.17)))
        draw.rounded_rectangle(
            rug,
            radius=max(18, width // 34),
            fill=(secondary[0], secondary[1], secondary[2], 148),
        )
        draw.rounded_rectangle(
            _inset(rug, max(6, width // 90)),
            radius=max(14, width // 44),
            outline=(255, 255, 255, 34),
            width=max(1, width // 520),
        )
        _soft_shadow(draw, (int(width * 0.12), sofa_bottom - int(height * 0.04), int(width * 0.78), sofa_bottom + int(height * 0.09)), (0, 0, 0, 46))
        _soft_shadow(draw, (int(width * 0.22), sofa_bottom + int(height * 0.01), int(width * 0.74), sofa_bottom + int(height * 0.13)), (accent[0], accent[1], accent[2], 34))
        _photo_round(draw, (int(width * 0.17), sofa_seat, int(width * 0.73), sofa_bottom), sofa_fill, max(18, width // 44), "fabric")
        _photo_round(draw, (int(width * 0.21), sofa_top, int(width * 0.69), sofa_seat + int(height * 0.035)), (sofa_fill[0], sofa_fill[1], sofa_fill[2], 232), max(14, width // 58), "fabric")
        for index in range(1, 3):
            x = int(width * (0.18 + index * 0.18))
            draw.line((x, sofa_seat, x, sofa_bottom - int(height * 0.02)), fill=(255, 255, 255, 38), width=max(1, width // 620))
        _photo_round(draw, (int(width * 0.24), sofa_top + int(height * 0.04), int(width * 0.34), sofa_seat + int(height * 0.05)), (255, 250, 238, 184), max(8, width // 100), "linen")
        _photo_round(draw, (int(width * 0.56), sofa_top + int(height * 0.04), int(width * 0.66), sofa_seat + int(height * 0.05)), (secondary[0], secondary[1], secondary[2], 172), max(8, width // 100), "fabric")
        table_top = floor_y + int((height - floor_y) * 0.6)
        table_bottom = floor_y + int((height - floor_y) * 0.79)
        _soft_shadow(draw, (int(width * 0.3), table_bottom - int(height * 0.02), int(width * 0.68), table_bottom + int(height * 0.05)), (0, 0, 0, 32))
        _photo_round(draw, (int(width * 0.34), table_top, int(width * 0.64), table_bottom), secondary, max(10, width // 80), "wood")
        _photo_round(draw, (int(width * 0.35), table_top - int(height * 0.01), int(width * 0.65), table_top + int(height * 0.035)), (255, 255, 255, 110), max(6, width // 120), "stone")
        _photo_round(draw, (int(width * 0.75), sofa_top, int(width * 0.8), sofa_bottom), dark, max(6, width // 100), "metal")
        return _merge_photo_layer(image, layer)

    @staticmethod
    def _decor(
        image: Image.Image,
        width: int,
        height: int,
        floor_y: int,
        accent: tuple[int, int, int, int],
        secondary: tuple[int, int, int, int],
        theme: str,
    ) -> Image.Image:
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        planter_bottom = floor_y + int((height - floor_y) * 0.75)
        planter = (int(width * 0.82), planter_bottom - int(height * 0.17), int(width * 0.89), planter_bottom)
        _soft_shadow(draw, (planter[0] - int(width * 0.012), planter_bottom - int(height * 0.02), planter[2] + int(width * 0.02), planter_bottom + int(height * 0.05)), (0, 0, 0, 36))
        _photo_round(draw, planter, (secondary[0], secondary[1], secondary[2], 220), max(6, width // 150), "ceramic")
        stem_x = int(width * 0.855)
        stem_y = planter[1]
        for offset in (-32, -18, 0, 18, 32):
            draw.line((stem_x, stem_y + int(height * 0.13), stem_x + int(width * offset / 900), stem_y - int(height * 0.08)), fill=(67, 91, 67, 174), width=max(2, width // 420))
            leaf = (stem_x + int(width * offset / 900) - int(width * 0.014), stem_y - int(height * 0.11), stem_x + int(width * offset / 900) + int(width * 0.03), stem_y + int(height * 0.02))
            draw.ellipse(leaf, fill=(81, 111, 78, 166), outline=(44, 72, 48, 80))
        if theme == "luxury":
            _photo_round(draw, (int(width * 0.12), int(floor_y * 0.23), int(width * 0.2), int(floor_y * 0.47)), (196, 163, 90, 112), max(7, width // 120), "metal")
        else:
            _photo_round(draw, (int(width * 0.12), int(floor_y * 0.24), int(width * 0.24), int(floor_y * 0.46)), (255, 255, 255, 76), max(7, width // 120), "canvas")
        _photo_round(draw, (int(width * 0.735), int(floor_y * 0.7), int(width * 0.825), int(floor_y * 0.78)), (accent[0], accent[1], accent[2], 136), max(5, width // 180), "fabric")
        return _merge_photo_layer(image, layer)

    @staticmethod
    def _lighting(image: Image.Image, width: int, height: int, floor_y: int, theme: str) -> Image.Image:
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        glow = (255, 242, 205, 84) if theme != "industrial" else (245, 215, 170, 78)
        draw.ellipse((int(width * 0.42), int(height * 0.035), int(width * 0.58), int(height * 0.22)), fill=glow)
        draw.ellipse((int(width * 0.25), int(height * 0.09), int(width * 0.75), int(height * 0.7)), fill=(255, 245, 212, 20))
        draw.polygon([(0, floor_y), (int(width * 0.5), floor_y), (int(width * 0.18), height), (0, height)], fill=(0, 0, 0, 18))
        draw.polygon([(int(width * 0.52), floor_y), (width, floor_y), (width, height), (int(width * 0.82), height)], fill=(255, 255, 255, 12))
        return Image.alpha_composite(image.convert("RGBA"), layer.filter(ImageFilter.GaussianBlur(max(1, width // 520)))).convert("RGB")

    @staticmethod
    def _finish_like_photo(image: Image.Image, width: int, height: int) -> Image.Image:
        vignette = Image.new("L", image.size, 0)
        vdraw = ImageDraw.Draw(vignette)
        vdraw.ellipse((-width * 0.08, -height * 0.16, width * 1.08, height * 1.18), fill=182)
        vignette = vignette.filter(ImageFilter.GaussianBlur(max(width, height) // 14))
        image = Image.composite(image, Image.new("RGB", image.size, "#141611"), vignette)
        grain = Image.effect_noise(image.size, 4).convert("L")
        grain_rgba = Image.merge("RGBA", (grain, grain, grain, Image.new("L", image.size, 10)))
        image = Image.alpha_composite(image.convert("RGBA"), grain_rgba).convert("RGB")
        image = ImageEnhance.Color(image).enhance(1.02)
        image = ImageEnhance.Contrast(image).enhance(1.03)
        image = ImageEnhance.Sharpness(image).enhance(1.08)
        return image


def _rgba(value: str, alpha: int) -> tuple[int, int, int, int]:
    color = value.strip().lstrip("#")
    if len(color) == 3:
        color = "".join(ch * 2 for ch in color)
    if len(color) != 6:
        color = "d8d1c2"
    return (int(color[:2], 16), int(color[2:4], 16), int(color[4:], 16), alpha)


def _prepare_render_canvas(image: Image.Image) -> Image.Image:
    width, height = image.size
    target_width = max(width, 960)
    if width >= target_width:
        return image

    target_height = max(1, int(height * target_width / width))
    return image.resize((target_width, target_height), Image.Resampling.LANCZOS)


def _estimate_floor_line(image: Image.Image) -> int:
    width, height = image.size
    grayscale = ImageOps.grayscale(image).filter(ImageFilter.GaussianBlur(max(1, width // 420)))
    sample_width = min(width, 180)
    sample_height = min(height, 140)
    sample = grayscale.resize((sample_width, sample_height), Image.Resampling.BILINEAR)
    pixels = sample.load()

    best_y = int(sample_height * 0.62)
    best_score = -1
    start = int(sample_height * 0.42)
    end = int(sample_height * 0.78)
    for y in range(start, end):
        row_score = 0
        for x in range(2, sample_width - 2):
            row_score += abs(int(pixels[x, y]) - int(pixels[x, y - 2]))
        if row_score > best_score:
            best_score = row_score
            best_y = y

    floor_y = int(best_y * height / sample_height)
    return max(int(height * 0.48), min(int(height * 0.72), floor_y))


def _texture_layer(
    size: tuple[int, int],
    color: tuple[int, int, int],
    spacing: int,
    alpha: int,
) -> Image.Image:
    width, height = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    spacing = max(8, spacing)
    highlight = tuple(min(255, channel + 24) for channel in color)
    shadow = tuple(max(0, channel - 28) for channel in color)

    for y in range(-height, height * 2, spacing * 2):
        draw.line((0, y, width, y + int(width * 0.08)), fill=(*highlight, max(3, alpha // 5)), width=1)
    for x in range(0, width, spacing * 5):
        draw.line((x, 0, x + int(width * 0.04), height), fill=(*shadow, max(2, alpha // 7)), width=1)

    grain = Image.effect_noise(size, 5).convert("L")
    grain_alpha = Image.new("L", size, max(3, alpha // 8))
    grain_layer = Image.merge("RGBA", (grain, grain, grain, grain_alpha))
    layer = Image.alpha_composite(layer, grain_layer)
    return layer.filter(ImageFilter.GaussianBlur(0.8))


def _wood_planks(
    draw: ImageDraw.ImageDraw,
    width: int,
    height: int,
    floor_y: int,
    floor: tuple[int, int, int, int],
    theme: str,
) -> None:
    line_alpha = 8 if theme != "minimal" else 5
    plank_count = 7
    for index in range(1, plank_count):
        y = floor_y + int((height - floor_y) * index / plank_count)
        draw.line((0, y, width, y + max(1, height // 140)), fill=(255, 255, 255, line_alpha), width=max(1, width // 1100))


def _wall_light_falloff(draw: ImageDraw.ImageDraw, width: int, floor_y: int) -> None:
    draw.polygon(
        [(0, 0), (int(width * 0.16), 0), (int(width * 0.08), floor_y), (0, floor_y)],
        fill=(0, 0, 0, 18),
    )
    draw.polygon(
        [(int(width * 0.84), 0), (width, 0), (width, floor_y), (int(width * 0.92), floor_y)],
        fill=(255, 255, 255, 14),
    )


def _offset(rect: tuple[int, int, int, int], x: int, y: int) -> tuple[int, int, int, int]:
    return (rect[0] + x, rect[1] + y, rect[2] + x, rect[3] + y)


def _inset(rect: tuple[int, int, int, int], amount: int) -> tuple[int, int, int, int]:
    return (rect[0] + amount, rect[1] + amount, rect[2] - amount, rect[3] - amount)


def _soft_shadow(
    draw: ImageDraw.ImageDraw,
    rect: tuple[int, int, int, int],
    fill: tuple[int, int, int, int] = (0, 0, 0, 34),
) -> None:
    draw.ellipse(rect, fill=fill)


def _photo_round(
    draw: ImageDraw.ImageDraw,
    rect: tuple[int, int, int, int],
    fill: tuple[int, int, int, int],
    radius: int,
    material: str,
) -> None:
    radius = max(1, radius)
    draw.rounded_rectangle(rect, radius=radius, fill=fill)

    left, top, right, bottom = rect
    width = max(1, right - left)
    height = max(1, bottom - top)
    highlight_alpha = 44 if material in {"stone", "linen", "canvas"} else 24
    shadow_alpha = 24 if material in {"wood", "metal"} else 16
    draw.rounded_rectangle(
        (left + max(1, width // 24), top + max(1, height // 18), right - max(1, width // 24), top + max(2, height // 5)),
        radius=max(1, radius // 2),
        fill=(255, 255, 255, highlight_alpha),
    )
    draw.line((left + radius, bottom - max(2, height // 7), right - radius, bottom - max(2, height // 9)), fill=(0, 0, 0, shadow_alpha), width=max(1, width // 160))

    if material == "wood":
        for index in range(1, 4):
            y = top + int(height * index / 4)
            draw.line((left + radius, y, right - radius, y + max(1, height // 34)), fill=(58, 42, 28, 18), width=max(1, width // 260))
    elif material == "fabric":
        for index in range(1, 4):
            x = left + int(width * index / 4)
            draw.line((x, top + radius, x, bottom - radius), fill=(255, 255, 255, 14), width=1)
    elif material == "metal":
        draw.rounded_rectangle(_inset(rect, max(2, min(width, height) // 8)), radius=max(1, radius // 2), outline=(255, 255, 255, 42), width=1)


def _merge_photo_layer(image: Image.Image, layer: Image.Image) -> Image.Image:
    shadowed = layer.filter(ImageFilter.GaussianBlur(0.12))
    return Image.alpha_composite(image.convert("RGBA"), shadowed).convert("RGB")


def _score_breakdown(brief: DesignBrief, theme: str, index: int) -> ScoreBreakdown:
    priority = brief.priority.lower()
    theme_bonus = 0.04 if theme in [item.lower() for item in brief.themes[:2]] else 0
    budget_bonus = 0.05 if brief.budget_range.lower() in {"starter", "balanced"} and theme in {"minimal", "modern"} else 0
    sustainability_bonus = 0.05 if priority == "sustainability" else 0
    practicality_bonus = 0.05 if priority in {"practicality", "balanced"} else 0
    luxury_penalty = 0.06 if brief.budget_range.lower() == "starter" and theme == "luxury" else 0

    return ScoreBreakdown(
        styleMatch=_clamp(0.88 + theme_bonus - index * 0.025),
        feasibility=_clamp(0.84 + practicality_bonus - luxury_penalty - index * 0.012),
        budgetFit=_clamp(0.78 + budget_bonus - luxury_penalty - index * 0.015),
        maintainability=_clamp(0.76 + practicality_bonus + (0.03 if theme in {"minimal", "contemporary"} else 0)),
        sustainability=_clamp(0.72 + sustainability_bonus + (0.03 if theme in {"modern", "minimal"} else 0)),
    )


def _budget_estimate(brief: DesignBrief, theme: str, index: int) -> BudgetEstimate:
    budget_key = brief.budget_range.lower()
    base_ranges = {
        "starter": (45000, 90000, 2),
        "balanced": (85000, 165000, 3),
        "premium": (165000, 320000, 5),
        "luxury": (280000, 520000, 7),
    }
    low, high, weeks = base_ranges.get(budget_key, base_ranges["balanced"])
    multiplier = {
        "minimal": 0.92,
        "modern": 1.0,
        "contemporary": 1.08,
        "industrial": 1.14,
        "luxury": 1.28,
    }.get(theme, 1.0)
    room_multiplier = 1.15 if "kitchen" in brief.room_type.lower() else 1.0
    low = int(low * multiplier * room_multiplier * (1 + index * 0.035))
    high = int(high * multiplier * room_multiplier * (1 + index * 0.04))
    notes = [
        "Estimate includes paint, movable furniture, lighting, decor, and basic contractor work.",
        "Final cost depends on local material rates and exact room measurements.",
    ]
    if brief.constraints:
        notes.append("Brief constraints were considered while ranking feasibility and budget fit.")
    return BudgetEstimate(
        rangeLabel=brief.budget_range,
        minInr=low,
        maxInr=high,
        timelineWeeks=max(2, weeks + (1 if theme in {"industrial", "luxury"} else 0)),
        confidence=round(0.78 - index * 0.025, 2),
        notes=notes,
    )


def _material_plan(room_type: str, theme: str, palette: list[str]) -> list[MaterialPlanItem]:
    accent = palette[2] if len(palette) > 2 else "#6e776d"
    wood = palette[3] if len(palette) > 3 else "#b9aa91"
    fabric_finish = "performance boucle" if theme == "luxury" else "stain-resistant woven fabric"
    if "kitchen" in room_type:
        return [
            MaterialPlanItem(item="Cabinet shutters", material="HDHMR board", finish=f"matte lacquer in {wood}", durability="High", care="Wipe with microfiber cloth"),
            MaterialPlanItem(item="Countertop", material="quartz or honed stone", finish="low-sheen slab", durability="Very high", care="Use mild cleaner, avoid harsh acids"),
            MaterialPlanItem(item="Backsplash", material="large-format ceramic tile", finish=f"warm neutral {palette[0]}", durability="High", care="Clean grout lines monthly"),
        ]
    if "bed" in room_type:
        return [
            MaterialPlanItem(item="Bed upholstery", material=fabric_finish, finish=f"soft accent {accent}", durability="Medium high", care="Vacuum weekly"),
            MaterialPlanItem(item="Wardrobe", material="engineered wood", finish=f"fluted veneer {wood}", durability="High", care="Dry wipe, avoid standing water"),
            MaterialPlanItem(item="Flooring", material="laminate or engineered wood", finish="satin plank", durability="High", care="Use felt pads under furniture"),
        ]
    if "office" in room_type:
        return [
            MaterialPlanItem(item="Desk", material="plywood with veneer", finish=f"natural wood {wood}", durability="High", care="Use desk mat for laptop heat"),
            MaterialPlanItem(item="Chair", material=fabric_finish, finish=f"muted accent {accent}", durability="Medium high", care="Spot clean spills immediately"),
            MaterialPlanItem(item="Shelving", material="powder-coated metal and veneer", finish="open modular storage", durability="High", care="Dust visible shelves weekly"),
        ]
    return [
        MaterialPlanItem(item="Sofa", material=fabric_finish, finish=f"accent tone {accent}", durability="Medium high", care="Vacuum and rotate cushions"),
        MaterialPlanItem(item="Coffee table", material="wood base with stone top", finish=f"wood tone {wood}", durability="High", care="Use coasters on stone"),
        MaterialPlanItem(item="Floor rug", material="flat weave recycled PET", finish="low-pile textured surface", durability="High", care="Shake out and vacuum weekly"),
    ]


def _highlights(brief: DesignBrief, kit: dict[str, object], theme: str) -> list[str]:
    items = [str(item) for item in kit.get("highlights", [])]
    if brief.priority.lower() == "sustainability":
        items.append("Prioritizes reusable furniture and low-VOC surface finishes")
    elif brief.priority.lower() == "practicality":
        items.append("Keeps circulation and maintenance as primary layout constraints")
    if brief.lifestyle:
        items.append(f"Adapted for {brief.lifestyle.lower()}")
    return items[:5]


def _tradeoffs(brief: DesignBrief, kit: dict[str, object], theme: str) -> list[str]:
    items = [str(item) for item in kit.get("tradeoffs", [])]
    if brief.budget_range.lower() == "starter" and theme in {"luxury", "industrial"}:
        items.append("Use accent details selectively to stay within the selected budget range")
    if "kid" in brief.lifestyle.lower() or "pet" in brief.lifestyle.lower():
        items.append("Choose washable covers and rounded corners for easier daily use")
    return items[:4]


def _clamp(value: float) -> float:
    return round(max(0.45, min(0.98, value)), 2)


def _image_prompt(brief: DesignBrief, theme: str, palette: list[str], title: str) -> str:
    palette_text = ", ".join(palette) if palette else "a coordinated interior palette"
    locked = ", ".join(brief.locked_elements) if brief.locked_elements else "fixed architecture, windows, doors, ceiling lines, and camera perspective"
    constraints = brief.constraints.strip() or "No special constraints."
    lifestyle = brief.lifestyle.strip() or "Everyday use."
    return (
        "Create a photorealistic interior redesign from the provided real room photo. "
        "Preserve the original room geometry, camera angle, perspective, window and door placement, "
        "wall openings, ceiling height, and major built-in architecture. "
        "Do not turn this into an illustration, render mockup, floor plan, collage, or 3D viewport. "
        f"Room type: {brief.room_type}. "
        f"Design direction: {title} / {theme}. "
        f"Color palette: {palette_text}. "
        f"Budget level: {brief.budget_range}. "
        f"Lifestyle: {lifestyle}. "
        f"Primary priority: {brief.priority}. "
        f"User constraints: {constraints}. "
        f"Elements to preserve: {locked}. "
        "Update movable furniture, textiles, decor, lighting mood, wall color, floor finish, and styling "
        "so the image looks like a real completed room photographed with natural light. "
        "Keep scale believable, avoid warped furniture, avoid text or labels, avoid changing the room into a different space, "
        "and do not add people."
    )


def _output_extension() -> str:
    if settings.image_generation_provider.lower().strip() == "local":
        return "jpg"
    return {
        "jpeg": "jpg",
        "jpg": "jpg",
        "png": "png",
        "webp": "webp",
    }.get(settings.openai_image_output_format.lower().strip(), "jpg")
