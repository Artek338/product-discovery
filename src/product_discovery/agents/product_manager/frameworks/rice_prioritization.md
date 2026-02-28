# RICE Prioritization - Enhanced

**Author:** Intercom Product Team  
**Source:** Intercom Blog

---

## Formula

```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach: Ilu userów dotknie (per quarter)
Impact: Jak bardzo (0.25 = minimal, 0.5 = low, 1 = medium, 2 = high, 3 = massive)
Confidence: Jak pewny (50% = low, 80% = medium, 100% = high)
Effort: Ile roboty (person-months)
```

---

## Example

```
Feature: In-app notifications

Reach: 1000 users/quarter
Impact: 2 (high - znacząco ułatwia workflow)
Confidence: 80% (mamy research, ale nie testowaliśmy prototypu)
Effort: 1 person-month

RICE = (1000 × 2 × 0.8) / 1 = 1600
```

---

## When to Use

Masz 5+ feature requests i musisz wybrać co budować najpierw.

---

## Pro Tip

Jeśli Confidence < 50%, najpierw zrób research/prototyp zamiast budować.

**Why:** Budowanie z niską pewnością = ryzyko zmarnowania czasu na coś co nie zadziała.

---

## Related

- See [RICE Scoring Template](../templates/rice_scoring.md) for practical application
- Compare with [LNO Framework](./lno_framework.md) for task prioritization
