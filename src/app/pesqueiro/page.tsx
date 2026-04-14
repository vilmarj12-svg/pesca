'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getScoreBadgeClass } from '@/lib/score-colors'
import { getClassificacaoLabel } from '@/lib/format'
import type { DashboardData } from '@/lib/types'

export default function PesqueirosPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        ))}
      </div>
    )
  }

  const sorted = [...data.pesqueiros].sort((a, b) => b.scoreAtual - a.scoreAtual)

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display mb-4 sm:mb-6">
        Pesqueiros
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sorted.map((p) => (
          <Link
            key={p.id}
            href={`/pesqueiro/${p.slug}`}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div className="shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-500" strokeWidth={1.75} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{p.nome}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getScoreBadgeClass(p.scoreAtual)}`}>
                  {p.scoreAtual}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {getClassificacaoLabel(p.classificacao)}
                {p.proximaJanela ? ` • ${p.proximaJanela}` : ''}
              </p>
              <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
                {p.lat.toFixed(4)}, {p.lon.toFixed(4)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
