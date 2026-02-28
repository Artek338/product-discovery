"""
Session Checkpoint — persystencja stanu Discovery Graph.

Umożliwia:
- Zapis stanu po każdym node (auto-checkpoint)
- Wznowienie sesji po przerwaniu (`--resume`)
- Historię przejść między nodami

Usage:
    from product_discovery.workflows.session import SessionManager

    mgr = SessionManager("my-project")
    mgr.save_checkpoint(state, current_node="CompetitiveResearchNode")
    # ... later ...
    state, resume_node = mgr.load_checkpoint()
"""

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class NodeCheckpoint:
    """Snapshot of a single node execution."""
    node_name: str
    timestamp: str
    status: str  # "completed" | "in_progress" | "failed"
    duration_seconds: float = 0.0
    output_summary: str = ""
    cost_usd: float = 0.0


@dataclass
class SessionCheckpoint:
    """Full session checkpoint — serialized to JSON."""
    project_name: str
    idea_description: str
    interview_notes: str = ""
    start_time: str = ""
    last_update: str = ""

    # Graph navigation
    current_node: str = "SyntheticInterviewNode"
    completed_nodes: list[str] = field(default_factory=list)
    node_history: list[dict] = field(default_factory=list)

    # Discovery state fields (serializable subset)
    interview_insights: list[str] = field(default_factory=list)
    competitive_report: str = ""
    evidence_level: str = "0_Opinion"
    interview_notes_content: str = ""
    synthetic_archetypes: list[str] = field(default_factory=list)
    assumption_map: list[str] = field(default_factory=list)
    forces_diagram: Optional[str] = None

    # JTBD result (JSON-serialized)
    jtbd_result_json: Optional[str] = None

    # Cost tracking
    total_tokens: int = 0
    total_cost_usd: float = 0.0

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=False)

    @classmethod
    def from_json(cls, data: str) -> "SessionCheckpoint":
        d = json.loads(data)
        return cls(**{k: v for k, v in d.items() if k in cls.__dataclass_fields__})


class SessionManager:
    """Manages session persistence for Discovery Graph runs."""

    def __init__(self, project_name: str, output_dir: str = "projects"):
        self.project_name = project_name
        self.project_dir = Path(output_dir) / project_name
        self.checkpoint_path = self.project_dir / ".checkpoint.json"
        self.project_dir.mkdir(parents=True, exist_ok=True)

    def has_checkpoint(self) -> bool:
        """Check if a resumable checkpoint exists."""
        return self.checkpoint_path.exists()

    def save_checkpoint(
        self,
        state,  # DiscoveryState
        current_node: str,
        completed_nodes: list[str],
        node_checkpoint: Optional[NodeCheckpoint] = None,
        cost_usd: float = 0.0,
        tokens: int = 0,
    ) -> Path:
        """Save current state as a checkpoint."""
        # Load existing to preserve history
        if self.has_checkpoint():
            existing = self.load_raw()
            history = existing.node_history
            total_tokens = existing.total_tokens + tokens
            total_cost = existing.total_cost_usd + cost_usd
            start_time = existing.start_time
        else:
            history = []
            total_tokens = tokens
            total_cost = cost_usd
            start_time = datetime.now().isoformat()

        if node_checkpoint:
            history.append(asdict(node_checkpoint))

        checkpoint = SessionCheckpoint(
            project_name=self.project_name,
            idea_description=state.idea_description,
            interview_notes=state.interview_notes,
            start_time=start_time,
            last_update=datetime.now().isoformat(),
            current_node=current_node,
            completed_nodes=completed_nodes,
            node_history=history,
            interview_insights=state.interview_insights,
            competitive_report=state.competitive_report,
            evidence_level=state.evidence_level,
            synthetic_archetypes=state.synthetic_archetypes,
            assumption_map=state.assumption_map,
            forces_diagram=str(state.forces_diagram) if state.forces_diagram else None,
            total_tokens=total_tokens,
            total_cost_usd=total_cost,
        )

        self.checkpoint_path.write_text(checkpoint.to_json(), encoding="utf-8")
        return self.checkpoint_path

    def load_raw(self) -> SessionCheckpoint:
        """Load raw checkpoint data."""
        data = self.checkpoint_path.read_text(encoding="utf-8")
        return SessionCheckpoint.from_json(data)

    def load_checkpoint(self):
        """
        Load checkpoint and reconstruct DiscoveryState.

        Returns:
            (DiscoveryState, resume_from_node: str)
        """
        from product_discovery.workflows.discovery_state import DiscoveryState

        cp = self.load_raw()

        state = DiscoveryState(
            project_name=cp.project_name,
            idea_description=cp.idea_description,
            interview_notes=cp.interview_notes,
            interview_insights=cp.interview_insights,
            competitive_report=cp.competitive_report,
            evidence_level=cp.evidence_level,
            synthetic_archetypes=cp.synthetic_archetypes,
            assumption_map=cp.assumption_map,
        )

        return state, cp.current_node

    def clear_checkpoint(self) -> None:
        """Remove checkpoint after successful completion."""
        if self.checkpoint_path.exists():
            self.checkpoint_path.unlink()

    def get_progress_summary(self) -> str:
        """Get a human-readable progress summary."""
        if not self.has_checkpoint():
            return "No checkpoint found."

        cp = self.load_raw()
        completed = len(cp.completed_nodes)
        total = 8  # Total nodes in Discovery Graph

        lines = [
            f"📊 Session: {cp.project_name}",
            f"   Progress: {completed}/{total} nodes ({completed*100//total}%)",
            f"   Current: {cp.current_node}",
            f"   Evidence: {cp.evidence_level}",
            f"   Started: {cp.start_time[:16]}",
            f"   Updated: {cp.last_update[:16]}",
        ]

        if cp.total_cost_usd > 0:
            lines.append(f"   Cost: ${cp.total_cost_usd:.4f} ({cp.total_tokens} tokens)")

        if cp.completed_nodes:
            lines.append(f"   Completed: {', '.join(cp.completed_nodes)}")

        return "\n".join(lines)
