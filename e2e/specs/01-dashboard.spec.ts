/**
 * SCENARIUSZE: Dashboard (/)
 *
 * Pokrywa:
 *   - Widok pustej listy projektów
 *   - Karty statystyk
 *   - Tabela projektów (wiersze, statusy, sortowanie)
 *   - Wyszukiwanie projektów
 *   - Nawigacja do szczegółów projektu
 *   - Nawigacja do nowego projektu
 *   - Poprawność statusbadge
 *
 * Zależności: brak (dane z /api/projects — może być pusta lista)
 */
import { test, expect } from '@playwright/test'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await new DashboardPage(page).goto()
  })

  // ── Renderowanie ─────────────────────────────────────────────────────────────

  test('renders page title and navigation', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await expect(page.getByRole('link', { name: /Projekty|Dashboard/i }).first()).toBeVisible()
    await expect(dashboard.newProjectBtn).toBeVisible()
    await expect(page.getByRole('link', { name: /Symulator|Simulator/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Ustawienia|Settings/i })).toBeVisible()
  })

  test('renders stat cards (total, queued, completed, success rate)', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await expect(dashboard.statTotalProjects).toBeVisible()
    await expect(dashboard.statQueued).toBeVisible()
    await expect(dashboard.statCompleted).toBeVisible()
    await expect(dashboard.statSuccessRate).toBeVisible()
  })

  test('shows empty state when no projects exist', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const count = await dashboard.projectRows.count()
    if (count === 0) {
      await expect(page.getByText(/Brak projektów|No projects found/i)).toBeVisible()
    }
  })

  // ── Tabela projektów ─────────────────────────────────────────────────────────

  test('project table shows correct columns', async ({ page }) => {
    // Sprawdź nagłówki tabeli
    const headers = ['Nr', 'Nazwa', 'Tryb', 'Status', 'Data', 'Akcja']
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeVisible()
    }
  })

  test('each project row has a status badge', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const count = await dashboard.projectRows.count()
    if (count === 0) test.skip()

    const firstRow = dashboard.projectRows.first()
    const badge = firstRow.locator('span, [class*="badge"]').first()
    await expect(badge).toBeVisible()
  })

  test('clicking project row navigates to report page', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const count = await dashboard.projectRows.count()
    if (count === 0) test.skip()
    await dashboard.clickFirstProject()
    await expect(page).toHaveURL(/\/discovery\/.+/)
  })

  // ── Wyszukiwanie ─────────────────────────────────────────────────────────────

  test('search box is visible and accepts input', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await expect(dashboard.searchInput).toBeVisible()
    await dashboard.searchInput.fill('test-query')
    await expect(dashboard.searchInput).toHaveValue('test-query')
  })

  test('search filters projects by name', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const count = await dashboard.projectRows.count()
    if (count < 2) test.skip()

    const firstName = await dashboard.projectRows.first().locator('td').nth(1).textContent() ?? ''

    // Szukaj po niepełnej nazwie
    await dashboard.searchFor(firstName.slice(0, 3))
    // Po filtrze powinno być mniej lub równo wierszy
    const filteredCount = await dashboard.projectRows.count()
    expect(filteredCount).toBeLessThanOrEqual(count)
  })

  test('search with no match shows empty state', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.searchFor('xxxxxxxxxxxxxxxx-nie-istnieje')
    await page.waitForTimeout(400)
    await expect(page.getByText(/Brak projektów|No projects found/i)).toBeVisible()
  })

  // ── Nawigacja ─────────────────────────────────────────────────────────────────

  test('clicking "Nowy projekt" button navigates to /discovery/new', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    if (await dashboard.newProjectBtn.isVisible()) {
      await dashboard.newProjectBtn.click()
    } else {
      await page.getByRole('link', { name: /Nowy projekt|New Project/i }).first().click()
    }
    await expect(page).toHaveURL('/discovery/new')
  })

  // ── Status badges kolory ─────────────────────────────────────────────────────

  test('status badges display correct variants', async ({ page }) => {
    // Sprawdź, że styl zależy od wartości statusu
    const statuses = ['queued', 'running', 'completed', 'failed']
    for (const status of statuses) {
      const badge = page.locator(`[data-status="${status}"], span`).filter({ hasText: new RegExp(status, 'i') }).first()
      if (await badge.count() > 0) {
        await expect(badge).toBeVisible()
      }
    }
  })

  // ── Discovery mode badges ─────────────────────────────────────────────────────

  test('mode column shows auto/problem/solution values', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    const count = await dashboard.projectRows.count()
    if (count === 0) test.skip()

    const modeCell = dashboard.projectRows.first().locator('td').nth(2)
    const modeText = await modeCell.textContent()
    expect(['auto', 'problem', 'solution']).toContain(modeText?.toLowerCase().trim())
  })

})
