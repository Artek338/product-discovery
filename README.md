# Product Discovery

**AI-powered product discovery toolkit** — JTBD analysis, synthetic interviews, competitive research, evidence-based GO/NO-GO decisions, interactive reports.

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.3.0-green.svg)]()

---

## What's New in v2.3.0

- **Dark Mode** — toggle in the top bar, preference saved automatically
- **Dashboard filters** — filter sessions by mode (Auto / Problem / Solution) and status
- **Interview Simulator — streaming generation** — archetypes appear one by one as they're generated; configurable count (1–8) and market type (B2C / B2B / SaaS / Enterprise / Mixed)
- **Kompendium v2.3** — 25 frameworks total (+10: prioritization × 7, metrics × 4); Risk Checklist rebuilt with severity levels (FATAL / HIGH / MEDIUM) and context-aware filtering (New Product / Feature / Service / AI Product)
- **BA Agent — Business Model Hypothesis** — JTBD → revenue model (per-seat / usage / outcome / freemium / marketplace), Defensibility (DHM), whitespace analysis
- **BA Agent — Assumption Ownership** — every FATAL assumption requires an owner (PM / Eng / Design / Research), deadline, and validation method before GO
- **PM Agent — RICE Calibration Guardrails** — reach uses MAU not registered users, confidence capped at 80% without MVP data, effort gets +40% buffer

---

## What is this?

Product Discovery is a **structured, AI-driven discovery process** that prevents building products nobody wants. It supports the full PM workflow — from idea validation through competitive analysis to export-ready reports.

The tool is available as:
- **Web UI** (recommended) — browser-based, full feature set
- **CLI** — terminal interface for power users

---

## Quick Start

### Option A: Web UI (recommended)

**Requirements:** Python 3.11+, Node.js 18+

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery

# 1. Backend
pip install -e ".[all]"
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY (required)

# 2. Frontend
cd frontend && npm install && cd ..

# 3. Start both
./start_dev.sh
```

Open **http://localhost:5173** in your browser.

> **Windows:** Run backend and frontend manually if `start_dev.sh` doesn't work:
> ```bash
> # Terminal 1
> uvicorn backend.main:app --reload --port 8001
> # Terminal 2
> cd frontend && npm run dev
> ```

---

### Option B: CLI only

```bash
pip install -e ".[all]"
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY

product-discovery "Your idea" --project my-project
```

---

## Configuration

All configuration is done through **Settings** in the Web UI, or by editing `~/.product-discovery/config.json` directly.

| Setting | Description | Required |
|---------|-------------|----------|
| `anthropic_api_key` | Claude API key | **Yes** |
| `data_dir` | Folder for storing projects and database | No (default: `~/.product-discovery/data`) |
| `perplexity_api_key` | For competitive research (OSINT) | No |
| `serper_api_key` | Google search for research | No |
| `brave_api_key` | Alternative search | No |
| `miro_access_token` | Miro board export | No |
| `miro_board_id` | Target Miro board | No |
| `slack_webhook_url` | Slack notifications | No |
| `google_client_id` | Google Docs export | No |
| `google_client_secret` | Google Docs export | No |

### Getting API keys

- **Anthropic** (required): [console.anthropic.com](https://console.anthropic.com)
- **Perplexity**: [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
- **Serper**: [serper.dev](https://serper.dev)
- **Miro**: [developers.miro.com](https://developers.miro.com/docs/getting-started)
- **Slack**: Create an Incoming Webhook at [api.slack.com/apps](https://api.slack.com/apps)

---

## Web UI — Features

### Dashboard
- List of all discovery sessions with status and GO/NO-GO verdict
- Session statistics (completion rate, average score)
- Search and filter

### New Discovery
Fill in the form and click **Launch Discovery**:
- **Project name** — used as identifier
- **Idea** — describe your product idea (1–3 sentences)
- **Mode** — Auto (full analysis), Problem (validate the pain), Solution (what/how to build)
- **Notes** — paste raw interview transcripts or market notes

Discovery runs in the background (~2–5 min with Claude Sonnet). Progress is shown in real time.

### Report
After completion, the report includes:
- **Verdict** — GO / NO-GO / PIVOT with score (0–100)
- **Jobs-to-be-Done** — what users are actually trying to accomplish
- **Forces Diagram** — Push/Pull/Anxiety/Habit analysis
- **Assumptions** — ranked by risk and uncertainty
- **Competitive Intelligence** — adjacent products and gaps

**Export options:**
- PDF — browser print (Ctrl+P → Save as PDF)
- Miro — exports as structured board
- Slack — sends summary to your webhook
- Google Docs — saves report to your Drive

### Interview Simulator
Practice discovery interviews with AI personas:
1. **Describe your target segment** (e.g. "UX freelancers, 3–10 clients/year, Poland")
2. **Configure** — set archetype count (1–8) and market type (B2C / B2B / SaaS / Enterprise / Mixed)
3. **Generate archetypes** — AI streams personas one by one with psychology, JTBD hypotheses, red flags
4. **Start interview** — choose an archetype and ask questions
   - Each response includes: answer, quality rating (genuine / detailed / polite lie / vague), hidden thought, follow-up suggestion

### Knowledge Compendium (`/kompendium`)
Reference library for product managers:
- **25 frameworks** across 7 categories: discovery cycles, problem definition, validation, market analysis, artifacts, prioritization, metrics
- **When to use** — comparison table (complexity, cycle time, AI automation level)
- **Risk Checklist** — 53 questions across 9 categories with severity levels (FATAL / HIGH / MEDIUM); context-aware (filters to relevant questions for New Product / Feature / Service / AI Product); persisted progress
- **YODA Data** — pretotyping methodology with scoring calculator and experiment tracker

### Settings
- Change data folder
- Add/update API keys
- Connect Google account (OAuth2)
- Configure Slack webhook
- Toggle Mock Mode (fast testing without LLM calls)
- Dark / light mode toggle (also available in top bar)

---

## Discovery Modes

| Mode | Use when | Duration |
|------|----------|----------|
| **Auto** | You have an idea and want full analysis | ~3–5 min |
| **Problem** | You want to validate a pain point exists | ~2–3 min |
| **Solution** | You have a validated problem, want to know what/how to build | ~2–3 min |

---

## Evidence Levels

| Level | Name | Example | Can GO? |
|-------|------|---------|---------|
| 0 | Opinion | "I think users would like it" | No |
| 1 | Preference | "Would you buy this?" → "Yes" | No |
| 2 | Past Behavior | "Tell me about the LAST time you..." | Minimum |
| 3 | Time Commitment | Beta signup, waitlist | Yes |
| 4 | Financial | Deposit, preorder | Yes |
| 5 | Cash | Paid full price | Yes |

---

## CLI Usage

```bash
# Run full discovery
product-discovery "Your idea description" --project my-project

# Run in specific mode
product-discovery "Your idea" --mode problem --project my-project
product-discovery "Your idea" --mode solution --project my-project

# Interview simulator (interactive REPL)
product-discovery simulate "Target segment description"
product-discovery simulate "Segment" --archetype 2   # Start with archetype 2

# Verify installation
product-discovery --check
```

---

## Architecture

```
product-discovery/
├── backend/          # FastAPI — API, DB, business logic
│   ├── config.py     # User settings (stored in ~/.product-discovery/config.json)
│   ├── db.py         # SQLite via aiosqlite
│   └── routes/       # API endpoints
├── frontend/         # React 18 + Vite + Tailwind
│   └── src/
│       ├── pages/    # Dashboard, NewDiscovery, Report, Simulator, Settings
│       └── components/
├── src/product_discovery/   # Core AI engine
│   ├── workflows/    # LangGraph discovery graph (8 nodes)
│   └── agents/       # BA, Interview Coach, OSINT, PM, Synthetic User
└── e2e/              # Playwright E2E tests
```

### Discovery Graph (8 nodes)

```
SyntheticInterview → BehavioralInterview → CompetitiveResearch → EvidenceGrading
→ ForcesDiagram → Synthesis → AssumptionMap → Scorecard → END
```

---

## Google Docs Setup

To enable Google Docs export:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Docs API** and **Google Drive API**
4. Create OAuth 2.0 credentials (Web Application type)
5. Add `http://localhost:8001/api/auth/google/callback` as Authorized redirect URI
6. Copy Client ID and Client Secret to Settings in the app

---

## E2E Tests

```bash
cd e2e
npm install
# Start backend + frontend first (./start_dev.sh)
npx playwright test              # All tests
npx playwright test --ui         # Interactive mode
npx playwright test 01-dashboard # Specific spec
```

See [e2e/README.md](e2e/README.md) for details.

---

## Methodologies

- **Jobs-to-be-Done** (Tony Ulwick, Bob Moesta)
- **Forces Diagram / Switch Interview** (Bob Moesta)
- **Continuous Discovery Habits** (Teresa Torres)
- **Mom Test** (Rob Fitzpatrick)
- **Opportunity Solution Trees** (Teresa Torres)
- **RICE Prioritization** (Intercom)
- **DHM Model** (Gibson Biddle)

---

## License

MIT License — see [LICENSE](LICENSE)
