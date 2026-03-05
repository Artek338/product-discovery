import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
  readonly searchInput: Locator
  readonly newProjectBtn: Locator
  readonly projectsTable: Locator
  readonly projectRows: Locator
  readonly statTotalProjects: Locator
  readonly statQueued: Locator
  readonly statCompleted: Locator
  readonly statSuccessRate: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)
    this.searchInput = page.getByPlaceholder(/Szukaj|Search/i).last()
    this.newProjectBtn = page.getByRole('link', { name: /Nowy projekt|New Project/i }).last()
    this.projectsTable = page.locator('table')
    this.projectRows = page.locator('tbody tr:not(:has(td[colspan="6"]))')
    this.statTotalProjects = page.locator('span.text-slate-500').filter({ hasText: /Łącznie|Total/i })
    this.statQueued = page.getByText(/Oczekuje|Queued/i).first()
    this.statCompleted = page.getByText(/Ukończone|Completed/i).first()
    this.statSuccessRate = page.getByText(/Trafność|Success rate/i)
    this.emptyState = page.getByText(/Brak projektów|No projects found/i)
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(300) // debounce
  }

  async clickFirstProject() {
    await this.projectRows.first().click()
  }

  async getProjectRowByName(name: string) {
    return this.page.locator('tbody tr').filter({ hasText: name }).first()
  }

  async getStatusBadge(sessionId: string) {
    const row = await this.getProjectRowByName(sessionId)
    return row.locator('[data-status], .badge, span').first()
  }
}
