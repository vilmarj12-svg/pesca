import { describe, it, expect } from 'vitest'
import { buildCondicoes } from '@/cron/build-condicoes'

describe('buildCondicoes', () => {
  it('maps all fetcher data into Condicoes interface', () => {
    const result = buildCondicoes({
      weather: {
        time: '2026-04-12T08:00', temperature2m: 22, windSpeed10m: 10,
        windDirection10m: 240, pressureMsl: 1018, cloudCover: 40,
        precipitation: 0, visibility: 10, cape: 200,
      },
      marine: {
        time: '2026-04-12T08:00', waveHeight: 0.8, wavePeriod: 11,
        waveDirection: 180, seaSurfaceTemperature: 23,
      },
      astronomy: { moonIllumination: 0.95, sunrise: 6.5, sunset: 17.8 },
      tideHeight: 1.5, tideFase: 'subindo', tideAmplitude: 1.8,
      pressaoSerie12h: Array(12).fill(1018),
      ventoSerie12h: Array(12).fill(240),
      naviosFundeados: [], hora: 8, mes: 4,
    })
    expect(result.ventoVelocidadeKt).toBe(10)
    expect(result.ondaAlturaM).toBe(0.8)
    expect(result.luaIluminacao).toBe(0.95)
    expect(result.horaAtual).toBe(8)
    expect(result.pressaoVariacao12h).toBe(0)
  })
})
