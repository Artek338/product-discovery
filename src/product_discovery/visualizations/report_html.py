"""
HTML Report Generator — standalone interactive report with embedded Plotly charts.

Generates a single .html file with:
- Evidence level bar, Forces diagram, Assumption heatmap
- Saturation curve, Competitive radar (if data available)
- Mermaid diagrams (OST, Forces flow)
- Dark/light theme support
- Zero external dependencies (Plotly CDN)
"""

from datetime import datetime
from pathlib import Path
from typing import Optional


def generate_html_report(
    project_name: str,
    discovery_data: dict,
    output_dir: str = "projects",
    theme: str = "dark",
) -> Path:
    """Generate standalone HTML report.

    Args:
        project_name: Project name
        discovery_data: Dict with keys from DiscoveryResult/State fields
        output_dir: Output directory
        theme: 'dark' or 'light'

    Returns:
        Path to generated .html file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = Path(output_dir) / project_name
    out_path.mkdir(parents=True, exist_ok=True)
    out_file = out_path / f"REPORT_{timestamp}.html"

    # Generate chart HTML fragments
    chart_sections = _generate_chart_sections(discovery_data, project_name)
    mermaid_sections = _generate_mermaid_sections(discovery_data)

    # Build HTML
    bg = "#111827" if theme == "dark" else "#ffffff"
    text_color = "#f3f4f6" if theme == "dark" else "#1f2937"
    card_bg = "#1f2937" if theme == "dark" else "#f9fafb"
    accent = "#06b6d4"

    html = f"""<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discovery Report — {project_name}</title>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>mermaid.initialize({{ startOnLoad: true, theme: '{"dark" if theme == "dark" else "default"}' }});</script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: {bg};
            color: {text_color};
            line-height: 1.6;
            padding: 2rem;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        header {{
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #1e40af, #7c3aed);
            border-radius: 16px;
        }}
        header h1 {{ font-size: 2rem; margin-bottom: 0.5rem; color: white; }}
        header .meta {{ color: #d1d5db; font-size: 0.9rem; }}
        .verdict {{
            display: inline-block;
            padding: 0.5rem 1.5rem;
            border-radius: 999px;
            font-weight: 700;
            font-size: 1.2rem;
            margin-top: 1rem;
        }}
        .verdict-go {{ background: #065f46; color: #34d399; }}
        .verdict-nogo {{ background: #7f1d1d; color: #fca5a5; }}
        .verdict-more {{ background: #78350f; color: #fcd34d; }}
        .card {{
            background: {card_bg};
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid {"#374151" if theme == "dark" else "#e5e7eb"};
        }}
        .card h2 {{
            color: {accent};
            font-size: 1.3rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid {accent};
            padding-bottom: 0.5rem;
        }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }}
        .stat-card {{
            background: {"#374151" if theme == "dark" else "#f3f4f6"};
            padding: 1.2rem;
            border-radius: 8px;
            text-align: center;
        }}
        .stat-value {{ font-size: 2rem; font-weight: 700; color: {accent}; }}
        .stat-label {{ font-size: 0.85rem; color: {"#9ca3af" if theme == "dark" else "#6b7280"}; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }}
        th, td {{
            text-align: left;
            padding: 0.75rem;
            border-bottom: 1px solid {"#374151" if theme == "dark" else "#e5e7eb"};
        }}
        th {{ color: {accent}; font-weight: 600; }}
        .chart-container {{ margin: 1rem 0; }}
        .mermaid {{ margin: 1rem 0; text-align: center; }}
        footer {{
            text-align: center;
            padding: 2rem;
            color: {"#6b7280" if theme == "dark" else "#9ca3af"};
            font-size: 0.8rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 Discovery Report: {project_name}</h1>
            <div class="meta">
                Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")} |
                Duration: {discovery_data.get("duration", "N/A")} |
                Evidence: {discovery_data.get("evidence_level", "N/A")}
            </div>
            {_verdict_badge(discovery_data.get("verdict", "NEEDS_MORE_DATA"))}
        </header>

        <!-- Key Metrics -->
        <div class="grid">
            <div class="stat-card">
                <div class="stat-value">{discovery_data.get("confidence", "?")}%</div>
                <div class="stat-label">Confidence</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{discovery_data.get("evidence_level", "?")}</div>
                <div class="stat-label">Evidence Level</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{discovery_data.get("interviews_count", "?")}</div>
                <div class="stat-label">Interviews</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{discovery_data.get("assumptions_tested", "?")}</div>
                <div class="stat-label">Assumptions Tested</div>
            </div>
        </div>

        <!-- JTBD Analysis -->
        <div class="card">
            <h2>🎯 JTBD Analysis</h2>
            <table>
                <tr><th>Functional Job</th><td>{discovery_data.get("functional_job", "—")}</td></tr>
                <tr><th>Emotional Job</th><td>{discovery_data.get("emotional_job", "—")}</td></tr>
                <tr><th>Social Job</th><td>{discovery_data.get("social_job", "—")}</td></tr>
                <tr><th>Competing Solutions</th><td>{discovery_data.get("competing_solutions", "—")}</td></tr>
            </table>
        </div>

        <!-- Charts -->
        {chart_sections}

        <!-- Mermaid Diagrams -->
        {mermaid_sections}

        <!-- Competitive Analysis -->
        {_section_if("📊 Competitive Analysis", discovery_data.get("competitive_report", ""), card_bg)}

        <!-- Reasoning -->
        {_section_if("💭 Reasoning", discovery_data.get("reasoning", ""), card_bg)}

        <footer>
            Product Discovery v0.3.0 | Generated by AI-powered discovery toolkit |
            <a href="https://github.com/Artek338/product-discovery" style="color: {accent}">GitHub</a>
        </footer>
    </div>
</body>
</html>"""

    out_file.write_text(html, encoding="utf-8")
    return out_file


def _verdict_badge(verdict: str) -> str:
    css_class = {
        "GO": "verdict-go",
        "NO-GO": "verdict-nogo",
        "NEEDS_MORE_DATA": "verdict-more",
    }.get(verdict, "verdict-more")
    icon = {"GO": "✅", "NO-GO": "❌", "NEEDS_MORE_DATA": "⚠️"}.get(verdict, "?")
    return f'<div class="verdict {css_class}">{icon} {verdict}</div>'


def _section_if(title: str, content: str, card_bg: str) -> str:
    if not content:
        return ""
    return f"""
        <div class="card">
            <h2>{title}</h2>
            <div>{content}</div>
        </div>"""


def _generate_chart_sections(data: dict, project_name: str) -> str:
    """Generate Plotly chart HTML sections."""
    sections = []

    try:
        from product_discovery.visualizations.charts import (
            evidence_bar, forces_bar, assumption_scatter, saturation_curve,
        )

        # Evidence Level
        if data.get("evidence_level"):
            fig = evidence_bar(data["evidence_level"], project_name)
            sections.append(f"""
        <div class="card">
            <h2>📈 Evidence Level</h2>
            <div class="chart-container">{fig.to_html(full_html=False, include_plotlyjs=False)}</div>
        </div>""")

        # Forces Diagram
        if any(data.get(k) for k in ["push", "pull", "anxiety", "habit"]):
            fig = forces_bar(
                push=data.get("push", 0),
                pull=data.get("pull", 0),
                anxiety=data.get("anxiety", 0),
                habit=data.get("habit", 0),
                project_name=project_name,
            )
            sections.append(f"""
        <div class="card">
            <h2>⚡ Forces Diagram</h2>
            <div class="chart-container">{fig.to_html(full_html=False, include_plotlyjs=False)}</div>
        </div>""")

        # Assumption scatter
        if data.get("assumptions_data"):
            fig = assumption_scatter(data["assumptions_data"], project_name)
            sections.append(f"""
        <div class="card">
            <h2>🗺️ Assumption Map</h2>
            <div class="chart-container">{fig.to_html(full_html=False, include_plotlyjs=False)}</div>
        </div>""")

        # Saturation curve
        if data.get("saturation_scores"):
            fig = saturation_curve(data["saturation_scores"], project_name)
            sections.append(f"""
        <div class="card">
            <h2>📉 Interview Saturation</h2>
            <div class="chart-container">{fig.to_html(full_html=False, include_plotlyjs=False)}</div>
        </div>""")

    except ImportError:
        sections.append("""
        <div class="card">
            <h2>📊 Charts</h2>
            <p>Install plotly for interactive charts: <code>pip install product-discovery[viz]</code></p>
        </div>""")

    return "\n".join(sections)


def _generate_mermaid_sections(data: dict) -> str:
    """Generate Mermaid diagram sections."""
    sections = []

    if data.get("ost"):
        from product_discovery.visualizations.mermaid import ost_tree
        diagram = ost_tree(data["ost"]["outcome"], data["ost"]["opportunities"])
        # Strip the markdown backticks for HTML embedding
        raw = diagram.replace("```mermaid", "").replace("```", "").strip()
        sections.append(f"""
        <div class="card">
            <h2>🌳 Opportunity Solution Tree</h2>
            <div class="mermaid">{raw}</div>
        </div>""")

    return "\n".join(sections)
