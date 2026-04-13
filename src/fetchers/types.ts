export interface HourlyWeather {
  time: string
  temperature2m: number
  windSpeed10m: number    // knots (converted from km/h)
  windDirection10m: number
  pressureMsl: number
  cloudCover: number
  precipitation: number
  visibility: number      // km (converted from meters)
  cape: number
}

export interface WeatherData {
  latitude: number
  longitude: number
  hourly: HourlyWeather[]
}

export interface HourlyMarine {
  time: string
  waveHeight: number
  wavePeriod: number
  waveDirection: number
  seaSurfaceTemperature: number
}

export interface MarineData {
  latitude: number
  longitude: number
  hourly: HourlyMarine[]
}

export interface TidePoint {
  time: string
  height: number
  type: 'high' | 'low' | null
}

export interface TideData {
  heights: TidePoint[]
  extremes: TidePoint[]
}

export interface AstronomyData {
  moonIllumination: number
  sunrise: number
  sunset: number
}
