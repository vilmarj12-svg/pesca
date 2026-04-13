import { describe, it, expect } from 'vitest'
import { buildWeatherUrl, parseWeatherResponse, KMH_TO_KT, M_TO_KM } from '@/fetchers/open-meteo'

describe('buildWeatherUrl', () => {
  it('constructs correct URL with multiple coordinates', () => {
    const url = buildWeatherUrl([-25.74, -25.68], [-48.35, -48.29])
    expect(url).toContain('latitude=-25.74%2C-25.68')
    expect(url).toContain('temperature_2m')
    expect(url).toContain('cape')
  })
})

describe('parseWeatherResponse', () => {
  it('parses and converts units', () => {
    const mock = [{
      latitude: -25.74, longitude: -48.35,
      hourly: {
        time: ['2026-04-12T06:00'],
        temperature_2m: [22], wind_speed_10m: [18.52], wind_direction_10m: [240],
        pressure_msl: [1018], cloud_cover: [40], precipitation: [0],
        visibility: [10000], cape: [200],
      }
    }]
    const result = parseWeatherResponse(mock)
    expect(result).toHaveLength(1)
    expect(result[0].hourly[0].windSpeed10m).toBeCloseTo(10, 0)
    expect(result[0].hourly[0].visibility).toBeCloseTo(10, 0)
  })
})

describe('KMH_TO_KT', () => {
  it('converts correctly', () => {
    expect(18.52 * KMH_TO_KT).toBeCloseTo(10, 0)
  })
})
