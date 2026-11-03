"""
LearnLoop Infinity 2.0 - Core FastAPI Backend Server.
Production-ready REST API powering the Futuristic 3D Virtual University.
"""
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import init_db
from .routers import courses, ai, arena, library, lab, collaboration, gamification, admin

# Initialize database schema and initial seed data
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="LearnLoop Infinity 2.0 Backend",
    description="Futuristic 3D LMS & Multi-Role Learning Platform API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(courses.router)
app.include_router(ai.router)
app.include_router(arena.router)
app.include_router(library.router)
app.include_router(lab.router)
app.include_router(collaboration.router)
app.include_router(gamification.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "LearnLoop Infinity 2.0",
        "version": "2.0.0",
        "sectors": [
            "Knowledge Tower",
            "AI Innovation Hub",
            "Challenge Arena",
            "Digital Library",
            "Experiment Lab",
            "Collaboration Centre",
            "Progress Centre"
        ]
    }

# Serve frontend build if dist folder exists
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
