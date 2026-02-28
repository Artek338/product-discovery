# Workflow: Discovery

**Cel:** Przekształcenie pomysłu w zwalidowany koncept z jasnym scope.

**Kiedy używać:** Na początku każdego nowego projektu lub feature.

**Output:** Wypełniony PROJECT.md + zwalidowany kierunek

---

## Overview

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DISCOVERY WORKFLOW (GATE-ENFORCED)                            │
│                                                                                  │
│  [CODEBASE] ──▶ CAPTURE ──🔒──▶ RESEARCH ──🔒──▶ VALIDATION ──🔒──▶ SCOPE ──🔒──▶ GO/NO-GO │
│   (optional)         GATE 1          GATE 2            GATE 3          GATE 4    │
│                                                                                  │
│  🔒 = python tools/gate_check.py <project> --phase <phase>                       │
│       Agent CANNOT proceed if gate returns FAIL                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

> **⚠️ ENFORCEMENT RULE:** Before transitioning to the next phase, run the gate check.
> If the gate returns `🚫 GATE BLOCKED`, the agent MUST fix the issues before proceeding.
> There are NO exceptions. Skipping a gate is a CRITICAL violation.

---

## Fazy

### Phase 0: Codebase Analysis (Optional - dla istniejących projektów)

**Agent:** Codebase Analyst

**Cel:** Zrozumieć co już istnieje przed planowaniem nowych funkcji

**Kiedy używać:**

- ✅ Pracujesz z istniejącym codebase
- ✅ Dodajesz feature do działającego produktu
- ✅ Chcesz reuse existing code
- ❌ Skip dla greenfield projects (nowy projekt od zera)

**Input:**

- Path do projektu
- Pomysł (luźny opis co chcesz zbudować)

**Process:**

```
1. Index codebase (jeśli nie zindeksowany)
   - graph indexing: ~10s dla 30 plików
   - Creates graph: classes, functions, relationships

2. Search for relevant components
   - Based on feature description
   - Find: classes, functions, patterns
   - Example: "auth system" → find AuthService, UserRepository, etc.

3. Analyze patterns
   - Naming conventions
   - Architectural patterns (Service layer, Repository, etc.)
   - Common dependencies
   - Reusable components

4. Extract code examples
   - Key classes/functions
   - 2-3 representative snippets
   - Show established patterns

5. Generate findings report
```

**Output:**

- **analysis_report.md**
  - Found components (classes, functions)
  - Observed patterns (Service layer, Repository, etc.)
  - Reusable components classification:
    - ✅ Can reuse as-is
    - ⚠️ Can extend
    - ❌ Need to create
  - Integration recommendations
  - Code examples

- **PROJECT.md update**
  - Section 10 (Current State) populated with findings
  - Lists: existing components, patterns, reuse opportunities

**Checklist:**

- [ ] Codebase indexed (graph created)
- [ ] Relevant components identified (at least 1, or note "greenfield")
- [ ] Patterns documented with examples
- [ ] Reusable components classified
- [ ] Integration recommendations clear
- [ ] PROJECT.md "Current State" updated

**Example:**

```
Input: "Add user authentication"

Analysis finds:
- AuthService (can extend)
- UserRepository (can reuse)
- TokenGenerator (can reuse)
- Pattern: Service → Repository
- Missing: password reset, OAuth

Recommendation: Extend AuthService, don't rebuild from scratch
```

**Timing:**

- Indexing: 10-30s (one-time per project)
- Analysis: 30-60s (queries + synthesis)
- Total: 1-2 min

**Transition:**

```text
Phase 0 (Codebase Analysis) ──▶ Phase 1 (Capture)
                               └─▶ If greenfield, skip to Phase 1
```

---

### Phase 1: Capture (Przechwycenie pomysłu)

**Agent:** Product Manager (lub użytkownik)

**Cel:** Zapisać pomysł w ustrukturyzowanej formie, ustalić fundamenty ("Ground Truth") i rozłożyć problem na czynniki.

**Input:**

- Pomysł od użytkownika (może być luźny)
- **[NEW]** `templates/documents/PROBLEM_DECOMPOSITION.template.md` (Wymagane)

**Process:**

```text
1. Zrozum pomysł
   - Co użytkownik chce zbudować?
   - Dlaczego? (motywacja)
   - Dla kogo? (target user - nawet wstępnie)

2. ZWERYFIKUJ GROUND TRUTH (Non-skippable)
   - Jaki jest dokładny adres / lokalizacja?
   - Jakie są konkretne parametry wejściowe?
   - ZAKAZ założeń geograficznych lub systemowych na tym etapie.

3. PROBLEM DECOMPOSITION (Podział problemu)
   - Symptom (co boli?)
   - Root Cause (dlaczego boli?)
   - Workflow (jak to działa teraz?)
   - Użyj `templates/documents/PROBLEM_DECOMPOSITION.template.md`

4. Zadaj pytania wyjaśniające
   - Co jest core value?
   - Co odróżnia od istniejących rozwiązań?
   - Jaki jest kontekst (firma/prywatny)?

5. Zapisz initial concept
```

**Output:**

- Wstępnie wypełniony PROJECT.md (sekcje 1-2)
- `docs/analysis/problem_decomposition.md`

**Checklist:**

- [ ] Wiadomo CO budujemy (1-2 zdania)
- [ ] Wiadomo DLACZEGO (problem)
- [ ] Problem rozbity na Symptom/Root Cause
- [ ] Wiadomo DLA KOGO (choćby wstępnie)
- [ ] **[CRITICAL] Ground Truth potwierdzony (Adres/TERYT/API existence)**

**💡 Codebase Integration:**
Jeśli Phase 0 wykonana, w tym momencie wiesz:

- Co już istnieje (components found)
- Co można reuse (reusable components)
- Jak to zintegrować (integration recommendations)

Use this to refine concept:

- "Add auth" → "Extend existing AuthService with password reset"
- "Build API" → "Add endpoints to existing BaseController"

**🔒 GATE CHECK (before proceeding to Research):**

```bash
python tools/gate_check.py projects/<project-name> --phase capture
# Must return ✅ GATE PASSED before moving to Phase 2
```

---

### Phase 1.5: Visual Alignment (Wizualna walidacja)

**Agent:** Product Manager / Business Analyst

**Cel:** Zsynchronizować wyobrażenie agenta z wizualnymi faktami dostarczonymi przez użytkownika.

**Input:**

- Zdjęcia terenu, szkice odręczne, inspiracje.

**Process:**

```
1. Przeprowadź szczegółową analizę wizualną obrazów.
   - Jakie obiekty są widoczne? (drzewa, rzeki, murki)
   - Jakie są niuanse terenu? (spadki, bagna, gęstość lasu)

2. Skonfrontuj wizualia z deklaracjami użytkownika.
   - Czy użytkownik mówi o "płaskim ogrodzie", a na zdjęciu widać skarpy?
   - Czy murek oporowy ze zdjęcia sugeruje wyzwanie inżynieryjne?

3. ZAPISZ WNIOSKI W PROJECT.MD
   - Dodaj sekcję "Visual Clues" do PROJECT.md.
```

**Output:**

- Zaktualizowany PROJECT.md o sekcję wizualną.
- Jasne doprecyzowanie scope'u na bazie obrazów.

---

### Phase 2: Discovery - Research (Badanie otoczenia)

**Agent:** Product Manager + Synthetic User Generator (opcjonalnie)

**Cel:** Zrozumieć problem, użytkowników, rynek

**Input:**

- PROJECT.md z Phase 1
- `knowledge-base/mom-test-rules.md` (CRITICAL READ)

**Process:**

```
1. Problem Research
   - Czy problem naprawdę istnieje?
   - Jak duży jest problem?
   - Kto jeszcze go ma?

2. Behavioral Interviews (Behavioral Interviewing)
   - Przeprowadź min. 3 wywiady (symulowane lub realne).
   - Użyj `tools/behavioral_interview.py` do walidacji pytań.
   - Użyj `templates/documents/INTERVIEW_LOG.template.md`.
   - Zapisz w `docs/analysis/market_analysis/INTERVIEW_LOG_x.md`.

3. User Research
   - Kim są potencjalni użytkownicy?
   - Jak rozwiązują problem teraz?
   - Co ich frustruje?

   [Opcjonalnie: Synthetic User Generator]
   - Wygeneruj 2-3 persony
   - Przeprowadź syntetyczne wywiady

4. Market Research
   - Czy są konkurenci?
   - Co robią dobrze/źle?
   - Jaka jest nasza przewaga?
```

**Output:**

- PROJECT.md sekcje 2-3 wypełnione
- `docs/analysis/market_analysis/INTERVIEW_LOG_1..3.md`
- /docs/research/personas/ (jeśli używano Synthetic User)
- Notatki z research

**Checklist:**

- [ ] Problem zwalidowany (istnieje, jest bolesny)
- [ ] 3 wywiady behawioralne przeprowadzone (Behavioral Interview)
- [ ] Użytkownicy zdefiniowani (persony)
- [ ] Konkurencja zbadana
- [ ] Przewaga zidentyfikowana

**🔒 GATE CHECK (before proceeding to Validation):**

```bash
python tools/gate_check.py projects/<project-name> --phase research
# Must return ✅ GATE PASSED before moving to Phase 3
```

---

### Phase 3: Validation (Walidacja założeń)

**Agent:** Assumption Validator + Product Manager

**Cel:** Sprawdzić czy założenia są realistyczne

**Input:**

- PROJECT.md z Phase 2
- Research notes

**Process:**

```
1. Wylistuj wszystkie założenia
   - O problemie
   - O użytkownikach
   - O rynku
   - O naszej zdolności do budowy

2. Oceń każde założenie
   - Czy mamy evidence?
   - Jakie ryzyko jeśli błędne?
   - Jak zwalidować?

3. Zidentyfikuj krytyczne założenia
   - Które MUSZĄ być prawdziwe?
   - Jak je przetestować przed inwestycją?
```

**Output:**

- Lista założeń z oceną
- Plan walidacji krytycznych założeń
- GO/NO-GO recommendation

**Checklist:**

- [ ] Założenia wylistowane
- [ ] Krytyczne założenia zidentyfikowane
- [ ] Plan walidacji (jeśli potrzebny)
- [ ] Recommendation: GO / PIVOT / NO-GO

**🔒 GATE CHECK (before proceeding to Scope):**

```bash
python tools/gate_check.py projects/<project-name> --phase validation
# Must return ✅ GATE PASSED before moving to Phase 4
```

---

### Phase 4: Scope Definition (Definicja zakresu)

**Agent:** Product Manager

**Cel:** Określić co jest IN i OUT dla MVP

**Input:**

- Zwalidowane założenia
- PROJECT.md

**Process:**

```
1. Zdefiniuj MVP
   - Co MUSI być żeby produkt miał wartość?
   - Co można dodać PÓŹNIEJ?
   - Co jest nice-to-have vs must-have?

2. Określ constraints
   - Budżet (czas, pieniądze, tokeny)
   - Zasoby (kto będzie budować)
   - Timeline (kiedy potrzebne)

3. Zdefiniuj success metrics
   - Jak zmierzymy sukces?
   - Jaki jest target?
   - Po czym poznamy że działamy?
```

**Output:**

- PROJECT.md sekcje 4-5, 9 wypełnione
- Jasny scope: IN vs OUT
- Success metrics

**Checklist:**

- [ ] MVP scope zdefiniowany
- [ ] OUT OF SCOPE explicit
- [ ] Constraints znane
- [ ] Success metrics mierzalne

**🔒 GATE CHECK (before Go/No-Go):**

```bash
python tools/gate_check.py projects/<project-name> --phase scope
# Must return ✅ GATE PASSED before moving to Phase 5
```

---

### Phase 5: Go/No-Go Decision

**Agent:** Product Manager + Użytkownik

**Cel:** Podjąć decyzję czy idziemy dalej

**Input:**

- Kompletny PROJECT.md z faz 1-4
- Założenia zwalidowane
- Scope zdefiniowany

**Process:**

```
1. Review całości
   - Czy problem jest wart rozwiązania?
   - Czy mamy zdolność go rozwiązać?
   - Czy scope jest realistyczny?

2. Decyzja
   - GO: Przechodzimy do Documentation workflow
   - PIVOT: Zmieniamy kierunek, wracamy do Phase 1
   - NO-GO: Rezygnujemy (i dokumentujemy dlaczego)
```

**Output:**

- Decyzja: GO / PIVOT / NO-GO
- Jeśli GO: gotowy PROJECT.md do następnego workflow

**🔒 FINAL GATE CHECK (before Documentation workflow):**

```bash
python tools/gate_check.py projects/<project-name> --phase go-no-go
# Runs ALL prior gates. Must return ✅ ALL GATES PASSED before PRD/Spec creation.
```

---

## Timing

| Phase | Estimated Time | Can Skip? |
|-------|----------------|-----------|
| Capture | 15-30 min | No |
| Research | 30-60 min | Partially (if known domain) |
| Validation | 15-30 min | No |
| Scope | 30-45 min | No |
| Go/No-Go | 15 min | No |

**Total:** 2-3 godziny dla nowego projektu

---

## Tips

### Dla projektów firmowych

- Więcej czasu na Research (stakeholder interviews)
- Walidacja z biznesem przed GO
- Alignment z company goals

### Dla projektów prywatnych

- Można przyspieszyć Research
- Focus na feasibility (czy sam zbudujesz?)
- Smaller scope = faster validation

### Red Flags (rozważ NO-GO)

- Problem nie boli wystarczająco
- Zbyt wiele krytycznych założeń bez walidacji
- Scope wymaga zasobów których nie masz
- Nie wiesz jak zmierzyć sukces

---

## Transitions

**Po GO:**

```
Discovery ──▶ Documentation Workflow
              (PRD → Review → Spec → Review)
```

**Po PIVOT:**

```
Discovery ──▶ Discovery (nowy kierunek)
```

**Po NO-GO:**

```
Discovery ──▶ Archive
              (Zapisz learnings w LESSONS.md)
```
