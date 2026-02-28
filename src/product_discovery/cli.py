"""
Product Discovery CLI — AI-powered product/service discovery toolkit.

Usage:
    python -m product_discovery.cli "Your product idea" --project my-idea
    product-discovery "Your product idea" --project my-idea
    product-discovery --check  # Verify installation
"""

import argparse
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv


def check_imports() -> bool:
    """Verify all required imports are available."""
    problems = []

    try:
        import pydantic_ai
    except ImportError:
        problems.append("pydantic-ai not installed: pip install pydantic-ai")

    try:
        import pydantic_graph
    except ImportError:
        problems.append("pydantic-graph not installed: pip install pydantic-graph")

    try:
        import anthropic
    except ImportError:
        problems.append("anthropic not installed: pip install anthropic")

    try:
        from product_discovery.agents.business_analyst.schemas import JTBDAnalysisResult
    except ImportError as e:
        problems.append(f"Business Analyst schemas: {e}")

    try:
        from product_discovery.workflows.discovery_state import DiscoveryState
    except ImportError as e:
        problems.append(f"Discovery state: {e}")

    if problems:
        print("❌ Import check FAILED:")
        for p in problems:
            print(f"   • {p}")
        return False

    print("✅ All imports OK")
    print(f"   pydantic-ai: {pydantic_ai.__version__}")
    print(f"   anthropic: {anthropic.__version__}")
    return True


def check_environment() -> bool:
    """Verify required environment variables."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key == "placeholder-for-import-check":
        print("⚠️  ANTHROPIC_API_KEY not set. Set it in .env or environment.")
        return False
    print(f"✅ ANTHROPIC_API_KEY configured ({api_key[:8]}...)")

    optional_keys = {
        "PERPLEXITY_API_KEY": "Enhanced competitive research",
        "SERPER_API_KEY": "Google Search results",
        "EXA_API_KEY": "Neural semantic search",
    }
    for key, desc in optional_keys.items():
        if os.getenv(key):
            print(f"✅ {key} configured ({desc})")
        else:
            print(f"   {key} not set ({desc}) — optional")

    return True


async def run_discovery_workflow(
    idea: str,
    project_name: str,
    interview_notes: str = "",
    output_dir: str = "projects",
) -> None:
    """Run the full discovery workflow."""
    from product_discovery.workflows.discovery_graph import run_discovery

    result = await run_discovery(
        idea_description=idea,
        project_name=project_name,
        interview_notes=interview_notes,
    )

    # Print summary
    print(result.summary())

    # Save output
    output_path = Path(output_dir) / project_name
    output_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_path / f"DISCOVERY_{timestamp}.md"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"# Discovery Report: {project_name}\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write(f"**Verdict:** {result.verdict}\n")
        f.write(f"**Confidence:** {result.jtbd.confidence}%\n")
        f.write(f"**Evidence Level:** {result.jtbd.evidence_level}\n\n")

        f.write("## JTBD Analysis\n\n")
        f.write(f"**Functional Job:** {result.jtbd.functional_job}\n\n")
        f.write(f"**Emotional Job:** {result.jtbd.emotional_job}\n\n")
        f.write(f"**Social Job:** {result.jtbd.social_job}\n\n")
        f.write(f"**Competing Solutions:** {', '.join(result.jtbd.competing_solutions)}\n\n")

        if result.jtbd.reasoning:
            f.write(f"**Reasoning:** {result.jtbd.reasoning}\n\n")

        if result.competitive_report:
            f.write("## Competitive Analysis\n\n")
            f.write(result.competitive_report + "\n\n")

        if result.forces_report:
            f.write("## Forces Diagram\n\n")
            f.write(str(result.forces_report) + "\n\n")

        if result.assumption_map:
            f.write("## Assumption Map\n\n")
            f.write(result.assumption_map + "\n\n")

        if result.synthetic_archetypes:
            f.write("## Synthetic User Archetypes\n\n")
            f.write(result.synthetic_archetypes + "\n\n")

        f.write("## Value Scorecard\n\n")
        f.write(f"- Hours invested: {result.scorecard.hours_invested:.1f}h\n")
        f.write(f"- Evidence level: {result.scorecard.evidence_level_achieved}\n")
        f.write(f"- ROI: {result.scorecard.roi_estimate}\n")

    print(f"\n📄 Report saved to: {output_file}")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="product-discovery",
        description="🔍 Product Discovery — AI-powered product/service discovery toolkit",
        epilog="Example: product-discovery 'SaaS for freelance designers' --project design-tool",
    )

    parser.add_argument(
        "idea",
        nargs="?",
        help="Product/service idea description",
    )
    parser.add_argument(
        "--project", "-p",
        default="unnamed",
        help="Project name (default: unnamed)",
    )
    parser.add_argument(
        "--interviews", "-i",
        help="Path to interview notes file (Markdown)",
    )
    parser.add_argument(
        "--output", "-o",
        default="projects",
        help="Output directory (default: projects/)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check imports and environment, then exit",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 0.1.0",
    )

    args = parser.parse_args()

    # Load .env
    load_dotenv()

    if args.check:
        ok = check_imports()
        ok = check_environment() and ok
        sys.exit(0 if ok else 1)

    if not args.idea:
        parser.print_help()
        sys.exit(1)

    # Check environment
    if not check_environment():
        print("\n⚠️  Set ANTHROPIC_API_KEY before running discovery.")
        sys.exit(1)

    # Load interview notes if provided
    interview_notes = ""
    if args.interviews:
        path = Path(args.interviews)
        if path.exists():
            interview_notes = path.read_text(encoding="utf-8")
            print(f"📋 Loaded interview notes: {path} ({len(interview_notes)} chars)")
        else:
            print(f"⚠️  Interview file not found: {path}")
            sys.exit(1)

    # Run discovery
    asyncio.run(run_discovery_workflow(
        idea=args.idea,
        project_name=args.project,
        interview_notes=interview_notes,
        output_dir=args.output,
    ))


if __name__ == "__main__":
    main()
