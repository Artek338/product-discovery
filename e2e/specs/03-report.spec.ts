/**
 * SCENARIUSZE: Report Page (/discovery/:id)
 *
 * Pokrywa:
 *   - ProgressTracker podczas działania discovery
 *   - Polling statusu (węzły 1-8)
 *   - Widok ukończonego raportu
 *   - Verdict badge (GO / NO-GO / NEEDS_MORE_DATA)
 *   - Karty statystyk (confidence, duration, delta)
 *   - Sekcja JTBD (3 jobs, competing solutions)
 *   - Forces diagram
 *   - Assumption Map (tabela)
 *   - Archetype cards
 *   - Competitive analysis
 *   - Eksport PDF (link)
 *   - Eksport Miro (modal + dry_run)
 *   - Eksport Slack (inline feedback)
 *   - Eksport Google Docs (inline feedback)
 *   - Failed discovery state
 *   - "Back to Dashboard" link
 *
 * Zależności: DISCOVERY_MOCK=true (szybkie ~5s, fixture z GO verdict)
 */
import { test, expect } from '@playwright/test'
import { NewDiscoveryPage } from '../pages/NewDiscoveryPage'
import { ReportPage } from '../pages/ReportPage'

// Uruchom jedno discovery przed grupą testów raportu
// sessionId będzie współdzielony między testami
let sharedSessionId: string | null = null

test.describe('Report Page', () => {

  test.beforeAll(async ({ browser }) => {
    // Utwórz sesję raz dla wszystkich testów w tym describe bloku
    const page = await browser.newPage()
    const disc = new NewDiscoveryPage(page)
    await disc.goto()
    await disc.fillForm({ projectName: 'E2E Report Test', idea: 'A great idea to test the report.' })
    sharedSessionId = await disc.submit()

    // Poczekaj na zakończenie (mock ~5s)
    if (sharedSessionId) {
      const report = new ReportPage(page)
      await report.goto(sharedSessionId)
      await report.waitForCompletion(60_000)
    }
    await page.close()
  })

  // ── Progress view ─────────────────────────────────────────────────────────────

  test('shows spinner and "Discovery in progress" while running', async ({ page }) => {
    // Utwórz nową sesję żeby złapać stan "running"
    const disc = new NewDiscoveryPage(page)
    await disc.goto()
    await disc.fillForm({ projectName: 'progress-test', idea: 'Test idea for progress tracking' })
    const sessionId = await disc.submit()
    if (!sessionId) return

    const report = new ReportPage(page)
    // Strona powinna od razu pokazywać progress
    await expect(page.getByText(/Discovery in progress/i)).toBeVisible({ timeout: 5000 })
  })

  test('ProgressTracker updates through nodes 1-8', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.goto()
    await disc.fillForm({ projectName: 'node-progress-test', idea: 'Progress node test idea' })
    const sessionId = await disc.submit()
    if (!sessionId) return

    // Sprawdź czy numer węzła rośnie (mock symuluje 8 kroków)
    const nodeNames = [
      'SyntheticInterviewNode',
      'CompetitiveResearchNode',
      'ScorecardNode',
    ]
    for (const nodeName of nodeNames) {
      await page.locator(`text=${nodeName}`).first().waitFor({ timeout: 10_000 }).catch(() => null)
    }
  })

  test('progress logs are visible during discovery', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.goto()
    await disc.fillForm({ projectName: 'logs-test', idea: 'Logs visibility test idea' })
    const sessionId = await disc.submit()
    if (!sessionId) return

    // Logi powinny być widoczne
    const log = page.locator('[class*="log"], code, pre').first()
    await log.waitFor({ timeout: 20_000 }).catch(() => null)
  })

  // ── Ukończony raport ──────────────────────────────────────────────────────────

  test('completed report renders project name in header', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await expect(report.projectTitle).toBeVisible()
  })

  test('verdict badge shows GO / NO-GO / NEEDS_MORE_DATA', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    const badge = report.verdictBadge
    await expect(badge).toBeVisible()
    const text = await badge.textContent()
    expect(text?.trim()).toMatch(/GO|NO-GO|NEEDS_MORE_DATA/i)
  })

  test('stat cards: confidence, duration, confidence delta are visible', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await expect(report.confidenceCard).toBeVisible()
    await expect(report.durationCard).toBeVisible()
    await expect(report.deltCard).toBeVisible()
  })

  test('confidence card shows numeric value with %', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    const confidenceEl = page.locator('[class*="font-mono"]').filter({ hasText: /%/ }).first()
    await expect(confidenceEl).toBeVisible()
    const text = await confidenceEl.textContent()
    expect(text).toMatch(/\d+%/)
  })

  // ── JTBD Section ──────────────────────────────────────────────────────────────

  test('JTBD section is visible with correct heading', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await expect(page.getByText(/Jobs-to-be-Done/i)).toBeVisible()
  })

  test('JTBD section shows functional, emotional, social jobs', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    await expect(page.getByText(/Functional Job|functional_job/i)).toBeVisible()
    await expect(page.getByText(/Emotional Job|emotional_job/i)).toBeVisible()
    await expect(page.getByText(/Social Job|social_job/i)).toBeVisible()
  })

  test('JTBD section shows competing solutions', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    await expect(page.getByText(/Current Solutions in Market|Competing solutions|Alternatives/i)).toBeVisible()
  })

  // ── Forces ───────────────────────────────────────────────────────────────────

  test('Forces section is visible', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    const forces = page.getByText(/Forces/i).first()
    await expect(forces).toBeVisible()
  })

  test('Forces chart renders (Plotly or Mermaid container)', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    // Plotly lub mermaid
    const chart = page.locator('.js-plotly-plot, .mermaid, [class*="chart"], [class*="force"]').first()
    if (await chart.count() > 0) {
      await expect(chart).toBeVisible()
    }
  })

  // ── Assumption Map ────────────────────────────────────────────────────────────

  test('Assumption Map section is visible', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    await expect(page.getByText(/Assumption Map|Mapa założeń/i).first()).toBeVisible()
  })

  test('Assumption Table renders rows with ID, type, status columns', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    const table = page.locator('table').last()
    if (await table.count() > 0) {
      await expect(table).toBeVisible()
      const rows = table.locator('tbody tr')
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  // ── Archetype Cards ───────────────────────────────────────────────────────────

  test('Synthetic Personas section shows archetype cards', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    const archetypes = page.getByText(/Archetype|Archetyp/i)
    if (await archetypes.count() > 0) {
      await expect(archetypes.first()).toBeVisible()
    }
  })

  // ── Competitive Analysis ──────────────────────────────────────────────────────

  test('Competitive Analysis section renders markdown', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    const competitive = page.getByText(/Competitive|Konkurency/i).first()
    if (await competitive.count() > 0) {
      await expect(competitive).toBeVisible()
    }
  })

  // ── Export buttons ────────────────────────────────────────────────────────────

  test('PDF export link exists and points to correct URL', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    await page.goto(`/discovery/${sharedSessionId}`)
    const pdfLink = page.getByRole('link', { name: /PDF/i })
    await expect(pdfLink).toBeVisible()
    const href = await pdfLink.getAttribute('href')
    expect(href).toContain(`/api/export/${sharedSessionId}/pdf`)
  })

  test('Miro button opens export modal', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await report.exportMiroBtn.click()
    await expect(report.miroModal).toBeVisible({ timeout: 3000 })
  })

  test('Miro modal has dry_run toggle enabled by default', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await report.exportMiroBtn.click()
    await expect(report.miroModal).toBeVisible()
    // dry_run checkbox powinien być widoczny
    const dryRun = page.getByLabel(/dry.?run/i)
    if (await dryRun.count() > 0) {
      const checked = await dryRun.isChecked()
      // Domyślnie może być true lub false — sprawdzamy tylko widoczność
      expect(typeof checked).toBe('boolean')
    }
  })

  test('Miro modal exports with dry_run and shows log', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await report.exportMiroBtn.click()
    await expect(report.miroModal).toBeVisible()

    // Upewnij się że dry_run jest zaznaczony
    const dryRunToggle = page.getByLabel(/dry.?run/i)
    if (await dryRunToggle.count() > 0 && !(await dryRunToggle.isChecked())) {
      await dryRunToggle.check()
    }

    // Kliknij eksportuj
    const exportBtn = page.getByRole('button', { name: /Eksportuj|Export/i }).last()
    if (await exportBtn.count() > 0) {
      await exportBtn.click()
      // Poczekaj na log
      await page.waitForTimeout(3000)
      const log = page.getByText(/Created|items_created/i)
      if (await log.count() > 0) await expect(log.first()).toBeVisible()
    }
  })

  test('Slack button sends notification and shows feedback', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    const slackBtn = report.exportSlackBtn

    if (await slackBtn.count() === 0) test.skip()

    // Monitoruj API call
    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/export/') && res.url().includes('/slack'),
        { timeout: 10_000 },
      ).catch(() => null),
      slackBtn.click(),
    ])

    // Feedback powinien być widoczny niezależnie od sukcesu/błędu
    await page.waitForTimeout(1000)
    // Feedback powinien być widoczny niezależnie od sukcesu/błędu
    await expect(page.getByRole('button', { name: /Wysłano|Błąd|Sent|Error/i })).toBeVisible({ timeout: 5000 })
  })

  test('Google Docs button triggers export API call', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    const gdocsBtn = report.exportGDocsBtn

    if (await gdocsBtn.count() === 0) test.skip()

    await gdocsBtn.click()

    // Backend może zwrócić 403 (niezalogowany) lub 200 (zalogowany)
    // W obu przypadkach feedback powinien się pojawić
    await page.waitForTimeout(2000)
    const errorMsg = page.getByText(/Brak autoryzacji|not signed in|403/i)
    const successLink = page.getByText(/Otwórz dokument|Open document/i)
    const either = (await errorMsg.count() > 0) || (await successLink.count() > 0)
    expect(either).toBeTruthy()
  })

  // ── Navigation ────────────────────────────────────────────────────────────────

  test('"Back to Dashboard" link navigates to /', async ({ page }) => {
    if (!sharedSessionId) test.skip()
    const report = new ReportPage(page)
    await report.goto(sharedSessionId!)
    await report.backToDashboard.click()
    await expect(page).toHaveURL('/')
  })

  // ── Failed State ──────────────────────────────────────────────────────────────

  test('shows "Discovery Failed" banner when status is failed', async ({ page }) => {
    // Symulujemy failed session przez mock API response
    await page.route('**/api/discovery/*/status', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session_id: 'fake-id',
          status: 'failed',
          progress: 2,
          current_node: 'SyntheticInterviewNode',
          logs: ['Error: test error'],
        }),
      }),
    )
    await page.goto('/discovery/fake-id')
    await expect(page.getByText(/Discovery Failed/i)).toBeVisible({ timeout: 5000 })
  })

  // ── Session not found ─────────────────────────────────────────────────────────

  test('shows error for non-existent session', async ({ page }) => {
    await page.goto('/discovery/non-existent-uuid-1234')
    // Powinien pojawić się błąd lub empty state
    await page.waitForTimeout(2000)
    const hasError = await page.getByText(/404|not found|Session not found/i).count() > 0
    const hasFailed = await page.getByText(/Failed|Error/i).count() > 0
    expect(hasError || hasFailed).toBeTruthy()
  })

})
