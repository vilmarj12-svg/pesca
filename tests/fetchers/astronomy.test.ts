import { describe, it, expect } from 'vitest'
import { getAstronomy } from '@/fetchers/astronomy'

describe('getAstronomy', () => {
  it('returns moon illumination between 0 and 1', () => {
    const result = getAstronomy(-25.5, -48.3, new Date('2026-04-12T12:00:00Z'))
    expect(result.moonIllumination).toBeGreaterThanOrEqual(0)
    expect(result.moonIllumination).toBeLessThanOrEqual(1)
  })
  it('returns sunrise before sunset', () => {
    const result = getAstronomy(-25.5, -48.3, new Date('2026-04-12T12:00:00Z'))
    expect(result.sunrise).toBeGreaterThan(4)
    expect(result.sunset).toBeGreaterThan(16)
    expect(result.sunrise).toBeLessThan(result.sunset)
  })
})
