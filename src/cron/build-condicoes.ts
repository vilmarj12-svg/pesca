import type { Condicoes, NavioFundeado } from '@/engine/types'
import type { HourlyWeather, HourlyMarine, AstronomyData } from '@/fetchers/types'

interface BuildCondicoesInput {
  weather: HourlyWeather
  marine: HourlyMarine
  astronomy: AstronomyData
  tideHeight: number
  tideFase: 'subindo' | 'descendo' | 'preamar' | 'baixamar'
  tideAmplitude: number
  pressaoSerie12h: number[]
  ventoSerie12h: number[]
  naviosFundeados: NavioFundeado[]
  hora: number
  mes: number
}

export function buildCondicoes(input: BuildCondicoesInput): Condicoes {
  return {
    ventoVelocidadeKt: input.weather.windSpeed10m,
    ventoDirecaoGraus: input.weather.windDirection10m,
    pressaoHpa: input.weather.pressureMsl,
    pressaoVariacao12h: input.pressaoSerie12h.length >= 2
      ? input.pressaoSerie12h[input.pressaoSerie12h.length - 1] - input.pressaoSerie12h[0]
      : 0,
    temperaturaAr: input.weather.temperature2m,
    coberturaNuvens: input.weather.cloudCover,
    precipitacaoMm: input.weather.precipitation,
    visibilidadeKm: input.weather.visibility,
    capeJkg: input.weather.cape,
    ondaAlturaM: input.marine.waveHeight,
    ondaPeriodoS: input.marine.wavePeriod,
    temperaturaAgua: input.marine.seaSurfaceTemperature,
    mareAlturaM: input.tideHeight,
    mareFase: input.tideFase,
    mareAmplitude: input.tideAmplitude,
    luaIluminacao: input.astronomy.moonIllumination,
    horaSol: { nascer: input.astronomy.sunrise, por: input.astronomy.sunset },
    pressaoSerie12h: input.pressaoSerie12h,
    ventoSerie12h: input.ventoSerie12h,
    naviosFundeados: input.naviosFundeados,
    horaAtual: input.hora,
    mesAtual: input.mes,
  }
}
