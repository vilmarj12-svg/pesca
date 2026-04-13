import { describe, it, expect } from 'vitest'
import { calculateScore } from '@/engine/score'
import type { Condicoes, Pesqueiro } from '@/engine/types'

const pesqueiro: Pesqueiro = {
  id: 1, slug: 'test', nome: 'Test', lat: -25.7, lon: -48.3,
  tipo: 'laje', profundidadeM: 18, distanciaCostaMn: 8,
  especiesAlvo: ['vermelho'], notas: null, pesosOverride: null,
}

const goodConditions: Condicoes = {
  ventoVelocidadeKt: 10, ventoDirecaoGraus: 240,
  pressaoHpa: 1018, pressaoVariacao12h: 0,
  temperaturaAr: 22, coberturaNuvens: 40, precipitacaoMm: 0,
  visibilidadeKm: 10, capeJkg: 200,
  ondaAlturaM: 0.8, ondaPeriodoS: 11, temperaturaAgua: 23,
  mareAlturaM: 1.8, mareFase: 'subindo', mareAmplitude: 1.8,
  luaIluminacao: 1.0,
  horaSol: { nascer: 6, por: 18 },
  pressaoSerie12h: Array(12).fill(1018),
  ventoSerie12h: Array(12).fill(240),
  naviosFundeados: [],
  horaAtual: 7, mesAtual: 4,
}

describe('calculateScore', () => {
  it('returns score 0-100 with breakdown', () => {
    const result = calculateScore(pesqueiro, goodConditions)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.classificacao).toBeDefined()
    expect(result.fatores).toHaveLength(13)
    expect(result.safetyOverride).toBe(false)
  })

  it('returns high score for good conditions', () => {
    const result = calculateScore(pesqueiro, goodConditions)
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('returns 0 with safety override for thunderstorm', () => {
    const storm = { ...goodConditions, capeJkg: 1500 }
    const result = calculateScore(pesqueiro, storm)
    expect(result.score).toBe(0)
    expect(result.safetyOverride).toBe(true)
  })

  it('breakdown contributions sum to approximately the score', () => {
    const result = calculateScore(pesqueiro, goodConditions)
    const sum = result.fatores.reduce((s, f) => s + f.contribuicao, 0)
    expect(Math.abs(sum - result.score)).toBeLessThanOrEqual(1)
  })

  it('uses pesqueiro weight overrides', () => {
    const overridden = { ...pesqueiro, pesosOverride: { onda: 30, mare: 5 } }
    const result = calculateScore(overridden, goodConditions)
    const ondaFator = result.fatores.find(f => f.nome === 'onda')
    expect(ondaFator?.peso).toBe(30)
  })
})
