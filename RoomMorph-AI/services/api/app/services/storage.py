from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps

from app.core.config import settings
from app.models.schemas import Project, User


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@dataclass(frozen=True)
class StoredUpload:
    path: Path
    url: str
    width: int
    height: int


class ProjectStorage:
    def __init__(self, project_id: str) -> None:
        self.project_id = project_id
        self.root = settings.storage_root / "projects" / project_id
        self.root.mkdir(parents=True, exist_ok=True)

    def asset_path(self, filename: str) -> Path:
        return self.root / filename

    def asset_url(self, filename: str) -> str:
        relative = self.asset_path(filename).relative_to(settings.storage_root).as_posix()
        return f"{settings.public_base_url.rstrip('/')}/static/{relative}"

    async def save_upload(self, upload: UploadFile) -> StoredUpload:
        if upload.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Upload must be JPEG, PNG, or WebP.")

        raw = await upload.read()
        if len(raw) > settings.max_upload_bytes:
            raise HTTPException(status_code=413, detail=f"Image exceeds {settings.max_upload_mb} MB.")

        try:
            image = Image.open(BytesIO(raw))
            image = ImageOps.exif_transpose(image).convert("RGB")
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail="Image could not be decoded.") from exc

        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        path = self.asset_path("source.jpg")
        image.save(path, format="JPEG", quality=88, optimize=True)
        return StoredUpload(path=path, url=self.asset_url("source.jpg"), width=image.width, height=image.height)

    def save_project(self, project: Project) -> None:
        self.asset_path("project.json").write_text(project.model_dump_json(by_alias=True), encoding="utf-8")

    def load_project(self) -> Project:
        path = self.asset_path("project.json")
        if not path.exists():
            raise HTTPException(status_code=404, detail="Project not found.")
        return Project.model_validate_json(path.read_text(encoding="utf-8"))

    def delete(self) -> None:
        if self.root.exists():
            shutil.rmtree(self.root)


class ProjectIndex:
    def __init__(self, user_id: str = "demo-user") -> None:
        self.user_id = user_id
        self.path = settings.storage_root / "users" / user_id / "projects.json"
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def add(self, project_id: str) -> None:
        ids = self.all()
        if project_id not in ids:
            ids.insert(0, project_id)
        self.path.write_text(json.dumps(ids[:50], indent=2), encoding="utf-8")

    def all(self) -> list[str]:
        if not self.path.exists():
            return []
        try:
            loaded = json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
        return [item for item in loaded if isinstance(item, str)]

    def remove(self, project_id: str) -> None:
        ids = [item for item in self.all() if item != project_id]
        self.path.write_text(json.dumps(ids, indent=2), encoding="utf-8")


class UserStore:
    def __init__(self) -> None:
        self.root = settings.storage_root / "users"
        self.root.mkdir(parents=True, exist_ok=True)

    def user_path(self, user_id: str) -> Path:
        return self.root / user_id / "user.json"

    def save(self, user: User) -> None:
        path = self.user_path(user.id)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(user.model_dump_json(by_alias=True), encoding="utf-8")

    def load(self, user_id: str) -> User:
        path = self.user_path(user_id)
        if not path.exists():
            raise HTTPException(status_code=404, detail="User not found.")
        return User.model_validate_json(path.read_text(encoding="utf-8"))
