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
  const [unauthorized, setUnauthorized] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [pesqRes, configRes] = await Promise.all([
        fetch(`/api/admin/pesqueiros?token=${token}`),
        fetch(`/api/admin/config?token=${token}`),
      ])
      if (pesqRes.status === 401) { setUnauthorized(true); return }
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
    } catch (e) { console.error(e) }
  }, [token])

  useEffect(() => { loadData() }, [loadData])

  if (unauthorized) {
    return <div className="p-8 text-center text-stone-500">Acesso não autorizado. Verifique o token.</div>
  }

  const ativos = pesqueiros.filter((p) => p.ativo).length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
        Administração
      </h1>
      <Diagnostico ultimaRun={ultimaRun} totalPesqueiros={pesqueiros.length} pesqueirosAtivos={ativos} token={token} />
      <PesosEditor pesos={pesos} token={token} onSaved={loadData} />
      <PesqueirosManager pesqueiros={pesqueiros} token={token} onRefresh={loadData} />
    </div>
  )
}
