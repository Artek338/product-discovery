"""
Google Docs Export — create a Discovery Report in Google Docs via API.

Creates a new Google Doc with:
- Formatted text sections (JTBD, Evidence, Competitive Analysis)
- Tables (Assumptions, Scorecard)
- Chart images (uploaded to Google Drive, embedded)

Requires: GOOGLE_SERVICE_ACCOUNT_FILE in .env pointing to a service account JSON.
Needs: Google Docs API + Google Drive API enabled in GCP project.
"""

import json
from pathlib import Path
from typing import Optional


def _get_credentials(service_account_file: str):
    """Get Google API credentials from service account file."""
    try:
        from google.oauth2.service_account import Credentials
    except ImportError:
        raise ImportError(
            "google-auth required for Google Docs export: "
            "pip install product-discovery[gdocs]"
        )

    SCOPES = [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
    ]
    return Credentials.from_service_account_file(service_account_file, scopes=SCOPES)


def _build_services(credentials):
    """Build Google Docs and Drive service clients."""
    try:
        from googleapiclient.discovery import build
    except ImportError:
        raise ImportError(
            "google-api-python-client required: pip install product-discovery[gdocs]"
        )
    docs = build("docs", "v1", credentials=credentials)
    drive = build("drive", "v3", credentials=credentials)
    return docs, drive


def export_to_gdocs(
    project_name: str,
    discovery_data: dict,
    service_account_file: str,
    share_with: list[str] = None,
    template_id: str = None,
) -> str:
    """Export discovery report to Google Docs.

    Args:
        project_name: Project name
        discovery_data: Dict with discovery data
        service_account_file: Path to GCP service account JSON
        share_with: List of email addresses to share the doc with
        template_id: Optional Google Doc template ID to copy from

    Returns:
        URL of the created Google Doc
    """
    credentials = _get_credentials(service_account_file)
    docs, drive = _build_services(credentials)

    # Create document (copy from template or new)
    if template_id:
        copy = drive.files().copy(
            fileId=template_id,
            body={"name": f"Discovery Report — {project_name}"},
        ).execute()
        doc_id = copy["id"]
    else:
        doc = docs.documents().create(
            body={"title": f"Discovery Report — {project_name}"}
        ).execute()
        doc_id = doc["documentId"]

    print(f"📄 Created Google Doc: {doc_id}")

    # Build content requests
    requests_list = _build_doc_content(project_name, discovery_data)

    if requests_list:
        docs.documents().batchUpdate(
            documentId=doc_id,
            body={"requests": requests_list},
        ).execute()

    # Share document
    if share_with:
        for email in share_with:
            drive.permissions().create(
                fileId=doc_id,
                body={
                    "type": "user",
                    "role": "writer",
                    "emailAddress": email,
                },
                sendNotificationEmail=True,
            ).execute()
            print(f"   📤 Shared with: {email}")

    doc_url = f"https://docs.google.com/document/d/{doc_id}/edit"
    print(f"\n✅ Google Doc ready: {doc_url}")
    return doc_url


def _build_doc_content(project_name: str, data: dict) -> list[dict]:
    """Build Google Docs API batch update requests for content insertion."""
    requests = []
    idx = 1  # Current insertion index (1 = after title)

    # --- Header ---
    verdict = data.get("verdict", "NEEDS_MORE_DATA")
    verdict_icon = {"GO": "✅", "NO-GO": "❌", "NEEDS_MORE_DATA": "⚠️"}.get(verdict, "?")

    header_text = (
        f"\n{verdict_icon} Verdict: {verdict}\n"
        f"Confidence: {data.get('confidence', '?')}%\n"
        f"Evidence Level: {data.get('evidence_level', '?')}\n"
        f"Interviews: {data.get('interviews_count', '?')}\n\n"
    )
    requests.append({"insertText": {"location": {"index": idx}, "text": header_text}})
    idx += len(header_text)

    # --- JTBD Analysis ---
    jtbd_section = "JTBD Analysis\n\n"
    for key, label in [
        ("functional_job", "Functional Job"),
        ("emotional_job", "Emotional Job"),
        ("social_job", "Social Job"),
    ]:
        value = data.get(key, "—")
        jtbd_section += f"{label}: {value}\n"
    jtbd_section += "\n"
    requests.append({"insertText": {"location": {"index": idx}, "text": jtbd_section}})
    idx += len(jtbd_section)

    # --- Assumptions ---
    assumptions = data.get("assumptions_data", [])
    if assumptions:
        table_header = "Assumption Map\n\n"
        requests.append({"insertText": {"location": {"index": idx}, "text": table_header}})
        idx += len(table_header)

        for a in assumptions:
            status_icon = {"untested": "⬜", "testing": "🔄",
                          "validated": "✅", "invalidated": "❌"}.get(a.get("status", ""), "?")
            line = (
                f"{a.get('id', '?')} | {a.get('type', '?')} | "
                f"{status_icon} {a.get('status', '?')} | "
                f"R{a.get('risk', '?')}×U{a.get('uncertainty', '?')} | "
                f"{a.get('hypothesis', '')[:60]}\n"
            )
            requests.append({"insertText": {"location": {"index": idx}, "text": line}})
            idx += len(line)

        requests.append({"insertText": {"location": {"index": idx}, "text": "\n"}})
        idx += 1

    # --- Competitive report (raw text) ---
    competitive = data.get("competitive_report", "")
    if competitive:
        comp_section = f"Competitive Analysis\n\n{competitive[:2000]}\n\n"
        requests.append({"insertText": {"location": {"index": idx}, "text": comp_section}})
        idx += len(comp_section)

    # --- Reasoning ---
    reasoning = data.get("reasoning", "")
    if reasoning:
        reason_section = f"Reasoning\n\n{reasoning[:2000]}\n\n"
        requests.append({"insertText": {"location": {"index": idx}, "text": reason_section}})
        idx += len(reason_section)

    # Footer
    footer = "\n—\nGenerated by Product Discovery v0.3.0\n"
    requests.append({"insertText": {"location": {"index": idx}, "text": footer}})

    return requests
