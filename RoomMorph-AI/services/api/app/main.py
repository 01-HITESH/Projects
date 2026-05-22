from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.projects import router as projects_router
from app.core.config import settings


app = FastAPI(
    title="RoomMorph AI API",
    version="0.1.0",
    description="2D room redesign, concept selection, and 3D scene generation API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.storage_root.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.storage_root), name="static")
app.include_router(projects_router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
