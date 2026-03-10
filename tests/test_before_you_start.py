"""
Tests for Before You Start — schemas, session management, and context injection.

Wzorowane na test_schemas.py: weryfikacja logiki biznesowej bez wywołań API.
"""

import json
import tempfile
from pathlib import Path

import pytest


# ============================================================================
# SCHEMAS
# ============================================================================

class TestNextQuestion:
    """Test NextQuestion schema — walidacja reguł pytania."""

    def test_valid_open_question(self):
        from product_discovery.agents.before_you_start.schemas import NextQuestion

        q = NextQuestion(
            question="Opowiedz mi o ostatnim razie, gdy napotkałeś ten problem w pracy?",
            is_complete=False,
            completion_reason="",
        )
        assert q.is_complete is False
        assert len(q.question) >= 10

    def test_complete_requires_reason(self):
        from product_discovery.agents.before_you_start.schemas import NextQuestion

        with pytest.raises(ValueError, match="completion_reason required"):
            NextQuestion(
                question="Czy to wszystko co chciałeś powiedzieć?",
                is_complete=True,
                completion_reason="",
            )

    def test_complete_with_reason_is_valid(self):
        from product_discovery.agents.before_you_start.schemas import NextQuestion

        q = NextQuestion(
            question="Masz coś jeszcze do dodania na temat tego procesu?",
            is_complete=True,
            completion_reason="Zebrano wystarczający kontekst — znamy segment, ból i skalę problemu.",
        )
        assert q.is_complete is True
        assert q.completion_reason

    def test_question_too_short(self):
        from product_discovery.agents.before_you_start.schemas import NextQuestion

        with pytest.raises(ValueError):
            NextQuestion(
                question="Dlacze?",  # za krótkie (min 10)
                is_complete=False,
            )

    def test_not_complete_no_reason_needed(self):
        from product_discovery.agents.before_you_start.schemas import NextQuestion

        q = NextQuestion(
            question="Jakich narzędzi używasz teraz i co robisz gdy one zawodzą?",
            is_complete=False,
            completion_reason="",
        )
        assert q.is_complete is False
        assert q.completion_reason == ""


class TestBYSSummary:
    """Test BYSSummary schema — walidacja struktury podsumowania."""

    def _valid_summary_kwargs(self) -> dict:
        return dict(
            core_problem=(
                "Freelancerzy tracą klientów przez brak systematycznego follow-up "
                "po zakończeniu projektów. Problem dotyczy głównie agencji 1-5 osobowych."
            ),
            key_assumptions=["Klienci odchodzą przez brak komunikacji", "CRM są za drogie dla freelancerów"],
            open_questions=["Jaki jest obecny proces follow-up użytkownika?"],
            context_for_discovery=(
                "Użytkownik prowadzi 5-osobową agencję UX. Główny problem: klienci nie wracają "
                "po pierwszym projekcie. Obecny workaround: ręczne notatki w Notion. "
                "Budżet: brak — szuka taniego rozwiązania. " * 3
            ),
        )

    def test_valid_summary(self):
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        s = BYSSummary(**self._valid_summary_kwargs())
        assert len(s.key_assumptions) >= 2
        assert len(s.open_questions) >= 1

    def test_too_few_assumptions(self):
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        kwargs = self._valid_summary_kwargs()
        kwargs["key_assumptions"] = ["Tylko jedno założenie"]  # min_length=2

        with pytest.raises(ValueError):
            BYSSummary(**kwargs)

    def test_too_many_assumptions(self):
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        kwargs = self._valid_summary_kwargs()
        kwargs["key_assumptions"] = [f"Założenie {i}" for i in range(10)]  # max_length=8

        with pytest.raises(ValueError):
            BYSSummary(**kwargs)

    def test_core_problem_too_short(self):
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        kwargs = self._valid_summary_kwargs()
        kwargs["core_problem"] = "Za krótki opis"  # min_length=20

        with pytest.raises(ValueError):
            BYSSummary(**kwargs)

    def test_context_too_short(self):
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        kwargs = self._valid_summary_kwargs()
        kwargs["context_for_discovery"] = "Krótki kontekst"  # min_length=100

        with pytest.raises(ValueError):
            BYSSummary(**kwargs)


# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

class TestBYSSession:
    """Test BYSSession dataclass i zarządzanie cyklem życia."""

    def test_new_session_defaults(self):
        from product_discovery.agents.before_you_start.session import BYSSession

        session = BYSSession.new(project="test-proj", topic="My topic", lang="pl")
        assert session.project == "test-proj"
        assert session.topic == "My topic"
        assert session.lang == "pl"
        assert session.status == "in_progress"
        assert session.session_id.startswith("bys_")
        assert session.qa_pairs == []
        assert session.summary is None

    def test_add_qa_pairs(self):
        from product_discovery.agents.before_you_start.session import BYSSession

        session = BYSSession.new(project="test-proj", topic="My topic")
        session.add_qa("Pytanie 1?", "Odpowiedź 1")
        session.add_qa("Pytanie 2?", "Odpowiedź 2")
        session.add_qa("Pytanie 3?", "Odpowiedź 3")

        assert len(session.qa_pairs) == 3
        assert session.qa_pairs[0].order == 1
        assert session.qa_pairs[1].order == 2
        assert session.qa_pairs[2].order == 3
        assert session.qa_pairs[0].question == "Pytanie 1?"
        assert session.qa_pairs[0].answer == "Odpowiedź 1"

    def test_to_dict_and_from_dict(self):
        from product_discovery.agents.before_you_start.session import BYSSession
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        session = BYSSession.new(project="test-proj", topic="Test topic", lang="en")
        session.add_qa("Question 1?", "Answer 1")
        session.summary = BYSSummary(
            core_problem="Main problem described in enough detail here for the test.",
            key_assumptions=["Assumption one here", "Assumption two here"],
            open_questions=["Open question to investigate"],
            context_for_discovery="Rich context for the discovery session " * 4,
        )
        session.status = "completed"

        data = session.to_dict()
        assert data["project"] == "test-proj"
        assert data["status"] == "completed"
        assert len(data["qa_pairs"]) == 1
        assert data["summary"] is not None

        restored = BYSSession.from_dict(data)
        assert restored.project == "test-proj"
        assert restored.lang == "en"
        assert restored.status == "completed"
        assert len(restored.qa_pairs) == 1
        assert restored.summary is not None
        assert restored.summary.core_problem == session.summary.core_problem


class TestSessionPersistence:
    """Test zapisu i odczytu sesji z pliku."""

    def _make_completed_session(self, project: str = "test-proj") -> "BYSSession":
        from product_discovery.agents.before_you_start.session import BYSSession
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        session = BYSSession.new(project=project, topic="Test topic")
        session.add_qa("Pytanie 1?", "Odpowiedź 1")
        session.add_qa("Pytanie 2?", "Odpowiedź 2")
        session.summary = BYSSummary(
            core_problem="Główny problem testowy — konkretny opis sytuacji użytkownika.",
            key_assumptions=["Założenie pierwsze", "Założenie drugie"],
            open_questions=["Co zbadać w Discovery?"],
            context_for_discovery="Szczegółowy kontekst dla Business Analyst agenta " * 4,
        )
        session.status = "completed"
        return session

    def test_save_creates_file(self):
        from product_discovery.agents.before_you_start.session import save_session

        session = self._make_completed_session()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = save_session(session, output_dir=tmpdir)
            assert path.exists()
            assert path.suffix == ".json"
            assert path.name.startswith("bys_")

    def test_save_file_is_valid_json(self):
        from product_discovery.agents.before_you_start.session import save_session

        session = self._make_completed_session()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = save_session(session, output_dir=tmpdir)
            data = json.loads(path.read_text(encoding="utf-8"))
            assert data["project"] == "test-proj"
            assert data["status"] == "completed"
            assert "qa_pairs" in data
            assert "summary" in data

    def test_load_latest_returns_completed(self):
        from product_discovery.agents.before_you_start.session import save_session, load_latest_session

        session = self._make_completed_session()
        with tempfile.TemporaryDirectory() as tmpdir:
            save_session(session, output_dir=tmpdir)
            loaded = load_latest_session("test-proj", output_dir=tmpdir)
            assert loaded is not None
            assert loaded.project == "test-proj"
            assert loaded.status == "completed"

    def test_load_latest_returns_none_when_no_project(self):
        from product_discovery.agents.before_you_start.session import load_latest_session

        with tempfile.TemporaryDirectory() as tmpdir:
            result = load_latest_session("nonexistent-project", output_dir=tmpdir)
            assert result is None

    def test_load_latest_skips_session_without_summary(self):
        from product_discovery.agents.before_you_start.session import (
            BYSSession, save_session, load_latest_session
        )

        session = BYSSession.new(project="test-proj", topic="No summary")
        session.add_qa("Q?", "A")
        session.status = "interrupted"
        # summary jest None — nie powinien być zwrócony

        with tempfile.TemporaryDirectory() as tmpdir:
            save_session(session, output_dir=tmpdir)
            result = load_latest_session("test-proj", output_dir=tmpdir)
            assert result is None

    def test_load_latest_returns_newest_among_multiple(self):
        import time
        from product_discovery.agents.before_you_start.session import (
            BYSSession, save_session, load_latest_session
        )
        from product_discovery.agents.before_you_start.schemas import BYSSummary

        def make_session(topic: str) -> BYSSession:
            s = BYSSession.new(project="multi-proj", topic=topic)
            s.add_qa("Q?", "A")
            s.summary = BYSSummary(
                core_problem="Problem " + topic + " — testowy opis sytuacji użytkownika.",
                key_assumptions=["Założenie A", "Założenie B"],
                open_questions=["Otwarte pytanie"],
                context_for_discovery="Kontekst dla " + topic + " " * 10 + "dodatkowy tekst szczegolowy " * 6,
            )
            s.status = "completed"
            return s

        with tempfile.TemporaryDirectory() as tmpdir:
            s1 = make_session("Pierwsza sesja")
            save_session(s1, output_dir=tmpdir)

            time.sleep(1.1)  # timestamp w nazwie pliku z rozdzielczością 1s

            s2 = make_session("Druga sesja")
            save_session(s2, output_dir=tmpdir)

            loaded = load_latest_session("multi-proj", output_dir=tmpdir)
            assert loaded is not None
            assert "Druga sesja" in loaded.topic

    def test_get_context_for_discovery(self):
        from product_discovery.agents.before_you_start.session import (
            save_session, get_context_for_discovery
        )

        session = self._make_completed_session()
        with tempfile.TemporaryDirectory() as tmpdir:
            save_session(session, output_dir=tmpdir)
            ctx = get_context_for_discovery("test-proj", output_dir=tmpdir)
            assert ctx  # non-empty
            assert ctx == session.summary.context_for_discovery

    def test_get_context_returns_empty_when_no_session(self):
        from product_discovery.agents.before_you_start.session import get_context_for_discovery

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = get_context_for_discovery("no-such-project", output_dir=tmpdir)
            assert ctx == ""


# ============================================================================
# IMPORT CHECK
# ============================================================================

class TestImports:
    """Weryfikacja że wszystkie moduły BYS importują bez błędów."""

    def test_schemas_import(self):
        from product_discovery.agents.before_you_start.schemas import NextQuestion, BYSSummary
        assert NextQuestion
        assert BYSSummary

    def test_agent_import(self):
        """Import agenta wymaga ANTHROPIC_API_KEY — skip jeśli brak klucza."""
        import os
        import pytest

        if not os.getenv("ANTHROPIC_API_KEY"):
            pytest.skip("ANTHROPIC_API_KEY not set — agent init requires valid key")
        from product_discovery.agents.before_you_start.agent import (
            bys_question_agent, bys_summary_agent
        )
        assert bys_question_agent
        assert bys_summary_agent

    def test_session_import(self):
        from product_discovery.agents.before_you_start.session import (
            BYSSession, BYSQAPair, save_session, load_latest_session, get_context_for_discovery
        )
        assert BYSSession
        assert BYSQAPair
