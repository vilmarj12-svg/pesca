import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('carrega com sidebar, mapa e ranking', async ({ page }) => {
    await page.goto('/')
    // Sidebar
    await expect(page.getByRole('heading', { name: 'Pesca PR' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pesqueiros' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible()

    // Header
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()

    // Mapa carrega
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })

    // Ranking
    await expect(page.getByRole('heading', { name: /^Ranking — / })).toBeVisible()
  })

  test('botões de dia são clicáveis e mudam o conteúdo', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button:has-text("Hoje")')).toBeVisible({ timeout: 15000 })

    const buttons = page.locator('button:has-text("Hoje"), button:has-text("Seg"), button:has-text("Ter"), button:has-text("Qua"), button:has-text("Qui"), button:has-text("Sex"), button:has-text("Sáb"), button:has-text("Dom")')
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(2)

    if (count >= 2) {
      await buttons.nth(1).click()
      await expect(page.locator('text=Mapa —')).toBeVisible()
    }
  })

  test('espécies e iscas em alta aparecem', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Espécies em alta')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Iscas em alta')).toBeVisible()
  })

  test('navios fundeados aparecem no ranking', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Navios fundeados')).toBeVisible({ timeout: 15000 })
  })

  test('mapa tem botão de fullscreen', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('button[title="Maximizar mapa"]')).toBeVisible()
  })
})
