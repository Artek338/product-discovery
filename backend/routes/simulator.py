"""
Simulator routes — generowanie archetypów i symulacja wywiadów.
"""
from typing import List

from fastapi import APIRouter, HTTPException

from backend.models import (
    ArchetypesRequest,
    SimulatorAnswerResponse,
    SimulatorQuestionRequest,
    SyntheticProfileResponse,
)

router = APIRouter()


@router.post("/archetypes", response_model=List[SyntheticProfileResponse])
async def generate_archetypes(request: ArchetypesRequest):
    """Generuje 4 archetypy syntetycznych użytkowników dla podanego segmentu."""
    try:
        from product_discovery.agents.synthetic_user.agent import generate_archetypes as gen

        archetypes = await gen(product_segment=request.segment)
        return [
            SyntheticProfileResponse(
                archetype_name=a.archetype_name,
                demographics=a.demographics,
                psychology=a.psychology,
                jtbd_hypothesis=a.jtbd_hypothesis,
                forces_hypothesis=a.forces_hypothesis,
                expected_interview_behaviors=a.expected_interview_behaviors,
                hypotheses_to_test=a.hypotheses_to_test,
                red_flags_expected=a.red_flags_expected,
            )
            for a in archetypes
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/question", response_model=SimulatorAnswerResponse)
async def ask_question(request: SimulatorQuestionRequest):
    """Symuluje odpowiedź archetypu na pytanie interviewera."""
    try:
        from product_discovery.agents.synthetic_user.agent import simulate_interview_response
        from product_discovery.agents.business_analyst.schemas import SyntheticUserProfile

        # Rekonstruuj SyntheticUserProfile z danych z requestu
        profile = SyntheticUserProfile(
            archetype_name=request.archetype.archetype_name,
            demographics=request.archetype.demographics,
            psychology=request.archetype.psychology,
            jtbd_hypothesis=request.archetype.jtbd_hypothesis,
            forces_hypothesis=request.archetype.forces_hypothesis,
            expected_interview_behaviors=request.archetype.expected_interview_behaviors,
            hypotheses_to_test=request.archetype.hypotheses_to_test,
            red_flags_expected=request.archetype.red_flags_expected,
        )

        response = await simulate_interview_response(
            archetype=profile,
            question=request.question,
            interview_history=request.history or "",
        )

        return SimulatorAnswerResponse(
            question_asked=response.question_asked,
            response=response.response,
            response_quality=response.response_quality,
            hidden_thought=response.hidden_thought,
            follow_up_suggested=response.follow_up_suggested,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
