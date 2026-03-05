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
from typing import AsyncGenerator, Dict, Any, List, Optional

from product_discovery.agents.business_analyst.schemas import (
    SyntheticUserProfile,
    SyntheticUserProfileList,
    SyntheticUserResponse,
)

_AGENT_DIR = Path(__file__).parent
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"

# ============================================================================
# System Prompt
# ============================================================================

_SYSTEM_PROMPT = """
Jesteś ekspertem ds. psychologii użytkownika i badań UX z 15-letnim doświadczeniem
w tworzeniu wiarygodnych, szczegółowych archetypów użytkowników dla konkretnych segmentów rynku.

## Twoja rola

Generujesz JEDEN konkretny archetyp użytkownika na jedno wywołanie.
Archetyp musi być GŁĘBOKO osadzony w podanym segmencie — nie generyczny.

## Zasady tworzenia archetypu

1. **Kontekst segmentu jako punkt wyjścia**: Zacznij od rzeczywistych zachowań, problemów
   i otoczenia osób z tego konkretnego segmentu. NIE stosuj ogólnych ram konsumenckich.

2. **Psychologiczna głębia (Big Five OCEAN)**:
   - Openness: otwartość na nowe narzędzia vs. opór przed zmianą
   - Conscientiousness: systematyczność vs. chaotyczność
   - Extraversion: jak podejmuje decyzje (sam vs. przez grupę)
   - Agreeableness: podatność na social proof
   - Neuroticism: poziom lęku przy zmianie/zakupie

3. **Forces of Progress (Bob Moesta)**:
   - **Push**: Konkretny ból który popycha DO zmiany (społeczno-emocjonalny, nie tylko funkcjonalny)
   - **Pull**: Co przyciąga do nowego rozwiązania (konkretna nadzieja/obietnica)
   - **Anxiety**: Co blokuje zmianę (ryzyko, koszt zmiany, wstyd)
   - **Habit**: Dlaczego zostaje przy obecnym (inercja, sunk cost)

4. **Zróżnicowanie w kontekście segmentu**: Archetyp musi reprezentować JEDNĄ KONKRETNĄ perspektywę
   z rozległego spektrum w ramach segmentu — np. nowicjusz vs. ekspert, wczesny adopter vs. maruder,
   decydent vs. użytkownik końcowy, entuzjasta vs. sceptyk.

5. **Konkretność behawioralna**:
   - Jakie narzędzia TERAZ używa (konkretne nazwy produktów)
   - Jak wygląda jego typowy dzień pracy/życia w kontekście tego segmentu
   - Co go ostatnio sfrustrało (triggering event)

## Wymagania dla wygenerowanego profilu:
✅ archetype_name: unikalny, opisowy (np. "Sceptyczny Senior PM w korporacji")
✅ demographics: wiek, stanowisko, branża, kontekst organizacyjny
✅ psychology: profil OCEAN + dominująca motywacja + lęki
✅ jtbd_hypothesis: konkretne JTBD "Kiedy [sytuacja], chcę [motyw], żeby [outcome]"
✅ forces_hypothesis: Push/Pull/Anxiety/Habit w kontekście segmentu
✅ expected_interview_behaviors: min. 3 konkretne zachowania podczas wywiadu
✅ hypotheses_to_test: min. 3 hipotezy do weryfikacji przez interviewera
✅ red_flags_expected: min. 2 sygnały ostrzegawcze (bariery adopcji)

Gdy symulujesz wywiad: odpowiadaj W PIERWSZEJ OSOBIE. NIE bądź idealnym respondentem.
Ujawniaj sprzeczności i racjonalizacje jak prawdziwy człowiek.
"""

if _AGENT_MD_PATH.exists() and _AGENT_MD_PATH.stat().st_size > 100:
    _SYSTEM_PROMPT = _AGENT_MD_PATH.read_text(encoding="utf-8")


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
    model_settings={"temperature": 0.9},  # Wyższa temperatura = większa różnorodność
    output_retries=2,
)


# ============================================================================
# Synthetic Interview Simulator Agent
# ============================================================================

_SIMULATOR_PROMPT = """
Jesteś ekspertem w symulowaniu zachowań użytkownika podczas wywiadów badawczych.
Twoim zadaniem jest odpowiadanie na pytania interviewera JAKO konkretny syntetyczny użytkownik.

## Zasady symulacji
1. PIERWSZA OSOBA: zawsze odpowiadaj "ja", nie "ten użytkownik"
2. SPÓJNOŚĆ psychologiczna: pamiętaj o profilu archetypu przez cały wywiad
3. NIEDOSKONAŁOŚĆ: prawdziwi ludzie nie pamiętają wszystkich szczegółów, przeskakują wątki
4. SOCIAL DESIRABILITY BIAS: jeśli pytanie sugeruje odpowiedź → dawaj tę "oczekiwaną" odpowiedź
5. DETALE: używaj konkretnych, fikcyjnych ale wiarygodnych szczegółów (nazwy, daty, kwoty)
6. EMOCJE: pokazuj frustrację, entuzjazm, wahanie — nie bądź robotem
"""

synthetic_interview_agent = Agent(
    _model,
    output_type=SyntheticUserResponse,
    system_prompt=_SIMULATOR_PROMPT,
    model_settings={"temperature": 0.7},
)


# ============================================================================
# Helper: budowanie diversity hints dla N archetypów
# ============================================================================

_DIVERSITY_AXES = {
    "B2C": [
        "wczesny adopter, entuzjasta technologii, testuje wszystko co nowe",
        "pragmatyk, decyduje po porównaniu kilku opcji i przeczytaniu recenzji",
        "sceptyk, zmienia narzędzia tylko pod presją bólu lub polecenia znajomego",
        "laggard, preferuje status quo, zmiana to dla niego ryzyko i wysiłek",
        "impulsywny nabywca, decyduje emocjonalnie pod wpływem chwili lub promocji",
        "badacz-analityk, spędza 3x więcej czasu na research niż na używanie produktu",
        "społecznościowy, decyduje na podstawie tego co robią jego znajomi i community",
        "power user, eksploatuje zaawansowane funkcje których 95% użytkowników nie zna",
    ],
    "B2B": [
        "champion wewnętrzny, pracownik który inicjuje zakup i walczy o budżet",
        "sceptyczny decydent (C-level), musi zobaczyć ROI zanim podpisze",
        "użytkownik końcowy bez wpływu na zakup, frustruje go narzucone rozwiązanie",
        "IT/security gatekeeper, blokuje lub otwiera drogę do wdrożenia",
        "power user-champion, najcięższy użytkownik który staje się adwokatem produktu",
        "maruder w organizacji, opór wobec każdej zmiany procesowej",
        "pragmatyczny manager, chce rozwiązać konkretny problem, nie interesuje go technologia",
        "innowator w korporacji, forsuje nowe narzędzia wbrew inercji organizacyjnej",
    ],
    "SaaS": [
        "solo founder pre-PMF, wszystko robi sam, budżet bliski zeru",
        "PM w scaleupie, potrzebuje dowodów dla stakeholderów, nie tylko opinii",
        "CTO w startupie, decyduje technicznie i budżetowo jednocześnie",
        "operator procesów, nie-techniczny użytkownik który potrzebuje zero-config UX",
        "power user z poprzedniego rozwiązania, ma wysokie oczekiwania i churn-risk",
        "trial user, testuje 3 produkty równocześnie, konwertuje tylko jeśli szybko zobaczy wartość",
        "enterprise buyer, wymaga SLA, compliance, SSO i długich negocjacji",
        "freelancer-operator, używa produktu dla 5-10 klientów, cena per-seat to problem",
    ],
    "Enterprise": [
        "sponsor budżetowy (VP/Director), widzi koszt i ryzyko, nie używa produktu na co dzień",
        "project manager wdrożenia, odpowiada za timeline i onboarding 50+ osób",
        "end-user z przymusu, używa narzędzia bo musi, pasywny sabotażysta",
        "security/compliance officer, każda nowa integracja to dla niego zagrożenie",
        "wewnętrzny champion który wywalczył zakup, teraz musi udowodnić słuszność decyzji",
        "power user who switches, próbuje przenieść workflow ze starego enterprise tool",
        "training coordinator, odpowiada za adopcję w organizacji, frustruje go słaba dokumentacja",
        "IT admin, wdraża i utrzymuje, jego priorytet to stabilność i łatwość zarządzania",
    ],
    "Mixed": [
        "early adopter z segmentu B2C który zaczął używać narzędzia profesjonalnie",
        "SMB owner — jednocześnie decydent i użytkownik końcowy",
        "freelancer na granicy B2C/B2B, obsługuje klientów indywidualnych i firmy",
        "power user tworzący treści dla community, wpływa na decyzje innych",
        "pragmatyczny kupujący porównujący alternatywy przez 2-3 miesiące",
        "sceptyk który przyszedł od konkurencji po rozczarowaniu",
        "impulsywny nabywca który szybko konwertuje ale ma wysokie ryzyko churnu",
        "organizacyjny champion który adoptuje narzędzie dla swojego zespołu",
    ],
}


def _get_diversity_hints(count: int, market_type: str) -> List[str]:
    """Zwraca `count` różnorodnych osi dla danego rynku."""
    axes = _DIVERSITY_AXES.get(market_type, _DIVERSITY_AXES["Mixed"])
    # Rotate through axes, cycling if count > len(axes)
    return [axes[i % len(axes)] for i in range(count)]


# ============================================================================
# Public API
# ============================================================================

async def generate_archetypes(
    product_segment: str,
    count: int = 4,
    market_type: str = "Mixed",
    additional_context: str = "",
) -> List[SyntheticUserProfile]:
    """
    Dynamicznie generuje `count` archetypów użytkowników dla danego segmentu.

    Każdy archetyp jest generowany osobno (osobne wywołanie LLM) z unikalnym
    "diversity hint" zapewniającym różnorodność perspektyw.

    Args:
        product_segment: Opis segmentu np. "Freelancerzy UX w Polsce, 5-15 klientów/rok"
        count: Liczba archetypów do wygenerowania (1–8)
        market_type: "B2C" | "B2B" | "SaaS" | "Enterprise" | "Mixed"
        additional_context: Dodatkowy kontekst demograficzny lub pytania własne

    Returns:
        Lista `count` SyntheticUserProfile, każdy z unikalną perspektywą
    """
    count = max(1, min(8, count))  # clamp 1-8
    hints = _get_diversity_hints(count, market_type)

    base = f"Segment: {product_segment}"
    if additional_context:
        base += f"\n\nDodatkowy kontekst: {additional_context}"

    archetypes: List[SyntheticUserProfile] = []
    used_names: List[str] = []

    for i, hint in enumerate(hints, 1):
        existing = ", ".join(used_names) if used_names else "brak"
        prompt = f"""{base}

## Twoje zadanie
Wygeneruj archetyp #{i} z {count} dla tego segmentu.

## Perspektywa tego archetypu
{hint}

## Różnorodność
Już wygenerowane archetypy (NIE duplikuj ich perspektyw): {existing}
Twój archetyp MUSI reprezentować inną perspektywę niż powyższe.

Pamiętaj: archetyp musi być głęboko zakorzeniony w kontekście segmentu "{product_segment}",
nie w ogólnych ramach konsumenckich. Spraw, żeby ta osoba była wiarygodna i rozpoznawalna.
"""
        result = await synthetic_user_agent.run(prompt)
        archetypes.append(result.output)
        used_names.append(result.output.archetype_name)

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
        print("Użycie: python agent.py 'Opis segmentu' [liczba] [B2B|B2C|SaaS|Enterprise|Mixed]")
        sys.exit(1)

    segment = sys.argv[1]
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 4
    mtype = sys.argv[3] if len(sys.argv) > 3 else "Mixed"

    async def main():
        print(f"\n🎭 Generowanie {n} archetypów dla: {segment} [{mtype}]\n{'='*60}")
        archetypes = await generate_archetypes(segment, count=n, market_type=mtype)

        for i, arch in enumerate(archetypes, 1):
            print(f"\n## Archetyp {i}: {arch.archetype_name}")
            print(f"Dane: {arch.demographics}")
            print(f"Psychologia: {arch.psychology}")
            print(f"JTBD: {arch.jtbd_hypothesis}")
            print(f"\nHipotezy do sprawdzenia:")
            for h in arch.hypotheses_to_test:
                print(f"  • {h}")

    asyncio.run(main())


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
