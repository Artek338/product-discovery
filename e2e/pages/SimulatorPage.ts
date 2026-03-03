import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class SimulatorPage extends BasePage {
  // Step 1 — Segment
  readonly segmentInput: Locator
  readonly generateBtn: Locator
  readonly step1Header: Locator

  // Step 2 — Archetypes
  readonly archetypeCards: Locator
  readonly step2Header: Locator
  readonly changeSegmentBtn: Locator

  // Step 3 — Chat
  readonly chatInput: Locator
  readonly sendBtn: Locator
  readonly chatMessages: Locator
  readonly backToPersonasBtn: Locator
  readonly qualityBadge: Locator
  readonly hiddenThoughtSection: Locator
  readonly followUpSection: Locator
  readonly useFollowUpBtn: Locator

  constructor(page: Page) {
    super(page)

    // Step 1
    this.segmentInput = page.getByPlaceholder(/np\. |e\.g\./i)
    this.generateBtn = page.getByRole('button', { name: /Generuj|Generate/i })
    this.step1Header = page.getByText(/Opisz docelowy|Describe Target/i)

    // Step 2
    this.archetypeCards = page.locator('[data-testid="archetype-card"], [class*="archetype"]')
    this.step2Header = page.getByText(/Wybierz personę|Select Persona/i)
    this.changeSegmentBtn = page.getByRole('button', { name: /Zmień segment|Change Segment/i })

    // Step 3
    this.chatInput = page.getByPlaceholder(/Zadaj pytanie|Ask a question/i)
    this.sendBtn = page.locator('[data-testid="send-message-btn"]')
    this.chatMessages = page.locator('[data-testid="chat-message"]')
    this.backToPersonasBtn = page.getByRole('button', { name: /Powrót do person|Back to Personas/i })
    this.qualityBadge = page.locator('[data-testid="quality-badge"], [class*="quality"]').first()
    this.hiddenThoughtSection = page.getByText(/Ukryta myśl|Hidden thought/i)
    this.followUpSection = page.getByText(/Follow-up/i)
    this.useFollowUpBtn = page.getByRole('button', { name: /Użyj tego pytania|Use this question/i })
  }

  async goto() {
    await this.page.goto('/simulate')
    await this.page.waitForLoadState('networkidle')
  }

  async enterSegment(segment: string) {
    await this.segmentInput.fill(segment)
  }

  async generateArchetypes(segment: string) {
    await this.enterSegment(segment)
    await this.generateBtn.click()
    // Czeka na załadowanie archetypów (call API ~30s, z mock ~5s)
    await this.page.waitForSelector('[data-testid="archetype-card"], [class*="archetype"]', {
      timeout: 60_000,
    })
  }

  async selectArchetype(index = 0) {
    const cards = this.archetypeCards
    await cards.nth(index).click()
    // Poczekaj na pojawienie się chat inputa
    await this.chatInput.waitFor({ timeout: 5000 })
  }

  async sendQuestion(question: string) {
    await this.chatInput.fill(question)
    await this.sendBtn.click()
    // Czekaj na odpowiedź
    await this.page.waitForTimeout(500)
  }
}
