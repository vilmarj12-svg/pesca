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
  if (hours >= 48) return 'bg-emerald-500 text-white'
  if (hours >= 24) return 'bg-green-500 text-white'
  if (hours >= 12) return 'bg-yellow-500 text-yellow-900'
  if (hours >= 6) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

function getTimeBg(hours: number): string {
  if (hours >= 48) return 'border-l-emerald-500'
  if (hours >= 24) return 'border-l-green-500'
  if (hours >= 12) return 'border-l-yellow-500'
  if (hours >= 6) return 'border-l-orange-500'
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
