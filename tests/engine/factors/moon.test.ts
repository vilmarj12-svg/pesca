import { describe, it, expect } from 'vitest'
import { scoreMoon } from '@/engine/factors/moon'

describe('scoreMoon', () => {
  it('returns 1.0 for full moon (1.0)', () => {
    expect(scoreMoon(1.0)).toBe(1.0)
  })
  it('returns 1.0 for new moon (0.0)', () => {
    expect(scoreMoon(0.0)).toBe(1.0)
  })
  it('returns lowest for quarter moon (0.5)', () => {
    expect(scoreMoon(0.5)).toBeLessThanOrEqual(0.5)
  })
})
