import { describe, it, expect } from 'vitest'
import { SEED_PESQUEIROS, SEED_ESPECIES, SEED_ISCAS } from '@/db/seed'

describe('seed data', () => {
  it('has 39 pesqueiros', () => { expect(SEED_PESQUEIROS).toHaveLength(39) })
  it('all pesqueiros have required fields', () => {
    for (const p of SEED_PESQUEIROS) {
      expect(p.slug).toBeTruthy()
      expect(p.nome).toBeTruthy()
      expect(p.lat).toBeLessThan(0)
      expect(p.lon).toBeLessThan(0)
      expect(p.tipo).toBeTruthy()
      expect(p.especiesAlvo.length).toBeGreaterThan(0)
    }
  })
  it('all pesqueiro slugs are unique', () => {
    const slugs = SEED_PESQUEIROS.map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
  it('has at least 8 species', () => { expect(SEED_ESPECIES.length).toBeGreaterThanOrEqual(8) })
  it('has at least 10 baits', () => { expect(SEED_ISCAS.length).toBeGreaterThanOrEqual(10) })
})
