import { describe, it, expect } from 'vitest'
import { scorePressure } from '@/engine/factors/pressure'

describe('scorePressure', () => {
  it('returns high score for stable high pressure', () => {
    expect(scorePressure(1018, 0)).toBeGreaterThanOrEqual(0.8)
  })
  it('returns medium for dropping pressure', () => {
    expect(scorePressure(1010, -4)).toBeGreaterThanOrEqual(0.4)
  })
  it('returns low for rapidly rising pressure', () => {
    expect(scorePressure(1020, 6)).toBeLessThanOrEqual(0.5)
  })
})
