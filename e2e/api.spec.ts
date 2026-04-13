import { test, expect } from '@playwright/test'

test.describe('APIs', () => {
  test('GET /api/dashboard retorna pesqueiros e espécies', async ({ request }) => {
    const res = await request.get('/api/dashboard')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.pesqueiros).toBeDefined()
    expect(data.pesqueiros.length).toBeGreaterThan(0)
    expect(data.especiesEmAlta).toBeDefined()
    expect(data.iscasEmAlta).toBeDefined()
    expect(data.runStatus).toBeDefined()

    // Pesqueiro tem campos obrigatórios
    const p = data.pesqueiros[0]
    expect(p.slug).toBeTruthy()
    expect(p.nome).toBeTruthy()
    expect(p.lat).toBeLessThan(0)
    expect(p.lon).toBeLessThan(0)
    expect(p.scoreAtual).toBeDefined()
  })

  test('GET /api/forecast retorna previsão 7 dias', async ({ request }) => {
    const res = await request.get('/api/forecast')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.pesqueiros).toBeDefined()
    expect(data.pesqueiros.length).toBeGreaterThan(0)
    expect(data.rankingMelhorDia).toBeDefined()
    expect(data.alertasPorDia).toBeDefined()

    // Cada pesqueiro tem dias
    const p = data.pesqueiros[0]
    expect(p.dias.length).toBeGreaterThanOrEqual(5)
    expect(p.melhorDia).toBeDefined()
    expect(p.melhorDia.scoreMedio).toBeDefined()
  })

  test('GET /api/ships retorna navios', async ({ request }) => {
    const res = await request.get('/api/ships')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(Array.isArray(data)).toBeTruthy()
    expect(data.length).toBeGreaterThan(0)

    const ship = data[0]
    expect(ship.mmsi).toBeDefined()
    expect(ship.lat).toBeLessThan(0)
    expect(ship.lon).toBeLessThan(0)
  })

  test('GET /api/pesqueiro/[slug] retorna detalhe', async ({ request }) => {
    // Primeiro pega um slug válido
    const dashRes = await request.get('/api/dashboard')
    const dash = await dashRes.json()
    const slug = dash.pesqueiros[0].slug

    const res = await request.get(`/api/pesqueiro/${slug}`)
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.pesqueiro.nome).toBeTruthy()
    expect(data.breakdown).toBeDefined()
    expect(data.breakdown.fatores).toBeDefined()
  })

  test('GET /api/pesqueiro/slug-invalido retorna 404', async ({ request }) => {
    const res = await request.get('/api/pesqueiro/nao-existe-xyz')
    expect(res.status()).toBe(404)
  })

  test('admin APIs sem token retornam 401', async ({ request }) => {
    const res = await request.get('/api/admin/pesqueiros')
    expect(res.status()).toBe(401)
  })

  test('GET /api/cron/refresh processa pesqueiros', async ({ request }) => {
    const res = await request.get('/api/cron/refresh?token=pesca-pr-admin-2026')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.status).toMatch(/sucesso|parcial/)
    expect(data.pesqueirosProcessados).toBeGreaterThan(0)
  })
})
