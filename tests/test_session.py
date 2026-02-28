"""Tests for session persistence."""

import json
import pytest
import tempfile
from pathlib import Path

from product_discovery.workflows.session import SessionManager, SessionCheckpoint, NodeCheckpoint
from product_discovery.workflows.discovery_state import DiscoveryState


class TestSessionCheckpoint:
    """Test checkpoint serialization."""

    def test_roundtrip_json(self):
        cp = SessionCheckpoint(
            project_name="test-project",
            idea_description="Test idea for freelance UX tool",
            current_node="CompetitiveResearchNode",
            completed_nodes=["SyntheticInterviewNode", "BehavioralInterviewNode"],
            evidence_level="2_Past_Behavior",
        )
        json_str = cp.to_json()
        restored = SessionCheckpoint.from_json(json_str)
        assert restored.project_name == "test-project"
        assert restored.current_node == "CompetitiveResearchNode"
        assert len(restored.completed_nodes) == 2
        assert restored.evidence_level == "2_Past_Behavior"

    def test_extra_fields_ignored(self):
        data = {
            "project_name": "test",
            "idea_description": "test idea",
            "unknown_field": "should be ignored",
        }
        cp = SessionCheckpoint.from_json(json.dumps(data))
        assert cp.project_name == "test"


class TestSessionManager:
    """Test session manager with temp directory."""

    def test_save_and_load(self, tmp_path):
        mgr = SessionManager("test-proj", output_dir=str(tmp_path))
        state = DiscoveryState(
            project_name="test-proj",
            idea_description="AI tool for PMs",
            interview_insights=["Users need faster analysis"],
            evidence_level="2_Past_Behavior",
        )

        mgr.save_checkpoint(
            state=state,
            current_node="EvidenceGradingNode",
            completed_nodes=["SyntheticInterviewNode", "BehavioralInterviewNode", "CompetitiveResearchNode"],
        )

        assert mgr.has_checkpoint()

        restored_state, resume_node = mgr.load_checkpoint()
        assert resume_node == "EvidenceGradingNode"
        assert restored_state.project_name == "test-proj"
        assert restored_state.evidence_level == "2_Past_Behavior"
        assert len(restored_state.interview_insights) == 1

    def test_progress_summary(self, tmp_path):
        mgr = SessionManager("test-proj", output_dir=str(tmp_path))
        state = DiscoveryState(
            project_name="test-proj",
            idea_description="Test",
        )
        mgr.save_checkpoint(state, "BehavioralInterviewNode", ["SyntheticInterviewNode"])
        summary = mgr.get_progress_summary()
        assert "test-proj" in summary
        assert "1/8" in summary

    def test_clear_checkpoint(self, tmp_path):
        mgr = SessionManager("test-proj", output_dir=str(tmp_path))
        state = DiscoveryState(project_name="test-proj", idea_description="Test")
        mgr.save_checkpoint(state, "SyntheticInterviewNode", [])
        assert mgr.has_checkpoint()
        mgr.clear_checkpoint()
        assert not mgr.has_checkpoint()

    def test_no_checkpoint(self, tmp_path):
        mgr = SessionManager("nonexistent", output_dir=str(tmp_path))
        assert not mgr.has_checkpoint()
        assert "No checkpoint" in mgr.get_progress_summary()
