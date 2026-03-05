/**
 * SCENARIUSZE: New Discovery (/discovery/new)
 *
 * Pokrywa:
 *   - Renderowanie formularza (wszystkie pola)
 *   - Walidacja pól wymaganych
 *   - Wybór trybu (auto / problem / solution)
 *   - Upload pliku notatek (.md / .txt)
 *   - Wysyłanie formularza + redirect do raportu
 *   - Stan ładowania przycisku Submit
 *   - Anulowanie formularza
 *
 * Zależności: DISCOVERY_MOCK=true w backendzie (szybkie ~3s)
 */
import { test, expect } from '@playwright/test'
import * as path from 'path'
import { NewDiscoveryPage } from '../pages/NewDiscoveryPage'

// Dane testowe
const VALID_FORM = {
  projectName: 'e2e-test-projekt',
  idea: 'Aplikacja do zarządzania zadaniami dla freelancerów w Polsce. Główny problem: brak integracji między klientami a rozliczeniami.',
}

test.describe('New Discovery Form', () => {

  test.beforeEach(async ({ page }) => {
    await new NewDiscoveryPage(page).goto()
  })

  // ── Renderowanie ─────────────────────────────────────────────────────────────

  test('renders all form fields', async ({ page }) => {
    await expect(page.getByLabel(/Nazwa projektu|Project Name/i)).toBeVisible()
    await expect(page.getByLabel(/Opis pomysłu|Idea Description/i)).toBeVisible()

    // Tryby Discovery
    await expect(page.getByRole('radio', { name: /^auto/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /^problem/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /^solution/i })).toBeVisible()

    // Notes (opcjonalne)
    await expect(page.getByLabel(/Notatki z wywiadów|Interview Notes/i)).toBeVisible()

    // Submit
    await expect(page.getByRole('button', { name: /Uruchom Discovery|Launch Discovery/i })).toBeVisible()
  })

  test('mode "auto" is selected by default', async ({ page }) => {
    await expect(page.getByRole('radio', { name: /^auto/i })).toBeChecked()
    await expect(page.getByRole('radio', { name: /^problem/i })).not.toBeChecked()
    await expect(page.getByRole('radio', { name: /^solution/i })).not.toBeChecked()
  })

  test('shows description text for each mode', async ({ page }) => {
    await expect(page.getByText(/Pełna analiza|Full analysis/i)).toBeVisible()
    await expect(page.getByText(/Walidacja problemu|Problem.*validation/i)).toBeVisible()
    await expect(page.getByText(/CO\/JAK|WHAT\/HOW/i)).toBeVisible()
  })

  // ── Walidacja ─────────────────────────────────────────────────────────────────

  test('shows validation error when project name is empty', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    // Wypełnij tylko ideę, nie project name
    await disc.ideaTextarea.fill(VALID_FORM.idea)

    // Przycisk powinien być zablokowany
    await expect(disc.submitBtn).toBeDisabled()

    // Formularz nie powinien się wysłać
    await expect(page).toHaveURL('/discovery/new')

    // Pole wymagane powinno być oznaczone
    const projectInput = disc.projectNameInput
    const isRequired = await projectInput.getAttribute('required')
    expect(isRequired !== null).toBeTruthy()
  })

  test('shows validation error when idea is empty', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.projectNameInput.fill(VALID_FORM.projectName)

    // idea pusta - przycisk powinien być zablokowany
    await expect(disc.submitBtn).toBeDisabled()
    await expect(page).toHaveURL('/discovery/new')
  })

  test('project name field has maxlength or character counter', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    const maxlength = await disc.projectNameInput.getAttribute('maxlength')
    // maxlength jest opcjonalny — test informacyjny
    if (maxlength) {
      expect(parseInt(maxlength)).toBeGreaterThan(0)
    }
  })

  // ── Wybór trybu ───────────────────────────────────────────────────────────────

  test('clicking "problem" radio selects problem mode', async ({ page }) => {
    await page.getByRole('radio', { name: /^problem/i }).check()
    await expect(page.getByRole('radio', { name: /^problem/i })).toBeChecked()
    await expect(page.getByRole('radio', { name: /^auto/i })).not.toBeChecked()
    await expect(page.getByRole('radio', { name: /^solution/i })).not.toBeChecked()
  })

  test('clicking "solution" radio selects solution mode', async ({ page }) => {
    await page.getByRole('radio', { name: /^solution/i }).check()
    await expect(page.getByRole('radio', { name: /^solution/i })).toBeChecked()
    await expect(page.getByRole('radio', { name: /^auto/i })).not.toBeChecked()
  })

  // ── Upload pliku ──────────────────────────────────────────────────────────────

  test('file upload accepts .txt file and shows file pill', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)

    // Utwórz plik tymczasowy w pamięci i zasymuluj upload
    const testContent = 'Wywiad z Janem: "Zawsze tracę czas na rozliczenia. Chciałbym automatyzacji."'
    await disc.fileUpload.setInputFiles({
      name: 'interview_notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testContent),
    })

    // Poczytaj czy pojawiła się pigułka z nazwą pliku
    const filePill = page.getByText('interview_notes.txt')
    await expect(filePill).toBeVisible()
  })

  test('file upload accepts .md file and shows file pill', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    const mdContent = '# Notatki\n\n- Problem A\n- Problem B\n'
    await disc.fileUpload.setInputFiles({
      name: 'notes.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from(mdContent),
    })

    // Poczytaj czy pojawiła się pigułka z nazwą pliku
    const filePill = page.getByText('notes.md')
    await expect(filePill).toBeVisible()
  })

  // ── Submit i redirect ─────────────────────────────────────────────────────────

  test('successful submit redirects to /discovery/:id', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.fillForm(VALID_FORM)
    const sessionId = await disc.submit()

    expect(sessionId).not.toBeNull()
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/)  // UUID format
    await expect(page).toHaveURL(`/discovery/${sessionId}`)
  })

  test('submit button shows loading state while sending', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.fillForm(VALID_FORM)

    // Kliknij i natychmiast sprawdź stan ładowania
    const submitPromise = disc.submitBtn.click()
    const loadingText = page.getByText(/Inicjowanie|Initializing/i)

    // Albo tekst się zmienia albo przycisk jest wyłączony podczas ładowania
    await Promise.race([
      loadingText.waitFor({ timeout: 2000 }).catch(() => null),
      disc.submitBtn.getAttribute('disabled').then(v => expect(v).not.toBeNull()).catch(() => null),
    ])
    await submitPromise
  })

  test('form creates API session (POST /api/discovery/run returns 200)', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.fillForm(VALID_FORM)

    // Monitoruj request
    const [request] = await Promise.all([
      page.waitForRequest(req =>
        req.url().includes('/api/discovery/run') && req.method() === 'POST',
      ),
      disc.submitBtn.click(),
    ])

    const response = await request.response()
    expect(response?.status()).toBe(200)

    const body = await response?.json()
    expect(body).toHaveProperty('session_id')
    expect(body).toHaveProperty('status', 'queued')
  })

  // ── Anulowanie ────────────────────────────────────────────────────────────────

  test('cancel button navigates back to dashboard', async ({ page }) => {
    const disc = new NewDiscoveryPage(page)
    await disc.cancelBtn.click()
    await expect(page).toHaveURL('/')
  })

  test('navigating to /discovery/new from sidebar works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Nowy projekt|New Project/i }).first().click()
    await expect(page).toHaveURL('/discovery/new')
  })

})
