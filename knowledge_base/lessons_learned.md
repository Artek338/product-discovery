# Lessons Learned

*Automatically updated from violation pattern analysis*

## [2026-02-17] Discovery Phase Skipped/Inadequate → Wrong Product Built (CRITICAL)

**Pattern Detected:** ❌ **CRITICAL FAILURE** - Discovery phase was skipped/inadequate for garden-design-app, resulting in building technically functional but completely inadequate product.

**User Feedback (Direct Quote):**
> "aplikacja działa, ale wygląda tragicznie i w żaden sposób nie przypomina współczesnych aplikacji oraz nie pozwala wykonać choćby szkicu ogrodu. To jest zwykła mapa w dużej skali, gdzie mój ogród ma ok 1x2cm wielkości [...] Discovery jest kluczowe i powinno zawierać wskazania dla agentów na temat opcji aplikacji, które pozyskuje się poprzez wywiad z użytkownikiem i analizę konkurencyjnych aplikacji. W tym przypadku ewidentnie to zawiodło."

> "Opcja A. Stronę z przeglądem aplikacji podałem jako przykład, a są ich setki, ale agent OSINT nie wykonał swojej pracy. Wracamy do samego początku, bo to kurwa skandal."

**What Was Built (WITHOUT Discovery):**
- Backend: 450 lines (FastAPI, GUGiK LIDAR, WMS tiles)
- Frontend: Canvas with Fabric.js, 8 drawing tools
- Status: ✅ Technically works, ❌ Completely unusable

**Critical Failures:**
1. ❌ No Behavioral Interview → missed user needs (slope viz, zoom, artistic style)
2. ❌ No Competitive Analysis → OSINT didn't research landscape design software
3. ❌ No Visual Style Validation → built satellite map, user wanted artistic sketches
4. ❌ No Use Case Prioritization → built wrong features

**Impact:**
- Time wasted: 6h (backend + frontend)
- User frustration: EXTREME
- Rework: 100% - complete rebuild
- ROI of skipping Discovery: NEGATIVE (wasted 6h to save 1.5h)

**Fix Applied:**
✅ Completed proper Discovery (documented in `projects/garden-design-app/docs/DISCOVERY.md`)
- Behavioral Interview: 10 questions answered
- Competitive Analysis: 10+ landscape design tools analyzed
- Visual References: 11 Pinterest examples analyzed
- Evidence Level: 2+ achieved
- Discovery Value Scorecard: ROI 5-8x (1.5h invested, 8-12h saved)

**Prevention - MANDATORY Discovery Checklist:**

❌ **NEVER** delegate to technical agents BEFORE Discovery complete
✅ **ALWAYS** complete these steps FIRST:

1. **Behavioral Interview** - Ask user about current workflow, pain points, requirements
2. **Competitive Analysis** - OSINT research 5-10 similar products
3. **Visual Style Validation** - Get user examples (Pinterest, competitors) if applicable
4. **Use Case Prioritization** - MoSCoW method with user validation
5. **Evidence Level 2+** - Past behavior + references + constraints
6. **Discovery Value Scorecard** - Document ROI, confidence gain

**Enforcement Rules:**
- **project-orchestrator**: Verify DISCOVERY.md exists before delegating to backend/frontend/ui agents
- **business-analyst**: ALWAYS deliver Discovery with behavioral interview + competitive analysis
- **osint-researcher**: Actually DO the research (user called out: "agent OSINT nie wykonał pracy")

**Red Flags:**
- ⚠️ Technical implementation starting before Business Analyst completes Discovery
- ⚠️ No DISCOVERY.md document in project
- ⚠️ Making visual design assumptions without user examples
- ⚠️ Skipping competitive research

**Status:** ✅ Pattern identified, Prevention rules established, Discovery V2 completed

---

## [2026-02-23] FATAL Assumptions — Case Studies z Dużych Produktów

**Źródło:** NotebookLM synthesis z ~30 product discovery case studies.

**Cel:** Wzorce dla AssumptionMapNode — przykłady FATAL assumptions które kosztowały miliardy.

### Case Study 1: Meta Reality Labs — $50B na nieprzetestowanym założeniu

**FATAL Assumption:** "Immersyjne cyfrowe światy VR to kolejna masowa platforma obliczeniowa i użytkownicy chętnie się do niej przeniosą."

| Pytanie | Stan przed budową | Co odkryto |
|---|---|---|
| Czy użytkownicy ADOPTUJĄ VR do codziennych zadań? | ZAŁOŻONE — nie przetestowane | Adopcja "uparcie niszowa" mimo nakładów |
| Czy jest wystarczający Pull (konkretna wartość)? | ZAŁOŻONE | VR brakuje killer app dla mas |
| Czy Anxiety (przeszkody fizyczne, cena, izolacja) jest niższa niż Push? | ZAŁOŻONE | Anxiety znacznie wyższa niż zakładano |

**Kiedy odkryto:** Po zainwestowaniu >$50B i >$13B rocznych strat.
**Koszt:** $50B+ stracony kapitał, utrata zaufania inwestorów, stock drop.

**Pytanie którego nie zadano PRZED budową:**
> "Opowiedz mi o ostatnim razie, kiedy chciałeś zrobić coś w VR zamiast na ekranie komputera — co konkretnie?"

---

### Case Study 2: Amazon Alexa — Adopcja bez PMF na monetyzacji

**FATAL Assumption:** "Skoro miliony korzystają z Alexy codziennie, można to łatwo spieniężyć przez voice shopping i personalizowane reklamy."

| JTBD | Przetestowany | Wynik |
|---|---|---|
| JTBD adopcji (asystent w domu) | ✅ Tak | Sukces — miliony urządzeń |
| JTBD monetyzacji (zakupy głosowe, reklamy) | ❌ Nie | FATAL MISS — miliardy strat |

**Anxiety której nie odkryto:** "Zawsze nasłuchujące urządzenie" + personalizowane reklamy = gigantyczny lęk o prywatność. Klienci nie kupowali głosem i blokowali reklamy.

**Kiedy odkryto:** Po masowej adopcji — za późno na fundamentalną zmianę modelu.
**Koszt:** Miliardy dolarów strat operacyjnych. Produkt z adopcją 100M+ użytkowników stał się obciążeniem.

**Lekcja kluczowa:** Adopcja i monetyzacja to dwa OSOBNE switch decisions z osobnymi Forces Diagram. Masz obowiązek testować oba.

**Pytanie którego nie zadano:**
> "Opowiedz mi o ostatnim razie, kiedy kupiłeś coś przez telefon/internet — jak to wyglądało krok po kroku? Czy zrobiłbyś to samo głosem?"

---

**Implikacja dla AssumptionMapNode:**
Każdy produkt musi mieć ODDZIELNĄ mapę założeń dla:
1. Adopcji (czy użytkownicy w ogóle będą używać)
2. Retencji (czy będą wracać)
3. Monetyzacji (czy zapłacą / pozwolą na reklamy)

Brak testu założenia monetyzacyjnego = FATAL ASSUMPTION niezależnie od poziomu adopcji.

---

## [2026-02-17] User Feedback Integration - RICE Visibility & Automatic Learning Loop

**Pattern Detected:** ✅ **ENHANCEMENT** - User provided detailed feedback after garden-design-app test with specific improvement areas.

**User Feedback (Direct Quote):**

**Plus:**
- ✅ "Duża autonomia oraz punkty kontrolne wraz z rekomendacjami"
- ✅ "Backend-architect był asertywny (ChromaDB decision)"
- ✅ "Learning loop był wartościowy"
- ✅ "Będę korzystał z Product Builder do coraz trudniejszych zadań"

**Minus:**
- ❌ "Nie miałem podglądu do listy priorytetów RICE, przez co czuję się trochę niekomfortowo"
- ❌ "Takie rzeczy powinny znajdować się w dokumentacji, a użytkownik powinien świadomie wybierać opcje aplikacji, na których mu zależy + mieć wgląd w alternatywne propozycje pozyskane za pośrednictwem researchu i analizy rynkowej"

**Improvement Needed:**
- 💡 "Learning loop powinien wykonywać się automatycznie po każdym checkpoint"
- 💡 "Do rekomendacji można dodać trochę więcej kontekstu opartego o Use Case pozwalający lepiej zrozumieć kierunki developmentu produktu"
- 🤔 "Discovery phase - czy dostarczy maksymalną wartość?" (uncertainty)

**Root Cause:**

Product Builder lacked transparency in decision-making process:
1. RICE scoring was done internally but not shown to user in checkpoints
2. Learning Loop required manual trigger instead of automatic execution
3. Recommendations were technically correct but lacked business/Use Case context
4. Discovery value proposition unclear to user

**Impact:**

🟡 **MEDIUM-HIGH SEVERITY** - Affects user trust and transparency
- User discomfort ("czuję się trochę niekomfortowo") due to invisible RICE decisions
- Manual overhead (user has to ask for Learning Loop)
- Suboptimal decision making (missing Use Case context)
- Uncertainty about discovery value

**Fix Applied:**

**1. RICE Visibility Enhancement:**
- ✅ Created `templates/checkpoint_template.md` with mandatory RICE scoring table
- ✅ Updated `project_orchestrator.md` - CHECKPOINT section requires showing:
  - RICE scoring table for ALL prioritization decisions
  - Alternatives considered with scoring rationale
  - Trade-offs (pros/cons/risks)
  - Use Case context explaining business value

**Example format:**
```markdown
| Option | Reach | Impact | Confidence | Effort | RICE Score | Ranking |
|--------|-------|--------|------------|--------|------------|---------|
| A      | 50    | 3      | 100%       | 2      | **75**     | #1 ⭐   |
| B      | 30    | 1      | 80%        | 0.5    | **48**     | #2      |

**Why Option A:** Enables viral invite flow (Use Case), 6-8h savings per project
**Alternatives:** Option B has lower effort but minimal impact
```

**2. Automatic Learning Loop:**
- ✅ Updated `protocols/learning_loop.md` - now AUTOMATIC after every checkpoint
- ✅ Updated `protocols/retrospective_workflow.md` - auto-execution clarified
- ✅ Updated `project_orchestrator.md` - CHECKPOINT section includes automatic learning loop trigger
- ✅ User will be notified: "Learning loop complete. [X] lessons recorded."

**3. Use Case Context in Recommendations:**
- ✅ Updated delegation template in `project_orchestrator.md`:
  - Added "🎯 Use Case Context (CRITICAL)" section
  - Requires: Target User, User Journey, Business Value, Success Criteria
  - Example: "Build social login to enable viral invite flow (converts 40% to team plans)"
  - Expected output must include "Use Case Impact" explaining business value

**4. Discovery Phase Enhancement:**
- ✅ Created proposal: `docs/enhancements/discovery_phase_value_enhancement.md`
- 🚧 Includes:
  - Discovery Value Scorecard (ROI, assumptions validated/invalidated, evidence level)
  - Continuous Discovery integration (weekly touchpoints)
  - Framework Utilization Checklist (ensures completeness)
  - Structured Output integration (DWTHON insights - Pydantic schemas)

**Prevention:**

- **project-orchestrator**: ALWAYS use checkpoint_template.md for ALL checkpoints
- **ALL agents**: Include Use Case context in recommendations (business value, not just technical rationale)
- **Learning Loop**: AUTOMATIC after every checkpoint (no manual trigger)
- **Discovery**: Show value delivered (scorecard with ROI, confidence gain, evidence level)
- **Quality check**: Before checkpoint, ask: "Did I show RICE scoring table? Alternatives? Use Case context? Trade-offs?"

**Status:** ✅ Implemented (4 enhancements complete), Discovery enhancement proposal ready for RICE scoring

---

## [2026-02-17] LLM Asks User for Technical Details (Should Delegate to Agent)

**Pattern Detected:** LLM bypasses agent delegation and asks user directly for technical details during garden-design-app backend implementation.

**Details:**
- LLM prepared to ask user about: backend environment setup, API credentials, testing scope, deployment target
- **Should have:** Delegated to backend-architect who has expertise to decide these details autonomously
- User intervened: "Dlaczego te pytania nie wcześniej? Twoja interpretacja czy Product Builder?"
- LLM self-corrected: Admitted mistake, delegated to backend-architect, who decided autonomously

**Root Cause:**

LLM interpreted "checkpoint with user" as "ask user for every technical decision" instead of "backend-architect decides, then presents to user for approval". QUICK_START.md says "Delegate to backend-architect" but doesn't explicitly say "DON'T ask user for technical details".

**Impact:**

🔴 **CRITICAL SEVERITY (RICE: 320)** - Affects 80 projects/quarter
- Broken workflow (agent expertise wasted)
- User frustration ("testujemy Product Builder, nie Twoje pomysły")
- Delays (waiting for user response on questions agent should answer)
- Lower quality (user doesn't have agent's technical expertise)

**Fix Applied:**

- ✅ LLM self-corrected in real-time (admitted mistake, changed approach)
- ✅ Backend-architect made all technical decisions autonomously (no DB, ChromaDB Phase 2, caching strategy)
- ✅ User approved architecture design AFTER decisions (not during)

**Prevention:**

- **ALL agents with technical expertise**: Make decisions autonomously. DON'T ask user for technical details. User approves architecture AFTER design, not during.
- **project-orchestrator**: Delegation template should include: "Agent decides autonomously. Present final design to user for approval."
- **QUICK_START.md**: Add explicit rule: "Agents decide technical details. User approves outcomes, not individual decisions."
- **Quality check**: Before asking user a question, ask: "Does this require user's business judgment OR agent's technical expertise?" If technical → delegate to agent.

**Status:** ✅ Pattern identified, prevention documented, enforcement via protocol clarification

---

## [2026-02-17] Backend-Architect Autonomous Decision Making (Success Pattern)

**Pattern Detected:** ✅ **POSITIVE** - Backend-architect made technical decisions autonomously without asking user during garden-design-app.

**Details:**
- **Decision 1:** No database in MVP (in-memory + file caching sufficient)
  - Rationale: YAGNI - single user, data from external APIs
  - User response: Approved immediately
- **Decision 2:** ChromaDB in Phase 2 (not MVP)
  - Analysis: ChromaDB = vector DB (semantic search), MVP = GIS data (geometry)
  - Presented 3 options with clear rationale
  - User response: Chose Option 1 (approved)
- **Decision 3:** Sequential implementation (Backend → Frontend)
  - Rationale: Frontend needs working API endpoints
  - User response: Approved ("Opcja A, kontynuuj")

**Why It Worked:**

- ✅ Backend-architect analyzed requirements (PRD, TECH_SPEC, PROJECT.md)
- ✅ Made technical decisions with clear rationale
- ✅ Presented architecture design for approval (not asking "what should I do?")
- ✅ User approved outcomes quickly (clear decisions → fast buy-in)

**Impact:**

🟢 **HIGH VALUE** - Demonstrates correct Product Builder workflow
- Time saved: ~30min (no back-and-forth on technical details)
- Quality: Expert decisions (backend-architect knows best practices)
- User satisfaction: "Opcja A, kontynuuj" (twice - smooth workflow)

**Reinforcement:**

- ✅ **ALL technical agents**: Follow this pattern - analyze, decide, present for approval
- ✅ **project-orchestrator**: Delegation template already correct - continue using
- ✅ **Backend-architect**: Current approach works - maintain autonomy

**Status:** ✅ Success pattern - reinforce in future projects

---

## [2026-02-08] LLM Skipping Onboarding Instructions

**Pattern Detected:** LLM ignored Product Builder structure (SYSTEM.md, LESSONS.md, frameworks) and improvised "own way" during healthforge-calendar-wizard project.

**Details:**
- LLM did not read SYSTEM.md (entry point) before starting
- Did not check LESSONS.md (avoid known mistakes)
- Did not load agents/core/product-manager/frameworks/ (used generic approach instead)
- Did not use existing templates (created retrospective from scratch)
- Result: Manual mockups (6-8h), brand consistency errors, framework underutilization (26% - used 5/19 frameworks)

**Root Cause:**

No enforcement mechanism to ensure LLM reads onboarding files. README.md mentions SYSTEM.md as "entry point" but LLM could skip without consequence. No pre-flight checklist to verify required files were read.

**Impact:**

🔴 **CRITICAL SEVERITY** - LLM improvising instead of using Product Builder structure produces:
- Lower quality output (generic vs framework-driven)
- Manual work (mockups, validation, corrections)
- Wasted time (user has to correct/remind)
- Missed frameworks (RICE used, but DHM/OKR/Opportunity Trees ignored)
- User frustration ("pomimo jasnych instrukcji robiłeś po swojemu")

**Fix Applied:**

- ✅ Created MANDATORY_CHECKLIST.md (top-level fail-safe)
  - Pre-flight checklist BEFORE any task
  - Self-check questions (Did you read SYSTEM.md? LESSONS.md? etc.)
  - Quick Start guide links for each task type

- ✅ Created QUICK_START.md (step-by-step workflows)
  - 6 task types: New Product, Discovery, Prioritization, Documentation, Retrospective, Technical
  - Each with detailed step-by-step process
  - Which agents to load, which frameworks to use, expected output

- ✅ Created protocols/retrospective_workflow.md (structured retrospective)
  - 6-step process: GATHER → REFLECT → ANALYZE (RICE) → RECORD → IMPROVE → COMMIT
  - Prevents ad-hoc retrospectives, ensures RICE analysis of problems

- ✅ Updated README.md with enforcement
  - "STOP! If You're an LLM" section at top
  - Mandatory file reading list in order
  - Clear consequence: "produces lower quality output and wastes time"

**Prevention:**

- **ALL LLMs**: Read MANDATORY_CHECKLIST.md FIRST before ANY task
- **project-orchestrator**: Verify LLM completed pre-flight checklist
- **ALL agents**: Reference existing frameworks (don't improvise)
- **Retrospectives**: ALWAYS use retrospective_workflow.md protocol (RICE analysis)
- **Quality check**: Did you use existing Product Builder structure or create from scratch? (If latter, STOP and use structure)

**Status:** ✅ Enforcement active - MANDATORY_CHECKLIST.md blocks improvisation

---

## [2026-02-03] Template Validation: TODO Pattern in Documents

**Pattern Detected:** 4 occurrences of forbidden_pattern

**Details:**
- TODO (3 times)
- TBD without reason (1 times)

**Root Cause:**

Agents use placeholder patterns (TODO/TBD) instead of completing content or explicitly marking what's blocked.

**Impact:**

🔴 **HIGH SEVERITY** - Affects 4 documents, blocking delivery quality

**Fix Applied:**

- ✅ Template validation detects TODO/TBD patterns automatically
- ✅ Agents instructed to use `[TBD: reason]` format when blocked

**Prevention:**

- **spec-writer**: Review template requirements before generating output
- **prd-writer**: Review template requirements before generating output
- NEVER use standalone TODO - always specify what's blocked and why

**Status:** ✅ Automated enforcement active (template validation + self-check)

---

## [2026-02-03] Missing Section Pattern Detected

**Pattern Detected:** 1 occurrences of missing_section

**Details:**
- ## 3. Goals & Success Metrics (1 times)

**Root Cause:**

Pattern analysis suggests systematic issue with missing_section.

**Impact:**

🟡 **MEDIUM SEVERITY** - Affects 1 documents, reducing output quality

**Fix Applied:**


**Prevention:**

- **prd-writer**: Review template requirements before generating output

**Status:** ✅ Automated enforcement active (template validation + self-check)

---

## [2026-02-03] Template Validation: Missing ## 3. Goals & Success Metrics Pattern

**Pattern Detected:** 1 occurrences of missing_required_section

**Details:**
- ## 3. Goals & Success Metrics (1 times)

**Root Cause:**

Agents skip required sections when context is incomplete or when rushing to deliver output.

**Impact:**

🟡 **MEDIUM SEVERITY** - Affects 1 documents, reducing output quality

**Fix Applied:**

- ✅ Template validation now blocks output missing required sections
- ✅ Pre-flight self-check enforces completeness verification

**Prevention:**

- **prd-writer**: Review template requirements before generating output
- ALWAYS verify all template sections present before delivery

**Status:** ✅ Automated enforcement active (template validation + self-check)

---

