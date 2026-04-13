import { describe, it, expect } from 'vitest'
import { scoreWind } from '@/engine/factors/wind'

describe('scoreWind', () => {
  it('returns 1.0 for ideal wind 5-15kt', () => {
    expect(scoreWind(10, 180)).toBe(1.0)
  })
  it('returns 0.6 for calm < 3kt', () => {
    expect(scoreWind(2, 180)).toBe(0.6)
  })
  it('returns 0.6 for moderate 16-20kt', () => {
    expect(scoreWind(18, 180)).toBe(0.6)
  })
  it('returns 0.3 for strong 21-25kt', () => {
    expect(scoreWind(23, 180)).toBe(0.3)
  })
  it('returns 0.0 for extreme > 25kt', () => {
    expect(scoreWind(30, 180)).toBe(0.0)
  })
  it('adds terral bonus for SW wind (200-290 degrees)', () => {
    const noTerral = scoreWind(2, 90)
    const terral = scoreWind(2, 240)
    expect(terral).toBeGreaterThan(noTerral)
  })
  it('caps at 1.0 even with terral bonus', () => {
    expect(scoreWind(10, 240)).toBeLessThanOrEqual(1.0)
  })
})
