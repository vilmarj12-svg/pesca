import { describe, it, expect } from 'vitest'
import { detectAlertasNavegacao } from '@/lib/alertas-navegacao'

function makeCondicao(overrides: Partial<Parameters<typeof detectAlertasNavegacao>[0][0]> = {}) {
  return {
    timestamp: '2026-04-14T08:00:00',
    ventoKt: 10,
    ventoDirecao: 180,
    ondaM: 1.0,
    ondaPeriodoS: 8,
    visibilidadeKm: 10,
    capeJkg: 0,
    precipitacaoMm: 0,
    pressaoHpa: 1013,
    pressaoVariacao: 0,
    ...overrides,
  }
}

describe('detectAlertasNavegacao', () => {
  it('returns empty for calm conditions', () => {
    const alertas = detectAlertasNavegacao([makeCondicao()])
    expect(alertas).toHaveLength(0)
  })

  it('detects strong wind (perigo >= 35kt)', () => {
    const alertas = detectAlertasNavegacao([makeCondicao({ ventoKt: 38, ventoDirecao: 180 })])
    expect(alertas).toHaveLength(1)
    expect(alertas[0].tipo).toBe('vento')
    expect(alertas[0].severidade).toBe('perigo')
    expect(alertas[0].titulo).toBe('VENTO MUITO FORTE')
  })

  it('detects moderate wind (atencao >= 25kt)', () => {
    const alertas = detectAlertasNavegacao([makeCondicao({ ventoKt: 28 })])
    expect(alertas[0].severidade).toBe('atencao')
  })

  it('detects high waves (perigo >= 3.5m)', () => {
    const alertas = detectAlertasNavegacao([makeCondicao({ ondaM: 4.0 })])
    expect(alertas[0].tipo).toBe('onda')
    expect(alertas[0].severidade).toBe('perigo')
    expect(alertas[0].titulo).toBe('MAR GROSSO')
  })

  it('detects storm (CAPE >= 1000)', () => {
    const alertas = detectAlertasNavegacao([makeCondicao({ capeJkg: 1500 })])
    expect(alertas[0].tipo).toBe('tempestade')
    expect(alertas[0].severidade).toBe('perigo')
  })

  it('detects low visibility', () => {
    const alertas = detectAlertasNavegacao([makeCondicao({ visibilidadeKm: 0.3 })])
    expect(alertas[0].tipo).toBe('visibilidade')
    expect(alertas[0].severidade).toBe('perigo')
    expect(alertas[0].titulo).toBe('NEVOEIRO DENSO')
  })

  it('detects pressure drop (cold front)', () => {
    const alertas = detectAlertasNavegacao([makeCondicao({ pressaoVariacao: -6 })])
    expect(alertas[0].tipo).toBe('pressao')
    expect(alertas[0].titulo).toContain('Frente fria')
  })

  it('sorts by severity (perigo first)', () => {
    const alertas = detectAlertasNavegacao([
      makeCondicao({ ventoKt: 28, capeJkg: 1500, ondaM: 1.5 }),
    ])
    expect(alertas[0].severidade).toBe('perigo')
  })
})
