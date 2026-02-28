"""
Gate Check — validates phase transitions in Discovery Graph.

Ensures data quality and completeness before progressing to the next phase.
"""

from product_discovery.workflows.discovery_state import DiscoveryState


def check_gate(state: DiscoveryState, gate_name: str) -> tuple[bool, str]:
    """
    Check if a gate condition is met.

    Args:
        state: Current discovery state
        gate_name: Name of gate to check

    Returns:
        (passed: bool, reason: str)
    """
    gates = {
        "evidence_minimum": _check_evidence_minimum,
        "interview_minimum": _check_interview_minimum,
        "competitive_data": _check_competitive_data,
    }

    checker = gates.get(gate_name)
    if not checker:
        return True, f"Unknown gate: {gate_name} — passing by default"

    return checker(state)


def _check_evidence_minimum(state: DiscoveryState) -> tuple[bool, str]:
    """Evidence must be >= 2_Past_Behavior for GO verdict."""
    if state.meets_evidence_threshold:
        return True, f"Evidence level {state.evidence_level} meets minimum"
    return False, (
        f"Evidence level {state.evidence_level} is too weak. "
        "Minimum: 2_Past_Behavior. Collect behavioral interview data."
    )


def _check_interview_minimum(state: DiscoveryState) -> tuple[bool, str]:
    """Need >= 3 interview insights for synthesis."""
    if state.has_minimum_interviews:
        return True, f"{len(state.interview_insights)} interview insights collected"
    return False, (
        f"Only {len(state.interview_insights)} interview insights. "
        "Minimum: 3. Conduct more behavioral interviews."
    )


def _check_competitive_data(state: DiscoveryState) -> tuple[bool, str]:
    """Need competitive research before synthesis."""
    if state.has_competitive_data:
        return True, "Competitive data available"
    return False, "No competitive research data. Run OSINT analysis first."
