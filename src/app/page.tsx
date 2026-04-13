'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { RankingTable } from '@/components/dashboard/RankingTable'
import { EspeciesEmAlta } from '@/components/dashboard/EspeciesEmAlta'
import { IscasEmAlta } from '@/components/dashboard/IscasEmAlta'
import { HeatmapSemanal } from '@/components/dashboard/HeatmapSemanal'
import type { DashboardData } from '@/lib/types'

const MapaPesqueiros = dynamic(
  () => import('@/components/dashboard/MapaPesqueiros').then(m => ({ default: m.MapaPesqueiros })),
  { ssr: false, loading: () => <div className="h-[320px] sm:h-[400px] lg:h-[450px] rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" /> }
)

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [view, setView] = useState<'hoje' | 'semana'>('hoje')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-48" />
          <div className="h-[400px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
          <div className="h-[300px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
        </div>
      </div>
    )
  }

  const mes = new Date().toLocaleString('pt-BR', { month: 'long' })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader runStatus={data.runStatus} view={view} onViewChange={setView} />

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
          Mapa do litoral PR
        </h2>
        <MapaPesqueiros pesqueiros={data.pesqueiros} />
      </section>

      <section className="mb-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Ranking — agora
          </h2>
        </div>
        <RankingTable pesqueiros={data.pesqueiros} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Espécies em alta — {mes}
            </h2>
          </div>
          <div className="p-4">
            <EspeciesEmAlta especies={data.especiesEmAlta} />
          </div>
        </section>

        <section className="bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Iscas em alta
            </h2>
          </div>
          <div className="p-4">
            <IscasEmAlta iscas={data.iscasEmAlta} />
          </div>
        </section>
      </div>

      {data.heatmap.length > 0 && (
        <section className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Próximos 7 dias
            </h2>
          </div>
          <div className="p-4">
            <HeatmapSemanal heatmap={data.heatmap} pesqueiros={data.pesqueiros} />
          </div>
        </section>
      )}
    </div>
  )
}
