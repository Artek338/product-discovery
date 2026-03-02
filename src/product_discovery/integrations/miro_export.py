"""
Miro Export — push Discovery artifacts to a Miro board via REST API v2.

Creates:
- Frames grouping by Discovery phase
- Sticky notes: JTBD jobs, Forces Diagram (Push/Pull/Anxiety/Habit), Assumptions
- Shapes + connectors: Forces layout
- Text items: header, evidence level

Requires: MIRO_ACCESS_TOKEN + MIRO_BOARD_ID in .env
Docs: https://developers.miro.com/reference/api-reference

Tryb dry_run=True:
- Zero wywołań API — symuluje eksport, loguje co by stworzył
- Przydatny do testowania bez konta Miro
"""

import re
import time
from typing import Optional

import requests


MIRO_API_BASE = "https://api.miro.com/v2"

# Kolory sticky notes dla Forces Diagram
FORCES_COLORS = {
    "push":    "light_green",   # wypycha ze status quo
    "pull":    "cyan",          # przyciąga do nowego
    "anxiety": "red",           # hamuje zmianę
    "habit":   "yellow",        # siła nawyku
}

# Kolory dla typów założeń
ASSUMPTION_COLORS = {
    "desirability": "cyan",
    "viability":    "green",
    "feasibility":  "yellow",
    "usability":    "violet",
    "ethical":      "red",
    "fatal":        "red",
    "high_risk":    "orange",
    "acceptable":   "light_green",
}

EVIDENCE_COLORS = {
    "genuine":    "green",
    "polite_lie": "red",
    "vague":      "yellow",
}

STATUS_ICONS = {
    "untested":    "⬜",
    "testing":     "🔄",
    "validated":   "✅",
    "invalidated": "❌",
}

FORCES_ICONS = {
    "push":    "🔥",
    "pull":    "✨",
    "anxiety": "⚠️",
    "habit":   "🔒",
}


class MiroClient:
    """
    Thin wrapper around Miro REST API v2.

    dry_run=True: symuluje wszystkie operacje bez wywołań API.
    Zwraca fake ID-ki żeby reszta kodu działała identycznie.
    """

    def __init__(self, board_id: str, access_token: str, dry_run: bool = False):
        self.board_id = board_id
        self.dry_run = dry_run
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        self._request_count = 0
        self._dry_run_counter = 0
        self.dry_run_log: list[str] = []  # co by zostało stworzone

    def _rate_limit(self):
        """Simple rate limiter — Miro allows ~5 req/sec on free tier."""
        self._request_count += 1
        if self._request_count % 4 == 0:
            time.sleep(0.5)

    def _fake_id(self, kind: str) -> str:
        self._dry_run_counter += 1
        return f"dry-run-{kind}-{self._dry_run_counter:04d}"

    def _post(self, endpoint: str, data: dict) -> dict:
        if self.dry_run:
            fake_id = self._fake_id(endpoint.split("/")[0])
            label = data.get("data", {}).get("title") or data.get("data", {}).get("content", "")[:60]
            self.dry_run_log.append(f"[DRY-RUN] POST {endpoint}: {label!r} → id={fake_id}")
            return {"id": fake_id}

        self._rate_limit()
        url = f"{MIRO_API_BASE}/boards/{self.board_id}/{endpoint}"
        resp = requests.post(url, headers=self.headers, json=data, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def create_frame(self, title: str, x: int = 0, y: int = 0,
                     width: int = 1200, height: int = 800) -> dict:
        return self._post("frames", {
            "data": {"title": title, "format": "custom"},
            "style": {"fillColor": "#1a1a2e"},
            "geometry": {"width": width, "height": height},
            "position": {"x": x, "y": y, "origin": "center"},
        })

    def create_sticky_note(self, content: str, color: str = "yellow",
                           x: int = 0, y: int = 0, parent_id: str = None) -> dict:
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

    def create_connector(self, start_id: str, end_id: str, style: str = "straight") -> dict:
        return self._post("connectors", {
            "startItem": {"id": start_id},
            "endItem": {"id": end_id},
            "style": {
                "strokeColor": "#14B8A6",
                "strokeWidth": "2",
                "startStrokeCap": "none",
                "endStrokeCap": "stealth",
            },
            "shape": style,
        })

    def create_text(self, content: str, x: int = 0, y: int = 0,
                    font_size: int = 24, color: str = "#ffffff",
                    parent_id: str = None) -> dict:
        data = {
            "data": {"content": f"<p>{content}</p>"},
            "style": {"color": color, "fontSize": str(font_size)},
            "position": {"x": x, "y": y, "origin": "center"},
        }
        if parent_id:
            data["parent"] = {"id": parent_id}
        return self._post("texts", data)


# ============================================================================
# PARSERY MARKDOWN → struktury
# ============================================================================

def _parse_forces_from_markdown(forces_report: str) -> dict[str, list[str]]:
    """
    Parsuje markdown Forces Diagram do słownika { 'push': [...], 'pull': [...], ... }.

    Obsługuje nagłówki: ### Push, ### Pull, ### Anxiety, ### Habit
    i wiersze zaczynające się od `-` lub `*` jako elementy listy.
    """
    result: dict[str, list[str]] = {"push": [], "pull": [], "anxiety": [], "habit": []}
    current_force: Optional[str] = None

    for line in forces_report.splitlines():
        line = line.strip()
        if not line:
            continue

        lower = line.lower()
        # Wykryj sekcję
        if re.search(r"###?\s*push", lower):
            current_force = "push"
        elif re.search(r"###?\s*pull", lower):
            current_force = "pull"
        elif re.search(r"###?\s*anxi", lower):
            current_force = "anxiety"
        elif re.search(r"###?\s*habit", lower):
            current_force = "habit"
        elif current_force and re.match(r"^[-*•]\s+", line):
            # Element listy
            text = re.sub(r"^[-*•]\s+", "", line)
            # Usuń markdown bold/italic
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
            text = re.sub(r"\*(.+?)\*", r"\1", text)
            if text:
                result[current_force].append(text[:120])

    return result


def _parse_assumptions_from_markdown(assumption_map: str) -> list[dict]:
    """
    Parsuje mapę założeń do listy { text, risk_level }.

    Obsługuje sekcje: FATAL, HIGH RISK, ACCEPTABLE / ACCEPTABLE RISK
    i wiersze tabelki markdown | Założenie | ... |
    """
    items = []
    current_risk = "acceptable"

    for line in assumption_map.splitlines():
        line = line.strip()
        lower = line.lower()

        if "fatal" in lower and line.startswith("#"):
            current_risk = "fatal"
        elif "high risk" in lower and line.startswith("#"):
            current_risk = "high_risk"
        elif "acceptable" in lower and line.startswith("#"):
            current_risk = "acceptable"
        elif line.startswith("|") and "|" in line[1:]:
            # Wiersz tabelki — pomijamy nagłówki i separatory
            cols = [c.strip() for c in line.split("|") if c.strip()]
            if not cols or set("".join(cols)) <= set("-: "):
                continue
            # Pierwsza kolumna = treść założenia
            text = cols[0]
            if text.lower() in ("założenie", "assumption", ""):
                continue
            items.append({"text": text[:120], "risk": current_risk})

    return items


# ============================================================================
# GŁÓWNA FUNKCJA EKSPORTU
# ============================================================================

def export_to_miro(
    board_id: str,
    access_token: str,
    project_name: str,
    discovery_data: dict,
    sections: list[str] = None,
    dry_run: bool = False,
) -> dict:
    """
    Eksportuje wyniki Discovery do tablicy Miro.

    Args:
        board_id:       ID tablicy Miro
        access_token:   Bearer token
        project_name:   Nazwa projektu (label w nagłówku)
        discovery_data: Słownik z danymi discovery (_session_to_discovery_data)
        sections:       ['all'] lub podzbiór ['jtbd','forces','assumptions','evidence']
        dry_run:        True = zero wywołań API, zwraca log tego co by stworzono

    Returns:
        { 'url': str, 'items_created': int, 'log': list[str] }
    """
    if sections is None:
        sections = ["all"]

    client = MiroClient(board_id, access_token, dry_run=dry_run)
    export_all = "all" in sections
    items_created = 0
    x_offset = 0

    prefix = "[DRY-RUN] " if dry_run else ""
    print(f"{prefix}🎨 Eksport do Miro: {board_id} | projekt: {project_name}")

    # ── Nagłówek ──────────────────────────────────────────────────────────────
    verdict = discovery_data.get("verdict", "NEEDS_MORE_DATA")
    verdict_icon = {"GO": "✅", "NO-GO": "❌", "NEEDS_MORE_DATA": "⚠️"}.get(verdict, "?")
    confidence = discovery_data.get("confidence", "?")

    header_frame = client.create_frame(
        title=f"🔍 Discovery: {project_name}",
        x=x_offset, y=0, width=420, height=200,
    )
    header_id = header_frame["id"]
    client.create_text(
        f"{verdict_icon} {verdict} | Confidence: {confidence}%",
        x=x_offset, y=0, font_size=20,
        parent_id=header_id,
    )
    evidence = discovery_data.get("evidence_level", "")
    if evidence:
        client.create_text(
            f"📈 Evidence: {evidence}",
            x=x_offset, y=60, font_size=14, color="#94A3B8",
            parent_id=header_id,
        )
    items_created += 3
    x_offset += 500
    print(f"{prefix}  ✅ Nagłówek")

    # ── JTBD ──────────────────────────────────────────────────────────────────
    if export_all or "jtbd" in sections:
        jtbd_jobs = {
            "functional_job": ("🔧 Functional Job", "cyan"),
            "emotional_job":  ("❤️ Emotional Job",  "red"),
            "social_job":     ("👥 Social Job",      "light_green"),
        }
        jobs = [(label, color, discovery_data.get(key, ""))
                for key, (label, color) in jtbd_jobs.items()
                if discovery_data.get(key)]

        if jobs:
            frame_w = max(600, len(jobs) * 240)
            frame = client.create_frame(
                title="🎯 JTBD Analysis",
                x=x_offset, y=0, width=frame_w, height=320,
            )
            frame_id = frame["id"]
            for i, (label, color, text) in enumerate(jobs):
                client.create_sticky_note(
                    content=f"<b>{label}</b><br><br>{text[:150]}",
                    color=color,
                    x=-200 + i * 230, y=0,
                    parent_id=frame_id,
                )
                items_created += 1
            items_created += 1
            x_offset += frame_w + 100
            print(f"{prefix}  ✅ JTBD ({len(jobs)} jobs)")

    # ── Forces Diagram ────────────────────────────────────────────────────────
    if export_all or "forces" in sections:
        forces_md = discovery_data.get("forces_report", "")
        forces = _parse_forces_from_markdown(forces_md) if forces_md else {}
        total_items = sum(len(v) for v in forces.values())

        if total_items > 0:
            frame_w = max(1000, total_items * 160)
            frame = client.create_frame(
                title="⚡ Forces Diagram (Bob Moesta)",
                x=x_offset, y=0, width=frame_w, height=500,
            )
            frame_id = frame["id"]
            items_created += 1

            # Układ: 2 kolumny × 2 wiersze (Push/Pull u góry, Anxiety/Habit na dole)
            layout = [
                ("push",    -frame_w // 4, -120),
                ("pull",     frame_w // 4, -120),
                ("anxiety", -frame_w // 4,  120),
                ("habit",    frame_w // 4,  120),
            ]
            label_ids = {}

            for force, col_x, row_y in layout:
                items = forces.get(force, [])
                icon = FORCES_ICONS[force]
                color = FORCES_COLORS[force]

                # Etykieta siły
                lbl = client.create_text(
                    f"{icon} {force.upper()}",
                    x=col_x, y=row_y - 80,
                    font_size=16, color="#ffffff",
                    parent_id=frame_id,
                )
                label_ids[force] = lbl["id"]
                items_created += 1

                for j, item in enumerate(items[:5]):   # max 5 na siłę
                    client.create_sticky_note(
                        content=item,
                        color=color,
                        x=col_x + (j - len(items) // 2) * 180,
                        y=row_y,
                        parent_id=frame_id,
                    )
                    items_created += 1

            # Connector: Push → Pull (siły zmiany)
            if "push" in label_ids and "pull" in label_ids:
                client.create_connector(label_ids["push"], label_ids["pull"])
                items_created += 1
            # Connector: Anxiety → Habit (siły status quo)
            if "anxiety" in label_ids and "habit" in label_ids:
                client.create_connector(label_ids["anxiety"], label_ids["habit"])
                items_created += 1

            x_offset += frame_w + 100
            print(f"{prefix}  ✅ Forces Diagram ({total_items} elementów)")
        else:
            print(f"{prefix}  ⚠️  Forces Diagram — brak danych do sparsowania")

    # ── Mapa założeń ──────────────────────────────────────────────────────────
    if export_all or "assumptions" in sections:
        assumption_md = discovery_data.get("assumption_map", "")
        # Obsłuż zarówno listę jak i string (dla kompatybilności)
        if isinstance(assumption_md, list):
            assumption_md = "\n".join(assumption_md)

        assumptions = _parse_assumptions_from_markdown(assumption_md) if assumption_md else []

        # Fallback: stary format (assumptions_data jako lista dict)
        if not assumptions:
            assumptions = [
                {"text": a.get("hypothesis", "")[:120], "risk": a.get("type", "acceptable")}
                for a in discovery_data.get("assumptions_data", [])
            ]

        if assumptions:
            frame_w = max(700, len(assumptions) * 220)
            frame = client.create_frame(
                title="🗺️ Mapa Założeń",
                x=x_offset, y=0, width=frame_w, height=380,
            )
            frame_id = frame["id"]
            items_created += 1

            for i, a in enumerate(assumptions[:12]):   # max 12 sticky notes
                color = ASSUMPTION_COLORS.get(a["risk"], "yellow")
                risk_icon = {"fatal": "💀", "high_risk": "🔴", "acceptable": "🟢"}.get(a["risk"], "⬜")
                client.create_sticky_note(
                    content=f"{risk_icon} {a['text']}",
                    color=color,
                    x=-300 + (i % 6) * 210,
                    y=-80 if i < 6 else 80,
                    parent_id=frame_id,
                )
                items_created += 1

            x_offset += frame_w + 100
            print(f"{prefix}  ✅ Mapa założeń ({len(assumptions)} pozycji)")
        else:
            print(f"{prefix}  ⚠️  Mapa założeń — brak danych")

    board_url = f"https://miro.com/app/board/{board_id}/"
    if dry_run:
        print(f"\n[DRY-RUN] Symulacja zakończona. Zostałoby stworzonych {items_created} elementów.")
        print(f"[DRY-RUN] Po podaniu prawdziwego tokena eksport trafi na: {board_url}")
    else:
        print(f"\n🎉 Eksport zakończony! {items_created} elementów → {board_url}")

    return {
        "url": board_url,
        "items_created": items_created,
        "log": client.dry_run_log,
    }
