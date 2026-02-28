"""
Product Discovery CLI — AI-powered product/service discovery toolkit.

Usage:
    product-discovery "Your product idea" --project my-idea
    product-discovery --resume my-idea          # Resume interrupted session
    product-discovery --status my-idea          # Show session progress
    product-discovery generate-prd --project X  # Generate PRD from discovery results
    product-discovery --check                   # Verify installation
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

    try:
        from product_discovery.workflows.session import SessionManager
    except ImportError as e:
        problems.append(f"Session manager: {e}")

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


def show_status(project_name: str, output_dir: str = "projects") -> None:
    """Show session progress for a project."""
    from product_discovery.workflows.session import SessionManager
    mgr = SessionManager(project_name, output_dir=output_dir)
    print(mgr.get_progress_summary())


async def generate_prd(project_name: str, output_dir: str = "projects") -> None:
    """Generate PRD from discovery results."""
    project_path = Path(output_dir) / project_name

    # Find latest discovery report
    reports = sorted(project_path.glob("DISCOVERY_*.md"), reverse=True)
    if not reports:
        print(f"❌ No discovery report found in {project_path}/")
        print("   Run discovery first: product-discovery 'idea' --project " + project_name)
        sys.exit(1)

    latest_report = reports[0]
    discovery_content = latest_report.read_text(encoding="utf-8")
    print(f"📋 Using discovery report: {latest_report.name}")

    # Load PRD template
    template_path = Path(__file__).parent.parent.parent / "templates" / "PRD.template.md"
    if template_path.exists():
        template = template_path.read_text(encoding="utf-8")
    else:
        template = "# PRD: [Product Name]\n\n[Standard PRD format]"

    # Use PM agent to generate PRD
    from product_discovery.agents.product_manager.agent import pm_agent

    prompt = f"""
Na podstawie poniższych wyników Discovery, wypełnij szablon PRD.

## Wyniki Discovery:
{discovery_content}

## Szablon PRD (wypełnij WSZYSTKIE sekcje):
{template}

ZASADY:
1. Wypełnij sekcje 1-5 na podstawie danych z Discovery
2. Evidence z Discovery wstaw do sekcji 2.3
3. Competing solutions → tabela w sekcji 7.2
4. JTBD analysis → User Stories w sekcji 4
5. Nie zostawiaj placeholder'ów [brackets] — wypełnij konkretnymi danymi
6. Sekcje 6-8 (Business Model, Market, GTM) — wypełnij na podstawie competitive report
7. Sekcje 9-15 — wypełnij sensownie lub oznacz jako "TBD: requires further validation"
"""

    result = await pm_agent.run(prompt)

    prd_file = project_path / "PRD.md"
    # pm_agent returns ProductManagerResult, extract useful content
    prd_content = f"""# PRD: {project_name}

**Generated from:** {latest_report.name}
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Status:** Draft (auto-generated from Discovery)

---

{str(result.output)}
"""

    prd_file.write_text(prd_content, encoding="utf-8")
    print(f"\n✅ PRD generated: {prd_file}")
    print(f"   ⚠️  Review and edit before sharing — some sections may need human input.")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="product-discovery",
        description="🔍 Product Discovery — AI-powered product/service discovery toolkit",
        epilog=(
            "Examples:\n"
            "  product-discovery 'SaaS for freelance designers' --project design-tool\n"
            "  product-discovery --resume design-tool\n"
            "  product-discovery --status design-tool\n"
            "  product-discovery generate-prd --project design-tool"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    # Subcommands
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # generate-prd subcommand
    prd_parser = subparsers.add_parser("generate-prd", help="Generate PRD from discovery results")
    prd_parser.add_argument("--project", "-p", required=True, help="Project name")
    prd_parser.add_argument("--output", "-o", default="projects", help="Output directory")

    # Main arguments
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
        "--resume", "-r",
        metavar="PROJECT",
        help="Resume an interrupted discovery session",
    )
    parser.add_argument(
        "--status", "-s",
        metavar="PROJECT",
        help="Show progress of a discovery session",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check imports and environment, then exit",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 0.2.0",
    )

    args = parser.parse_args()

    # Load .env
    load_dotenv()

    # Handle subcommands
    if args.command == "generate-prd":
        if not check_environment():
            sys.exit(1)
        asyncio.run(generate_prd(args.project, args.output))
        return

    if args.check:
        ok = check_imports()
        ok = check_environment() and ok
        sys.exit(0 if ok else 1)

    if args.status:
        show_status(args.status, args.output)
        return

    if args.resume:
        from product_discovery.workflows.session import SessionManager
        mgr = SessionManager(args.resume, output_dir=args.output)
        if not mgr.has_checkpoint():
            print(f"❌ No checkpoint found for project '{args.resume}'")
            sys.exit(1)
        print(mgr.get_progress_summary())
        print("\n🔄 Resuming session...\n")
        state, resume_node = mgr.load_checkpoint()
        # TODO: Implement graph resume from specific node
        print(f"   Would resume from: {resume_node}")
        print("   ⚠️  Full resume not yet implemented — re-run with full idea description")
        return

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
