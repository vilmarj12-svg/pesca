'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import type { PesqueiroAdmin } from '@/lib/types'

const tipoColors: Record<string, string> = {
  naufragio: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  parcel: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  laje: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  cascalho: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  pedra: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  offshore: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  fundeadouro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  baia: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  canal: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
}

interface Props {
  pesqueiros: PesqueiroAdmin[]
  token: string
  onRefresh: () => void
}

export function PesqueirosManager({ pesqueiros, token, onRefresh }: Props) {
  async function handleToggle(id: number, currentAtivo: boolean) {
    await fetch(`/api/admin/pesqueiros/${id}?token=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !currentAtivo }),
    })
    onRefresh()
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Pesqueiros ({pesqueiros.length})</h2>
      </div>
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {pesqueiros.map((p) => (
          <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${!p.ativo ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{p.nome}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${tipoColors[p.tipo] || tipoColors.offshore}`}>{p.tipo}</span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 font-mono">
                {p.lat.toFixed(4)}, {p.lon.toFixed(4)}
                {p.profundidadeM && ` • ${p.profundidadeM}m`}
                {p.distanciaCostaMn && ` • ${p.distanciaCostaMn}mn`}
              </p>
            </div>
            <button onClick={() => handleToggle(p.id, p.ativo)} className="cursor-pointer">
              {p.ativo ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-stone-300 dark:text-stone-600" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
