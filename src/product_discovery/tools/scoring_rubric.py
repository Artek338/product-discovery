"""
Discovery Scoring Rubric — auto-score session quality (0-100).

Evaluates completeness and quality of a discovery session based on:
- Evidence level achieved
- Number of interviews / insights
- Assumption coverage
- Competitive depth
- Time efficiency
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class RubricScore:
    """Individual scoring dimension."""
    name: str
    score: float  # 0-100
    max_points: float
    weight: float  # 0-1
    feedback: str = ""


@dataclass
class DiscoveryScore:
    """Complete scoring rubric result."""
    project_name: str
    dimensions: list[RubricScore] = field(default_factory=list)

    @property
    def total_score(self) -> float:
        """Weighted average score 0-100."""
        if not self.dimensions:
            return 0
        weighted = sum(d.score * d.weight for d in self.dimensions)
        total_weight = sum(d.weight for d in self.dimensions)
        return round(weighted / total_weight, 1) if total_weight else 0

    @property
    def grade(self) -> str:
        s = self.total_score
        if s >= 90:
            return "A+"
        elif s >= 80:
            return "A"
        elif s >= 70:
            return "B"
        elif s >= 60:
            return "C"
        elif s >= 50:
            return "D"
        else:
            return "F"

    def summary(self) -> str:
        lines = [
            f"📊 Discovery Score: {self.project_name}",
            f"{'='*50}",
            f"Total: {self.total_score}/100 ({self.grade})",
            "",
        ]
        for d in sorted(self.dimensions, key=lambda x: x.score):
            bar = "█" * int(d.score / 10) + "░" * (10 - int(d.score / 10))
            lines.append(f"  {d.name:<25} {bar} {d.score:.0f}/{d.max_points:.0f}")
            if d.feedback:
                lines.append(f"    💡 {d.feedback}")
        return "\n".join(lines)


def score_discovery(project_name: str, data: dict) -> DiscoveryScore:
    """Auto-score a discovery session based on available data.

    Args:
        project_name: Project name
        data: Discovery data dict (from _load_project_data)
    """
    result = DiscoveryScore(project_name=project_name)

    # 1. Evidence Level (weight: 0.25)
    evidence_scores = {
        "0_Opinion": 10, "1_Preference": 30, "2_Past_Behavior": 60,
        "3_Commitment": 85, "4_Financial": 100,
    }
    evidence = data.get("evidence_level", "0_Opinion")
    ev_score = evidence_scores.get(evidence, 10)
    feedback = ""
    if ev_score < 60:
        feedback = "Zbierz dowody behawioralne (Level 2+) — pytaj o przeszłe zachowania"
    result.dimensions.append(RubricScore(
        name="Evidence Level", score=ev_score, max_points=100, weight=0.25, feedback=feedback,
    ))

    # 2. Interview Depth (weight: 0.20)
    interviews = data.get("interviews_count", 0)
    if interviews >= 12:
        int_score = 100
        feedback = ""
    elif interviews >= 8:
        int_score = 80
        feedback = "Dobre pokrycie, ale saturation może nie być osiągnięty"
    elif interviews >= 5:
        int_score = 60
        feedback = "Minimum dla direkcyjnej pewności — rozważ więcej wywiadów"
    elif interviews >= 3:
        int_score = 40
        feedback = "Za mało — minimum 5 dla usability, 8+ dla discovery"
    else:
        int_score = max(10, interviews * 15)
        feedback = "Brak wywiadów — krytyczny brak danych behawioralnych"
    result.dimensions.append(RubricScore(
        name="Interview Depth", score=int_score, max_points=100, weight=0.20, feedback=feedback,
    ))

    # 3. Assumption Coverage (weight: 0.20)
    assumptions_tested = data.get("assumptions_tested", 0)
    assumptions_data = data.get("assumptions_data", [])
    total_assumptions = len(assumptions_data)
    if total_assumptions > 0:
        coverage = assumptions_tested / total_assumptions * 100
        feedback = "" if coverage >= 60 else "Testuj więcej założeń — szczególnie high-risk"
    else:
        coverage = 0
        feedback = "Brak zidentyfikowanych założeń — użyj 'assumptions add'"
    result.dimensions.append(RubricScore(
        name="Assumption Coverage", score=min(100, coverage), max_points=100, weight=0.20, feedback=feedback,
    ))

    # 4. Competitive Depth (weight: 0.15)
    has_competitive = bool(data.get("has_discovery"))
    comp_score = 70 if has_competitive else 0
    feedback = "" if has_competitive else "Brak analizy konkurencji"
    result.dimensions.append(RubricScore(
        name="Competitive Depth", score=comp_score, max_points=100, weight=0.15, feedback=feedback,
    ))

    # 5. Confidence Level (weight: 0.10)
    confidence = int(data.get("confidence", 0) or 0)
    conf_score = min(100, confidence)
    feedback = ""
    if conf_score < 40:
        feedback = "Niska pewność — potrzeba więcej danych"
    elif conf_score > 90:
        feedback = "Bardzo wysoka pewność — sprawdź czy nie ma overconfidence bias"
    result.dimensions.append(RubricScore(
        name="Confidence", score=conf_score, max_points=100, weight=0.10, feedback=feedback,
    ))

    # 6. Industry Context (weight: 0.10)
    industry_pct = data.get("industry_completeness", 0)
    feedback = "" if industry_pct >= 50 else "Uzupełnij kontekst branżowy: 'industry enrich <slug>'"
    result.dimensions.append(RubricScore(
        name="Industry Context", score=min(100, industry_pct), max_points=100, weight=0.10, feedback=feedback,
    ))

    return result
