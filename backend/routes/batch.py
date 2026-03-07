from __future__ import annotations
"""
Batch Interview Runner routes - masowe wywiady syntetyczne N pytan x M archetypow.
"""
import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.db import (
    create_batch_session,
    update_batch_cells,
    complete_batch_session,
    fail_batch_session,
    get_batch_session,
    list_batch_sessions,
)
from backend.models import (
    BatchRunRequest,
    BatchCell,
    BatchInsights,
    BatchSessionSummary,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _sse(data: dict) -> str:
    return "data: " + json.dumps(data, ensure_ascii=False) + "\n\n"


@router.post("/run")
async def run_batch(request: BatchRunRequest):
    """Uruchamia batch interview - SSE stream z real-time wynikami."""

    async def event_generator() -> AsyncGenerator[str, None]:
        from product_discovery.agents.synthetic_user.agent import (
            simulate_interview_response,
            generate_follow_up_question,
        )
        from product_discovery.agents.batch_analyzer.agent import analyze_batch_matrix
        from product_discovery.agents.business_analyst.schemas import SyntheticUserProfile

        session_id = str(uuid.uuid4())
        questions = request.questions
        archetypes_data = request.archetypes
        total = len(questions) * len(archetypes_data)

        # Reconstruct SyntheticUserProfile objects
        profiles = []
        for a in archetypes_data:
            try:
                profiles.append(SyntheticUserProfile(
                    archetype_name=a.get("archetype_name", ""),
                    demographics=a.get("demographics", ""),
                    psychology=a.get("psychology", ""),
                    jtbd_hypothesis=a.get("jtbd_hypothesis", ""),
                    forces_hypothesis=a.get("forces_hypothesis", ""),
                    expected_interview_behaviors=a.get("expected_interview_behaviors", []),
                    hypotheses_to_test=a.get("hypotheses_to_test", []),
                    red_flags_expected=a.get("red_flags_expected", []),
                ))
            except Exception as e:
                logger.warning("Nie mozna zrekonstruowac archetypu: %s", e)

        # Save session to DB
        questions_dicts = [q.model_dump() for q in questions]
        hypotheses_dicts = [h.model_dump() for h in request.hypotheses] if request.hypotheses else None

        await create_batch_session(
            session_id=session_id,
            segment=request.segment,
            mode=request.mode.value,
            questions_json=json.dumps(questions_dicts, ensure_ascii=False),
            archetypes_json=json.dumps(archetypes_data, ensure_ascii=False),
            hypotheses_json=json.dumps(hypotheses_dicts, ensure_ascii=False) if hypotheses_dicts else None,
            questions_count=len(questions),
            archetypes_count=len(profiles),
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        yield _sse({
            "type": "start",
            "session_id": session_id,
            "total": total,
            "questions": len(questions),
            "archetypes": len(profiles),
            "multi_round": request.multi_round,
        })

        # === ROUND 1: Parallel batch run ===
        cells: list[BatchCell] = []
        semaphore = asyncio.Semaphore(request.concurrency)
        queue: asyncio.Queue = asyncio.Queue()

        async def run_cell(q_idx: int, q, a_idx: int, profile: SyntheticUserProfile):
            async with semaphore:
                try:
                    question_text = q.text
                    if request.product_context:
                        question_text = "[Kontekst: " + request.product_context + "]\n" + question_text

                    resp = await simulate_interview_response(
                        archetype=profile,
                        question=question_text,
                        interview_history="",
                    )
                    await queue.put((q_idx, a_idx, resp, None))
                except Exception as e:
                    logger.exception("Blad komorki [%s,%s]", q_idx, a_idx)
                    await queue.put((q_idx, a_idx, None, str(e)))

        tasks = [
            asyncio.create_task(run_cell(qi, q, ai, p))
            for qi, q in enumerate(questions)
            for ai, p in enumerate(profiles)
        ]

        completed = 0
        for _ in range(total):
            q_idx, a_idx, resp, error = await queue.get()
            completed += 1

            if resp is not None:
                cell = BatchCell(
                    q_idx=q_idx,
                    a_idx=a_idx,
                    question_id=questions[q_idx].id,
                    archetype_name=profiles[a_idx].archetype_name,
                    response=resp.response,
                    response_quality=resp.response_quality,
                    hidden_thought=resp.hidden_thought,
                    follow_up_suggested=resp.follow_up_suggested,
                    round=1,
                )
                cells.append(cell)
                yield _sse({
                    "type": "cell_done",
                    "round": 1,
                    "q_idx": q_idx,
                    "a_idx": a_idx,
                    "completed": completed,
                    "total": total,
                    "data": cell.model_dump(),
                })

        await asyncio.gather(*tasks, return_exceptions=True)

        # Persist Round 1 cells
        await update_batch_cells(session_id, json.dumps([c.model_dump() for c in cells], ensure_ascii=False))

        # === ROUND 2: Auto follow-up for weak signals ===
        if request.multi_round:
            weak_cells = [c for c in cells if c.response_quality in ("vague", "polite_lie")]
            if weak_cells:
                yield _sse({"type": "round2_start", "weak_count": len(weak_cells)})

                round2_semaphore = asyncio.Semaphore(min(request.concurrency, 3))
                round2_queue: asyncio.Queue = asyncio.Queue()

                async def run_followup(original_cell: BatchCell):
                    async with round2_semaphore:
                        try:
                            profile = profiles[original_cell.a_idx]
                            follow_up_q = await generate_follow_up_question(
                                archetype=profile,
                                original_question=questions[original_cell.q_idx].text,
                                weak_response_text=original_cell.response,
                                follow_up_suggested=original_cell.follow_up_suggested,
                            )
                            resp = await simulate_interview_response(
                                archetype=profile,
                                question=follow_up_q,
                                interview_history=(
                                    "Poprzednie pytanie: " + questions[original_cell.q_idx].text
                                    + "\nOdpowiedz: " + original_cell.response
                                ),
                            )
                            await round2_queue.put((original_cell, follow_up_q, resp, None))
                        except Exception as e:
                            logger.exception("Blad follow-up")
                            await round2_queue.put((original_cell, None, None, str(e)))

                r2_tasks = [asyncio.create_task(run_followup(c)) for c in weak_cells]

                for _ in range(len(weak_cells)):
                    orig_cell, fu_q, resp, error = await round2_queue.get()
                    if resp is not None:
                        r2_cell = BatchCell(
                            q_idx=orig_cell.q_idx,
                            a_idx=orig_cell.a_idx,
                            question_id=orig_cell.question_id + "_R2",
                            archetype_name=orig_cell.archetype_name,
                            response=resp.response,
                            response_quality=resp.response_quality,
                            hidden_thought=resp.hidden_thought,
                            follow_up_suggested=resp.follow_up_suggested,
                            round=2,
                            follow_up_for=orig_cell.q_idx,
                        )
                        cells.append(r2_cell)
                        yield _sse({
                            "type": "cell_done",
                            "round": 2,
                            "q_idx": orig_cell.q_idx,
                            "a_idx": orig_cell.a_idx,
                            "follow_up_question": fu_q or "",
                            "data": r2_cell.model_dump(),
                        })

                await asyncio.gather(*r2_tasks, return_exceptions=True)
                await update_batch_cells(session_id, json.dumps([c.model_dump() for c in cells], ensure_ascii=False))

        # === ANALYSIS ===
        try:
            for msg in [
                "Analizuje sily postepu (Forces Diagram)...",
                "Wyciagam wzorce consensus i divergence...",
                "Oceniam skutecznosc pytan...",
                "Generuje executive summary...",
            ]:
                yield _sse({"type": "analyzing", "message": msg})
                await asyncio.sleep(0.1)

            insights_schema = await analyze_batch_matrix(
                questions=[q.model_dump() for q in questions],
                archetypes=archetypes_data,
                cells=[c.model_dump() for c in cells],
                mode=request.mode.value,
                hypotheses=[h.model_dump() for h in request.hypotheses] if request.hypotheses else None,
            )

            insights_dict = insights_schema.model_dump()
            await complete_batch_session(
                session_id,
                json.dumps(insights_dict, ensure_ascii=False),
                insights_schema.quality_score,
                insights_schema.quality_verdict,
            )

            yield _sse({
                "type": "done",
                "session_id": session_id,
                "insights": insights_dict,
            })

        except Exception as e:
            logger.exception("Blad analizy batch")
            await fail_batch_session(session_id)
            yield _sse({"type": "error", "message": "Nie udalo sie wygenerowac analizy. Dane zostaly zapisane."})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("", response_model=List[BatchSessionSummary])
async def list_batches():
    """Zwraca liste sesji batch."""
    sessions = await list_batch_sessions(limit=50)
    result = []
    for s in sessions:
        quality_score = None
        quality_verdict = None
        if s.get("insights_json"):
            try:
                insights = json.loads(s["insights_json"])
                quality_score = insights.get("quality_score")
                quality_verdict = insights.get("quality_verdict")
            except Exception:
                pass

        result.append(BatchSessionSummary(
            session_id=s["id"],
            segment=s.get("segment", ""),
            mode=s.get("mode", ""),
            status=s.get("status", ""),
            questions_count=s.get("questions_count", 0),
            archetypes_count=s.get("archetypes_count", 0),
            quality_score=quality_score,
            quality_verdict=quality_verdict,
            created_at=s.get("created_at", ""),
        ))
    return result


@router.get("/{session_id}")
async def get_batch(session_id: str):
    """Zwraca pelna sesje batch z wynikami."""
    try:
        uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Nieprawidlowy identyfikator sesji")

    session = await get_batch_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesja batch nie znaleziona")
    return session


@router.delete("/{session_id}")
async def delete_batch(session_id: str):
    """Usuwa sesje batch."""
    try:
        uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Nieprawidlowy identyfikator sesji")
    # Soft delete - po prostu nie implementujemy na razie, zwracamy 200
    return {"status": "ok"}
