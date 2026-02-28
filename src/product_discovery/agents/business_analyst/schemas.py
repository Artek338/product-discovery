"""
Pydantic Schemas for Business Analyst Agent - Structured Output

This module defines strict schemas for Business Analyst responses,
ensuring type-safe, validated outputs instead of unstructured markdown.

Key schemas:
- JTBDAnalysisResult: Jobs-to-be-Done analysis with GO/NO-GO verdict
- PMFAssessment: Product-Market Fit evaluation
- OpportunitySolutionTree: Opportunity mapping

All schemas include:
- Literal types for enums (no free-form text)
- Field descriptions (inline prompts for LLM)
- Custom validators (@model_validator)
- Business logic validation
"""

from pydantic import BaseModel, Field, model_validator, field_validator
from typing import List, Optional, Literal, Any
from datetime import datetime


# ============================================================================
# Evidence Levels (from Discovery USP)
# ============================================================================

EvidenceLevel = Literal[
    "0_Opinion",          # Worthless: "I think users would like it"
    "1_Preference",       # Weak: "Would you buy this?"
    "2_Past_Behavior",    # Moderate: "Tell me about LAST time you..."
    "3_Time_Commitment",  # Strong: User spent time (beta signup, waitlist)
    "4_Financial",        # Very Strong: User paid something (deposit, preorder)
    "5_Cash"              # Strongest: User paid full price upfront
]


# ============================================================================
# Jobs-to-be-Done Analysis Result
# ============================================================================

class JTBDAnalysisResult(BaseModel):
    """
    Jobs-to-be-Done analysis with GO/NO-GO verdict.

    Used by Business Analyst when validating product ideas using JTBD framework.

    Example:
        result = JTBDAnalysisResult(
            verdict="GO",
            functional_job="Manage 3+ client projects simultaneously",
            emotional_job="Feel in control and stress-free",
            social_job="Be seen as organized professional",
            competing_solutions=["Trello", "Notion", "Excel"],
            evidence_level="2_Past_Behavior",
            confidence=85
        )
    """

    # ========================
    # Core JTBD Components
    # ========================

    functional_job: str = Field(
        description="""
        What task is the user trying to complete?
        Focus on the JOB, not the product.

        Format: Action verb + Object + Context
        Examples:
        ✅ "Organize client meetings across multiple time zones"
        ✅ "Track project deadlines for 5+ simultaneous projects"
        ❌ "Use a calendar app" (too solution-focused)
        ❌ "Be productive" (too vague)
        """
    )

    emotional_job: str = Field(
        description="""
        How does the user want to FEEL when doing this job?

        Examples:
        ✅ "Feel in control and not overwhelmed"
        ✅ "Feel confident I won't miss important deadlines"
        ✅ "Feel like a professional, not a disorganized freelancer"
        ❌ "Happy" (too generic)
        """
    )

    social_job: str = Field(
        description="""
        How does the user want to be PERCEIVED by others?

        Examples:
        ✅ "Be seen as reliable and organized by clients"
        ✅ "Appear as a serious business owner, not amateur"
        ❌ "Impress people" (too vague)
        """
    )

    # ========================
    # Competing Solutions
    # ========================

    competing_solutions: List[str] = Field(
        min_items=1,
        max_items=10,
        description="""
        What are users doing TODAY to solve this job?
        Include:
        - Direct competitors (e.g., "Asana", "Monday.com")
        - Non-obvious solutions (e.g., "Excel spreadsheet", "Sticky notes")
        - "Doing nothing" (if applicable)

        Why this matters: If users have NO current solution, demand might be weak.
        """
    )

    # ========================
    # Verdict & Evidence
    # ========================

    verdict: Literal["GO", "NO-GO", "NEEDS_MORE_DATA"] = Field(
        description="""
        GO: Strong job, strong pain, weak competing solutions.
        NO-GO: Weak job, weak pain, or strong competitors already solving this.
        NEEDS_MORE_DATA: Promising, but need more user interviews or evidence.
        """
    )

    evidence_level: EvidenceLevel = Field(
        description="""
        What level of evidence supports this analysis?

        Phase 2 Discovery requires MINIMUM: 2_Past_Behavior
        GO decision requires MINIMUM: 2_Past_Behavior + at least one 3_Time_Commitment

        If evidence is 0_Opinion or 1_Preference only → verdict MUST be NEEDS_MORE_DATA
        """
    )

    confidence: int = Field(
        ge=0,
        le=100,
        description="""
        How confident are you in this verdict? (0-100%)

        Guidelines:
        - 90-100%: Strong evidence, clear patterns, multiple user interviews
        - 70-89%: Good evidence, some patterns visible
        - 50-69%: Moderate evidence, needs more validation
        - <50%: Weak evidence, definitely NEEDS_MORE_DATA
        """
    )

    # ========================
    # Optional: Reasoning
    # ========================

    reasoning: Optional[str] = Field(
        None,
        description="""
        2-3 sentence explanation of verdict.
        Focus on EVIDENCE, not opinions.

        Example:
        "5 out of 6 interviewed freelancers described switching between 3+ tools daily
        (Trello for tasks, Google Calendar for meetings, Excel for finances). All mentioned
        feeling 'scattered' and wasting 30+ min/day on context switching. This indicates
        strong functional job with weak competing solutions."
        """
    )

    # ========================
    # Metadata
    # ========================

    analysis_date: datetime = Field(
        default_factory=datetime.now,
        description="Timestamp of analysis"
    )

    # ========================
    # Validators
    # ========================

    @model_validator(mode='after')
    def validate_business_logic(self):
        """
        Enforce business rules:
        1. If evidence is weak (0-1), verdict CANNOT be GO
        2. If confidence is low (<50), verdict SHOULD be NEEDS_MORE_DATA
        3. If competing_solutions is empty, verdict CANNOT be GO
        """

        # Rule 1: Weak evidence blocks GO verdict
        if self.evidence_level in ["0_Opinion", "1_Preference"] and self.verdict == "GO":
            raise ValueError(
                f"Cannot have verdict=GO with evidence_level={self.evidence_level}. "
                "GO requires minimum 2_Past_Behavior evidence."
            )

        # Rule 2: Low confidence suggests more data needed
        if self.confidence < 50 and self.verdict == "GO":
            raise ValueError(
                f"Cannot have verdict=GO with confidence={self.confidence}%. "
                "GO requires confidence >= 50%."
            )

        # Rule 3: Need competing solutions for proper analysis
        if len(self.competing_solutions) == 0 and self.verdict == "GO":
            raise ValueError(
                "Cannot have verdict=GO without analyzing competing_solutions. "
                "How do users solve this job today?"
            )

        return self

    @field_validator('functional_job', 'emotional_job', 'social_job')
    @classmethod
    def validate_job_length(cls, v: str) -> str:
        """Ensure jobs are not too short (lazy LLM) or too long (rambling)."""
        if len(v) < 10:
            raise ValueError(f"Job description too short: '{v}'. Minimum 10 characters.")
        if len(v) > 300:
            raise ValueError(f"Job description too long: '{v}'. Maximum 300 characters.")
        return v


# ============================================================================
# PMF Assessment Result
# ============================================================================

class PMFAssessment(BaseModel):
    """
    Product-Market Fit assessment.

    Used when evaluating existing product's PMF using Superhuman's methodology
    or Sean Ellis test.
    """

    pmf_score: int = Field(
        ge=0,
        le=100,
        description="""
        PMF score (0-100%).

        Benchmarks:
        - 40%+: Strong PMF (Sean Ellis threshold: "very disappointed" if product disappeared)
        - 20-39%: Moderate PMF, room for improvement
        - <20%: Weak PMF, major pivot or repositioning needed
        """
    )

    verdict: Literal["STRONG_PMF", "MODERATE_PMF", "WEAK_PMF"] = Field(
        description="PMF assessment based on pmf_score"
    )

    evidence: List[str] = Field(
        min_items=1,
        description="""
        Specific evidence supporting this assessment.

        Examples:
        ✅ "42% of surveyed users said they'd be 'very disappointed' if product disappeared"
        ✅ "NPS score of 65 (promoters significantly outnumber detractors)"
        ✅ "30% MoM organic growth (strong word-of-mouth)"
        ❌ "Users seem happy" (vague, no metrics)
        """
    )

    @model_validator(mode='after')
    def validate_pmf_score_alignment(self):
        """Ensure verdict matches pmf_score."""
        if self.pmf_score >= 40 and self.verdict != "STRONG_PMF":
            raise ValueError(f"pmf_score={self.pmf_score}% should be STRONG_PMF")
        if 20 <= self.pmf_score < 40 and self.verdict != "MODERATE_PMF":
            raise ValueError(f"pmf_score={self.pmf_score}% should be MODERATE_PMF")
        if self.pmf_score < 20 and self.verdict != "WEAK_PMF":
            raise ValueError(f"pmf_score={self.pmf_score}% should be WEAK_PMF")
        return self


# ============================================================================
# Opportunity Solution Tree Node
# ============================================================================

class OpportunitySolutionTree(BaseModel):
    """
    Opportunity Solution Tree mapping (Teresa Torres methodology).

    Maps user opportunities → potential solutions → experiments.
    """

    opportunity: str = Field(
        description="""
        User opportunity (problem/need/desire).
        Format: "Help [user] [verb] [context]"

        Example: "Help freelancers track multiple client projects without context switching"
        """
    )

    potential_solutions: List[str] = Field(
        min_items=1,
        max_items=5,
        description="""
        3-5 potential solutions to explore.
        At this stage, these are IDEAS, not commitments.

        Example:
        - "Unified dashboard showing all client projects in one view"
        - "AI assistant that auto-categorizes tasks by client"
        - "Browser extension that syncs across existing tools"
        """
    )

    next_experiments: List[str] = Field(
        min_items=1,
        max_items=3,
        description="""
        1-3 experiments to validate solutions.

        Examples:
        ✅ "Clickable prototype test with 10 users (measure: completion rate)"
        ✅ "Landing page with 'unified dashboard' value prop (measure: email signups)"
        ❌ "Build full MVP" (too big for experiment)
        """
    )


# ============================================================================
# Forces Diagram (Bob Moesta — Switch Analysis)
# ============================================================================

class ForceEntry(BaseModel):
    """Single force with score and evidence."""
    score: int = Field(ge=1, le=10, description="Siła efektu (1=słaby, 10=bardzo silny)")
    evidence: List[str] = Field(
        min_items=1,
        description="Cytaty z wywiadów dokumentujące tę siłę. Każdy cytat = konkretny respondent."
    )

class ForcesDiagram(BaseModel):
    """
    Forces Diagram analysis (Bob Moesta — Demand-Side Sales).

    Predyktuje czy użytkownik zmieni rozwiązanie:
    Switch zachodzi gdy (push + pull) > (anxiety + habit)

    BLOKUJE GO jeśli anxiety+habit > push+pull bez planu mitygacji.
    """

    push: ForceEntry = Field(
        description="Co wypycha użytkownika z obecnego rozwiązania? Frustracja, straty, eskalacja problemu."
    )
    pull: ForceEntry = Field(
        description="Co przyciąga do nowego rozwiązania? Konkretna wartość, nie ogólne 'byłoby lepiej'."
    )
    anxiety: ForceEntry = Field(
        description="Co powstrzymuje przed zmianą? Ryzyko danych, compliance, nauki, integracji."
    )
    habit: ForceEntry = Field(
        description="Siła przyzwyczajenia: sunk cost, muscle memory, ecosystem lock-in, switching cost."
    )

    trigger_event: Optional[str] = Field(
        None,
        description="Co sprawiło że użytkownik szuka TERAZ? Konkretne zdarzenie które zmieniło balans."
    )

    mitigation_plan: Optional[str] = Field(
        None,
        description="Jak zmniejszyć Anxiety lub Habit? Wymagane jeśli (anxiety+habit) > (push+pull)."
    )

    @property
    def switch_likelihood(self) -> str:
        pro = self.push.score + self.pull.score
        con = self.anxiety.score + self.habit.score
        delta = pro - con
        if delta >= 4:
            return "HIGH"
        elif delta >= 0:
            return "MEDIUM"
        else:
            return "LOW"

    @model_validator(mode='after')
    def validate_switch_balance(self):
        pro = self.push.score + self.pull.score
        con = self.anxiety.score + self.habit.score
        if con > pro and not self.mitigation_plan:
            raise ValueError(
                f"Anxiety+Habit ({con}) > Push+Pull ({pro}): "
                "Użytkownik nie zmieni rozwiązania. Wymagany mitigation_plan — "
                "jak obniżyć anxiety lub habit przed launch?"
            )
        return self


# ============================================================================
# Synthetic User Profile
# ============================================================================

class SyntheticUserProfile(BaseModel):
    """
    Psychologiczny profil syntetycznego użytkownika.

    Używany do symulacji wywiadów PRZED rozmowami z prawdziwymi ludźmi.
    Opiera się na archetypach psychologicznych, nie tylko demografii.
    """

    archetype_name: str = Field(
        description="Imię i opis archetypu np. 'Overwhelmed Marta — freelancer UX'"
    )

    demographics: str = Field(
        description="Wiek, rola, narzędzia, dochód, kontekst zawodowy"
    )

    psychology: str = Field(
        description="Big Five traits, motywacje, lęki, mechanizmy radzenia sobie ze stresem"
    )

    jtbd_hypothesis: str = Field(
        description="Hipoteza JTBD dla tego archetypu: functional + emotional + social job"
    )

    forces_hypothesis: str = Field(
        description="Hipoteza Forces Diagram: co jest push/pull/anxiety/habit dla tego archetypu"
    )

    expected_interview_behaviors: List[str] = Field(
        min_items=2,
        description="Jak ten archetyp zachowa się w wywiadzie? Kiedy będzie grzecznościowy vs. szczery?"
    )

    hypotheses_to_test: List[str] = Field(
        min_items=2,
        description="Konkretne hipotezy do sprawdzenia podczas wywiadu z tym archetypem"
    )

    red_flags_expected: List[str] = Field(
        min_items=1,
        description="Jakich red flags spodziewamy się od tego archetypu? (np. zbyt optymistyczne odpowiedzi)"
    )


class SyntheticUserResponse(BaseModel):
    """Odpowiedź syntetycznego użytkownika na pytanie interviewera."""

    question_asked: str
    response: str = Field(description="Odpowiedź w pierwszej osobie jako ten użytkownik")
    response_quality: Literal["genuine", "polite_lie", "vague", "detailed"] = Field(
        description="Jakość odpowiedzi — czy jest szczera czy 'grzecznościowa'?"
    )
    hidden_thought: str = Field(
        description="Co ten użytkownik NAPRAWDĘ myśli, ale nie powiedział wprost"
    )
    follow_up_suggested: str = Field(
        description="Jakie pytanie follow-up wyciągnie głębszą prawdę?"
    )


class SyntheticUserProfileList(BaseModel):
    """
    Wrapper dla listy 4 archetypów rynkowych.

    Użyty zamiast surowego List[SyntheticUserProfile] jako output_type agenta,
    ponieważ pydantic-ai lepiej waliduje nazwany obiekt niż surową listę.
    """
    profiles: List[SyntheticUserProfile] = Field(
        min_length=1,
        description="Lista 4 archetypów rynkowych (Value Seeker, Treatonomics, AI Buyer, Creator)"
    )


# ============================================================================
# Discovery Quality Score (DQS)
# ============================================================================

class DiscoveryQualityScore(BaseModel):
    """
    Discovery Quality Score (0-100) — ocena jakości przeprowadzonej sesji discovery.

    Zastępuje prosty 'confidence %' pełnym, wielowymiarowym scorecardem.
    """

    evidence_depth_score: int = Field(
        ge=0, le=25,
        description="Głębokość dowodów: Level 0-1=0-5, Level 2=10, Level 3=18, Level 4-5=25"
    )

    interview_quality_score: int = Field(
        ge=0, le=25,
        description="Liczba i różnorodność respondentów: 1-2=5, 3-5=12, 6-10=18, >10=25"
    )

    forces_completeness_score: int = Field(
        ge=0, le=25,
        description="Udokumentowanie 4 sił: 0 sił=0, 1-2=8, 3=15, wszystkie 4 z cytatami=25"
    )

    assumption_risk_score: int = Field(
        ge=0, le=25,
        description="Ryzyko nietestedowanych założeń: >3 FATAL=0, 1-2=10, 0 FATAL=25"
    )

    @property
    def total(self) -> int:
        return (self.evidence_depth_score + self.interview_quality_score +
                self.forces_completeness_score + self.assumption_risk_score)

    @property
    def verdict(self) -> str:
        t = self.total
        if t >= 70:
            return "HIGH_CONFIDENCE_GO"
        elif t >= 50:
            return "CAUTIOUS_GO"
        elif t >= 30:
            return "NEEDS_MORE_DATA"
        else:
            return "RESET_DISCOVERY"

    @property
    def verdict_label(self) -> str:
        labels = {
            "HIGH_CONFIDENCE_GO": "✅ GO (wysokie zaufanie)",
            "CAUTIOUS_GO": "⚠️ Ostrożne GO (monitoruj założenia)",
            "NEEDS_MORE_DATA": "🔍 Potrzeba więcej danych",
            "RESET_DISCOVERY": "❌ Reset Discovery",
        }
        return labels[self.verdict]


# ============================================================================
# Unified Business Analysis Result (Multi-Method)
# ============================================================================

class BusinessAnalysisResult(BaseModel):
    """
    Unified result supporting multiple analysis methods.

    Business Analyst can use:
    - JTBD (most common)
    - PMF Assessment (for existing products)
    - Opportunity Trees (for exploration phase)
    """

    method_used: Literal["JTBD", "PMF_Assessment", "Opportunity_Tree"] = Field(
        description="Which analysis method was used"
    )

    jtbd_analysis: Optional[JTBDAnalysisResult] = Field(
        None,
        description="Populated if method_used == 'JTBD'"
    )

    pmf_assessment: Optional[PMFAssessment] = Field(
        None,
        description="Populated if method_used == 'PMF_Assessment'"
    )

    opportunity_tree: Optional[OpportunitySolutionTree] = Field(
        None,
        description="Populated if method_used == 'Opportunity_Tree'"
    )

    @model_validator(mode='after')
    def validate_method_data_consistency(self):
        """Ensure the correct field is populated based on method_used."""
        if self.method_used == "JTBD" and self.jtbd_analysis is None:
            raise ValueError("method_used='JTBD' but jtbd_analysis is None")
        if self.method_used == "PMF_Assessment" and self.pmf_assessment is None:
            raise ValueError("method_used='PMF_Assessment' but pmf_assessment is None")
        if self.method_used == "Opportunity_Tree" and self.opportunity_tree is None:
            raise ValueError("method_used='Opportunity_Tree' but opportunity_tree is None")
        return self


# ============================================================================
# Interview Coach Schemas
# ============================================================================

class QuestionPerformance(BaseModel):
    """Ocena skuteczności pojedynczego pytania z wywiadu."""

    question_id: str = Field(
        description="ID pytania z banku np. 'P7', 'P12', lub 'CUSTOM' dla nowych"
    )
    question_text: str = Field(
        description="Pełna treść pytania"
    )
    observed_quality: Literal["genuine", "detailed", "polite_lie", "vague", "not_tested"] = Field(
        description="Zaobserwowana jakość odpowiedzi (genuine/detailed = działa, polite_lie/vague = nie działa)"
    )
    why: str = Field(
        description="Dlaczego pytanie zadziałało lub nie — analiza psychologiczna (social desirability, cognitive load, framing)"
    )
    improved_variants: List[str] = Field(
        default_factory=list,
        description="2-3 ulepszone warianty pytania (tylko gdy recommendation != 'keep')"
    )
    recommendation: Literal["keep", "improve", "replace", "remove"] = Field(
        description="keep=zostaw bez zmian, improve=ulepsz warianty, replace=zamień, remove=usuń z playbooka"
    )


class ArchetypeAccuracy(BaseModel):
    """Porównanie synthetic predictions z rzeczywistymi odpowiedziami."""

    archetype_name: str = Field(
        description="Nazwa archetypu (Value Seeker / Treatonomics / AI Buyer / Creator)"
    )
    predicted_behaviors: List[str] = Field(
        description="Zachowania przewidziane przez synthetic interview"
    )
    observed_behaviors: List[str] = Field(
        description="Rzeczywiste zachowania zaobserwowane w wywiadzie"
    )
    accuracy_pct: int = Field(
        ge=0, le=100,
        description="Szacunkowa dokładność przewidywań (0-100%)"
    )
    key_surprise: str = Field(
        description="Największa niespodzianka — co synthetic NIE przewidział, a pojawiło się w realu"
    )
    updated_hypothesis: str = Field(
        description="Zaktualizowana hipoteza dla tego archetypu na podstawie real data"
    )


class InterviewImprovementReport(BaseModel):
    """
    Raport Interview Coach — analizuje sesję wywiadów i generuje ulepszenia.

    Zamknięcie pętli: synthetic → real → improved synthetic.
    Zapisywany do projects/<name>/INTERVIEW_COACH_REPORT.md.

    Schemat celowo flat (bez zagnieżdżonych modeli) — niezawodna walidacja pydantic-ai.
    """

    session_type: str = Field(
        description="Typ sesji: synthetic_only | real_only | real_with_synthetic_baseline"
    )
    session_summary: str = Field(
        description="Krótkie podsumowanie sesji — co odkryliśmy, jakie były główne wątki"
    )
    questions_analysis: str = Field(
        description=(
            "Analiza każdego pytania w formacie Markdown. Dla każdego: "
            "[PID] 💎/✅/⚠️/🚩 KEEP/IMPROVE/REPLACE/REMOVE — dlaczego — warianty ulepszone"
        )
    )
    top_3_to_keep: List[str] = Field(
        default_factory=list,
        description="3 ID pytań które zawsze dają genuine/detailed (np. ['P7', 'P8', 'P12'])"
    )
    top_3_to_retire: List[str] = Field(
        default_factory=list,
        description="3 ID pytań do wycofania bo wywołują polite_lie (np. ['P1', 'P4'])"
    )
    new_questions_for_next_session: List[str] = Field(
        default_factory=list,
        description="2-4 nowe pytania do wypróbowania (pełna treść, gotowa do zadania)"
    )
    archetype_notes: str = Field(
        default="",
        description="Notatki o archetypach: co synthetic przewidział trafnie, co zaskoczyło (gdy baseline dostępny)"
    )
    kb_additions: str = Field(
        default="",
        description="Gotowy fragment Markdown do dołączenia do interview_question_bank.md — lekcje z tej sesji"
    )
    next_session_guidance: str = Field(
        default="",
        description="Konkretne wskazówki: od czego zacząć, na czym się skupić, czego unikać"
    )
