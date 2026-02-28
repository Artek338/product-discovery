# Discovery Metrics & Benchmarks — Deep Research

> Źródło: NotebookLM Deep Search, 2026-02-28
> Wzbogaca: `DiscoveryValueScorecard`, Gate Check, OST framework

---

## Ile wywiadów wystarczy?

### Research Saturation

| Typ nasycenia | Wywiady | Co osiągasz |
|--------------|---------|-------------|
| **Code saturation** | 9-12 | Pełen zakres problemów i tematów |
| **Meaning saturation** | 16-24 | Głębokie zrozumienie motywacji i kontekstu |

### Guidelines wg typu badania

| Typ badania | Sample | Kontekst |
|-------------|--------|----------|
| Usability testing | **5-8** uczestników | 85% błędów UX wykrytych |
| Szybka walidacja koncepcji (B2C/B2B) | **8-12** wywiadów | Kierunkowa pewność |
| Discovery strategiczne | **12-20** wywiadów | Mapowanie problemów, nowe rynki |
| Badania generatywne / Enterprise | **20-30** per segment | Skomplikowane rynki, wielu interesariuszy |

### Saturation Score (diminishing returns)

**Wzór:** `Sₙ = T_new / T_total`

- `T_new` = nowe unikalne tematy w wywiadzie n
- `T_total` = suma wszystkich unikalnych tematów (1 do n)
- **Punkt nasycenia:** `Sₙ < 0.05` (< 5% nowej wiedzy)

**Automatyzacja:** Transkrypcje → LLM extract topics → porównuj z codebookiem →
track `Sₙ` per wywiad → stop gdy trend → 0.

---

## Quality Metrics

| Metryka | Definicja | Benchmark ✅ | Benchmark ❌ |
|---------|-----------|-------------|-------------|
| Insight density | Insighty na wywiad | **2-4 kluczowe** | < 1 (złe pytania lub grupa) |
| Assumption invalidation rate | % obalonych założeń | **30-60%** (rygor) | < 30% (confirmation bias) |
| Evidence level achieved | Po N wywiadach | **Level 3-4** (behawior, pre-sales) | Level 1 (deklaracje) |
| Time-to-evidence | Czas do Level 2+ | **5-10 dni roboczych** | > 15 dni |
| Team confidence delta | Zmiana pewności | **Kalibracja** (spadek = ok!) | 100% bez twardych dowodów |

---

## Discovery ROI

### Cost of Skipping Discovery

- **42% startupów** upada bo buduje coś czego nikt nie chce
- **Rework** pochłania **30-50%** czasu inżynierów
- Koszt naprawy błędów po wdrożeniu: **100-200x** droższe niż zmiana w Discovery
- Case: Grover — model dokupywania akcesoriów bez walidacji → gigantyczne
  obciążenie operacyjne + znikoma konwersja

### Cost of Good Discovery

- Elitarne zespoły: **15-25% czasu** na Discovery
- PM i Design: nawet **75%** czasu
- Koszt: **1x** budżet (np. 1000 PLN w roboczogodzinach) na de-ryzykację

### ROI Formula

- Zwrot: **3:1 do 5:1** (asymetryczny)
- Zespół z budżetem $5M/rok → oszczędza **$1.5-2.5M** zapobiegając zbędnemu kodowi
- Time-to-Market: **18-24 miesięcy → 12-15 miesięcy**

---

## Anti-Metrics (czego NIE mierzyć)

| Vanity Metric | Dlaczego myli |
|--------------|---------------|
| Liczba wywiadów | Activity Trap — liczy się jakość, nie ilość |
| "Czy będziesz korzystał?" | Social desirability — deklaracje ≠ zachowania |
| Wewnętrzny konsensus | Entuzjazm interesariuszy ≠ walidacja rynkowa |
| Wielkość bazy tagów | 1500 otagowanych insightów bez wpływu na roadmapę = waste |

---

## Framework Comparison

| Framework | Autor | Best for | Time | Evidence quality |
|-----------|-------|----------|------|-----------------|
| Continuous Discovery | Torres | Dojrzałe SaaS, iteracyjny wzrost | Ciągły nawyk, wywiady co tydzień | Wysoka/Umiarkowana |
| Dual Track | Cagan | Duże orgi, trudny tech | Dwa tracki w nieskończoność | Wysoka (4 ryzyka) |
| Lean Startup | Ries | Pre-seed, skrajna niepewność | Build-Measure-Learn, miesięczne cykle | Wysoka (wymusza MVP) |
| Design Sprint | Google | Szybka walidacja konceptu | Time-boxed: 5 dni | Umiarkowana (prototypy) |
| Strategyzer | Osterwalder | Nowe venture, de-ryzykacja | Bramki decyzyjne | Bardzo wysoka (4 poziomy dowodów) |

---

## Opportunity Solution Tree (Torres)

### Struktura (4 poziomy)

```
1. Outcome (cel biznesowy)       ← korzeń, mapuje się na OKR
   ├── 2. Opportunity (potrzeba)  ← z wywiadów, nie wymyślona
   │   ├── 3. Solution (pomysł)   ← wiele wariantów!
   │   │   └── 4. Experiment      ← tanie, szybkie testy
   │   ├── 3. Solution B
   │   │   └── 4. Experiment
   │   └── 3. Solution C
   └── 2. Opportunity B
       └── ...
```

### Zalety

- Wizualny obraz tego, co zespół eksploruje i DLACZEGO
- Traceability: każdy delivery wypływa z przebadanej szansy
- Minimalizuje ryzyko budowania niewalidowanych funkcji

---

## Strategyzer — 4 poziomy dowodów

| Level | Typ | Siła | Eksperymenty |
|-------|-----|------|-------------|
| **1. Słabe** | Co ludzie MÓWIĄ | Słaba | Wywiady, ankiety, card sorting |
| **2. Umiarkowane** | Małe inwestycje | Umiarkowana | Fake door, landing page, LOI, ads CTR |
| **3. Silne** | Prawdziwe ZACHOWANIE | Silna | Prototype testing, A/B test, etnografia |
| **4. Bardzo silne** | Realne PIENIĄDZE | Bardzo silna | Concierge, Wizard of Oz, pre-sale, MVP |

---

## Torres + Osterwalder Hybrid

### Krok po kroku

1. **Cel** → OST korzeń + Business Model Canvas
2. **Szanse** → Cotygodniowe wywiady (Torres) + Value Proposition Canvas (Osterwalder)
3. **Rozwiązania** → Wiele wariantów + mapowanie na Desirability/Feasibility/Viability
4. **Eksperymenty** → 44 technik z biblioteki Osterwaldera, wg siły dowodów (Level 1→4)
5. **Metryki** → Rytm Torres + Assumption Invalidation Rate + Innovation Risk Level

---

## Cagan — 4 ryzyka Discovery

| Ryzyko | Pytanie | Kto odpowiada |
|--------|---------|---------------|
| **Value** (wartość) | Czy to na tyle cenne, że klienci kupią? | Product Manager |
| **Usability** (użyteczność) | Czy użytkownicy zrozumieją jak używać? | Product Designer |
| **Feasibility** (wykonalność) | Czy da się to zbudować? | Engineer / Tech Lead |
| **Viability** (opłacalność) | Czy to działa z perspektywy biznesu? | PM + Stakeholders |

> **Value risk jest zdecydowanie największy** — większość tego, co zespoły uznają
> za wartościowe, ostatecznie takie nie jest. — Marty Cagan
