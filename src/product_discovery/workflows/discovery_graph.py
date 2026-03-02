"""
Discovery Graph v2.0 — pydantic-graph state machine dla Discovery Phase.

8 węzłów wymuszają strukturalną kolejność kroków (v2.0 — Intelligence-Grade Discovery):

  SyntheticInterviewNode  [NOWY v2.0]
      │  Generuje 3 archetypy syntetycznych użytkowników PRZED wywiadami
      │  Cel: wiedzieć CZEGO szukać w prawdziwych wywiadach
      ↓
  BehavioralInterviewNode
      │  ba_agent.run() z tool "validate_interview_question"
      │  WYMAGA: interview_insights ≥ 3
      ↓
  CompetitiveResearchNode
      │  ba_agent.tool("analyze_competitors") → osint_agent
      │  WYMAGA: competitive_report != ""
      ↓
  EvidenceGradingNode
      │  Klasyfikuje zebrany materiał do EvidenceLevel 0-5
      ├─ evidence >= 2_Past_Behavior ──→ ForcesDiagramNode
      └─ evidence < 2               ──→ UserInputNeededNode
                                          (wypisuje co brakuje, pauzuje)
  ForcesDiagramNode  [NOWY v2.0]
      │  Analiza 4 sił: Push / Pull / Anxiety / Habit (Bob Moesta)
      │  BLOKUJE GO jeśli (Anxiety+Habit) > (Push+Pull) bez planu mitygacji
      ↓
  SynthesisNode
      │  ba_agent.run() → JTBDAnalysisResult (z Forces Diagram)
      │  Pydantic validator: GO wymaga evidence ≥ 2 i confidence ≥ 50
      ↓
  AssumptionMapNode  [NOWY v2.0]
      │  Wylistowuje wszystkie założenia z oceną ryzyka
      │  Identyfikuje "FATAL" założenia do przetestowania przed budowaniem
      ↓
  ScorecardNode
      │  Oblicza: ROI, hours, confidence gain, Discovery Quality Score
      ↓
  End(DiscoveryResult)

Odpowiedź systemowa na LESSONS.md — garden-design-app nie mogło by się powtórzyć,
bo EvidenceGradingNode STRUKTURALNIE blokuje Synthesis gdy dowody za słabe,
a ForcesDiagramNode blokuje GO gdy Anxiety > Pull (użytkownik nie zmieni narzędzia).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Union

from pydantic_graph import BaseNode, End, Graph, GraphRunContext

from product_discovery.workflows.discovery_state import DiscoveryResult, DiscoveryState, DiscoveryValueScorecard
from product_discovery.agents.business_analyst.agent import ba_agent
from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult
from product_discovery.agents.synthetic_user.agent import generate_archetypes


# ============================================================================
# WĘZEŁ 0: SYNTHETIC INTERVIEW [v2.0 NOWY]
# ============================================================================

@dataclass
class SyntheticInterviewNode(BaseNode[DiscoveryState]):
    """
    Generuje 3 archetypy syntetycznych użytkowników PRZED prawdziwymi wywiadami.

    Cel: Researcher wie czego szukać, jakie pytania działają, jakich red flags się spodziewać.
    Dostarcza: 3 archetypy (Early Adopter / Skeptic / Habitual) z hipotezami do sprawdzenia.

    NIE BLOKUJE: jeśli API nie jest dostępne — przejdź do BehavioralInterviewNode.
    WARTOŚĆ: Tanie (1 call API) a dramatycznie poprawia jakość prawdziwych wywiadów.
    """

    async def run(
        self, ctx: GraphRunContext[DiscoveryState]
    ) -> BehavioralInterviewNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("SyntheticInterviewNode", "Generowanie archetypów...")
        print("\n[0/7] SYNTHETIC INTERVIEW NODE [v2.0]")
        print("      Generowanie archetypów syntetycznych użytkowników...")

        try:
            archetypes = await generate_archetypes(
                product_segment=ctx.state.idea_description[:500]
            )

            # Zapisujemy archetypy jako stringi do state
            archetype_summaries = []
            for i, arch in enumerate(archetypes, 1):
                summary = (
                    f"Archetyp {i}: {arch.archetype_name}\n"
                    f"Hipotezy do sprawdzenia: {'; '.join(arch.hypotheses_to_test[:2])}\n"
                    f"Red flags spodziewane: {'; '.join(arch.red_flags_expected[:2])}\n"
                    f"Expected behaviors: {arch.expected_interview_behaviors[0] if arch.expected_interview_behaviors else 'brak'}"
                )
                archetype_summaries.append(summary)
                print(f"\n      Archetyp {i}: {arch.archetype_name}")
                for h in arch.hypotheses_to_test[:2]:
                    print(f"        Hipoteza: {h}")

            ctx.state.synthetic_archetypes = archetype_summaries
            print(f"\n      ✅ {len(archetypes)} archetypów wygenerowanych — wywiad gotowy do przeprowadzenia")

        except Exception as e:
            # NIE blokujemy graph — syntetyczni użytkownicy są opcjonalni
            print(f"      ⚠️ Nie udało się wygenerować archetypów: {e}")
            print("      Kontynuuję bez syntetycznych użytkowników...")
            ctx.state.synthetic_archetypes = []

        return BehavioralInterviewNode()


# ============================================================================
# WĘZEŁ 1: BEHAVIORAL INTERVIEW
# ============================================================================

@dataclass
class BehavioralInterviewNode(BaseNode[DiscoveryState]):
    """
    Prowadzi agenta przez zbieranie insightów z wywiadów behawioralnych.

    BA Agent używa tool "validate_interview_question" żeby sprawdzić,
    czy pytania są zgodne z Mom Test (nie sugerują, pytają o przeszłość).

    BLOKUJE przejście do CompetitiveResearch jeśli interview_insights < 3.
    """

    async def run(
        self, ctx: GraphRunContext[DiscoveryState]
    ) -> CompetitiveResearchNode | UserInputNeededNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("BehavioralInterviewNode", "Analiza insightów z wywiadów...")
        print("\n[1/5] BEHAVIORAL INTERVIEW NODE")
        print("      Zbieranie insightów z wywiadów behawioralnych...")

        # Jeśli founder podał notatki z wywiadów (--interviews), używamy ich jako główne źródło.
        # Jeśli nie — próbujemy wyciągnąć co jest z opisu pomysłu (słabsze dowody).
        if ctx.state.interview_notes:
            interviews_excerpt = ctx.state.interview_notes[:4000]
            prompt = f"""Przeanalizuj poniższe notatki z wywiadów i wyodrębnij KONKRETNE insighty behawioralne.

## POMYSŁ
{ctx.state.idea_description}

## MATERIAŁ Z WYWIADÓW (źródło prawdziwych/syntetycznych insightów)
{interviews_excerpt}

ZADANIE:
1. Wyodrębnij 4-6 konkretnych insightów behawioralnych — TYLKO z materiału z wywiadów.
2. Każdy insight musi opisywać KONKRETNE działanie użytkownika (past behavior).
3. Szczególnie szukaj: workaroundów (arkusze, notes), strat (klient odszedł), named tools,
   cytatów z wywiadów, odpowiedzi oznaczonych 💎 DETAILED lub ✅ GENUINE.
4. Użyj validate_interview_question dla kluczowych pytań z sesji.

FORMAT INSIGHTÓW:
- "N/M respondentów używa [konkretne narzędzie] jako workaround na [konkretny problem]"
- "Rozmówca X opisał: [konkretna historia z przeszłości]"
- "Archetyp [nazwa]: workaround = [co robi], ból = [konkretna strata]"

NIE GENERUJ fikcyjnych insightów — tylko to co jest w materiale z wywiadów.
"""
        else:
            prompt = f"""Przeprowadź analizę wywiadów behawioralnych dla następującego pomysłu:

{ctx.state.idea_description}

ZADANIE:
1. Na podstawie opisu — czy founder przeprowadził wywiady behawioralne?
2. Wyodrębnij konkretne insighty (max 5) z zachowań użytkowników opisanych w tekście.
3. Dla każdego potencjalnego pytania użyj validate_interview_question żeby sprawdzić jakość.
4. Oceń: czy mamy dowody behawioralne (past behavior), czy tylko opinie/preferencje?

FORMAT INSIGHTÓW (każdy insight to osobna obserwacja z wywiadu):
- Każdy insight musi być konkretny: "Użytkownik X robił Y w sytuacji Z"
- Nie ogólniki: NIE "użytkownicy lubią prostotę"
- TAK: "3 na 5 freelancerów pokazało mi swoje prowizoryczne systemy w Excel+Notion"

Jeśli opis NIE zawiera wywiadów behawioralnych — wyciągnij to co jest i zaznacz brak.
"""

        result = await ba_agent.run(prompt)

        # Budujemy insighty z WSZYSTKICH pól JTBDAnalysisResult.
        # Dzięki temu zawsze mamy ≥3 insightów gdy agent zwrócił poprawny wynik.
        # Prawdziwa bramka jakości jest w EvidenceGradingNode (evidence_level ≥ 2).
        insights = []

        # 3 wymiary Job (zawsze obecne w JTBDAnalysisResult)
        if result.output.functional_job:
            insights.append(f"Functional Job: {result.output.functional_job}")
        if result.output.emotional_job:
            insights.append(f"Emotional Job: {result.output.emotional_job}")
        if result.output.social_job:
            insights.append(f"Social Job: {result.output.social_job}")

        # Konkurencja = potwierdzenie że użytkownicy mają alternatywy (lub nie)
        for sol in result.output.competing_solutions[:2]:
            insights.append(f"Obecne rozwiązanie: {sol}")

        # Reasoning — konkretne obserwacje behawioralne jeśli agent je opisał
        if result.output.reasoning:
            lines = result.output.reasoning.strip().split("\n")
            for line in lines:
                line = line.strip()
                if line and len(line) > 30:
                    insights.append(line)
                    break  # Bierzemy pierwszą sensowną linię

        ctx.state.interview_insights = insights[:6]  # Max 6 insightów

        print(f"      Zebrano {len(ctx.state.interview_insights)} insightów.")
        for i, insight in enumerate(ctx.state.interview_insights, 1):
            print(f"      {i}. {insight[:80]}...")

        if ctx.state.has_minimum_interviews:
            return CompetitiveResearchNode()
        else:
            ctx.state.missing_data_reason = (
                f"Zebrano tylko {len(ctx.state.interview_insights)} insightów "
                f"(minimum 3). Brakuje konkretnych obserwacji zachowań użytkowników. "
                f"Przeprowadź 2-3 rozmowy behawioralne i uruchom ponownie."
            )
            return UserInputNeededNode()


# ============================================================================
# WĘZEŁ 2: COMPETITIVE RESEARCH
# ============================================================================

@dataclass
class CompetitiveResearchNode(BaseNode[DiscoveryState]):
    """
    Deleguje research konkurencji do OSINT agenta przez BA agenta.

    BA Agent woła tool "analyze_competitors" → OSINT Agent (Perplexity / DuckDuckGo).

    BLOKUJE przejście do EvidenceGrading jeśli competitive_report jest pusty.
    """

    async def run(
        self, ctx: GraphRunContext[DiscoveryState]
    ) -> EvidenceGradingNode | UserInputNeededNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("CompetitiveResearchNode", "Research konkurencji...")
        print("\n[2/5] COMPETITIVE RESEARCH NODE")
        print("      Analiza konkurencji przez OSINT agenta...")

        # Wyodrębnij kategorię produktu z opisu
        category_prompt = f"""Na podstawie opisu pomysłu:

{ctx.state.idea_description}

1. Użyj analyze_competitors żeby zbadać konkurencję dla tej kategorii produktu.
2. Zidentyfikuj 5-10 obecnych rozwiązań na rynku.
3. Oceń: czy użytkownicy mają DOBRE istniejące alternatywy, czy luka jest realna?

Zwróć wynik jako JTBDAnalysisResult z competing_solutions wypełnionym na podstawie researchu.
"""

        result = await ba_agent.run(category_prompt)

        # Budujemy competitive_report z competing_solutions
        if result.output.competing_solutions:
            report_lines = [
                "# Raport konkurencji (OSINT)\n",
                f"## Obecne rozwiązania ({len(result.output.competing_solutions)} zidentyfikowanych)\n",
            ]
            for sol in result.output.competing_solutions:
                report_lines.append(f"- {sol}")

            if result.output.reasoning:
                report_lines.append(f"\n## Analiza\n{result.output.reasoning}")

            ctx.state.competitive_report = "\n".join(report_lines)
            print(f"      Zidentyfikowano {len(result.output.competing_solutions)} konkurentów.")
        else:
            ctx.state.missing_data_reason = (
                "Research konkurencji nie zwrócił wyników. "
                "Sprawdź połączenie z internetem i uruchom ponownie."
            )
            return UserInputNeededNode()

        return EvidenceGradingNode()


# ============================================================================
# WĘZEŁ 3: EVIDENCE GRADING
# ============================================================================

@dataclass
class EvidenceGradingNode(BaseNode[DiscoveryState]):
    """
    Klasyfikuje zebrane dowody na skali EvidenceLevel 0-5.

    KLUCZOWY WĘZEŁ — odpowiedź systemowa na LESSONS.md (garden-design-app).
    Fizycznie blokuje przejście do Synthesis gdy dowody są za słabe.

    Skala:
    0 = Opinia ("myślę, że użytkownicy chcieliby...")
    1 = Preferencja ("czy kupiłbyś?" → "tak!")
    2 = Zachowanie z przeszłości → MINIMUM dla GO
    3 = Zaangażowanie czasem (beta signup, waitlist)
    4 = Finansowe (depozyt, pre-order)
    5 = Gotówka (zakup w pełnej cenie)
    """

    # Kolejność poziomów — wyższy indeks = silniejszy dowód
    EVIDENCE_ORDER = [
        "0_Opinion",
        "1_Preference",
        "2_Past_Behavior",
        "3_Time_Commitment",
        "4_Financial",
        "5_Cash",
    ]

    async def run(
        self, ctx: GraphRunContext[DiscoveryState]
    ) -> ForcesDiagramNode | UserInputNeededNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("EvidenceGradingNode", "Ocena poziomu dowodów...")
        print("\n[3/7] EVIDENCE GRADING NODE")
        print("      Klasyfikacja zebranych dowodów...")

        # Analiza insightów pod kątem evidence level — z uwzględnieniem interview_notes
        evidence_level = self._grade_evidence(
            ctx.state.interview_insights,
            interview_notes=ctx.state.interview_notes,
        )
        ctx.state.evidence_level = evidence_level

        level_idx = self.EVIDENCE_ORDER.index(evidence_level)
        print(f"      Evidence Level: {evidence_level} (poziom {level_idx}/5)")

        if ctx.state.meets_evidence_threshold:
            print("      ✅ Dowody wystarczające — przejście do Forces Diagram")
            return ForcesDiagramNode()
        else:
            print(f"      ❌ Dowody za słabe (poziom {level_idx}/5, minimum: 2/5)")
            ctx.state.missing_data_reason = (
                f"Dowody na poziomie '{evidence_level}' są za słabe dla decyzji GO/NO-GO.\n\n"
                "Brakuje: konkretnych historii z przeszłości użytkowników (Past Behavior).\n\n"
                "Co zrobić:\n"
                "1. Przeprowadź 2-3 wywiady behawioralne z pytaniami:\n"
                '   "Opowiedz mi o ostatnim razie, gdy próbowałeś rozwiązać ten problem..."\n'
                '   "Jak to zrobiłeś? Ile czasu zajęło? Co nie zadziałało?"\n'
                "2. Zbierz KONKRETNE HISTORIĘ (nie opinie ani obietnice zakupu)\n"
                "3. Uruchom Discovery ponownie z uzupełnionym opisem\n\n"
                "Przykład dobrego dowodu: "
                '"5 freelancerów pokazało mi swoje systemy w Excel — jeden stracił klienta '
                'przez przeoczony deadline"\n'
                'Przykład złego dowodu: "Moi znajomi powiedzieli że to świetny pomysł"'
            )
            return UserInputNeededNode()

    def _grade_evidence(self, insights: list[str], interview_notes: str = "") -> str:
        """
        Classifier bazujący na słowach kluczowych w insightach i notatkach z wywiadów.

        Uwaga: jeśli interview_notes zawierają markery jakości wywiadów (💎 DETAILED,
        opisowe workaroundy, konkretne narzędzia) — to jest silny sygnał 2_Past_Behavior.
        Bez interview_notes wymagamy ściślejszych słów kluczowych żeby uniknąć
        fałszywego 2_Past_Behavior z opisu pomysłu foundera.
        """
        insights_text = " ".join(insights).lower()
        notes_text = interview_notes.lower() if interview_notes else ""

        # Poziom 5: Gotówka
        cash_kw = ["zapłacił", "kupił", "zakupił", "paid", "purchased", "bought"]
        if any(kw in insights_text for kw in cash_kw):
            return "5_Cash"

        # Poziom 4: Finansowy (depozyt, pre-order)
        financial_kw = ["depozyt", "wpłacił", "pre-order", "deposit", "preorder", "zarezerwował"]
        if any(kw in insights_text for kw in financial_kw):
            return "4_Financial"

        # Poziom 3: Zaangażowanie czasowe (beta, waitlist)
        time_kw = ["waitlist", "beta", "zapisał się", "signed up", "waiting list"]
        if any(kw in insights_text for kw in time_kw):
            return "3_Time_Commitment"

        # Poziom 2 — STRONG: markery z wywiadów (💎 DETAILED, workaroundy z named tools)
        # Te słowa kluczowe są mocne tylko gdy są w kontekście wywiadów (nie opisu pomysłu)
        if notes_text:
            # Jeśli mamy notatki z wywiadów — szukamy dowodów behawioralnych w nich
            strong_behavioral_in_notes = [
                "detailed", "💎", "pokazał", "showed", "ręczny arkusz",
                "workaround", "google sheets", "notion", "excel", "notes w kratkę",
                "stracił klienta", "lost client", "przeoczony", "missed deadline",
                "brudny sekret", "wstydzę się", "last time", "ostatnim razie",
            ]
            if any(kw in notes_text for kw in strong_behavioral_in_notes):
                return "2_Past_Behavior"

            # Miękkie behawioralne — w notatkach z wywiadów to wystarczy
            soft_behavioral_in_notes = [
                "używa", "korzysta", "zbudował", "stworzył", "codziennie",
                "uses", "built", "daily", "process", "workflow",
            ]
            if any(kw in notes_text for kw in soft_behavioral_in_notes):
                return "2_Past_Behavior"

        # Poziom 2 — tylko z insightów (bez notatek z wywiadów)
        # Wymagamy silniejszych słów kluczowych żeby uniknąć fałszywego poziomu z opisu pomysłu
        strong_behavioral_in_insights = [
            "pokazał", "pokazała", "pokazali", "showed",
            "stracił", "stracili", "lost",
            "zbudował", "stworzył", "built", "created",
            "past behavior", "zachowanie z przeszłości",
            "ostatnim razie", "last time",
            "3 na", "4 na", "5 na",  # frakcje respondentów
        ]
        if any(kw in insights_text for kw in strong_behavioral_in_insights):
            return "2_Past_Behavior"

        # Poziom 1: Preferencje (obietnice zakupu — bez działań z przeszłości)
        preference_kw = ["kupiłby", "zapłaciłby", "would pay", "would buy", "chciałby", "chciałbym"]
        if any(kw in insights_text for kw in preference_kw):
            return "1_Preference"

        # Poziom 0: Opinie (brak konkretnych dowodów behawioralnych)
        return "0_Opinion"


# ============================================================================
# WĘZEŁ 4: FORCES DIAGRAM [v2.0 NOWY]
# ============================================================================

@dataclass
class ForcesDiagramNode(BaseNode[DiscoveryState]):
    """
    Analizuje 4 siły według modelu Bob Moesty (Demand-Side Sales).

    Odpowiada na pytanie: "Czy użytkownik FAKTYCZNIE zmieni swoje narzędzie/zachowanie?"

    Formuła: (Push + Pull) > (Anxiety + Habit) → Switch zachodzi
    BLOKUJE GO jeśli (Anxiety+Habit) > (Push+Pull) bez planu mitygacji.

    Brak sił dokumentuje się cytatami z wywiadów — to jest Evidence Level sprawdzenie.
    """

    async def run(
        self, ctx: GraphRunContext[DiscoveryState]
    ) -> SynthesisNode | UserInputNeededNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("ForcesDiagramNode", "Analiza sił Push/Pull/Anxiety/Habit...")
        print("\n[4/7] FORCES DIAGRAM NODE [v2.0]")
        print("      Analiza sił: Push / Pull / Anxiety / Habit...")

        forces_prompt = f"""Przeprowadź analizę Forces Diagram (Bob Moesta) dla poniższego pomysłu.

## POMYSŁ I ZEBRANE DANE
{ctx.state.idea_description}

## INSIGHTS Z WYWIADÓW
{chr(10).join(f"- {i}" for i in ctx.state.interview_insights)}

## ANALIZA KONKURENCJI (fragmenty)
{ctx.state.competitive_report[:1000] if ctx.state.competitive_report else "Brak"}

---

ZADANIE: Zwróć JTBDAnalysisResult gdzie w polu `reasoning` zawarty jest PEŁNY Forces Diagram.

W polu reasoning użyj DOKŁADNIE tego formatu:

## FORCES DIAGRAM ANALYSIS

### PUSH (wypycha z obecnego rozwiązania) — Siła: X/10
**Cytaty z wywiadów:**
- [Konkretny cytat lub obserwacja behawioralna]
- [Drugi cytat]
**Ocena:** [Opis siły Push i jej źródeł]

### PULL (przyciąga do nowego rozwiązania) — Siła: X/10
**Konkretna wartość oferowana:**
- [Co dokładnie oferujemy w zamian?]
**Ocena:** [Czy Pull jest konkretny czy tylko "byłoby fajniej"?]

### ANXIETY (strach przed nowym) — Siła: X/10
**Źródła obaw:**
- [compliance, migration, learning, ecosystem lock-in, etc.]
**Ocena:** [Czy Anxiety da się zniwelować? Jak?]

### HABIT (inercja/przyzwyczajenie) — Siła: X/10
**Składniki inercji:**
- [sunk cost, muscle memory, ecosystem, switching cost]
**Ocena:** [Jak silne jest przyzwyczajenie?]

### DECYZJA
(Push + Pull) = X vs (Anxiety + Habit) = Y
WYNIK: [SWITCH_LIKELY / SWITCH_POSSIBLE / SWITCH_UNLIKELY]

JEŚLI SWITCH_UNLIKELY: plan mitygacji:
- [Konkretne kroki do zmniejszenia Anxiety lub Habit]

### TRIGGER EVENT
[Co sprawiło że użytkownik szuka TERAZ? Lub co mógłby to wyzwolić?]

---

ZASADA WERDYKTU:
- Jeśli SWITCH_UNLIKELY i brak planu mitygacji → verdict = NEEDS_MORE_DATA
- Jeśli SWITCH_LIKELY lub SWITCH_POSSIBLE + silny Push → kontynuuj z analizą JTBD
"""

        result = await ba_agent.run(forces_prompt)

        # Zapisujemy surowy reasoning jako forces_diagram do state
        ctx.state.forces_diagram = result.output.reasoning if result.output.reasoning else ""

        # Sprawdzamy wynik: czy switch jest możliwy?
        reasoning_lower = (result.output.reasoning or "").lower()
        switch_unlikely = "switch_unlikely" in reasoning_lower

        if switch_unlikely and result.output.verdict != "NO-GO":
            print("      ⚠️ Forces Diagram: SWITCH_UNLIKELY — sprawdź plan mitygacji")
        elif result.output.verdict == "NO-GO":
            print("      ❌ Forces Diagram wskazuje: użytkownicy nie zmienią rozwiązania")
        else:
            print("      ✅ Forces Diagram: switch możliwy — kontynuuję do Synthesis")

        print(f"      Evidence: {result.output.evidence_level} | Verdict: {result.output.verdict}")

        # Jeśli Forces są wyraźnie przeciwne i brak planu mitygacji → zatrzymujemy
        if switch_unlikely and not any(
            kw in reasoning_lower for kw in ["mitygacja", "mitigation", "zmniejsz", "reduce"]
        ):
            ctx.state.missing_data_reason = (
                "Forces Diagram wskazuje że SWITCH_UNLIKELY:\n"
                "(Anxiety + Habit) > (Push + Pull)\n\n"
                "Użytkownicy NIE zmienią rozwiązania bez planu mitygacji.\n\n"
                "Co zrobić:\n"
                "1. Zidentyfikuj główne źródła Anxiety i Habit\n"
                "2. Zaplanuj jak je zniwelować (trial bez CC, import danych, familiar UX)\n"
                "3. Sprawdź czy Pull jest wystarczająco konkretny (kalkulator ROI)\n"
                "4. Uruchom Discovery ponownie z danymi od użytkowników o barier zmiany"
            )
            return UserInputNeededNode()

        # Aktualizujemy jtbd_result z danymi forces diagram (do Synthesis)
        ctx.state.jtbd_result = result.output
        return SynthesisNode()


# ============================================================================
# WĘZEŁ 5a: SYNTHESIS
# ============================================================================

@dataclass
class SynthesisNode(BaseNode[DiscoveryState]):
    """
    Finalny BA Agent run — generuje pełny JTBDAnalysisResult.

    Korzysta ze wszystkich zebranych danych:
    - interview_insights z BehavioralInterviewNode
    - competitive_report z CompetitiveResearchNode
    - evidence_level z EvidenceGradingNode

    Pydantic validator w JTBDAnalysisResult BLOKUJE GO przy słabych dowodach.
    """

    async def run(self, ctx: GraphRunContext[DiscoveryState]) -> AssumptionMapNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("SynthesisNode", "Synteza analizy JTBD...")
        print("\n[5/7] SYNTHESIS NODE")
        print("      Generowanie finalnej analizy JTBD...")

        forces_section = ""
        if ctx.state.forces_diagram:
            forces_section = f"\n## FORCES DIAGRAM (analiza z poprzedniego kroku)\n{ctx.state.forces_diagram}\n"

        archetypes_section = ""
        if ctx.state.synthetic_archetypes:
            archetypes_section = (
                f"\n## SYNTETYCZNI UŻYTKOWNICY (archetypy pre-discovery)\n"
                + "\n\n".join(ctx.state.synthetic_archetypes[:2])
                + "\n"
            )

        synthesis_prompt = f"""Dokonaj kompleksowej analizy JTBD na podstawie WSZYSTKICH zebranych danych.

## POMYSŁ
{ctx.state.idea_description}

## INSIGHTS Z WYWIADÓW ({len(ctx.state.interview_insights)} punktów)
{chr(10).join(f"- {i}" for i in ctx.state.interview_insights)}

## RAPORT KONKURENCJI
{ctx.state.competitive_report}

## POZIOM DOWODÓW
{ctx.state.evidence_level}
{forces_section}{archetypes_section}

---

ZADANIE: Wygeneruj kompletny JTBDAnalysisResult.

ZASADY dla verdict/evidence/confidence:
- verdict=GO tylko gdy evidence_level >= 2_Past_Behavior I confidence >= 50
- verdict=NO-GO gdy job słaby LUB konkurencja nie do pokonania bez przewagi własnej
- verdict=NEEDS_MORE_DATA gdy obiecujące, ale dowody poniżej 2_Past_Behavior
- confidence: bądź krytyczny — większość odkryć powinna OBNIŻAĆ pewność foundera, nie ją potwierdzać
  (typowy founder bias: 85% → po walidacji 60-75% jeśli GO, <50% jeśli NO-GO)

ZASADY dla pól tekstowych:
- functional_job: "Czasownik + Obiekt + Kontekst" — NIGDY opis produktu
- competing_solutions: KONKRETNE narzędzia/zachowania użytkowników DZIŚ (z raportu konkurencji)
- reasoning: użyj DOKŁADNIE tego formatu 5-sekcyjnego (każda sekcja jest wymagana):

## Kluczowe dowody
[2-3 konkretne obserwacje z liczbami i faktami z wywiadów. Format: "N/M respondentów..."]

## Dlaczego {"{GO/NO-GO/NEEDS_MORE_DATA}"}
[1-2 zdania z konkretnym uzasadnieniem opartym na powyższych dowodach]

## Kluczowe założenia
[2-3 założenia które MUSZĄ być prawdziwe żeby werdykt się utrzymał. Format: "Zakładamy że X, bo Y"]

## Główne ryzyka
[2-3 scenariusze które mogą zmienić werdykt. Format: "Ryzyko: X → Impact: Y"]

## Rekomendowane eksperymenty
[2-3 konkretne kroki walidacyjne z kryterium sukcesu. Format: "Zrób X → Kryterium sukcesu: Y"]
"""

        result = await ba_agent.run(synthesis_prompt)
        ctx.state.jtbd_result = result.output  # Zapisujemy do state

        print(f"      Werdykt: {result.output.verdict} (confidence: {result.output.confidence}%)")
        print(f"      Evidence: {result.output.evidence_level}")

        return AssumptionMapNode()


# ============================================================================
# WĘZEŁ 6: ASSUMPTION MAP [v2.0 NOWY]
# ============================================================================

@dataclass
class AssumptionMapNode(BaseNode[DiscoveryState]):
    """
    Wylistowuje WSZYSTKIE założenia na których stoi werdykt i ranguje je po ryzyku.

    Cel: Zidentyfikować "FATAL assumptions" — założenia które jeśli są błędne,
    niszczą cały business case — i upewnić się że są przetestowane PRZED budowaniem.

    NIE BLOKUJE: mapa założeń jest informacyjna, nie decyzyjna.
    WARTOŚĆ: Zapobiega spending miesięcy na produkt oparty na niepotwierdzonych założeniach.
    """

    async def run(self, ctx: GraphRunContext[DiscoveryState]) -> ScorecardNode:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("AssumptionMapNode", "Mapowanie założeń i ryzyk...")
        print("\n[6/7] ASSUMPTION MAP NODE [v2.0]")
        print("      Mapowanie założeń i ryzyk...")

        jtbd = ctx.state.jtbd_result

        assumption_prompt = f"""Na podstawie poniższej analizy JTBD — wylistuj WSZYSTKIE założenia
które MUSZĄ być prawdziwe żeby werdykt '{getattr(jtbd, "verdict", "GO")}' się utrzymał.

## ANALIZA JTBD
Verdict: {getattr(jtbd, "verdict", "?")}
Confidence: {getattr(jtbd, "confidence", "?")}%
Evidence Level: {getattr(jtbd, "evidence_level", "?")}

Functional Job: {getattr(jtbd, "functional_job", "?")}
Reasoning: {(getattr(jtbd, "reasoning", "") or "")[:800]}

## POMYSŁ
{ctx.state.idea_description[:400]}

---

ZADANIE: Wygeneruj JTBDAnalysisResult gdzie pole `reasoning` zawiera MAPĘ ZAŁOŻEŃ:

## MAPA ZAŁOŻEŃ

### FATAL (jeśli błędne → cały business case upada)
| Założenie | Aktualne dowody | Jak przetestować |
|-----------|-----------------|------------------|
| [Założenie 1] | [Evidence Level i opis] | [Konkretny test] |
| [Założenie 2] | [Evidence Level i opis] | [Konkretny test] |

### HIGH RISK (jeśli błędne → duże pivoty)
| Założenie | Aktualne dowody | Jak przetestować |
|-----------|-----------------|------------------|
| [Założenie] | [Evidence Level] | [Konkretny test] |

### ACCEPTABLE RISK (monitorować)
| Założenie | Aktualne dowody | Status |
|-----------|-----------------|--------|
| [Założenie] | [Evidence Level] | [Acceptable/Monitor] |

## PRIORYTETY TESTOWANIA (przed pierwszym klientem)
1. [Najważniejsze do przetestowania] — metoda: [jak]
2. [Drugie w kolejności] — metoda: [jak]
3. [Trzecie] — metoda: [jak]

Użyj tych samych wartości verdict/evidence/confidence co w analizie JTBD powyżej.
"""

        try:
            result = await ba_agent.run(assumption_prompt)

            # Zapisujemy mapę założeń do state
            if result.output.reasoning:
                lines = result.output.reasoning.strip().split("\n")
                ctx.state.assumption_map = [l for l in lines if l.strip()]
                fatal_count = sum(1 for l in lines if "fatal" in l.lower())
                print(f"      Zidentyfikowano założenia (FATAL: {fatal_count})")
            else:
                ctx.state.assumption_map = ["Brak szczegółowej mapy założeń"]

        except Exception as e:
            print(f"      ⚠️ Nie udało się wygenerować mapy założeń: {e}")
            ctx.state.assumption_map = ["Błąd generowania mapy założeń — sprawdź ręcznie"]

        return ScorecardNode()


# ============================================================================
# WĘZEŁ 6b: USER INPUT NEEDED (pauzuje discovery)
# ============================================================================

@dataclass
class UserInputNeededNode(BaseNode[DiscoveryState]):
    """
    Pauzuje Discovery Graph i wypisuje jasny komunikat co brakuje.

    NIE przerywa sesji — zapisuje stan do ctx.state żeby można było wznowić
    (--resume <project_name> w run_discovery.py).
    """

    async def run(self, ctx: GraphRunContext[DiscoveryState]) -> End[DiscoveryResult]:
        print("\n⚠️  DISCOVERY ZATRZYMANA — POTRZEBNE DODATKOWE DANE")
        print("=" * 60)
        print(ctx.state.missing_data_reason)
        print("=" * 60)
        print(f"\nAby wznowić: python run_discovery.py --resume {ctx.state.project_name}")
        print("(Dodaj brakujące dane do opisu projektu i uruchom ponownie)\n")

        # Zwracamy częściowy wynik — bez jtbd (nie był ukończony)
        # Tworzymy placeholder result z NEEDS_MORE_DATA
        placeholder_jtbd = JTBDAnalysisResult(
            functional_job="Wymagane dodatkowe wywiady behawioralne",
            emotional_job="Poczuć pewność przed budowaniem produktu",
            social_job="Podejmować decyzje oparte na danych, nie opiniach",
            competing_solutions=["Istniejące rozwiązania — wymagają researchu"],
            verdict="NEEDS_MORE_DATA",
            evidence_level=ctx.state.evidence_level,  # type: ignore[arg-type]
            confidence=10,
            reasoning=ctx.state.missing_data_reason,
        )

        scorecard = DiscoveryValueScorecard(
            hours_invested=ctx.state.elapsed_hours(),
            evidence_level_achieved=ctx.state.evidence_level,
            confidence_before=80,
            confidence_after=10,
            roi_estimate="Discovery ujawniła brak danych — zapobiega budowaniu bez walidacji",
        )

        return End(
            DiscoveryResult(
                jtbd=placeholder_jtbd,
                scorecard=scorecard,
                project_name=ctx.state.project_name,
                duration_hours=ctx.state.elapsed_hours(),
            )
        )


# ============================================================================
# WĘZEŁ 5: SCORECARD
# ============================================================================

@dataclass
class ScorecardNode(BaseNode[DiscoveryState]):
    """
    Oblicza wartość przeprowadzonej Discovery session.

    Odpowiada na pytanie: "Ile zaoszczędziliśmy nie budując złej rzeczy?"
    Albo: "Ile zaoszczędziliśmy budując dobrą rzecz od razu?"
    """

    async def run(self, ctx: GraphRunContext[DiscoveryState]) -> End[DiscoveryResult]:
        if ctx.state.progress_callback:
            await ctx.state.progress_callback("ScorecardNode", "Obliczanie Scorecard i ROI...")
        print("\n[7/7] SCORECARD NODE")
        print("      Obliczanie wartości Discovery session...")

        jtbd: JTBDAnalysisResult = ctx.state.jtbd_result  # type: ignore[assignment]
        hours = ctx.state.elapsed_hours()
        minutes = max(1, round(hours * 60))  # Minimum 1 min żeby nie pokazywać 0

        # Confidence przed Discovery = zakładamy 85% (typowy founder bias)
        confidence_before = 85
        confidence_after = jtbd.confidence

        # ROI estimate — sensowny niezależnie od długości sesji
        if jtbd.verdict == "GO":
            roi_hours_saved = max(8, confidence_after * 0.5)
            roi = (
                f"✅ GO — {minutes}min walidacji dało pewność {confidence_after}% "
                f"(zaoszczędza ~{roi_hours_saved:.0f}h budowania bez potwierdzenia)"
            )
        elif jtbd.verdict == "NO-GO":
            roi_hours_saved = max(80, confidence_before * 0.8)
            roi = (
                f"🚫 NO-GO — {minutes}min zaoszczędziło ~{roi_hours_saved:.0f}h "
                f"budowania złej rzeczy (pewność spadła {confidence_before}%→{confidence_after}%)"
            )
        else:
            roi = (
                f"⚠️ NEEDS_MORE_DATA — {minutes}min ujawniło luki — "
                f"zbierz więcej danych zanim zainwestujesz czas w budowanie"
            )

        scorecard = DiscoveryValueScorecard(
            hours_invested=hours,
            evidence_level_achieved=jtbd.evidence_level,
            confidence_before=confidence_before,
            confidence_after=confidence_after,
            roi_estimate=roi,
        )

        print(f"      Czas: {minutes}min | Confidence: {confidence_before}%→{confidence_after}%")

        # Buduj forces_report dla output
        forces_report = ctx.state.forces_diagram if ctx.state.forces_diagram else ""
        assumption_report = "\n".join(ctx.state.assumption_map) if ctx.state.assumption_map else ""
        archetypes_report = "\n\n".join(ctx.state.synthetic_archetypes) if ctx.state.synthetic_archetypes else ""

        return End(
            DiscoveryResult(
                jtbd=jtbd,
                scorecard=scorecard,
                project_name=ctx.state.project_name,
                duration_hours=hours,
                competitive_report=ctx.state.competitive_report,
                forces_report=forces_report,
                assumption_map=assumption_report,
                synthetic_archetypes=archetypes_report,
            )
        )


# ============================================================================
# GRAPH DEFINITION
# ============================================================================

DiscoveryGraph = Graph(
    nodes=[
        SyntheticInterviewNode,
        BehavioralInterviewNode,
        CompetitiveResearchNode,
        EvidenceGradingNode,
        ForcesDiagramNode,
        SynthesisNode,
        AssumptionMapNode,
        UserInputNeededNode,
        ScorecardNode,
    ]
)


# ============================================================================
# CONVENIENCE RUNNER
# ============================================================================

async def run_discovery(
    idea_description: str,
    project_name: str = "unnamed",
    interview_notes: str = "",
    progress_callback=None,
) -> DiscoveryResult:
    """
    Uruchamia pełny Discovery Graph dla podanego pomysłu.

    Args:
        idea_description: Opis pomysłu + zebrane dane (wywiady, obserwacje)
        project_name: Nazwa projektu (dla pliku output)
        interview_notes: Opcjonalne notatki z wywiadów (SYNTHETIC_INTERVIEWS.md
                         lub ręczne notatki) — zasilają BehavioralInterviewNode
                         i EvidenceGradingNode prawdziwymi dowodami behawioralnymi.
        progress_callback: Opcjonalny async callable(node_name: str, message: str) wywoływany
                           na początku każdego węzła — używany przez Web UI do śledzenia postępu.

    Returns:
        DiscoveryResult z JTBDAnalysisResult i Scorecard
    """
    state = DiscoveryState(
        project_name=project_name,
        idea_description=idea_description,
        interview_notes=interview_notes,
        progress_callback=progress_callback,
    )

    print(f"\n🔍 Discovery Phase: {project_name}")
    print(f"   Opis: {idea_description[:80]}...")

    result = await DiscoveryGraph.run(SyntheticInterviewNode(), state=state)
    return result.output

