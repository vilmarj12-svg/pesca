import { describe, it, expect } from 'vitest'
import { getScoreColor, getScoreBadgeClass, getHeatColor } from '@/lib/score-colors'

describe('getScoreColor', () => {
  it('returns emerald for score >= 80', () => {
    expect(getScoreColor(80)).toBe('#10b981')
    expect(getScoreColor(100)).toBe('#10b981')
  })
  it('returns amber for score 60-79', () => {
    expect(getScoreColor(60)).toBe('#fbbf24')
    expect(getScoreColor(79)).toBe('#fbbf24')
  })
  it('returns orange for score 40-59', () => {
    expect(getScoreColor(40)).toBe('#f97316')
  })
  it('returns red for score < 40', () => {
    expect(getScoreColor(0)).toBe('#ef4444')
    expect(getScoreColor(39)).toBe('#ef4444')
  })
})

describe('getScoreBadgeClass', () => {
  it('returns correct tailwind classes', () => {
    expect(getScoreBadgeClass(85)).toBe('bg-emerald-500 text-white')
    expect(getScoreBadgeClass(65)).toBe('bg-amber-400 text-amber-900')
    expect(getScoreBadgeClass(50)).toBe('bg-orange-500 text-white')
    expect(getScoreBadgeClass(20)).toBe('bg-red-500 text-white')
  })
})

describe('getHeatColor', () => {
  it('returns tailwind bg class', () => {
    expect(getHeatColor(80)).toBe('bg-emerald-500')
    expect(getHeatColor(60)).toBe('bg-amber-400')
    expect(getHeatColor(40)).toBe('bg-orange-500')
    expect(getHeatColor(10)).toBe('bg-red-500')
  })
})
