"""
Business Analyst Agent — pydantic_ai.Agent z tools dla Discovery Phase.

Zastępuje ręczne wołanie instructor_wrapper.AgentClient w kontekście Discovery.
Tools są wołane AUTONOMICZNIE przez agenta — nie możemy pominąć żadnego kroku.

Import bezpośredni:
    from product_discovery.agents.business_analyst.agent import ba_agent
"""

import os
from pathlib import Path

from pydantic_ai import Agent, RunContext
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from .schemas import JTBDAnalysisResult


# ============================================================================
# SYSTEM PROMPT
# ============================================================================

_AGENT_DIR = Path(__file__).parent
_REPO_ROOT = _AGENT_DIR.parent.parent.parent.parent  # src/product_discovery/agents/business_analyst → repo root
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"

# Graceful fallback if AGENT.md doesn't exist yet
if _AGENT_MD_PATH.exists():
    _system_prompt = _AGENT_MD_PATH.read_text(encoding="utf-8")
else:
    _system_prompt = """You are an expert Business Analyst specializing in Jobs-to-be-Done (JTBD) methodology,
behavioral interviewing, and evidence-based product validation. Your role is to evaluate product ideas
and deliver GO/NO-GO verdicts based on evidence, not opinions."""

_KB_DIR = _AGENT_DIR / "knowledge_base"


# ============================================================================
# BA AGENT
# ============================================================================

_model = AnthropicModel(
    "claude-sonnet-4-6",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    ),
)

# Tańszy model do zadań strukturalnych (AssumptionMapNode)
# Haiku ~4× tańszy od Sonnet — wystarczy do mapowania założeń (brak kreatywności)
_haiku_model = AnthropicModel(
    "claude-haiku-4-5-20251001",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    ),
)

ba_agent = Agent(
    _model,
    output_type=JTBDAnalysisResult,
    system_prompt=_system_prompt,
    retries=3,
)

# Haiku agent — tylko inference (bez tools), do zadań strukturalnych
# Używany przez: AssumptionMapNode
ba_agent_haiku = Agent(
    _haiku_model,
    output_type=JTBDAnalysisResult,
    system_prompt=_system_prompt,
    retries=2,
)


# ============================================================================
# TOOLS
# ============================================================================

@ba_agent.tool_plain
def get_lessons() -> str:
    """
    Pobierz LESSONS.md — udokumentowane błędy i wzorce z poprzednich projektów.

    Zawiera: garden-design-app (pominięte Discovery → 6h straconej pracy),
    Meta VR FATAL Assumption ($50B), Amazon Alexa Paradox (adopcja ≠ monetyzacja),
    wzorce cargo cult discovery, reguły wymuszania Discovery.

    Używaj PRZED każdą analizą — szczególnie gdy werdykt GO lub przy mapowaniu założeń.
    """
    # Search in multiple locations
    for candidate in [
        _REPO_ROOT / "LESSONS.md",
        _REPO_ROOT / "knowledge_base" / "lessons_learned.md",
    ]:
        if candidate.exists():
            return candidate.read_text(encoding="utf-8")
    return "[Brak pliku LESSONS.md]"


@ba_agent.tool_plain
def get_forces_playbook() -> str:
    """
    Pobierz Forces Diagram playbook (Push/Pull/Anxiety/Habit — Bob Moesta).

    Zawiera: scoring 1-10, realne case studies (Revolut, Perplexity, Alexa Paradox),
    Switch Interview 5-fazowy timeline, red flags, pytania do każdej siły.

    Używaj w: ForcesDiagramNode, analizie czy użytkownik zmieni narzędzie.
    """
    path = _KB_DIR / "forces_diagram_playbook.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[Brak pliku forces_diagram_playbook.md]"


@ba_agent.tool_plain
def get_interview_patterns() -> str:
    """
    Pobierz bank pytań P1-P46 + Story-Based Interviewing (Teresa Torres).

    Zawiera: 46 pytań z wariantami, Story-Based P42-P46 (eliminuje cognitive biases),
    Quick Reference wg Forces Diagram, sygnały rozmówcy (genuine vs. polite_lie).

    Używaj w: BehavioralInterviewNode, ocenie jakości pytań wywiadowych.
    """
    path = _KB_DIR / "interview_question_bank.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[Brak pliku interview_question_bank.md]"


@ba_agent.tool_plain
def get_psychological_patterns() -> str:
    """
    Pobierz wzorce psychologiczne, archetypy rynkowe i language patterns.

    Zawiera: 4 archetypy użytkowników (Value Seeker, Treatonomics, AI Buyer, Creator),
    Opportunity≠Problem (Torres), MVP bez kodu (Zappos/Dropbox), Alexa Paradox,
    OST — szanse tylko z wywiadów, Racjonalizacja Post-Hoc, język prawdziwego bólu.

    Używaj w: SynthesisNode, AssumptionMapNode, analizie JTBD.
    """
    path = _KB_DIR / "psychological_patterns.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[Brak pliku psychological_patterns.md]"


@ba_agent.tool
async def validate_interview_question(ctx: RunContext[None], question: str) -> dict:
    """
    Sprawdź czy pytanie wywiadowe spełnia reguły Mom Test / Behavioral Interviewing.

    Reguły:
    - NIE sugeruje odpowiedzi (np. "Czy to dobry pomysł?")
    - PYTA o przeszłość, nie o hipotetyczną przyszłość
    - OTWARTE pytanie, nie tak/nie
    - Dobry starter: "Opowiedz mi o ostatnim razie gdy..."

    Zwraca: {"valid": bool, "score": int (0-10), "feedback": list[str]}
    """
    try:
        from product_discovery.tools.behavioral_interview import BehavioralInterviewer
        result = BehavioralInterviewer().validate_question(question)
        return {
            "valid": result.is_valid,
            "score": result.score,
            "feedback": result.feedback,
        }
    except ImportError:
        # Fallback: basic validation without full tool
        feedback = []
        score = 5
        if "?" not in question:
            feedback.append("Missing question mark — is this a question?")
            score -= 2
        if any(w in question.lower() for w in ["czy kupiłbyś", "would you buy", "czy to dobry"]):
            feedback.append("Suggestive question — asks about hypothetical, not past behavior")
            score -= 3
        return {"valid": score >= 5, "score": score, "feedback": feedback}


@ba_agent.tool
async def analyze_competitors(ctx: RunContext[None], product_category: str) -> str:
    """
    Deleguje do OSINT agenta — zwraca raport o 5-10 konkurentach (Markdown).

    OSINT agent używa Perplexity AI (jeśli PERPLEXITY_API_KEY jest ustawiony)
    lub DuckDuckGo (fallback darmowy).

    Zwraca: Markdown raport z sekcjami: Overview, Key Players, Feature Comparison,
    Pricing, SWOT, Key Takeaways.

    Koszt: ~$0.01-0.05 jeśli Perplexity, $0 jeśli DuckDuckGo fallback.
    """
    try:
        from product_discovery.agents.osint_researcher.agent import osint_researcher_agent
        result = await osint_researcher_agent.run(
            f"Competitive analysis for: {product_category}",
        )
        return result.output
    except Exception as e:
        return f"[OSINT agent unavailable: {e}] — run competitive analysis manually"
