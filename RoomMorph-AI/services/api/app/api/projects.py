from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import (
    Asset,
    ComparisonResponse,
    DesignBrief,
    LoginRequest,
    LoginResponse,
    Project,
    RedesignResponse,
    SelectConceptRequest,
    CustomizationRequest,
    User,
)
from app.services.redesign import RedesignGenerator
from app.services.scene import SceneBuilder
from app.services.storage import ProjectIndex, ProjectStorage, UserStore


router = APIRouter(tags=["projects"])
redesign_generator = RedesignGenerator()
scene_builder = SceneBuilder()
user_store = UserStore()


@router.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest) -> LoginResponse:
    email = request.email.strip().lower()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    user_id = _user_id(email)
    now = _now()
    try:
        user = user_store.load(user_id)
        user.last_login_at = now
        if request.name.strip():
            user.name = request.name.strip()
    except HTTPException:
        user = User(
            id=user_id,
            name=request.name.strip() or email.split("@")[0].replace(".", " ").title(),
            email=email,
            createdAt=now,
            lastLoginAt=now,
        )
    user_store.save(user)
    return LoginResponse(user=user)


@router.get("/users/{user_id}", response_model=User)
def get_user(user_id: str) -> User:
    return user_store.load(user_id)


@router.post("/redesigns", response_model=RedesignResponse)
async def create_redesigns(
    image: UploadFile = File(...),
    userId: str = Form("demo-user"),
    roomType: str = Form("Living room"),
    themes: str = Form("modern,luxury,minimal,contemporary"),
    palette: str = Form(""),
    constraints: str = Form(""),
    budgetRange: str = Form("Balanced"),
    lifestyle: str = Form("Everyday family use"),
    priority: str = Form("balanced"),
) -> RedesignResponse:
    project_id = uuid4().hex
    storage = ProjectStorage(project_id)
    upload = await storage.save_upload(image)
    brief = DesignBrief(
        roomType=roomType,
        themes=_csv(themes),
        palette=_csv(palette),
        constraints=constraints,
        budgetRange=budgetRange,
        lifestyle=lifestyle,
        priority=priority,
    )
    try:
        concepts = redesign_generator.generate(upload.path, storage.root, project_id, brief)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    concepts = [
        concept.model_copy(update={"preview_url": _resolve_preview_url(storage, concept.preview_url)})
        for concept in concepts
    ]
    now = _now()
    project = Project(
        id=project_id,
        userId=userId,
        status="concepts_ready",
        brief=brief,
        sourceImage=Asset(id="source", type="source", url=upload.url, width=upload.width, height=upload.height),
        concepts=concepts,
        selectedConceptId=None,
        scene=None,
        createdAt=now,
        updatedAt=now,
    )
    storage.save_project(project)
    ProjectIndex(userId).add(project_id)
    return RedesignResponse(project=project, concepts=concepts)


@router.get("/projects", response_model=list[Project])
def list_projects(userId: str = "demo-user") -> list[Project]:
    projects: list[Project] = []
    for project_id in ProjectIndex(userId).all():
        try:
            project = ProjectStorage(project_id).load_project()
            if project.user_id == userId:
                projects.append(project)
        except HTTPException:
            continue
    return projects


@router.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: str) -> Project:
    return ProjectStorage(project_id).load_project()


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, userId: str = "demo-user") -> dict[str, str]:
    storage = ProjectStorage(project_id)
    project = storage.load_project()
    if project.user_id != userId:
        raise HTTPException(status_code=403, detail="You cannot delete another user's project.")
    ProjectIndex(userId).remove(project_id)
    storage.delete()
    return {"status": "deleted", "projectId": project_id}


@router.post("/projects/{project_id}/select", response_model=Project)
def select_concept(project_id: str, request: SelectConceptRequest) -> Project:
    storage = ProjectStorage(project_id)
    project = storage.load_project()
    if not any(concept.id == request.concept_id for concept in project.concepts):
        raise HTTPException(status_code=404, detail="Concept not found.")
    if project.selected_concept_id != request.concept_id:
        project.scene = None
        project.status = "concepts_ready"
    project.selected_concept_id = request.concept_id
    project.updated_at = _now()
    storage.save_project(project)
    return project


@router.post("/projects/{project_id}/scene", response_model=Project)
def create_scene(project_id: str) -> Project:
    storage = ProjectStorage(project_id)
    project = storage.load_project()
    if not project.selected_concept_id:
        raise HTTPException(status_code=409, detail="Select a design concept before generating 3D.")
    concept = next((item for item in project.concepts if item.id == project.selected_concept_id), None)
    if not concept:
        raise HTTPException(status_code=404, detail="Selected concept not found.")
    project.scene = scene_builder.build(project.id, project.brief, concept)
    project.status = "scene_ready"
    project.updated_at = _now()
    storage.save_project(project)
    return project


@router.patch("/projects/{project_id}/scene", response_model=Project)
def update_scene(project_id: str, request: CustomizationRequest) -> Project:
    storage = ProjectStorage(project_id)
    project = storage.load_project()
    project.scene = request.scene
    project.status = "scene_ready"
    project.updated_at = _now()
    storage.save_project(project)
    return project


@router.get("/projects/{project_id}/compare", response_model=ComparisonResponse)
def get_comparison(project_id: str) -> ComparisonResponse:
    project = ProjectStorage(project_id).load_project()
    concept = next((item for item in project.concepts if item.id == project.selected_concept_id), None)
    if not concept:
        concept = project.concepts[0] if project.concepts else None
    if not concept:
        raise HTTPException(status_code=404, detail="No design concept available.")
    return ComparisonResponse(
        originalUrl=project.source_image.url,
        redesignedUrl=concept.preview_url,
        concept=concept,
    )


def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _resolve_preview_url(storage: ProjectStorage, preview_url: str) -> str:
    if preview_url.startswith("__ASSET__/"):
        return storage.asset_url(preview_url.replace("__ASSET__/", ""))
    return preview_url


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _user_id(email: str) -> str:
    safe = []
    for char in email:
        if char.isalnum():
            safe.append(char.lower())
        elif char in {".", "-", "_"}:
            safe.append("-")
    return "".join(safe).strip("-")[:80] or "demo-user"
