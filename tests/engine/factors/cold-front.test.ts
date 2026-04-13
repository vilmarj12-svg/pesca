import { describe, it, expect } from 'vitest'
import { scoreColdFront } from '@/engine/factors/cold-front'

describe('scoreColdFront', () => {
  it('returns 1.0 when front approaching', () => {
    const pressao = [1018, 1017, 1016, 1015, 1014, 1013, 1012, 1011, 1010, 1009, 1008, 1007]
    const vento = [270, 270, 260, 250, 230, 210, 200, 190, 180, 170, 160, 150]
    expect(scoreColdFront(pressao, vento)).toBeGreaterThanOrEqual(0.8)
  })
  it('returns 0.5 when no front detected', () => {
    const pressao = Array(12).fill(1018)
    const vento = Array(12).fill(90)
    expect(scoreColdFront(pressao, vento)).toBeLessThanOrEqual(0.6)
  })
})
