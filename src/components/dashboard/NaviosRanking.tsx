'use client'

import { Ship } from './MapaPesqueiros'

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

export function NaviosRanking({ ships }: { ships: Ship[] }) {
  const anchored = ships
    .filter((s) => s.status === 'at_anchor' || s.status === 'fundeado' || s.status === 'atracado')
    .map((s) => ({ ...s, hours: getAnchorHours(s.primeiroVistoEm) }))
    .sort((a, b) => b.hours - a.hours)

  if (anchored.length === 0) {
    return <p className="text-sm text-stone-400 dark:text-stone-500">Nenhum navio fundeado no momento.</p>
  }

  return (
    <div className="space-y-2">
      {anchored.map((s, i) => (
        <div
          key={s.mmsi}
          className={`flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 border-l-4 ${getTimeBg(s.hours)}`}
        >
          <span className="text-xs text-stone-400 font-mono w-5 shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
              {s.nomeNavio || `MMSI ${s.mmsi}`}
            </p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
              {s.lat.toFixed(4)}, {s.lon.toFixed(4)} • {s.status === 'atracado' ? 'Atracado' : 'Fundeado'}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-md text-xs font-bold shrink-0 ${getTimeColor(s.hours)}`}>
            {formatDuration(s.hours)}
          </span>
        </div>
      ))}
      <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1">
        Verde = mais tempo fundeado (melhor pra pesca). Vermelho = recém chegou.
      </p>
    </div>
  )
}
