from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

from app.models.schemas import BudgetEstimate, DesignBrief, DesignConcept, MaterialPlanItem, ScoreBreakdown


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
            filename = f"concept-{index + 1}-{key.replace(' ', '-')}.jpg"
            palette = list(kit["palette"])
            if brief.palette:
                palette = (brief.palette + palette)[:4]
            preview_url = f"__ASSET__/{filename}"
            self._render_concept(source_path, output_dir / filename, brief.room_type, key, palette)
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

    def _render_concept(
        self,
        source_path: Path,
        output_path: Path,
        room_type: str,
        theme: str,
        palette: list[str],
    ) -> None:
        base = ImageOps.exif_transpose(Image.open(source_path)).convert("RGB")
        image = ImageEnhance.Color(base).enhance(0.82)
        image = ImageEnhance.Contrast(image).enhance(1.04)
        image = ImageEnhance.Brightness(image).enhance(1.03)
        width, height = image.size
        floor_y = int(height * 0.61)

        wall = _rgba(palette[0], 118)
        floor = _rgba(palette[1], 124)
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
        draw = ImageDraw.Draw(overlay, "RGBA")
        draw.rectangle((0, 0, width, floor_y), fill=wall)
        draw.polygon([(0, floor_y), (width, floor_y), (width, height), (0, height)], fill=floor)

        wall_texture = _texture_layer(image.size, wall[:3], 16, 20)
        floor_texture = _texture_layer(image.size, floor[:3], 26, 26)
        wall_mask = Image.new("L", image.size, 0)
        floor_mask = Image.new("L", image.size, 0)
        mask_draw = ImageDraw.Draw(wall_mask)
        mask_draw.rectangle((0, 0, width, floor_y), fill=56)
        mask_draw = ImageDraw.Draw(floor_mask)
        mask_draw.polygon([(0, floor_y), (width, floor_y), (width, height), (0, height)], fill=74)
        overlay = Image.alpha_composite(overlay, Image.composite(wall_texture, Image.new("RGBA", image.size, (0, 0, 0, 0)), wall_mask))
        overlay = Image.alpha_composite(overlay, Image.composite(floor_texture, Image.new("RGBA", image.size, (0, 0, 0, 0)), floor_mask))

        room = Image.alpha_composite(image.convert("RGBA"), overlay)
        draw = ImageDraw.Draw(room, "RGBA")
        draw.rectangle((0, floor_y - max(3, height // 130), width, floor_y + max(4, height // 110)), fill=(36, 34, 30, 34))
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
                frame = (left, int(floor_y * 0.18), left + int(width * 0.18), int(floor_y * 0.78))
                draw.rectangle(frame, outline=(40, 42, 40, 140), width=max(2, width // 240))
                draw.rectangle(_inset(frame, max(4, width // 120)), fill=(220, 225, 216, 36))
            draw.rectangle((int(width * 0.05), int(floor_y * 0.12), int(width * 0.95), int(floor_y * 0.17)), fill=(44, 45, 41, 74))
            return Image.alpha_composite(image.convert("RGBA"), layer).convert("RGB")

        left_panel = (int(width * 0.1), int(floor_y * 0.18), int(width * 0.32), int(floor_y * 0.74))
        right_panel = (int(width * 0.66), int(floor_y * 0.18), int(width * 0.9), int(floor_y * 0.74))
        for panel in (left_panel, right_panel):
            draw.rounded_rectangle(
                _offset(panel, max(3, width // 220), max(4, height // 210)),
                radius=max(8, width // 100),
                fill=(0, 0, 0, 34),
            )
            draw.rounded_rectangle(
                panel,
                radius=max(8, width // 100),
                fill=(255, 255, 255, 44),
                outline=(38, 36, 31, 80),
                width=max(2, width // 340),
            )
            draw.rectangle(
                (panel[0] + max(5, width // 130), panel[1] + max(5, width // 130), panel[2] - max(5, width // 130), panel[3] - max(5, width // 130)),
                fill=(secondary[0], secondary[1], secondary[2], 26),
            )

        draw.rounded_rectangle(
            (int(width * 0.42), int(floor_y * 0.18), int(width * 0.59), int(floor_y * 0.37)),
            radius=max(8, width // 100),
            fill=(accent[0], accent[1], accent[2], 126),
        )
        draw.line((int(width * 0.505), int(floor_y * 0.37), int(width * 0.505), floor_y), fill=(20, 20, 18, 24), width=max(1, width // 900))
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

        sofa_fill = (accent[0], accent[1], accent[2], 226) if theme in {"contemporary", "industrial"} else (230, 226, 216, 238)
        _soft_shadow(draw, (int(width * 0.15), int(height * 0.73), int(width * 0.76), int(height * 0.91)))
        _soft_shadow(draw, (int(width * 0.22), int(height * 0.81), int(width * 0.74), int(height * 0.97)), (accent[0], accent[1], accent[2], 52))
        _photo_round(draw, (int(width * 0.18), int(height * 0.58), int(width * 0.72), int(height * 0.78)), sofa_fill, max(18, width // 46), "fabric")
        _photo_round(draw, (int(width * 0.22), int(height * 0.5), int(width * 0.68), int(height * 0.62)), (sofa_fill[0], sofa_fill[1], sofa_fill[2], 220), max(14, width // 60), "fabric")
        for index in range(1, 3):
            x = int(width * (0.18 + index * 0.18))
            draw.line((x, int(height * 0.59), x, int(height * 0.77)), fill=(255, 255, 255, 52), width=max(1, width // 520))
        _photo_round(draw, (int(width * 0.24), int(height * 0.56), int(width * 0.34), int(height * 0.65)), (255, 250, 238, 194), max(8, width // 100), "linen")
        _photo_round(draw, (int(width * 0.56), int(height * 0.56), int(width * 0.66), int(height * 0.65)), (secondary[0], secondary[1], secondary[2], 188), max(8, width // 100), "fabric")
        _photo_round(draw, (int(width * 0.34), int(height * 0.8), int(width * 0.64), int(height * 0.89)), secondary, max(10, width // 80), "wood")
        _photo_round(draw, (int(width * 0.35), int(height * 0.795), int(width * 0.65), int(height * 0.815)), (255, 255, 255, 92), max(6, width // 120), "stone")
        _photo_round(draw, (int(width * 0.74), int(height * 0.5), int(width * 0.79), int(height * 0.78)), dark, max(6, width // 100), "metal")
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
        planter = (int(width * 0.82), int(height * 0.73), int(width * 0.89), int(height * 0.9))
        _soft_shadow(draw, (planter[0] - int(width * 0.012), planter[1] + int(height * 0.08), planter[2] + int(width * 0.02), planter[3] + int(height * 0.04)), (0, 0, 0, 36))
        _photo_round(draw, planter, (secondary[0], secondary[1], secondary[2], 220), max(6, width // 150), "ceramic")
        stem_x = int(width * 0.855)
        stem_y = int(height * 0.72)
        for offset in (-32, -18, 0, 18, 32):
            draw.line((stem_x, stem_y + int(height * 0.12), stem_x + int(width * offset / 900), stem_y), fill=(67, 91, 67, 190), width=max(2, width // 420))
            leaf = (stem_x + int(width * offset / 900) - 10, stem_y - 14, stem_x + int(width * offset / 900) + 18, stem_y + 12)
            draw.ellipse(leaf, fill=(81, 111, 78, 166), outline=(44, 72, 48, 80))
        if theme == "luxury":
            _photo_round(draw, (int(width * 0.12), int(height * 0.2), int(width * 0.2), int(height * 0.44)), (196, 163, 90, 130), max(7, width // 120), "metal")
        else:
            _photo_round(draw, (int(width * 0.12), int(height * 0.2), int(width * 0.24), int(height * 0.42)), (255, 255, 255, 92), max(7, width // 120), "canvas")
        _photo_round(draw, (int(width * 0.735), int(height * 0.39), int(width * 0.825), int(height * 0.43)), (accent[0], accent[1], accent[2], 160), max(5, width // 180), "fabric")
        return _merge_photo_layer(image, layer)

    @staticmethod
    def _lighting(image: Image.Image, width: int, height: int, floor_y: int, theme: str) -> Image.Image:
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer, "RGBA")
        glow = (255, 242, 205, 132) if theme != "industrial" else (245, 215, 170, 112)
        draw.ellipse((int(width * 0.42), int(height * 0.04), int(width * 0.58), int(height * 0.22)), fill=glow)
        draw.ellipse((int(width * 0.3), int(height * 0.14), int(width * 0.7), int(height * 0.68)), fill=(255, 245, 212, 24))
        draw.polygon([(0, floor_y), (int(width * 0.5), floor_y), (int(width * 0.16), height), (0, height)], fill=(0, 0, 0, 22))
        draw.polygon([(int(width * 0.5), floor_y), (width, floor_y), (width, height), (int(width * 0.84), height)], fill=(255, 255, 255, 14))
        return Image.alpha_composite(image.convert("RGBA"), layer.filter(ImageFilter.GaussianBlur(max(1, width // 650)))).convert("RGB")

    @staticmethod
    def _finish_like_photo(image: Image.Image, width: int, height: int) -> Image.Image:
        vignette = Image.new("L", image.size, 0)
        vdraw = ImageDraw.Draw(vignette)
        vdraw.ellipse((-width * 0.08, -height * 0.16, width * 1.08, height * 1.18), fill=160)
        vignette = vignette.filter(ImageFilter.GaussianBlur(max(width, height) // 16))
        image = Image.composite(image, Image.new("RGB", image.size, "#141611"), Image.eval(vignette, lambda p: 255 - p))
        grain = Image.effect_noise(image.size, 6).convert("L")
        grain_rgba = Image.merge("RGBA", (grain, grain, grain, Image.new("L", image.size, 18)))
        image = Image.alpha_composite(image.convert("RGBA"), grain_rgba).convert("RGB")
        image = ImageEnhance.Color(image).enhance(0.96)
        image = ImageEnhance.Contrast(image).enhance(1.06)
        image = ImageEnhance.Sharpness(image).enhance(1.12)
        return image


def _rgba(value: str, alpha: int) -> tuple[int, int, int, int]:
    color = value.strip().lstrip("#")
    if len(color) == 3:
        color = "".join(ch * 2 for ch in color)
    if len(color) != 6:
        color = "d8d1c2"
    return (int(color[:2], 16), int(color[2:4], 16), int(color[4:], 16), alpha)


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

    for y in range(-height, height * 2, spacing):
        draw.line((0, y, width, y + int(width * 0.18)), fill=(*highlight, max(4, alpha // 3)), width=1)
    for x in range(0, width, spacing * 2):
        draw.line((x, 0, x + int(width * 0.05), height), fill=(*shadow, max(3, alpha // 4)), width=1)

    return layer.filter(ImageFilter.GaussianBlur(0.55))


def _wood_planks(
    draw: ImageDraw.ImageDraw,
    width: int,
    height: int,
    floor_y: int,
    floor: tuple[int, int, int, int],
    theme: str,
) -> None:
    line_alpha = 34 if theme != "minimal" else 22
    plank_count = 8
    for index in range(1, plank_count):
        y = floor_y + int((height - floor_y) * index / plank_count)
        draw.line((0, y, width, y), fill=(255, 255, 255, line_alpha), width=max(1, width // 700))

    for index in range(-6, 7):
        x = int(width * (0.5 + index * 0.11))
        draw.line((width // 2, floor_y, x, height), fill=(24, 23, 20, 24), width=max(1, width // 800))

    tint = tuple(max(0, channel - 36) for channel in floor[:3])
    for index in range(0, width, max(48, width // 9)):
        draw.line((index, floor_y, index + int(width * 0.18), height), fill=(*tint, 16), width=max(1, width // 560))


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
    highlight_alpha = 58 if material in {"stone", "linen", "canvas"} else 36
    shadow_alpha = 34 if material in {"wood", "metal"} else 22
    draw.rounded_rectangle(
        (left + max(1, width // 24), top + max(1, height // 18), right - max(1, width // 24), top + max(2, height // 5)),
        radius=max(1, radius // 2),
        fill=(255, 255, 255, highlight_alpha),
    )
    draw.line((left + radius, bottom - max(2, height // 7), right - radius, bottom - max(2, height // 9)), fill=(0, 0, 0, shadow_alpha), width=max(1, width // 160))

    if material == "wood":
        for index in range(1, 4):
            y = top + int(height * index / 4)
            draw.line((left + radius, y, right - radius, y + max(1, height // 28)), fill=(58, 42, 28, 30), width=max(1, width // 220))
    elif material == "fabric":
        for index in range(1, 4):
            x = left + int(width * index / 4)
            draw.line((x, top + radius, x, bottom - radius), fill=(255, 255, 255, 24), width=1)
    elif material == "metal":
        draw.rounded_rectangle(_inset(rect, max(2, min(width, height) // 8)), radius=max(1, radius // 2), outline=(255, 255, 255, 42), width=1)


def _merge_photo_layer(image: Image.Image, layer: Image.Image) -> Image.Image:
    softened = layer.filter(ImageFilter.GaussianBlur(0.25))
    return Image.alpha_composite(image.convert("RGBA"), softened).convert("RGB")


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
