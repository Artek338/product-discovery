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

# Tańszy model do symulacji wywiadów — roleplay nie wymaga głębokiego rozumowania.
# ~10× tańszy od Sonnet, jakość odpowiedzi syntetycznych porównywalna.
_haiku_model = AnthropicModel(
    "claude-haiku-4-5-20251001",
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
    _haiku_model,  # haiku wystarczy do roleplay — 10× tańszy niż sonnet
    output_type=SyntheticUserResponse,
    system_prompt=_SIMULATOR_PROMPT,
    model_settings={"temperature": 0.7, "max_tokens": 500},
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

async def generate_archetypes_stream(
    product_segment: str,
    count: int = 4,
    market_type: str = "Mixed",
    additional_context: str = "",
):
    """Async generator - strumieniuje generowanie archetypow jako SSE events."""
    count = max(1, min(8, count))
    hints = _get_diversity_hints(count, market_type)

    yield {"type": "start", "segment": product_segment, "total": count}

    archetypes = []
    for i, hint in enumerate(hints, 1):
        msg = "Generuje archetyp " + str(i) + "/" + str(count) + ": " + hint + "..."
        yield {"type": "progress", "step": i, "total": count, "message": msg}

        context_extra = ("\nDodatkowy kontekst: " + additional_context) if additional_context else ""
        prompt = (
            "Segment produktu: " + product_segment + context_extra + "\n"
            "Typ rynku: " + market_type + "\n"
            "Archetyp #" + str(i) + "/" + str(count) + " - Perspektywa: " + hint + "\n\n"
            "Stworz unikalny archetyp reprezentujacy TA KONKRETNA perspektywe: " + hint
        )

        try:
            result = await synthetic_user_agent.run(prompt)
            profile = result.output
            archetypes.append(profile)

            profile_dict = {
                "archetype_name": profile.archetype_name,
                "demographics": profile.demographics,
                "psychology": profile.psychology,
                "jtbd_hypothesis": profile.jtbd_hypothesis,
                "forces_hypothesis": profile.forces_hypothesis,
                "expected_interview_behaviors": profile.expected_interview_behaviors,
                "hypotheses_to_test": profile.hypotheses_to_test,
                "red_flags_expected": profile.red_flags_expected,
            }

            yield {
                "type": "archetype",
                "step": i,
                "total": count,
                "archetype_name": profile.archetype_name,
                "data": profile_dict,
            }
        except Exception as e:
            err_msg = "Blad generowania archetypu " + str(i) + ": " + type(e).__name__
            yield {"type": "error", "step": i, "message": err_msg}

    yield {"type": "done", "total_generated": len(archetypes)}


async def generate_follow_up_question(
    archetype,
    original_question: str,
    weak_response_text: str,
    follow_up_suggested: str,
) -> str:
    """Generuje pytanie follow-up dla slabej odpowiedzi (vague/polite_lie)."""
    if follow_up_suggested and len(follow_up_suggested) > 20:
        return follow_up_suggested

    prompt = (
        "Profil: " + archetype.archetype_name + " - " + archetype.demographics + "\n\n"
        "Oryginalne pytanie: " + original_question + "\n"
        "Odpowiedz (slaba jakosc): " + weak_response_text + "\n\n"
        "Wygeneruj jedno konkretne pytanie follow-up ktore wyciagnie glebsza, bardziej autentyczna odpowiedz. "
        "Pytanie powinno byc oparte na konkretnym zachowaniu z przeszlosci (Evidence Level 2+). "
        "Zwroc TYLKO tekst pytania, bez wyjasnien."
    )
    try:
        result = await synthetic_interview_agent.run(prompt)
        return result.output.follow_up_suggested or result.output.response
    except Exception:
        words = original_question.lower().replace("?", "").strip()
        return "Opowiedz mi konkretnie o ostatnim razie gdy " + words + "."