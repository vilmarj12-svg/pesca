'use client'

import type { AlertaSeveridade } from '@/lib/alertas-navegacao'

interface Alerta {
  tipo: string
  severidade: AlertaSeveridade
  titulo: string
  descricao: string
  periodo: string
  icone: string
}

const severidadeStyle: Record<AlertaSeveridade, { bg: string; border: string; title: string; text: string }> = {
  perigo: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-800',
    title: 'text-red-800 dark:text-red-200',
    text: 'text-red-700 dark:text-red-300',
  },
  atencao: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
    title: 'text-amber-800 dark:text-amber-200',
    text: 'text-amber-700 dark:text-amber-300',
  },
  aviso: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    title: 'text-blue-800 dark:text-blue-200',
    text: 'text-blue-700 dark:text-blue-300',
  },
}

const severidadeLabel: Record<AlertaSeveridade, string> = {
  perigo: '🔴 PERIGO',
  atencao: '🟡 ATENÇÃO',
  aviso: '🔵 AVISO',
}

export function AlertasNavegacao({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <span className="text-lg">✅</span>
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Sem alertas — condições favoráveis para navegação
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alertas.map((a, i) => {
        const style = severidadeStyle[a.severidade]
        return (
          <div key={i} className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{a.icone}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${style.title}`}>{a.titulo}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20">
                    {severidadeLabel[a.severidade]}
                  </span>
                </div>
                <p className={`text-xs ${style.text} mb-1.5`}>{a.descricao}</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{a.periodo}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
