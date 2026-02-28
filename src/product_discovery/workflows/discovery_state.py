"""
Discovery State — struktury danych przepływające przez Discovery Graph.

Lekcja z garden-design-app: brakuje strukturalnego wymuszenia kolejności kroków.
Te dataclassy definiują co MUSI być zebrane przed przejściem do następnego węzła.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult


@dataclass
class DiscoveryState:
    """
    Stan przepływający przez wszystkie węzły Discovery Graph.

    Każdy węzeł CZYTA i ZAPISUJE do tego obiektu.
    Brak wymaganych pól = bloker przed przejściem do następnego kroku.
    """

    project_name: str
    idea_description: str

    # Wypełniane przez BehavioralInterviewNode
    interview_insights: list[str] = field(default_factory=list)

    # Wypełniane przez CompetitiveResearchNode
    competitive_report: str = ""

    # Wypełniane przez EvidenceGradingNode
    evidence_level: str = "0_Opinion"

    # Metadane sesji
    start_time: datetime = field(default_factory=datetime.now)

    # Opcjonalnie: notatki z wywiadów (syntetycznych lub prawdziwych)
    interview_notes: str = ""

    # Opcjonalnie: co brakuje (ustawiane przez UserInputNeededNode)
    missing_data_reason: str = ""

    # Wewnętrzne: wynik JTBDAnalysisResult przekazywany z SynthesisNode do ScorecardNode
    jtbd_result: Optional[object] = field(default=None, repr=False)

    # v2.0: Forces Diagram (Push/Pull/Anxiety/Habit)
    forces_diagram: Optional[object] = field(default=None, repr=False)

    # v2.0: Syntetyczni użytkownicy (archetypy)
    synthetic_archetypes: list[str] = field(default_factory=list)

    # v2.0: Mapa założeń
    assumption_map: list[str] = field(default_factory=list)

    @property
    def has_minimum_interviews(self) -> bool:
        """Czy zebrano ≥3 insightów z wywiadów behawioralnych."""
        return len(self.interview_insights) >= 3

    @property
    def has_competitive_data(self) -> bool:
        """Czy przeprowadzono research konkurencji."""
        return bool(self.competitive_report.strip())

    @property
    def meets_evidence_threshold(self) -> bool:
        """Czy dowody spełniają minimum dla decyzji GO/NO-GO."""
        weak_levels = {"0_Opinion", "1_Preference"}
        return self.evidence_level not in weak_levels

    def elapsed_hours(self) -> float:
        """Czas trwania sesji w godzinach."""
        delta = datetime.now() - self.start_time
        return delta.total_seconds() / 3600


@dataclass
class DiscoveryValueScorecard:
    """Scorecard pokazujący wartość przeprowadzonej Discovery session."""

    hours_invested: float
    evidence_level_achieved: str
    confidence_before: int
    confidence_after: int
    roi_estimate: str

    @property
    def confidence_delta(self) -> int:
        return self.confidence_after - self.confidence_before

    @property
    def was_calibrating(self) -> bool:
        return self.confidence_delta < -20


@dataclass
class DiscoveryResult:
    """Finalny wynik Discovery session."""

    jtbd: JTBDAnalysisResult
    scorecard: DiscoveryValueScorecard
    project_name: str
    duration_hours: float
    competitive_report: str = ""
    forces_report: str = ""
    assumption_map: str = ""
    synthetic_archetypes: str = ""
    output_path: Optional[str] = None

    @property
    def verdict(self) -> str:
        return self.jtbd.verdict

    @property
    def is_go(self) -> bool:
        return self.jtbd.verdict == "GO"

    def summary(self) -> str:
        verdict_icon = {"GO": "✅", "NO-GO": "❌", "NEEDS_MORE_DATA": "⚠️"}.get(self.verdict, "?")
        lines = [
            f"\n{'='*60}",
            f"DISCOVERY RESULT: {self.project_name}",
            f"{'='*60}",
            f"Werdykt:    {verdict_icon}  {self.verdict}",
            f"Pewność:    {self.jtbd.confidence}%",
            f"Dowody:     {self.jtbd.evidence_level}",
            f"Czas:       {max(1, round(self.duration_hours * 60))}min",
            f"ROI:        {self.scorecard.roi_estimate}",
            f"{'='*60}",
        ]
        if self.jtbd.reasoning:
            lines.append(f"\nUzasadnienie:\n{self.jtbd.reasoning}")
        return "\n".join(lines)
