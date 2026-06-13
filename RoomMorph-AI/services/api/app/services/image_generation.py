from __future__ import annotations

import base64
import json
import mimetypes
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

from app.core.config import settings


class Automatic1111ImageProvider:
    def status(self) -> dict[str, str | bool | None]:
        endpoint = settings.sd_webui_url.rstrip("/")
        try:
            options = _get_json(f"{endpoint}/sdapi/v1/options", settings.sd_webui_status_timeout_seconds)
        except RuntimeError as exc:
            return {
                "provider": "automatic1111",
                "ready": False,
                "message": str(exc),
                "endpoint": endpoint,
                "model": None,
            }

        model = options.get("sd_model_checkpoint")
        model_name = model if isinstance(model, str) and model else None
        return {
            "provider": "automatic1111",
            "ready": True,
            "message": "AUTOMATIC1111 API is reachable.",
            "endpoint": endpoint,
            "model": model_name,
        }

    def generate_room_redesign(
        self,
        source_path: Path,
        output_path: Path,
        prompt: str,
    ) -> None:
        image, width, height = _load_image_for_sd(source_path)
        payload = {
            "init_images": [_image_to_base64(image)],
            "prompt": prompt,
            "negative_prompt": settings.sd_webui_negative_prompt,
            "steps": settings.sd_webui_steps,
            "cfg_scale": settings.sd_webui_cfg_scale,
            "denoising_strength": settings.sd_webui_denoising_strength,
            "sampler_name": settings.sd_webui_sampler_name,
            "width": width,
            "height": height,
            "batch_size": 1,
            "n_iter": 1,
            "restore_faces": False,
            "send_images": True,
            "save_images": False,
        }
        endpoint = f"{settings.sd_webui_url.rstrip('/')}/sdapi/v1/img2img"
        request = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=settings.sd_webui_timeout_seconds) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"AUTOMATIC1111 image generation failed: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(
                "AUTOMATIC1111 is not reachable. Start Stable Diffusion WebUI with --api "
                f"and confirm {settings.sd_webui_url} is available. Error: {exc.reason}"
            ) from exc

        images = response_payload.get("images")
        if not isinstance(images, list) or not images:
            raise RuntimeError("AUTOMATIC1111 returned no generated images.")
        image_data = images[0]
        if not isinstance(image_data, str) or not image_data:
            raise RuntimeError("AUTOMATIC1111 returned an invalid image payload.")
        output_path.write_bytes(_decode_base64_image(image_data))


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
                "Set IMAGE_GENERATION_PROVIDER=automatic1111 to use local Stable Diffusion, "
                "or IMAGE_GENERATION_PROVIDER=local to use the development fallback."
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
        output_path.write_bytes(_decode_base64_image(b64_image))


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


def _load_image_for_sd(source_path: Path) -> tuple[Image.Image, int, int]:
    with Image.open(source_path) as source_image:
        image = ImageOps.exif_transpose(source_image).convert("RGB")
    max_size = max(512, settings.sd_webui_max_size)
    width, height = _sd_dimensions(image.width, image.height, max_size)
    if image.size != (width, height):
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    return image, width, height


def _image_to_base64(image: Image.Image) -> str:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def _decode_base64_image(value: str) -> bytes:
    if "," in value and value.lower().startswith("data:"):
        value = value.split(",", 1)[1]
    return base64.b64decode(value)


def _get_json(url: str, timeout_seconds: int) -> dict[str, object]:
    try:
        with urllib.request.urlopen(url, timeout=timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"AUTOMATIC1111 status check failed: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(
            "AUTOMATIC1111 is not reachable. Start Stable Diffusion WebUI with --api "
            f"and confirm {settings.sd_webui_url} is available. Error: {exc.reason}"
        ) from exc
    if not isinstance(payload, dict):
        raise RuntimeError("AUTOMATIC1111 returned an invalid status payload.")
    return payload


def _clamped_multiple_of_64(value: int, max_size: int) -> int:
    rounded = round(value / 64) * 64
    rounded = max(64, int(rounded))
    return min(max_size, rounded)


def _sd_dimensions(width: int, height: int, max_size: int) -> tuple[int, int]:
    scale = min(max_size / width, max_size / height)
    shortest_after_scale = min(width, height) * scale
    if shortest_after_scale < 512:
        scale = min(scale, max_size / max(width, height), 512 / min(width, height))
    return (
        _clamped_multiple_of_64(int(width * scale), max_size),
        _clamped_multiple_of_64(int(height * scale), max_size),
    )


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
