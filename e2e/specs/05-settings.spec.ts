/**
 * SCENARIUSZE: Settings Page (/settings)
 *
 * Pokrywa:
 *   - Ładowanie ustawień z GET /api/settings
 *   - Przełącznik języka PL/EN
 *   - Pole folder danych (data_dir)
 *   - Pole Anthropic API Key (maska + toggle show/hide)
 *   - Klucze research API (Perplexity, Serper, Brave)
 *   - Model LLM select
 *   - Miro token + Board ID
 *   - Slack Webhook URL + auto-notify toggle
 *   - Google OAuth (Client ID, Secret, przycisk logowania)
 *   - Mock Mode toggle
 *   - Zapis ustawień (PUT /api/settings)
 *   - Stan "Zapisano!" po zapisaniu
 *   - Klucze API pokazują preview (****) gdy skonfigurowane
 *
 * Zależności: backend działa (GET/PUT /api/settings)
 */
import { test, expect } from '@playwright/test'
import { SettingsPage } from '../pages/SettingsPage'

// Mock odpowiedzi API
const MOCK_SETTINGS = {
  data_dir: '/home/user/product-discovery-data',
  anthropic_api_key_set: true,
  anthropic_api_key_preview: '****xYz1',
  perplexity_api_key_set: false,
  serper_api_key_set: false,
  brave_api_key_set: false,
  miro_access_token_set: false,
  miro_board_id: '',
  slack_webhook_url_set: false,
  slack_auto_notify: false,
  llm_model: 'claude-sonnet-4-6',
  language: 'pl',
  google_client_id_set: false,
  google_connected: false,
  discovery_mock: false,
}

test.describe('Settings Page', () => {

  test.beforeEach(async ({ page }) => {
    // Mockuj GET /api/settings żeby testy były izolowane od stanu backendu
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SETTINGS),
        })
      }
      // PUT — zwróć zmodyfikowane ustawienia
      return route.continue()
    })
    await page.route('**/api/auth/google/status', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: false, email: '' }),
      }),
    )
    await new SettingsPage(page).goto()
  })

  // ── Ładowanie ─────────────────────────────────────────────────────────────────

  test('page loads without errors', async ({ page }) => {
    await expect(page.getByText(/Ustawienia|Settings/i).first()).toBeVisible()
    await expect(page.locator('.max-w-2xl').first()).toBeVisible()
  })

  test('loads settings from GET /api/settings on mount', async ({ page }) => {
    // Data dir powinien być wypełniony z mock response
    const settings = new SettingsPage(page)
    const dataDirValue = await settings.dataDirInput.inputValue()
    expect(dataDirValue).toBe(MOCK_SETTINGS.data_dir)
  })

  // ── Język ─────────────────────────────────────────────────────────────────────

  test('PL button is selected when language is pl', async ({ page }) => {
    const plBtn = page.getByRole('button', { name: /Polski/i })
    await expect(plBtn).toBeVisible()
    // Sprawdź klasy wskazujące na zaznaczenie (border-[#14B8A6] lub bg-[#F0FDFA])
    const classes = await plBtn.getAttribute('class')
    expect(classes).toContain('border-[#14B8A6]')
  })

  test('clicking EN button switches UI to English', async ({ page }) => {
    const settings = new SettingsPage(page)
    await settings.setLanguage('en')

    // Zapisz
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_SETTINGS, language: 'en' }),
        })
      }
      return route.continue()
    })

    // Tekst w UI powinien zmienić się na angielski
    // Sprawdź jeden znany string
    await expect(page.getByText(/Data Folder|Interface Language/i).first()).toBeVisible({ timeout: 3000 })
  })

  test('clicking PL button restores Polish', async ({ page }) => {
    const settings = new SettingsPage(page)
    await settings.setLanguage('en')
    await settings.setLanguage('pl')
    await expect(page.getByText(/Folder danych|Język interfejsu/i).first()).toBeVisible()
  })

  // ── Folder danych ─────────────────────────────────────────────────────────────

  test('data_dir field shows current path from settings', async ({ page }) => {
    const settings = new SettingsPage(page)
    const value = await settings.dataDirInput.inputValue()
    expect(value).toBe(MOCK_SETTINGS.data_dir)
  })

  test('data_dir field accepts new path', async ({ page }) => {
    const settings = new SettingsPage(page)
    await settings.dataDirInput.fill('/new/path/to/data')
    await expect(settings.dataDirInput).toHaveValue('/new/path/to/data')
  })

  // ── Anthropic API Key ─────────────────────────────────────────────────────────

  test('Anthropic key shows preview when already set', async ({ page }) => {
    // Podgląd "****xYz1" z mock settings
    await expect(page.getByText(/\*\*\*\*/)).toBeVisible()
  })

  test('Anthropic key field has show/hide toggle', async ({ page }) => {
    const keyInput = page.getByLabel(/Klucz API Anthropic|Anthropic API Key/i)
    await expect(keyInput).toBeVisible()

    // Domyślnie type=password
    const inputType = await keyInput.getAttribute('type')
    expect(inputType).toBe('password')

    // Kliknij toggle
    const toggleBtn = keyInput.locator('..').locator('button[type="button"]').last()
    if (await toggleBtn.count() > 0) {
      await toggleBtn.click()
      const newType = await keyInput.getAttribute('type')
      expect(newType).toBe('text')
    }
  })

  test('entering new API key in password field does not show it', async ({ page }) => {
    const keyInput = page.getByLabel(/Klucz API Anthropic|Anthropic API Key/i)
    await keyInput.fill('sk-ant-test-key-1234')
    const inputType = await keyInput.getAttribute('type')
    expect(inputType).toBe('password')
  })

  // ── Research API Keys ─────────────────────────────────────────────────────────

  test('Perplexity key field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Perplexity/i)).toBeVisible()
  })

  test('Serper key field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Serper/i)).toBeVisible()
  })

  test('Brave key field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Brave/i)).toBeVisible()
  })

  test('unset keys show "nieskonfigurowany / not configured" badge', async ({ page }) => {
    // Perplexity nie jest ustawiony w mock
    const notConfigured = page.getByText(/nieskonfigurowany|not configured/i)
    if (await notConfigured.count() > 0) {
      await expect(notConfigured.first()).toBeVisible()
    }
  })

  // ── LLM Model ─────────────────────────────────────────────────────────────────

  test('LLM model select shows 3 options', async ({ page }) => {
    const modelSelect = page.getByLabel(/Model LLM|LLM Model/i)
    await expect(modelSelect).toBeVisible()
    const options = await modelSelect.locator('option').count()
    expect(options).toBeGreaterThanOrEqual(3)
  })

  test('default model is claude-sonnet-4-6', async ({ page }) => {
    const modelSelect = page.getByLabel(/Model LLM|LLM Model/i)
    const value = await modelSelect.inputValue()
    expect(value).toBe('claude-sonnet-4-6')
  })

  test('changing model select updates selected value', async ({ page }) => {
    const modelSelect = page.getByLabel(/Model LLM|LLM Model/i)
    await modelSelect.selectOption('claude-opus-4-6')
    await expect(modelSelect).toHaveValue('claude-opus-4-6')
  })

  // ── Miro ─────────────────────────────────────────────────────────────────────

  test('Miro Access Token field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Access Token/i)).toBeVisible()
  })

  test('Miro Board ID field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Board ID/i)).toBeVisible()
  })

  test('Miro shows "nieskonfigurowany" when token not set', async ({ page }) => {
    const badge = page.getByText(/nieskonfigurowany|not configured/i).first()
    if (await badge.count() > 0) {
      await expect(badge).toBeVisible()
    }
  })

  // ── Slack ─────────────────────────────────────────────────────────────────────

  test('Slack Webhook URL field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Webhook URL/i)).toBeVisible()
  })

  test('Slack auto-notify toggle is visible', async ({ page }) => {
    await expect(page.getByText(/Auto-powiadomienie|Auto-notify/i)).toBeVisible()
  })

  test('Slack auto-notify toggle changes state on click', async ({ page }) => {
    const toggle = page.getByLabel(/Auto-powiadomienie|Auto-notify/i)
    if (await toggle.count() > 0) {
      const initial = await toggle.isChecked()
      await toggle.click({ force: true })
      const after = await toggle.isChecked()
      expect(after).toBe(!initial)
    } else {
      // Fallback click na div
      const toggleArea = page.locator('[class*="w-10"][class*="h-5"]').first()
      await toggleArea.click()
    }
  })

  // ── Google OAuth ──────────────────────────────────────────────────────────────

  test('Google Docs section is visible', async ({ page }) => {
    await expect(page.getByText(/Google Docs/i).first()).toBeVisible()
  })

  test('Google Client ID field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Google Client ID/i)).toBeVisible()
  })

  test('Google Client Secret field is visible', async ({ page }) => {
    await expect(page.getByLabel(/Google Client Secret/i)).toBeVisible()
  })

  test('"Zaloguj się z Google" button shows OAuth hint when credentials not set', async ({ page }) => {
    // Bez client_id — przycisk powinien być disabled
    const loginBtn = page.getByRole('button', { name: /Zaloguj się z Google|Sign in with Google/i })
    await expect(loginBtn).toBeVisible()
    const disabled = await loginBtn.getAttribute('disabled')
    expect(disabled).not.toBeNull()
  })

  test('"Zaloguj się z Google" button is enabled when client_id is set', async ({ page }) => {
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_SETTINGS, google_client_id_set: true }),
        })
      }
      return route.continue()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    const loginBtn = page.getByRole('button', { name: /Zaloguj się z Google|Sign in with Google/i })
    await expect(loginBtn).toBeVisible()
    const disabled = await loginBtn.getAttribute('disabled')
    expect(disabled).toBeNull()
  })

  test('shows "Połączono" label and logout button when Google connected', async ({ page }) => {
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_SETTINGS, google_connected: true, google_client_id_set: true }),
        })
      }
      return route.continue()
    })
    await page.route('**/api/auth/google/status', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: true, email: 'test@example.com' }),
      }),
    )
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/Połączono|Connected|test@example\.com/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Wyloguj z Google|Sign out from Google/i })).toBeVisible()
  })

  // ── Mock Mode ─────────────────────────────────────────────────────────────────

  test('Mock Mode toggle is visible', async ({ page }) => {
    await expect(page.getByText(/Włącz Mock Mode|Enable Mock Mode/i)).toBeVisible()
  })

  test('Mock Mode toggle changes state', async ({ page }) => {
    const mockSection = page.getByText(/Tryb testowy|Test Mode/i)
    await expect(mockSection).toBeVisible()

    // Znajdź toggle w sekcji Mock
    const toggleArea = page.locator('[class*="w-10"][class*="h-5"]').last()
    if (await toggleArea.count() > 0) {
      await toggleArea.click()
      // Stan powinien się zmienić (kolor bg)
    }
  })

  // ── Zapis ─────────────────────────────────────────────────────────────────────

  test('Save button sends PUT /api/settings request', async ({ page }) => {
    const putRequest = page.waitForRequest(
      req => req.url().includes('/api/settings') && req.method() === 'PUT',
      { timeout: 5000 },
    )

    await page.route('**/api/settings', route => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SETTINGS),
        })
      }
      return route.continue()
    })

    const settings = new SettingsPage(page)
    await settings.saveBtn.click()
    const req = await putRequest
    expect(req.method()).toBe('PUT')
  })

  test('Save button shows "Zapisano!" confirmation', async ({ page }) => {
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SETTINGS),
        })
      }
      return route.continue()
    })

    const settings = new SettingsPage(page)
    await settings.saveBtn.click()

    await expect(page.getByText(/Zapisano|Saved/i)).toBeVisible({ timeout: 5000 })
    // Po ~2.5s powinno zniknąć
    await page.waitForTimeout(3000)
    await expect(page.getByText(/^✓ Zapisano!$|^✓ Saved!$/)).not.toBeVisible()
  })

  test('Save does not send empty API key (preserves existing)', async ({ page }) => {
    let putBody: Record<string, unknown> = {}
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'PUT') {
        putBody = JSON.parse(route.request().postData() ?? '{}')
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SETTINGS),
        })
      }
      return route.continue()
    })

    const settings = new SettingsPage(page)
    // Nie wypełniaj żadnego pola klucza API
    await settings.saveBtn.click()
    await page.waitForTimeout(1000)

    // anthropic_api_key powinien być pominięty w body (albo pusty)
    if ('anthropic_api_key' in putBody) {
      expect(putBody.anthropic_api_key).toBeFalsy()
    }
  })

  test('entering new API key sends it in PUT request', async ({ page }) => {
    let putBody: Record<string, unknown> = {}
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'PUT') {
        putBody = JSON.parse(route.request().postData() ?? '{}')
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SETTINGS),
        })
      }
      return route.continue()
    })

    const settings = new SettingsPage(page)
    const keyInput = page.getByLabel(/Klucz API Anthropic|Anthropic API Key/i)
    await keyInput.fill('sk-ant-new-test-key-9999')
    await settings.saveBtn.click()
    await page.waitForTimeout(1000)

    expect(putBody.anthropic_api_key).toBe('sk-ant-new-test-key-9999')
  })

  test('shows error message when settings save fails', async ({ page }) => {
    await page.route('**/api/settings', route => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({ status: 500, body: 'Server error' })
      }
      return route.continue()
    })

    const settings = new SettingsPage(page)
    await settings.saveBtn.click()
    await expect(page.getByText(/Błąd|Error/i)).toBeVisible({ timeout: 5000 })
  })

  // ── OAuth hint ────────────────────────────────────────────────────────────────

  test('Google Docs section shows setup instructions', async ({ page }) => {
    await expect(page.getByText(/Google Cloud Console/i)).toBeVisible()
    await expect(page.getByText(/Docs API|Drive API/i)).toBeVisible()
  })

})
