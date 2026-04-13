'use client'

import Link from 'next/link'
import { getHeatColor } from '@/lib/score-colors'
import type { HeatmapPesqueiro, PesqueiroResumo } from '@/lib/types'

interface HeatmapSemanalProps {
  heatmap: HeatmapPesqueiro[]
  pesqueiros: PesqueiroResumo[]
}

function getDayLabels(): string[] {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = new Date().getDay()
  const labels = ['Hoje']
  for (let i = 1; i < 7; i++) {
    labels.push(days[(today + i) % 7])
  }
  return labels
}

export function HeatmapSemanal({ heatmap, pesqueiros }: HeatmapSemanalProps) {
  const dayLabels = getDayLabels()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex ml-[120px] mb-2">
          {dayLabels.map((day, i) => (
            <div key={i} className="flex-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400 tracking-wide">{day}</div>
          ))}
        </div>
        {heatmap.map((row) => {
          const slug = pesqueiros.find((p) => p.id === row.pesqueiroId)?.slug
          const scores = row.horas.map((h) => h.score)
          return (
            <div key={row.pesqueiroId} className="flex items-center mb-1 group">
              {slug ? (
                <Link href={`/pesqueiro/${slug}`}
                  className="w-[120px] text-xs font-semibold text-stone-700 dark:text-stone-300 text-right pr-3 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {row.nome}
                </Link>
              ) : (
                <span className="w-[120px] text-xs font-semibold text-stone-700 dark:text-stone-300 text-right pr-3 truncate">{row.nome}</span>
              )}
              <div className="flex-1 flex gap-px">
                {Array.from({ length: 7 }).map((_, dayIdx) => (
                  <div key={dayIdx} className="flex-1 flex gap-px">
                    {Array.from({ length: 24 }).map((_, hourIdx) => {
                      const idx = dayIdx * 24 + hourIdx
                      const score = scores[idx] ?? 0
                      return (
                        <div
                          key={hourIdx}
                          className={`h-4 flex-1 rounded-[1px] ${getHeatColor(score)} opacity-80 hover:opacity-100 transition-opacity`}
                          title={`${dayLabels[dayIdx]} ${hourIdx}:00 — Score ${Math.round(score)}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-2 ml-[120px]">
          Hover numa célula para ver o score. Click no nome para ver detalhes.
        </p>
      </div>
    </div>
  )
}
