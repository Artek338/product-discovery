"""Integration tests for Miro and Google Docs — require API tokens.

Run with: pytest tests/test_integrations.py -m integration
These tests are skipped by default unless API tokens are set.
"""

import os
import pytest

# Mark all tests as integration
pytestmark = pytest.mark.integration


# ---- Miro ----

@pytest.mark.skipif(
    not os.getenv("MIRO_ACCESS_TOKEN") or not os.getenv("MIRO_BOARD_ID"),
    reason="MIRO_ACCESS_TOKEN and MIRO_BOARD_ID not set",
)
class TestMiroExport:
    def test_miro_client_create_frame(self):
        from product_discovery.integrations.miro_export import MiroClient
        client = MiroClient(
            board_id=os.getenv("MIRO_BOARD_ID"),
            access_token=os.getenv("MIRO_ACCESS_TOKEN"),
        )
        frame = client.create_frame("Test Frame", x=2000, y=2000, width=400, height=200)
        assert "id" in frame

    def test_miro_full_export(self):
        from product_discovery.integrations.miro_export import export_to_miro
        export_to_miro(
            board_id=os.getenv("MIRO_BOARD_ID"),
            access_token=os.getenv("MIRO_ACCESS_TOKEN"),
            project_name="test-integration",
            discovery_data={
                "verdict": "NEEDS_MORE_DATA",
                "confidence": "45",
                "evidence_level": "1_Preference",
                "assumptions_data": [
                    {"id": "A001", "hypothesis": "Test", "type": "desirability",
                     "status": "untested", "risk": 7, "uncertainty": 8},
                ],
            },
            sections=["all"],
        )


# ---- Google Docs ----

@pytest.mark.skipif(
    not os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE"),
    reason="GOOGLE_SERVICE_ACCOUNT_FILE not set",
)
class TestGDocsExport:
    def test_gdocs_build_content(self):
        from product_discovery.integrations.gdocs_export import _build_doc_content
        requests = _build_doc_content("test-project", {
            "verdict": "GO",
            "confidence": "85",
            "evidence_level": "3_Commitment",
            "functional_job": "Save time on reports",
        })
        assert len(requests) > 0
        # Check first insert is header text
        assert "insertText" in requests[0]


# ---- Unit tests for Miro module (no API needed) ----

class TestMiroUnit:
    def test_assumption_colors(self):
        from product_discovery.integrations.miro_export import ASSUMPTION_COLORS
        assert "desirability" in ASSUMPTION_COLORS
        assert "ethical" in ASSUMPTION_COLORS

    def test_status_icons(self):
        from product_discovery.integrations.miro_export import STATUS_ICONS
        assert STATUS_ICONS["validated"] == "✅"
        assert STATUS_ICONS["invalidated"] == "❌"


# ---- Unit tests for GDocs module (no API needed) ----

class TestGDocsUnit:
    def test_build_doc_content_structure(self):
        from product_discovery.integrations.gdocs_export import _build_doc_content
        requests = _build_doc_content("test", {
            "verdict": "GO",
            "confidence": "90",
            "evidence_level": "4_Financial",
        })
        # Should have at least header + JTBD + footer
        assert len(requests) >= 3

    def test_build_doc_with_assumptions(self):
        from product_discovery.integrations.gdocs_export import _build_doc_content
        requests = _build_doc_content("test", {
            "verdict": "NO-GO",
            "assumptions_data": [
                {"id": "A001", "type": "viability", "status": "invalidated",
                 "risk": 9, "uncertainty": 8, "hypothesis": "Users pay $50/mo"},
            ],
        })
        # More requests due to assumption lines
        assert len(requests) >= 4
