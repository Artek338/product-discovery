"""Tests for Phase 3 — Industry Context, Templates, Impact/Effort, Scoring, Slack."""

import tempfile
from pathlib import Path

import pytest


# ---- Industry Context ----

class TestIndustryContext:
    def test_init_and_get(self):
        from product_discovery.tools.industry_context import IndustryStore
        with tempfile.TemporaryDirectory() as tmpdir:
            store = IndustryStore(base_dir=tmpdir)
            ctx = store.init("fintech", display_name="FinTech")
            assert ctx.slug == "fintech"
            assert ctx.display_name == "FinTech"
            assert ctx.completeness == 0

    def test_list(self):
        from product_discovery.tools.industry_context import IndustryStore
        with tempfile.TemporaryDirectory() as tmpdir:
            store = IndustryStore(base_dir=tmpdir)
            store.init("fintech")
            store.init("edtech")
            assert sorted(store.list()) == ["edtech", "fintech"]

    def test_enrich_from_text(self):
        from product_discovery.tools.industry_context import IndustryStore
        with tempfile.TemporaryDirectory() as tmpdir:
            store = IndustryStore(base_dir=tmpdir)
            store.init("fintech")
            ctx = store.enrich_from_text(
                "fintech",
                "PSD2 Open Banking is a growing trend. KYC compliance required.",
                source="notes.md",
            )
            assert "PSD2" in ctx.terminology or "KYC" in ctx.terminology
            assert len(ctx.enrichment_log) == 1

    def test_enrich_from_discovery(self):
        from product_discovery.tools.industry_context import IndustryStore
        with tempfile.TemporaryDirectory() as tmpdir:
            store = IndustryStore(base_dir=tmpdir)
            store.init("saas")
            ctx = store.enrich_from_discovery("saas", {
                "competitive_report": "Competitors include Stripe and Adyen.",
                "functional_job": "Process Payments quickly",
            })
            assert ctx.sessions_count == 1
            player_names = [p.name for p in ctx.key_players]
            assert "Stripe" in player_names or "Adyen" in player_names

    def test_completeness(self):
        from product_discovery.tools.industry_context import IndustryContext
        ctx = IndustryContext(slug="test")
        assert ctx.completeness == 0
        ctx.market_overview = "Big market"
        ctx.trends = ["AI", "ML"]
        ctx.user_segments = ["SMB"]
        assert ctx.completeness > 0

    def test_agent_prompt(self):
        from product_discovery.tools.industry_context import IndustryContext
        ctx = IndustryContext(
            slug="fintech",
            display_name="FinTech",
            market_overview="Growing fast",
            trends=["Open Banking"],
        )
        prompt = ctx.to_agent_prompt()
        assert "FinTech" in prompt
        assert "Open Banking" in prompt

    def test_persistence(self):
        from product_discovery.tools.industry_context import IndustryStore
        with tempfile.TemporaryDirectory() as tmpdir:
            store = IndustryStore(base_dir=tmpdir)
            ctx = store.init("healthtech", "HealthTech")
            ctx.trends = ["Telehealth"]
            store.save(ctx)

            loaded = store.get("healthtech")
            assert loaded.display_name == "HealthTech"
            assert "Telehealth" in loaded.trends


# ---- Session Templates ----

class TestSessionTemplates:
    def test_list_templates(self):
        from product_discovery.templates.session_templates import list_templates
        templates = list_templates()
        assert len(templates) == 5

    def test_get_template(self):
        from product_discovery.templates.session_templates import get_template
        t = get_template("recruitment")
        assert t is not None
        assert t.time_boxed is True
        assert t.output_format == "pdf"

    def test_unknown_template(self):
        from product_discovery.templates.session_templates import get_template
        assert get_template("nonexistent") is None

    def test_new_product_has_all_steps(self):
        from product_discovery.templates.session_templates import get_template
        t = get_template("new_product")
        assert "jtbd_analysis" in t.required_steps
        assert "competitive_research" in t.required_steps
        assert t.industry_required is True


# ---- Impact/Effort ----

class TestImpactEffort:
    def test_add_solution(self):
        from product_discovery.tools.impact_effort import SolutionBoard
        board = SolutionBoard(project_name="test")
        s = board.add("Dark mode", impact=8, effort=3)
        assert s.id == "S001"
        assert s.quadrant == "quick_win"

    def test_quadrants(self):
        from product_discovery.tools.impact_effort import Solution
        assert Solution(id="1", name="a", impact=9, effort=2).quadrant == "quick_win"
        assert Solution(id="2", name="b", impact=9, effort=8).quadrant == "big_bet"
        assert Solution(id="3", name="c", impact=3, effort=2).quadrant == "fill_in"
        assert Solution(id="4", name="d", impact=3, effort=8).quadrant == "money_pit"

    def test_by_quadrant(self):
        from product_discovery.tools.impact_effort import SolutionBoard
        board = SolutionBoard(project_name="test")
        board.add("QW", impact=8, effort=3)
        board.add("BB", impact=8, effort=8)
        board.add("MP", impact=2, effort=9)
        q = board.by_quadrant()
        assert len(q["quick_win"]) == 1
        assert len(q["big_bet"]) == 1
        assert len(q["money_pit"]) == 1

    def test_persistence(self):
        from product_discovery.tools.impact_effort import SolutionBoard
        with tempfile.TemporaryDirectory() as tmpdir:
            board = SolutionBoard(project_name="test-ie")
            board.add("Feature X", impact=7, effort=4)
            board.save(tmpdir)

            loaded = SolutionBoard.load("test-ie", tmpdir)
            assert len(loaded.solutions) == 1
            assert loaded.solutions[0].quadrant == "quick_win"


# ---- Scoring Rubric ----

class TestScoringRubric:
    def test_score_empty(self):
        from product_discovery.tools.scoring_rubric import score_discovery
        result = score_discovery("empty", {})
        assert result.total_score < 30
        assert result.grade in ("D", "F")

    def test_score_good_session(self):
        from product_discovery.tools.scoring_rubric import score_discovery
        result = score_discovery("good", {
            "evidence_level": "3_Commitment",
            "interviews_count": 12,
            "assumptions_tested": 4,
            "assumptions_data": [{"status": "validated"}] * 4 + [{"status": "untested"}] * 2,
            "has_discovery": True,
            "confidence": 75,
            "industry_completeness": 60,
        })
        assert result.total_score > 60
        assert result.grade in ("A+", "A", "B")

    def test_scoring_dimensions(self):
        from product_discovery.tools.scoring_rubric import score_discovery
        result = score_discovery("test", {"evidence_level": "2_Past_Behavior"})
        assert len(result.dimensions) == 6
        names = [d.name for d in result.dimensions]
        assert "Evidence Level" in names
        assert "Interview Depth" in names


# ---- Slack (unit, no webhook) ----

class TestSlackUnit:
    def test_build_discovery_complete(self):
        from product_discovery.integrations.slack_notify import _build_discovery_complete
        payload = _build_discovery_complete("test-proj", {
            "verdict": "GO",
            "confidence": "85",
            "evidence_level": "3_Commitment",
        }, "")
        assert "blocks" in payload
        assert len(payload["blocks"]) >= 2

    def test_build_assumption_update(self):
        from product_discovery.integrations.slack_notify import _build_assumption_update
        payload = _build_assumption_update("test", {
            "assumptions_data": [
                {"status": "validated"},
                {"status": "invalidated"},
                {"status": "untested"},
            ],
        })
        assert "blocks" in payload
