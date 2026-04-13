import type { FatorBreakdownView } from '@/lib/types'

function getBarColor(contribuicao: number, peso: number) {
  const ratio = peso > 0 ? contribuicao / peso : 0
  if (ratio >= 0.85) return 'bg-emerald-500'
  if (ratio >= 0.6) return 'bg-amber-400'
  return 'bg-red-500'
}

export function BreakdownChart({ fatores, score, safetyOverride }: { fatores: FatorBreakdownView[]; score: number; safetyOverride: boolean }) {
  if (safetyOverride) {
    return (
      <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm">
          <span className="text-xl">⛈️</span>
          TEMPESTADE — Score zerado por segurança
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          CAPE acima de 1000 J/kg detectado. Risco de raios. Pesca embarcada desaconselhada.
        </p>
      </div>
    )
  }

  const sorted = [...fatores].sort((a, b) => b.contribuicao - a.contribuicao)
  const maxContribuicao = Math.max(...fatores.map(f => f.contribuicao), 1)

  return (
    <div className="space-y-2.5">
      {sorted.map((f) => (
        <div key={f.nome} className="flex items-center gap-3">
          <div className="w-[100px] sm:w-[130px] text-right">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-300">{f.nome}</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getBarColor(f.contribuicao, f.peso)} transition-all`}
                style={{ width: `${(f.contribuicao / maxContribuicao) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-12 text-right tabular-nums font-mono">
              +{f.contribuicao.toFixed(1)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 w-[120px] sm:w-[180px] truncate">{f.valorBruto}</span>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2 border-t border-stone-200 dark:border-stone-700">
        <div className="w-[100px] sm:w-[130px] text-right">
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Total</span>
        </div>
        <div className="flex-1" />
        <span className="text-sm font-black text-stone-900 dark:text-stone-100 w-12 text-right font-mono">{score}</span>
        <span className="w-[120px] sm:w-[180px]" />
      </div>
    </div>
  )
}
