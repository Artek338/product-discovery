"""
Batch Analyzer Agent - analizuje macierz odpowiedzi z Batch Interview Runner.

Wyciaga: Forces per archetype, consensus/divergence, pain ranking, WTP signals,
question effectiveness, hypothesis validation.
"""
import json
from typing import Optional

from pydantic import BaseModel
from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel


# ============================================================================
# Output Schema
# ============================================================================

class ForceSignalSchema(BaseModel):
    score: int
    evidence_quotes: list[str] = []


class ForcesPerArchetypeSchema(BaseModel):
    archetype_name: str
    push: ForceSignalSchema
    pull: ForceSignalSchema
    anxiety: ForceSignalSchema
    habit: ForceSignalSchema
    switch_likelihood: str
    trigger_event: Optional[str] = None


class ConsensusSignalSchema(BaseModel):
    topic: str
    agreement_level: str
    evidence_quotes: list[str] = []
    archetypes_count: int
    forces_dimension: Optional[str] = None


class DivergenceAlertSchema(BaseModel):
    topic: str
    segments: list[str]
    question_text: str
    segmentation_implication: str


class PainRankingSchema(BaseModel):
    pain: str
    frequency: int
    archetypes_affected: list[str] = []
    evidence_level: str = "2_Past_Behavior"
    forces_dimension: str = "push"


class WTPSignalSchema(BaseModel):
    archetype_name: str
    willing_to_pay: bool
    price_point: Optional[str] = None
    conditions: Optional[str] = None
    evidence_level: str = "1_Preference"
    van_westendorp: Optional[dict[str, str]] = None


class QuestionEffectivenessSchema(BaseModel):
    question_id: str
    question_text: str
    quality_distribution: dict
    signal_score: float
    recommendation: str
    improved_variant: Optional[str] = None
    forces_signal_strength: Optional[str] = None


class HypothesisResultSchema(BaseModel):
    hypothesis_id: str
    hypothesis_text: str
    status: str
    confidence: int
    evidence_quotes: list[str] = []
    archetypes_validated: list[str] = []
    archetypes_invalidated: list[str] = []


class KeyQuotesSchema(BaseModel):
    push: list[str] = []
    pull: list[str] = []
    anxiety: list[str] = []
    habit: list[str] = []
    surprising: list[str] = []


class BatchInsightsSchema(BaseModel):
    forces_per_archetype: list[ForcesPerArchetypeSchema] = []
    consensus_signals: list[ConsensusSignalSchema] = []
    divergence_alerts: list[DivergenceAlertSchema] = []
    pain_ranking: list[PainRankingSchema] = []
    wtp_signals: list[WTPSignalSchema] = []
    question_effectiveness: list[QuestionEffectivenessSchema] = []
    hypothesis_results: Optional[list[HypothesisResultSchema]] = None
    key_quotes: KeyQuotesSchema = KeyQuotesSchema()
    segmentation_hypothesis: Optional[str] = None
    recommended_next_questions: list[str] = []
    quality_score: int = 0
    quality_verdict: str = "NEEDS_MORE_DATA"
    executive_summary: str = ""


# ============================================================================
# System Prompt
# ============================================================================

_BATCH_ANALYSIS_PROMPT = """Jestes zaawansowanym analitykiem product discovery z 15-letnim doswiadczeniem.
Analizujesz macierz odpowiedzi z batch interview - N pytan x M archetypow syntetycznych uzytkownikow.

## Twoje zadanie

Na podstawie macierzy odpowiedzi wygeneruj kompletne insights:

### 1. Forces per Archetype
Dla kazdego archetypu ocen sily (1-10):
- push: Co go wypycha z obecnego rozwiazania? (szukaj w odpowiedziach P13,P14,P17-P20,P25)
- pull: Co przyciaga do nowego? (P21,P23,P27,P32)
- anxiety: Co blokuje zmiane? (P22,P26,P29,P30)
- habit: Sila przyzwyczajenia? (P7,P8,P9,P12,P28)
- switch_likelihood: HIGH jesli (push+pull) - (anxiety+habit) >= 4, MEDIUM >= 0, LOW < 0

### 2. Consensus Signals
Tematy gdzie wiekszosc archetypow sie zgadza (similar push, similar pain).
agreement_level: strong = 80%+ zgody, moderate = 50-79%, weak = < 50%

### 3. Divergence Alerts
Pytania/tematy gdzie archetypy odpowiadaja RADYKALNIE inaczej - sygnal segmentacji rynku.
segmentation_implication: co to znaczy dla go-to-market?

### 4. Pain Ranking
Bole wymieniane najczesciej. Kazdy bol:
- pain: Konkretny opis bolu (nie generyczny)
- frequency: Ile archetypow go wspomnalo
- evidence_level: Najwyzszy evidence level zaobserwowany (2_Past_Behavior, 3_Time_Commitment itd.)
- forces_dimension: Glownie push/pull/anxiety/habit

### 5. WTP Signals
Z odpowiedzi na pytania ekonomiczne (P31-P36).
Jesli archetyp podal liczby -> willing_to_pay=true, price_point=konkretna kwota.
evidence_level: 1_Preference jesli warunkowe, 3_Time_Commitment jesli konkretne kwoty.
van_westendorp: jesli padly 4 ceny (too_cheap, acceptable, expensive, too_expensive) - uzupelnij.

### 6. Question Effectiveness
Dla kazdego pytania:
- quality_distribution: zlicz ile odpowiedzi genuine/detailed/polite_lie/vague
- signal_score: (genuine + detailed) / total (0.0-1.0)
- recommendation: keep jesli score > 0.6, improve jesli 0.3-0.6, replace jesli < 0.3
- improved_variant: Podaj alternatywna wersje pytania jesli recommendation = improve/replace

### 7. Key Quotes
Najsilniejsze cytaty wg kategorii Forces. Wybieraj KONKRETNE zdania z odpowiedzi, nie streszczenia.
surprising: Cytaty z polite_lie komorek gdzie hidden_thought zdradza prawdziwy bol.

### 8. Executive Summary
3-5 zdan dla PM: Co odkrylesz? Czy jest silny sygnal? Jakie segmenty? Jakie najwieksze ryzyko?
Format: Z analizy N archetypow wynika ze... Najsilniejszy sygnal push: ... Najwieksza rozbieznosc: ...

### 9. Segmentation Hypothesis
Jesli wykrylesz divergence - zaproponuj hipoteze segmentacji:
Archetypy [X, Y] to wczesni adoptorzy (push>7), archetypy [Z, W] wymagaja edukacji rynku (push<4).

### 10. Recommended Next Questions
3-5 pytan follow-up na podstawie slabych sygnalow i polite_lies.

### 11. Quality Score (0-100)
- evidence_depth (0-25): ile odpowiedzi osiagnelo Level 2+
- consensus_strength (0-25): ile strong consensus signals
- forces_completeness (0-25): ile archetypow ma wszystkie 4 sily > 1
- question_quality (0-25): sredni signal_score pytan
quality_verdict: >=70 = HIGH_CONFIDENCE_GO, >=50 = CAUTIOUS_GO, >=30 = NEEDS_MORE_DATA, <30 = RESET_DISCOVERY

## Evidence Levels
- 0_Opinion: Mysle ze..., Uwazam ze... - bezwartosciowe
- 1_Preference: Wolalbym..., Wydaje mi sie... - slabe
- 2_Past_Behavior: Ostatnim razem..., W zeszlym tygodniu... - wartosciowe
- 3_Time_Commitment: Konkretne liczby czasu/pieniedzy, beta signup - silne
- 4_Financial: Zaliczka, przedplata - bardzo silne
- 5_Cash: Pelna cena upfront - najsilniejsze

## Response Quality Taxonomy
- genuine: Szczera, moze byc krotka
- detailed: Bogata w fakty, liczby, konkretne zdarzenia
- vague: Ogolna, bez konkretow - pytanie za szeroko
- polite_lie: Social desirability bias - pytanie sugerowalo odpowiedz

Badz analityczny i konkretny. Cytuj doslownie z odpowiedzi archetypow.
Jesli nie ma wystarczajacych danych na jakas kategorie - podaj pusta liste, nie wymyslaj."""


# ============================================================================
# Agent
# ============================================================================

_model = AnthropicModel("claude-sonnet-4-6")

batch_analysis_agent = Agent(
    model=_model,
    output_type=BatchInsightsSchema,
    system_prompt=_BATCH_ANALYSIS_PROMPT,
    model_settings={"temperature": 0.2, "max_tokens": 8000},  # duża analiza wymaga miejsca
    output_retries=2,
)


def _build_matrix_markdown(
    questions: list[dict],
    archetypes: list[dict],
    cells: list[dict],
    mode: str,
    hypotheses: list[dict] | None = None,
) -> str:
    """Buduje strukturalny markdown macierzy odpowiedzi - prompt do LLM."""
    lines: list[str] = []
    lines.append(f"# Batch Interview Matrix - Tryb: {mode.upper()}\n")
    lines.append(f"**Pytania:** {len(questions)} | **Archetypy:** {len(archetypes)}\n")
    lines.append(f"**Laczna liczba komorek:** {len(cells)}\n")

    if hypotheses:
        lines.append("\n## Hipotezy do walidacji\n")
        for h in hypotheses:
            lines.append(f"- [{h['id']}] {h['text']}\n")

    lines.append("\n## Archetypy\n")
    for i, a in enumerate(archetypes):
        lines.append(f"### Archetyp {i} - {a.get('archetype_name', f'A{i}')}\n")
        lines.append(f"- **Demografia:** {a.get('demographics', '')}\n")
        lines.append(f"- **Psychologia:** {a.get('psychology', '')}\n")
        lines.append(f"- **JTBD:** {a.get('jtbd_hypothesis', '')}\n")
        lines.append(f"- **Forces:** {a.get('forces_hypothesis', '')}\n")

    # Build lookup: (q_idx, a_idx) -> cell
    cell_map = {(c["q_idx"], c["a_idx"]): c for c in cells if c.get("round", 1) == 1}
    followup_map = {(c["q_idx"], c["a_idx"]): c for c in cells if c.get("round", 1) == 2}

    lines.append("\n## Macierz Odpowiedzi\n")
    for qi, q in enumerate(questions):
        lines.append(f"\n### Pytanie {qi} [{q.get('id', f'Q{qi}')}]: {q.get('text', '')}\n")
        lines.append(
            f"*Kategoria:* {q.get('category', '')} | "
            f"*Forces Dim:* {q.get('forces_dimension', '-')} | "
            f"*Evidence Target:* {q.get('evidence_level_target', '-')}\n"
        )

        for ai, a in enumerate(archetypes):
            archetype_name = a.get("archetype_name", f"A{ai}")
            cell = cell_map.get((qi, ai))
            if cell:
                quality_map = {
                    "genuine": "[OK]",
                    "detailed": "[GREAT]",
                    "vague": "[WEAK]",
                    "polite_lie": "[FLAG]",
                }
                quality_label = quality_map.get(cell.get("response_quality", ""), "[?]")
                lines.append(f"\n#### {archetype_name} {quality_label} [{cell.get('response_quality', '')}]\n")
                lines.append(f"**Odpowiedz:** {cell.get('response', '')}\n")
                lines.append(f"**Hidden thought:** {cell.get('hidden_thought', '')}\n")
                lines.append(f"**Follow-up suggested:** {cell.get('follow_up_suggested', '')}\n")

                # Round 2 follow-up jesli istnieje
                fu = followup_map.get((qi, ai))
                if fu:
                    fu_label = quality_map.get(fu.get("response_quality", ""), "[?]")
                    lines.append(f"\n**[RUNDA 2 - Follow-up] {fu_label}:** {fu.get('response', '')}\n")
                    lines.append(f"**Hidden thought R2:** {fu.get('hidden_thought', '')}\n")
            else:
                lines.append(f"\n#### {archetype_name} [BRAK ODPOWIEDZI]\n")

    return "".join(lines)


async def analyze_batch_matrix(
    questions: list[dict],
    archetypes: list[dict],
    cells: list[dict],
    mode: str,
    hypotheses: list[dict] | None = None,
) -> BatchInsightsSchema:
    """Analizuje macierz odpowiedzi i generuje pelne insights."""
    prompt = _build_matrix_markdown(questions, archetypes, cells, mode, hypotheses)
    result = await batch_analysis_agent.run(prompt)
    return result.output
