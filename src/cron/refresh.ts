import { db } from '@/db'
import { pesqueiros, snapshots, runs, config, alertasEnviados } from '@/db/schema'
import { eq, desc, gte } from 'drizzle-orm'
import { fetchWeather } from '@/fetchers/open-meteo'
import { fetchMarine } from '@/fetchers/open-meteo-marine'
import { getAstronomy } from '@/fetchers/astronomy'
import { getAnchoredShips, cleanupStaleShips } from '@/fetchers/ais'
import { buildCondicoes } from './build-condicoes'
import { calculateScore } from '@/engine/score'
import { DEFAULT_WEIGHTS, ALERT_THRESHOLD } from '@/engine/constants'
import { findWindows } from '@/engine/windows'
import { sendMessage } from '@/telegram/send'
import { buildAlertMessage, shouldSendAlert, isQuietHours } from '@/telegram/alert'
import type { Pesqueiro } from '@/engine/types'

export async function runRefresh(): Promise<{
  runId: number
  status: 'sucesso' | 'parcial' | 'erro'
  pesqueirosProcessados: number
  alertasEnviados?: number
  erro?: string
}> {
  const rows = db.insert(runs).values({ status: 'sucesso' }).returning().all()
  const run = rows[0]

  const fontes: Record<string, string> = {}
  let weatherData = null
  let marineData = null

  try {
    const allPesqueiros = db
      .select()
      .from(pesqueiros)
      .where(eq(pesqueiros.ativo, true))
      .all()

    if (allPesqueiros.length === 0) {
      db.update(runs)
        .set({ terminadoEm: new Date().toISOString(), status: 'erro', erro: 'No active pesqueiros' })
        .where(eq(runs.id, run.id))
        .run()
      return { runId: run.id, status: 'erro', pesqueirosProcessados: 0, erro: 'No active pesqueiros' }
    }

    const lats = allPesqueiros.map(p => p.lat)
    const lons = allPesqueiros.map(p => p.lon)

    // Fetch weather
    try {
      weatherData = await fetchWeather(lats, lons)
      fontes['open_meteo'] = 'ok'
    } catch (e) {
      fontes['open_meteo'] = 'falha'
      console.error('Open-Meteo Forecast failed:', e)
    }

    // Fetch marine
    try {
      marineData = await fetchMarine(lats, lons)
      fontes['marine'] = 'ok'
    } catch (e) {
      fontes['marine'] = 'falha'
      console.error('Open-Meteo Marine failed:', e)
    }

    // If both failed, mark run as error
    if (!weatherData && !marineData) {
      db.update(runs)
        .set({
          terminadoEm: new Date().toISOString(),
          status: 'erro',
          fontesConsultadas: fontes,
          erro: 'Both weather sources failed',
        })
        .where(eq(runs.id, run.id))
        .run()
      return { runId: run.id, status: 'erro', pesqueirosProcessados: 0, erro: 'Both sources failed' }
    }

    // Astronomy (local calc, never fails)
    const now = new Date()
    const astro = getAstronomy(lats[0], lons[0], now)
    fontes['astronomia'] = 'ok'

    // AIS ships
    let navios: ReturnType<typeof getAnchoredShips> = []
    try {
      cleanupStaleShips()
      navios = getAnchoredShips()
      fontes['ais'] = navios.length > 0 ? 'ok' : 'vazio'
    } catch {
      fontes['ais'] = 'falha'
    }

    // Load custom weights
    const configRow = db.select().from(config).where(eq(config.chave, 'pesos')).get()
    const pesosCustom = configRow ? (configRow.valor as Record<string, number>) : DEFAULT_WEIGHTS

    // Process each pesqueiro
    const hora = now.getHours()
    const mes = now.getMonth() + 1
    let processados = 0

    for (let i = 0; i < allPesqueiros.length; i++) {
      const p = allPesqueiros[i]
      const weather = weatherData?.[i] ?? weatherData?.[0]
      const marine = marineData?.[i] ?? marineData?.[0]

      if (!weather && !marine) continue

      const weatherHour = weather?.hourly[0]
      const marineHour = marine?.hourly[0]

      if (!weatherHour) continue

      // Build pressure/wind series (first 12 hours of forecast)
      const pressaoSerie = weather?.hourly.slice(0, 12).map(h => h.pressureMsl)
        ?? Array(12).fill(weatherHour.pressureMsl)
      const ventoSerie = weather?.hourly.slice(0, 12).map(h => h.windDirection10m)
        ?? Array(12).fill(weatherHour.windDirection10m)

      const condicoes = buildCondicoes({
        weather: weatherHour,
        marine: marineHour ?? {
          time: weatherHour.time,
          waveHeight: 1.0,
          wavePeriod: 8,
          waveDirection: 180,
          seaSurfaceTemperature: 22,
        },
        astronomy: astro,
        tideHeight: 1.0,
        tideFase: 'subindo',
        tideAmplitude: 1.5,
        pressaoSerie12h: pressaoSerie,
        ventoSerie12h: ventoSerie,
        naviosFundeados: navios,
        hora,
        mes,
      })

      const pesqueiroObj: Pesqueiro = {
        id: p.id,
        slug: p.slug,
        nome: p.nome,
        lat: p.lat,
        lon: p.lon,
        tipo: p.tipo as Pesqueiro['tipo'],
        profundidadeM: p.profundidadeM,
        distanciaCostaMn: p.distanciaCostaMn,
        especiesAlvo: p.especiesAlvo as string[],
        notas: p.notas,
        pesosOverride: p.pesosOverride as Record<string, number> | null,
      }

      const result = calculateScore(pesqueiroObj, condicoes, pesosCustom)

      db.insert(snapshots).values({
        pesqueiroId: p.id,
        timestamp: now.toISOString(),
        score: result.score,
        classificacao: result.classificacao,
        breakdown: result as unknown as Record<string, unknown>,
        condicoes: condicoes as unknown as Record<string, unknown>,
        fonteRunId: run.id,
      }).run()

      processados++
    }

    // Check for excellent windows and send alerts
    let alertasEnviadosCount = 0
    const currentHour = now.getHours()

    if (!isQuietHours(currentHour)) {
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayAlerts = db
        .select()
        .from(alertasEnviados)
        .where(gte(alertasEnviados.enviadoEm, todayStart.toISOString()))
        .all()

      for (const p of allPesqueiros) {
        const recentSnaps = db
          .select()
          .from(snapshots)
          .where(eq(snapshots.pesqueiroId, p.id))
          .orderBy(desc(snapshots.id))
          .limit(72)
          .all()

        const windows = findWindows(
          recentSnaps.map((s) => ({
            pesqueiroId: s.pesqueiroId,
            timestamp: s.timestamp,
            score: s.score,
            classificacao: s.classificacao as any,
          }))
        )

        for (const w of windows) {
          if (w.scoreMedio < ALERT_THRESHOLD) continue

          const existing = todayAlerts
            .filter((a) => a.pesqueiroId === p.id)
            .map((a) => ({
              scoreMedio: a.scoreMedio,
              janelaInicio: a.janelaInicio,
              janelaFim: a.janelaFim,
            }))

          if (!shouldSendAlert(w.scoreMedio, existing, todayAlerts.length)) continue

          const latestBreakdown = recentSnaps[0]?.breakdown as Record<string, any> | undefined
          const fatores = (latestBreakdown?.fatores as any[]) ?? []

          const startDate = new Date(w.inicio)
          const endDate = new Date(w.fim)
          const janelaDesc = `${startDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}, ${startDate.getHours().toString().padStart(2, '0')}:00-${endDate.getHours().toString().padStart(2, '0')}:00`

          const text = buildAlertMessage(p.nome, w.scoreMedio, janelaDesc, fatores)
          const sent = await sendMessage(text)

          if (sent) {
            db.insert(alertasEnviados).values({
              pesqueiroId: p.id,
              janelaInicio: w.inicio,
              janelaFim: w.fim,
              scoreMedio: w.scoreMedio,
            }).run()
            alertasEnviadosCount++
          }
        }
      }
    }

    const status = fontes['open_meteo'] === 'ok' && fontes['marine'] === 'ok' ? 'sucesso' : 'parcial'

    db.update(runs)
      .set({
        terminadoEm: new Date().toISOString(),
        status,
        fontesConsultadas: fontes,
      })
      .where(eq(runs.id, run.id))
      .run()

    return { runId: run.id, status, pesqueirosProcessados: processados, alertasEnviados: alertasEnviadosCount }

  } catch (e) {
    const erro = e instanceof Error ? e.message : String(e)
    db.update(runs)
      .set({
        terminadoEm: new Date().toISOString(),
        status: 'erro',
        fontesConsultadas: fontes,
        erro,
      })
      .where(eq(runs.id, run.id))
      .run()
    return { runId: run.id, status: 'erro', pesqueirosProcessados: 0, erro }
  }
}
