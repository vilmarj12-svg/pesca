import { Illumination, Body, SearchRiseSet, Observer, MakeTime } from 'astronomy-engine'
import type { AstronomyData } from './types'

export function getAstronomy(lat: number, lon: number, date: Date): AstronomyData {
  const observer = new Observer(lat, lon, 0)
  const illum = Illumination(Body.Moon, date)
  const moonIllumination = illum.phase_fraction
  const astroTime = MakeTime(date)
  const riseResult = SearchRiseSet(Body.Sun, observer, 1, astroTime, 1)
  const setResult = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1)
  const sunriseDate = riseResult ? riseResult.date : date
  const sunsetDate = setResult ? setResult.date : date
  const sunrise = sunriseDate.getHours() + sunriseDate.getMinutes() / 60
  const sunset = sunsetDate.getHours() + sunsetDate.getMinutes() / 60
  return { moonIllumination, sunrise, sunset }
}
