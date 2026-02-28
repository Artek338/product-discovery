# 📖 Product Discovery — Instrukcja użytkownika / User Guide

> 🇵🇱 Sekcje po polsku | 🇬🇧 English sections below each Polish section

---

## Spis treści / Table of Contents

1. [Instalacja / Installation](#1-instalacja--installation)
2. [Pierwszy discovery / First Discovery](#2-pierwszy-discovery--first-discovery)
3. [Import realnych wywiadów / Importing Real Interviews](#3-import-realnych-wywiadów--importing-real-interviews)
4. [Śledzenie założeń / Assumption Tracking](#4-śledzenie-założeń--assumption-tracking)
5. [Kontekst branżowy / Industry Context](#5-kontekst-branżowy--industry-context)
6. [Generowanie raportów / Generating Reports](#6-generowanie-raportów--generating-reports)
7. [Matryca Impact/Effort](#7-matryca-impacteffort)
8. [Scoring jakości sesji / Session Quality Scoring](#8-scoring-jakości-sesji--session-quality-scoring)
9. [Szablony sesji / Session Templates](#9-szablony-sesji--session-templates)
10. [Integracje / Integrations](#10-integracje--integrations)
11. [Scenariusze użycia / Use Case Scenarios](#11-scenariusze-użycia--use-case-scenarios)

---

## 1. Instalacja / Installation

### 🇵🇱 Krok po kroku

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery

# 2. Zainstaluj (z wykresami)
pip install -e ".[viz]"

# 3. Skopiuj i wypełnij plik .env
cp .env.example .env
# Otwórz .env i wpisz klucz Anthropic:
#   ANTHROPIC_API_KEY=sk-ant-xxxxx

# 4. Sprawdź instalację
product-discovery --check
```

**Oczekiwany wynik:**

```
✅ pydantic-ai — OK
✅ anthropic — OK
✅ Business Analyst schemas — OK
✅ ANTHROPIC_API_KEY — set
```

### 🇬🇧 Step by step

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery
pip install -e ".[viz]"
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-xxxxx
product-discovery --check
```

---

## 2. Pierwszy discovery / First Discovery

### 🇵🇱

**Krok 1**: Upewnij się, że masz skonfigurowany `ANTHROPIC_API_KEY` w `.env`.

**Krok 2**: Uruchom discovery z opisem pomysłu:

```bash
product-discovery "Aplikacja do zarządzania budżetem domowym dla młodych par" \
  --project budget-app \
  --industry fintech
```

**Krok 3**: Poczekaj na wyniki. Proces przechodzi przez 8 węzłów:

```
[1/8] 🎭 Syntetyczne wywiady — generowanie archetypów użytkowników
[2/8] 🗣️ Analiza behawioralna — walidacja pytań wg Mom Test
[3/8] 🔎 Badania konkurencji — OSINT research
[4/8] 📊 Grading dowodów — ocena siły zebranych dowodów
[5/8] ⚖️ Forces Diagram — analiza sił Push/Pull/Anxiety/Habit
[6/8] 🔄 Synteza — połączenie wszystkich danych
[7/8] 🗺️ Mapowanie założeń — identyfikacja założeń FATAL/RISKY/SAFE
[8/8] 🏆 Scorecard — verdykt GO / NO-GO / NEEDS_MORE_DATA
```

**Krok 4**: Wyniki znajdziesz w katalogu `projects/budget-app/`:

- `discovery_report.md` — pełny raport
- `scorecard.md` — verdykt + confidence

**Krok 5**: Wygeneruj raport HTML:

```bash
product-discovery export-report --project budget-app --theme dark --open
```

### 🇬🇧

```bash
product-discovery "Home budget app for young couples" \
  --project budget-app --industry fintech

# Results in projects/budget-app/
product-discovery export-report --project budget-app --theme dark --open
```

---

## 3. Import realnych wywiadów / Importing Real Interviews

### 🇵🇱

**Kiedy używać?** Gdy masz transkrypcje z realnych rozmów z użytkownikami.

**Obsługiwane formaty**: `.md`, `.txt`, `.docx`

**Krok 1**: Przygotuj pliki z wywiadami w jednym katalogu:

```
transkrypcje/
├── wywiad_jan_kowalski.md
├── wywiad_anna_nowak.md
└── wywiad_piotr_wisniewski.txt
```

**Krok 2**: Importuj wszystkie na raz:

```bash
product-discovery import-interviews --project budget-app --dir ./transkrypcje/
```

**Albo pojedynczy plik:**

```bash
product-discovery import-interviews --project budget-app --file wywiad_jan.md
```

**Krok 3**: System automatycznie:

- 🏷️ Wyodrębni tematy (pricing, UX, security, integration...)
- 🔍 Oceni jakość odpowiedzi (genuine / polite_lie / vague)
- 📊 Policzy saturation score Sₙ (czy potrzebujesz więcej wywiadów?)

**Krok 4**: Sprawdź wyniki:

```
📋 Imported 3 interviews
   Themes found: pricing, onboarding, integration, security, time_savings
   Quality: 2 genuine, 0 polite_lie, 1 vague
   Saturation: 0.42 (zbieraj więcej wywiadów do >0.8)
```

### 🇬🇧

```bash
# Import directory of transcripts
product-discovery import-interviews --project budget-app --dir ./transcripts/

# Results: theme extraction, quality scoring, saturation curve
```

---

## 4. Śledzenie założeń / Assumption Tracking

### 🇵🇱

**Kiedy?** Przez cały cykl discovery — od początkowych hipotez po wyniki testów.

**Krok 1**: Dodaj założenie:

```bash
product-discovery assumptions add \
  --project budget-app \
  --hypothesis "Młode pary chcą dzielić wydatki 50/50" \
  --type desirability \
  --risk 8 \
  --uncertainty 7
```

**Typy**: `desirability`, `viability`, `feasibility`, `usability`, `ethical`

**Krok 2**: Dodaj kolejne założenia:

```bash
product-discovery assumptions add --project budget-app \
  --hypothesis "Użytkownicy zapłacą 29 PLN/msc" --type viability --risk 9 --uncertainty 8

product-discovery assumptions add --project budget-app \
  --hypothesis "Integracja z bankami jest technicznie możliwa" --type feasibility --risk 6 --uncertainty 5
```

**Krok 3**: Zobacz priorytetyzowaną listę (R×U):

```bash
product-discovery assumptions prioritize --project budget-app
```

```
🗺️ Assumption Board: budget-app
==================================================
ID     Type           R×U   Status      Hypothesis
----   -----------    ---   --------    ----------
A002   viability      72    ⬜ untested  Użytkownicy zapłacą 29 PLN/msc
A001   desirability   56    ⬜ untested  Młode pary chcą dzielić wydatki
A003   feasibility    30    ⬜ untested  Integracja z bankami...
```

**Krok 4**: Zaktualizuj status po teście:

```bash
product-discovery assumptions update --project budget-app \
  --id A002 --status invalidated --result "Tylko 12% gotowych zapłacić >20 PLN"
```

**Krok 5**: Sprawdź statystyki:

```bash
product-discovery assumptions stats --project budget-app
```

### 🇬🇧

```bash
product-discovery assumptions add --project X --hypothesis "..." --type desirability --risk 8 --uncertainty 7
product-discovery assumptions prioritize --project X
product-discovery assumptions update --project X --id A001 --status validated --result "Confirmed by 80%"
product-discovery assumptions stats --project X
```

---

## 5. Kontekst branżowy / Industry Context

### 🇵🇱

**Dlaczego?** Żeby aplikacja budowała wiedzę o branży i nie zaczynała od zera z każdym projektem.

**Krok 1**: Utwórz kontekst branżowy:

```bash
product-discovery industry init fintech --name "FinTech w Polsce"
```

**Krok 2**: Dodaj wiedzę z pliku (np. research notes):

```bash
product-discovery industry import fintech --file notatki_branżowe.md
```

**Krok 3**: Po zakończonym discovery — wzbogać kontekst automatycznie:

```bash
product-discovery industry enrich fintech --project budget-app
```

**Krok 4**: Sprawdź co wie system:

```bash
product-discovery industry show fintech
```

```
🏭 Industry: FinTech w Polsce
==================================================
Completeness: 45%
Sessions: 2
Players: Revolut, Zen, mBank, ING
Terms: PSD2, Open Banking, KYC, AML, BNPL
Trends: Embedded Finance, AI Underwriting
```

**Krok 5**: Przy kolejnym discovery — kontekst załaduje się automatycznie:

```bash
product-discovery "Neobank dla studentów" --project student-bank --industry fintech
# → System wie już o PSD2, KYC, znanych graczach itp.
```

### 🇬🇧

```bash
product-discovery industry init fintech --name "FinTech"
product-discovery industry import fintech --file research.md
product-discovery industry enrich fintech --project X
product-discovery industry show fintech
# Use: product-discovery "..." --industry fintech (auto-loads context)
```

---

## 6. Generowanie raportów / Generating Reports

### 🇵🇱

**Krok 1**: Wygeneruj interaktywny raport HTML:

```bash
product-discovery export-report --project budget-app --theme dark --open
```

Raport zawiera:

- 📊 Wykresy Plotly (evidence bar, forces, assumption scatter, saturation, radar)
- 🗺️ Diagramy Mermaid (OST tree, forces flow)
- 📋 Tabele z danymi
- 🎨 Responsywny layout, dark/light theme

**Krok 2** (opcjonalnie): Export do PDF:

```bash
# Wymaga: pip install playwright && playwright install chromium
product-discovery export-report --project budget-app --format pdf
```

### 🇬🇧

```bash
product-discovery export-report --project X --theme dark --open  # HTML
product-discovery export-report --project X --format pdf          # PDF
```

---

## 7. Matryca Impact/Effort

### 🇵🇱

**Kiedy?** Po zidentyfikowaniu opportunities/solutions — do priorytetyzacji.

```bash
# Dodaj rozwiązania z oceną impact i effort (1-10)
product-discovery solutions add --project budget-app --name "Splitowanie rachunków" --impact 9 --effort 3
product-discovery solutions add --project budget-app --name "AI kategoryzacja wydatków" --impact 8 --effort 7
product-discovery solutions add --project budget-app --name "Export do CSV" --impact 3 --effort 2
product-discovery solutions add --project budget-app --name "Integracja z 50 bankami" --impact 4 --effort 9

# Zobacz matrycę
product-discovery solutions matrix --project budget-app
```

```
📊 Impact/Effort Matrix: budget-app
============================================================
ID     Quadrant         I   E   Name
------------------------------------------------------------
S001   🎯 Quick Win     9   3   Splitowanie rachunków
S002   🎲 Big Bet       8   7   AI kategoryzacja wydatków
S003   📝 Fill-in       3   2   Export do CSV
S004   🕳️ Money Pit     4   9   Integracja z 50 bankami

🎯 Quick Wins: 1 | 🎲 Big Bets: 1 | 📝 Fill-ins: 1 | 🕳️ Money Pits: 1
```

### 🇬🇧

```bash
product-discovery solutions add --project X --name "Feature" --impact 9 --effort 3
product-discovery solutions matrix --project X
```

---

## 8. Scoring jakości sesji / Session Quality Scoring

### 🇵🇱

**Kiedy?** Po zakończeniu discovery — żeby ocenić jakość procesu.

```bash
product-discovery score --project budget-app
```

```
📊 Discovery Score: budget-app
==================================================
Total: 68/100 (B)

  Industry Context          █████░░░░░ 50/100
    💡 Uzupełnij kontekst branżowy: 'industry enrich <slug>'
  Interview Depth            ████████░░ 80/100
  Evidence Level             ██████░░░░ 60/100
    💡 Zbierz dowody behawioralne (Level 2+)
  Assumption Coverage        ███████░░░ 67/100
  Competitive Depth          ███████░░░ 70/100
  Confidence                 ████████░░ 75/100
```

### 🇬🇧

```bash
product-discovery score --project X
# Returns: 0-100 score, A+→F grade, per-dimension feedback
```

---

## 9. Szablony sesji / Session Templates

### 🇵🇱

Dostępne szablony dopasowane do konkretnych przypadków użycia:

```bash
product-discovery templates
```

| Szablon | Opis | Czas |
|---------|------|------|
| `new_product` | Pełne discovery od JTBD po GO/NO-GO | ~180 min |
| `improvement` | Ulepszenia istniejącego produktu | ~90 min |
| `competitive_intel` | Analiza konkurencji i trendów | ~120 min |
| `recruitment` | Zadanie rekrutacyjne (time-boxed) | ~120 min |
| `workshop` | Warsztat z interesariuszami | ~240 min |

**Użycie:**

```bash
product-discovery "pomysł" --project NAZWA --template recruitment
```

### 🇬🇧

```bash
product-discovery templates
product-discovery "idea" --project X --template new_product
```

---

## 10. Integracje / Integrations

### Miro

```bash
# .env:
MIRO_ACCESS_TOKEN=your-token
MIRO_BOARD_ID=your-board-id

# Export
product-discovery export-miro --project budget-app
```

Tworzy: frames, sticky notes (color-coded), shapes, connectors.

### Google Docs

```bash
# .env:
GOOGLE_SERVICE_ACCOUNT_FILE=path/to/service-account.json

# Export
product-discovery export-gdocs --project budget-app --share-with zespol@firma.com
```

### Slack

```bash
# .env:
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Dodaj --notify-slack do dowolnej komendy
product-discovery "pomysł" --project X --notify-slack
```

---

## 11. Scenariusze użycia / Use Case Scenarios

### 🎯 Scenariusz A: Nowy produkt (discovery od zera)

```bash
# 1. Utwórz kontekst branżowy
product-discovery industry init edtech --name "EdTech"
product-discovery industry import edtech --file market_research.md

# 2. Uruchom pełne discovery
product-discovery "Platforma do nauki programowania dla dzieci 8-12 lat" \
  --project kids-code --industry edtech --template new_product

# 3. Dodaj założenia
product-discovery assumptions add --project kids-code \
  --hypothesis "Rodzice zapłacą 49 PLN/msc" --type viability --risk 9 --uncertainty 8

# 4. Importuj wywiady z rodzicami
product-discovery import-interviews --project kids-code --dir ./wywiady_rodzice/

# 5. Dodaj rozwiązania
product-discovery solutions add --project kids-code --name "Grywalizacja" --impact 9 --effort 5
product-discovery solutions add --project kids-code --name "Tryb offline" --impact 4 --effort 8

# 6. Sprawdź scoring i export
product-discovery score --project kids-code
product-discovery export-report --project kids-code --theme dark --open
product-discovery export-miro --project kids-code
```

### 🔧 Scenariusz B: Ulepszenie istniejącego produktu

```bash
# 1. Discovery z szablonem improvement
product-discovery "Poprawa onboardingu w aplikacji bankowej" \
  --project onboarding-fix --industry fintech --template improvement

# 2. Importuj wywiady z użytkownikami
product-discovery import-interviews --project onboarding-fix --dir ./user_interviews/

# 3. Matryca rozwiązań
product-discovery solutions add --project onboarding-fix --name "Wizard krok-po-kroku" --impact 9 --effort 3
product-discovery solutions add --project onboarding-fix --name "Video tutorial" --impact 6 --effort 4
product-discovery solutions matrix --project onboarding-fix

# 4. Raport
product-discovery export-report --project onboarding-fix --open
```

### 🎓 Scenariusz C: Zadanie rekrutacyjne

```bash
# Time-boxed 2h discovery
product-discovery "Marketplace dla usług sprzątania" \
  --project recruitment-task --template recruitment

# Po zakończeniu — scoring + PDF do portfolio
product-discovery score --project recruitment-task
product-discovery export-report --project recruitment-task --theme light
```

### 🧑‍🏫 Scenariusz D: Warsztat discovery

```bash
# 1. Przygotuj kontekst branżowy przed warsztatem
product-discovery industry init logistics --name "Logistyka ostatniej mili"
product-discovery industry import logistics --file pre_workshop_research.md

# 2. Po warsztacie — importuj notatki
product-discovery import-interviews --project last-mile --dir ./workshop_notes/

# 3. Priorytetyzacja
product-discovery assumptions add --project last-mile --hypothesis "..." --type desirability --risk 7 --uncertainty 6
product-discovery solutions add --project last-mile --name "Real-time tracking" --impact 9 --effort 6

# 4. Export do Miro dla zespołu
product-discovery export-miro --project last-mile
product-discovery export-gdocs --project last-mile --share-with team@company.com
```

---

## 💡 Wskazówki / Tips

1. **Zacznij od `--industry`** — kontekst branżowy znacząco poprawia jakość wyników AI
2. **Używaj `assumptions prioritize`** często — testuj najpierw R×U > 50
3. **Importuj wywiady iteracyjnie** — po 5-8 wywiadach sprawdź saturation score
4. **`score` po każdej sesji** — feedback loop do poprawy procesu
5. **`--template recruitment`** — idealny do szybkiego demo swoich skills PM-owych
