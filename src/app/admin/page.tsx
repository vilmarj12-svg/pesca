'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { PesqueirosManager } from '@/components/admin/PesqueirosManager'
import { PesosEditor } from '@/components/admin/PesosEditor'
import { Diagnostico } from '@/components/admin/Diagnostico'
import { DEFAULT_WEIGHTS } from '@/engine/constants'
import type { PesqueiroAdmin } from '@/lib/types'

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Carregando...</div>}>
      <AdminPage />
    </Suspense>
  )
}

function AdminPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [pesqueiros, setPesqueiros] = useState<PesqueiroAdmin[]>([])
  const [pesos, setPesos] = useState<Record<string, number>>(DEFAULT_WEIGHTS)
  const [ultimaRun, setUltimaRun] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'unauthorized'>('loading')

  const loadData = useCallback(async () => {
    try {
      const [pesqRes, configRes] = await Promise.all([
        fetch(`/api/admin/pesqueiros?token=${token}`),
        fetch(`/api/admin/config?token=${token}`),
      ])
      if (pesqRes.status === 401) { setStatus('unauthorized'); return }
      const pesqData = await pesqRes.json()
      const configData = await configRes.json()
      setPesqueiros(pesqData.map((p: any) => ({
        id: p.id, slug: p.slug, nome: p.nome, lat: p.lat, lon: p.lon,
        tipo: p.tipo, profundidadeM: p.profundidadeM ?? p.profundidade_m,
        distanciaCostaMn: p.distanciaCostaMn ?? p.distancia_costa_mn,
        especiesAlvo: p.especiesAlvo ?? p.especies_alvo ?? [],
        notas: p.notas, ativo: p.ativo,
      })))
      setPesos(configData.pesos || DEFAULT_WEIGHTS)
      setStatus('ok')
    } catch (e) {
      console.error(e)
      setStatus('unauthorized')
    }
  }, [token])

  useEffect(() => { loadData() }, [loadData])

  if (status === 'loading') {
    return (
      <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-48" />
        <div className="h-[200px] bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </div>
    )
  }

  if (status === 'unauthorized') {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500 mb-2">Acesso não autorizado.</p>
        <p className="text-xs text-stone-400">Acesse com <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono">/admin?token=SEU_TOKEN</code></p>
      </div>
    )
  }

  const ativos = pesqueiros.filter((p) => p.ativo).length

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
        Administração
      </h1>
      <Diagnostico ultimaRun={ultimaRun} totalPesqueiros={pesqueiros.length} pesqueirosAtivos={ativos} token={token} />
      <PesosEditor pesos={pesos} token={token} onSaved={loadData} />
      <PesqueirosManager pesqueiros={pesqueiros} token={token} onRefresh={loadData} />
    </div>
  )
}
