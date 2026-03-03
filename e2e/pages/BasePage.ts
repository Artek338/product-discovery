/**
 * BasePage — wspólna baza dla wszystkich Page Objects.
 * Zawiera nawigację, sidebar i globalne helpery.
 */
import { Page, Locator, expect } from '@playwright/test'

export class BasePage {
  readonly page: Page

  // Sidebar
  readonly navDashboard: Locator
  readonly navNewDiscovery: Locator
  readonly navSimulator: Locator
  readonly navSettings: Locator

  constructor(page: Page) {
    this.page = page
    this.navDashboard  = page.getByRole('link', { name: /Projekty|Dashboard/i }).first()
    this.navNewDiscovery = page.getByRole('link', { name: /Nowy projekt|New Project/i })
    this.navSimulator  = page.getByRole('link', { name: /Symulator|Simulator/i })
    this.navSettings   = page.getByRole('link', { name: /Ustawienia|Settings/i })
  }

  async goto(path = '/') {
    await this.page.goto(path)
  }

  async navigateToDashboard() {
    await this.navDashboard.click()
    await this.page.waitForURL('/')
  }

  async navigateToNewDiscovery() {
    await this.navNewDiscovery.click()
    await this.page.waitForURL('/discovery/new')
  }

  async navigateToSimulator() {
    await this.navSimulator.click()
    await this.page.waitForURL('/simulate')
  }

  async navigateToSettings() {
    await this.navSettings.click()
    await this.page.waitForURL('/settings')
  }

  /** Czeka aż backend odpowie na /api/health */
  async waitForBackend() {
    const response = await this.page.request.get('http://localhost:8000/api/health')
    expect(response.status()).toBe(200)
  }
}
