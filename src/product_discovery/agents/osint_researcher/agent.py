"""
OSINT Researcher Agent — pydantic_ai.Agent z wieloma źródłami danych.

Jeden agent, wiele źródeł: Perplexity AI, DuckDuckGo + Trafilatura,
HackerNews community intelligence, GitHub tech validation.

Import:
    from product_discovery.agents.osint_researcher.agent import osint_researcher_agent
"""

import os
from pathlib import Path

from pydantic_ai import Agent, RunContext
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

_AGENT_DIR = Path(__file__).parent
_REPO_ROOT = _AGENT_DIR.parent.parent.parent.parent
_AGENT_MD_PATH = _AGENT_DIR / "AGENT.md"

if _AGENT_MD_PATH.exists():
    _system_prompt = _AGENT_MD_PATH.read_text(encoding="utf-8")
else:
    _system_prompt = """You are an expert OSINT Researcher specializing in competitive intelligence,
market analysis, and technology validation. You use multiple data sources to build comprehensive
competitive reports with citations and evidence."""

_model = AnthropicModel(
    "claude-3-haiku-20240307",
    provider=AnthropicProvider(
        api_key=os.getenv("ANTHROPIC_API_KEY", "placeholder-for-import-check")
    ),
)

osint_researcher_agent = Agent(
    _model,
    output_type=str,
    system_prompt=_system_prompt,
)


@osint_researcher_agent.tool_plain
def get_lessons() -> str:
    """Pobierz LESSONS.md — udokumentowane błędy research z poprzednich projektów."""
    for candidate in [
        _REPO_ROOT / "LESSONS.md",
        _REPO_ROOT / "knowledge_base" / "lessons_learned.md",
    ]:
        if candidate.exists():
            return candidate.read_text(encoding="utf-8")
    return "[Brak pliku LESSONS.md]"


@osint_researcher_agent.tool
async def perplexity_competitive(ctx: RunContext[None], query: str) -> str:
    """
    Perplexity AI — competitive intelligence z cytowaniami i real-time web search.
    PRIMARY TOOL — używaj jako pierwszy dla competitive analysis.
    """
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        return "PERPLEXITY_API_KEY not set — use deep_web_research instead"
    try:
        from product_discovery.tools.research import PerplexityResearch
        pr = PerplexityResearch(api_key=api_key)
        result = pr.research(query, agent="osint_researcher")
        return pr.format_for_agent(result)
    except ImportError:
        return f"Perplexity tool not available — use deep_web_research as fallback"
    except Exception as e:
        return f"Perplexity error: {e} — use deep_web_research as fallback"


@osint_researcher_agent.tool
async def deep_web_research(ctx: RunContext[None], query: str) -> str:
    """DuckDuckGo + Trafilatura — darmowy research bez API key."""
    try:
        from product_discovery.tools.web_research import WebResearch
        wr = WebResearch()
        result = wr.research(query, agent="osint_researcher")
        return wr.format_for_agent(result)
    except ImportError:
        return "[Web research tool not installed — pip install duckduckgo-search trafilatura]"
    except Exception as e:
        return f"Web research error: {e}"
