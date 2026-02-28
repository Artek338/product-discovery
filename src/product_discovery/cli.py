"""
Product Discovery CLI — AI-powered product/service discovery toolkit.

Usage:
    product-discovery "Your product idea" --project my-idea
    product-discovery --resume my-idea              # Resume interrupted session
    product-discovery --status my-idea              # Show session progress
    product-discovery generate-prd --project X      # Generate PRD from discovery results
    product-discovery import-interviews --project X --dir ./transcripts/
    product-discovery export-report --project X     # Generate HTML report
    product-discovery export-miro --project X       # Push to Miro board
    product-discovery assumptions list --project X  # List assumptions
    product-discovery --check                       # Verify installation
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
        "MIRO_ACCESS_TOKEN": "Miro board export",
        "MIRO_BOARD_ID": "Miro board ID",
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


# ---- New Phase 2 commands ----

def cmd_import_interviews(args) -> None:
    """Import real interview transcripts."""
    from product_discovery.tools.interview_import import import_interviews

    files = []
    if args.file:
        files = [Path(args.file)]
    elif args.dir:
        dir_path = Path(args.dir)
        if not dir_path.exists():
            print(f"❌ Directory not found: {dir_path}")
            sys.exit(1)
        files = sorted(dir_path.glob("*.md")) + sorted(dir_path.glob("*.txt"))
        if not files:
            print(f"❌ No .md or .txt files found in {dir_path}")
            sys.exit(1)
    else:
        print("❌ Specify --file or --dir")
        sys.exit(1)

    print(f"📂 Importing {len(files)} interview(s) for project '{args.project}'...")
    print()
    import_interviews(args.project, files, args.output)


def cmd_export_report(args) -> None:
    """Generate HTML report from discovery/interview data."""
    from product_discovery.visualizations.report_html import generate_html_report

    # Collect available data
    discovery_data = _load_project_data(args.project, args.output)

    if not discovery_data:
        print(f"❌ No data found for project '{args.project}' in {args.output}/")
        sys.exit(1)

    out_file = generate_html_report(
        project_name=args.project,
        discovery_data=discovery_data,
        output_dir=args.output,
        theme=args.theme,
    )
    print(f"\n✅ HTML report generated: {out_file}")

    if args.open:
        import webbrowser
        webbrowser.open(str(out_file.resolve()))


def cmd_assumptions(args) -> None:
    """Manage assumption board."""
    from product_discovery.tools.assumption_tracker import AssumptionBoard

    board = AssumptionBoard.load(args.project, args.output)

    if args.action == "list":
        if not board.assumptions:
            print(f"📋 No assumptions yet for '{args.project}'. Use 'assumptions add' to start.")
            return
        print(board.summary_table())

    elif args.action == "add":
        if not args.hypothesis:
            print("❌ --hypothesis required for 'add'")
            sys.exit(1)
        a = board.add(
            hypothesis=args.hypothesis,
            assumption_type=args.type or "desirability",
            risk=args.risk or 5,
            uncertainty=args.uncertainty or 5,
        )
        board.save(args.output)
        print(f"✅ Added {a.id}: {a.hypothesis} (type={a.type.value}, R×U={a.priority_score})")

    elif args.action == "update":
        if not args.id:
            print("❌ --id required for 'update'")
            sys.exit(1)
        a = board.update_status(
            args.id,
            status=args.status or "testing",
            result=args.result or "",
            evidence_level=args.evidence_level or 0,
        )
        if a:
            board.save(args.output)
            print(f"✅ Updated {a.id}: status={a.status.value}")
        else:
            print(f"❌ Assumption '{args.id}' not found")

    elif args.action == "prioritize":
        top = board.prioritized[:10]
        if not top:
            print("📋 No untested assumptions to prioritize.")
            return
        print("🔥 Priority Queue (highest risk × uncertainty first):")
        for a in top:
            print(f"   {a.id}: [{a.type.value}] R{a.risk}×U{a.uncertainty}={a.priority_score} — {a.hypothesis[:50]}")

    elif args.action == "stats":
        stats = board.stats
        print(f"📊 Assumption Board Stats: {args.project}")
        print(f"   Total: {stats['total']}")
        print(f"   By status: {stats['by_status']}")
        print(f"   By type: {stats['by_type']}")
        print(f"   Invalidation rate: {stats['invalidation_rate']} (benchmark: 30-60%)")


def cmd_export_miro(args) -> None:
    """Export discovery data to Miro board."""
    token = os.getenv("MIRO_ACCESS_TOKEN") or args.token
    board_id = os.getenv("MIRO_BOARD_ID") or args.board_id

    if not token or not board_id:
        print("❌ MIRO_ACCESS_TOKEN and MIRO_BOARD_ID required.")
        print("   Set in .env or pass --token and --board-id")
        sys.exit(1)

    try:
        from product_discovery.integrations.miro_export import export_to_miro
    except ImportError:
        print("❌ Miro integration not available. Check installation.")
        sys.exit(1)

    data = _load_project_data(args.project, args.output)
    if not data:
        print(f"❌ No data found for project '{args.project}'")
        sys.exit(1)

    export_to_miro(
        board_id=board_id,
        access_token=token,
        project_name=args.project,
        discovery_data=data,
        sections=args.sections.split(",") if args.sections else ["all"],
    )


def _load_project_data(project_name: str, output_dir: str = "projects") -> dict:
    """Load all available data for a project."""
    import json
    project_path = Path(output_dir) / project_name
    data = {}

    # Discovery report
    reports = sorted(project_path.glob("DISCOVERY_*.md"), reverse=True)
    if reports:
        content = reports[0].read_text(encoding="utf-8")
        data["has_discovery"] = True
        # Extract basic fields from markdown
        for line in content.split("\n"):
            if line.startswith("**Verdict:**"):
                data["verdict"] = line.split("**Verdict:**")[1].strip()
            elif line.startswith("**Confidence:**"):
                data["confidence"] = line.split("**Confidence:**")[1].strip().rstrip("%")
            elif line.startswith("**Evidence Level:**"):
                data["evidence_level"] = line.split("**Evidence Level:**")[1].strip()
            elif line.startswith("**Functional Job:**"):
                data["functional_job"] = line.split("**Functional Job:**")[1].strip()
            elif line.startswith("**Emotional Job:**"):
                data["emotional_job"] = line.split("**Emotional Job:**")[1].strip()
            elif line.startswith("**Social Job:**"):
                data["social_job"] = line.split("**Social Job:**")[1].strip()

    # Interview corpus
    corpus_file = project_path / "interview_corpus.json"
    if corpus_file.exists():
        corpus = json.loads(corpus_file.read_text(encoding="utf-8"))
        data["interviews_count"] = corpus.get("total_interviews", 0)
        data["saturation_scores"] = [
            a.get("saturation_score", 1.0) for a in corpus.get("analyses", [])
        ]

    # Assumptions
    assumptions_file = project_path / "assumptions.json"
    if assumptions_file.exists():
        assumptions = json.loads(assumptions_file.read_text(encoding="utf-8"))
        data["assumptions_tested"] = sum(
            1 for a in assumptions.get("assumptions", [])
            if a.get("status") in ("validated", "invalidated")
        )
        data["assumptions_data"] = [
            {
                "id": a["id"],
                "hypothesis": a["hypothesis"],
                "type": a["type"],
                "status": a["status"],
                "risk": a.get("risk", 5),
                "uncertainty": a.get("uncertainty", 5),
                "priority": a.get("priority_score", 25),
            }
            for a in assumptions.get("assumptions", [])
        ]

    return data


def cmd_export_gdocs(args) -> None:
    """Export discovery data to Google Docs."""
    import os as _os
    sa_file = _os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE") or getattr(args, "service_account", None)

    if not sa_file:
        print("❌ GOOGLE_SERVICE_ACCOUNT_FILE required.")
        print("   Set in .env or pass --service-account path/to/key.json")
        sys.exit(1)

    try:
        from product_discovery.integrations.gdocs_export import export_to_gdocs
    except ImportError:
        print("❌ Google Docs dependencies not installed: pip install product-discovery[gdocs]")
        sys.exit(1)

    data = _load_project_data(args.project, args.output)
    if not data:
        print(f"❌ No data found for project '{args.project}'")
        sys.exit(1)

    share_emails = args.share_with.split(",") if getattr(args, "share_with", None) else None

    export_to_gdocs(
        project_name=args.project,
        discovery_data=data,
        service_account_file=sa_file,
        share_with=share_emails,
        template_id=getattr(args, "template_id", None),
    )


def cmd_industry(args) -> None:
    """Manage industry context."""
    from product_discovery.tools.industry_context import IndustryStore
    store = IndustryStore(base_dir=str(Path(args.output) / "_industry_context"))

    if args.action == "list":
        slugs = store.list()
        if not slugs:
            print("No industry contexts yet. Create one: industry init <slug>")
        else:
            for s in slugs:
                ctx = store.get(s)
                print(f"  {s:<20} {ctx.completeness}% complete  ({ctx.sessions_count} sessions)")
    elif args.action == "show":
        ctx = store.get(args.slug)
        if ctx:
            print(ctx.summary())
        else:
            print(f"❌ No context for '{args.slug}'")
    elif args.action == "init":
        ctx = store.init(args.slug, display_name=args.name or "")
        print(f"✅ Created: {ctx.slug} ({ctx.display_name})")
    elif args.action == "enrich":
        data = _load_project_data(args.project or "unnamed", args.output)
        ctx = store.enrich_from_discovery(args.slug, data or {})
        print(f"✅ Enriched: {ctx.slug} → {ctx.completeness}% complete")
    elif args.action == "import":
        if not args.file:
            print("❌ --file required for import")
            sys.exit(1)
        text = Path(args.file).read_text(encoding="utf-8")
        ctx = store.enrich_from_text(args.slug, text, source=args.file)
        print(f"✅ Imported {len(text)} chars → {ctx.slug}")


def cmd_solutions(args) -> None:
    """Manage solutions impact/effort matrix."""
    from product_discovery.tools.impact_effort import SolutionBoard
    board = SolutionBoard.load(args.project, args.output)

    if args.action == "add":
        if not args.name:
            print("❌ --name required"); sys.exit(1)
        s = board.add(args.name, impact=args.impact or 5, effort=args.effort or 5)
        board.save(args.output)
        print(f"✅ {s.id}: {s.name} → {s.quadrant_label}")
    elif args.action == "list":
        print(board.summary_table())
    elif args.action == "matrix":
        print(board.summary_table())


def cmd_score(args) -> None:
    """Score a discovery session."""
    from product_discovery.tools.scoring_rubric import score_discovery
    data = _load_project_data(args.project, args.output)
    if not data:
        print(f"❌ No data for project '{args.project}'"); sys.exit(1)
    result = score_discovery(args.project, data)
    print(result.summary())


def cmd_templates(args) -> None:
    """Show available session templates."""
    from product_discovery.templates.session_templates import show_all_templates, get_template
    if args.show:
        t = get_template(args.show)
        if t:
            print(t.summary())
        else:
            print(f"❌ Unknown template: {args.show}")
    else:
        print(show_all_templates())


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
            "  product-discovery generate-prd --project design-tool\n"
            "  product-discovery import-interviews --project X --dir ./transcripts/\n"
            "  product-discovery export-report --project X --theme dark --open\n"
            "  product-discovery assumptions add --project X --hypothesis 'Users want X'\n"
            "  product-discovery export-miro --project X\n"
            "  product-discovery export-gdocs --project X --share-with user@email.com"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    # Subcommands
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # generate-prd subcommand
    prd_parser = subparsers.add_parser("generate-prd", help="Generate PRD from discovery results")
    prd_parser.add_argument("--project", "-p", required=True, help="Project name")
    prd_parser.add_argument("--output", "-o", default="projects", help="Output directory")

    # import-interviews subcommand
    imp_parser = subparsers.add_parser("import-interviews", help="Import real interview transcripts")
    imp_parser.add_argument("--project", "-p", required=True, help="Project name")
    imp_parser.add_argument("--file", "-f", help="Single interview file")
    imp_parser.add_argument("--dir", "-d", help="Directory with interview files")
    imp_parser.add_argument("--output", "-o", default="projects", help="Output directory")

    # export-report subcommand
    rep_parser = subparsers.add_parser("export-report", help="Generate interactive HTML report")
    rep_parser.add_argument("--project", "-p", required=True, help="Project name")
    rep_parser.add_argument("--output", "-o", default="projects", help="Output directory")
    rep_parser.add_argument("--theme", "-t", default="dark", choices=["dark", "light"], help="Theme")
    rep_parser.add_argument("--open", action="store_true", help="Auto-open in browser")

    # assumptions subcommand
    asm_parser = subparsers.add_parser("assumptions", help="Manage assumption board")
    asm_parser.add_argument("action", choices=["list", "add", "update", "prioritize", "stats"])
    asm_parser.add_argument("--project", "-p", required=True, help="Project name")
    asm_parser.add_argument("--output", "-o", default="projects", help="Output directory")
    asm_parser.add_argument("--hypothesis", help="Assumption hypothesis text")
    asm_parser.add_argument("--type", choices=["desirability", "viability", "feasibility", "usability", "ethical"])
    asm_parser.add_argument("--risk", type=int, help="Risk score 1-10")
    asm_parser.add_argument("--uncertainty", type=int, help="Uncertainty score 1-10")
    asm_parser.add_argument("--id", help="Assumption ID (for update)")
    asm_parser.add_argument("--status", choices=["untested", "testing", "validated", "invalidated"])
    asm_parser.add_argument("--result", help="Test result description")
    asm_parser.add_argument("--evidence-level", type=int, help="Evidence level 0-4")

    # export-miro subcommand
    miro_parser = subparsers.add_parser("export-miro", help="Export to Miro board")
    miro_parser.add_argument("--project", "-p", required=True, help="Project name")
    miro_parser.add_argument("--output", "-o", default="projects", help="Output directory")
    miro_parser.add_argument("--token", help="Miro access token (or set MIRO_ACCESS_TOKEN)")
    miro_parser.add_argument("--board-id", help="Miro board ID (or set MIRO_BOARD_ID)")
    miro_parser.add_argument("--sections", help="Comma-separated: ost,forces,assumptions,all")

    # export-gdocs subcommand
    gdocs_parser = subparsers.add_parser("export-gdocs", help="Export to Google Docs")
    gdocs_parser.add_argument("--project", "-p", required=True, help="Project name")
    gdocs_parser.add_argument("--output", "-o", default="projects", help="Output directory")
    gdocs_parser.add_argument("--service-account", help="Path to service account JSON (or GOOGLE_SERVICE_ACCOUNT_FILE)")
    gdocs_parser.add_argument("--share-with", help="Comma-separated emails to share doc with")
    gdocs_parser.add_argument("--template-id", help="Google Doc template ID to copy from")

    # industry subcommand
    ind_parser = subparsers.add_parser("industry", help="Manage industry context")
    ind_parser.add_argument("action", choices=["list", "show", "init", "enrich", "import"])
    ind_parser.add_argument("slug", nargs="?", default="")
    ind_parser.add_argument("--name", help="Display name for new industry")
    ind_parser.add_argument("--project", "-p", help="Project to enrich from")
    ind_parser.add_argument("--output", "-o", default="projects", help="Output directory")
    ind_parser.add_argument("--file", "-f", help="File to import notes from")

    # solutions subcommand
    sol_parser = subparsers.add_parser("solutions", help="Impact/Effort matrix")
    sol_parser.add_argument("action", choices=["add", "list", "matrix"])
    sol_parser.add_argument("--project", "-p", required=True, help="Project name")
    sol_parser.add_argument("--output", "-o", default="projects", help="Output directory")
    sol_parser.add_argument("--name", help="Solution name")
    sol_parser.add_argument("--impact", type=int, help="Impact score 1-10")
    sol_parser.add_argument("--effort", type=int, help="Effort score 1-10")

    # score subcommand
    scr_parser = subparsers.add_parser("score", help="Score discovery session quality")
    scr_parser.add_argument("--project", "-p", required=True, help="Project name")
    scr_parser.add_argument("--output", "-o", default="projects", help="Output directory")

    # templates subcommand
    tpl_parser = subparsers.add_parser("templates", help="List session templates")
    tpl_parser.add_argument("--show", help="Show specific template by ID")

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
        "--industry",
        help="Industry slug for context (e.g. fintech, edtech)",
    )
    parser.add_argument(
        "--template",
        choices=["new_product", "improvement", "competitive_intel", "recruitment", "workshop"],
        help="Session template for workflow",
    )
    parser.add_argument(
        "--notify-slack",
        action="store_true",
        help="Send Slack notification on completion",
    )
    parser.add_argument(
        "--lang",
        default="pl",
        choices=["pl", "en"],
        help="Language for output (default: pl)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check imports and environment, then exit",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 1.0.0",
    )

    args = parser.parse_args()

    # Load .env
    load_dotenv()

    # Set language
    try:
        from product_discovery.i18n import set_default_language
        set_default_language(args.lang if hasattr(args, "lang") else "pl")
    except (ImportError, AttributeError):
        pass

    # Handle subcommands
    if args.command == "generate-prd":
        if not check_environment():
            sys.exit(1)
        asyncio.run(generate_prd(args.project, args.output))
        return

    if args.command == "import-interviews":
        cmd_import_interviews(args)
        return

    if args.command == "export-report":
        cmd_export_report(args)
        return

    if args.command == "assumptions":
        cmd_assumptions(args)
        return

    if args.command == "export-miro":
        cmd_export_miro(args)
        return

    if args.command == "export-gdocs":
        cmd_export_gdocs(args)
        return

    if args.command == "industry":
        cmd_industry(args)
        return

    if args.command == "solutions":
        cmd_solutions(args)
        return

    if args.command == "score":
        cmd_score(args)
        return

    if args.command == "templates":
        cmd_templates(args)
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

