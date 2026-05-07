"""
Pydantic API schemas - request/response dla FastAPI endpoints.
Oddzielone od wewnetrznych schemas product_discovery aby nie tworzyc zaleznosci.
"""
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List, Literal


# ============================================================================
# Discovery
# ============================================================================

class DiscoveryRunRequest(BaseModel):
    idea: str
    project_name: str
    mode: Literal["auto", "problem", "solution"] = "auto"
    interview_notes: Optional[str] = None


class DiscoveryRunResponse(BaseModel):
    session_id: str
    status: str = "queued"


class DiscoveryStatusResponse(BaseModel):
    session_id: str
    status: str
    progress: int
    current_node: Optional[str]
    logs: List[str]


class JTBDResult(BaseModel):
    functional_job: str
    emotional_job: str
    social_job: str
    competing_solutions: List[str]
    verdict: str
    evidence_level: str
    confidence: int
    reasoning: Optional[str] = None


class ScorecardResult(BaseModel):
    hours_invested: float
    evidence_level_achieved: str
    confidence_before: int
    confidence_after: int
    roi_estimate: str


class DiscoveryResultResponse(BaseModel):
    session_id: str
    project_name: str
    status: str
    jtbd: Optional[JTBDResult] = None
    scorecard: Optional[ScorecardResult] = None
    competitive_report: str = ""
    forces_report: str = ""
    assumption_map: str = ""
    synthetic_archetypes: str = ""
    interview_insights: List[str] = []
    interview_notes: str = ""
    duration_hours: float = 0.0


# ============================================================================
# Simulator
# ============================================================================

class ArchetypesRequest(BaseModel):
    segment: str
    count: int = 4
    market_type: str = "Mixed"  # B2C | B2B | SaaS | Enterprise | Mixed


class SyntheticProfileResponse(BaseModel):
    archetype_name: str
    demographics: str
    psychology: str
    jtbd_hypothesis: str
    forces_hypothesis: str
    expected_interview_behaviors: List[str]
    hypotheses_to_test: List[str]
    red_flags_expected: List[str]


class SimulatorQuestionRequest(BaseModel):
    archetype: SyntheticProfileResponse
    question: str
    history: Optional[str] = ""


class SimulatorAnswerResponse(BaseModel):
    question_asked: str
    response: str
    response_quality: str
    hidden_thought: str
    follow_up_suggested: str


# ============================================================================
# Projects list
# ============================================================================

class ProjectSummary(BaseModel):
    session_id: str
    project_name: str
    mode: str
    status: str
    verdict: Optional[str] = None
    confidence: Optional[int] = None
    evidence_level: Optional[str] = None
    created_at: str


# ============================================================================
# Batch Interview Runner
# ============================================================================


class BatchMode(str, Enum):
    DISCOVERY = "discovery"
    FORCES = "forces"
    WTP = "wtp"
    STORY = "story"
    HYPOTHESIS = "hypothesis"


class BatchQuestion(BaseModel):
    id: str                          # P7, P13, CUSTOM_1 etc.
    text: str
    category: str                    # etap wywiadu lub "custom"
    forces_dimension: Optional[str] = None  # push|pull|anxiety|habit|economics|anti_bs|social
    evidence_level_target: str = "2_Past_Behavior"
    hypothesis_id: Optional[str] = None


class Hypothesis(BaseModel):
    id: str
    text: str
    status: str = "pending"          # pending|validated|invalidated|inconclusive
    evidence_quotes: List[str] = []
    confidence: int = 0


class BatchCell(BaseModel):
    q_idx: int
    a_idx: int
    question_id: str
    archetype_name: str
    response: str
    response_quality: str            # genuine|detailed|polite_lie|vague
    hidden_thought: str
    follow_up_suggested: str
    round: int = 1
    follow_up_for: Optional[int] = None


class ForceSignal(BaseModel):
    score: int                       # 1-10
    evidence_quotes: List[str] = []


class ForcesPerArchetype(BaseModel):
    archetype_name: str
    push: ForceSignal
    pull: ForceSignal
    anxiety: ForceSignal
    habit: ForceSignal
    switch_likelihood: str           # HIGH|MEDIUM|LOW
    trigger_event: Optional[str] = None


class ConsensusSignal(BaseModel):
    topic: str
    agreement_level: str             # strong|moderate|weak
    evidence_quotes: List[str] = []
    archetypes_count: int
    forces_dimension: Optional[str] = None


class DivergenceAlert(BaseModel):
    topic: str
    segments: List[str]
    question_text: str
    segmentation_implication: str


class PainRanking(BaseModel):
    pain: str
    frequency: int
    archetypes_affected: List[str] = []
    evidence_level: str = "2_Past_Behavior"
    forces_dimension: str = "push"


class WTPSignal(BaseModel):
    archetype_name: str
    willing_to_pay: bool
    price_point: Optional[str] = None
    conditions: Optional[str] = None
    evidence_level: str = "1_Preference"
    van_westendorp: Optional[dict] = None


class QuestionEffectiveness(BaseModel):
    question_id: str
    question_text: str
    quality_distribution: dict       # {"genuine": 3, "detailed": 2, "vague": 1, "polite_lie": 0}
    signal_score: float              # 0-1
    recommendation: str              # keep|improve|replace
    improved_variant: Optional[str] = None
    forces_signal_strength: Optional[str] = None


class HypothesisResult(BaseModel):
    hypothesis_id: str
    hypothesis_text: str
    status: str                      # validated|invalidated|inconclusive
    confidence: int
    evidence_quotes: List[str] = []
    archetypes_validated: List[str] = []
    archetypes_invalidated: List[str] = []


class KeyQuotes(BaseModel):
    push: List[str] = []
    pull: List[str] = []
    anxiety: List[str] = []
    habit: List[str] = []
    surprising: List[str] = []


class BatchInsights(BaseModel):
    forces_per_archetype: List[ForcesPerArchetype] = []
    consensus_signals: List[ConsensusSignal] = []
    divergence_alerts: List[DivergenceAlert] = []
    pain_ranking: List[PainRanking] = []
    wtp_signals: List[WTPSignal] = []
    question_effectiveness: List[QuestionEffectiveness] = []
    hypothesis_results: Optional[List[HypothesisResult]] = None
    key_quotes: KeyQuotes = Field(default_factory=KeyQuotes)
    segmentation_hypothesis: Optional[str] = None
    recommended_next_questions: List[str] = []
    quality_score: int = 0
    quality_verdict: str = "NEEDS_MORE_DATA"
    executive_summary: str = ""


class BatchRunRequest(BaseModel):
    segment: str
    mode: BatchMode = BatchMode.DISCOVERY
    questions: List[BatchQuestion]
    archetypes: List[dict]
    hypotheses: Optional[List[Hypothesis]] = None
    multi_round: bool = False
    concurrency: int = Field(4, ge=1, le=8)
    product_context: Optional[str] = None
    language: str = "pl"


class BatchSessionSummary(BaseModel):
    session_id: str
    segment: str
    mode: str
    status: str
    questions_count: int
    archetypes_count: int
    quality_score: Optional[int] = None
    quality_verdict: Optional[str] = None
    created_at: str
