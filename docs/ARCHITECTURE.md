# Architektura Systemu - Dokumentacja Techniczna

> Jak wszystkie części systemu się łączą.

---

## Spis Treści

1. [Przegląd Systemu](#1-przegląd-systemu)
2. [Struktura Plików i Ich Relacje](#2-struktura-plików-i-ich-relacje)
3. [Agenty (.md) - Jak Działają](#3-agenty-md---jak-działają)
4. [DSPy Optimization - Połączenie z Agentami](#4-dspy-optimization---połączenie-z-agentami)
5. [Metryki Skuteczności](#5-metryki-skuteczności)
6. [Delegacja Zadań](#6-delegacja-zadań)
7. [Przepływ Danych](#7-przepływ-danych)
8. [Learning Loop - Jak System Się Ulepsza](#8-learning-loop---jak-system-się-ulepsza)

---

## 1. Przegląd Systemu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT BUILDER SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   AGENTS (.md)  │◄────│  DSPy OPTIMIZE  │◄────│  KNOWLEDGE BASE │       │
│  │                 │     │                 │     │                 │       │
│  │  Pliki promptów │     │  Automatyczna   │     │  Lessons, Best  │       │
│  │  dla LLM        │     │  optymalizacja  │     │  Practices      │       │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘       │
│           │                       │                       │                 │
│           │         ┌─────────────┴─────────────┐        │                 │
│           │         │                           │        │                 │
│           ▼         ▼                           ▼        ▼                 │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                        LLM (Claude, GPT, etc.)                   │       │
│  │                                                                   │       │
│  │   Wczytuje agentów → Wykonuje workflow → Zapisuje wyniki         │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                          METRICS                                 │       │
│  │                                                                   │       │
│  │   Pomiar skuteczności → Feedback → Ulepszenia                    │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Struktura Plików i Ich Relacje

```
product-builder/
│
├── SYSTEM.md                    ← ENTRY POINT dla LLM
│   └── Wskazuje na: agents/, knowledge-base/, protocols/
│
├── agents/                      ← PROMPTY AGENTÓW
│   ├── core/                    ← 13 głównych agentów
│   │   ├── business_analyst.md      → DSPy Signature: BusinessAnalystSignature
│   │   ├── product_manager.md       → DSPy Signature: ProductManagerSignature
│   │   ├── backend_architect.md     → DSPy Signature: BackendArchitectSignature
│   │   └── ...
│   ├── pm-team/                 ← Agenci dokumentacji
│   └── orchestration/           ← Koordynatorzy
│
├── tools/dspy-optimization/     ← OPTYMALIZACJA PROMPTÓW
│   ├── agent_signatures.py          → Definicje wejść/wyjść (DSPy Signature)
│   ├── optimize_all_agents.py       → Skrypt optymalizacji
│   ├── generate_all_agents_data.py  → Generator danych treningowych
│   ├── optimized_models/            → Zoptymalizowane konfiguracje (JSON)
│   │   ├── business-analyst_optimized.json
│   │   └── ...
│   └── agent_data/                  → Dane treningowe (JSON)
│       ├── business-analyst_examples.json
│       └── ...
│
├── knowledge-base/              ← BAZA WIEDZY
│   ├── lessons_learned.md           → Błędy z poprzednich projektów
│   ├── best_practices.md            → Sprawdzone wzorce
│   ├── agent_feedback.md            → Feedback na agentów
│   ├── workflow_optimizations.md    → Historia ulepszeń
│   └── case-studies/                → Pełne historie projektów
│
├── protocols/                   ← JAK PRACOWAĆ
│   ├── learning_loop.md             → Obowiązkowy protokół ulepszania
│   ├── context_loading.md           → Jak wczytywać kontekst
│   ├── handoff.md                   → Przekazywanie między agentami
│   └── ...
│
└── docs/                        ← DOKUMENTACJA
    ├── complete_guide.md            → For-dummies przewodnik
    ├── workflow_diagram.md          → Wizualne diagramy
    └── ARCHITECTURE.md              → TEN PLIK
```

---

## 3. Agenty (.md) - Jak Działają

### Co To Jest Agent?

Agent = plik `.md` który jest **system promptem** dla LLM.

```markdown
# Business Analyst

## Rola
Oceniasz pomysły biznesowe GO/NO-GO.

## Wejścia
- idea_description: opis pomysłu
- market_context: kontekst rynkowy

## Wyjścia  
- verdict: GO lub NO-GO
- score: 1-10
- reasoning: uzasadnienie

## Instrukcje
[szczegółowe instrukcje jak analizować...]

## Przykłady (Few-shots)
[przykłady dobrych analiz - Z DSPy!]
```

### Jak LLM Używa Agenta?

```
1. LLM wczytuje plik agents/core/business_analyst.md
2. Plik staje się system promptem
3. User daje zadanie (idea_description + market_context)
4. LLM odpowiada zgodnie z instrukcjami (verdict + score + reasoning)
```

### Połączenie z DSPy

```
┌────────────────────────┐          ┌────────────────────────┐
│  agents/               │          │  tools/dspy-optimization/
│  business_analyst.md   │◄─────────│  optimized_models/
│                        │  AUTO    │  business-analyst_optimized.json
│  Sekcja "Przykłady"    │  SYNC    │
│  ↓                     │          │  Zawiera:
│  Automatycznie         │          │  - Wyuczone few-shots
│  aktualizowane         │          │  - Najlepsze patterns
└────────────────────────┘          └────────────────────────┘
```

**AUTOMATYZACJA:** Skrypt `update_agents_from_dspy.py` automatycznie przenosi examples z JSON do plików `.md`.

```bash
cd tools/dspy-optimization
python update_agents_from_dspy.py          # Aktualizuj wszystkich
python update_agents_from_dspy.py --dry-run # Podgląd bez zmian
```

---

## 4. DSPy Optimization - Połączenie z Agentami

### Co To Jest DSPy?

Framework do **automatycznej optymalizacji promptów**. Zamiast ręcznie pisać przykłady, DSPy uczy się jakie działają najlepiej.

### Architektura DSPy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DSPy OPTIMIZATION PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SIGNATURE (agent_signatures.py)                                          │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  class BusinessAnalystSignature(dspy.Signature):              │        │
│     │      idea_description: str = dspy.InputField()                │        │
│     │      market_context: str = dspy.InputField()                  │        │
│     │      verdict: Literal["GO", "NO-GO"] = dspy.OutputField()     │        │
│     │      score: int = dspy.OutputField()                          │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                              │                                               │
│                              ▼                                               │
│  2. TRAINING DATA (agent_data/*.json)                                        │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  [                                                            │        │
│     │    {                                                          │        │
│     │      "idea_description": "Aplikacja do...",                   │        │
│     │      "market_context": "Rynek rośnie...",                     │        │
│     │      "expected_verdict": "GO",                                │        │
│     │      "expected_score": 8                                      │        │
│     │    },                                                         │        │
│     │    ...                                                        │        │
│     │  ]                                                            │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                              │                                               │
│                              ▼                                               │
│  3. OPTIMIZER (BootstrapFewShotWithRandomSearch)                             │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  - Testuje różne konfiguracje few-shot examples               │        │
│     │  - Mierzy accuracy na test set                                │        │
│     │  - Zapisuje najlepszą konfigurację                            │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                              │                                               │
│                              ▼                                               │
│  4. OPTIMIZED MODEL (optimized_models/*.json)                                │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  {                                                            │        │
│     │    "demos": [                                                 │        │
│     │      {"input": "...", "output": "GO", "reasoning": "..."},    │        │
│     │      ...                                                      │        │
│     │    ],                                                         │        │
│     │    "score": 88.9,                                             │        │
│     │    ...                                                        │        │
│     │  }                                                            │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                              │                                               │
│                              ▼                                               │
│  5. TRANSFER TO AGENT (ręczny krok!)                                        │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  python extract_improvements.py --agent business-analyst      │        │
│     │                                                               │        │
│     │  → Pokazuje examples do wklejenia do .md                      │        │
│     │  → Kopiujesz do agents/core/business_analyst.md               │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Jak Uruchomić Optymalizację?

```bash
cd tools/dspy-optimization

# 1. Wygeneruj dane treningowe
python generate_all_agents_data.py --examples 30

# 2. Uruchom optymalizację (wszystkie agenty)
python optimize_all_agents.py

# 3. Zobacz wyniki
cat optimized_models/optimization_summary.json

# 4. Ekstraktuj examples do wklejenia
python extract_improvements.py --agent business-analyst
```

### Wyniki Optymalizacji (Stan na 2026-01-20)

| Agent | Accuracy | Status |
|-------|----------|--------|
| customer-success | 100% | 🏆 |
| business-analyst | 88.9% | 🔥 |
| mobile-app-builder | 87.5% | 🔥 |
| uiux-designer | 87.5% | 🔥 |
| code-reviewer | 75% | ✅ |
| qa-automation | 57.1% | ✅ |
| project-shipper | 55.6% | ✅ |
| backend-architect | 50% | ✅ |
| frontend-developer | 44.4% | ⚠️ |
| security-engineer | 40% | ⚠️ |
| devops-automator | 33.3% | ⚠️ |
| ai-engineer | 28.6% | ⚠️ |
| product-manager | 22.2% | ⚠️ |
| api-documentation | 22.2% | ⚠️ |

---

## 5. Metryki Skuteczności

### Jak Mierzymy Agentów?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MEASUREMENT SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  A. DSPy METRICS (tools/dspy-optimization/)                                  │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  Accuracy = (poprawne odpowiedzi / wszystkie) × 100%          │        │
│     │                                                               │        │
│     │  Dla Literal types (GO/NO-GO):                               │        │
│     │  - Porównanie expected_verdict vs actual_verdict             │        │
│     │  - Case-insensitive, normalized                               │        │
│     │                                                               │        │
│     │  Plik: optimized_models/optimization_summary.json            │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  B. QUALITATIVE FEEDBACK (knowledge-base/agent_feedback.md)                  │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  - Czy agent daje przydatne odpowiedzi?                       │        │
│     │  - Czy wymaga poprawek od użytkownika?                        │        │
│     │  - Czy trzyma się formatu?                                    │        │
│     │                                                               │        │
│     │  Zapisywane ręcznie po każdym projekcie (Learning Loop)       │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  C. PROJECT METRICS (knowledge-base/case-studies/)                           │
│     ┌──────────────────────────────────────────────────────────────┐        │
│     │  Per projekt:                                                 │        │
│     │  - Czas do MVP                                                │        │
│     │  - Liczba iteracji PRD                                        │        │
│     │  - Liczba poprawek od użytkownika                             │        │
│     │  - Success/failure ratio                                      │        │
│     └──────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Gdzie Są Metryki?

| Metryka | Lokalizacja | Jak Aktualizować |
|---------|-------------|------------------|
| DSPy Accuracy | `optimized_models/optimization_summary.json` | Automatycznie po `optimize_all_agents.py` |
| Agent Feedback | `knowledge-base/agent_feedback.md` | Ręcznie (Learning Loop) |
| Project Success | `knowledge-base/case-studies/*.md` | Ręcznie (Learning Loop) |
| Workflow Stats | `knowledge-base/workflow_optimizations.md` | Ręcznie (Learning Loop) |

---

## 6. Delegacja Zadań

### Jak Agenty Współpracują?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TASK DELEGATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LLM (Orchestrator) decyduje o kolejności:                                   │
│                                                                              │
│  USER: "Zbuduj aplikację X"                                                  │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────┐                                                    │
│  │  1. business-analyst │ ──► GO/NO-GO                                      │
│  └─────────────────────┘     │                                              │
│           │                  │ NO-GO → STOP                                  │
│           ▼ GO               │                                              │
│  ┌─────────────────────┐     │                                              │
│  │  2. product-manager  │ ──► PRD + Priorytety                              │
│  └─────────────────────┘                                                    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐                           │
│  │  3. backend-architect│  │  4. frontend-dev    │  RÓWNOLEGLE              │
│  └─────────────────────┘  └─────────────────────┘                           │
│           │                        │                                         │
│           └──────────┬─────────────┘                                         │
│                      ▼                                                       │
│  ┌─────────────────────┐                                                    │
│  │  5. code-reviewer    │ ──► APPROVED / REQUEST_CHANGES                    │
│  └─────────────────────┘                                                    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────┐                                                    │
│  │  6. project-shipper  │ ──► GO / NO-GO dla deploy                         │
│  └─────────────────────┘                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Protokoły Delegacji

| Protokół | Plik | Kiedy Użyć |
|----------|------|------------|
| Handoff | `protocols/handoff.md` | Przekazywanie między agentami |
| Context Loading | `protocols/context_loading.md` | Wczytywanie kontekstu projektu |
| Review Process | `protocols/review_process.md` | Producer-Reviewer pattern |
| External Delegation | `protocols/external_delegation.md` | Delegacja do innych LLM |

### Jak LLM Wie Co Delegować?

1. **SYSTEM.md** zawiera listę agentów i ich role
2. **agents/\*.md** mają sekcje "Kiedy Używać"
3. **protocols/** opisują jak przekazywać zadania

---

## 7. Przepływ Danych

### Kompletny Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE DATA FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │  USER INPUT  │ "Zbuduj aplikację X"                                      │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  LLM READS:                                                       │       │
│  │  1. SYSTEM.md (entry point)                                       │       │
│  │  2. knowledge-base/lessons_learned.md (unikaj błędów)            │       │
│  │  3. knowledge-base/best_practices.md (użyj wzorców)              │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  LLM WYBIERA AGENTÓW:                                             │       │
│  │  - business_analyst.md (GO/NO-GO)                                 │       │
│  │  - product_manager.md (PRD)                                       │       │
│  │  - ...                                                            │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  WORKFLOW EXECUTION:                                              │       │
│  │                                                                   │       │
│  │  Agent 1 ─► Output 1 ─► CHECKPOINT ─► User OK ─► Agent 2 ─► ...  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  DELIVERABLES:                                                    │       │
│  │  - PRD.md                                                         │       │
│  │  - SPEC.md                                                        │       │
│  │  - Kod                                                            │       │
│  │  - Deployed app                                                   │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  LEARNING LOOP (obowiązkowy):                                     │       │
│  │                                                                   │       │
│  │  1. REFLECT - Co poszło dobrze/źle?                              │       │
│  │  2. RECORD - Zapisz do knowledge-base/                           │       │
│  │  3. IMPROVE - Zaproponuj ulepszenia agentów                      │       │
│  │  4. COMMIT - Push do repo                                         │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  REPO IS NOW BETTER:                                              │       │
│  │  - Nowa wiedza w knowledge-base/                                  │       │
│  │  - Poprawki w agents/ (opcjonalnie)                               │       │
│  │  - Nowy case-study w case-studies/                                │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Learning Loop - Jak System Się Ulepsza

### Cykl Ulepszania

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTINUOUS IMPROVEMENT CYCLE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         ┌─────────────────────────────────────────────────────┐             │
│         │                    PROJEKT N                         │             │
│         └─────────────────────────────────────────────────────┘             │
│                              │                                               │
│                              ▼                                               │
│         ┌─────────────────────────────────────────────────────┐             │
│         │  LEARNING LOOP                                       │             │
│         │                                                      │             │
│         │  → Zapisz lessons_learned.md                        │             │
│         │  → Zapisz best_practices.md                         │             │
│         │  → Zapisz case-study                                │             │
│         │  → Zaproponuj ulepszenia agentów                    │             │
│         └─────────────────────────────────────────────────────┘             │
│                              │                                               │
│                              ▼                                               │
│         ┌─────────────────────────────────────────────────────┐             │
│         │  OPCJONALNIE: DSPy RE-OPTIMIZATION                   │             │
│         │                                                      │             │
│         │  Gdy zebrane ~50+ nowych examples:                   │             │
│         │  → Dodaj do agent_data/                              │             │
│         │  → Uruchom optimize_all_agents.py                    │             │
│         │  → Uruchom update_agents_from_dspy.py (auto!)        │             │
│         └─────────────────────────────────────────────────────┘             │
│                              │                                               │
│                              ▼                                               │
│         ┌─────────────────────────────────────────────────────┐             │
│         │  REPO JEST LEPSZE                                    │             │
│         │                                                      │             │
│         │  Agenty wiedzą więcej, mają lepsze examples,         │             │
│         │  knowledge-base zawiera więcej wzorców               │             │
│         └─────────────────────────────────────────────────────┘             │
│                              │                                               │
│                              ▼                                               │
│         ┌─────────────────────────────────────────────────────┐             │
│         │                    PROJEKT N+1                       │             │
│         │                                                      │             │
│         │  Korzysta z wiedzy z projektu N                      │             │
│         └─────────────────────────────────────────────────────┘             │
│                              │                                               │
│                              ▼                                               │
│                        (powtórz cykl)                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Kiedy Re-optymalizować DSPy?

| Trigger | Akcja |
|---------|-------|
| Zebrano 50+ nowych real examples | Re-run DSPy optimization |
| Agent ma <30% accuracy | Wygeneruj więcej danych, re-optimize |
| User często poprawia agenta | Zbierz poprawki jako training data |
| Kwartalnie | Rutynowa re-optymalizacja |

---

## Podsumowanie Połączeń

```
┌────────────────┐  czyta   ┌────────────────┐
│   SYSTEM.md    │─────────►│  agents/*.md   │
└────────────────┘          └────────┬───────┘
                                     │
                   ┌─────────────────┼─────────────────┐
                   │                 │                 │
                   ▼                 ▼                 ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │ DSPy Signatures │ │  Knowledge Base │ │   Protocols     │
         │ (optymalizacja) │ │   (wiedza)      │ │  (jak pracować) │
         └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                  │                   │                   │
                  └───────────────────┴───────────────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │  LEPSZE ODPOWIEDZI LLM │
                         └────────────────────────┘
```

---

*Ostatnia aktualizacja: 2026-01-20*
