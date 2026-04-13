'use client'

import { useState, useEffect } from 'react'
import { Ship, Anchor, Navigation } from 'lucide-react'
import type { Ship as ShipType } from '@/components/dashboard/MapaPesqueiros'

function getAnchorHours(primeiroVistoEm: string): number {
  return Math.max(0, (Date.now() - new Date(primeiroVistoEm).getTime()) / 3600000)
}

function formatDuration(hours: number): string {
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const h = Math.floor(hours % 24)
    return `${days}d ${h}h`
  }
  return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}min`
}

function getTimeColor(hours: number): string {
  const days = hours / 24
  if (days >= 6) return 'bg-emerald-900 text-white'
  if (days >= 5) return 'bg-emerald-800 text-white'
  if (days >= 4) return 'bg-emerald-700 text-white'
  if (days >= 3) return 'bg-emerald-600 text-white'
  if (days >= 2) return 'bg-yellow-500 text-yellow-900'
  if (days >= 1) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

function getTimeBg(hours: number): string {
  const days = hours / 24
  if (days >= 6) return 'border-l-emerald-900'
  if (days >= 5) return 'border-l-emerald-800'
  if (days >= 4) return 'border-l-emerald-700'
  if (days >= 3) return 'border-l-emerald-600'
  if (days >= 2) return 'border-l-yellow-500'
  if (days >= 1) return 'border-l-orange-500'
  return 'border-l-red-500'
}

function getStatusIcon(status: string) {
  if (status === 'at_anchor' || status === 'fundeado') return <Anchor className="w-4 h-4 text-blue-500" />
  if (status === 'atracado') return <Ship className="w-4 h-4 text-purple-500" />
  return <Navigation className="w-4 h-4 text-stone-400" />
}

function getStatusLabel(status: string) {
  if (status === 'at_anchor' || status === 'fundeado') return 'Fundeado'
  if (status === 'atracado') return 'Atracado'
  return 'Navegando'
}

export default function NaviosPage() {
  const [ships, setShips] = useState<ShipType[]>([])
  const [filter, setFilter] = useState<'todos' | 'fundeados' | 'atracados' | 'navegando'>('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ships')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setShips(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        ))}
      </div>
    )
  }

  const filtered = ships.filter((s) => {
    if (filter === 'todos') return true
    if (filter === 'fundeados') return s.status === 'at_anchor' || s.status === 'fundeado'
    if (filter === 'atracados') return s.status === 'atracado'
    if (filter === 'navegando') return s.status === 'navegando'
    return true
  })

  const sorted = [...filtered]
    .map((s) => ({ ...s, hours: getAnchorHours(s.primeiroVistoEm) }))
    .sort((a, b) => b.hours - a.hours)

  const totalAnchored = ships.filter((s) => s.status === 'at_anchor' || s.status === 'fundeado').length
  const totalDocked = ships.filter((s) => s.status === 'atracado').length
  const totalSailing = ships.filter((s) => s.status === 'navegando').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Ship className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
          Navios
        </h1>
      </div>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
        {ships.length} navios na região do porto de Paranaguá
      </p>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'todos', label: 'Todos', count: ships.length },
          { id: 'fundeados', label: '⚓ Fundeados', count: totalAnchored },
          { id: 'atracados', label: '🚢 Atracados', count: totalDocked },
          { id: 'navegando', label: '🧭 Navegando', count: totalSailing },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === f.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {f.label} <span className={`ml-1 ${filter === f.id ? 'opacity-80' : 'opacity-60'}`}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Ships list */}
      <div className="space-y-2">
        {sorted.map((s, i) => (
          <div
            key={s.mmsi}
            className={`flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 border-l-4 ${getTimeBg(s.hours)}`}
          >
            <span className="text-xs text-stone-400 font-mono w-6 shrink-0">{i + 1}</span>
            <div className="shrink-0">
              {getStatusIcon(s.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {s.nomeNavio || `MMSI ${s.mmsi}`}
                </p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700">
                  {getStatusLabel(s.status)}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">
                MMSI {s.mmsi} • {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
              </p>
            </div>
            {(s.status === 'at_anchor' || s.status === 'fundeado' || s.status === 'atracado') && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold shrink-0 ${getTimeColor(s.hours)}`}>
                {formatDuration(s.hours)}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-4 text-center">
        Fonte: VesselFinder + MyShipTracking. Atualiza a cada hora.
      </p>
    </div>
  )
}
