import { test, expect } from '@playwright/test'

test.describe('Admin', () => {
  test('sem token mostra não autorizado', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('text=Acesso não autorizado')).toBeVisible()
  })

  test('com token carrega painel completo', async ({ page }) => {
    await page.goto('/admin?token=pesca-pr-admin-2026')
    await expect(page.locator('h1:has-text("Administração")')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=Diagnóstico')).toBeVisible()
    await expect(page.locator('text=Pesos do Score Engine')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Pesqueiros \(\d+\)/ })).toBeVisible()
  })

  test('botão forçar refresh funciona', async ({ page }) => {
    await page.goto('/admin?token=pesca-pr-admin-2026')
    await expect(page.locator('text=Forçar Refresh')).toBeVisible({ timeout: 15000 })
    await page.click('text=Forçar Refresh')
    await expect(page.locator('text=pesqueiros processados')).toBeVisible({ timeout: 30000 })
  })
})
