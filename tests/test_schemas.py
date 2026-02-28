"""Tests for Pydantic schemas — validates business logic without API calls."""

import pytest
from datetime import datetime


class TestJTBDAnalysisResult:
    """Test Jobs-to-be-Done analysis schema validation."""

    def test_valid_go_verdict(self):
        from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult

        result = JTBDAnalysisResult(
            functional_job="Manage 3+ client projects simultaneously",
            emotional_job="Feel in control and stress-free",
            social_job="Be seen as organized professional",
            competing_solutions=["Trello", "Notion"],
            verdict="GO",
            evidence_level="2_Past_Behavior",
            confidence=75,
        )
        assert result.verdict == "GO"
        assert result.confidence == 75

    def test_weak_evidence_blocks_go(self):
        from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult

        with pytest.raises(ValueError, match="Cannot have verdict=GO"):
            JTBDAnalysisResult(
                functional_job="Manage 3+ client projects simultaneously",
                emotional_job="Feel in control and stress-free",
                social_job="Be seen as organized professional",
                competing_solutions=["Trello"],
                verdict="GO",
                evidence_level="0_Opinion",  # Too weak for GO
                confidence=90,
            )

    def test_low_confidence_blocks_go(self):
        from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult

        with pytest.raises(ValueError, match="Cannot have verdict=GO"):
            JTBDAnalysisResult(
                functional_job="Manage 3+ client projects simultaneously",
                emotional_job="Feel in control and stress-free",
                social_job="Be seen as organized professional",
                competing_solutions=["Trello"],
                verdict="GO",
                evidence_level="3_Time_Commitment",
                confidence=30,  # Too low for GO
            )

    def test_needs_more_data_with_opinion(self):
        from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult

        result = JTBDAnalysisResult(
            functional_job="Track project deadlines for 5+ projects",
            emotional_job="Feel confident about not missing deadlines",
            social_job="Appear reliable to clients",
            competing_solutions=["Excel", "Google Calendar"],
            verdict="NEEDS_MORE_DATA",
            evidence_level="0_Opinion",
            confidence=40,
        )
        assert result.verdict == "NEEDS_MORE_DATA"


class TestForcesDiagram:
    """Test Forces Diagram validation."""

    def test_valid_high_switch(self):
        from product_discovery.agents.business_analyst.schemas import ForcesDiagram, ForceEntry

        diagram = ForcesDiagram(
            push=ForceEntry(score=8, evidence=["Users complain about current tool"]),
            pull=ForceEntry(score=9, evidence=["Demo showed clear value"]),
            anxiety=ForceEntry(score=3, evidence=["Minor concerns about learning curve"]),
            habit=ForceEntry(score=2, evidence=["Low switching cost"]),
        )
        assert diagram.switch_likelihood == "HIGH"

    def test_requires_mitigation_when_con_wins(self):
        from product_discovery.agents.business_analyst.schemas import ForcesDiagram, ForceEntry

        with pytest.raises(ValueError, match="mitigation_plan"):
            ForcesDiagram(
                push=ForceEntry(score=3, evidence=["Mild annoyance"]),
                pull=ForceEntry(score=4, evidence=["Some interest"]),
                anxiety=ForceEntry(score=8, evidence=["High concern about data loss"]),
                habit=ForceEntry(score=7, evidence=["Strong sunk cost"]),
            )


class TestBehavioralInterviewer:
    """Test interview question validator."""

    def test_good_question(self):
        from product_discovery.tools.behavioral_interview import BehavioralInterviewer

        bi = BehavioralInterviewer()
        result = bi.validate_question("Opowiedz mi o ostatnim razie gdy musiałeś zarządzać wieloma projektami jednocześnie?")
        assert result.is_valid
        assert result.score >= 5

    def test_suggestive_question_flagged(self):
        from product_discovery.tools.behavioral_interview import BehavioralInterviewer

        bi = BehavioralInterviewer()
        result = bi.validate_question("Czy to dobry pomysł na aplikację?")
        assert result.score < 7
