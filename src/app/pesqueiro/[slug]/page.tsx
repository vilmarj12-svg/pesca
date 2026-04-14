'use client'

import { useState, useEffect, use } from 'react'
import { PesqueiroHeader } from '@/components/pesqueiro/PesqueiroHeader'
import { Score72h } from '@/components/pesqueiro/Score72h'
import { BreakdownChart } from '@/components/pesqueiro/BreakdownChart'
import { CondicoesTable } from '@/components/pesqueiro/CondicoesTable'
import type { DetalhePesqueiroData } from '@/lib/types'

export default function PesqueiroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [data, setData] = useState<DetalhePesqueiroData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/pesqueiro/${slug}`)
      .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [slug])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500">Pesqueiro não encontrado.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-48" />
        <div className="h-[180px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-[300px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <PesqueiroHeader pesqueiro={data.pesqueiro} breakdown={data.breakdown} />

      <section className="mb-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Score — Próximas 72h</h2>
        </div>
        <div className="p-4">
          <Score72h snapshots={data.grafico72h} />
        </div>
      </section>

      <section className="mb-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Por que tá {data.breakdown.score}?</h2>
        </div>
        <div className="p-4">
          <BreakdownChart fatores={data.breakdown.fatores} score={data.breakdown.score} safetyOverride={data.breakdown.safetyOverride} />
        </div>
      </section>

      <section className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Condições brutas — Próximas 24h</h2>
        </div>
        <CondicoesTable condicoes={data.condicoes24h} />
      </section>
    </div>
  )
}
