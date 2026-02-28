"""
Impact/Effort Matrix — prioritize solutions on a 2×2 quadrant.

Quadrants:
- Quick Wins: High Impact, Low Effort  → Do First
- Big Bets:   High Impact, High Effort → Plan Carefully
- Fill-ins:   Low Impact, Low Effort   → Maybe Later
- Money Pits: Low Impact, High Effort  → Avoid
"""

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class Solution:
    """A potential solution linked to an opportunity."""
    id: str
    name: str
    description: str = ""
    impact: int = 5  # 1-10
    effort: int = 5  # 1-10
    linked_opportunity: str = ""
    linked_assumption: str = ""
    status: str = "proposed"  # proposed, selected, in_progress, shipped, dropped

    @property
    def quadrant(self) -> str:
        if self.impact >= 6 and self.effort <= 5:
            return "quick_win"
        elif self.impact >= 6 and self.effort > 5:
            return "big_bet"
        elif self.impact < 6 and self.effort <= 5:
            return "fill_in"
        else:
            return "money_pit"

    @property
    def quadrant_label(self) -> str:
        labels = {
            "quick_win": "🎯 Quick Win",
            "big_bet": "🎲 Big Bet",
            "fill_in": "📝 Fill-in",
            "money_pit": "🕳️ Money Pit",
        }
        return labels.get(self.quadrant, "?")

    def to_dict(self) -> dict:
        d = asdict(self)
        d["quadrant"] = self.quadrant
        d["quadrant_label"] = self.quadrant_label
        return d


@dataclass
class SolutionBoard:
    """Collection of solutions with matrix analysis."""
    project_name: str
    solutions: list[Solution] = field(default_factory=list)

    def add(self, name: str, impact: int = 5, effort: int = 5, **kwargs) -> Solution:
        s_id = f"S{len(self.solutions) + 1:03d}"
        solution = Solution(id=s_id, name=name, impact=impact, effort=effort, **kwargs)
        self.solutions.append(solution)
        return solution

    def get(self, solution_id: str) -> Optional[Solution]:
        for s in self.solutions:
            if s.id == solution_id:
                return s
        return None

    def by_quadrant(self) -> dict[str, list[Solution]]:
        result = {"quick_win": [], "big_bet": [], "fill_in": [], "money_pit": []}
        for s in self.solutions:
            result[s.quadrant].append(s)
        return result

    @property
    def quick_wins(self) -> list[Solution]:
        return [s for s in self.solutions if s.quadrant == "quick_win"]

    def summary_table(self) -> str:
        lines = [
            f"📊 Impact/Effort Matrix: {self.project_name}",
            f"{'='*60}",
            f"{'ID':<6} {'Quadrant':<16} {'I':<3} {'E':<3} {'Name':<35}",
            f"{'-'*60}",
        ]
        for s in sorted(self.solutions, key=lambda x: (-x.impact, x.effort)):
            lines.append(
                f"{s.id:<6} {s.quadrant_label:<16} {s.impact:<3} {s.effort:<3} {s.name[:33]}"
            )
        quadrants = self.by_quadrant()
        lines.append(f"\n🎯 Quick Wins: {len(quadrants['quick_win'])} | "
                      f"🎲 Big Bets: {len(quadrants['big_bet'])} | "
                      f"📝 Fill-ins: {len(quadrants['fill_in'])} | "
                      f"🕳️ Money Pits: {len(quadrants['money_pit'])}")
        return "\n".join(lines)

    def chart_data(self) -> list[dict]:
        """Data for Plotly scatter chart."""
        return [s.to_dict() for s in self.solutions]

    # --- Persistence ---

    def save(self, output_dir: str = "projects") -> Path:
        path = Path(output_dir) / self.project_name
        path.mkdir(parents=True, exist_ok=True)
        out_file = path / "solutions.json"
        data = {
            "project_name": self.project_name,
            "solutions": [s.to_dict() for s in self.solutions],
        }
        out_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return out_file

    @classmethod
    def load(cls, project_name: str, output_dir: str = "projects") -> "SolutionBoard":
        path = Path(output_dir) / project_name / "solutions.json"
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            board = cls(project_name=project_name)
            for s_data in data.get("solutions", []):
                s_data.pop("quadrant", None)
                s_data.pop("quadrant_label", None)
                board.solutions.append(Solution(**s_data))
            return board
        return cls(project_name=project_name)
