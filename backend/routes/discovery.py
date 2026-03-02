"""
Discovery routes — uruchamianie sesji, polling statusu, pobieranie wyników.
"""
import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, HTTPException

from backend.db import (
    create_session,
    get_session,
    save_result,
    update_session_status,
)
from backend.models import (
    DiscoveryResultResponse,
    DiscoveryRunRequest,
    DiscoveryRunResponse,
    DiscoveryStatusResponse,
    JTBDResult,
    ScorecardResult,
)

router = APIRouter()

# Mapowanie węzłów na numery kroków (dla progress 0-8)
NODE_PROGRESS = {
    "SyntheticInterviewNode": 1,
    "BehavioralInterviewNode": 2,
    "CompetitiveResearchNode": 3,
    "EvidenceGradingNode": 4,
    "ForcesDiagramNode": 5,
    "SynthesisNode": 6,
    "AssumptionMapNode": 7,
    "ScorecardNode": 8,
    "UserInputNeededNode": 8,
}


async def _run_discovery_task(
    session_id: str,
    idea: str,
    project_name: str,
    mode: str,
    interview_notes: str,
):
    """Background task — uruchamia Discovery Graph i zapisuje postęp do SQLite."""
    # Import tutaj żeby nie blokować startu FastAPI
    from product_discovery.workflows.discovery_graph import run_discovery

    await update_session_status(session_id, "running", progress=0, log_entry="Discovery started")

    async def progress_callback(node_name: str, message: str = ""):
        """Async callback wywoływany przez węzły grafu — zapisuje postęp do SQLite."""
        progress = NODE_PROGRESS.get(node_name, 0)
        log = f"[{node_name}] {message}" if message else f"[{node_name}] Running..."
        await update_session_status(
            session_id,
            "running",
            progress=progress,
            current_node=node_name,
            log_entry=log,
        )

    try:
        result = await run_discovery(
            idea_description=idea,
            project_name=project_name,
            interview_notes=interview_notes or "",
            progress_callback=progress_callback,
        )

        # Serializuj wynik do JSON
        result_data = {
            "project_name": result.project_name,
            "duration_hours": result.duration_hours,
            "competitive_report": result.competitive_report,
            "forces_report": result.forces_report,
            "assumption_map": result.assumption_map,
            "synthetic_archetypes": result.synthetic_archetypes,
            "jtbd": {
                "functional_job": result.jtbd.functional_job,
                "emotional_job": result.jtbd.emotional_job,
                "social_job": result.jtbd.social_job,
                "competing_solutions": result.jtbd.competing_solutions,
                "verdict": result.jtbd.verdict,
                "evidence_level": result.jtbd.evidence_level,
                "confidence": result.jtbd.confidence,
                "reasoning": result.jtbd.reasoning,
            },
            "scorecard": {
                "hours_invested": result.scorecard.hours_invested,
                "evidence_level_achieved": result.scorecard.evidence_level_achieved,
                "confidence_before": result.scorecard.confidence_before,
                "confidence_after": result.scorecard.confidence_after,
                "roi_estimate": result.scorecard.roi_estimate,
            },
        }
        await save_result(session_id, json.dumps(result_data))
        await update_session_status(session_id, "completed", progress=8, log_entry="Discovery completed")

    except Exception as e:
        await update_session_status(
            session_id, "failed", log_entry=f"Error: {str(e)}"
        )
        raise


@router.post("/run", response_model=DiscoveryRunResponse)
async def run_discovery_endpoint(
    request: DiscoveryRunRequest,
    background_tasks: BackgroundTasks,
):
    session_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    await create_session(session_id, request.project_name, request.mode, created_at)

    background_tasks.add_task(
        _run_discovery_task,
        session_id=session_id,
        idea=request.idea,
        project_name=request.project_name,
        mode=request.mode,
        interview_notes=request.interview_notes or "",
    )

    return DiscoveryRunResponse(session_id=session_id, status="queued")


@router.get("/{session_id}/status", response_model=DiscoveryStatusResponse)
async def get_status(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    logs = json.loads(session.get("logs_json") or "[]")
    return DiscoveryStatusResponse(
        session_id=session_id,
        status=session["status"],
        progress=session.get("progress", 0),
        current_node=session.get("current_node"),
        logs=logs,
    )


@router.get("/{session_id}/result", response_model=DiscoveryResultResponse)
async def get_result(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["status"] not in ("completed", "failed"):
        raise HTTPException(status_code=202, detail="Discovery still in progress")

    result_json = session.get("result_json")
    if not result_json:
        raise HTTPException(status_code=404, detail="No result available")

    data = json.loads(result_json)
    jtbd_data = data.get("jtbd", {})
    scorecard_data = data.get("scorecard", {})

    return DiscoveryResultResponse(
        session_id=session_id,
        project_name=data.get("project_name", ""),
        status=session["status"],
        jtbd=JTBDResult(**jtbd_data) if jtbd_data else None,
        scorecard=ScorecardResult(**scorecard_data) if scorecard_data else None,
        competitive_report=data.get("competitive_report", ""),
        forces_report=data.get("forces_report", ""),
        assumption_map=data.get("assumption_map", ""),
        synthetic_archetypes=data.get("synthetic_archetypes", ""),
        duration_hours=data.get("duration_hours", 0.0),
    )
