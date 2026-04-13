'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Trophy, Clock, ChevronRight } from 'lucide-react'
import { getScoreBadgeClass } from '@/lib/score-colors'
import { getClassificacaoLabel } from '@/lib/format'

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
  dias: DayForecast[]
  melhorDia: DayForecast
}

interface ForecastData {
  pesqueiros: PesqueiroForecast[]
  rankingMelhorDia: Array<{ slug: string; nome: string; date: string; label: string; scoreMedio: number; scoreMax: number; classificacao: string; melhorHora: string }>
}

function getDayScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-400'
  if (score >= 45) return 'bg-orange-500'
  return 'bg-red-500'
}

function getDayBorder(score: number): string {
  if (score >= 80) return 'border-emerald-500'
  if (score >= 60) return 'border-amber-400'
  if (score >= 45) return 'border-orange-500'
  return 'border-red-500'
}

export function Previsao7Dias() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/forecast')
      .then(r => r.json())
      .then(d => {
        setData(d)
        if (d.pesqueiros?.[0]?.dias?.[0]) {
          setSelectedDay(d.pesqueiros[0].dias[0].date)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex gap-2">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-16 flex-1 bg-stone-200 dark:bg-stone-800 rounded-lg" />)}</div>
        <div className="h-[300px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </div>
    )
  }

  if (!data || !data.pesqueiros?.length) {
    return <p className="text-sm text-stone-400">Previsão indisponível. Execute o refresh primeiro.</p>
  }

  // Get all unique days
  const allDays = data.pesqueiros[0]?.dias ?? []
  const currentDay = selectedDay ?? allDays[0]?.date

  // Ranking for selected day
  const dayRanking = data.pesqueiros
    .map(p => {
      const day = p.dias.find(d => d.date === currentDay)
      return day ? { slug: p.slug, nome: p.nome, tipo: p.tipo, ...day } : null
    })
    .filter(Boolean)
    .sort((a, b) => b!.scoreMedio - a!.scoreMedio) as Array<{ slug: string; nome: string; tipo: string; date: string; label: string; scoreMedio: number; scoreMax: number; classificacao: string; melhorHora: string }>

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allDays.map((day) => {
          const isSelected = day.date === currentDay
          // Average score across all pesqueiros for this day
          const dayScores = data.pesqueiros.map(p => p.dias.find(d => d.date === day.date)?.scoreMedio ?? 0)
          const avgScore = Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length)

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day.date)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer min-w-[80px] ${
                isSelected
                  ? `${getDayBorder(avgScore)} bg-white dark:bg-stone-800 shadow-md`
                  : 'border-transparent bg-stone-100 dark:bg-stone-800/50 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{day.label}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getDayScoreColor(avgScore)}`}>
                {avgScore}
              </span>
            </button>
          )
        })}
      </div>

      {/* Best day overall */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Melhor dia da semana</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.rankingMelhorDia.slice(0, 5).map((p, i) => (
            <Link key={p.slug} href={`/pesqueiro/${p.slug}`}
              className="flex items-center gap-2 bg-white dark:bg-stone-800 rounded-lg px-3 py-2 border border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 transition-colors">
              <span className="text-xs text-stone-400 font-mono">{i + 1}.</span>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{p.nome}</p>
                <p className="text-[10px] text-stone-500">{p.label} • melhor às {p.melhorHora}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getScoreBadgeClass(p.scoreMedio)}`}>
                {p.scoreMedio}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Day ranking */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-stone-400" />
          <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            {allDays.find(d => d.date === currentDay)?.label ?? 'Hoje'} — ranking por pesqueiro
          </h3>
        </div>

        <div className="space-y-2">
          {dayRanking.map((p, i) => (
            <Link key={p.slug} href={`/pesqueiro/${p.slug}`}
              className={`flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors border-l-4 ${getDayBorder(p.scoreMedio)}`}
            >
              <span className="text-xs text-stone-400 font-mono w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{p.nome}</p>
                <div className="flex items-center gap-2 text-[10px] text-stone-400">
                  <span>{getClassificacaoLabel(p.classificacao)}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>Melhor às {p.melhorHora}</span>
                  <span>•</span>
                  <span>Pico {p.scoreMax}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getScoreBadgeClass(p.scoreMedio)}`}>
                  {p.scoreMedio}
                </span>
                <p className="text-[9px] text-stone-400 mt-0.5">média</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
