"""
FastAPI main app — Product Discovery Web UI backend.

Uruchomienie:
    uvicorn backend.main:app --reload --port 8000

Wymaga w katalogu głównym projektu (nie wewnątrz backend/):
    PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
"""
import sys
from pathlib import Path

# Dodajemy src/ do PYTHONPATH żeby importy product_discovery działały
_src = Path(__file__).parent.parent / "src"
if str(_src) not in sys.path:
    sys.path.insert(0, str(_src))

# Ładuj .env z katalogu głównego projektu (ANTHROPIC_API_KEY itp.)
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import load_config
from backend.db import init_db, init_batch_table
from backend.routes import agents, auth, batch, discovery, export, projects, settings, simulator


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_config()   # wczytaj config + zastosuj env fallbacki
    await init_db()
    await init_batch_table()
    yield


app = FastAPI(
    title="Product Discovery API",
    description="HTTP wrapper dla Product Discovery CLI — uruchamia agenty AI przez przeglądarkę.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discovery.router, prefix="/api/discovery", tags=["discovery"])
app.include_router(simulator.router, prefix="/api/simulator", tags=["simulator"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(batch.router, prefix="/api/batch", tags=["batch"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
