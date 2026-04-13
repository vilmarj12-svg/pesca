import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pesqueiros, config } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { fetchWeather } from '@/fetchers/open-meteo'
import { fetchMarine } from '@/fetchers/open-meteo-marine'
import { getAstronomy } from '@/fetchers/astronomy'
import { getAnchoredShips } from '@/fetchers/ais'
import { buildCondicoes } from '@/cron/build-condicoes'
import { calculateScore } from '@/engine/score'
import { DEFAULT_WEIGHTS } from '@/engine/constants'
import type { Pesqueiro } from '@/engine/types'

export const dynamic = 'force-dynamic'

interface HourForecast {
  timestamp: string
  score: number
  classificacao: string
}

interface DayForecast {
  date: string
  label: string
  scoreMedio: number
  scoreMax: number
  classificacao: string
  melhorHora: string
}

interface PesqueiroForecast {
  id: number
  slug: string
  nome: string
  tipo: string
  lat: number
  lon: number
  horas: HourForecast[]
  dias: DayForecast[]
  melhorDia: DayForecast
}

export async function GET() {
  try {
    const allPesqueiros = db
      .select()
      .from(pesqueiros)
      .where(eq(pesqueiros.ativo, true))
      .all()

    if (allPesqueiros.length === 0) {
      return NextResponse.json({ error: 'No active pesqueiros' }, { status: 404 })
    }

    const lats = allPesqueiros.map(p => p.lat)
    const lons = allPesqueiros.map(p => p.lon)

    // Fetch 7-day forecast
    let weatherData = null
    let marineData = null

    try { weatherData = await fetchWeather(lats, lons) } catch {}
    try { marineData = await fetchMarine(lats, lons) } catch {}

    if (!weatherData) {
      return NextResponse.json({ error: 'Weather data unavailable' }, { status: 503 })
    }

    const now = new Date()
    const navios = getAnchoredShips()

    const configRow = db.select().from(config).where(eq(config.chave, 'pesos')).get()
    const pesosCustom = configRow ? (configRow.valor as Record<string, number>) : DEFAULT_WEIGHTS

    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const result: PesqueiroForecast[] = allPesqueiros.map((p, pIdx) => {
      const weather = weatherData?.[pIdx] ?? weatherData?.[0]
      const marine = marineData?.[pIdx] ?? marineData?.[0]

      const pesqueiroObj: Pesqueiro = {
        id: p.id, slug: p.slug, nome: p.nome, lat: p.lat, lon: p.lon,
        tipo: p.tipo as Pesqueiro['tipo'],
        profundidadeM: p.profundidadeM, distanciaCostaMn: p.distanciaCostaMn,
        especiesAlvo: p.especiesAlvo as string[],
        notas: p.notas,
        pesosOverride: p.pesosOverride as Record<string, number> | null,
      }

      // Calculate score for each hour (up to 168h)
      const totalHours = Math.min(weather?.hourly.length ?? 0, 168)
      const horas: HourForecast[] = []

      for (let h = 0; h < totalHours; h++) {
        const weatherHour = weather?.hourly[h]
        const marineHour = marine?.hourly[h]
        if (!weatherHour) continue

        const forecastTime = new Date(weatherHour.time)
        const astro = getAstronomy(p.lat, p.lon, forecastTime)

        const pressaoSerie = weather?.hourly.slice(Math.max(0, h - 12), h + 1).map(x => x.pressureMsl)
          ?? [weatherHour.pressureMsl]
        const ventoSerie = weather?.hourly.slice(Math.max(0, h - 12), h + 1).map(x => x.windDirection10m)
          ?? [weatherHour.windDirection10m]

        const condicoes = buildCondicoes({
          weather: weatherHour,
          marine: marineHour ?? {
            time: weatherHour.time, waveHeight: 1.0, wavePeriod: 8,
            waveDirection: 180, seaSurfaceTemperature: 22,
          },
          astronomy: astro,
          tideHeight: 1.0, tideFase: 'subindo', tideAmplitude: 1.5,
          pressaoSerie12h: pressaoSerie, ventoSerie12h: ventoSerie,
          naviosFundeados: navios,
          hora: forecastTime.getHours(),
          mes: forecastTime.getMonth() + 1,
        })

        const scoreResult = calculateScore(pesqueiroObj, condicoes, pesosCustom)
        horas.push({
          timestamp: weatherHour.time,
          score: scoreResult.score,
          classificacao: scoreResult.classificacao,
        })
      }

      // Group by day — only fishing hours (05:00 to 14:00)
      const diasMap = new Map<string, HourForecast[]>()
      for (const hora of horas) {
        const h = new Date(hora.timestamp).getHours()
        if (h < 5 || h > 14) continue
        const date = hora.timestamp.split('T')[0]
        if (!diasMap.has(date)) diasMap.set(date, [])
        diasMap.get(date)!.push(hora)
      }

      const dias: DayForecast[] = []
      for (const [date, horasDay] of diasMap) {
        const scores = horasDay.map(h => h.score)
        if (scores.length === 0) continue
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        const max = Math.max(...scores)
        const bestHour = horasDay.find(h => h.score === max)
        const d = new Date(date + 'T12:00:00')
        const isToday = d.toDateString() === now.toDateString()

        let classificacao = 'ruim'
        if (avg >= 90) classificacao = 'excelente'
        else if (avg >= 75) classificacao = 'otimo'
        else if (avg >= 60) classificacao = 'bom'
        else if (avg >= 45) classificacao = 'regular'

        dias.push({
          date,
          label: isToday ? 'Hoje' : `${dayLabels[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
          scoreMedio: avg,
          scoreMax: max,
          classificacao,
          melhorHora: bestHour?.timestamp.split('T')[1]?.slice(0, 5) ?? '',
        })
      }

      const melhorDia = [...dias].sort((a, b) => b.scoreMedio - a.scoreMedio)[0] ?? dias[0]

      return {
        id: p.id, slug: p.slug, nome: p.nome, tipo: p.tipo,
        lat: p.lat, lon: p.lon,
        horas, dias, melhorDia,
      }
    })

    // Ranking do melhor dia geral
    const rankingMelhorDia = result
      .map(p => ({ slug: p.slug, nome: p.nome, ...p.melhorDia }))
      .sort((a, b) => b.scoreMedio - a.scoreMedio)

    return NextResponse.json({
      pesqueiros: result,
      rankingMelhorDia,
      geradoEm: now.toISOString(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
