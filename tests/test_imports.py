"""Tests for import verification — ensure all modules load without errors."""

import pytest


def test_import_package():
    """Top-level package imports correctly."""
    import product_discovery
    assert product_discovery.__version__ == "1.0.0"


def test_import_business_analyst_schemas():
    """Business Analyst schemas import without errors."""
    from product_discovery.agents.business_analyst.schemas import (
        JTBDAnalysisResult,
        PMFAssessment,
        OpportunitySolutionTree,
        ForcesDiagram,
        ForceEntry,
        SyntheticUserProfile,
        SyntheticUserResponse,
        SyntheticUserProfileList,
        DiscoveryQualityScore,
        BusinessAnalysisResult,
        InterviewImprovementReport,
    )
    assert JTBDAnalysisResult is not None
    assert ForcesDiagram is not None
    assert SyntheticUserProfile is not None


def test_import_product_manager_schemas():
    """Product Manager schemas import without errors."""
    from product_discovery.agents.product_manager.schemas import (
        ProductManagerResult,
        RICEScore,
        DecisionAnalysis,
        LNOAssessment,
        FeatureCreepCheck,
    )
    assert ProductManagerResult is not None
    assert RICEScore is not None


def test_import_discovery_state():
    """Discovery state imports without errors."""
    from product_discovery.workflows.discovery_state import (
        DiscoveryState,
        DiscoveryResult,
        DiscoveryValueScorecard,
    )
    assert DiscoveryState is not None


def test_import_tools():
    """Tools import without errors."""
    from product_discovery.tools.behavioral_interview import BehavioralInterviewer
    from product_discovery.tools.gate_check import check_gate
    from product_discovery.tools.web_research import WebResearch
    assert BehavioralInterviewer is not None
    assert check_gate is not None
    assert WebResearch is not None


def test_import_cli():
    """CLI module imports without errors."""
    from product_discovery.cli import check_imports, main
    assert main is not None
