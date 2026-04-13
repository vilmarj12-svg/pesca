import { describe, it, expect } from 'vitest'
import * as factors from '@/engine/factors'

describe('factors index', () => {
  it('exports all 13 factor functions', () => {
    expect(typeof factors.scoreWind).toBe('function')
    expect(typeof factors.scoreTide).toBe('function')
    expect(typeof factors.scoreWave).toBe('function')
    expect(typeof factors.scoreMoon).toBe('function')
    expect(typeof factors.scorePressure).toBe('function')
    expect(typeof factors.scoreColdFront).toBe('function')
    expect(typeof factors.scoreWaterTemp).toBe('function')
    expect(typeof factors.scoreShips).toBe('function')
    expect(typeof factors.scoreTimeOfDay).toBe('function')
    expect(typeof factors.scoreVisibility).toBe('function')
    expect(typeof factors.scoreClouds).toBe('function')
    expect(typeof factors.scoreAirTemp).toBe('function')
    expect(typeof factors.scoreRain).toBe('function')
  })
})
