import type { WeatherData, HourlyWeather } from './types'

export const KMH_TO_KT = 0.539957
export const M_TO_KM = 0.001

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const HOURLY_VARS = [
  'temperature_2m', 'wind_speed_10m', 'wind_direction_10m',
  'pressure_msl', 'cloud_cover', 'precipitation',
  'visibility', 'cape',
].join(',')

export function buildWeatherUrl(lats: number[], lons: number[]): string {
  const params = new URLSearchParams({
    latitude: lats.join(','),
    longitude: lons.join(','),
    hourly: HOURLY_VARS,
    timezone: 'America/Sao_Paulo',
    forecast_days: '7',
  })
  return `${BASE_URL}?${params}`
}

interface OpenMeteoResponse {
  latitude: number
  longitude: number
  hourly: {
    time: string[]
    temperature_2m: number[]
    wind_speed_10m: number[]
    wind_direction_10m: number[]
    pressure_msl: number[]
    cloud_cover: number[]
    precipitation: number[]
    visibility: number[]
    cape: number[]
  }
}

export function parseWeatherResponse(responses: OpenMeteoResponse[]): WeatherData[] {
  return responses.map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    hourly: r.hourly.time.map((time, i) => ({
      time,
      temperature2m: r.hourly.temperature_2m[i],
      windSpeed10m: r.hourly.wind_speed_10m[i] * KMH_TO_KT,
      windDirection10m: r.hourly.wind_direction_10m[i],
      pressureMsl: r.hourly.pressure_msl[i],
      cloudCover: r.hourly.cloud_cover[i],
      precipitation: r.hourly.precipitation[i],
      visibility: r.hourly.visibility[i] * M_TO_KM,
      cape: r.hourly.cape[i],
    })),
  }))
}

export async function fetchWeather(lats: number[], lons: number[]): Promise<WeatherData[]> {
  const url = buildWeatherUrl(lats, lons)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo Forecast failed: ${res.status}`)
  const data = await res.json()
  const responses: OpenMeteoResponse[] = Array.isArray(data) ? data : [data]
  return parseWeatherResponse(responses)
}
