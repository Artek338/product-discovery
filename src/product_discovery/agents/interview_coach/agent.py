"""
Interview Coach Agent — analizuje sesje wywiadów i generuje ulepszenia pytań.

Zamknięcie pętli:  synthetic → real → improved synthetic → lepsza sesja

Import:
    from product_discovery.agents.interview_coach.agent import interview_coach_agent, analyze_interview_session
"""

import os
from pathlib import Path

from pydantic_ai import Agent, RunContext
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from product_discovery.agents.business_analyst.schemas import InterviewImprovementReport

_AGENT_DIR = Path(__file__).parent
_REPO_ROOT = _AGENT_DIR.parent.parent.parent.parent
_KB_DIR = _REPO_ROOT / "src" / "product_discovery" / "agents" / "business_analyst" / "knowledge_base"
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"

# Fallback: also check top-level knowledge_base
if not _KB_DIR.exists():
    _KB_DIR = _REPO_ROOT / "knowledge_base"

# ============================================================================
# System Prompt — loaded from AGENT.md
# ============================================================================

if _AGENT_MD_PATH.exists():
    _SYSTEM_PROMPT = _AGENT_MD_PATH.read_text(encoding="utf-8")
else:
    _SYSTEM_PROMPT = """
Jesteś ekspertem-trenerem wywiadów badawczych z 15-letnim doświadczeniem w UX research,
JTBD Switch Interviews i technikach elicytacji (Mom Test, FBI BAI, Cognitive Interview).

Twoja rola: analizować sesje wywiadów (syntetyczne lub prawdziwe) i generować KONKRETNE
ulepszenia, które zwiększą jakość następnej sesji.

## Response Quality Taxonomy
- **detailed** (💎): Odpowiedź bogata w fakty, liczby, konkretne zdarzenia — najlepsza
- **genuine** (✅): Szczera odpowiedź, może być krótka — dobra
- **vague** (⚠️): Ogólna, bez konkretów — pytanie za szeroko postawione
- **polite_lie** (🚩): Social desirability bias — pytanie sugerowało odpowiedź

## Anatomia dobrego pytania (Mom Test + Cognitive Interview)
Pytanie DZIAŁA gdy pyta o PRZESZŁOŚĆ, NIE sugeruje odpowiedzi, jest OTWARTE.

## Matress Paradox (Forces Diagram — Bob Moesta)
Push jest SPOŁECZNO-EMOCJONALNY, nie tylko funkcjonalny.

## Format outputu
Analiza musi być KONKRETNA, PSYCHOLOGICZNIE UZASADNIONA, ACTIONABLE, UCZCIWA.
"""

# ============================================================================
# Model & Agent
# ============================================================================

_model = AnthropicModel(
    "claude-sonnet-4-6",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    )
)

interview_coach_agent = Agent(
    _model,
    output_type=InterviewImprovementReport,
    system_prompt=_SYSTEM_PROMPT,
    model_settings={"temperature": 0.3},
    output_retries=2,
)


# ============================================================================
# Tools
# ============================================================================

@interview_coach_agent.tool_plain
def get_question_bank() -> str:
    """Pobierz aktualny bank pytań (interview_question_bank.md) do analizy."""
    path = _KB_DIR / "interview_question_bank.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[Brak pliku interview_question_bank.md]"


@interview_coach_agent.tool_plain
def get_psychological_patterns() -> str:
    """Pobierz wzorce psychologiczne i archetypy (psychological_patterns.md)."""
    path = _KB_DIR / "psychological_patterns.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[Brak pliku psychological_patterns.md]"


@interview_coach_agent.tool_plain
def get_forces_playbook() -> str:
    """Pobierz Forces Diagram playbook (Push/Pull/Anxiety/Habit)."""
    path = _KB_DIR / "forces_diagram_playbook.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "[Brak pliku forces_diagram_playbook.md]"


# ============================================================================
# Helper
# ============================================================================

async def analyze_interview_session(
    session_content: str,
    session_type: str = "synthetic_only",
    synthetic_content: str = "",
    project_context: str = "",
) -> InterviewImprovementReport:
    """
    Analizuje sesję wywiadów i generuje raport ulepszeń.

    Args:
        session_content: Transkrypt lub zawartość sesji do analizy
        session_type: "synthetic_only" | "real_only" | "real_with_synthetic_baseline"
        synthetic_content: Zawartość synthetic session (gdy baseline)
        project_context: Opcjonalny kontekst projektu

    Returns:
        InterviewImprovementReport z pełną analizą i rekomendacjami
    """
    prompt_parts = []
    if project_context:
        prompt_parts.append(f"## Kontekst projektu\n{project_context}\n")
    prompt_parts.append(f"## Typ sesji\n{session_type}\n")
    prompt_parts.append(f"## Sesja do analizy\n\n{session_content}")
    if synthetic_content and session_type == "real_with_synthetic_baseline":
        prompt_parts.append(f"\n## Synthetic predictions (baseline)\n\n{synthetic_content}")
    prompt_parts.append("""
## Twoje zadanie
1. Użyj get_question_bank() aby zobaczyć numery pytań
2. Użyj get_psychological_patterns() dla kontekstu archetypów
3. Przeanalizuj każde pytanie — jakość odpowiedzi, dlaczego działało/nie
4. Wygeneruj InterviewImprovementReport z konkretnymi rekomendacjami
""")
    result = await interview_coach_agent.run("\n".join(prompt_parts))
    return result.output
