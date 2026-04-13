import type { MarineData } from './types'

const BASE_URL = 'https://marine-api.open-meteo.com/v1/marine'
const HOURLY_VARS = ['wave_height', 'wave_period', 'wave_direction', 'sea_surface_temperature'].join(',')

export function buildMarineUrl(lats: number[], lons: number[]): string {
  const params = new URLSearchParams({
    latitude: lats.join(','),
    longitude: lons.join(','),
    hourly: HOURLY_VARS,
    timezone: 'America/Sao_Paulo',
    forecast_days: '7',
  })
  return `${BASE_URL}?${params}`
}

interface OpenMeteoMarineResponse {
  latitude: number
  longitude: number
  hourly: {
    time: string[]
    wave_height: number[]
    wave_period: number[]
    wave_direction: number[]
    sea_surface_temperature: number[]
  }
}

export function parseMarineResponse(responses: OpenMeteoMarineResponse[]): MarineData[] {
  return responses.map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    hourly: r.hourly.time.map((time, i) => ({
      time,
      waveHeight: r.hourly.wave_height[i],
      wavePeriod: r.hourly.wave_period[i],
      waveDirection: r.hourly.wave_direction[i],
      seaSurfaceTemperature: r.hourly.sea_surface_temperature[i],
    })),
  }))
}

export async function fetchMarine(lats: number[], lons: number[]): Promise<MarineData[]> {
  const url = buildMarineUrl(lats, lons)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo Marine failed: ${res.status}`)
  const data = await res.json()
  const responses: OpenMeteoMarineResponse[] = Array.isArray(data) ? data : [data]
  return parseMarineResponse(responses)
}
