# PRD Best Practices & Anti-patterns — Deep Research

> Źródło: NotebookLM Deep Search, 2026-02-28
> Wzbogaca: `PRD.template.md`, PRD generator, PM agent

---

## Top 10 anty-wzorców PRD

### 1. Kryzys objętości (Volume Crisis)

- **Symptom:** PRD 30+ stron, przypomina manual
- **Konsekwencja:** Inżynierowie nie czytają, fragmentacja wiedzy
- **Fix:** One-pager dla prostych zmian, 6-pager (Amazon) dla strategicznych

### 2. Dokumenty Zombie

- **Symptom:** PRD przestarzałe w momencie zmiany prototypu w Figma
- **Konsekwencja:** Zespoły przestają ufać specyfikacji
- **Fix:** "Żywa" dokumentacja zintegrowana z kodem/designem (np. Supernova Portal)

### 3. Brak zakotwiczenia w dowodach

- **Symptom:** Wymagania z opinii interesariuszy ("I think...")
- **Konsekwencja:** Funkcje nie rozwiązujące faktycznych problemów
- **Fix:** Evidence Linking — każda hipoteza linkuje do surowych wyników discovery

### 4. Brak celów negatywnych (Missing Non-goals)

- **Symptom:** Brak listy wykluczeń — tylko "co budujemy"
- **Konsekwencja:** Scope creep, "randomizacja" pracy inżynierów
- **Fix:** Obowiązkowa sekcja "No-gos" z jawnymi granicami projektu

### 5. Specyfikacja przed walidacją

- **Symptom:** Perfekcyjne planowanie każdego detalu przed MVP
- **Konsekwencja:** Overthinking, utrata okna rynkowego
- **Fix:** Rapid prototyping (Lovable, Bolt) → PRD ewoluuje z feedbackiem

### 6. Iluzja kompletności AI

- **Symptom:** AI-generated PRD — idealna struktura, brak oryginalnej myśli
- **Konsekwencja:** Menedżerowie przeoczają luki logiczne i halucynacje
- **Fix:** LLM = "Junior PM". Human fact-checking i autoryzacja OBOWIĄZKOWE

### 7. Syndrom HIPPO

- **Symptom:** Wymagania z góry, bez rynkowego uzasadnienia
- **Konsekwencja:** Produkty oderwane od realiów, brak autonomii zespołu
- **Fix:** Evidence Linking z identyfikatorami CFD — każdy inżynier może podważyć funkcję bez dowodu

### 8. Ślepota kontekstowa AI

- **Symptom:** AI generuje poprawną logicznie, ale izolowaną specyfikację
- **Konsekwencja:** Niszczenie spójności infrastruktury (np. współbieżne zapisy do SQLite → locksy)
- **Fix:** Context Engineering — karmienie AI wytycznymi o architekturze PRZED generowaniem

### 9. Blast-radius ignorance

- **Symptom:** PRD tylko dla happy-path, brak planów awaryjnych
- **Konsekwencja:** Kaskadowe awarie (pad bazy po uszkodzeniu regionu → $500K strat)
- **Fix:** Analiza blast-radius w PRD, wymogi failoveru, multi-region correctness

### 10. PRD as a project plan

- **Symptom:** PRD = sztywna lista wymagań + harmonogram do "zakodowania"
- **Konsekwencja:** Programiści = "wykonawcy biletów", fałszywe estymaty
- **Fix:** Shape Up: stały apetyt czasowy (6 tyg), zmienny zakres, autonomia deweloperów

---

## Modern PRD Formats — porównanie

| Format | Autor | Kiedy stosować | Długość | Mocne strony | Słabe strony |
|--------|-------|----------------|---------|-------------|-------------|
| Classic PRD | — | Waterfall, regulowane | 30+ stron | Szczegółowy opis | Zombie docs, nikt nie czyta |
| Amazon 6-pager | Bezos | Duże inwestycje, nowe linie biznesowe | 6 stron | Głęboka analiza, Silent Ritual | Za formalny dla małych zadań |
| One-pager | Tech industry | Niskie ryzyko, komunikacja exec | 1 strona | Radykalna zwięzłość | Brak miejsca na architekturę/ryzyko |
| OST | Teresa Torres | Continuous Discovery | Dynamiczne drzewo | Łączy Solutions ↔ Opportunities ↔ Outcomes | Początkowy bałagan, wymaga 3-4 wywiadów/tyg |
| Shape Up Pitch | Basecamp | SaaS, 6-tyg sprinty | Zwięzły pitch | Stały czas, zmienny zakres, autonomia | Słabe zakotwiczenie w research |

---

## PRD ↔ Discovery Integration

> Integracja skraca proces z 4-5 tygodni do **7-10 dni**.

### Auto-fill z Discovery (Read-only)

- Definicje ról użytkowników (z wywiadów)
- Główne zarysy funkcji (z JTBD analysis)
- Diagramy przepływu (z Forces Diagram)
- "Głos klienta" — surowe cytaty z wywiadów
- Twarde dane rynkowe z competitive research

### Sekcje LUDZKIE (Editable)

- **User Stories i Priorytetyzacja** — wybór co jest kluczowe z perspektywy wizji firmy
- **Metryki Sukcesu** — na których polega biznes
- **Decyzje polityczne** — AI nie "czyta pokoju" i nie prowadzi relacji

### Evidence Linking

Każda funkcja w PRD wymaga linku/przypisu do identyfikatora z Discovery:

- Oznaczenia CFD: **C**urrent Behavior, **F**actors, **D**ecisions
- Jeden klik → dostęp do wywiadu źródłowego chroniącego logikę rozwiązania
- Inżynier może podważyć funkcję bez dowodu empirycznego

---

## AI-assisted PRD Writing

### Co AI pisze dobrze ✅

- **Szkielety dokumentacji** z transkryptów wywiadów (White Prompt: 4 tyg → 2 dni)
- **Ustandaryzowane raporty** (Merck: Clinical Study Reports 180h → 80h)
- **Analiza konkurencji** i wymiarowanie rynku
- **Wizualizacje i prototypy** (Lovable, Bolt, Eraser)

### Co AI pisze źle ❌

- **Halucynacje danych** — Perplexity AI cytuje nieistniejące badania rynkowe jako pewnik
- **Ślepota kontekstowa** — specyfikacja niszcząca bazę danych (SQLite locks)
- **Błędy compliance** — ignorowanie RODO/GDPR, PCI DSS

### Guardrails

1. **Human-in-the-loop** — AI = Junior PM, każda statystyka wymaga fact-checkingu
2. **Context Engineering** — karmienie AI parametrami architektury PRZED generowaniem
3. **Security scanning** — Snyk/Docker skanery na implementowanych przez AI pomysłach
