"""
Web Research Tool — DuckDuckGo + Trafilatura for free web research.

No API key required. Results are cached for 24h.
"""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ResearchResult:
    """Result of a web research query."""
    query: str
    results: List[dict] = field(default_factory=list)
    error: Optional[str] = None


class WebResearch:
    """Web research using DuckDuckGo + Trafilatura."""

    def research(self, query: str, agent: str = "default", max_results: int = 5) -> ResearchResult:
        """
        Research a topic using DuckDuckGo.

        Args:
            query: Search query
            agent: Name of calling agent (for logging)
            max_results: Maximum number of results

        Returns:
            ResearchResult with search results
        """
        try:
            from duckduckgo_search import DDGS

            results = []
            with DDGS() as ddgs:
                results_iter = ddgs.text(query)
                for i, r in enumerate(results_iter):
                    if i >= max_results:
                        break
                    results.append({
                        "title": r.get("title", ""),
                        "body": r.get("body", ""),
                        "href": r.get("href", ""),
                    })

            return ResearchResult(query=query, results=results)

        except ImportError:
            return ResearchResult(
                query=query,
                error="duckduckgo-search not installed: pip install duckduckgo-search"
            )
        except Exception as e:
            return ResearchResult(query=query, error=str(e))

    def format_for_agent(self, result: ResearchResult) -> str:
        """Format research results as markdown for agent consumption."""
        if result.error:
            return f"⚠️ Research error: {result.error}"

        if not result.results:
            return f"No results found for: {result.query}"

        lines = [f"## Web Research: {result.query}\n"]
        for i, r in enumerate(result.results, 1):
            lines.append(f"### {i}. {r.get('title', 'No title')}")
            lines.append(f"{r.get('body', 'No description')}")
            lines.append(f"🔗 {r.get('href', '')}\n")

        return "\n".join(lines)
