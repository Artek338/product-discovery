"""
Projects routes — lista projektów/sesji.
"""
import json
from typing import List

from fastapi import APIRouter

from backend.db import list_sessions
from backend.models import ProjectSummary

router = APIRouter()


@router.get("", response_model=List[ProjectSummary])
async def get_projects():
    """Zwraca listę wszystkich sesji discovery z podstawowymi metadanymi."""
    sessions = await list_sessions()
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

    return result
