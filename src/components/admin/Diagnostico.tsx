'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface RunInfo {
  id: number
  iniciadoEm: string
  terminadoEm: string | null
  status: string
  fontesConsultadas: Record<string, string> | null
  erro: string | null
}

interface Props {
  ultimaRun: RunInfo | null
  totalPesqueiros: number
  pesqueirosAtivos: number
  token: string
}

export function Diagnostico({ ultimaRun, totalPesqueiros, pesqueirosAtivos, token }: Props) {
  const [refreshing, setRefreshing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleRefresh() {
    setRefreshing(true)
    setResult(null)
    try {
      const r = await fetch(`/api/admin/refresh?token=${token}`, { method: 'POST' })
      const data = await r.json()
      setResult(`${data.status} — ${data.pesqueirosProcessados} pesqueiros processados`)
    } catch {
      setResult('Erro ao forçar refresh')
    }
    setRefreshing(false)
  }

  const StatusIcon = ultimaRun?.status === 'sucesso' ? CheckCircle : ultimaRun?.status === 'parcial' ? AlertTriangle : XCircle
  const statusColor = ultimaRun?.status === 'sucesso' ? 'text-emerald-500' : ultimaRun?.status === 'parcial' ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Diagnóstico</h2>
      </div>
      <div className="p-4 space-y-4">
        {ultimaRun && (
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Última execução</p>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{ultimaRun.status}</span>
              <span className="text-xs text-stone-400 font-mono">{ultimaRun.iniciadoEm}</span>
            </div>
            {ultimaRun.fontesConsultadas && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(ultimaRun.fontesConsultadas).map(([fonte, status]) => (
                  <span key={fonte} className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${status === 'ok' ? 'bg-emerald-100 text-emerald-700' : status === 'falha' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>
                    {fonte}: {status}
                  </span>
                ))}
              </div>
            )}
            {ultimaRun.erro && <p className="text-xs text-red-500 mt-1">{ultimaRun.erro}</p>}
          </div>
        )}
        <div className="flex gap-4 text-sm">
          <div><span className="text-stone-400 text-xs">Total:</span> <span className="font-semibold">{totalPesqueiros}</span></div>
          <div><span className="text-stone-400 text-xs">Ativos:</span> <span className="font-semibold text-emerald-600">{pesqueirosAtivos}</span></div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Executando...' : 'Forçar Refresh'}
        </button>
        {result && <p className="text-xs text-stone-500">{result}</p>}
      </div>
    </div>
  )
}
