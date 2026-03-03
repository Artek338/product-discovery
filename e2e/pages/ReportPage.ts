import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class ReportPage extends BasePage {
  // Progress
  readonly progressTracker: Locator
  readonly progressBar: Locator
  readonly currentNodeLabel: Locator
  readonly logsList: Locator

  // Header raportu
  readonly projectTitle: Locator
  readonly verdictBadge: Locator
  readonly backToDashboard: Locator

  // Przyciski eksportu
  readonly exportPdfLink: Locator
  readonly exportMiroBtn: Locator
  readonly exportSlackBtn: Locator
  readonly exportGDocsBtn: Locator

  // Sekcje raportu
  readonly jtbdSection: Locator
  readonly forcesSection: Locator
  readonly assumptionSection: Locator
  readonly archetypeSection: Locator
  readonly competitiveSection: Locator

  // Stat cards
  readonly confidenceCard: Locator
  readonly durationCard: Locator
  readonly deltCard: Locator

  // Miro modal
  readonly miroModal: Locator
  readonly miroDryRunToggle: Locator
  readonly miroExportBtn: Locator
  readonly miroCloseBtn: Locator

  // Błąd / failed
  readonly failedBanner: Locator

  constructor(page: Page) {
    super(page)

    this.progressTracker = page.locator('[data-testid="progress-tracker"], .progress-tracker').first()
    this.progressBar = page.locator('[role="progressbar"], [class*="progress"]').first()
    this.currentNodeLabel = page.locator('[data-testid="current-node"]').first()
    this.logsList = page.locator('[data-testid="logs-list"]').first()

    this.projectTitle = page.locator('h1').first()
    this.verdictBadge = page.locator('[data-testid="verdict-badge"], [class*="verdict"]').first()
    this.backToDashboard = page.getByRole('link', { name: /Back to Dashboard|Powrót/i })

    this.exportPdfLink = page.getByRole('link', { name: /PDF/i })
    this.exportMiroBtn = page.getByRole('button', { name: /Miro/i })
    this.exportSlackBtn = page.getByRole('button', { name: /Slack/i })
    this.exportGDocsBtn = page.getByRole('button', { name: /Google Docs/i })

    this.jtbdSection = page.getByText(/Jobs-to-be-Done/i).first()
    this.forcesSection = page.getByText(/Forces/i).first()
    this.assumptionSection = page.getByText(/Assumption/i).first()
    this.archetypeSection = page.getByText(/Archetype|Archetyp/i).first()
    this.competitiveSection = page.getByText(/Competitive/i).first()

    this.confidenceCard = page.getByText(/Confidence level/i)
    this.durationCard = page.getByText(/Analysis duration/i)
    this.deltCard = page.getByText(/Confidence delta/i)

    this.miroModal = page.locator('[role="dialog"], [data-testid="miro-modal"]').first()
    this.miroDryRunToggle = page.getByLabel(/dry.?run|Tryb testowy/i)
    this.miroExportBtn = page.getByRole('button', { name: /Export|Eksportuj|Testuj/i }).last()
    this.miroCloseBtn = page.getByRole('button', { name: /Close|Zamknij/i })

    this.failedBanner = page.getByText(/Discovery Failed/i)
  }

  async goto(sessionId: string) {
    await this.page.goto(`/discovery/${sessionId}`)
    await this.page.waitForLoadState('networkidle')
  }

  /** Czeka aż discovery zakończy się (max 60s dla mock) */
  async waitForCompletion(timeoutMs = 60_000) {
    await this.page.waitForFunction(
      () => !document.querySelector('[class*="animate-spin"]'),
      { timeout: timeoutMs },
    )
    await this.page.waitForSelector('h1', { timeout: timeoutMs })
  }

  /** Czeka aż konkretny węzeł pojawi się w logach */
  async waitForNode(nodeName: string, timeoutMs = 30_000) {
    await this.page.waitForFunction(
      (name: string) => document.body.innerText.includes(name),
      nodeName,
      { timeout: timeoutMs },
    )
  }
}
