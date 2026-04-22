'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Route, MapPin, Camera, Fish, Plus, Calendar, Star } from 'lucide-react'

interface Pescaria {
  id: number
  titulo: string
  iniciadaEm: string
  terminadaEm: string | null
  notas: string | null
  totalPontos: number
  totalVisitas: number
  totalFotos: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(start: string, end: string | null): string {
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : Date.now()
  const hours = (e - s) / 3600000
  if (hours < 1) return `${Math.round(hours * 60)}min`
  return `${hours.toFixed(1)}h`
}

export default function PescariasPage() {
  const [pescarias, setPescarias] = useState<Pescaria[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/pescarias')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setPescarias(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function iniciarNova() {
    const res = await fetch('/api/pescarias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: `Pescaria ${new Date().toLocaleDateString('pt-BR')}` }),
    })
    const data = await res.json()
    router.push(`/pescarias/${data.id}`)
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Fish className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
            Minhas Pescarias
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/pescarias/dias-ideais" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-semibold border border-yellow-200 dark:border-yellow-800">
            <Star className="w-3.5 h-3.5" fill="currentColor" /> Dias ideais
          </Link>
          <button
            onClick={iniciarNova}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova
        </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-stone-200 dark:bg-stone-800 rounded-xl" />)}
        </div>
      ) : pescarias.length === 0 ? (
        <div className="text-center py-12">
          <Fish className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">Nenhuma pescaria registrada ainda</p>
          <button onClick={iniciarNova} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
            Começar primeira pescaria
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pescarias.map((p) => {
            const ativa = !p.terminadaEm
            return (
              <Link key={p.id} href={`/pescarias/${p.id}`}
                className="block p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">{p.titulo}</h3>
                      {ativa && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white animate-pulse">
                          ● AO VIVO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(p.iniciadaEm)}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDuration(p.iniciadaEm, p.terminadaEm)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Route className="w-3 h-3" /> {p.totalPontos} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.totalVisitas} locais
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3" /> {p.totalFotos} fotos
                  </span>
                </div>
                {p.notas && <p className="text-xs text-stone-400 mt-2 italic truncate">{p.notas}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
