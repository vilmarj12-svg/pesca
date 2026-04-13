import { describe, it, expect } from 'vitest'
import { scoreTimeOfDay } from '@/engine/factors/time-of-day'

describe('scoreTimeOfDay', () => {
  it('returns 1.0 at sunrise', () => {
    expect(scoreTimeOfDay(6, 6, 18)).toBe(1.0)
  })
  it('returns 1.0 at sunset', () => {
    expect(scoreTimeOfDay(18, 6, 18)).toBe(1.0)
  })
  it('returns low score at noon', () => {
    expect(scoreTimeOfDay(12, 6, 18)).toBeLessThanOrEqual(0.5)
  })
  it('returns medium at night', () => {
    const night = scoreTimeOfDay(2, 6, 18)
    expect(night).toBeGreaterThan(0.3)
    expect(night).toBeLessThan(0.8)
  })
})
