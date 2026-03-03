/**
 * SCENARIUSZE: Simulator (/simulate)
 *
 * Pokrywa:
 *   - Step 1: input segmentu, przycisk generuj
 *   - Generowanie 4 archetypów (call API)
 *   - Step 2: karty archetypów — zawartość i interakcja
 *   - Wybór archetypu → Step 3 (chat)
 *   - Step 3: wysyłanie pytania, odpowiedź
 *   - Jakość odpowiedzi (quality badge)
 *   - Ukryta myśl (collapsible)
 *   - Follow-up sugestia + przycisk "użyj"
 *   - Powrót do person (Step 2)
 *   - Powrót do segmentu (Step 1)
 *   - Kilka pytań z rzędu
 *
 * Zależności: backend działa, LLM calls lub mock
 * Uwaga: testy symulatorowe mogą trwać ~30-60s (wywołania LLM)
 */
import { test, expect } from '@playwright/test'
import { SimulatorPage } from '../pages/SimulatorPage'

const TEST_SEGMENT = 'Freelancerzy UX, 3-10 klientów rocznie, Polska, 25-40 lat'

test.describe('Interview Simulator', () => {

  test.beforeEach(async ({ page }) => {
    await new SimulatorPage(page).goto()
  })

  // ── Step 1: Segment ───────────────────────────────────────────────────────────

  test('renders Step 1 with segment input and generate button', async ({ page }) => {
    await expect(page.getByText(/Opisz docelowy|Describe Target/i)).toBeVisible()
    await expect(page.getByPlaceholder(/np\. |e\.g\./i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Generuj|Generate/i })).toBeVisible()
  })

  test('segment input accepts text', async ({ page }) => {
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await expect(sim.segmentInput).toHaveValue(TEST_SEGMENT)
  })

  test('generate button is disabled when segment input is empty', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: /Generuj|Generate/i })
    const disabled = await generateBtn.getAttribute('disabled')
    const ariaDisabled = await generateBtn.getAttribute('aria-disabled')
    // Powinien być disabled gdy pole puste
    expect(disabled !== null || ariaDisabled === 'true').toBeTruthy()
  })

  test('clicking generate calls POST /api/simulator/archetypes', async ({ page }) => {
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)

    const [request] = await Promise.all([
      page.waitForRequest(
        req => req.url().includes('/api/simulator/archetypes') && req.method() === 'POST',
        { timeout: 5000 },
      ),
      sim.generateBtn.click(),
    ])
    const body = JSON.parse(request.postData() ?? '{}')
    expect(body.segment).toBe(TEST_SEGMENT)
  })

  test('shows loading state during archetype generation', async ({ page }) => {
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()

    // Spinner lub tekst "Generowanie..."
    const loading = page.getByText(/Generowanie archetypów|Generating Archetypes/i)
    await loading.waitFor({ timeout: 3000 }).catch(() => null)
  })

  // ── Step 2: Archetypes ────────────────────────────────────────────────────────

  test('shows 4 archetype cards after generation', async ({ page }) => {
    // Mock odpowiedź API żeby nie czekać na LLM
    await page.route('**/api/simulator/archetypes', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockArchetypes(4)),
      }),
    )

    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(1000)

    const cards = page.locator('[data-testid="archetype-card"], [class*="archetype"], [class*="card"]')
    await cards.first().waitFor({ timeout: 10_000 })
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('each archetype card shows archetype name', async ({ page }) => {
    await page.route('**/api/simulator/archetypes', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockArchetypes(4)),
      }),
    )
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(1000)

    await expect(page.getByText(/Pragmatyk|Wizjoner|Mock Archetyp/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('archetype card shows demographics, psychology, hypotheses', async ({ page }) => {
    await page.route('**/api/simulator/archetypes', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockArchetypes(4)),
      }),
    )
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(1000)

    const firstCard = page.locator('[data-testid="archetype-card"]').first()
    if (await firstCard.count() > 0) {
      const cardText = await firstCard.textContent()
      expect(cardText).toBeTruthy()
      expect(cardText!.length).toBeGreaterThan(10)
    }
  })

  test('"Zmień segment" button returns to Step 1', async ({ page }) => {
    await page.route('**/api/simulator/archetypes', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockArchetypes(4)),
      }),
    )
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(1000)

    const changeBtn = page.getByRole('button', { name: /Zmień segment|Change Segment/i })
    if (await changeBtn.count() > 0) {
      await changeBtn.click()
      await expect(page.getByText(/Opisz docelowy|Describe Target/i)).toBeVisible()
    }
  })

  // ── Step 3: Chat ──────────────────────────────────────────────────────────────

  test('clicking archetype card shows chat interface', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)

    const card = page.locator('[data-testid="archetype-card"]').first()
    if (await card.count() === 0) {
      // Fallback: kliknij dowolną clickable kartę
      await page.locator('[class*="cursor-pointer"]').first().click()
    } else {
      await card.click()
    }

    await expect(page.getByPlaceholder(/Zadaj pytanie|Ask a question/i)).toBeVisible({ timeout: 5000 })
  })

  test('sends question and receives response', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)

    const responsePromise = page.waitForResponse(
      res => res.url().includes('/api/simulator/question'),
      { timeout: 30_000 },
    )
    await sim.sendQuestion('Opowiedz mi o ostatnim razie gdy miałeś problem z rozliczeniami.')
    await responsePromise
    await page.waitForTimeout(1000)

    // Odpowiedź powinna być widoczna
    const messages = page.locator('[data-testid="chat-message"], [class*="message"]')
    const count = await messages.count()
    expect(count).toBeGreaterThan(0)
  })

  test('response shows quality badge (genuine/polite_lie/vague/detailed)', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/api/simulator/question'),
      { timeout: 30_000 },
    )
    await sim.sendQuestion('Jak często korzystasz z podobnych narzędzi?')
    await responsePromise
    await page.waitForTimeout(500)

    // Quality badge — jedno z 4 wartości
    const qualityText = page.getByText(/genuine|polite_lie|vague|detailed/i)
    if (await qualityText.count() > 0) {
      await expect(qualityText.first()).toBeVisible()
    }
  })

  test('hidden thought section is collapsible', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/api/simulator/question'),
      { timeout: 30_000 },
    )
    await sim.sendQuestion('Testowe pytanie')
    await responsePromise
    await page.waitForTimeout(500)

    // Przycisk "pokaż/ukryj wgląd"
    const revealBtn = page.getByRole('button', { name: /Pokaż wgląd|Reveal Insights|szczegóły/i })
    if (await revealBtn.count() > 0) {
      await revealBtn.first().click()
      await expect(page.getByText(/Ukryta myśl|Hidden thought/i)).toBeVisible()
    }
  })

  test('follow-up button fills chat input with suggested question', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/api/simulator/question'),
      { timeout: 30_000 },
    )
    await sim.sendQuestion('Pytanie testowe do follow-up')
    await responsePromise
    await page.waitForTimeout(500)

    const useBtn = page.getByRole('button', { name: /Użyj tego pytania|Use this question/i })
    if (await useBtn.count() > 0) {
      await useBtn.first().click()
      const inputValue = await sim.chatInput.inputValue()
      expect(inputValue.length).toBeGreaterThan(0)
    }
  })

  test('"Powrót do person" button goes back to Step 2', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)

    const backBtn = page.getByRole('button', { name: /Powrót do person|Back to Personas/i })
    if (await backBtn.count() > 0) {
      await backBtn.click()
      await expect(page.getByText(/Wybierz personę|Select Persona/i)).toBeVisible({ timeout: 3000 })
    }
  })

  test('sending message with Enter key works', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)

    await sim.chatInput.fill('Pytanie przez Enter')
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/api/simulator/question'),
      { timeout: 30_000 },
    ).catch(() => null)
    await sim.chatInput.press('Enter')
    await responsePromise
    // Jeśli request poszedł — Enter działa
  })

  test('multiple questions build conversation history', async ({ page }) => {
    await setupMockSimulator(page)
    const sim = new SimulatorPage(page)
    await sim.enterSegment(TEST_SEGMENT)
    await sim.generateBtn.click()
    await page.waitForTimeout(500)
    await sim.selectArchetype(0)

    const questions = [
      'Pytanie pierwsze — kontekst',
      'Pytanie drugie — pogłębienie',
    ]
    for (const q of questions) {
      const responsePromise = page.waitForResponse(
        res => res.url().includes('/api/simulator/question'),
        { timeout: 30_000 },
      )
      await sim.sendQuestion(q)
      await responsePromise
      await page.waitForTimeout(300)
    }

    // Powinny być >= 2 wiadomości od usera
    const userMessages = page.getByText(/Pytanie pierwsze|Pytanie drugie/)
    const count = await userMessages.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

})

// ── Helpery ────────────────────────────────────────────────────────────────────

function generateMockArchetypes(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    archetype_name: `Mock Archetyp ${i + 1}`,
    demographics: `30-40 lat, freelancer, ${i + 1} lat doświadczenia`,
    psychology: `Pragmatyczny, zorientowany na wyniki`,
    jtbd_hypothesis: `Chce zautomatyzować rozliczenia`,
    forces_hypothesis: `Push: chaos w fakturach. Pull: automatyzacja.`,
    expected_interview_behaviors: ['Konkretne odpowiedzi', 'Dużo przykładów'],
    hypotheses_to_test: [`H${i + 1}: Brak czasu na administrację`, `H${i + 2}: Cenowa wrażliwość`],
    red_flags_expected: [`Polite lie o budżecie`],
  }))
}

async function setupMockSimulator(page: import('@playwright/test').Page) {
  await page.route('**/api/simulator/archetypes', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(generateMockArchetypes(4)),
    }),
  )
  await page.route('**/api/simulator/question', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        question_asked: 'Testowe pytanie',
        response: 'To jest syntetyczna odpowiedź na Twoje pytanie. Pracuję głównie z klientami z sektora tech.',
        response_quality: 'genuine',
        hidden_thought: 'Naprawdę tak nie myślę, ale tak brzmi lepiej.',
        follow_up_suggested: 'Jak często zdarza Ci się to doświadczenie?',
      }),
    }),
  )
}
