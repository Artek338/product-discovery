# Product Discovery — Testy E2E (Playwright)

## Szybki start

```bash
cd e2e
npm install
npx playwright install chromium

# Uruchom backend (w osobnym terminalu)
cd ..
PYTHONPATH=src DISCOVERY_MOCK=true uvicorn backend.main:app --port 8000

# Uruchom frontend (w osobnym terminalu)
cd frontend && npm run dev

# Uruchom testy
cd ../e2e
npm test
```

## Struktura

```
e2e/
├── playwright.config.ts       # Konfiguracja Playwright
├── package.json               # Zależności + skrypty
├── pages/                     # Page Object Model
│   ├── BasePage.ts            # Wspólna baza (sidebar, nawigacja)
│   ├── DashboardPage.ts
│   ├── NewDiscoveryPage.ts
│   ├── ReportPage.ts
│   ├── SimulatorPage.ts
│   └── SettingsPage.ts
├── specs/                     # Pliki testowe
│   ├── 01-dashboard.spec.ts   # Dashboard (lista projektów, wyszukiwanie)
│   ├── 02-new-discovery.spec.ts  # Formularz nowego projektu, walidacja
│   ├── 03-report.spec.ts      # Raport: progress, wyniki, eksport
│   ├── 04-simulator.spec.ts   # Symulator wywiadów (3 steps + chat)
│   ├── 05-settings.spec.ts    # Settings: API keys, integracje, zapis
│   └── 06-integration.spec.ts # Pełne flow E2E + health check + responsywność
└── fixtures/                  # Dane testowe (do uzupełnienia)
```

## Wymagania

- Node.js 18+
- Backend FastAPI na `http://localhost:8000`
- Frontend Vite na `http://localhost:5173`
- `DISCOVERY_MOCK=true` dla szybkich testów (bez LLM)

## Pokrycie testów

| Plik | Liczba scenariuszy | Opis |
|------|--------------------|------|
| 01-dashboard | 11 | Lista projektów, wyszukiwanie, nawigacja, status badges |
| 02-new-discovery | 12 | Formularz, walidacja, upload pliku, submit, redirect |
| 03-report | 22 | Progress, węzły, JTBD, Forces, Assumptions, PDF, Miro, Slack, GDocs |
| 04-simulator | 14 | Segment → archetypes → chat, follow-up, history |
| 05-settings | 28 | API keys, język, integracje, OAuth Google, zapis |
| 06-integration | 15 | Pełne flow, nawigacja, responsywność, error handling |
| **Razem** | **~102** | |

## Ważne uwagi dla implementacji

### Mock vs. Real API

Pliki `04-simulator.spec.ts` i `05-settings.spec.ts` używają `page.route()` do mockowania API.
Pliki `01-dashboard`, `02-new-discovery`, `03-report` działają na prawdziwym backendzie z `DISCOVERY_MOCK=true`.

### data-testid

Niektóre testy szukają `[data-testid="..."]`. Należy dodać do komponentów:
- `data-testid="archetype-card"` → `ArchetypeCard.tsx`
- `data-testid="progress-tracker"` → `ProgressTracker.tsx`
- `data-testid="verdict-badge"` → `VerdictBadge.tsx`
- `data-testid="current-node"` → `ProgressTracker.tsx`
- `data-testid="chat-message"` → `SimulatorChat.tsx`
- `data-testid="quality-badge"` → `SimulatorChat.tsx`

### Timeouty

- Discovery Mock: ~5s → timeout 60s (zapas)
- Simulator LLM: ~30s → timeout 60s
- Zapisanie settings: natychmiastowe → timeout 5s

### Izolacja testów

Testy w `03-report.spec.ts` używają `test.beforeAll` żeby stworzyć jedną sesję discovery dla całego describe bloku — nie każdy test startuje nową sesję.
