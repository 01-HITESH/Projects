from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


Vector3 = list[float]


class Asset(BaseModel):
    id: str
    type: Literal["source", "concept", "depth", "glb"]
    url: str
    width: int | None = None
    height: int | None = None


class DesignBrief(BaseModel):
    room_type: str = Field(alias="roomType")
    themes: list[str]
    palette: list[str] = Field(default_factory=list)
    constraints: str = ""

    class Config:
        populate_by_name = True


class DesignConcept(BaseModel):
    id: str
    project_id: str = Field(alias="projectId")
    theme: str
    title: str
    rationale: str
    preview_url: str = Field(alias="previewUrl")
    palette: list[str]
    score: float

    class Config:
        populate_by_name = True


class User(BaseModel):
    id: str
    name: str
    email: str
    created_at: str = Field(alias="createdAt")
    last_login_at: str = Field(alias="lastLoginAt")

    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    name: str = ""
    email: str


class LoginResponse(BaseModel):
    user: User


class MaterialSpec(BaseModel):
    id: str
    name: str
    color: str
    roughness: float = 0.72
    metalness: float = 0.0


class SurfacePrimitive(BaseModel):
    id: str
    type: Literal["floor", "wall", "ceiling"]
    position: Vector3
    size: Vector3
    material: MaterialSpec


class PrimitivePart(BaseModel):
    id: str
    shape: Literal["box", "cylinder", "sphere"] = "box"
    position: Vector3
    rotation: Vector3 = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    dimensions: Vector3
    material: MaterialSpec


class FurniturePrimitive(BaseModel):
    id: str
    kind: str
    name: str
    position: Vector3
    rotation: Vector3
    dimensions: Vector3
    material: MaterialSpec
    parts: list[PrimitivePart] = Field(default_factory=list)


class LightingSpec(BaseModel):
    ambient: float
    key: float
    temperature: int


class SceneDocument(BaseModel):
    id: str
    room_type: str = Field(alias="roomType")
    theme: str
    dimensions: dict[str, float | str]
    surfaces: list[SurfacePrimitive]
    furniture: list[FurniturePrimitive]
    lighting: LightingSpec
    camera_presets: list[dict[str, Vector3]] = Field(alias="cameraPresets")

    class Config:
        populate_by_name = True


class Project(BaseModel):
    id: str
    user_id: str = Field(default="demo-user", alias="userId")
    status: Literal["concepts_ready", "scene_ready"]
    brief: DesignBrief
    source_image: Asset = Field(alias="sourceImage")
    concepts: list[DesignConcept]
    selected_concept_id: str | None = Field(default=None, alias="selectedConceptId")
    scene: SceneDocument | None = None
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

    class Config:
        populate_by_name = True


class RedesignResponse(BaseModel):
    project: Project
    concepts: list[DesignConcept]


class SelectConceptRequest(BaseModel):
    concept_id: str = Field(alias="conceptId")

    class Config:
        populate_by_name = True


class CustomizationRequest(BaseModel):
    scene: SceneDocument


class ComparisonResponse(BaseModel):
    original_url: str = Field(alias="originalUrl")
    redesigned_url: str = Field(alias="redesignedUrl")
    concept: DesignConcept

    class Config:
        populate_by_name = True
