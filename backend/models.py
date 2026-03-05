"""
Pydantic API schemas — request/response dla FastAPI endpoints.
Oddzielone od wewnętrznych schemas product_discovery aby nie tworzyć zależności.
"""
from pydantic import BaseModel
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
