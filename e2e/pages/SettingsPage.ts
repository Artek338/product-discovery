import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class SettingsPage extends BasePage {
  // Język
  readonly plBtn: Locator
  readonly enBtn: Locator

  // Folder danych
  readonly dataDirInput: Locator

  // API keys
  readonly anthropicKeyInput: Locator
  readonly anthropicKeyToggle: Locator
  readonly perplexityKeyInput: Locator
  readonly serperKeyInput: Locator
  readonly braveKeyInput: Locator

  // Model
  readonly modelSelect: Locator

  // Miro
  readonly miroTokenInput: Locator
  readonly miroBoardInput: Locator

  // Slack
  readonly slackUrlInput: Locator
  readonly slackAutoToggle: Locator

  // Google
  readonly googleClientIdInput: Locator
  readonly googleClientSecretInput: Locator
  readonly googleLoginBtn: Locator
  readonly googleLogoutBtn: Locator
  readonly googleConnectedLabel: Locator

  // Mock
  readonly mockToggle: Locator

  // Zapis
  readonly saveBtn: Locator
  readonly savedConfirmation: Locator

  // Status badges
  readonly slackStatusBadge: Locator
  readonly miroStatusBadge: Locator
  readonly googleStatusBadge: Locator

  constructor(page: Page) {
    super(page)

    this.plBtn = page.getByRole('button', { name: /Polski/i })
    this.enBtn = page.getByRole('button', { name: /English/i })

    this.dataDirInput = page.getByLabel(/Ścieżka do folderu|Folder path/i)

    // API key fields — selektor po labelu lub placeholder
    this.anthropicKeyInput   = page.getByLabel(/Klucz API Anthropic|Anthropic API Key/i)
    this.anthropicKeyToggle  = this.anthropicKeyInput.locator('..').locator('button')
    this.perplexityKeyInput  = page.getByLabel(/Perplexity/i)
    this.serperKeyInput      = page.getByLabel(/Serper/i)
    this.braveKeyInput       = page.getByLabel(/Brave/i)

    this.modelSelect = page.getByLabel(/Model LLM|LLM Model/i)

    this.miroTokenInput  = page.getByLabel(/Access Token/i)
    this.miroBoardInput  = page.getByLabel(/Board ID/i)

    this.slackUrlInput    = page.getByLabel(/Webhook URL/i)
    this.slackAutoToggle  = page.getByLabel(/Auto-powiadomienie|Auto-notify/i)

    this.googleClientIdInput     = page.getByLabel(/Google Client ID/i)
    this.googleClientSecretInput = page.getByLabel(/Google Client Secret/i)
    this.googleLoginBtn          = page.getByRole('button', { name: /Zaloguj się z Google|Sign in with Google/i })
    this.googleLogoutBtn         = page.getByRole('button', { name: /Wyloguj z Google|Sign out from Google/i })
    this.googleConnectedLabel    = page.getByText(/Połączono|Connected/i)

    this.mockToggle = page.getByLabel(/Włącz Mock Mode|Enable Mock Mode/i)

    this.saveBtn           = page.getByRole('button', { name: /Zapisz ustawienia|Save Settings/i })
    this.savedConfirmation = page.getByText(/Zapisano|Saved/i)

    this.slackStatusBadge  = page.locator('[class*="badge"]').filter({ hasText: /slack/i }).first()
    this.miroStatusBadge   = page.locator('[class*="badge"]').filter({ hasText: /miro/i }).first()
    this.googleStatusBadge = page.locator('[class*="badge"]').filter({ hasText: /google/i }).first()
  }

  async goto() {
    await this.page.goto('/settings')
    await this.page.waitForLoadState('networkidle')
  }

  async setLanguage(lang: 'pl' | 'en') {
    const btn = lang === 'pl' ? this.plBtn : this.enBtn
    await btn.click()
  }

  async fillApiKey(field: Locator, key: string) {
    await field.fill(key)
  }

  async save() {
    await this.saveBtn.click()
    await this.savedConfirmation.waitFor({ timeout: 5000 })
  }

  async toggleMockMode(on: boolean) {
    const checked = await this.mockToggle.isChecked()
    if (checked !== on) await this.mockToggle.click()
  }
}
