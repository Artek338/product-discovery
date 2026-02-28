"""
Session Templates — pre-configured discovery workflows per use case.

Templates define: required steps, time estimate, pre-filled context, output expectations.
Each template maps to a real PM use case.
"""

import yaml
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


TEMPLATES_DIR = Path(__file__).parent / "definitions"


@dataclass
class SessionTemplate:
    """A discovery session template."""
    id: str
    name: str
    description: str
    use_case: str  # new_product, improvement, competitive_intel, recruitment, workshop
    estimated_minutes: int = 120
    required_steps: list[str] = field(default_factory=list)
    optional_steps: list[str] = field(default_factory=list)
    pre_filled: dict = field(default_factory=dict)
    output_format: str = "html"  # html, pdf, miro
    industry_required: bool = False
    time_boxed: bool = False

    def summary(self) -> str:
        icon = {
            "new_product": "🚀",
            "improvement": "🔧",
            "competitive_intel": "🕵️",
            "recruitment": "🎓",
            "workshop": "🧑‍🏫",
        }.get(self.use_case, "📋")
        steps = " → ".join(self.required_steps[:5])
        return (
            f"{icon} {self.name}\n"
            f"   {self.description}\n"
            f"   ⏱ {self.estimated_minutes} min | Steps: {steps}\n"
            f"   Output: {self.output_format}"
        )


# Built-in templates
BUILT_IN_TEMPLATES = {
    "new_product": SessionTemplate(
        id="new_product",
        name="New Product Discovery",
        description="Pełne discovery od JTBD po GO/NO-GO. Dla nowych produktów/usług.",
        use_case="new_product",
        estimated_minutes=180,
        required_steps=[
            "industry_context", "jtbd_analysis", "behavioral_interviews",
            "competitive_research", "forces_diagram", "assumption_mapping",
            "evidence_grading", "scorecard",
        ],
        optional_steps=["synthetic_users", "prd_generation", "miro_export"],
        output_format="html",
        industry_required=True,
    ),
    "improvement": SessionTemplate(
        id="improvement",
        name="Feature Improvement",
        description="Discovery dla usprawnień istniejącego produktu. Focus na metrykach i zachowaniach.",
        use_case="improvement",
        estimated_minutes=90,
        required_steps=[
            "industry_context", "jtbd_analysis", "behavioral_interviews",
            "assumption_mapping", "impact_effort", "evidence_grading",
        ],
        optional_steps=["competitive_research", "forces_diagram"],
        pre_filled={"evidence_threshold": "2_Past_Behavior"},
        output_format="html",
    ),
    "competitive_intel": SessionTemplate(
        id="competitive_intel",
        name="Competitive Intelligence",
        description="Analiza konkurencji z mapowaniem graczy, trendów i niszy.",
        use_case="competitive_intel",
        estimated_minutes=120,
        required_steps=[
            "industry_context", "competitive_research", "forces_diagram",
            "assumption_mapping",
        ],
        optional_steps=["behavioral_interviews", "jtbd_analysis"],
        output_format="html",
        industry_required=True,
    ),
    "recruitment": SessionTemplate(
        id="recruitment",
        name="Recruitment Task",
        description="Discovery jako zadanie rekrutacyjne. Time-boxed, portfolio-ready output.",
        use_case="recruitment",
        estimated_minutes=120,
        required_steps=[
            "jtbd_analysis", "behavioral_interviews",
            "competitive_research", "evidence_grading", "scorecard",
        ],
        optional_steps=["forces_diagram"],
        output_format="pdf",
        time_boxed=True,
    ),
    "workshop": SessionTemplate(
        id="workshop",
        name="Discovery Workshop",
        description="Facilitacja warsztatu z interesariuszami. Notatki → insighty → priorytetyzacja.",
        use_case="workshop",
        estimated_minutes=240,
        required_steps=[
            "industry_context", "import_interviews", "jtbd_analysis",
            "assumption_mapping", "impact_effort",
        ],
        optional_steps=["forces_diagram", "miro_export", "scorecard"],
        output_format="miro",
        industry_required=True,
    ),
}


def get_template(template_id: str) -> Optional[SessionTemplate]:
    """Get a built-in template by ID."""
    return BUILT_IN_TEMPLATES.get(template_id)


def list_templates() -> list[SessionTemplate]:
    """List all available templates."""
    return list(BUILT_IN_TEMPLATES.values())


def show_all_templates() -> str:
    """Human-readable listing of all templates."""
    lines = ["📋 Available Session Templates", "=" * 50, ""]
    for t in list_templates():
        lines.append(t.summary())
        lines.append("")
    return "\n".join(lines)
