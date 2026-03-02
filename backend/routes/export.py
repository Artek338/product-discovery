"""
Export routes — generowanie raportów HTML i PDF.

Używa istniejących generatorów z product_discovery.visualizations
bez modyfikacji ich kodu.
"""
import json
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse

from backend.db import get_session

router = APIRouter()


def _session_to_discovery_data(data: dict) -> dict:
    """
    Konwertuje JSON sesji do formatu discovery_data oczekiwanego przez generatory raportów.
    """
    jtbd = data.get("jtbd", {})
    scorecard = data.get("scorecard", {})
    return {
        "project_name": data.get("project_name", ""),
        "verdict": jtbd.get("verdict", "NEEDS_MORE_DATA"),
        "evidence_level": jtbd.get("evidence_level", "0_Opinion"),
        "confidence": jtbd.get("confidence", 0),
        "functional_job": jtbd.get("functional_job", ""),
        "emotional_job": jtbd.get("emotional_job", ""),
        "social_job": jtbd.get("social_job", ""),
        "competing_solutions": jtbd.get("competing_solutions", []),
        "reasoning": jtbd.get("reasoning", ""),
        "competitive_report": data.get("competitive_report", ""),
        "forces_report": data.get("forces_report", ""),
        "assumption_map": data.get("assumption_map", ""),
        "synthetic_archetypes": data.get("synthetic_archetypes", ""),
        "hours_invested": scorecard.get("hours_invested", 0),
        "confidence_before": scorecard.get("confidence_before", 85),
        "confidence_after": scorecard.get("confidence_after", 0),
        "roi_estimate": scorecard.get("roi_estimate", ""),
        "duration_hours": data.get("duration_hours", 0),
    }


@router.get("/{session_id}/html")
async def export_html(session_id: str):
    session = await get_session(session_id)
    if not session or not session.get("result_json"):
        raise HTTPException(status_code=404, detail="Result not found")

    data = json.loads(session["result_json"])
    discovery_data = _session_to_discovery_data(data)
    project_name = data.get("project_name", session_id[:8])

    try:
        from product_discovery.visualizations.report_html import generate_html_report

        tmp_dir = tempfile.mkdtemp()
        html_path = generate_html_report(
            project_name=project_name,
            discovery_data=discovery_data,
            output_dir=tmp_dir,
            theme="light",
        )
        return FileResponse(
            str(html_path),
            media_type="text/html",
            filename=f"discovery_{project_name}.html",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HTML generation failed: {e}")


@router.get("/{session_id}/pdf")
async def export_pdf(session_id: str):
    session = await get_session(session_id)
    if not session or not session.get("result_json"):
        raise HTTPException(status_code=404, detail="Result not found")

    data = json.loads(session["result_json"])
    discovery_data = _session_to_discovery_data(data)
    project_name = data.get("project_name", session_id[:8])

    try:
        from product_discovery.visualizations.report_html import generate_html_report
        from product_discovery.visualizations.report_pdf import export_pdf as gen_pdf

        tmp_dir = tempfile.mkdtemp()
        html_path = generate_html_report(
            project_name=project_name,
            discovery_data=discovery_data,
            output_dir=tmp_dir,
            theme="light",
        )
        pdf_path = gen_pdf(html_path=html_path, output_dir=Path(tmp_dir))

        return FileResponse(
            str(pdf_path),
            media_type="application/pdf",
            filename=f"discovery_{project_name}.pdf",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
