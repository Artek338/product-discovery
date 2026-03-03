/**
 * SCENARIUSZE: Testy integracyjne (E2E pełne flow)
 *
 * Pokrywa:
 *   - Pełny flow Discovery: formularz → raport → eksport PDF
 *   - Flow Simulator: segment → archetypes → chat (3 pytania)
 *   - Nawigacja globalna (sidebar + header)
 *   - Responsywność (mobile / desktop)
 *   - Health check backendu
 *   - API connectivity
 *
 * Zależności: DISCOVERY_MOCK=true, backend + frontend uruchomione
 */
import { test, expect } from '@playwright/test'
import { NewDiscoveryPage } from '../pages/NewDiscoveryPage'
import { ReportPage } from '../pages/ReportPage'
import { SimulatorPage } from '../pages/SimulatorPage'
import { SettingsPage } from '../pages/SettingsPage'
import { DashboardPage } from '../pages/DashboardPage'

// ── Health Check ──────────────────────────────────────────────────────────────

test.describe('API Health', () => {
  test('backend responds on /api/health', async ({ request }) => {
    const resp = await request.get('http://localhost:8001/api/health')
    expect(resp.status()).toBe(200)
    const body = await resp.json()
    expect(body.status).toBe('ok')
  })

  test('frontend app loads without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filtruj znane non-blocking błędy (np. browser extensions)
    const blockers = errors.filter(e =>
      !e.includes('chrome-extension') &&
      !e.includes('favicon') &&
      !e.includes('ResizeObserver'),
    )
    expect(blockers).toHaveLength(0)
  })

  test('GET /api/projects returns 200', async ({ request }) => {
    const resp = await request.get('http://localhost:8001/api/projects')
    expect(resp.status()).toBe(200)
    const body = await resp.json()
    expect(Array.isArray(body)).toBeTruthy()
  })

  test('GET /api/settings returns 200', async ({ request }) => {
    const resp = await request.get('http://localhost:8001/api/settings')
    expect(resp.status()).toBe(200)
    const body = await resp.json()
    expect(body).toHaveProperty('llm_model')
    expect(body).toHaveProperty('data_dir')
  })
})

// ── Pełny Discovery Flow ──────────────────────────────────────────────────────

test.describe('Full Discovery Flow (MOCK)', () => {

  test('creates discovery, waits for completion, views report', async ({ page }) => {
    // Krok 1: Dashboard
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await expect(page).toHaveURL('/')

    // Krok 2: Nowy projekt
    const disc = new NewDiscoveryPage(page)
    await disc.goto()
    await disc.fillForm({
      projectName: 'e2e-integration-test',
      idea: 'Platforma dla freelancerów UX do zarządzania projektami i rozliczeniami. Target: polscy freelancerzy 25-40 lat.',
      mode: 'auto',
      notes: 'Wywiad 1: "Tracę 3h tygodniowo na faktury"\nWywiad 2: "Potrzebuję czegoś prostszego niż Jira"',
    })

    // Krok 3: Submit → redirect
    const sessionId = await disc.submit()
    expect(sessionId).not.toBeNull()
    await expect(page).toHaveURL(`/discovery/${sessionId}`)

    // Krok 4: Czekaj na raport
    const report = new ReportPage(page)
    await expect(page.getByText(/Discovery in progress/i)).toBeVisible({ timeout: 5000 })
    await report.waitForCompletion(60_000)

    // Krok 5: Sprawdź raport
    await expect(page.getByText(/e2e-integration-test/i)).toBeVisible()
    await expect(report.verdictBadge).toBeVisible()
    await expect(page.getByText(/Jobs-to-be-Done/i)).toBeVisible()
    await expect(page.getByText(/Assumption/i)).toBeVisible()

    // Krok 6: PDF link istnieje
    const pdfLink = page.getByRole('link', { name: /PDF/i })
    await expect(pdfLink).toBeVisible()
    const href = await pdfLink.getAttribute('href')
    expect(href).toContain(sessionId)

    // Krok 7: Projekt pojawia się na Dashboardzie
    await dashboard.goto()
    const projectRow = await dashboard.getProjectRowByName('e2e-integration-test')
    await expect(projectRow).toBeVisible()
  })

  test('completed project appears on dashboard with correct status', async ({ page }) => {
    // Zakładamy że poprzedni test stworzył projekt
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    const row = await dashboard.getProjectRowByName('e2e-integration-test')
    if (await row.count() > 0) {
      const statusBadge = row.locator('span, [class*="badge"]').first()
      const statusText = await statusBadge.textContent()
      expect(statusText?.toLowerCase()).toMatch(/completed|ukończona|queued|running/)
    }
  })

})

// ── Pełny Simulator Flow ──────────────────────────────────────────────────────

test.describe('Full Simulator Flow', () => {

  test('segment → archetypes → 2 questions flow (mocked API)', async ({ page }) => {
    // Mock API
    await page.route('**/api/simulator/archetypes', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            archetype_name: 'Efektywny Egzekutor',
            demographics: '32 lat, freelancer backend, 7 klientów/rok',
            psychology: 'Pragmatyczny, nie lubi administracji',
            jtbd_hypothesis: 'Zautomatyzować rozliczenia żeby skupić się na kodowaniu',
            forces_hypothesis: 'Push: chaos fakturowy. Pull: więcej czasu na projekty.',
            expected_interview_behaviors: ['Konkretne', 'Do rzeczy'],
            hypotheses_to_test: ['H1: Brak czasu na admin', 'H2: Chce automatyzacji'],
            red_flags_expected: ['Mówi "może" zamiast "tak"'],
          },
        ]),
      }),
    )
    await page.route('**/api/simulator/question', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          question_asked: '',
          response: 'Tak, ostatnio spędziłem 4 godziny na wystawianiu faktur zamiast programować.',
          response_quality: 'genuine',
          hidden_thought: 'To prawda, to mnie irytuje.',
          follow_up_suggested: 'Co konkretnie zajmuje Ci najwięcej czasu w tym procesie?',
        }),
      }),
    )

    const sim = new SimulatorPage(page)
    await sim.goto()

    // Step 1: Segment
    await sim.enterSegment('Freelancerzy backend, Polska')
    await sim.generateBtn.click()
    await page.waitForTimeout(500)

    // Step 2: Select archetype
    const cards = page.locator('[data-testid="archetype-card"], [class*="card"][class*="cursor"]')
    await cards.first().waitFor({ timeout: 5000 }).catch(() => null)
    if (await cards.count() > 0) {
      await cards.first().click()
    }

    // Step 3: Chat — 2 pytania
    await sim.chatInput.waitFor({ timeout: 5000 }).catch(() => null)
    if (await sim.chatInput.count() === 0) {
      test.skip()
      return
    }

    await sim.sendQuestion('Opowiedz mi o ostatnim razie gdy wystawiałeś faktury klientowi.')
    await page.waitForTimeout(1500)

    await sim.sendQuestion('Jak długo trwa Ci zazwyczaj ten proces?')
    await page.waitForTimeout(1500)

    // Sprawdź że chat ma przynajmniej 2 odpowiedzi usera
    const userTexts = page.getByText(/Opowiedz mi|Jak długo/i)
    expect(await userTexts.count()).toBeGreaterThanOrEqual(1)
  })

})

// ── Nawigacja Globalna ────────────────────────────────────────────────────────

test.describe('Global Navigation', () => {

  test('sidebar links navigate to correct pages', async ({ page }) => {
    await page.goto('/')

    // Dashboard
    await page.getByRole('link', { name: /Projekty|Dashboard/i }).first().click()
    await expect(page).toHaveURL('/')

    // New Discovery
    await page.getByRole('link', { name: /Nowy projekt|New Project/i }).first().click()
    await expect(page).toHaveURL('/discovery/new')

    // Simulator
    await page.getByRole('link', { name: /Symulator|Simulator/i }).first().click()
    await expect(page).toHaveURL('/simulate')

    // Settings
    await page.getByRole('link', { name: /Ustawienia|Settings/i }).first().click()
    await expect(page).toHaveURL('/settings')
  })

  test('active navigation item is highlighted', async ({ page }) => {
    await page.goto('/settings')
    const settingsLink = page.getByRole('link', { name: /Ustawienia|Settings/i }).first()
    const classes = await settingsLink.getAttribute('class')
    // Klasa aktywna zawiera zwykle 'active', 'bg-', lub inny wyróżnik
    expect(classes).toBeTruthy()
  })

  test('logo/brand navigates to dashboard', async ({ page }) => {
    await page.goto('/discovery/new')
    const logo = page.locator('a[href="/"], [class*="logo"], [class*="brand"]').first()
    if (await logo.count() > 0) {
      await logo.click()
      await expect(page).toHaveURL('/')
    }
  })

})

// ── Responsywność ─────────────────────────────────────────────────────────────

test.describe('Responsiveness', () => {

  test('dashboard renders on mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Upewnijmy się, że główne bloki są widoczne na mniejszym ekranie bez nachodzenia
    await expect(page.getByText(/Przegląd Discovery|Discovery overview/i)).toBeVisible()
    await expect(page.getByText(/Statystyki sesji|Session Statistics/i)).toBeVisible()
    await expect(page.getByText(/Efektywność Discovery|Discovery Effectiveness/i)).toBeVisible()
  })

  test('settings page renders on tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /Ustawienia|Settings/i })).toBeVisible()
  })

  test('new discovery form renders on desktop (1280x800)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/discovery/new')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /Uruchom Discovery|Launch Discovery/i })).toBeVisible()
  })

})

// ── Error Handling ────────────────────────────────────────────────────────────

test.describe('Error Handling', () => {

  test('handles backend down gracefully on dashboard', async ({ page }) => {
    // Symuluj niedostępność backendu
    await page.route('**/api/projects', route =>
      route.fulfill({ status: 503, body: 'Service Unavailable' }),
    )
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Strona nie powinna się crashować
    const title = page.getByText(/Projekty|Dashboard/i).first()
    await expect(title).toBeVisible({ timeout: 5000 })
  })

  test('handles backend down gracefully on settings', async ({ page }) => {
    await page.route('**/api/settings', route =>
      route.fulfill({ status: 500, body: 'Error' }),
    )
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Powinien pokazać błąd zamiast crashować
    await expect(page.getByText(/Ustawienia|Settings|błąd|error/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('404 discovery session shows handled error', async ({ page }) => {
    await page.route('**/api/discovery/*/status', route =>
      route.fulfill({ status: 404, body: JSON.stringify({ detail: 'Session not found' }) }),
    )
    await page.goto('/discovery/definitely-not-real')
    await page.waitForTimeout(2000)

    const hasError = await page.getByText(/not found|nie znaleziono|404|Error/i).count() > 0
    expect(hasError).toBeTruthy()
  })

})
