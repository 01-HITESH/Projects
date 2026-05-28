from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Vector3 = list[float]


class Asset(BaseModel):
    id: str
    type: Literal["source", "concept", "depth", "glb"]
    url: str
    width: int | None = None
    height: int | None = None


class DesignBrief(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    room_type: str = Field(alias="roomType")
    themes: list[str]
    palette: list[str] = Field(default_factory=list)
    constraints: str = ""
    budget_range: str = Field(default="Balanced", alias="budgetRange")
    lifestyle: str = "Everyday family use"
    priority: str = "balanced"
    user_role: str = Field(default="designer", alias="userRole")
    preservation: int = 70
    locked_elements: list[str] = Field(default_factory=list, alias="lockedElements")
    export_intent: str = Field(default="client-presentation", alias="exportIntent")


class ScoreBreakdown(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    style_match: float = Field(default=0.86, alias="styleMatch")
    feasibility: float = 0.84
    budget_fit: float = Field(default=0.82, alias="budgetFit")
    maintainability: float = 0.8
    sustainability: float = 0.76


class BudgetEstimate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    range_label: str = Field(default="Balanced", alias="rangeLabel")
    min_inr: int = Field(default=65000, alias="minInr")
    max_inr: int = Field(default=140000, alias="maxInr")
    timeline_weeks: int = Field(default=3, alias="timelineWeeks")
    confidence: float = 0.74
    notes: list[str] = Field(default_factory=list)


class MaterialPlanItem(BaseModel):
    item: str
    material: str
    finish: str
    durability: str
    care: str


class DesignConcept(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    project_id: str = Field(alias="projectId")
    theme: str
    title: str
    rationale: str
    preview_url: str = Field(alias="previewUrl")
    palette: list[str]
    score: float
    score_breakdown: ScoreBreakdown = Field(default_factory=ScoreBreakdown, alias="scoreBreakdown")
    budget: BudgetEstimate = Field(default_factory=BudgetEstimate)
    highlights: list[str] = Field(default_factory=list)
    tradeoffs: list[str] = Field(default_factory=list)
    material_plan: list[MaterialPlanItem] = Field(default_factory=list, alias="materialPlan")


class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    email: str
    created_at: str = Field(alias="createdAt")
    last_login_at: str = Field(alias="lastLoginAt")


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


class SceneAnalytics(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    floor_area: float = Field(default=0, alias="floorArea")
    walkable_area: float = Field(default=0, alias="walkableArea")
    budget_estimate: BudgetEstimate = Field(default_factory=BudgetEstimate, alias="budgetEstimate")
    scores: ScoreBreakdown = Field(default_factory=ScoreBreakdown)
    material_schedule: list[MaterialPlanItem] = Field(default_factory=list, alias="materialSchedule")
    clearance_notes: list[str] = Field(default_factory=list, alias="clearanceNotes")
    lighting_plan: list[str] = Field(default_factory=list, alias="lightingPlan")
    sustainability_notes: list[str] = Field(default_factory=list, alias="sustainabilityNotes")
    export_recommendations: list[str] = Field(default_factory=list, alias="exportRecommendations")
    accuracy_notes: list[str] = Field(default_factory=list, alias="accuracyNotes")


class SceneDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    room_type: str = Field(alias="roomType")
    theme: str
    dimensions: dict[str, float | str]
    surfaces: list[SurfacePrimitive]
    furniture: list[FurniturePrimitive]
    lighting: LightingSpec
    camera_presets: list[dict[str, Vector3]] = Field(alias="cameraPresets")
    analytics: SceneAnalytics = Field(default_factory=SceneAnalytics)


class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

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


class RedesignResponse(BaseModel):
    project: Project
    concepts: list[DesignConcept]


class SelectConceptRequest(BaseModel):
    conceptId: str

    @property
    def concept_id(self) -> str:
        return self.conceptId


class CustomizationRequest(BaseModel):
    scene: SceneDocument


class ComparisonResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    original_url: str = Field(alias="originalUrl")
    redesigned_url: str = Field(alias="redesignedUrl")
    concept: DesignConcept
