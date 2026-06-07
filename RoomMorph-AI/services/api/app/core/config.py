from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str = "development"
    public_base_url: str = "http://localhost:8000"
    storage_root_raw: str = Field(default="storage", alias="STORAGE_ROOT")
    cors_origins_raw: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS",
    )
    max_upload_mb: int = 12
    image_generation_provider: str = Field(default="automatic1111", alias="IMAGE_GENERATION_PROVIDER")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_image_model: str = Field(default="gpt-image-1", alias="OPENAI_IMAGE_MODEL")
    openai_image_size: str = Field(default="auto", alias="OPENAI_IMAGE_SIZE")
    openai_image_quality: str = Field(default="medium", alias="OPENAI_IMAGE_QUALITY")
    openai_image_input_fidelity: str = Field(default="high", alias="OPENAI_IMAGE_INPUT_FIDELITY")
    openai_image_output_format: str = Field(default="jpeg", alias="OPENAI_IMAGE_OUTPUT_FORMAT")
    openai_image_timeout_seconds: int = Field(default=180, alias="OPENAI_IMAGE_TIMEOUT_SECONDS")
    sd_webui_url: str = Field(default="http://127.0.0.1:7860", alias="SD_WEBUI_URL")
    sd_webui_steps: int = Field(default=30, alias="SD_WEBUI_STEPS")
    sd_webui_cfg_scale: float = Field(default=7.0, alias="SD_WEBUI_CFG_SCALE")
    sd_webui_denoising_strength: float = Field(default=0.62, alias="SD_WEBUI_DENOISING_STRENGTH")
    sd_webui_sampler_name: str = Field(default="DPM++ 2M Karras", alias="SD_WEBUI_SAMPLER_NAME")
    sd_webui_max_size: int = Field(default=1024, alias="SD_WEBUI_MAX_SIZE")
    sd_webui_negative_prompt: str = Field(
        default=(
            "cartoon, illustration, CGI, 3d render, dollhouse, floor plan, warped room, "
            "distorted perspective, deformed furniture, duplicate furniture, text, watermark, logo, people"
        ),
        alias="SD_WEBUI_NEGATIVE_PROMPT",
    )
    sd_webui_timeout_seconds: int = Field(default=240, alias="SD_WEBUI_TIMEOUT_SECONDS")

    @computed_field
    @property
    def storage_root(self) -> Path:
        return Path(self.storage_root_raw).resolve()

    @computed_field
    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @computed_field
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
