"""
Export routes — generowanie raportów HTML, PDF i eksport do Miro.

Używa istniejących generatorów z product_discovery.visualizations
bez modyfikacji ich kodu.

Miro endpoint:
  POST /export/{session_id}/miro
  Body: { token, board_id, dry_run, sections }
  dry_run=true → symulacja bez wywołań API (do testów bez konta Miro)
"""
import json
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel

from backend.config import get as cfg_get
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


# ── Miro export ───────────────────────────────────────────────────────────────

class MiroExportRequest(BaseModel):
    token: Optional[str] = None      # Bearer token; fallback: MIRO_ACCESS_TOKEN env
    board_id: Optional[str] = None   # Board ID; fallback: MIRO_BOARD_ID env
    dry_run: bool = False             # True = symulacja bez API (do testów)
    sections: list[str] = ["all"]    # ['all'] lub podzbiór ['jtbd','forces','assumptions']


class MiroExportResponse(BaseModel):
    url: str
    items_created: int
    dry_run: bool
    log: list[str]


@router.post("/{session_id}/miro", response_model=MiroExportResponse)
async def export_miro(session_id: str, req: MiroExportRequest):
    """
    Eksportuje wyniki Discovery do tablicy Miro.

    dry_run=true → symuluje eksport bez wywołań API — używaj do testowania
    bez konta Miro. Zwraca log tego co by zostało stworzone.
    """
    session = await get_session(session_id)
    if not session or not session.get("result_json"):
        raise HTTPException(status_code=404, detail="Result not found")

    # Rozwiąż token i board_id: request > config > env
    token = req.token or cfg_get("miro_access_token") or os.getenv("MIRO_ACCESS_TOKEN", "")
    board_id = req.board_id or cfg_get("miro_board_id") or os.getenv("MIRO_BOARD_ID", "")

    if not req.dry_run and (not token or not board_id):
        raise HTTPException(
            status_code=422,
            detail="Podaj token i board_id, lub ustaw MIRO_ACCESS_TOKEN i MIRO_BOARD_ID w .env. "
                   "Możesz też użyć dry_run=true żeby przetestować bez konta.",
        )

    # Fallback dla dry_run bez danych
    if req.dry_run:
        token = token or "dry-run-token"
        board_id = board_id or "dry-run-board"

    data = json.loads(session["result_json"])
    discovery_data = _session_to_discovery_data(data)
    project_name = data.get("project_name", session_id[:8])

    try:
        from product_discovery.integrations.miro_export import export_to_miro
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Miro integration unavailable: {e}")

    try:
        result = export_to_miro(
            board_id=board_id,
            access_token=token,
            project_name=project_name,
            discovery_data=discovery_data,
            sections=req.sections,
            dry_run=req.dry_run,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Miro export failed: {e}")

    return MiroExportResponse(
        url=result["url"],
        items_created=result["items_created"],
        dry_run=req.dry_run,
        log=result["log"],
    )


# ── Slack export ───────────────────────────────────────────────────────────────

class SlackNotifyRequest(BaseModel):
    webhook_url: Optional[str] = None   # fallback: config / SLACK_WEBHOOK_URL env
    report_url: str = ""                # URL do raportu wyświetlany w wiadomości
    event: str = "discovery_complete"  # typ eventu


class SlackNotifyResponse(BaseModel):
    sent: bool
    webhook_used: bool
    message: str


@router.post("/{session_id}/slack", response_model=SlackNotifyResponse)
async def export_slack(session_id: str, req: SlackNotifyRequest):
    """
    Wysyła powiadomienie Slack o zakończeniu Discovery.
    Używa istniejącego integracji slack_notify.py.
    """
    session = await get_session(session_id)
    if not session or not session.get("result_json"):
        raise HTTPException(status_code=404, detail="Result not found")

    # Webhook: request > config > env
    webhook_url = req.webhook_url or cfg_get("slack_webhook_url") or os.getenv("SLACK_WEBHOOK_URL", "")
    if not webhook_url:
        raise HTTPException(
            status_code=422,
            detail="Brak Slack Webhook URL. Skonfiguruj go w Settings lub podaj w żądaniu.",
        )

    data = json.loads(session["result_json"])
    discovery_data = _session_to_discovery_data(data)

    try:
        from product_discovery.integrations.slack_notify import send_slack_notification
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Slack integration unavailable: {e}")

    try:
        sent = send_slack_notification(
            webhook_url=webhook_url,
            project_name=discovery_data.get("project_name", session_id[:8]),
            event=req.event,
            discovery_data=discovery_data,
            report_url=req.report_url,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slack send failed: {e}")

    return SlackNotifyResponse(
        sent=sent,
        webhook_used=True,
        message="Powiadomienie wysłane" if sent else "Wysyłanie nie powiodło się — sprawdź Webhook URL",
    )


# ── Google Docs export ─────────────────────────────────────────────────────────

class GDocsExportRequest(BaseModel):
    share_with: list[str] = []    # Lista emaili do udostępnienia dokumentu
    folder_id: Optional[str] = None  # Opcjonalny ID folderu Google Drive


class GDocsExportResponse(BaseModel):
    doc_url: str
    doc_id: str
    shared_with: list[str]


@router.post("/{session_id}/gdocs", response_model=GDocsExportResponse)
async def export_gdocs(session_id: str, req: GDocsExportRequest):
    """
    Eksportuje raport Discovery do Google Docs.
    Wymaga zalogowania przez OAuth2 (Settings → Zaloguj się z Google).
    """
    session = await get_session(session_id)
    if not session or not session.get("result_json"):
        raise HTTPException(status_code=404, detail="Result not found")

    # Sprawdź autoryzację Google
    from backend.routes.auth import get_google_credentials
    credentials = get_google_credentials()

    data = json.loads(session["result_json"])
    discovery_data = _session_to_discovery_data(data)
    project_name = data.get("project_name", session_id[:8])

    try:
        from googleapiclient.discovery import build
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="google-api-python-client wymagane: pip install 'product-discovery[gdocs]'",
        )

    try:
        docs = build("docs", "v1", credentials=credentials)
        drive = build("drive", "v3", credentials=credentials)

        # Utwórz dokument
        doc_body = {"name": f"Discovery Report — {project_name}"}
        if req.folder_id:
            doc_body["parents"] = [req.folder_id]

        doc = docs.documents().create(
            body={"title": f"Discovery Report — {project_name}"}
        ).execute()
        doc_id = doc["documentId"]

        # Opcjonalnie: przenieś do folderu
        if req.folder_id:
            drive.files().update(
                fileId=doc_id,
                addParents=req.folder_id,
                removeParents="root",
            ).execute()

        # Wstaw treść
        from product_discovery.integrations.gdocs_export import _build_doc_content
        requests_list = _build_doc_content(project_name, discovery_data)
        if requests_list:
            docs.documents().batchUpdate(
                documentId=doc_id,
                body={"requests": requests_list},
            ).execute()

        # Udostępnij
        for email in req.share_with:
            drive.permissions().create(
                fileId=doc_id,
                body={"type": "user", "role": "writer", "emailAddress": email},
                sendNotificationEmail=True,
            ).execute()

        doc_url = f"https://docs.google.com/document/d/{doc_id}/edit"

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Docs export failed: {e}")

    return GDocsExportResponse(
        doc_url=doc_url,
        doc_id=doc_id,
        shared_with=req.share_with,
    )
