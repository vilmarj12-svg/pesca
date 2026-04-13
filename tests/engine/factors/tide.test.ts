import { describe, it, expect } from 'vitest'
import { scoreTide } from '@/engine/factors/tide'

describe('scoreTide', () => {
  it('returns 1.0 for rising tide with high amplitude', () => {
    expect(scoreTide('subindo', 1.8)).toBe(1.0)
  })
  it('returns 0.9 for falling tide with high amplitude', () => {
    const result = scoreTide('descendo', 1.8)
    expect(result).toBeGreaterThanOrEqual(0.9)
  })
  it('returns 0.7 for high tide peak', () => {
    const result = scoreTide('preamar', 1.8)
    expect(result).toBeGreaterThanOrEqual(0.7)
  })
  it('returns low for low tide', () => {
    const result = scoreTide('baixamar', 1.8)
    expect(result).toBeLessThanOrEqual(0.4)
  })
  it('penalizes low amplitude (neap tide)', () => {
    const neap = scoreTide('subindo', 0.5)
    const spring = scoreTide('subindo', 1.8)
    expect(neap).toBeLessThan(spring)
  })
})
