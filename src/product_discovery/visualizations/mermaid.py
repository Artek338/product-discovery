"""
Mermaid diagram generators — text-based diagrams for OST, Forces, and B2B Committee.

Output is Mermaid markdown syntax that renders in:
- GitHub, Notion, Miro, Confluence (native)
- HTML reports (via mermaid.js CDN)
"""


def ost_tree(
    outcome: str,
    opportunities: list[dict],
) -> str:
    """Generate Opportunity Solution Tree as Mermaid flowchart.

    Args:
        outcome: Root goal/outcome (e.g., "Zwiększ retencję o 15%")
        opportunities: List of dicts with keys:
            - name: str
            - solutions: list[dict] with keys: name, experiments (list[str])
    """
    lines = ["```mermaid", "graph TD"]
    lines.append(f'    O["🎯 {_escape(outcome)}"]')

    for i, opp in enumerate(opportunities):
        opp_id = f"OPP{i+1}"
        lines.append(f'    O --> {opp_id}["💡 {_escape(opp["name"])}"]')

        for j, sol in enumerate(opp.get("solutions", [])):
            sol_id = f"{opp_id}_S{j+1}"
            lines.append(f'    {opp_id} --> {sol_id}["🔧 {_escape(sol["name"])}"]')

            for k, exp in enumerate(sol.get("experiments", [])):
                exp_id = f"{sol_id}_E{k+1}"
                lines.append(f'    {sol_id} --> {exp_id}["🧪 {_escape(exp)}"]')

    # Styling
    lines.append("")
    lines.append("    classDef outcome fill:#1e40af,stroke:#3b82f6,color:#fff")
    lines.append("    classDef opportunity fill:#065f46,stroke:#10b981,color:#fff")
    lines.append("    classDef solution fill:#92400e,stroke:#f59e0b,color:#fff")
    lines.append("    classDef experiment fill:#581c87,stroke:#a855f7,color:#fff")
    lines.append("    class O outcome")

    for i in range(len(opportunities)):
        lines.append(f"    class OPP{i+1} opportunity")
        for j in range(len(opportunities[i].get("solutions", []))):
            lines.append(f"    class OPP{i+1}_S{j+1} solution")

    lines.append("```")
    return "\n".join(lines)


def forces_flowchart(
    push_items: list[str],
    pull_items: list[str],
    anxiety_items: list[str],
    habit_items: list[str],
) -> str:
    """Generate Forces Diagram as Mermaid flowchart."""
    lines = ["```mermaid", "graph LR"]

    # Push (drives change)
    lines.append('    subgraph PUSH["🔥 PUSH — Ból obecny"]')
    for i, item in enumerate(push_items):
        lines.append(f'        P{i+1}["{_escape(item)}"]')
    lines.append("    end")

    # Pull (attraction of new)
    lines.append('    subgraph PULL["✨ PULL — Atrakcja nowego"]')
    for i, item in enumerate(pull_items):
        lines.append(f'        PL{i+1}["{_escape(item)}"]')
    lines.append("    end")

    # Central decision
    lines.append('    PUSH --> SWITCH{"🔄 SWITCH?"}')
    lines.append('    PULL --> SWITCH')
    lines.append('    SWITCH --> ANXIETY')
    lines.append('    SWITCH --> HABIT')

    # Anxiety (fear of change)
    lines.append('    subgraph ANXIETY["😰 ANXIETY — Strach"]')
    for i, item in enumerate(anxiety_items):
        lines.append(f'        A{i+1}["{_escape(item)}"]')
    lines.append("    end")

    # Habit (inertia)
    lines.append('    subgraph HABIT["⏸ HABIT — Nawyk"]')
    for i, item in enumerate(habit_items):
        lines.append(f'        H{i+1}["{_escape(item)}"]')
    lines.append("    end")

    lines.append("```")
    return "\n".join(lines)


def buying_committee_map(
    champion: str,
    economic_buyer: str,
    technical_buyer: str,
    end_users: list[str],
    blockers: list[str],
) -> str:
    """Generate B2B Buying Committee Map as Mermaid flowchart."""
    lines = ["```mermaid", "graph TD"]

    lines.append(f'    DEAL["💼 Deal"]')
    lines.append(f'    CHAMP["🏆 Champion: {_escape(champion)}"]')
    lines.append(f'    EB["💰 Economic Buyer: {_escape(economic_buyer)}"]')
    lines.append(f'    TB["🔧 Technical Buyer: {_escape(technical_buyer)}"]')

    lines.append('    DEAL --> CHAMP')
    lines.append('    DEAL --> EB')
    lines.append('    DEAL --> TB')

    for i, user in enumerate(end_users):
        lines.append(f'    EU{i+1}["👤 End User: {_escape(user)}"]')
        lines.append(f'    CHAMP --> EU{i+1}')

    for i, blocker in enumerate(blockers):
        lines.append(f'    BL{i+1}["🚫 Blocker: {_escape(blocker)}"]')
        lines.append(f'    EB --> BL{i+1}')

    # Styling
    lines.append("")
    lines.append("    classDef champion fill:#065f46,stroke:#10b981,color:#fff")
    lines.append("    classDef buyer fill:#1e40af,stroke:#3b82f6,color:#fff")
    lines.append("    classDef blocker fill:#7f1d1d,stroke:#ef4444,color:#fff")
    lines.append("    class CHAMP champion")
    lines.append("    class EB,TB buyer")
    for i in range(len(blockers)):
        lines.append(f"    class BL{i+1} blocker")

    lines.append("```")
    return "\n".join(lines)


def discovery_progress(
    completed_nodes: list[str],
    current_node: str,
    total_nodes: list[str],
) -> str:
    """Discovery workflow progress as Mermaid state diagram."""
    lines = ["```mermaid", "stateDiagram-v2"]

    for i, node in enumerate(total_nodes):
        clean = _escape(node.replace("Node", ""))
        if node in completed_nodes:
            lines.append(f"    {node}: ✅ {clean}")
        elif node == current_node:
            lines.append(f"    {node}: 🔄 {clean}")
        else:
            lines.append(f"    {node}: ⬜ {clean}")

        if i > 0:
            lines.append(f"    {total_nodes[i-1]} --> {node}")

    lines.append("```")
    return "\n".join(lines)


def _escape(text: str) -> str:
    """Escape special Mermaid characters."""
    return text.replace('"', "'").replace("<", "&lt;").replace(">", "&gt;")
