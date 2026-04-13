import { Fish, Anchor } from 'lucide-react'
import type { EspecieEmAltaView } from '@/lib/types'

function getIntensidadeBadge(i: string) {
  if (i === 'alta') return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', icon: '🔥', label: 'Em alta' }
  if (i === 'media') return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', icon: '📈', label: 'Subindo' }
  return { color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400', icon: '📉', label: 'Baixa' }
}

export function EspeciesEmAlta({ especies }: { especies: EspecieEmAltaView[] }) {
  return (
    <div className="space-y-3">
      {especies.map((e) => {
        const badge = getIntensidadeBadge(e.intensidade)
        return (
          <div key={e.especie} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className="shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                <Fish className="w-4.5 h-4.5 text-blue-500" strokeWidth={1.75} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{e.especie}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${badge.color}`}>{badge.icon} {badge.label}</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">{e.motivo}</p>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {e.iscas.map((isca) => (
                  <span key={isca} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">🪝 {isca}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500">
                <Anchor className="w-3 h-3" />
                <span>{e.pesqueiros.slice(0, 3).join(', ')}</span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 italic">Técnica: {e.tecnica}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
