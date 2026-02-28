"""
Industry Context Engine — persistent domain knowledge that grows across discovery sessions.

Each industry/domain has its own context file that accumulates insights:
- Market overview, key players, terminology, business models
- Regulations, user segments, trends, pain points
- Adjacent markets for cross-industry analogies

Context is auto-enriched after each discovery session and available to agents.
"""

import json
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class KeyPlayer:
    """A competitor or significant player in the industry."""
    name: str
    type: str = ""  # direct_competitor, indirect, adjacent, enabler
    strengths: list[str] = field(default_factory=list)
    weaknesses: list[str] = field(default_factory=list)
    url: str = ""
    notes: str = ""


@dataclass
class IndustryContext:
    """Persistent knowledge about a specific industry/domain."""
    slug: str  # fintech, edtech, healthtech, etc.
    display_name: str = ""

    # Core knowledge
    market_overview: str = ""
    market_size: str = ""
    growth_rate: str = ""
    key_players: list[KeyPlayer] = field(default_factory=list)
    terminology: list[str] = field(default_factory=list)
    business_models: list[str] = field(default_factory=list)
    regulations: list[str] = field(default_factory=list)
    user_segments: list[str] = field(default_factory=list)
    trends: list[str] = field(default_factory=list)
    pain_points: list[str] = field(default_factory=list)
    adjacent_markets: list[str] = field(default_factory=list)

    # Custom notes
    notes: str = ""

    # Meta
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    sessions_count: int = 0
    enrichment_log: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        return d

    @property
    def completeness(self) -> float:
        """Score 0-100 showing how much context we have."""
        fields = [
            self.market_overview, self.market_size, self.growth_rate,
        ]
        lists = [
            self.key_players, self.terminology, self.business_models,
            self.regulations, self.user_segments, self.trends,
            self.pain_points, self.adjacent_markets,
        ]
        filled_fields = sum(1 for f in fields if f)
        filled_lists = sum(1 for l in lists if len(l) > 0)
        total = len(fields) + len(lists)
        return round((filled_fields + filled_lists) / total * 100)

    def summary(self) -> str:
        """Human-readable summary."""
        lines = [
            f"🏭 Industry: {self.display_name or self.slug}",
            f"{'='*50}",
            f"Completeness: {self.completeness}%",
            f"Sessions: {self.sessions_count}",
            f"Last updated: {self.updated_at[:10]}",
            "",
        ]
        if self.market_overview:
            lines.append(f"📊 Market: {self.market_overview[:200]}")
        if self.market_size:
            lines.append(f"💰 Size: {self.market_size}")
        if self.growth_rate:
            lines.append(f"📈 Growth: {self.growth_rate}")
        if self.key_players:
            lines.append(f"🏢 Players: {', '.join(p.name for p in self.key_players[:5])}")
        if self.terminology:
            lines.append(f"📖 Terms: {', '.join(self.terminology[:8])}")
        if self.business_models:
            lines.append(f"💼 Models: {', '.join(self.business_models[:5])}")
        if self.regulations:
            lines.append(f"⚖️ Regulations: {', '.join(self.regulations[:5])}")
        if self.user_segments:
            lines.append(f"👥 Segments: {', '.join(self.user_segments[:5])}")
        if self.trends:
            lines.append(f"🔮 Trends: {', '.join(self.trends[:5])}")
        if self.pain_points:
            lines.append(f"😤 Pain points: {', '.join(self.pain_points[:5])}")
        if self.adjacent_markets:
            lines.append(f"🔗 Adjacent: {', '.join(self.adjacent_markets[:5])}")

        return "\n".join(lines)

    def to_agent_prompt(self) -> str:
        """Generate context snippet for AI agent system prompts."""
        parts = [f"## Industry Context: {self.display_name or self.slug}\n"]

        if self.market_overview:
            parts.append(f"**Market:** {self.market_overview}")
        if self.market_size:
            parts.append(f"**Size:** {self.market_size} | Growth: {self.growth_rate}")
        if self.key_players:
            players = ", ".join(f"{p.name} ({p.type})" for p in self.key_players[:8])
            parts.append(f"**Key players:** {players}")
        if self.terminology:
            parts.append(f"**Domain terms:** {', '.join(self.terminology[:10])}")
        if self.business_models:
            parts.append(f"**Business models:** {', '.join(self.business_models)}")
        if self.regulations:
            parts.append(f"**Regulations:** {', '.join(self.regulations)}")
        if self.user_segments:
            parts.append(f"**User segments:** {', '.join(self.user_segments)}")
        if self.trends:
            parts.append(f"**Trends:** {', '.join(self.trends)}")
        if self.pain_points:
            parts.append(f"**Known pain points:** {', '.join(self.pain_points)}")

        return "\n".join(parts)


class IndustryStore:
    """CRUD + persistence for industry contexts."""

    def __init__(self, base_dir: str = "industry_context"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def list(self) -> list[str]:
        """List all available industry slugs."""
        return sorted([
            d.name for d in self.base_dir.iterdir()
            if d.is_dir() and (d / "context.json").exists()
        ])

    def get(self, slug: str) -> Optional[IndustryContext]:
        """Load industry context by slug."""
        path = self.base_dir / slug / "context.json"
        if not path.exists():
            return None
        data = json.loads(path.read_text(encoding="utf-8"))
        return self._from_dict(data)

    def init(self, slug: str, display_name: str = "") -> IndustryContext:
        """Create a new empty industry context."""
        ctx = IndustryContext(
            slug=slug,
            display_name=display_name or slug.replace("-", " ").title(),
        )
        self.save(ctx)
        return ctx

    def save(self, ctx: IndustryContext) -> Path:
        """Persist context to JSON."""
        ctx.updated_at = datetime.now().isoformat()
        path = self.base_dir / ctx.slug
        path.mkdir(parents=True, exist_ok=True)
        out_file = path / "context.json"
        out_file.write_text(
            json.dumps(ctx.to_dict(), indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return out_file

    def delete(self, slug: str) -> bool:
        """Delete an industry context."""
        import shutil
        path = self.base_dir / slug
        if path.exists():
            shutil.rmtree(path)
            return True
        return False

    def enrich_from_discovery(self, slug: str, discovery_data: dict) -> IndustryContext:
        """Auto-enrich industry context from a completed discovery session."""
        ctx = self.get(slug)
        if not ctx:
            ctx = self.init(slug)

        # Extract competitors from competitive report
        comp_report = discovery_data.get("competitive_report", "")
        if comp_report:
            existing_names = {p.name.lower() for p in ctx.key_players}
            new_players = _extract_player_names(comp_report)
            for name in new_players:
                if name.lower() not in existing_names:
                    ctx.key_players.append(KeyPlayer(name=name, type="competitor"))

        # Extract pain points from interview insights
        for insight in discovery_data.get("interview_insights", []):
            if isinstance(insight, str) and len(insight) > 20:
                pain = insight[:100]
                if pain not in ctx.pain_points:
                    ctx.pain_points.append(pain)

        # Extract user segments from JTBD
        for key in ["functional_job", "emotional_job", "social_job"]:
            val = discovery_data.get(key, "")
            if val and len(val) > 10:
                _merge_unique(ctx.terminology, _extract_terms(val))

        # Log enrichment
        ctx.sessions_count += 1
        ctx.enrichment_log.append(
            f"{datetime.now().isoformat()}: enriched from discovery "
            f"(project: {discovery_data.get('project_name', 'unknown')})"
        )

        self.save(ctx)
        return ctx

    def enrich_from_text(self, slug: str, text: str, source: str = "manual") -> IndustryContext:
        """Enrich context from raw text (manual notes, research docs, etc.)."""
        ctx = self.get(slug)
        if not ctx:
            ctx = self.init(slug)

        # Append to notes
        ctx.notes += f"\n\n--- {source} ({datetime.now().strftime('%Y-%m-%d')}) ---\n{text}"

        # Auto-extract terms
        new_terms = _extract_terms(text)
        _merge_unique(ctx.terminology, new_terms)

        # Auto-extract trends (heuristic)
        trend_markers = ["trend", "growing", "emerging", "wzrost", "rosnący", "nowy"]
        for line in text.split("\n"):
            if any(m in line.lower() for m in trend_markers) and len(line) > 15:
                trend = line.strip()[:100]
                if trend not in ctx.trends:
                    ctx.trends.append(trend)

        ctx.enrichment_log.append(
            f"{datetime.now().isoformat()}: enriched from {source}"
        )

        self.save(ctx)
        return ctx

    def _from_dict(self, data: dict) -> IndustryContext:
        """Deserialize from dict."""
        players_data = data.pop("key_players", [])
        players = [KeyPlayer(**p) for p in players_data]
        ctx = IndustryContext(**{
            k: v for k, v in data.items()
            if k in IndustryContext.__dataclass_fields__
        })
        ctx.key_players = players
        return ctx


# --- Helpers ---

def _extract_player_names(text: str) -> list[str]:
    """Heuristic: extract capitalized entity names from competitive report."""
    # Match capitalized words that look like company names
    candidates = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', text)
    # Filter common words
    stopwords = {
        "The", "This", "That", "With", "From", "About", "After",
        "Before", "Between", "Under", "Over", "Into", "Through",
        "During", "Without", "Against", "Among", "Within",
    }
    return [c for c in candidates if c not in stopwords and len(c) > 2][:20]


def _extract_terms(text: str) -> list[str]:
    """Extract domain-specific terms (capitalized, acronyms, etc.)."""
    # Acronyms (2-6 uppercase letters)
    acronyms = re.findall(r'\b[A-Z]{2,6}\b', text)
    # Capitalized terms
    terms = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b', text)
    all_terms = list(set(acronyms + terms))
    return [t for t in all_terms if len(t) > 1][:30]


def _merge_unique(target: list, items: list) -> None:
    """Merge items into target list, avoiding duplicates (case-insensitive)."""
    existing = {x.lower() for x in target}
    for item in items:
        if item.lower() not in existing:
            target.append(item)
            existing.add(item.lower())
