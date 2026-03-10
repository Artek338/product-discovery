# Product Discovery

**AI-powered product discovery toolkit** — JTBD analysis, synthetic interviews, competitive research, evidence-based GO/NO-GO decisions, interactive reports.

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.3.0-green.svg)]()

---

🇵🇱 **[Dokumentacja po polsku](#pl)** | 🇬🇧 **[English documentation](#en)**

---

<a name="pl"></a>
## 🇵🇱 Dokumentacja (Polski)

### Co to jest?

Product Discovery to narzędzie dla Product Managerów, które odpowiada na pytanie **„Czy warto to budować?"** — zanim wpiszesz choć jeden wiersz kodu.

Zamiast opierać się na domysłach i opiniach, dostajesz:
- Syntetyczne wywiady z użytkownikami (AI generuje archetypy, następnie wcielam się w nie podczas rozmowy)
- Research konkurencji oparty na danych
- Analizę sił zakupowych (Push / Pull / Anxiety / Habit)
- Mapę założeń posortowaną według ryzyka
- Rekomendację **GO / NO-GO / NEEDS_MORE_DATA** z poziomem pewności (0–100%)

Narzędzie dostępne jest jako:
- **Web UI** (zalecane) — pełen zestaw funkcji w przeglądarce
- **CLI** — interfejs terminalowy dla zaawansowanych użytkowników

---

### Szybki start

#### Opcja A: Web UI (zalecane)

**Wymagania:** Python 3.11+, Node.js 18+

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery

# 1. Backend (środowisko Python)
pip install -e ".[all]"
cp .env.example .env
# Otwórz .env i wpisz swój klucz ANTHROPIC_API_KEY

# 2. Frontend
cd frontend && npm install && cd ..

# 3. Uruchom oba serwisy jednocześnie
./start_dev.sh
```

Otwórz **http://localhost:5173** w przeglądarce.

> **Windows:** Jeśli `start_dev.sh` nie działa, uruchom oba serwisy ręcznie:
> ```bash
> # Terminal 1 — backend
> set PYTHONPATH=src
> uvicorn backend.main:app --reload --port 8000
>
> # Terminal 2 — frontend
> cd frontend && npm run dev
> ```

Po uruchomieniu wejdź w **Ustawienia** (ikona w lewym dolnym rogu) i wklej klucz API Anthropic.

---

#### Opcja B: Tylko CLI

```bash
pip install -e ".[all]"
cp .env.example .env
# Wpisz ANTHROPIC_API_KEY w .env

product-discovery "Opis pomysłu" --project nazwa-projektu
```

---

### Konfiguracja

Wszystkie ustawienia dostępne są przez **Ustawienia w Web UI** lub bezpośrednio w pliku `~/.product-discovery/config.json`.

| Ustawienie | Opis | Wymagane? |
|------------|------|-----------|
| `anthropic_api_key` | Klucz API Claude (Anthropic) | **Tak** |
| `data_dir` | Folder na projekty i bazę danych | Nie (domyślnie: `~/.product-discovery/data`) |
| `perplexity_api_key` | Research OSINT / competitive | Nie |
| `serper_api_key` | Wyszukiwarka Google do researchu | Nie |
| `brave_api_key` | Alternatywna wyszukiwarka | Nie |
| `miro_access_token` | Eksport do tablicy Miro | Nie |
| `miro_board_id` | ID tablicy Miro | Nie |
| `slack_webhook_url` | Powiadomienia Slack | Nie |
| `google_client_id` | Eksport do Google Docs | Nie |
| `google_client_secret` | Eksport do Google Docs | Nie |

**Gdzie pobrać klucze API:**
- **Anthropic** (wymagany): [console.anthropic.com](https://console.anthropic.com)
- **Perplexity**: [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
- **Serper**: [serper.dev](https://serper.dev)
- **Miro**: [developers.miro.com](https://developers.miro.com/docs/getting-started)
- **Slack**: Utwórz Incoming Webhook na [api.slack.com/apps](https://api.slack.com/apps)

---

### Tryby Discovery

| Tryb | Kiedy używać | Czas |
|------|-------------|------|
| **Auto** | Masz pomysł i chcesz pełną analizę | ~3–5 min |
| **Problem** | Chcesz potwierdzić, czy ból użytkownika istnieje | ~2–3 min |
| **Rozwiązanie** | Problem jest potwierdzony — chcesz wiedzieć co i jak zbudować | ~2–3 min |

---

### Poziomy dowodów (Evidence Levels)

System ocenia jakość zebranych dowodów na skali 0–5. Im wyższy poziom, tym większa wiarygodność rekomendacji GO.

| Poziom | Nazwa | Przykład | Może być GO? |
|--------|-------|---------|-------------|
| 0 | Opinia | „Myślę, że użytkownicy by to polubili" | Nie |
| 1 | Preferencja | „Czy kupiłbyś to?" → „Tak" | Nie |
| 2 | Przeszłe zachowanie | „Opowiedz mi, jak OSTATNIO..." | Minimum |
| 3 | Zobowiązanie czasu | Zapis na betę, lista oczekujących | Tak |
| 4 | Finansowe | Kaucja, preorder | Tak |
| 5 | Gotówka | Zapłacona pełna cena | Tak |

---

### Funkcje Web UI

#### Dashboard
- Lista wszystkich sesji Discovery ze statusem i werdyktem GO/NO-GO
- Statystyki sesji (wykres kołowy, wskaźnik ukończenia)
- Wyszukiwanie i filtrowanie po trybie / statusie

#### Nowy projekt
Wypełnij formularz i kliknij **Uruchom Discovery**:
- **Nazwa projektu** — identyfikator, np. `freelancer-tools`
- **Opis pomysłu** — 2–5 zdań o pomyśle, problemie, segmencie klientów
- **Tryb** — Auto / Problem / Rozwiązanie
- **Notatki z wywiadów** — wklej surowe notatki z rozmów (wzmacnia poziom dowodów)

Discovery działa w tle (~3–5 min). Postęp widoczny w czasie rzeczywistym (8 węzłów).

#### Raport
Po zakończeniu raport zawiera:
- **Werdykt** — GO / NO-GO / NEEDS_MORE_DATA z oceną (0–100%)
- **Jobs-to-be-Done** — co użytkownicy naprawdę próbują osiągnąć
- **Forces Diagram** — Push / Pull / Anxiety / Habit (dlaczego kupują lub nie)
- **Mapa założeń** — posortowane według ryzyka i niepewności
- **Competitive Intelligence** — powiązane produkty i nisze

**Opcje eksportu:** PDF · Miro · Slack · Google Docs

#### Symulator wywiadów
Ćwicz pytania odkrywcze na syntetycznych personach:
1. Opisz segment docelowy (np. *„Freelancerzy UX, 5–15 klientów rocznie, Polska"*)
2. Ustaw liczbę archetypów (1–8) i typ rynku (B2C / B2B / SaaS / Enterprise / Mixed)
3. Generuj profile — AI strumieniuje persony jedna po drugiej z psychologią, hipotezami JTBD i red flagami
4. Rozpocznij wywiad — zadawaj pytania, każda odpowiedź zawiera: odpowiedź, ocenę jakości (szczera / szczegółowa / kurtuazyjna / niejasna), ukrytą myśl, sugestię follow-up

#### Kompendium PM (`/kompendium`)
Biblioteka referencyjna dla product managerów:
- **25 frameworków** w 7 kategoriach: cykle discovery, definicja problemu, walidacja, analiza rynku, artefakty, priorytetyzacja, metryki
- **Kiedy używać** — tabela porównawcza (złożoność, czas cyklu, poziom automatyzacji AI)
- **Risk Checklist** — 53 pytania z poziomami wagi (FATAL / HIGH / MEDIUM); filtrowanie kontekstowe (Nowy produkt / Feature / Usługa / Produkt AI); zapamiętywany postęp
- **Dane YODA** — metodologia pretotypowania z kalkulatorem wyników i trackerem eksperymentów

#### Ustawienia
- Zmiana folderu danych
- Dodawanie / aktualizacja kluczy API
- Połączenie konta Google (OAuth2)
- Konfiguracja webhook Slack
- Włączenie Mock Mode (szybkie testy bez wywołań LLM — 3 sekundy, $0)
- Przełącznik ciemny / jasny motyw (dostępny też w górnym pasku)

---

### Konfiguracja Google Docs

Aby włączyć eksport do Google Docs:

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt
3. Włącz **Google Docs API** i **Google Drive API**
4. Utwórz dane OAuth 2.0 (typ: Web Application)
5. Dodaj `http://localhost:8000/api/auth/google/callback` jako Authorized redirect URI
6. Skopiuj Client ID i Client Secret do Ustawień w aplikacji

---

### Komendy CLI

```bash
# Pełne discovery
product-discovery "Opis pomysłu" --project moj-projekt

# Konkretny tryb
product-discovery "Pomysł" --mode problem --project moj-projekt
product-discovery "Pomysł" --mode solution --project moj-projekt

# Symulator wywiadów (interaktywny REPL)
product-discovery simulate "Opis segmentu docelowego"
product-discovery simulate "Segment" --archetype 2   # Zacznij od archetypu 2

# Weryfikacja instalacji
product-discovery --check
```

---

### Architektura

```
product-discovery/
├── backend/          # FastAPI — API, baza danych, logika biznesowa
│   ├── config.py     # Ustawienia użytkownika (~/.product-discovery/config.json)
│   ├── db.py         # SQLite via aiosqlite
│   └── routes/       # Endpointy API
├── frontend/         # React 18 + Vite + Tailwind
│   └── src/
│       ├── pages/    # Dashboard, NewDiscovery, Report, Simulator, Settings
│       └── components/
├── src/product_discovery/   # Silnik AI
│   ├── workflows/    # Graf discovery (8 węzłów, pydantic-ai)
│   └── agents/       # BA, Interview Coach, OSINT, PM, Synthetic User
└── e2e/              # Testy E2E (Playwright)
```

#### Graf Discovery (8 węzłów)

```
SyntheticInterview → BehavioralInterview → CompetitiveResearch → EvidenceGrading
→ ForcesDiagram → Synthesis → AssumptionMap → Scorecard → END
```

---

### Co nowego w v2.3.0

- **Dark Mode** — przełącznik w górnym pasku, preferencja zapamiętywana
- **Filtry na Dashboardzie** — filtrowanie sesji po trybie (Auto / Problem / Rozwiązanie) i statusie
- **Symulator — streamowane generowanie** — archetypy pojawiają się jeden po drugim; konfigurowalny liczba (1–8) i typ rynku
- **Kompendium v2.3** — 25 frameworków (+10: priorytetyzacja ×7, metryki ×4); Risk Checklist przebudowany z poziomami wagi i filtrowaniem kontekstowym
- **BA Agent — Hipoteza modelu biznesowego** — JTBD → model przychodów, analiza Defensibility (DHM), analiza white space
- **BA Agent — Ownership założeń** — każde założenie FATAL wymaga właściciela (PM / Eng / Design / Research), terminu i metody walidacji
- **PM Agent — Zabezpieczenia kalibracji RICE** — reach używa MAU nie zarejestrowanych użytkowników, confidence ograniczone do 80% bez danych MVP, effort +40% bufor

---

<a name="en"></a>
## 🇬🇧 English Documentation

### What is this?

Product Discovery is a **structured, AI-driven discovery process** that prevents building products nobody wants. It supports the full PM workflow — from idea validation through competitive analysis to export-ready reports.

The tool is available as:
- **Web UI** (recommended) — browser-based, full feature set
- **CLI** — terminal interface for power users

---

### Quick Start

#### Option A: Web UI (recommended)

**Requirements:** Python 3.11+, Node.js 18+

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery

# 1. Backend
pip install -e ".[all]"
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY (required)

# 2. Frontend
cd frontend && npm install && cd ..

# 3. Start both
./start_dev.sh
```

Open **http://localhost:5173** in your browser.

> **Windows:** Run backend and frontend manually if `start_dev.sh` doesn't work:
> ```bash
> # Terminal 1
> set PYTHONPATH=src
> uvicorn backend.main:app --reload --port 8000
> # Terminal 2
> cd frontend && npm run dev
> ```

Once running, go to **Settings** (icon in the bottom-left corner) and paste your Anthropic API key.

---

#### Option B: CLI only

```bash
pip install -e ".[all]"
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY

product-discovery "Your idea" --project my-project
```

---

### Configuration

All configuration is done through **Settings** in the Web UI, or by editing `~/.product-discovery/config.json` directly.

| Setting | Description | Required |
|---------|-------------|----------|
| `anthropic_api_key` | Claude API key | **Yes** |
| `data_dir` | Folder for storing projects and database | No (default: `~/.product-discovery/data`) |
| `perplexity_api_key` | For competitive research (OSINT) | No |
| `serper_api_key` | Google search for research | No |
| `brave_api_key` | Alternative search | No |
| `miro_access_token` | Miro board export | No |
| `miro_board_id` | Target Miro board | No |
| `slack_webhook_url` | Slack notifications | No |
| `google_client_id` | Google Docs export | No |
| `google_client_secret` | Google Docs export | No |

**Getting API keys:**
- **Anthropic** (required): [console.anthropic.com](https://console.anthropic.com)
- **Perplexity**: [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
- **Serper**: [serper.dev](https://serper.dev)
- **Miro**: [developers.miro.com](https://developers.miro.com/docs/getting-started)
- **Slack**: Create an Incoming Webhook at [api.slack.com/apps](https://api.slack.com/apps)

---

### Discovery Modes

| Mode | Use when | Duration |
|------|----------|----------|
| **Auto** | You have an idea and want full analysis | ~3–5 min |
| **Problem** | You want to validate a pain point exists | ~2–3 min |
| **Solution** | You have a validated problem, want to know what/how to build | ~2–3 min |

---

### Evidence Levels

| Level | Name | Example | Can GO? |
|-------|------|---------|---------|
| 0 | Opinion | "I think users would like it" | No |
| 1 | Preference | "Would you buy this?" → "Yes" | No |
| 2 | Past Behavior | "Tell me about the LAST time you..." | Minimum |
| 3 | Time Commitment | Beta signup, waitlist | Yes |
| 4 | Financial | Deposit, preorder | Yes |
| 5 | Cash | Paid full price | Yes |

---

### Web UI — Features

#### Dashboard
- List of all discovery sessions with status and GO/NO-GO verdict
- Session statistics (completion rate, average score)
- Search and filter by mode / status

#### New Discovery
Fill in the form and click **Launch Discovery**:
- **Project name** — used as identifier, e.g. `freelancer-tools`
- **Idea** — describe your product idea (2–5 sentences about the idea, problem, customer segment)
- **Mode** — Auto (full analysis), Problem (validate the pain), Solution (what/how to build)
- **Notes** — paste raw interview transcripts or market notes (strengthens evidence level)

Discovery runs in the background (~3–5 min with Claude Sonnet). Progress is shown in real time across 8 nodes.

#### Report
After completion, the report includes:
- **Verdict** — GO / NO-GO / NEEDS_MORE_DATA with score (0–100%)
- **Jobs-to-be-Done** — what users are actually trying to accomplish
- **Forces Diagram** — Push/Pull/Anxiety/Habit analysis (why users switch or don't)
- **Assumptions** — ranked by risk and uncertainty
- **Competitive Intelligence** — adjacent products and market gaps

**Export options:** PDF · Miro · Slack · Google Docs

#### Interview Simulator
Practice discovery interviews with AI personas:
1. **Describe your target segment** (e.g. "UX Freelancers with 5–15 clients annually in Poland")
2. **Configure** — set archetype count (1–8) and market type (B2C / B2B / SaaS / Enterprise / Mixed)
3. **Generate archetypes** — AI streams personas one by one with psychology, JTBD hypotheses, red flags
4. **Start interview** — choose an archetype and ask questions
   - Each response includes: answer, quality rating (genuine / detailed / polite lie / vague), hidden thought, follow-up suggestion

#### Knowledge Compendium (`/kompendium`)
Reference library for product managers:
- **25 frameworks** across 7 categories: discovery cycles, problem definition, validation, market analysis, artifacts, prioritization, metrics
- **When to use** — comparison table (complexity, cycle time, AI automation level)
- **Risk Checklist** — 53 questions across 9 categories with severity levels (FATAL / HIGH / MEDIUM); context-aware filtering (New Product / Feature / Service / AI Product); persisted progress
- **YODA Data** — pretotyping methodology with scoring calculator and experiment tracker

#### Settings
- Change data folder
- Add/update API keys
- Connect Google account (OAuth2)
- Configure Slack webhook
- Toggle Mock Mode (fast testing without LLM calls — ~3 seconds, $0)
- Dark / light mode toggle (also available in top bar)

---

### Google Docs Setup

To enable Google Docs export:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Docs API** and **Google Drive API**
4. Create OAuth 2.0 credentials (Web Application type)
5. Add `http://localhost:8000/api/auth/google/callback` as Authorized redirect URI
6. Copy Client ID and Client Secret to Settings in the app

---

### CLI Usage

```bash
# Run full discovery
product-discovery "Your idea description" --project my-project

# Run in specific mode
product-discovery "Your idea" --mode problem --project my-project
product-discovery "Your idea" --mode solution --project my-project

# Interview simulator (interactive REPL)
product-discovery simulate "Target segment description"
product-discovery simulate "Segment" --archetype 2   # Start with archetype 2

# Verify installation
product-discovery --check
```

---

### Architecture

```
product-discovery/
├── backend/          # FastAPI — API, DB, business logic
│   ├── config.py     # User settings (stored in ~/.product-discovery/config.json)
│   ├── db.py         # SQLite via aiosqlite
│   └── routes/       # API endpoints
├── frontend/         # React 18 + Vite + Tailwind
│   └── src/
│       ├── pages/    # Dashboard, NewDiscovery, Report, Simulator, Settings
│       └── components/
├── src/product_discovery/   # Core AI engine
│   ├── workflows/    # Discovery graph (8 nodes, pydantic-ai)
│   └── agents/       # BA, Interview Coach, OSINT, PM, Synthetic User
└── e2e/              # Playwright E2E tests
```

#### Discovery Graph (8 nodes)

```
SyntheticInterview → BehavioralInterview → CompetitiveResearch → EvidenceGrading
→ ForcesDiagram → Synthesis → AssumptionMap → Scorecard → END
```

---

### What's New in v2.3.0

- **Dark Mode** — toggle in the top bar, preference saved automatically
- **Dashboard filters** — filter sessions by mode (Auto / Problem / Solution) and status
- **Interview Simulator — streaming generation** — archetypes appear one by one as they're generated; configurable count (1–8) and market type (B2C / B2B / SaaS / Enterprise / Mixed)
- **Compendium v2.3** — 25 frameworks total (+10: prioritization × 7, metrics × 4); Risk Checklist rebuilt with severity levels (FATAL / HIGH / MEDIUM) and context-aware filtering (New Product / Feature / Service / AI Product)
- **BA Agent — Business Model Hypothesis** — JTBD → revenue model (per-seat / usage / outcome / freemium / marketplace), Defensibility (DHM), whitespace analysis
- **BA Agent — Assumption Ownership** — every FATAL assumption requires an owner (PM / Eng / Design / Research), deadline, and validation method before GO
- **PM Agent — RICE Calibration Guardrails** — reach uses MAU not registered users, confidence capped at 80% without MVP data, effort gets +40% buffer

---

### E2E Tests

```bash
cd e2e
npm install
# Start backend + frontend first (./start_dev.sh)
npx playwright test              # All tests
npx playwright test --ui         # Interactive mode
npx playwright test 01-dashboard # Specific spec
```

See [e2e/README.md](e2e/README.md) for details.

---

### Methodologies

- **Jobs-to-be-Done** (Tony Ulwick, Bob Moesta)
- **Forces Diagram / Switch Interview** (Bob Moesta)
- **Continuous Discovery Habits** (Teresa Torres)
- **Mom Test** (Rob Fitzpatrick)
- **Opportunity Solution Trees** (Teresa Torres)
- **RICE Prioritization** (Intercom)
- **DHM Model** (Gibson Biddle)

---

### License

MIT License — see [LICENSE](LICENSE)
