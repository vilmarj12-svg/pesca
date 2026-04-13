import { describe, it, expect } from 'vitest'
import { windDirection, getClassificacaoLabel, getClassificacaoStars, getMarkerSize } from '@/lib/format'

describe('windDirection', () => {
  it('converts degrees to cardinal', () => {
    expect(windDirection(0)).toBe('N')
    expect(windDirection(45)).toBe('NE')
    expect(windDirection(90)).toBe('E')
    expect(windDirection(180)).toBe('S')
    expect(windDirection(270)).toBe('W')
    expect(windDirection(360)).toBe('N')
  })
})

describe('getClassificacaoLabel', () => {
  it('returns Portuguese labels', () => {
    expect(getClassificacaoLabel('excelente')).toBe('Excelente')
    expect(getClassificacaoLabel('otimo')).toBe('Ótimo')
    expect(getClassificacaoLabel('bom')).toBe('Bom')
    expect(getClassificacaoLabel('regular')).toBe('Regular')
    expect(getClassificacaoLabel('ruim')).toBe('Ruim')
  })
})

describe('getClassificacaoStars', () => {
  it('returns star strings', () => {
    expect(getClassificacaoStars('excelente')).toBe('★★★★★')
    expect(getClassificacaoStars('ruim')).toBe('★')
  })
})

describe('getMarkerSize', () => {
  it('returns size proportional to score', () => {
    expect(getMarkerSize(90)).toBe(14)
    expect(getMarkerSize(70)).toBe(12)
    expect(getMarkerSize(50)).toBe(10)
    expect(getMarkerSize(20)).toBe(8)
  })
})
