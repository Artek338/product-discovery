"""
Synthetic User Agent — generuje psychologiczne archetypy użytkowników i symuluje wywiady.

Cel: PRZED wywiadami z prawdziwymi ludźmi — przetestuj swoje pytania na syntetycznych
użytkownikach, aby odkryć luki i nieoczekiwane punkty bólu.

Import:
    from product_discovery.agents.synthetic_user.agent import synthetic_user_agent, generate_archetypes
"""

import os
from pathlib import Path

from pydantic_ai import Agent, RunContext
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider
from typing import List

from product_discovery.agents.business_analyst.schemas import (
    SyntheticUserProfile,
    SyntheticUserProfileList,
    SyntheticUserResponse,
)

_AGENT_DIR = Path(__file__).parent
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"

# ============================================================================
# System Prompt — loaded from AGENT.md
# ============================================================================

if _AGENT_MD_PATH.exists() and _AGENT_MD_PATH.stat().st_size > 10:
    _SYSTEM_PROMPT = _AGENT_MD_PATH.read_text(encoding="utf-8")
else:
    _SYSTEM_PROMPT = """
Jesteś ekspertem ds. psychologii użytkownika i badań UX z 15-letnim doświadczeniem
w tworzeniu wiarygodnych, szczegółowych archetypów użytkowników.

Twoja specjalność: tworzenie psychologicznie GŁĘBOKICH, nietrywialnych person —
nie "35-letni manager który lubi kawę", ale osoby z prawdziwymi sprzecznościami,
lękami, racjonalizacjami i motivacjami.

## Cztery Archetypy Rynkowe (Ramy 2024)

Każdy produkt cyfrowy trafia do co najmniej trzech z czterech poniższych archetypów.
Zawsze generuj WSZYSTKIE CZTERY — każdy z innym bólem, motywacją i barierą zmiany.

### Archetype 1: VALUE SEEKER — Poszukiwacz Wartości
- **Kim jest:** ~47% rynku (w tym zamożni). Kieruje się kosztem i dowodem wartości.
- **Trigger do zmiany:** Utrata zaufania że obecne narzędzie jest "warte ceny"
- **Push:** "Płacę za to co nie działa tak jak obiecano"
- **Pull:** Konkretny, liczbowy dowód ROI przed zakupem
- **Anxiety:** "Czy to nie będzie to samo pod inną nazwą?"
- **Habit:** Sunk cost ("już zapłaciłem za rok z góry")

### Archetype 2: TREATONOMICS CONSUMER — Konsument Małych Przyjemności
- **Kim jest:** Odrzuca wielkie cele, szuka małych nagród "tu i teraz"
- **Trigger do zmiany:** Poczucie chaosu + obietnica natychmiastowej ulgi
- **Push:** Zmęczenie długoterminową niepewnością, przebodźcowanie
- **Pull:** Natychmiastowy "aha moment" w pierwszych 5 minutach użytkowania

### Archetype 3: AI-ASSISTED POWER BUYER — Delegujący na AI
- **Kim jest:** ~24M wczesnych innowatorów. Używa chatbotów zamiast Google do researchu.
- **Trigger do zmiany:** Znalezienie produktu przez AI agent który dał "logistics certainty"
- **Push:** Research fatigue — przebodźcowanie opcjami

### Archetype 4: DIGITAL-NATIVE CREATOR — Twórca Cyfrowy
- **Kim jest:** Wychowany w świecie cyfrowym, szuka "kreatywnego maksymalizmu"
- **Trigger do zmiany:** FOMO — "moi rówieśnicy już to mają"

## Fundamenty Psychologiczne (Big Five OCEAN)
Dla każdego archetypu mapuj profil O/C/E/A/N.

## Forces Diagram (Bob Moesta) — WYMÓG dla każdego archetypu
Push MUSI uwzględniać wymiar SPOŁECZNO-EMOCJONALNY, nie tylko funkcjonalny.

## OUTPUT
Zwróć listę 4 SyntheticUserProfile z pełnymi danymi psychologicznymi.
Gdy symulujesz wywiad: odpowiadaj W PIERWSZEJ OSOBIE. NIE bądź idealnym respondentem.
"""


# ============================================================================
# Model
# ============================================================================

_model = AnthropicModel(
    "claude-sonnet-4-6",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    )
)


# ============================================================================
# Synthetic User Generator Agent
# ============================================================================

synthetic_user_agent = Agent(
    _model,
    output_type=SyntheticUserProfile,
    system_prompt=_SYSTEM_PROMPT,
    model_settings={"temperature": 0.8},
    output_retries=2,
)

@synthetic_user_agent.system_prompt
def add_generation_instructions() -> str:
    return """
Twoim zadaniem jest wygenerowanie JEDNEGO archetypu rynkowego dla podanego segmentu.
Prompt wskaże który z czterech archetypów masz wygenerować.

WYMAGANIA dla generowanego archetypu:
✅ Konkretne narzędzia z których korzysta DZIŚ
✅ Konkretny triggering event społeczno-emocjonalny
✅ Minimum 2 zachowania w wywiadzie (expected_interview_behaviors)
✅ Minimum 2 hipotezy do sprawdzenia (hypotheses_to_test)
✅ Minimum 1 red flag (red_flags_expected)
"""


# ============================================================================
# Synthetic Interview Simulator Agent
# ============================================================================

_SIMULATOR_PROMPT = """
Jesteś ekspertem w symulowaniu zachowań użytkownika podczas wywiadów badawczych.
Twoim zadaniem jest odpowiadanie na pytania interviewera JAKO konkretny syntetyczny użytkownik.

## Zasady symulacji
1. PIERWSZA OSOBA: zawsze odpowiadaj "ja", nie "ten użytkownik"
2. SPÓJNOŚĆ psychologiczna: pamiętaj o profilu archetypu
3. NIEDOSKONAŁOŚĆ: prawdziwi ludzie nie pamiętają wszystkich szczegółów
4. SOCIAL DESIRABILITY BIAS: jeśli pytanie sugeruje odpowiedź → dawaj tę odpowiedź
5. DETALE: używaj konkretnych, fikcyjnych ale wiarygodnych szczegółów
"""

synthetic_interview_agent = Agent(
    _model,
    output_type=SyntheticUserResponse,
    system_prompt=_SIMULATOR_PROMPT,
    model_settings={"temperature": 0.7},
)


# ============================================================================
# Helper Functions
# ============================================================================

_ARCHETYPE_SPECS = [
    ("Value Seeker", "decyduje na podstawie ROI i liczbowego dowodu wartości. ~47% rynku."),
    ("Treatonomics Consumer", "szuka natychmiastowej ulgi i małych nagród 'tu i teraz'."),
    ("AI-Assisted Power Buyer", "~24M innowatorów, używa AI zamiast Google do researchu."),
    ("Digital-Native Creator", "wychowany cyfrowo, kupuje przez FOMO."),
]


async def generate_archetypes(
    product_segment: str,
    additional_context: str = ""
) -> List[SyntheticUserProfile]:
    """
    Generuje 4 rynkowe archetypy dla danego segmentu (4 osobne wywołania API).

    Args:
        product_segment: Opis segmentu np. "Freelancerzy UX w Polsce, 5-15 klientów/rok"
        additional_context: Dodatkowy kontekst

    Returns:
        Lista 4 SyntheticUserProfile
    """
    base = f"Segment: {product_segment}"
    if additional_context:
        base += f"\n\nDodatkowy kontekst: {additional_context}"

    archetypes = []
    for name, description in _ARCHETYPE_SPECS:
        prompt = f"{base}\n\nWygeneruj archetyp: {name}\nCharakterystyka: {description}"
        result = await synthetic_user_agent.run(prompt)
        archetypes.append(result.output)

    return archetypes


async def simulate_interview_response(
    archetype: SyntheticUserProfile,
    question: str,
    interview_history: str = ""
) -> SyntheticUserResponse:
    """
    Symuluje odpowiedź syntetycznego użytkownika na pytanie.

    Args:
        archetype: Profil syntetycznego użytkownika
        question: Pytanie interviewera
        interview_history: Poprzednie pytania i odpowiedzi (kontekst)

    Returns:
        SyntheticUserResponse z odpowiedzią + metadanymi
    """
    prompt = f"""
Profil użytkownika:
===================
Archetyp: {archetype.archetype_name}
Dane: {archetype.demographics}
Psychologia: {archetype.psychology}
JTBD hipoteza: {archetype.jtbd_hypothesis}
Forces hipoteza: {archetype.forces_hypothesis}

{f"Historia wywiadu:{chr(10)}{interview_history}{chr(10)}" if interview_history else ""}

Pytanie interviewera:
{question}
"""
    result = await synthetic_interview_agent.run(prompt)
    return result.output


if __name__ == "__main__":
    """CLI — generuj archetypy dla podanego segmentu."""
    import asyncio
    import sys

    if len(sys.argv) < 2:
        print("Użycie: python agent.py 'Opis segmentu'")
        sys.exit(1)

    segment = sys.argv[1]

    async def main():
        print(f"\n🎭 Generowanie archetypów dla: {segment}\n{'='*60}")
        archetypes = await generate_archetypes(segment)

        for i, arch in enumerate(archetypes, 1):
            print(f"\n## Archetyp {i}: {arch.archetype_name}")
            print(f"Dane: {arch.demographics}")
            print(f"Psychologia: {arch.psychology}")
            print(f"JTBD: {arch.jtbd_hypothesis}")
            print(f"\nHipotezy do sprawdzenia:")
            for h in arch.hypotheses_to_test:
                print(f"  • {h}")

    asyncio.run(main())
