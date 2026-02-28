# 🔍 Product Discovery

**AI-powered product/service discovery toolkit** — complete JTBD analysis, synthetic interviews, competitive research, and evidence-based GO/NO-GO decisions.

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What is this?

Product Discovery is a **structured, AI-driven discovery process** that prevents building products nobody wants. It enforces evidence-based decision making through:

1. **🎭 Synthetic User Interviews** — Generate psychological archetypes and simulate interviews before talking to real users
2. **🗣️ Behavioral Interview Analysis** — Validate interview questions against Mom Test / Forces Diagram methodology
3. **🔎 Competitive Intelligence** — OSINT research using Perplexity AI, DuckDuckGo, HackerNews
4. **📊 Evidence Grading** — 6-level evidence scale (0_Opinion → 5_Cash) that blocks weak verdicts
5. **⚖️ Forces Diagram** — Push/Pull/Anxiety/Habit analysis (Bob Moesta) predicting user switch likelihood
6. **🗺️ Assumption Mapping** — Identify and classify critical assumptions (FATAL/RISKY/SAFE)
7. **📋 PRD Generation** — Structured Product Requirements Documents
8. **🏆 GO/NO-GO Verdict** — Evidence-backed decision with confidence scoring

## 🏗️ Architecture

```
Discovery Graph (8 nodes, sequential):

SyntheticInterviewNode → BehavioralInterviewNode → CompetitiveResearchNode
    → EvidenceGradingNode → ForcesDiagramNode → SynthesisNode
    → AssumptionMapNode → ScorecardNode → GO/NO-GO/NEEDS_MORE_DATA
```

Each node must pass a **gate check** before the workflow proceeds.

## ⚡ Quick Start

### 1. Install

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery
pip install -e .
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Verify installation

```bash
product-discovery --check
```

### 4. Run discovery

```bash
# Basic discovery
product-discovery "SaaS for freelance UX designers managing 5-15 clients" --project ux-tool

# With interview notes
product-discovery "AI-powered cooking assistant" --project cook-ai --interviews notes/interviews.md
```

## 🤖 Agents

| Agent | Role | Key Framework |
|-------|------|---------------|
| **Business Analyst** | JTBD analysis, evidence grading, GO/NO-GO | Jobs-to-be-Done, Forces Diagram |
| **Synthetic User** | Generate 4 market archetypes, simulate interviews | Big Five, OCEAN, behavioral psychology |
| **Interview Coach** | Validate questions, improve interview technique | Mom Test, Cognitive Interview |
| **OSINT Researcher** | Competitive intelligence, market sizing | Perplexity AI, DuckDuckGo, HN |
| **Product Manager** | RICE scoring, LNO assessment, feature creep check | RICE, DHM, Pre-Mortem |

## 📁 Project Structure

```
src/product_discovery/
├── agents/              # 5 AI agents with pydantic-ai
│   ├── business_analyst/  # JTBD, evidence, GO/NO-GO
│   ├── synthetic_user/    # Archetype generation + interview sim
│   ├── interview_coach/   # Question validation + improvement
│   ├── osint_researcher/  # Competitive intelligence
│   └── product_manager/   # RICE, LNO, feature creep
├── workflows/           # Discovery graph (pydantic-graph state machine)
├── tools/               # CLI utilities (behavioral interview, web research)
└── cli.py               # Main entry point

knowledge_base/          # Methodology docs, lessons learned
templates/               # PRD, interview log, stakeholder map templates
docs/                    # Architecture, discovery guide, glossary
```

## 🧪 Evidence Levels

| Level | Name | Example | Can GO? |
|-------|------|---------|---------|
| 0 | Opinion | "I think users would like it" | ❌ |
| 1 | Preference | "Would you buy this?" → "Yes" | ❌ |
| 2 | Past Behavior | "Tell me about the LAST time you..." | ⚠️ Minimum |
| 3 | Time Commitment | Beta signup, waitlist join | ✅ |
| 4 | Financial | Deposit, preorder | ✅ |
| 5 | Cash | Paid full price upfront | ✅ |

**Rule**: GO decision requires minimum `2_Past_Behavior` evidence level.

## 🛠️ Requirements

- **Python 3.11+**
- **Anthropic API key** (Claude) — required
- Perplexity API key — optional (enhanced competitive research)

## 📖 Methodologies Used

- **Jobs-to-be-Done** (Tony Ulwick, Bob Moesta)
- **Forces Diagram** / Switch Interview (Bob Moesta)
- **Continuous Discovery Habits** (Teresa Torres)
- **Mom Test** (Rob Fitzpatrick)
- **Opportunity Solution Trees** (Teresa Torres)
- **RICE Prioritization** (Intercom)
- **DHM Model** (Gibson Biddle, Netflix)
- **Pre-Mortem** (Shreyas Doshi)

## 📄 License

MIT License — see [LICENSE](LICENSE)
