import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class NewDiscoveryPage extends BasePage {
  readonly projectNameInput: Locator
  readonly ideaTextarea: Locator
  readonly modeAuto: Locator
  readonly modeProblem: Locator
  readonly modeSolution: Locator
  readonly notesTextarea: Locator
  readonly fileUpload: Locator
  readonly submitBtn: Locator
  readonly cancelBtn: Locator

  constructor(page: Page) {
    super(page)
    this.projectNameInput = page.getByLabel(/Nazwa projektu|Project Name/i)
    this.ideaTextarea = page.getByLabel(/Opis pomysłu|Idea Description/i)
    this.modeAuto = page.getByRole('radio', { name: /^auto/i })
    this.modeProblem = page.getByRole('radio', { name: /^problem/i })
    this.modeSolution = page.getByRole('radio', { name: /^solution/i })
    this.notesTextarea = page.getByLabel(/Notatki z wywiadów|Interview Notes/i)
    this.fileUpload = page.locator('input[type="file"]')
    this.submitBtn = page.getByRole('button', { name: /Uruchom Discovery|Launch Discovery/i })
    this.cancelBtn = page.getByRole('button', { name: /Anuluj|Cancel/i })
  }

  async goto() {
    await this.page.goto('/discovery/new')
    await this.page.waitForLoadState('networkidle')
  }

  async fillForm(opts: {
    projectName: string
    idea: string
    mode?: 'auto' | 'problem' | 'solution'
    notes?: string
  }) {
    await this.projectNameInput.fill(opts.projectName)
    await this.ideaTextarea.fill(opts.idea)

    if (opts.mode === 'problem') await this.modeProblem.check()
    if (opts.mode === 'solution') await this.modeSolution.check()
    // 'auto' jest domyślnie zaznaczony

    if (opts.notes) await this.notesTextarea.fill(opts.notes)
  }

  async submit() {
    await this.submitBtn.click()
    // Poczekaj na redirect do /discovery/:id (inne niż new)
    await this.page.waitForURL(/\/discovery\/(?!new).+/, { timeout: 10_000 })
    const url = this.page.url()
    const match = url.match(/\/discovery\/([^/]+)/)
    return match?.[1] ?? null   // Zwraca sessionId
  }
}
