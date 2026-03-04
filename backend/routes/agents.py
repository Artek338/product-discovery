"""
Agents route — zwraca rzeczywiste system prompty załadowane przez agentów.

GET /api/agents        → lista agentów z metadanymi i treścią AGENT.md
GET /api/agents/{id}   → szczegóły pojedynczego agenta
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

_AGENTS_DIR = Path(__file__).parent.parent.parent / "src" / "product_discovery" / "agents"

# Definicja agentów — kolejność odpowiada kolejności w pipeline
_AGENT_META = [
    {
        "id": "synthetic_user",
        "pipeline_id": "SyntheticInterviewNode",
        "step": 1,
        "total_steps": 8,
        "name": "Syntetyczne wywiady",
        "name_en": "Synthetic Interview Node",
        "icon": "🧑‍🤝‍🧑",
        "color": "#8B5CF6",
        "model": "claude-sonnet-4-6",
        "description": "Generuje 4 archetypy syntetycznych użytkowników (Value Seeker, Treatonomics Consumer, AI Power Buyer, Digital Creator) i symuluje wywiady badawcze przed prawdziwymi wywiadami.",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "business_analyst",
        "pipeline_id": "BehavioralInterviewNode",
        "step": 2,
        "total_steps": 8,
        "name": "Wywiady behawioralne",
        "name_en": "Behavioral Interview Node",
        "icon": "🧠",
        "color": "#3B82F6",
        "model": "claude-sonnet-4-6",
        "description": "Analizuje notatki z wywiadów pod kątem JTBD. Wyciąga sygnały behawioralne, kategoryzuje bóle, identyfikuje workaroundy i niezaspokojone potrzeby.",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "osint_researcher",
        "pipeline_id": "CompetitiveResearchNode",
        "step": 3,
        "total_steps": 8,
        "name": "Research konkurencji",
        "name_en": "Competitive Research Node",
        "icon": "🔍",
        "color": "#14B8A6",
        "model": "claude-haiku-4-5-20251001",
        "description": "OSINT-driven research rynku przez Perplexity AI i DuckDuckGo. Identyfikuje graczy, mapuje luki (whitespace) i analizuje alternatywne rozwiązania.",
        "automation_level": "partial",
        "status": "active",
    },
    {
        "id": "business_analyst",
        "pipeline_id": "EvidenceGradingNode",
        "step": 4,
        "total_steps": 8,
        "name": "Ocena dowodów",
        "name_en": "Evidence Grading Node",
        "icon": "⚖️",
        "color": "#F97316",
        "model": "claude-sonnet-4-6",
        "description": "Ocenia jakość zebranych dowodów według skali 0-5 (opinia → gotówka). Blokuje GO gdy evidence_grade < 2.",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "business_analyst",
        "pipeline_id": "ForcesDiagramNode",
        "step": 5,
        "total_steps": 8,
        "name": "Diagram sił rynkowych",
        "name_en": "Forces Diagram Node",
        "icon": "⚡",
        "color": "#EC4899",
        "model": "claude-sonnet-4-6",
        "description": "Buduje diagram Push/Pull/Anxiety/Habit (Bob Moesta). Klient zmieni narzędzie tylko gdy (Push+Pull) > (Anxiety+Habit).",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "business_analyst",
        "pipeline_id": "SynthesisNode",
        "step": 6,
        "total_steps": 8,
        "name": "Synteza JTBD",
        "name_en": "Synthesis Node",
        "icon": "🔗",
        "color": "#10B981",
        "model": "claude-sonnet-4-6",
        "description": "Syntetyzuje wszystkie dane w finalną strukturę JTBD i wydaje werdykt GO / NO_GO / PIVOT.",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "business_analyst",
        "pipeline_id": "AssumptionMapNode",
        "step": 7,
        "total_steps": 8,
        "name": "Mapa założeń",
        "name_en": "Assumption Map Node",
        "icon": "🗺️",
        "color": "#6366F1",
        "model": "claude-haiku-4-5-20251001",
        "description": "Tworzy mapę FATAL/HIGH/MEDIUM założeń (Continuous Discovery). Każde FATAL bez dowodu = bloker przed GO.",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "product_manager",
        "pipeline_id": "ScorecardNode",
        "step": 8,
        "total_steps": 8,
        "name": "Scorecard decyzyjny",
        "name_en": "Scorecard Node",
        "icon": "📊",
        "color": "#0D2535",
        "model": "claude-sonnet-4-6",
        "description": "Generuje finalny Scorecard z RICE score, evidence level, delta pewności i rekomendacją Proceed/Pivot/Kill.",
        "automation_level": "full",
        "status": "active",
    },
    {
        "id": "interview_coach",
        "pipeline_id": "InterviewCoachNode",
        "step": None,
        "total_steps": None,
        "name": "Interview Coach",
        "name_en": "Interview Coach",
        "icon": "🎓",
        "color": "#7C3AED",
        "model": "claude-sonnet-4-6",
        "description": "Analizuje sesje wywiadów (syntetyczne lub prawdziwe) i generuje ulepszenia pytań. Zamknięcie pętli: synthetic → real → improved.",
        "automation_level": "partial",
        "status": "active",
    },
]


def _read_agent_prompt(agent_id: str) -> dict:
    """Czyta AGENT.md dla danego agenta. Zwraca treść + metadane o źródle."""
    md_path = _AGENTS_DIR / agent_id / "AGENT.md"
    if md_path.exists() and md_path.stat().st_size > 10:
        content = md_path.read_text(encoding="utf-8")
        return {
            "prompt": content,
            "source": "AGENT.md",
            "path": str(md_path.relative_to(_AGENTS_DIR.parent.parent.parent)),
            "size_bytes": md_path.stat().st_size,
        }
    return {
        "prompt": f"[Brak pliku AGENT.md dla agenta '{agent_id}' — używany jest fallback inline]",
        "source": "inline_fallback",
        "path": None,
        "size_bytes": 0,
    }


@router.get("")
async def list_agents():
    """Zwraca listę wszystkich agentów z ich rzeczywistymi system promptami."""
    seen_ids: set[str] = set()
    result = []

    for meta in _AGENT_META:
        agent_id = meta["id"]
        pipeline_id = meta["pipeline_id"]
        unique_key = f"{pipeline_id}"

        if unique_key in seen_ids:
            continue
        seen_ids.add(unique_key)

        prompt_info = _read_agent_prompt(agent_id)

        result.append({
            **meta,
            **prompt_info,
        })

    return result


@router.get("/{pipeline_id}")
async def get_agent(pipeline_id: str):
    """Zwraca szczegóły pojedynczego agenta po pipeline_id."""
    for meta in _AGENT_META:
        if meta["pipeline_id"] == pipeline_id:
            prompt_info = _read_agent_prompt(meta["id"])
            return {**meta, **prompt_info}

    raise HTTPException(status_code=404, detail=f"Agent '{pipeline_id}' not found")
