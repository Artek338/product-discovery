import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E — Product Discovery UI
 *
 * Wymagania przed uruchomieniem:
 *   1. Backend FastAPI działa na http://localhost:8000
 *      DISCOVERY_MOCK=true  (szybki fixture, bez LLM)
 *      PYTHONPATH=src uvicorn backend.main:app --port 8000
 *   2. Frontend Vite działa na http://localhost:5173
 *      cd frontend && npm run dev
 *   3. Instalacja: npx playwright install
 *
 * Uruchomienie:
 *   npx playwright test                    # wszystkie testy
 *   npx playwright test specs/dashboard    # jeden plik
 *   npx playwright test --ui               # tryb interaktywny
 *   npx playwright test --headed           # widoczna przeglądarka
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: false,       // Sekwencyjnie — backend współdzielony
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'pl-PL',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Odkomentuj dla cross-browser:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],

  // Webserver: automatycznie startuje backend i frontend przed testami
  // Odkomentuj jeśli chcesz auto-start zamiast ręcznego uruchamiania:
  // webServer: [
  //   {
  //     command: 'PYTHONPATH=src DISCOVERY_MOCK=true uvicorn backend.main:app --port 8000',
  //     url: 'http://localhost:8000/api/health',
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'cd frontend && npm run dev',
  //     url: 'http://localhost:5173',
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
})
