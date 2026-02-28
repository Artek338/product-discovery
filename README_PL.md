# 🔍 Product Discovery

**Zestaw narzędzi do discovery produktowego oparty o AI** — analiza JTBD, syntetyczne wywiady, badania konkurencji, decyzje GO/NO-GO oparte na dowodach, śledzenie założeń i interaktywne raporty.

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)]()

[🇬🇧 English version](README.md) | [📖 Instrukcja użytkownika](docs/USER_GUIDE.md)

---

## 🎯 Co to jest?

Product Discovery to **ustrukturyzowany, oparty na AI proces discovery**, który zapobiega budowaniu produktów, których nikt nie chce. Wspiera cały workflow PM-a — od walidacji pomysłu przez analizę konkurencji po gotowe raporty.

### Możliwości

| Kategoria | Funkcje |
|-----------|---------|
| **Discovery** | Analiza JTBD, syntetyczne wywiady, coaching wywiadów behawioralnych |
| **Badania** | OSINT — wywiad konkurencyjny, skanowanie rynków sąsiednich |
| **Analiza** | Grading dowodów (6 poziomów), Forces Diagram, mapowanie założeń |
| **Śledzenie** | Tracker założeń (taksonomia Torres), matryca Impact/Effort, scoring |
| **Export** | Interaktywne raporty HTML, tablice Miro, Google Docs, PDF |
| **Wiedza** | Persystentny kontekst branżowy, szablony sesji, wielojęzyczność (PL/EN) |
| **Powiadomienia** | Integracja z Slack (webhook) |

## ⚡ Szybki start

### 1. Instalacja

```bash
git clone https://github.com/Artek338/product-discovery.git
cd product-discovery
pip install -e ".[viz]"    # Core + wykresy Plotly
# Albo zainstaluj wszystko:
pip install -e ".[all]"
```

### 2. Konfiguracja

```bash
cp .env.example .env
# Wymagane:
#   ANTHROPIC_API_KEY=sk-ant-...
# Opcjonalne:
#   MIRO_ACCESS_TOKEN=...
#   MIRO_BOARD_ID=...
#   GOOGLE_SERVICE_ACCOUNT_FILE=...
#   SLACK_WEBHOOK_URL=...
```

### 3. Weryfikacja

```bash
product-discovery --check
```

### 4. Uruchom discovery

```bash
# Pełne discovery
product-discovery "SaaS dla freelance UX designerów" --project ux-tool --industry saas

# Z szablonem sesji
product-discovery "AI asystent kulinarny" --project cook-ai --template new_product
```

## 🤖 Agenci AI

| Agent | Rola | Framework |
|-------|------|-----------|
| **Business Analyst** | Analiza JTBD, grading dowodów, GO/NO-GO | Jobs-to-be-Done, Forces Diagram |
| **Synthetic User** | 4 archetypy rynkowe, symulacja wywiadów | Big Five, OCEAN, psychologia behawioralna |
| **Interview Coach** | Walidacja pytań, poprawa techniki | Mom Test, Cognitive Interview |
| **OSINT Researcher** | Wywiad konkurencyjny, sizing rynku | Perplexity AI, DuckDuckGo, HN |
| **Product Manager** | RICE scoring, ocena LNO, feature creep | RICE, DHM, Pre-Mortem |

## 📁 Struktura projektu

```
src/product_discovery/
├── agents/              # 5 agentów AI (pydantic-ai)
├── workflows/           # Graf discovery (pydantic-graph)
├── tools/               # Narzędzia domenowe
│   ├── interview_import.py    # Import realnych wywiadów + NLP
│   ├── assumption_tracker.py  # Tracker założeń (Torres)
│   ├── industry_context.py    # Persystentna wiedza branżowa
│   ├── impact_effort.py       # Matryca 2×2 rozwiązań
│   └── scoring_rubric.py      # Scoring jakości sesji
├── visualizations/      # Wykresy, diagramy, raporty
│   ├── charts.py              # Plotly (5 typów wykresów)
│   ├── mermaid.py             # Diagramy Mermaid (4 typy)
│   ├── report_html.py         # Interaktywny raport HTML
│   └── report_pdf.py          # Export do PDF
├── integrations/        # Usługi zewnętrzne
│   ├── miro_export.py         # Miro REST API v2
│   ├── gdocs_export.py        # Google Docs API
│   └── slack_notify.py        # Slack webhook
├── templates/           # Szablony sesji (5 przypadków użycia)
├── strings/             # i18n (PL/EN)
└── cli.py               # Punkt wejścia CLI (10 podkomend)

knowledge_base/          # 6 dokumentów deep research
```

## 🖥️ Komendy CLI

### Discovery

```bash
product-discovery "pomysł" --project NAZWA [--industry SLUG] [--template TYP]
product-discovery generate-prd --project NAZWA
```

### Wywiady

```bash
product-discovery import-interviews --project NAZWA --dir ./transkrypcje/
product-discovery import-interviews --project NAZWA --file wywiad1.md
```

### Założenia

```bash
product-discovery assumptions add --project NAZWA --hypothesis "Użytkownicy chcą X" --type desirability --risk 8 --uncertainty 7
product-discovery assumptions list --project NAZWA
product-discovery assumptions update --project NAZWA --id A001 --status validated --result "85% potwierdza"
product-discovery assumptions prioritize --project NAZWA
```

### Rozwiązania (Impact/Effort)

```bash
product-discovery solutions add --project NAZWA --name "Feature Y" --impact 9 --effort 3
product-discovery solutions matrix --project NAZWA
```

### Kontekst branżowy

```bash
product-discovery industry init fintech --name "FinTech"
product-discovery industry show fintech
product-discovery industry enrich fintech --project NAZWA
product-discovery industry import fintech --file notatki.md
product-discovery industry list
```

### Export i raporty

```bash
product-discovery export-report --project NAZWA --theme dark --open
product-discovery export-miro --project NAZWA
product-discovery export-gdocs --project NAZWA --share-with zespol@firma.com
```

### Inne

```bash
product-discovery score --project NAZWA       # Ocena jakości (0-100, A+→F)
product-discovery templates                   # Lista szablonów sesji
product-discovery --check                     # Weryfikacja instalacji
product-discovery --version                   # Wersja
```

## 🧪 Poziomy dowodów

| Poziom | Nazwa | Przykład | Czy GO? |
|--------|-------|---------|---------|
| 0 | Opinia | "Myślę, że użytkownicy by chcieli" | ❌ |
| 1 | Preferencja | "Kupiłbyś to?" → "Tak" | ❌ |
| 2 | Przeszłe zachowanie | "Opowiedz o OSTATNIM razie gdy..." | ⚠️ Min |
| 3 | Zaangażowanie czasu | Zapis na betę, waitlista | ✅ |
| 4 | Zaangażowanie finansowe | Depozyt, preorder | ✅ |
| 5 | Gotówka | Zapłacił pełną cenę z góry | ✅ |

## 📦 Opcjonalne zależności

```bash
pip install -e ".[viz]"     # Plotly + Kaleido (wykresy)
pip install -e ".[miro]"    # Miro API
pip install -e ".[gdocs]"   # Google Docs API
pip install -e ".[docx]"    # Import wywiadów .docx
pip install -e ".[pdf]"     # PDF export (Playwright)
pip install -e ".[all]"     # Wszystko
```

## 📖 Metodologie

- **Jobs-to-be-Done** (Tony Ulwick, Bob Moesta)
- **Forces Diagram** / Switch Interview (Bob Moesta)
- **Continuous Discovery Habits** (Teresa Torres)
- **Mom Test** (Rob Fitzpatrick)
- **Opportunity Solution Trees** (Teresa Torres)
- **RICE Prioritization** (Intercom)
- **DHM Model** (Gibson Biddle, Netflix)
- **Pre-Mortem** (Shreyas Doshi)

## 🧪 Testy

```bash
pytest tests/ -v                # Wszystkie testy
pytest tests/ -m integration    # Tylko integracyjne (wymaga kluczy API)
```

## 📄 Licencja

MIT License — patrz [LICENSE](LICENSE)
