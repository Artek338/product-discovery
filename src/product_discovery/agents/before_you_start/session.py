"""
BYS Session Manager — zarządzanie sesjami "Zanim zaczniesz".

Zapis/odczyt sesji jako JSON.
Lokalizacja: projects/{NAZWA}/before_you_start/bys_YYYYMMDD_HHMMSS.json

WAŻNE: Dane sesji NIGDY nie są wysyłane do zewnętrznych serwisów (Miro, Google Docs, Slack).
Wrażliwe dane — tylko lokalnie i do Anthropic API (jak reszta projektu).
"""

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from .schemas import BYSSummary


@dataclass
class BYSQAPair:
    """Para pytanie-odpowiedź z numerem porządkowym."""

    question: str
    answer: str
    order: int


@dataclass
class BYSSession:
    """
    Sesja 'Zanim zaczniesz'.

    Przechowuje pełną historię Q&A oraz finalny kontekst (summary).
    """

    session_id: str
    project: str
    topic: str
    created_at: str
    lang: str
    qa_pairs: List[BYSQAPair] = field(default_factory=list)
    summary: Optional[BYSSummary] = None
    status: str = "in_progress"  # in_progress | completed | interrupted

    @classmethod
    def new(cls, project: str, topic: str, lang: str = "pl") -> "BYSSession":
        """Tworzy nową sesję z unikalnym ID."""
        now = datetime.now()
        return cls(
            session_id=f"bys_{now.strftime('%Y%m%d_%H%M%S')}",
            project=project,
            topic=topic,
            created_at=now.isoformat(),
            lang=lang,
        )

    def add_qa(self, question: str, answer: str) -> None:
        """Dodaje parę pytanie-odpowiedź do historii."""
        self.qa_pairs.append(
            BYSQAPair(
                question=question,
                answer=answer,
                order=len(self.qa_pairs) + 1,
            )
        )

    def to_dict(self) -> dict:
        """Serializuje sesję do słownika (do zapisu jako JSON)."""
        data = asdict(self)
        # asdict nie obsługuje Pydantic BaseModel — robimy ręcznie
        data["summary"] = self.summary.model_dump() if self.summary else None
        return data

    @classmethod
    def from_dict(cls, data: dict) -> "BYSSession":
        """Deserializuje sesję ze słownika (z JSON)."""
        summary = None
        if data.get("summary"):
            summary = BYSSummary(**data["summary"])
        qa_pairs = [BYSQAPair(**p) for p in data.get("qa_pairs", [])]
        return cls(
            session_id=data["session_id"],
            project=data["project"],
            topic=data["topic"],
            created_at=data["created_at"],
            lang=data.get("lang", "pl"),
            qa_pairs=qa_pairs,
            summary=summary,
            status=data.get("status", "completed"),
        )


def _bys_dir(project: str, output_dir: str = "projects") -> Path:
    """Zwraca ścieżkę do katalogu BYS dla projektu."""
    return Path(output_dir) / project / "before_you_start"


def save_session(session: BYSSession, output_dir: str = "projects") -> Path:
    """Zapisuje sesję BYS do pliku JSON. Zwraca ścieżkę do pliku."""
    bys_dir = _bys_dir(session.project, output_dir)
    bys_dir.mkdir(parents=True, exist_ok=True)
    path = bys_dir / f"{session.session_id}.json"
    path.write_text(
        json.dumps(session.to_dict(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return path


def load_latest_session(
    project: str, output_dir: str = "projects"
) -> Optional[BYSSession]:
    """
    Ładuje najnowszą zakończoną sesję BYS dla projektu.

    Zwraca None jeśli brak sesji lub brak summary (sesja niekompletna).
    """
    bys_dir = _bys_dir(project, output_dir)
    if not bys_dir.exists():
        return None

    # Pliki posortowane od najnowszego (nazwa zawiera timestamp)
    files = sorted(bys_dir.glob("bys_*.json"), reverse=True)
    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            session = BYSSession.from_dict(data)
            if session.status in ("completed", "interrupted") and session.summary:
                return session
        except Exception:
            continue

    return None


def get_context_for_discovery(
    project: str, output_dir: str = "projects"
) -> str:
    """
    Zwraca context_for_discovery z najnowszej sesji BYS dla projektu.

    Zwraca pusty string jeśli:
    - Brak sesji BYS dla projektu
    - Sesja nie ma summary (przerwana przed wygenerowaniem)
    """
    session = load_latest_session(project, output_dir)
    if not session or not session.summary:
        return ""
    return session.summary.context_for_discovery
