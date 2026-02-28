# Continuous Discovery Automation — Deep Research

> Źródło: NotebookLM Deep Search, 2026-02-28
> Wzbogaca: Discovery Graph automation, OST builder, Interview Coach AI features

---

## AI-Assisted Interview Analysis

### Automatyczne tagowanie (NLP)

- **Technika:** LLM + NLP — zrozumienie intencji semantycznych zamiast keyword matching
- **Redukcja czasu syntezy:** ~**97%** (492-705 min → 15-25 min dla 1h wywiadu)
- **Zgodność tematyczna z ludźmi:** **71%** (kodowanie indukcyjne)
- **Przykład:** "obejście problemu" → auto-tag jako dowód behawioralny

### Response Quality Detection

| Typ | Rozpoznawanie | Znaczniki |
|-----|-------------|-----------|
| **Genuine** (prawdziwe) | Znaczniki specyficzności | Czas, artefakty, spójne skoki emocjonalne → wysoki "evidence score" |
| **Polite lie** | Hiperboliczny język bez dowodów | "To brzmi niesamowicie!" bez akcji → anomalie w pewności wypowiedzi |
| **Vague** (spekulatywne) | Słowa: "mógłbym", "zazwyczaj" | AI-moderator auto-zadaje pytania pogłębiające |

### Sentiment Analysis — ograniczenia

| Łapie ✅ | NIE łapie ❌ |
|----------|-------------|
| Podstawowy ton wypowiedzi | **Latent needs** — pozytywny sentyment do nieefektywnego workaround |
| Ogólne zadowolenie/frustrację | **Sarkazm** — sfrustrowany humor |
| | "Miłość do funkcji" vs. "rozwiązanie problemu" |

### Narzędzia

Dovetail (transkrypcja + AI tagging), Maze (AI interview analysis),
Userlytics (AI UX), Insight7, Optimal Workshop, Askable, Condens

---

## OST Auto-Building

### Semantic Clustering

- **Jak:** Vector embeddings + rezonans tematyczny
- **Przykład:** "opóźnienie danych" + "czekanie na raport" → klaster "Wolny time-to-insight"
- **Skala:** Dziesiątki wywiadów kwartalnie → automatyczne grupowanie

### Deduplication (MECE)

- Agenci deduplikacyjni → ciągły "audyt kontekstowy" całego OST
- Wielowektorowa analiza łańcucha dowodowego
- Jeśli 2 szanse opierają się na tych samych dowodach → AI sugeruje merge
- Zasada **MECE**: wzajemnie wykluczające się, łącznie wyczerpujące

### Auto-linking Evidence

- OST aktualizuje się w real-time
- AI tworzy łańcuchy dowodowe: video timestamps, cytaty, tagowane segmenty
- Przypina dowody bezpośrednio do węzłów szans (opportunities)

---

## Weekly Cadence Automation

### Interview Recruiting

- **In-app prompts** — po 3x niepowodzeniu zadania → zaproszenie na wywiad
- **Automated vetting** — AI filtruje profile pod docelową personę
- **Email sequences** — zarządzanie kalendarzem, przypomnieniami, zachętami

### Synthesis Session Templates

- **Interview Snapshots** — ustrukturyzowane szablony z AI
- AI wyciąga chronologiczne mapy doświadczeń
- Flagowanie luk w OST (np. "gałąź nietestowana >14 dni")
- Standaryzowany dokument gotowy do analizy

### Discovery Health Score

```
Health = (Wywiady/tydzień × Eksperymenty/miesiąc) / Dni_od_ostatniego_odrzucenia
```

| Metryka | Zdrowy | Ryzyko |
|---------|--------|--------|
| Recency of Engagement | < 7 dni od wywiadu | > 7 dni |
| Experiment Velocity | < 10 dni assumption → pass/fail | > 10 dni |
| Trio Engagement Index | PM + Designer + Eng na spotkaniu | Brakuje 1+ osoby |
| Assumption/Solution Ratio | Szerokie drzewo (dywergencja) | "Płaskie" drzewo |

---

## Integration Patterns

### Discovery → Backlog (Jira/Linear/GitHub)

- **Evidence Injection** — każdy epic/story linkuje do węzła Opportunity
- Deweloperzy widzą cytaty i video wewnątrz zadania
- Synchronizacja dwukierunkowa: feature delivered → "Solution" = Live

### Interview Insights → PRD

- AI (ChatPRD, NotebookLM) analizuje transkrypcje → auto-fill PRD
- Mapping: insights → User Stories + Acceptance Criteria
- AI identyfikuje edge cases ukryte w setkach wywiadów
- Definiuje miary sukcesu dla PRD

### Evidence Tracking → Decision Log

- Experiment "Passed/Failed" → automatyczny wpis w rejestrze
- Przypisany dowód + ścieżka audytu
- AI prosi decydenta o "uzasadnienie" → eliminuje decision churn

---

## Ryzyka Over-Automation

| Ryzyko | P-stwo | Impact | Mitigation |
|--------|--------|--------|------------|
| **LLM sycophancy** | Wysokie | Halucynacyjna walidacja, confirmation bias | Red-teaming promptów, rola "Adwokata Diabła" |
| **False positives w tagowaniu** | Umiarkowane | Fałszywe problemy, wykluczenie ESL grup | Spot-checks 20% segmentów, wielojęzyczne modele |
| **Lost nuance (clustering)** | Umiarkowane | Workaround → "drobna irytacja" zamiast szansy | Analiza multi-modelowa, szukanie outlierów |
| **Over-reliance na AI** | Wysokie | "Zdekopplowane discovery", iluzja kompletności | Human-in-the-loop dla decyzji strategicznych |
| **Uprzedzenia językowe** | Umiarkowane | Wykluczenie nie-natywnych mówców | Modele trenowane na zróżnicowanych danych |

---

## Human-in-the-Loop — co MUSI zostać ludzkie

### 1. Bezpośredni kontakt z użytkownikiem

- Product trio MUSI osobiście przeprowadzać część wywiadów
- **Dlaczego:** AI nie buduje empatii, nie łapie tonu, nie buduje intuicji zespołu

### 2. Strategiczny wybór szans

- AI mapuje i klastruje OST, ale CZŁOWIEK wybiera którą gałęzią podążyć
- **Dlaczego:** Decyzja strategiczna wymaga kontekstu biznesowego, polityki, priorytetów

### 3. Krytyczna synteza

- AI generuje snapshoty, ale CZŁOWIEK wyciąga finalne wnioski
- **Jak:** Czytaj po 3-4 snapshoty naraz, rób samodzielne "meaning-making"
- **Dlaczego:** Unikanie LLM sycophancy + strategiczna spójność

---

## Najczęstsze błędy AI przy OST

1. **Sycophancy** — wybiórcze dobieranie cytatów pod tezę PM-a
2. **Ślepota kontekstowa** — workaround → "irytacja" zamiast szansy
3. **False positives ESL** — wypowiedzi nie-natywnych mówców klasyfikowane jako "niska jakość"
4. **Feature love vs. problem solved** — sentyment do funkcji ≠ rozwiązanie problemu
5. **Iluzja kompletności** — profesjonalnie wyglądające dokumenty bez głębokich insightów

---

## Devil's Advocate Prompt Template

```markdown
**Rola:** Jesteś ekspertem ds. strategii produktowej i rygorystycznym krytykiem.
Pełnisz rolę "Adwokata Diabła". Nie bądź uprzejmy — szukaj błędów w logice.

**Kontekst:** Zespół rozważa następujące założenie:
[WKLEJ ZAŁOŻENIE]

**Zadania:**
1. Zignoruj opinie zespołu — analizuj TYLKO fakty i dane
2. Podważ samą podstawę (challenge the premise) — czy framing jest błędny?
3. Wskaż braki w dowodach behawioralnych z przeszłych zachowań
4. Wygeneruj 3 silne kontrargumenty lub prostsze wyjaśnienia

Proszę o bezpośrednią, krytyczną analizę, bez potakiwania.
```

### Anti-sycophancy techniques

| Technika | Redukcja sycophancy | Źródło |
|----------|-------------------|--------|
| Perspektywa 3. osoby | **-63.8%** | Badania nad debatami |
| Rola "Adwokata Diabła" | Znaczna | Prompt engineering |
| Instrukcje anty-syofantyczne | Umiarkowana | Explicit prompting |
| Reasoning models (o3-mini, DeepSeek-r1) | Wysoka | Architektura modelu |
| Multi-model analysis | Wysoka | Eliminacja ślepych pól |

---

## Dowody behawioralne — wskaźniki rozpoznawania

| Wskaźnik | Przykład (genuine) | Przykład (fałszywy) |
|----------|-------------------|---------------------|
| Konkretne artefakty | "Otworzyłem Excela" | "Zazwyczaj gdzieś to sprawdzam" |
| Znaczniki chronologiczne | "Potem sprawdziłem timestamp" | "Mógłbym to zrobić" |
| Obejścia (workarounds) | Szczegółowy opis nieoficjalnego procesu | Ogólnikowe: "Jest trudno" |
| Skoki emocjonalne | Powiązane z konkretnymi krokami | Hiperboliczne: "Niesamowite!" |
