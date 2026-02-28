"""
Assumption Tracker — lifecycle management for product assumptions.

Based on Teresa Torres taxonomy (Desirability, Viability, Feasibility, Usability, Ethical).
Tracks assumptions from identification through testing to validation/invalidation.
"""

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional


class AssumptionType(str, Enum):
    DESIRABILITY = "desirability"
    VIABILITY = "viability"
    FEASIBILITY = "feasibility"
    USABILITY = "usability"
    ETHICAL = "ethical"


class AssumptionStatus(str, Enum):
    UNTESTED = "untested"
    TESTING = "testing"
    VALIDATED = "validated"
    INVALIDATED = "invalidated"


@dataclass
class Assumption:
    """A single product assumption to be tracked and tested."""
    id: str
    hypothesis: str
    type: AssumptionType
    status: AssumptionStatus = AssumptionStatus.UNTESTED

    # Risk assessment (1-10)
    risk: int = 5  # How much damage if wrong
    uncertainty: int = 5  # How little we know

    # Testing
    experiment: str = ""  # Planned/executed test
    success_metric: str = ""  # Pre-defined pass/fail boundary
    result: str = ""  # Actual outcome
    evidence_level: int = 0  # Strategyzer level 0-4

    # Metadata
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    source: str = ""  # Interview, brainstorm, etc.
    linked_opportunity: str = ""  # OST node reference

    @property
    def priority_score(self) -> int:
        """Higher = test first. Based on risk × uncertainty."""
        return self.risk * self.uncertainty

    def to_dict(self) -> dict:
        d = asdict(self)
        d["type"] = self.type.value
        d["status"] = self.status.value
        d["priority_score"] = self.priority_score
        return d


@dataclass
class AssumptionBoard:
    """Collection of assumptions with CRUD operations and analytics."""
    project_name: str
    assumptions: list[Assumption] = field(default_factory=list)

    def add(self, hypothesis: str, assumption_type: str, **kwargs) -> Assumption:
        """Add a new assumption to the board."""
        a_type = AssumptionType(assumption_type)
        a_id = f"A{len(self.assumptions) + 1:03d}"
        assumption = Assumption(
            id=a_id,
            hypothesis=hypothesis,
            type=a_type,
            **kwargs,
        )
        self.assumptions.append(assumption)
        return assumption

    def get(self, assumption_id: str) -> Optional[Assumption]:
        """Get assumption by ID."""
        for a in self.assumptions:
            if a.id == assumption_id:
                return a
        return None

    def update_status(
        self,
        assumption_id: str,
        status: str,
        result: str = "",
        evidence_level: int = 0,
    ) -> Optional[Assumption]:
        """Update assumption status and result."""
        a = self.get(assumption_id)
        if a:
            a.status = AssumptionStatus(status)
            a.updated_at = datetime.now().isoformat()
            if result:
                a.result = result
            if evidence_level:
                a.evidence_level = evidence_level
        return a

    def filter_by_status(self, status: str) -> list[Assumption]:
        return [a for a in self.assumptions if a.status.value == status]

    def filter_by_type(self, assumption_type: str) -> list[Assumption]:
        return [a for a in self.assumptions if a.type.value == assumption_type]

    @property
    def prioritized(self) -> list[Assumption]:
        """Assumptions sorted by priority (highest risk × uncertainty first)."""
        untested = [a for a in self.assumptions if a.status == AssumptionStatus.UNTESTED]
        return sorted(untested, key=lambda a: a.priority_score, reverse=True)

    @property
    def invalidation_rate(self) -> float:
        """% of tested assumptions that were invalidated. Benchmark: 30-60% = good."""
        tested = [a for a in self.assumptions
                  if a.status in (AssumptionStatus.VALIDATED, AssumptionStatus.INVALIDATED)]
        if not tested:
            return 0.0
        invalidated = [a for a in tested if a.status == AssumptionStatus.INVALIDATED]
        return len(invalidated) / len(tested)

    @property
    def stats(self) -> dict:
        """Board statistics."""
        counts = {}
        for s in AssumptionStatus:
            counts[s.value] = len(self.filter_by_status(s.value))
        type_counts = {}
        for t in AssumptionType:
            type_counts[t.value] = len(self.filter_by_type(t.value))
        return {
            "total": len(self.assumptions),
            "by_status": counts,
            "by_type": type_counts,
            "invalidation_rate": f"{self.invalidation_rate:.0%}",
            "avg_priority": (
                sum(a.priority_score for a in self.assumptions) / len(self.assumptions)
                if self.assumptions else 0
            ),
        }

    def summary_table(self) -> str:
        """Human-readable summary."""
        lines = [
            f"📋 Assumption Board: {self.project_name}",
            f"{'='*60}",
            f"{'ID':<6} {'Type':<14} {'Status':<12} {'R×U':<5} {'Hypothesis':<40}",
            f"{'-'*60}",
        ]
        for a in sorted(self.assumptions, key=lambda x: x.priority_score, reverse=True):
            status_icon = {
                "untested": "⬜", "testing": "🔄",
                "validated": "✅", "invalidated": "❌",
            }.get(a.status.value, "?")
            lines.append(
                f"{a.id:<6} {a.type.value:<14} {status_icon} {a.status.value:<10} "
                f"{a.priority_score:<5} {a.hypothesis[:38]}"
            )
        lines.append(f"\n📊 Invalidation rate: {self.invalidation_rate:.0%} "
                      f"(benchmark: 30-60%)")
        return "\n".join(lines)

    # --- Persistence ---

    def save(self, output_dir: str = "projects") -> Path:
        path = Path(output_dir) / self.project_name
        path.mkdir(parents=True, exist_ok=True)
        out_file = path / "assumptions.json"
        data = {
            "project_name": self.project_name,
            "stats": self.stats,
            "assumptions": [a.to_dict() for a in self.assumptions],
        }
        out_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return out_file

    @classmethod
    def load(cls, project_name: str, output_dir: str = "projects") -> "AssumptionBoard":
        path = Path(output_dir) / project_name / "assumptions.json"
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            board = cls(project_name=project_name)
            for a_data in data.get("assumptions", []):
                a_data.pop("priority_score", None)
                a_data["type"] = AssumptionType(a_data["type"])
                a_data["status"] = AssumptionStatus(a_data["status"])
                board.assumptions.append(Assumption(**a_data))
            return board
        return cls(project_name=project_name)

    # --- Heatmap data for visualization ---

    def heatmap_data(self) -> list[dict]:
        """Returns data for assumption risk × uncertainty scatter plot."""
        return [
            {
                "id": a.id,
                "hypothesis": a.hypothesis[:50],
                "type": a.type.value,
                "status": a.status.value,
                "risk": a.risk,
                "uncertainty": a.uncertainty,
                "priority": a.priority_score,
            }
            for a in self.assumptions
        ]
