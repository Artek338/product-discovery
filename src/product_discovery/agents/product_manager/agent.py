"""
Product Manager Agent — pydantic_ai.Agent z tools dla priorytetyzacji i decyzji.

Import:
    from product_discovery.agents.product_manager.agent import pm_agent
"""

import os
from pathlib import Path

from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from .schemas import ProductManagerResult


# ============================================================================
# PATHS
# ============================================================================

_AGENT_DIR = Path(__file__).parent
_REPO_ROOT = _AGENT_DIR.parent.parent.parent.parent
_FRAMEWORKS_DIR = _AGENT_DIR / "frameworks"
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"


# ============================================================================
# SYSTEM PROMPT — loaded from AGENT.md
# ============================================================================

if _AGENT_MD_PATH.exists() and _AGENT_MD_PATH.stat().st_size > 10:
    _SYSTEM_PROMPT = _AGENT_MD_PATH.read_text(encoding="utf-8")
else:
    _SYSTEM_PROMPT = """
Jesteś doświadczonym Product Managerem z 10-letnim doświadczeniem w produktach cyfrowych.

Twoja specjalność: podejmowanie trudnych decyzji produktowych w oparciu o dane, a nie opinie.
Każda decyzja GO wymaga uzasadnienia. Mówisz NIE gdy trzeba. Chronisz scope.

## TWOJE GŁÓWNE RAMY ANALITYCZNE

### 1. RICE (Reach × Impact × Confidence / Effort)
Używaj gdy: priorytetyzujesz listę featury lub porównujesz opcje.

### 2. LNO (Leverage / Neutral / Overhead) — Shreyas Doshi
Używaj gdy: klasyfikujesz zadania pod kątem ROI czasu i energii.

### 3. Analiza Decyzyjna (Po Co / Dla Kogo / Co Się Stanie / Ile Kosztuje)
Używaj gdy: ktoś proponuje nową featurę lub zmianę scope.

### 4. Feature Creep Check
Używaj gdy: coś jest proponowane MID-TASK lub nie wynika z celów.

### 5. Pre-Mortem / DHM (Gibson Biddle)
Używaj gdy: zaczynasz nowy projekt lub oceniasz strategię produktu.

## ZASADY BEZWZGLĘDNE
- Nie mów "to dobry pomysł" bez RICE lub DecisionAnalysis
- GO = Reach > 0 + konkretny impact + confidence ≥ 80%
- REJECT = P3 zawsze
- Feature creep → BACKLOG, nie teraz
"""


# ============================================================================
# MODEL & AGENT
# ============================================================================

_model = AnthropicModel(
    "claude-sonnet-4-6",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    ),
)

pm_agent = Agent(
    _model,
    output_type=ProductManagerResult,
    system_prompt=_SYSTEM_PROMPT,
)


# ============================================================================
# TOOLS
# ============================================================================

@pm_agent.tool_plain
def get_lessons() -> str:
    """Pobierz LESSONS.md — udokumentowane błędy i wzorce z poprzednich projektów."""
    for candidate in [_REPO_ROOT / "LESSONS.md", _REPO_ROOT / "knowledge_base" / "lessons_learned.md"]:
        if candidate.exists():
            return candidate.read_text(encoding="utf-8")
    return "[Brak pliku LESSONS.md]"


def _read_framework(name: str) -> str:
    path = _FRAMEWORKS_DIR / name
    if path.exists():
        return path.read_text(encoding="utf-8")
    return f"[Brak pliku {name}]"


@pm_agent.tool_plain
def get_rice_framework() -> str:
    """Pobierz RICE framework — (Reach × Impact × Confidence) / Effort."""
    return _read_framework("rice_prioritization.md")


@pm_agent.tool_plain
def get_lno_framework() -> str:
    """Pobierz LNO framework (Shreyas Doshi) — Leverage / Neutral / Overhead."""
    return _read_framework("lno_framework.md")


@pm_agent.tool_plain
def get_dhm_strategy() -> str:
    """Pobierz DHM Model (Gibson Biddle) — Delight / Hard-to-copy / Margin."""
    return _read_framework("dhm_product_strategy.md")


@pm_agent.tool_plain
def get_pre_mortem_framework() -> str:
    """Pobierz Pre-Mortem framework — Tigers vs Paper Tigers."""
    return _read_framework("pre_mortem.md")


@pm_agent.tool_plain
def get_expected_value_framework() -> str:
    """Pobierz Expected Value decision framework."""
    return _read_framework("expected_value_decision.md")


@pm_agent.tool_plain
def get_okr_framework() -> str:
    """Pobierz OKR framework — Objectives & Key Results."""
    return _read_framework("okr_framework.md")


@pm_agent.tool_plain
def get_playing_to_win() -> str:
    """Pobierz Playing to Win framework (Roger Martin)."""
    return _read_framework("playing_to_win.md")


@pm_agent.tool_plain
def get_retention_loops() -> str:
    """Pobierz Retention Loops framework — budowanie nawyków."""
    return _read_framework("retention_loops.md")
