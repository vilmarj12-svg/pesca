import { test, expect } from '@playwright/test'

test.describe('Navegação', () => {
  test('sidebar navega entre páginas', async ({ page }) => {
    await page.goto('/')

    // Vai pra pesqueiros
    await page.click('a:has-text("Pesqueiros")')
    await expect(page).toHaveURL('/pesqueiro')
    await expect(page.locator('h1:has-text("Pesqueiros")')).toBeVisible()

    // Vai pra admin (sem token, mostra não autorizado)
    await page.click('a:has-text("Admin")')
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('text=Acesso não autorizado')).toBeVisible()

    // Volta pro dashboard
    await page.click('a:has-text("Dashboard")')
    await expect(page).toHaveURL('/')
  })

  test('pesqueiros lista cards clicáveis', async ({ page }) => {
    await page.goto('/pesqueiro')
    // Espera os cards carregarem
    const cards = page.locator('a[href^="/pesqueiro/"]')
    await expect(cards.first()).toBeVisible({ timeout: 15000 })
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('clica num pesqueiro e abre detalhe', async ({ page }) => {
    await page.goto('/pesqueiro')
    const firstCard = page.locator('a[href^="/pesqueiro/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 15000 })
    await firstCard.click()

    // Página de detalhe
    await expect(page.locator('text=Voltar')).toBeVisible()
    await expect(page.locator('text=Score — Próximas 72h')).toBeVisible()
    await expect(page.locator('text=Por que tá')).toBeVisible()
    await expect(page.locator('text=Condições brutas')).toBeVisible()
  })

  test('botão voltar no detalhe retorna ao dashboard', async ({ page }) => {
    await page.goto('/pesqueiro')
    const firstCard = page.locator('a[href^="/pesqueiro/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 15000 })
    await firstCard.click()

    await expect(page.locator('text=Voltar')).toBeVisible()
    await page.click('text=Voltar')
    await expect(page).toHaveURL('/')
  })
})
