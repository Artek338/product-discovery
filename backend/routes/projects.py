"""
Projects routes — lista projektów/sesji z paginacją.
"""
import json
import math
from typing import List

from fastapi import APIRouter, Query
from pydantic import BaseModel

from backend.db import list_sessions, count_sessions
from backend.models import ProjectSummary

router = APIRouter()


class ProjectsPage(BaseModel):
    items: List[ProjectSummary]
    total: int
    page: int
    pages: int
    size: int


@router.get("", response_model=ProjectsPage)
async def get_projects(
    page: int = Query(1, ge=1, description="Numer strony (1-based)"),
    size: int = Query(50, ge=1, le=200, description="Liczba wyników na stronę"),
):
    """Zwraca stronicowaną listę sesji discovery z podstawowymi metadanymi."""
    offset = (page - 1) * size
    sessions = await list_sessions(limit=size, offset=offset)
    total = await count_sessions()

    result = []
    for s in sessions:
        verdict = None
        confidence = None
        evidence_level = None

        if s.get("result_json"):
            try:
                data = json.loads(s["result_json"])
                jtbd = data.get("jtbd", {})
                verdict = jtbd.get("verdict")
                confidence = jtbd.get("confidence")
                evidence_level = jtbd.get("evidence_level")
            except Exception:
                pass

        result.append(
            ProjectSummary(
                session_id=s["id"],
                project_name=s["project_name"],
                mode=s["mode"],
                status=s["status"],
                verdict=verdict,
                confidence=confidence,
                evidence_level=evidence_level,
                created_at=s["created_at"],
            )
        )

    return ProjectsPage(
        items=result,
        total=total,
        page=page,
        pages=max(1, math.ceil(total / size)),
        size=size,
    )
