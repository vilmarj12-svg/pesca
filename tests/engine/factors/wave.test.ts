import { describe, it, expect } from 'vitest'
import { scoreWave } from '@/engine/factors/wave'

describe('scoreWave', () => {
  it('returns high score for calm seas', () => {
    expect(scoreWave(0.5, 12)).toBeGreaterThanOrEqual(0.9)
  })
  it('returns 0.0 for dangerous waves > 2.5m', () => {
    expect(scoreWave(3.0, 8)).toBe(0.0)
  })
  it('penalizes short period swell', () => {
    const short = scoreWave(1.0, 6)
    const long = scoreWave(1.0, 12)
    expect(long).toBeGreaterThan(short)
  })
})
