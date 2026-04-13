import { describe, it, expect } from 'vitest'
import { formatScoreStars, formatMoonPhase, formatPressureSummary, formatWindSummary } from '@/telegram/format'

describe('formatScoreStars', () => {
  it('returns stars for each classification', () => {
    expect(formatScoreStars(95)).toBe('⭐⭐⭐⭐⭐ EXCELENTE')
    expect(formatScoreStars(80)).toBe('⭐⭐⭐⭐ Ótimo')
    expect(formatScoreStars(65)).toBe('⭐⭐⭐ Bom')
    expect(formatScoreStars(50)).toBe('⭐⭐ Regular')
    expect(formatScoreStars(30)).toBe('⭐ Ruim')
  })
})

describe('formatMoonPhase', () => {
  it('returns emoji and label', () => {
    expect(formatMoonPhase(0.0)).toBe('🌑 Lua nova')
    expect(formatMoonPhase(0.15)).toBe('🌓 Lua crescente')
    expect(formatMoonPhase(0.95)).toBe('🌕 Lua cheia')
    expect(formatMoonPhase(0.7)).toBe('🌗 Lua minguante')
  })
})

describe('formatPressureSummary', () => {
  it('describes pressure and variation', () => {
    expect(formatPressureSummary(1018, 0.5)).toBe('Pressão estável em 1018 hPa')
    expect(formatPressureSummary(1010, -5)).toBe('Pressão caindo (1010 hPa, Δ-5)')
    expect(formatPressureSummary(1020, 3)).toBe('Pressão subindo (1020 hPa, Δ+3)')
  })
})

describe('formatWindSummary', () => {
  it('formats wind speed and direction', () => {
    expect(formatWindSummary(12, 135)).toBe('SE 12kt')
    expect(formatWindSummary(8, 225)).toBe('SW 8kt')
  })
})
