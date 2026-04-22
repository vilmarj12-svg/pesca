'use client'

import { Star } from 'lucide-react'

interface MatchResult {
  diaIdealId: number
  titulo: string
  matchPercent: number
  fatoresMatch: string[]
  fatoresMiss: string[]
}

export function DiaIdealAlert({ matches }: { matches: MatchResult[] }) {
  if (matches.length === 0) return null

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <div key={m.diaIdealId} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
          <Star className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" fill="currentColor" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                Parecido com: {m.titulo}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                {m.matchPercent}% match
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {m.fatoresMatch.map((f) => (
                <span key={f} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  ✓ {f}
                </span>
              ))}
              {m.fatoresMiss.map((f) => (
                <span key={f} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                  ✗ {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
