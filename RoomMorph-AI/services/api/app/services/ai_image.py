from __future__ import annotations

import base64
import json
from pathlib import Path
from urllib import error, request

from PIL import Image, ImageOps

from app.core.config import settings
from app.models.schemas import DesignBrief


class AiImageGenerator:
    def is_configured(self) -> bool:
        return bool(settings.openai_api_key.strip())

    def render_edit(
        self,
        source_path: Path,
        output_path: Path,
        brief: DesignBrief,
        theme: str,
        palette: list[str],
    ) -> bool:
        if not self.is_configured():
            return False

        prompt = _prompt(brief, theme, palette)
        try:
            boundary = "roommorph-boundary"
            body = _multipart_body(
                boundary,
                fields={
                    "model": settings.openai_image_model,
                    "prompt": prompt,
                    "size": "1024x1024",
                    "response_format": "b64_json",
                },
                files={"image": ("room.jpg", source_path.read_bytes(), "image/jpeg")},
            )
            api_request = request.Request(
                "https://api.openai.com/v1/images/edits",
                data=body,
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": f"multipart/form-data; boundary={boundary}",
                },
                method="POST",
            )
            with request.urlopen(api_request, timeout=90) as response:
                payload = json.loads(response.read().decode("utf-8"))
            encoded = payload["data"][0]["b64_json"]
            image_bytes = base64.b64decode(encoded)
            output_path.write_bytes(image_bytes)
            _normalize_image(output_path)
            return True
        except (KeyError, OSError, ValueError, error.URLError, error.HTTPError):
            return False

    def render_edit_or_raise(
        self,
        source_path: Path,
        output_path: Path,
        brief: DesignBrief,
        theme: str,
        palette: list[str],
    ) -> None:
        if not self.is_configured():
            raise RuntimeError("OPENAI_API_KEY is required for AI photo mode.")
        if not self.render_edit(source_path, output_path, brief, theme, palette):
            raise RuntimeError("AI photo generation failed. Use Manual after mode with real redesigned photos, or try again.")


def _prompt(brief: DesignBrief, theme: str, palette: list[str]) -> str:
    palette_text = ", ".join(palette[:4]) if palette else "a balanced natural interior palette"
    return (
        f"Create a photorealistic redesigned {brief.room_type.lower()} from the provided room photo. "
        f"Keep the same camera angle, room architecture, windows, walls, floor perspective, and realistic proportions. "
        f"Apply a {theme} interior design style using palette {palette_text}. "
        f"Budget range: {brief.budget_range}. Lifestyle: {brief.lifestyle}. Priority: {brief.priority}. "
        f"Design notes: {brief.constraints}. "
        "Make it look like a real completed room photograph, not an illustration, render, collage, or drawing."
    )


def _multipart_body(
    boundary: str,
    fields: dict[str, str],
    files: dict[str, tuple[str, bytes, str]],
) -> bytes:
    chunks: list[bytes] = []
    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"),
                value.encode("utf-8"),
                b"\r\n",
            ]
        )
    for name, (filename, content, content_type) in files.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode("utf-8"),
                f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"),
                content,
                b"\r\n",
            ]
        )
    chunks.append(f"--{boundary}--\r\n".encode("utf-8"))
    return b"".join(chunks)


def _normalize_image(path: Path) -> None:
    image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    image.save(path, format="JPEG", quality=92, optimize=True)
