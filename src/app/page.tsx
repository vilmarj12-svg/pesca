'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Clock, CheckCircle, AlertTriangle, XCircle, Trophy, ChevronRight, Calendar } from 'lucide-react'
import { RankingTable } from '@/components/dashboard/RankingTable'
import { EspeciesEmAlta } from '@/components/dashboard/EspeciesEmAlta'
import { IscasEmAlta } from '@/components/dashboard/IscasEmAlta'
import { NaviosRanking } from '@/components/dashboard/NaviosRanking'
import { AlertasNavegacao } from '@/components/dashboard/AlertasNavegacao'
import { DiaIdealAlert } from '@/components/dashboard/DiaIdealAlert'
import { formatTimestamp, getClassificacaoLabel } from '@/lib/format'
import { getScoreBadgeClass } from '@/lib/score-colors'
import type { DashboardData, PesqueiroResumo } from '@/lib/types'
import type { Ship } from '@/components/dashboard/MapaPesqueiros'

const MapaPesqueiros = dynamic(
  () => import('@/components/dashboard/MapaPesqueiros').then(m => ({ default: m.MapaPesqueiros })),
  { ssr: false, loading: () => <div className="h-[320px] sm:h-[400px] lg:h-[450px] rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" /> }
)

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
  dias: DayForecast[]
  melhorDia: DayForecast
}

interface AlertaData {
  tipo: string
  severidade: 'perigo' | 'atencao' | 'aviso'
  titulo: string
  descricao: string
  periodo: string
  icone: string
}

interface MatchResult {
  diaIdealId: number
  titulo: string
  matchPercent: number
  fatoresMatch: string[]
  fatoresMiss: string[]
}

interface ForecastData {
  pesqueiros: PesqueiroForecast[]
  rankingMelhorDia: Array<{ slug: string; nome: string } & DayForecast>
  alertasPorDia: Record<string, AlertaData[]>
  matchesPorDia: Record<string, MatchResult[]>
}

function getDayColor(score: number): string {
  if (score >= 80) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
  if (score >= 60) return 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
  if (score >= 45) return 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
  return 'border-red-500 bg-red-50 dark:bg-red-950/30'
}

function getDayScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-400'
  if (score >= 45) return 'bg-orange-500'
  return 'bg-red-500'
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'sucesso') return (
    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
      <CheckCircle className="w-3.5 h-3.5" /> Online
    </span>
  )
  if (status === 'parcial') return (
    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5" /> Parcial
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
      <XCircle className="w-3.5 h-3.5" /> Erro
    </span>
  )
}

export default function DashboardPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [ships, setShips] = useState<Ship[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadAllData = useCallback(() => {
    return Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/forecast').then(r => r.json()),
      fetch('/api/ships').then(r => r.json()).catch(() => []),
    ]).then(([dash, fc, sh]) => {
      setDashData(dash)
      setForecast(fc)
      if (Array.isArray(sh)) setShips(sh)
      if (!selectedDay && fc?.pesqueiros?.[0]?.dias?.[0]) {
        setSelectedDay(fc.pesqueiros[0].dias[0].date)
      }
      setLastUpdate(new Date())
    }).catch(console.error).finally(() => setLoading(false))
  }, [selectedDay])

  // Initial load
  useEffect(() => { loadAllData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => { loadAllData() }, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadAllData])

  // Build pesqueiro data for selected day
  const dayPesqueiros: PesqueiroResumo[] = useMemo(() => {
    if (!forecast || !selectedDay) return dashData?.pesqueiros ?? []

    const isToday = forecast.pesqueiros[0]?.dias[0]?.date === selectedDay

    // If today, use live dashboard data
    if (isToday) return dashData?.pesqueiros ?? []

    // Otherwise, use forecast data for selected day
    return forecast.pesqueiros
      .map(p => {
        const day = p.dias.find(d => d.date === selectedDay)
        if (!day) return null
        return {
          id: p.id,
          slug: p.slug,
          nome: p.nome,
          lat: p.lat,
          lon: p.lon,
          tipo: p.tipo,
          scoreAtual: day.scoreMedio,
          classificacao: day.classificacao as any,
          proximaJanela: day.melhorHora ? `${day.melhorHora}h (pico ${day.scoreMax})` : null,
        }
      })
      .filter(Boolean) as PesqueiroResumo[]
  }, [forecast, selectedDay, dashData])

  // All days for selector
  const allDays = forecast?.pesqueiros?.[0]?.dias ?? []

  // Average score for each day (across all pesqueiros)
  const dayAverages = useMemo(() => {
    if (!forecast) return new Map<string, number>()
    const map = new Map<string, number>()
    for (const day of allDays) {
      const scores = forecast.pesqueiros.map(p => p.dias.find(d => d.date === day.date)?.scoreMedio ?? 0)
      map.set(day.date, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
    }
    return map
  }, [forecast, allDays])

  const selectedDayLabel = allDays.find(d => d.date === selectedDay)?.label ?? 'Hoje'

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-stone-200 dark:bg-stone-800 rounded-xl" />
          <div className="h-[400px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
          <div className="h-[300px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
        </div>
      </div>
    )
  }

  const mes = new Date().toLocaleString('pt-BR', { month: 'long' })

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-[28px] font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Condições de pesca no litoral do Paraná
          </p>
        </div>
        {dashData?.runStatus && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-stone-400 dark:text-stone-500">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.75} />
              <span className="font-mono">{formatTimestamp(dashData.runStatus.ultimaRun)}</span>
            </div>
            <StatusBadge status={dashData.runStatus.status} />
            <span className="text-[9px] text-stone-300 dark:text-stone-600 hidden sm:inline">auto 10min</span>
          </div>
        )}
      </div>

      {/* Day selector - TOP of page */}
      {allDays.length > 0 && (
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
          {allDays.map((day) => {
            const isSelected = day.date === selectedDay
            const avgScore = dayAverages.get(day.date) ?? 0

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 transition-all cursor-pointer min-w-[64px] sm:min-w-[80px] ${
                  isSelected
                    ? `${getDayColor(avgScore)} shadow-md`
                    : 'border-transparent bg-stone-100 dark:bg-stone-800/50 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                  {day.label}
                </span>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-white ${getDayScoreBg(avgScore)}`}>
                  {avgScore}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Best day highlight */}
      {forecast?.rankingMelhorDia && forecast.rankingMelhorDia.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Melhor dia da semana</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
            {forecast.rankingMelhorDia.slice(0, 5).map((p, i) => (
              <Link key={p.slug} href={`/pesqueiro/${p.slug}`}
                className="flex items-center gap-2 bg-white dark:bg-stone-800 rounded-lg px-2.5 sm:px-3 py-2 border border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 transition-colors">
                <span className="text-xs text-stone-400 font-mono shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{p.nome}</p>
                  <p className="text-[10px] text-stone-500 truncate">{p.label} • melhor às {p.melhorHora}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${getScoreBadgeClass(p.scoreMedio)}`}>
                  {p.scoreMedio}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alertas de navegação do dia selecionado */}
      {forecast?.alertasPorDia && selectedDay && (
        <section className="mb-4 sm:mb-6">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 sm:mb-3">
            ⚠️ Alertas — {selectedDayLabel}
          </h2>
          <AlertasNavegacao alertas={forecast.alertasPorDia[selectedDay] ?? []} />
          {forecast.matchesPorDia?.[selectedDay]?.length > 0 && (
            <div className="mt-3">
              <DiaIdealAlert matches={forecast.matchesPorDia[selectedDay]} />
            </div>
          )}
        </section>
      )}

      {/* Map - scores reflect selected day */}
      <section className="mb-4 sm:mb-6">
        <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 sm:mb-3">
          Mapa — {selectedDayLabel}
        </h2>
        <MapaPesqueiros pesqueiros={dayPesqueiros} />
      </section>

      {/* Ranking - reflects selected day */}
      <section className="mb-4 sm:mb-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Ranking — {selectedDayLabel}
          </h2>
        </div>
        <RankingTable pesqueiros={dayPesqueiros} />
      </section>

      {/* Espécies + Iscas */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <section className="bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stone-100 dark:border-stone-800">
              <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Espécies em alta — {mes}
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <EspeciesEmAlta especies={dashData.especiesEmAlta} />
            </div>
          </section>

          <section className="bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stone-100 dark:border-stone-800">
              <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Iscas em alta
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <IscasEmAlta iscas={dashData.iscasEmAlta} />
            </div>
          </section>
        </div>
      )}

      {/* Navios */}
      {ships.length > 0 && (
        <section className="mb-4 sm:mb-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              🚢 Navios fundeados
            </h2>
          </div>
          <div className="p-3 sm:p-4">
            <NaviosRanking ships={ships} />
          </div>
        </section>
      )}
    </div>
  )
}
