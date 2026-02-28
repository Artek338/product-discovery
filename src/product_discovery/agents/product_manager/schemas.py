"""
Pydantic Schemas for Product Manager Agent

These schemas enforce structured output for:
- RICE scoring (feature prioritization)
- Decision analysis (Po Co, Dla Kogo, Co Się Stanie, Ile Kosztuje)
- LNO assessment (Leverage, Neutral, Overhead)
- Feature evaluation with GO/NO-GO verdicts

All schemas include business logic validation to ensure high-quality PM decisions.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, model_validator, field_validator
from datetime import datetime
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class ImpactLevel(str, Enum):
    """
    Impact levels for RICE scoring (Intercom framework).

    From RICE Prioritization:
    - MINIMAL (0.25): Barely noticeable improvement
    - LOW (0.5): Minor improvement for some users
    - MEDIUM (1.0): Moderate improvement for many users
    - HIGH (2.0): Significant improvement for most users
    - MASSIVE (3.0): Game-changing, transformative impact
    """
    MINIMAL = "0.25"
    LOW = "0.5"
    MEDIUM = "1.0"
    HIGH = "2.0"
    MASSIVE = "3.0"

    @property
    def numeric_value(self) -> float:
        """Convert enum to float for calculations."""
        return float(self.value)


class ConfidenceLevel(str, Enum):
    """
    Confidence levels for RICE scoring.

    - LOW (50%): Mostly assumptions, little data
    - MEDIUM (80%): Some research/data supporting
    - HIGH (100%): Strong data, validated with users
    """
    LOW = "50%"
    MEDIUM = "80%"
    HIGH = "100%"

    @property
    def numeric_value(self) -> float:
        """Convert enum to decimal for calculations (e.g., 80% → 0.8)."""
        return float(self.value.rstrip('%')) / 100


class PriorityLevel(str, Enum):
    """
    Priority levels (from Product Manager AGENT.md).

    - P0: Critical, do NOW (blocks core functionality or high-value users)
    - P1: Important, do soon (significant value, planned for this cycle)
    - P2: Nice-to-have, do eventually (low urgency, backlog)
    - P3: Won't do (YAGNI, not aligned with goals, rejected)
    """
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class DecisionVerdict(str, Enum):
    """
    Final decision on feature/task.

    - BUILD: Approved, add to roadmap
    - DEFER: Good idea, wrong timing (revisit later)
    - REJECT: Not aligned with goals, YAGNI
    """
    BUILD = "BUILD"
    DEFER = "DEFER"
    REJECT = "REJECT"


class LNOClassification(str, Enum):
    """
    LNO Framework (Shreyas Doshi).

    - LEVERAGE: 1% effort → 10% results (high ROI, do more)
    - NEUTRAL: 1% effort → 1% results (necessary maintenance)
    - OVERHEAD: 1% effort → 0.1% results (waste, minimize)
    """
    LEVERAGE = "LEVERAGE"
    NEUTRAL = "NEUTRAL"
    OVERHEAD = "OVERHEAD"


# ============================================================================
# Core Schemas
# ============================================================================

class RICEScore(BaseModel):
    """
    RICE Scoring for feature prioritization (Intercom framework).

    Formula: (Reach × Impact × Confidence) / Effort

    Higher RICE score = higher priority.
    """

    feature_name: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="Short, descriptive feature name (e.g., 'Email notifications for task updates')"
    )

    reach: int = Field(
        ...,
        ge=0,
        description="How many users will this impact per quarter? (number of users)"
    )

    impact: ImpactLevel = Field(
        ...,
        description="How much will this help each user? (0.25=Minimal → 3.0=Massive)"
    )

    confidence: ConfidenceLevel = Field(
        ...,
        description="How certain are we about Reach/Impact? (50%=Low → 100%=High)"
    )

    effort: float = Field(
        ...,
        gt=0,
        description="How much work in person-months? (e.g., 0.5 = 2 weeks, 2.0 = 2 months)"
    )

    rice_score: Optional[float] = Field(
        None,
        description="Calculated RICE score: (Reach × Impact × Confidence) / Effort"
    )

    priority: PriorityLevel = Field(
        ...,
        description="Priority level: P0 (now), P1 (soon), P2 (later), P3 (never)"
    )

    decision: DecisionVerdict = Field(
        ...,
        description="Final decision: BUILD, DEFER, or REJECT"
    )

    reasoning: str = Field(
        ...,
        min_length=20,
        max_length=500,
        description="Why this score/decision? (2-3 sentences explaining the prioritization)"
    )

    reach_source: Optional[str] = Field(
        None,
        description="Where did Reach number come from? (analytics, estimate, user interviews)"
    )

    calculated_at: datetime = Field(
        default_factory=datetime.now,
        description="When this RICE score was calculated"
    )

    @model_validator(mode='after')
    def calculate_rice_score(self):
        """Auto-calculate RICE score from inputs."""
        reach = self.reach
        impact = self.impact.numeric_value
        confidence = self.confidence.numeric_value
        effort = self.effort

        self.rice_score = (reach * impact * confidence) / effort
        return self

    @model_validator(mode='after')
    def validate_decision_consistency(self):
        """
        Validate that priority and decision are consistent with RICE score.

        Business rules:
        - High RICE score (>10) should not be P3 (rejected)
        - P0 features should generally have RICE > 5
        - REJECT verdict should be P3
        - BUILD verdict should be P0/P1/P2, not P3
        """
        if self.decision == DecisionVerdict.REJECT and self.priority != PriorityLevel.P3:
            raise ValueError(
                f"Inconsistent: decision=REJECT but priority={self.priority}. "
                f"REJECT features must be P3."
            )

        if self.decision == DecisionVerdict.BUILD and self.priority == PriorityLevel.P3:
            raise ValueError(
                f"Inconsistent: decision=BUILD but priority=P3. "
                f"Cannot BUILD a P3 feature (P3 = won't do)."
            )

        if self.rice_score and self.rice_score > 10 and self.priority == PriorityLevel.P3:
            raise ValueError(
                f"Inconsistent: RICE score is {self.rice_score:.1f} (high) but priority=P3. "
                f"High-scoring features should not be rejected without strong reasoning."
            )

        return self


class DecisionAnalysis(BaseModel):
    """
    Decision analysis framework (from Product Manager AGENT.md).

    Four Questions:
    1. Po Co? (What problem does this solve?)
    2. Dla Kogo? (Who benefits? How many?)
    3. Co Się Stanie? (What if we don't do it?)
    4. Ile Kosztuje? (Time/resources estimate)
    """

    feature_or_task: str = Field(
        ...,
        min_length=10,
        max_length=300,
        description="What are we deciding on? (feature, task, initiative)"
    )

    po_co: str = Field(
        ...,
        min_length=20,
        max_length=500,
        description="Po Co? What SPECIFIC problem does this solve? (not vague)"
    )

    dla_kogo: str = Field(
        ...,
        min_length=20,
        max_length=500,
        description="Dla Kogo? Who benefits? How many users? (percentage or count)"
    )

    co_sie_stanie: str = Field(
        ...,
        min_length=20,
        max_length=500,
        description="Co Się Stanie? What happens if we DON'T do this? (impact of not doing it)"
    )

    ile_kosztuje: str = Field(
        ...,
        min_length=10,
        max_length=300,
        description="Ile Kosztuje? Realistic time/resource estimate (person-weeks, person-months)"
    )

    decision: DecisionVerdict = Field(
        ...,
        description="Final decision: BUILD, DEFER, or REJECT"
    )

    priority: PriorityLevel = Field(
        ...,
        description="Priority level: P0 (now), P1 (soon), P2 (later), P3 (never)"
    )

    reasoning: str = Field(
        ...,
        min_length=30,
        max_length=500,
        description="Why this decision? (synthesize the 4 questions into a clear verdict)"
    )

    red_flags: Optional[List[str]] = Field(
        None,
        description="Any red flags detected? (e.g., 'everyone has this', 'might be useful')"
    )

    alternatives: Optional[List[str]] = Field(
        None,
        description="Simpler alternatives considered? (YAGNI check)"
    )

    analyzed_at: datetime = Field(
        default_factory=datetime.now,
        description="When this analysis was performed"
    )

    @model_validator(mode='after')
    def validate_decision_consistency(self):
        """Ensure decision and priority are consistent."""
        if self.decision == DecisionVerdict.REJECT and self.priority != PriorityLevel.P3:
            raise ValueError(
                f"Inconsistent: decision=REJECT but priority={self.priority}. "
                f"REJECT must be P3."
            )

        if self.decision == DecisionVerdict.BUILD and self.priority == PriorityLevel.P3:
            raise ValueError(
                f"Inconsistent: decision=BUILD but priority=P3. "
                f"Cannot BUILD a P3 feature."
            )

        return self


class LNOAssessment(BaseModel):
    """
    LNO Framework assessment (Shreyas Doshi).

    Classifies work as:
    - LEVERAGE: High ROI, do more of this
    - NEUTRAL: Necessary maintenance
    - OVERHEAD: Low ROI, minimize this
    """

    task_or_feature: str = Field(
        ...,
        min_length=10,
        max_length=300,
        description="What task/feature are we assessing?"
    )

    classification: LNOClassification = Field(
        ...,
        description="LNO classification: LEVERAGE, NEUTRAL, or OVERHEAD"
    )

    effort_estimate: str = Field(
        ...,
        min_length=5,
        max_length=100,
        description="How much effort? (e.g., '2 days', '1 week', '3 person-months')"
    )

    expected_impact: str = Field(
        ...,
        min_length=20,
        max_length=500,
        description="What impact do we expect? (specific outcomes, metrics)"
    )

    reasoning: str = Field(
        ...,
        min_length=30,
        max_length=500,
        description="Why this classification? (explain ROI thinking)"
    )

    recommendation: str = Field(
        ...,
        min_length=20,
        max_length=300,
        description="What should we do? (e.g., 'Do more', 'Automate', 'Eliminate')"
    )

    assessed_at: datetime = Field(
        default_factory=datetime.now,
        description="When this LNO assessment was performed"
    )

    @field_validator('reasoning')
    @classmethod
    def validate_reasoning_mentions_roi(cls, v: str) -> str:
        """Ensure reasoning discusses ROI (effort vs impact)."""
        if 'roi' not in v.lower() and 'effort' not in v.lower() and 'impact' not in v.lower():
            raise ValueError(
                "LNO reasoning must discuss ROI (effort vs impact relationship). "
                "Explain why this is LEVERAGE/NEUTRAL/OVERHEAD."
            )
        return v


class FeatureCreepCheck(BaseModel):
    """
    Feature creep detection (ADHD Focus Keeper from AGENT.md).

    Used when user wants to add something mid-task.
    """

    current_task: str = Field(
        ...,
        min_length=10,
        max_length=300,
        description="What is the CURRENT task in progress?"
    )

    proposed_addition: str = Field(
        ...,
        min_length=10,
        max_length=300,
        description="What does user want to ADD?"
    )

    is_necessary_for_current_task: bool = Field(
        ...,
        description="Is this NECESSARY for current task to work? (true/false)"
    )

    is_feature_creep: bool = Field(
        ...,
        description="Is this feature creep? (adds complexity without clear value)"
    )

    must_do_now: bool = Field(
        ...,
        description="Must this be done NOW? (or can it wait?)"
    )

    decision: Literal["FINISH_CURRENT_FIRST", "ADD_TO_BACKLOG", "OK_DO_NOW"] = Field(
        ...,
        description="What should user do? (finish current first / backlog / ok do now)"
    )

    reasoning: str = Field(
        ...,
        min_length=30,
        max_length=500,
        description="Why this decision? (explain focus/priority thinking)"
    )

    checked_at: datetime = Field(
        default_factory=datetime.now,
        description="When this feature creep check was performed"
    )

    @model_validator(mode='after')
    def validate_decision_logic(self):
        """
        Validate decision logic for feature creep check.

        Business rules:
        - If is_feature_creep=True and is_necessary_for_current_task=False → should not be OK_DO_NOW
        - If must_do_now=False → should be FINISH_CURRENT_FIRST or ADD_TO_BACKLOG
        """
        if self.is_feature_creep and not self.is_necessary_for_current_task and self.decision == "OK_DO_NOW":
            raise ValueError(
                "Inconsistent: is_feature_creep=True but decision=OK_DO_NOW. "
                "Feature creep should be ADD_TO_BACKLOG or FINISH_CURRENT_FIRST."
            )

        if not self.must_do_now and self.decision == "OK_DO_NOW":
            raise ValueError(
                "Inconsistent: must_do_now=False but decision=OK_DO_NOW. "
                "If not urgent, should be FINISH_CURRENT_FIRST or ADD_TO_BACKLOG."
            )

        return self


class ProductManagerResult(BaseModel):
    """
    Unified result for Product Manager agent.

    Can contain one of:
    - RICE scoring result
    - Decision analysis result
    - LNO assessment result
    - Feature creep check result
    """

    analysis_type: Literal["RICE", "DECISION", "LNO", "FEATURE_CREEP"] = Field(
        ...,
        description="Which analysis method was used?"
    )

    rice_score: Optional[RICEScore] = Field(
        None,
        description="RICE scoring result (if analysis_type=RICE)"
    )

    decision_analysis: Optional[DecisionAnalysis] = Field(
        None,
        description="Decision analysis result (if analysis_type=DECISION)"
    )

    lno_assessment: Optional[LNOAssessment] = Field(
        None,
        description="LNO assessment result (if analysis_type=LNO)"
    )

    feature_creep_check: Optional[FeatureCreepCheck] = Field(
        None,
        description="Feature creep check result (if analysis_type=FEATURE_CREEP)"
    )

    next_steps: List[str] = Field(
        ...,
        min_items=1,
        max_items=5,
        description="Concrete next steps for user (actionable, specific)"
    )

    @model_validator(mode='after')
    def validate_method_consistency(self):
        """Ensure only one analysis method is populated based on analysis_type."""
        if self.analysis_type == "RICE" and not self.rice_score:
            raise ValueError("analysis_type=RICE but rice_score is None")

        if self.analysis_type == "DECISION" and not self.decision_analysis:
            raise ValueError("analysis_type=DECISION but decision_analysis is None")

        if self.analysis_type == "LNO" and not self.lno_assessment:
            raise ValueError("analysis_type=LNO but lno_assessment is None")

        if self.analysis_type == "FEATURE_CREEP" and not self.feature_creep_check:
            raise ValueError("analysis_type=FEATURE_CREEP but feature_creep_check is None")

        return self
