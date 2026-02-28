# Workflow Optimizations

> Historia ulepszień workflow i propozycje na przyszłość.

---

## Zaimplementowane Optymalizacje

### [2026-01-20] DSPy Agent Optimization

**Problem:** Agenty dawały niespójne odpowiedzi
**Rozwiązanie:**

- Dodano DSPy signatures dla 14 agentów
- BootstrapFewShotWithRandomSearch optimizer
- Syntetyczne dane treningowe (30/agent)
**Wynik:** Średnia accuracy 53%, top agenty >85%
**Pliki:** `tools/dspy-optimization/`

### [2026-01-20] Comprehensive Documentation

**Problem:** Brak jasnych instrukcji dla użytkowników i LLM
**Rozwiązanie:**

- `SYSTEM.md` - entry point dla LLM
- `docs/complete_guide.md` - for-dummies guide
- `docs/workflow_diagram.md` - wizualne diagramy
**Wynik:** Każdy LLM może samodzielnie używać repo

---

## Propozycje (Do Zaimplementowania)

### Propozycja 1: Auto-Orchestration

**Problem:** LLM musi ręcznie wybierać agentów
**Propozycja:** Agent-orkiestrator który automatycznie deleguje
**Priority:** high
**Status:** planned

### Propozycja 2: MIPROv2 Optimization

**Problem:** Niektóre agenty mają <30% accuracy
**Propozycja:** Przejść z BootstrapFewShot na MIPROv2 z 200+ examples
**Priority:** medium
**Status:** planned

### Propozycja 3: Automatic Commits

**Problem:** LLM musi ręcznie commitować ulepszenia
**Propozycja:** Script który auto-commituje do knowledge-base
**Priority:** low
**Status:** idea

---

## Format Nowych Propozycji

```markdown
### Propozycja N: [Tytuł]
**Problem:** co nie działa
**Propozycja:** jak naprawić
**Priority:** low/medium/high
**Status:** idea/planned/in-progress/done
```

---

*Ostatnia aktualizacja: 2026-01-20*
