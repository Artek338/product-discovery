# 🔍 Product Discovery

**AI-powered product/service discovery toolkit** — JTBD analysis, synthetic interviews, competitive research, evidence-based GO/NO-GO decisions, assumption tracking, and interactive reports.

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)]()

[🇵🇱 Wersja polska](README_PL.md) | [📖 User Guide](docs/USER_GUIDE.md)

---

## 🎯 What is this?

Product Discovery is a **structured, AI-driven discovery process** that prevents building products nobody wants. It supports the full PM workflow — from idea validation through competitive analysis to export-ready reports.

### Core Capabilities

| Category | Features |
|----------|----------|
| **Discovery** | JTBD analysis, synthetic user interviews, behavioral interview coaching |
| **Research** | OSINT competitive intelligence, adjacent market scanning |
| **Analysis** | Evidence grading (6 levels), Forces Diagram, assumption mapping |
| **Tracking** | Assumption tracker (Torres taxonomy), Impact/Effort matrix, scoring rubric |
| **Export** | Interactive HTML reports, Miro boards, Google Docs, PDF |
| **Knowledge** | Persistent industry context, session templates, multi-language (PL/EN) |
| **Notifications** | Slack webhook integration |

## ⚡ Quick Start

### 1. Install

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery
pip install -e ".[viz]"    # Core + Plotly charts
# Or install everything:
pip install -e ".[all]"
```

### 2. Configure

```bash
cp .env.example .env
# Required:
#   ANTHROPIC_API_KEY=sk-ant-...
# Optional:
#   MIRO_ACCESS_TOKEN=...
#   MIRO_BOARD_ID=...
#   GOOGLE_SERVICE_ACCOUNT_FILE=...
#   SLACK_WEBHOOK_URL=...
```

### 3. Verify

```bash
product-discovery --check
```

### 4. Run discovery

```bash
# Full discovery
product-discovery "SaaS for freelance UX designers" --project ux-tool --industry saas

# Using a template
product-discovery "AI cooking assistant" --project cook-ai --template new_product
```

## 🏗️ Architecture

```
Discovery Graph (8 nodes, sequential):

SyntheticInterviewNode → BehavioralInterviewNode → CompetitiveResearchNode
    → EvidenceGradingNode → ForcesDiagramNode → SynthesisNode
    → AssumptionMapNode → ScorecardNode → GO/NO-GO/NEEDS_MORE_DATA
```

## 📁 Project Structure

```
src/product_discovery/
├── agents/              # 5 AI agents (pydantic-ai)
│   ├── business_analyst/  # JTBD, evidence, GO/NO-GO
│   ├── synthetic_user/    # Archetype generation + interview sim
│   ├── interview_coach/   # Question validation (Mom Test)
│   ├── osint_researcher/  # Competitive intelligence
│   └── product_manager/   # RICE, LNO, feature creep
├── workflows/           # Discovery graph (pydantic-graph)
├── tools/               # Domain tools
│   ├── interview_import.py    # Real interview parsing + NLP
│   ├── assumption_tracker.py  # Torres taxonomy tracker
│   ├── industry_context.py    # Persistent industry knowledge
│   ├── impact_effort.py       # 2×2 solution matrix
│   └── scoring_rubric.py      # Session quality scoring
├── visualizations/      # Charts, diagrams, reports
│   ├── charts.py              # Plotly (5 chart types)
│   ├── mermaid.py             # Mermaid diagrams (4 types)
│   ├── report_html.py         # Interactive HTML report
│   └── report_pdf.py          # PDF export
├── integrations/        # External services
│   ├── miro_export.py         # Miro REST API v2
│   ├── gdocs_export.py        # Google Docs API
│   └── slack_notify.py        # Slack webhooks
├── templates/           # Session templates (5 use cases)
├── strings/             # i18n (PL/EN)
├── i18n.py              # Translation API
└── cli.py               # CLI entry point (10 subcommands)

knowledge_base/          # 6 deep research documents
docs/                    # Architecture, guides
```

## 🖥️ CLI Reference

### Discovery

```bash
product-discovery "idea" --project NAME [--industry SLUG] [--template TYPE]
product-discovery generate-prd --project NAME
```

### Interviews

```bash
product-discovery import-interviews --project NAME --dir ./transcripts/
product-discovery import-interviews --project NAME --file interview1.md
```

### Assumptions

```bash
product-discovery assumptions add --project NAME --hypothesis "Users want X" --type desirability --risk 8 --uncertainty 7
product-discovery assumptions list --project NAME
product-discovery assumptions update --project NAME --id A001 --status validated --result "85% confirmed"
product-discovery assumptions prioritize --project NAME
product-discovery assumptions stats --project NAME
```

### Solutions (Impact/Effort)

```bash
product-discovery solutions add --project NAME --name "Feature Y" --impact 9 --effort 3
product-discovery solutions list --project NAME
product-discovery solutions matrix --project NAME
```

### Industry Context

```bash
product-discovery industry init fintech --name "FinTech"
product-discovery industry show fintech
product-discovery industry enrich fintech --project NAME
product-discovery industry import fintech --file research_notes.md
product-discovery industry list
```

### Export & Reports

```bash
product-discovery export-report --project NAME --theme dark --open
product-discovery export-miro --project NAME [--sections ost,forces,assumptions]
product-discovery export-gdocs --project NAME --share-with team@company.com
```

### Other

```bash
product-discovery score --project NAME       # Quality score (0-100, grade A+→F)
product-discovery templates                  # List session templates
product-discovery --check                    # Verify installation
product-discovery --version                  # Show version
```

## 🧪 Evidence Levels

| Level | Name | Example | Can GO? |
|-------|------|---------|---------|
| 0 | Opinion | "I think users would like it" | ❌ |
| 1 | Preference | "Would you buy this?" → "Yes" | ❌ |
| 2 | Past Behavior | "Tell me about the LAST time you..." | ⚠️ Min |
| 3 | Time Commitment | Beta signup, waitlist | ✅ |
| 4 | Financial | Deposit, preorder | ✅ |
| 5 | Cash | Paid full price | ✅ |

## 📦 Optional Dependencies

```bash
pip install -e ".[viz]"     # Plotly + Kaleido (charts)
pip install -e ".[miro]"    # Miro API (requests)
pip install -e ".[gdocs]"   # Google Docs API
pip install -e ".[docx]"    # .docx interview import
pip install -e ".[pdf]"     # PDF export (Playwright)
pip install -e ".[all]"     # Everything
```

## 📖 Methodologies

- **Jobs-to-be-Done** (Tony Ulwick, Bob Moesta)
- **Forces Diagram** / Switch Interview (Bob Moesta)
- **Continuous Discovery Habits** (Teresa Torres)
- **Mom Test** (Rob Fitzpatrick)
- **Opportunity Solution Trees** (Teresa Torres)
- **RICE Prioritization** (Intercom)
- **DHM Model** (Gibson Biddle, Netflix)
- **Pre-Mortem** (Shreyas Doshi)

## 🧪 Testing

```bash
pytest tests/ -v           # All tests
pytest tests/ -m integration  # Integration only (needs API keys)
```

## 📄 License

MIT License — see [LICENSE](LICENSE)
