'use client'

import { Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatTimestamp } from '@/lib/format'
import type { RunStatus } from '@/lib/types'

function StatusBadge({ status }: { status: string }) {
  if (status === 'sucesso') return (
    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
      <CheckCircle className="w-3.5 h-3.5" /> Online
    </span>
  )
  if (status === 'parcial') return (
    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-3.5 h-3.5" /> Parcial
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
      <XCircle className="w-3.5 h-3.5" /> Erro
    </span>
  )
}

interface DashboardHeaderProps {
  runStatus: RunStatus
  view: 'hoje' | 'semana'
  onViewChange: (view: 'hoje' | 'semana') => void
}

export function DashboardHeader({ runStatus, view, onViewChange }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
          Dashboard
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Condições de pesca no litoral do Paraná
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
          {(['hoje', 'semana'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                view === v
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {v === 'hoje' ? 'Hoje' : 'Semana'}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="font-mono">{formatTimestamp(runStatus.ultimaRun)}</span>
          </div>
          <StatusBadge status={runStatus.status} />
        </div>
      </div>
    </div>
  )
}
