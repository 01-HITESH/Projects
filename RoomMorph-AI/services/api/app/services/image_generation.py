from __future__ import annotations

import base64
import json
import mimetypes
import urllib.error
import urllib.request
from pathlib import Path

from app.core.config import settings


class OpenAIImageEditProvider:
    endpoint = "https://api.openai.com/v1/images/edits"

    def generate_room_redesign(
        self,
        source_path: Path,
        output_path: Path,
        prompt: str,
    ) -> None:
        if not settings.openai_api_key.strip():
            raise RuntimeError(
                "OPENAI_API_KEY is required for real image generation. "
                "Set IMAGE_GENERATION_PROVIDER=local to use the development fallback."
            )

        fields = {
            "model": settings.openai_image_model,
            "prompt": prompt,
            "n": "1",
            "size": settings.openai_image_size,
            "quality": settings.openai_image_quality,
            "output_format": settings.openai_image_output_format,
        }
        if settings.openai_image_model.lower().strip() in {"gpt-image-1", "gpt-image-1.5"}:
            fields["input_fidelity"] = settings.openai_image_input_fidelity
        body, content_type = _multipart_body(
            fields=fields,
            file_field="image",
            file_path=source_path,
        )
        request = urllib.request.Request(
            self.endpoint,
            data=body,
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": content_type,
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=settings.openai_image_timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"OpenAI image generation failed: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"OpenAI image generation could not connect: {exc.reason}") from exc

        b64_image = _extract_b64_image(payload)
        output_path.write_bytes(base64.b64decode(b64_image))


def _extract_b64_image(payload: dict[str, object]) -> str:
    data = payload.get("data")
    if not isinstance(data, list) or not data:
        raise RuntimeError("OpenAI image generation returned no image data.")
    first = data[0]
    if not isinstance(first, dict):
        raise RuntimeError("OpenAI image generation returned an invalid image payload.")
    image = first.get("b64_json")
    if not isinstance(image, str) or not image:
        raise RuntimeError("OpenAI image generation did not return base64 image data.")
    return image


def _multipart_body(
    fields: dict[str, str],
    file_field: str,
    file_path: Path,
) -> tuple[bytes, str]:
    boundary = "roommorph-openai-boundary"
    parts: list[bytes] = []

    for name, value in fields.items():
        if value == "":
            continue
        parts.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"),
                f"{value}\r\n".encode("utf-8"),
            ]
        )

    media_type = mimetypes.guess_type(file_path.name)[0] or "image/jpeg"
    parts.extend(
        [
            f"--{boundary}\r\n".encode("utf-8"),
            (
                f'Content-Disposition: form-data; name="{file_field}"; '
                f'filename="{file_path.name}"\r\n'
            ).encode("utf-8"),
            f"Content-Type: {media_type}\r\n\r\n".encode("utf-8"),
            file_path.read_bytes(),
            b"\r\n",
            f"--{boundary}--\r\n".encode("utf-8"),
        ]
    )
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"
