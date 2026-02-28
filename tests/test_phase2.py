"""Tests for Phase 2 Sprint 1 modules — no API keys needed."""

import json
import tempfile
from pathlib import Path

import pytest


# ---- Interview Import ----

class TestInterviewImport:
    def test_classify_genuine(self):
        from product_discovery.tools.interview_import import classify_response_quality
        text = "Otworzyłem Excela i potem sprawdziłem dane w arkuszu"
        assert classify_response_quality(text) == "genuine"

    def test_classify_polite_lie(self):
        from product_discovery.tools.interview_import import classify_response_quality
        text = "To brzmi niesamowicie! Świetne rozwiązanie, na pewno bym kupił!"
        assert classify_response_quality(text) == "polite_lie"

    def test_classify_vague(self):
        from product_discovery.tools.interview_import import classify_response_quality
        text = "Mógłbym to chyba użyć, generalnie to pewnie by się przydało"
        assert classify_response_quality(text) == "vague"

    def test_extract_themes(self):
        from product_discovery.tools.interview_import import extract_themes_heuristic
        text = "Problem z kosztem i integracją API. Security jest kluczowe, czas tracimy."
        themes = extract_themes_heuristic(text)
        assert "integration" in themes
        assert "security" in themes
        assert "time_savings" in themes

    def test_corpus_saturation(self):
        from product_discovery.tools.interview_import import InterviewAnalysis, InterviewCorpus
        corpus = InterviewCorpus(project_name="test")

        # Interview 1: 3 themes
        a1 = InterviewAnalysis(file_path="f1.md", raw_themes=["pricing", "ux", "security"])
        corpus.add_analysis(a1)
        assert a1.saturation_score == 1.0  # all new

        # Interview 2: 1 new, 2 overlap
        a2 = InterviewAnalysis(file_path="f2.md", raw_themes=["pricing", "security", "onboarding"])
        corpus.add_analysis(a2)
        assert a2.saturation_score == pytest.approx(0.25)  # 1 new / 4 total

    def test_corpus_persistence(self):
        from product_discovery.tools.interview_import import InterviewCorpus, InterviewAnalysis
        with tempfile.TemporaryDirectory() as tmpdir:
            corpus = InterviewCorpus(project_name="test-persist")
            a = InterviewAnalysis(file_path="f1.md", raw_themes=["a", "b"])
            corpus.add_analysis(a)
            corpus.save(tmpdir)

            loaded = InterviewCorpus.load("test-persist", tmpdir)
            assert loaded.total_themes == 2
            assert len(loaded.analyses) == 1


# ---- Assumption Tracker ----

class TestAssumptionTracker:
    def test_add_and_get(self):
        from product_discovery.tools.assumption_tracker import AssumptionBoard
        board = AssumptionBoard(project_name="test")
        a = board.add("Users want dark mode", "desirability", risk=7, uncertainty=8)
        assert a.id == "A001"
        assert a.priority_score == 56

    def test_update_status(self):
        from product_discovery.tools.assumption_tracker import AssumptionBoard
        board = AssumptionBoard(project_name="test")
        board.add("Users pay $10/mo", "viability")
        result = board.update_status("A001", "invalidated", result="Only 2% willing")
        assert result.status.value == "invalidated"

    def test_invalidation_rate(self):
        from product_discovery.tools.assumption_tracker import AssumptionBoard
        board = AssumptionBoard(project_name="test")
        board.add("H1", "desirability")
        board.add("H2", "feasibility")
        board.add("H3", "viability")
        board.update_status("A001", "validated")
        board.update_status("A002", "invalidated")
        board.update_status("A003", "invalidated")
        assert board.invalidation_rate == pytest.approx(2/3)

    def test_prioritized(self):
        from product_discovery.tools.assumption_tracker import AssumptionBoard
        board = AssumptionBoard(project_name="test")
        board.add("Low risk", "usability", risk=2, uncertainty=2)
        board.add("High risk", "desirability", risk=9, uncertainty=9)
        top = board.prioritized
        assert top[0].hypothesis == "High risk"

    def test_persistence(self):
        from product_discovery.tools.assumption_tracker import AssumptionBoard
        with tempfile.TemporaryDirectory() as tmpdir:
            board = AssumptionBoard(project_name="test-persist")
            board.add("Test hypothesis", "feasibility")
            board.save(tmpdir)

            loaded = AssumptionBoard.load("test-persist", tmpdir)
            assert len(loaded.assumptions) == 1
            assert loaded.assumptions[0].hypothesis == "Test hypothesis"


# ---- Mermaid Diagrams ----

class TestMermaid:
    def test_ost_tree(self):
        from product_discovery.visualizations.mermaid import ost_tree
        result = ost_tree(
            outcome="Increase retention 15%",
            opportunities=[
                {"name": "Slow onboarding", "solutions": [
                    {"name": "Wizard", "experiments": ["A/B test"]}
                ]}
            ],
        )
        assert "```mermaid" in result
        assert "graph TD" in result
        assert "Increase retention" in result

    def test_forces_flowchart(self):
        from product_discovery.visualizations.mermaid import forces_flowchart
        result = forces_flowchart(
            push_items=["Pain A"],
            pull_items=["Benefit B"],
            anxiety_items=["Fear C"],
            habit_items=["Inertia D"],
        )
        assert "PUSH" in result
        assert "PULL" in result

    def test_buying_committee(self):
        from product_discovery.visualizations.mermaid import buying_committee_map
        result = buying_committee_map(
            champion="PM Jan",
            economic_buyer="CEO Maria",
            technical_buyer="CTO Adam",
            end_users=["Dev Anna"],
            blockers=["Legal Paweł"],
        )
        assert "Champion" in result
        assert "Blocker" in result


# ---- i18n ----

class TestI18n:
    def test_pl_strings(self):
        from product_discovery.i18n import t
        assert t("report.title", "pl") == "Raport Discovery"

    def test_en_strings(self):
        from product_discovery.i18n import t
        assert t("report.title", "en") == "Discovery Report"

    def test_fallback_key(self):
        from product_discovery.i18n import t
        assert t("nonexistent.key", "pl") == "nonexistent.key"

    def test_available_languages(self):
        from product_discovery.i18n import available_languages
        langs = available_languages()
        assert "pl" in langs
        assert "en" in langs
