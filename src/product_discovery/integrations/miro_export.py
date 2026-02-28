"""
Miro Export — push Discovery artifacts to a Miro board via REST API v2.

Creates:
- Sticky notes (insights, assumptions — color-coded by type)
- Shapes + connectors (OST tree, Forces diagram)
- Frames grouping by Discovery phase
- Image cards from Plotly chart PNGs

Requires: MIRO_ACCESS_TOKEN + MIRO_BOARD_ID in .env
Docs: https://developers.miro.com/reference/api-reference
"""

import json
import time
from typing import Optional

import requests


MIRO_API_BASE = "https://api.miro.com/v2"

# Color mapping for assumption types
ASSUMPTION_COLORS = {
    "desirability": "cyan",
    "viability": "green",
    "feasibility": "yellow",
    "usability": "violet",
    "ethical": "red",
}

# Color mapping for evidence types
EVIDENCE_COLORS = {
    "genuine": "green",
    "polite_lie": "red",
    "vague": "yellow",
}

STATUS_ICONS = {
    "untested": "⬜",
    "testing": "🔄",
    "validated": "✅",
    "invalidated": "❌",
}


class MiroClient:
    """Thin wrapper around Miro REST API v2."""

    def __init__(self, board_id: str, access_token: str):
        self.board_id = board_id
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        self._request_count = 0

    def _rate_limit(self):
        """Simple rate limiter — Miro allows ~5 req/sec on free tier."""
        self._request_count += 1
        if self._request_count % 4 == 0:
            time.sleep(0.5)

    def _post(self, endpoint: str, data: dict) -> dict:
        self._rate_limit()
        url = f"{MIRO_API_BASE}/boards/{self.board_id}/{endpoint}"
        resp = requests.post(url, headers=self.headers, json=data, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def create_frame(self, title: str, x: int = 0, y: int = 0,
                     width: int = 1200, height: int = 800) -> dict:
        """Create a frame (container) on the board."""
        return self._post("frames", {
            "data": {"title": title, "format": "custom"},
            "style": {"fillColor": "#1a1a2e"},
            "geometry": {"width": width, "height": height},
            "position": {"x": x, "y": y, "origin": "center"},
        })

    def create_sticky_note(self, content: str, color: str = "yellow",
                           x: int = 0, y: int = 0, parent_id: str = None) -> dict:
        """Create a sticky note."""
        data = {
            "data": {"content": content, "shape": "square"},
            "style": {"fillColor": color, "textAlign": "left", "textAlignVertical": "top"},
            "position": {"x": x, "y": y, "origin": "center"},
        }
        if parent_id:
            data["parent"] = {"id": parent_id}
        return self._post("sticky_notes", data)

    def create_shape(self, content: str, shape: str = "round_rectangle",
                     x: int = 0, y: int = 0, width: int = 200, height: int = 80,
                     fill_color: str = "#264653", font_color: str = "#ffffff",
                     parent_id: str = None) -> dict:
        """Create a shape (rectangle, circle, etc.)."""
        data = {
            "data": {"content": f"<p>{content}</p>", "shape": shape},
            "style": {
                "fillColor": fill_color,
                "fontColor": font_color,
                "fontSize": "14",
                "borderColor": "#ffffff",
                "borderWidth": "2",
            },
            "geometry": {"width": width, "height": height},
            "position": {"x": x, "y": y, "origin": "center"},
        }
        if parent_id:
            data["parent"] = {"id": parent_id}
        return self._post("shapes", data)

    def create_connector(self, start_id: str, end_id: str,
                         style: str = "straight") -> dict:
        """Create a connector between two items."""
        return self._post("connectors", {
            "startItem": {"id": start_id},
            "endItem": {"id": end_id},
            "style": {
                "strokeColor": "#06b6d4",
                "strokeWidth": "2",
                "startStrokeCap": "none",
                "endStrokeCap": "stealth",
            },
            "shape": style,
        })

    def create_text(self, content: str, x: int = 0, y: int = 0,
                    font_size: int = 24, color: str = "#ffffff") -> dict:
        """Create a text item."""
        return self._post("texts", {
            "data": {"content": f"<p>{content}</p>"},
            "style": {"color": color, "fontSize": str(font_size)},
            "position": {"x": x, "y": y, "origin": "center"},
        })


def export_to_miro(
    board_id: str,
    access_token: str,
    project_name: str,
    discovery_data: dict,
    sections: list[str] = None,
) -> None:
    """Export discovery data to a Miro board.

    Args:
        board_id: Miro board ID
        access_token: Miro API access token
        project_name: Project name for labeling
        discovery_data: Dict with discovery data (from _load_project_data)
        sections: List of sections to export: ost, forces, assumptions, insights, all
    """
    if sections is None:
        sections = ["all"]

    client = MiroClient(board_id, access_token)
    export_all = "all" in sections

    print(f"🎨 Exporting to Miro board: {board_id}")

    # --- Header frame ---
    x_offset = 0
    header_frame = client.create_frame(
        title=f"🔍 Discovery: {project_name}",
        x=x_offset, y=0, width=400, height=200,
    )
    header_id = header_frame["id"]

    verdict = discovery_data.get("verdict", "NEEDS_MORE_DATA")
    verdict_icon = {"GO": "✅", "NO-GO": "❌", "NEEDS_MORE_DATA": "⚠️"}.get(verdict, "?")
    client.create_text(
        f"{verdict_icon} {verdict} | Confidence: {discovery_data.get('confidence', '?')}%",
        x=0, y=0,
    )
    print(f"   ✅ Header frame created")
    x_offset += 500

    # --- Assumptions ---
    if export_all or "assumptions" in sections:
        assumptions = discovery_data.get("assumptions_data", [])
        if assumptions:
            frame = client.create_frame(
                title="🗺️ Assumption Map",
                x=x_offset, y=0,
                width=max(600, len(assumptions) * 220),
                height=400,
            )
            frame_id = frame["id"]

            for i, a in enumerate(assumptions):
                color = ASSUMPTION_COLORS.get(a.get("type", ""), "yellow")
                status_icon = STATUS_ICONS.get(a.get("status", ""), "?")
                content = (
                    f"<b>{a['id']}</b> [{a.get('type', '?')}]<br>"
                    f"{status_icon} {a.get('status', '?')}<br>"
                    f"R{a.get('risk', '?')}×U{a.get('uncertainty', '?')}<br>"
                    f"{a.get('hypothesis', '')[:60]}"
                )
                client.create_sticky_note(
                    content=content,
                    color=color,
                    x=-250 + (i * 220), y=0,
                    parent_id=frame_id,
                )

            print(f"   ✅ {len(assumptions)} assumptions exported")
            x_offset += max(700, len(assumptions) * 220 + 100)

    # --- JTBD / Key findings ---
    if export_all or "jtbd" in sections:
        jtbd_data = {}
        for key in ["functional_job", "emotional_job", "social_job"]:
            if discovery_data.get(key):
                jtbd_data[key] = discovery_data[key]

        if jtbd_data:
            frame = client.create_frame(
                title="🎯 JTBD Analysis",
                x=x_offset, y=0, width=600, height=400,
            )
            frame_id = frame["id"]

            labels = {
                "functional_job": ("🔧 Functional", "cyan"),
                "emotional_job": ("❤️ Emotional", "red"),
                "social_job": ("👥 Social", "green"),
            }
            for i, (key, value) in enumerate(jtbd_data.items()):
                label, color = labels.get(key, ("?", "yellow"))
                client.create_sticky_note(
                    content=f"<b>{label}</b><br>{value[:100]}",
                    color=color,
                    x=-200 + (i * 220), y=0,
                    parent_id=frame_id,
                )

            print(f"   ✅ JTBD analysis exported")
            x_offset += 700

    # --- Evidence level ---
    if export_all or "evidence" in sections:
        evidence = discovery_data.get("evidence_level")
        if evidence:
            client.create_shape(
                content=f"📈 Evidence: {evidence}",
                x=x_offset, y=-200,
                width=300, height=100,
                fill_color="#1e40af",
            )
            print(f"   ✅ Evidence level exported")
            x_offset += 400

    print(f"\n🎉 Export complete! Open your Miro board to see the results.")
    print(f"   https://miro.com/app/board/{board_id}/")
