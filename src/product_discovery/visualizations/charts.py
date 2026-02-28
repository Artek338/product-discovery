"""
Plotly chart generators for Discovery visualizations.

All functions return Plotly Figure objects that can be rendered as:
- Interactive HTML (fig.to_html())
- Static PNG/SVG (fig.to_image()) — requires kaleido
"""

from typing import Optional

try:
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    HAS_PLOTLY = True
except ImportError:
    HAS_PLOTLY = False


def _check_plotly():
    if not HAS_PLOTLY:
        raise ImportError(
            "plotly required for charts: pip install product-discovery[viz]"
        )


EVIDENCE_LEVELS = [
    "0_Opinion", "1_Preference", "2_Past_Behavior",
    "3_Commitment", "4_Financial",
]

EVIDENCE_COLORS = {
    "0_Opinion": "#ef4444",
    "1_Preference": "#f97316",
    "2_Past_Behavior": "#eab308",
    "3_Commitment": "#22c55e",
    "4_Financial": "#06b6d4",
}


def evidence_bar(current_level: str, project_name: str = "") -> "go.Figure":
    """Horizontal bar showing current evidence level (0-4)."""
    _check_plotly()

    current_idx = EVIDENCE_LEVELS.index(current_level) if current_level in EVIDENCE_LEVELS else 0
    colors = [
        EVIDENCE_COLORS[lvl] if i <= current_idx else "#374151"
        for i, lvl in enumerate(EVIDENCE_LEVELS)
    ]

    labels = ["Opinion", "Preference", "Past Behavior", "Commitment", "Financial"]
    values = [1] * 5

    fig = go.Figure(go.Bar(
        x=values,
        y=labels,
        orientation="h",
        marker_color=colors,
        text=["✓" if i <= current_idx else "" for i in range(5)],
        textposition="inside",
        textfont=dict(size=16, color="white"),
    ))
    fig.update_layout(
        title=f"Evidence Level: {labels[current_idx]}" + (f" — {project_name}" if project_name else ""),
        xaxis=dict(showticklabels=False, showgrid=False),
        yaxis=dict(autorange="reversed"),
        plot_bgcolor="#111827",
        paper_bgcolor="#111827",
        font=dict(color="white", family="Inter, sans-serif"),
        height=250,
        margin=dict(l=120, r=20, t=50, b=20),
    )
    return fig


def forces_bar(
    push: float = 0,
    pull: float = 0,
    anxiety: float = 0,
    habit: float = 0,
    project_name: str = "",
) -> "go.Figure":
    """Forces diagram as horizontal bar chart (push/pull vs anxiety/habit)."""
    _check_plotly()

    categories = ["Push (ból obecny)", "Pull (atrakcja nowego)", "Anxiety (strach)", "Habit (nawyk)"]
    values = [push, pull, -anxiety, -habit]
    colors = ["#22c55e", "#06b6d4", "#ef4444", "#f97316"]

    fig = go.Figure(go.Bar(
        x=values,
        y=categories,
        orientation="h",
        marker_color=colors,
        text=[f"{abs(v):.0f}" for v in values],
        textposition="outside",
    ))
    fig.add_vline(x=0, line_dash="dash", line_color="white", opacity=0.5)
    fig.update_layout(
        title=f"Forces Diagram" + (f" — {project_name}" if project_name else ""),
        xaxis=dict(title="Siła (← hamujące | napędzające →)", range=[-110, 110]),
        plot_bgcolor="#111827",
        paper_bgcolor="#111827",
        font=dict(color="white", family="Inter, sans-serif"),
        height=300,
        margin=dict(l=160, r=40, t=50, b=40),
    )
    return fig


def assumption_scatter(assumptions_data: list[dict], project_name: str = "") -> "go.Figure":
    """Risk × Uncertainty scatter plot for assumptions (heatmap-like)."""
    _check_plotly()

    type_colors = {
        "desirability": "#06b6d4",
        "viability": "#22c55e",
        "feasibility": "#eab308",
        "usability": "#a855f7",
        "ethical": "#ef4444",
    }

    status_symbols = {
        "untested": "circle",
        "testing": "diamond",
        "validated": "star",
        "invalidated": "x",
    }

    fig = go.Figure()

    for a in assumptions_data:
        fig.add_trace(go.Scatter(
            x=[a["uncertainty"]],
            y=[a["risk"]],
            mode="markers+text",
            marker=dict(
                size=16,
                color=type_colors.get(a["type"], "#6b7280"),
                symbol=status_symbols.get(a["status"], "circle"),
                line=dict(width=1, color="white"),
            ),
            text=[a["id"]],
            textposition="top center",
            textfont=dict(size=10, color="white"),
            name=f"{a['id']}: {a['hypothesis'][:30]}",
            showlegend=True,
        ))

    # Quadrant lines
    fig.add_hline(y=5, line_dash="dot", line_color="gray", opacity=0.3)
    fig.add_vline(x=5, line_dash="dot", line_color="gray", opacity=0.3)

    # Quadrant labels
    fig.add_annotation(x=8, y=8, text="🔥 TEST FIRST", showarrow=False,
                       font=dict(size=12, color="#ef4444"))
    fig.add_annotation(x=2, y=2, text="⏳ Low priority", showarrow=False,
                       font=dict(size=12, color="#6b7280"))

    fig.update_layout(
        title=f"Assumption Map" + (f" — {project_name}" if project_name else ""),
        xaxis=dict(title="Uncertainty →", range=[0, 11]),
        yaxis=dict(title="Risk →", range=[0, 11]),
        plot_bgcolor="#111827",
        paper_bgcolor="#111827",
        font=dict(color="white", family="Inter, sans-serif"),
        height=450,
        margin=dict(l=60, r=20, t=50, b=40),
        legend=dict(font=dict(size=9)),
    )
    return fig


def saturation_curve(scores: list[float], project_name: str = "") -> "go.Figure":
    """Saturation Score over interviews (Sₙ = T_new / T_total)."""
    _check_plotly()

    x = list(range(1, len(scores) + 1))

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=x, y=scores,
        mode="lines+markers",
        line=dict(color="#06b6d4", width=2),
        marker=dict(size=8, color="#06b6d4"),
        name="Saturation Score",
    ))
    # Threshold line at 5%
    fig.add_hline(y=0.05, line_dash="dash", line_color="#22c55e", opacity=0.7,
                  annotation_text="Saturated (< 5%)",
                  annotation_position="bottom right")

    fig.update_layout(
        title=f"Interview Saturation" + (f" — {project_name}" if project_name else ""),
        xaxis=dict(title="Interview #", dtick=1),
        yaxis=dict(title="Sₙ (new themes / total)", range=[0, max(1, max(scores) * 1.1) if scores else 1]),
        plot_bgcolor="#111827",
        paper_bgcolor="#111827",
        font=dict(color="white", family="Inter, sans-serif"),
        height=300,
        margin=dict(l=60, r=20, t=50, b=40),
    )
    return fig


def competitive_radar(
    competitors: dict[str, dict[str, float]],
    dimensions: list[str],
    project_name: str = "",
) -> "go.Figure":
    """Spider/radar chart comparing competitors across dimensions."""
    _check_plotly()

    colors = ["#06b6d4", "#ef4444", "#22c55e", "#eab308", "#a855f7"]

    fig = go.Figure()
    for i, (name, scores) in enumerate(competitors.items()):
        values = [scores.get(d, 0) for d in dimensions]
        values.append(values[0])  # Close the shape
        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=dimensions + [dimensions[0]],
            fill="toself",
            name=name,
            line=dict(color=colors[i % len(colors)]),
            opacity=0.6,
        ))

    fig.update_layout(
        title=f"Competitive Analysis" + (f" — {project_name}" if project_name else ""),
        polar=dict(
            bgcolor="#1f2937",
            radialaxis=dict(range=[0, 10], gridcolor="#374151", tickfont=dict(color="white")),
            angularaxis=dict(gridcolor="#374151", tickfont=dict(color="white")),
        ),
        paper_bgcolor="#111827",
        font=dict(color="white", family="Inter, sans-serif"),
        height=450,
        margin=dict(l=60, r=60, t=50, b=40),
    )
    return fig
