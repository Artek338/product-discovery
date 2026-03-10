"""
Before You Start Agent — pydantic_ai.Agent do interaktywnej sesji pytań.

Dwa agenty:
  bys_question_agent  — generuje następne pytanie na podstawie historii Q&A (Sonnet)
  bys_summary_agent   — generuje finalny kontekst po zakończeniu sesji (Sonnet)

Import:
    from product_discovery.agents.before_you_start.agent import (
        bys_question_agent, bys_summary_agent
    )
"""

import os
from pathlib import Path

from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from .schemas import BYSSummary, NextQuestion


# ============================================================================
# SYSTEM PROMPTS
# ============================================================================

_AGENT_DIR = Path(__file__).parent
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"

if _AGENT_MD_PATH.exists():
    _question_system_prompt = _AGENT_MD_PATH.read_text(encoding="utf-8")
else:
    _question_system_prompt = (
        "Jesteś ekspertem od facylitacji. Zadajesz jedno głębokie, otwarte pytanie "
        "na raz, które wynika z poprzednich odpowiedzi. Unikaj pytań tak/nie. "
        "Pytaj o fakty i konkretne sytuacje z przeszłości."
    )

_summary_system_prompt = """Jesteś ekspertem od syntezy informacji przed sesjami Product Discovery.

Na podstawie sesji pytań i odpowiedzi wygeneruj ustrukturyzowane podsumowanie kontekstu.

Zasady:
- Bądź KONKRETNY — unikaj ogólników
- Wyciągnij FAKTY z odpowiedzi, nie interpretacje
- W context_for_discovery napisz co BA Agent POWINIEN WIEDZIEĆ przed Discovery:
  segment docelowy, obecny proces użytkownika, zmierzone bóle, ograniczenia,
  kluczowi decydenci, co już wiadomo i czego szukamy w Discovery
- key_assumptions to ZAŁOŻENIA UŻYTKOWNIKA — rzeczy które uważa za prawdziwe bez dowodów
- open_questions to LUKI w wiedzy — czego NIE dowiedzieliśmy się podczas sesji
"""


# ============================================================================
# MODELE
# ============================================================================

_model = AnthropicModel(
    "claude-sonnet-4-6",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    ),
)


# ============================================================================
# AGENTY
# ============================================================================

bys_question_agent = Agent(
    _model,
    output_type=NextQuestion,
    system_prompt=_question_system_prompt,
    retries=3,
)

# Sonnet dla summary — output wstrzykiwany do Discovery, jakość ma znaczenie
bys_summary_agent = Agent(
    _model,
    output_type=BYSSummary,
    system_prompt=_summary_system_prompt,
    retries=2,
)
