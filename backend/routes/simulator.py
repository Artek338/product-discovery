"""
Simulator routes — generowanie archetypów i symulacja wywiadów.
"""
import json
from typing import AsyncGenerator, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.models import (
    ArchetypesRequest,
    SimulatorAnswerResponse,
    SimulatorQuestionRequest,
    SyntheticProfileResponse,
)

router = APIRouter()


@router.post("/archetypes", response_model=List[SyntheticProfileResponse])
async def generate_archetypes(request: ArchetypesRequest):
    """Generuje archetypy syntetycznych użytkowników dla podanego segmentu (batch)."""
    try:
        from product_discovery.agents.synthetic_user.agent import generate_archetypes as gen

        archetypes = await gen(
            product_segment=request.segment,
            count=request.count,
            market_type=request.market_type,
        )
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
        import logging
        logging.getLogger(__name__).exception("Błąd generowania archetypów")
        raise HTTPException(status_code=500, detail="Nie udało się wygenerować archetypów. Sprawdź klucz API i spróbuj ponownie.")


@router.post("/archetypes/stream")
async def generate_archetypes_sse(request: ArchetypesRequest):
    """Strumieniuje generowanie archetypów — wysyła SSE events (data: JSON\\n\\n)."""
    from product_discovery.agents.synthetic_user.agent import generate_archetypes_stream as gen_stream

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for event in gen_stream(
                product_segment=request.segment,
                count=request.count,
                market_type=request.market_type,
            ):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as exc:
            error_event = {"type": "error", "message": str(exc)}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


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
        import logging
        logging.getLogger(__name__).exception("Błąd symulacji odpowiedzi")
        raise HTTPException(status_code=500, detail="Nie udało się wygenerować odpowiedzi. Sprawdź klucz API i spróbuj ponownie.")
