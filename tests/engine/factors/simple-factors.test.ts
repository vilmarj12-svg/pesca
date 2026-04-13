import { describe, it, expect } from 'vitest'
import { scoreWaterTemp } from '@/engine/factors/water-temp'
import { scoreVisibility } from '@/engine/factors/visibility'
import { scoreClouds } from '@/engine/factors/clouds'
import { scoreAirTemp } from '@/engine/factors/air-temp'
import { scoreRain } from '@/engine/factors/rain'

describe('scoreWaterTemp', () => {
  it('returns 1.0 for ideal range 20-25°C', () => { expect(scoreWaterTemp(23)).toBe(1.0) })
  it('penalizes cold water', () => { expect(scoreWaterTemp(15)).toBeLessThan(1.0) })
  it('penalizes hot water', () => { expect(scoreWaterTemp(30)).toBeLessThan(1.0) })
})

describe('scoreVisibility', () => {
  it('returns 1.0 for > 5km', () => { expect(scoreVisibility(10)).toBe(1.0) })
  it('returns 0.0 for < 0.5km', () => { expect(scoreVisibility(0.3)).toBe(0.0) })
})

describe('scoreClouds', () => {
  it('returns best for light overcast 30-60%', () => { expect(scoreClouds(40)).toBeGreaterThanOrEqual(0.9) })
  it('penalizes blazing sun 0%', () => { expect(scoreClouds(0)).toBeLessThanOrEqual(0.9) })
})

describe('scoreAirTemp', () => {
  it('returns 1.0 for comfortable 18-28°C', () => { expect(scoreAirTemp(22)).toBe(1.0) })
})

describe('scoreRain', () => {
  it('returns 1.0 for no rain', () => { expect(scoreRain(0)).toBe(1.0) })
  it('penalizes heavy rain', () => { expect(scoreRain(10)).toBeLessThan(0.5) })
})
