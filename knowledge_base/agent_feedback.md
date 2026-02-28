# Agent Feedback

> Feedback na temat agentów - co działa, co nie działa, propozycje ulepszeń.

---

## Format Wpisu

```markdown
### [DATA] Agent: [nazwa]
**Feedback type:** positive/negative/improvement
**Opis:** co zauważono
**Propozycja:** (jeśli improvement) co zmienić
**Priority:** low/medium/high
```

---

## Wpisy

### [2026-01-20] Agent: business-analyst

**Feedback type:** positive
**Opis:** Po optymalizacji DSPy osiąga 88.9% accuracy w decyzjach GO/NO-GO
**Propozycja:** N/A - działa dobrze
**Priority:** N/A

### [2026-01-20] Agent: customer-success

**Feedback type:** positive
**Opis:** 100% accuracy po optymalizacji DSPy - najlepszy agent
**Propozycja:** Użyć jako wzorzec dla innych
**Priority:** low

### [2026-01-20] Agent: product-manager

**Feedback type:** improvement
**Opis:** Tylko 22.2% accuracy - zbyt generyczne odpowiedzi
**Propozycja:** Dodać więcej konkretnych przykładów priorytetyzacji (RICE, MoSCoW)
**Priority:** high

### [2026-01-20] Agent: api-documentation

**Feedback type:** improvement
**Opis:** 22.2% accuracy - nie trzyma się formatu
**Propozycja:** Dodać stricter output format z JSON schema
**Priority:** medium

---

## Jak Dodawać Feedback

1. Użyj formatu powyżej
2. Grupuj po agentach (najnowsze na górze)
3. Commit z message: `feedback: [agent] - [typ]`

---

*Ostatnia aktualizacja: 2026-01-20*
