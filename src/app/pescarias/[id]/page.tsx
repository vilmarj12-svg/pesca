'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Play, Square, Plus, Camera, MapPin, Trash2, Edit2, Save, X } from 'lucide-react'

const PescariaMap = dynamic(() => import('@/components/pescaria/PescariaMap').then(m => m.PescariaMap), {
  ssr: false,
  loading: () => <div className="h-[400px] rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse" />,
})

interface Ponto { id: number; lat: number; lon: number; timestamp: string; accuracy: number | null }
interface Visita {
  id: number
  pesqueiroId: number | null
  nomePersonalizado: string | null
  lat: number | null
  lon: number | null
  horaInicio: string
  horaFim: string | null
  especie: string | null
  quantidade: number | null
  isca: string | null
  tecnica: string | null
  notas: string | null
}
interface Foto { id: number; dataUrl: string; legenda: string | null; timestamp: string; lat: number | null; lon: number | null }
interface Pescaria {
  id: number
  titulo: string
  iniciadaEm: string
  terminadaEm: string | null
  notas: string | null
  pontos: Ponto[]
  visitas: Visita[]
  fotos: Foto[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function computeDistance(pts: Ponto[]): number {
  if (pts.length < 2) return 0
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const lat1 = pts[i - 1].lat * Math.PI / 180
    const lat2 = pts[i].lat * Math.PI / 180
    const dLat = lat2 - lat1
    const dLon = (pts[i].lon - pts[i - 1].lon) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    total += 6371 * c
  }
  return total
}

export default function PescariaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<Pescaria | null>(null)
  const [tracking, setTracking] = useState(false)
  const [showAddVisita, setShowAddVisita] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const watchIdRef = useRef<number | null>(null)
  const pointsBuffer = useRef<Array<{ lat: number; lon: number; accuracy: number; speed: number | null }>>([])
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const load = async () => {
    const res = await fetch(`/api/pescarias/${id}`)
    const d = await res.json()
    setData(d)
    setTitleInput(d.titulo)
  }

  useEffect(() => { load() }, [id])

  // Flush buffered GPS points to server every 10s
  useEffect(() => {
    if (!tracking) return
    flushIntervalRef.current = setInterval(async () => {
      if (pointsBuffer.current.length === 0) return
      const pontos = [...pointsBuffer.current]
      pointsBuffer.current = []
      await fetch(`/api/pescarias/${id}/pontos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos }),
      })
      load()
    }, 10000)
    return () => {
      if (flushIntervalRef.current) clearInterval(flushIntervalRef.current)
    }
  }, [tracking, id])

  function startTracking() {
    if (!navigator.geolocation) {
      alert('Geolocalização não disponível no seu dispositivo.')
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        pointsBuffer.current.push({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
        })
      },
      (err) => console.error('GPS:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )
    watchIdRef.current = watchId
    setTracking(true)
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
  }

  async function terminarPescaria() {
    stopTracking()
    // Flush remaining points
    if (pointsBuffer.current.length > 0) {
      await fetch(`/api/pescarias/${id}/pontos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontos: pointsBuffer.current }),
      })
      pointsBuffer.current = []
    }
    await fetch(`/api/pescarias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ terminadaEm: new Date().toISOString() }),
    })
    await load()
  }

  async function saveTitle() {
    await fetch(`/api/pescarias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: titleInput }),
    })
    setEditingTitle(false)
    load()
  }

  async function deletePescaria() {
    if (!confirm('Apagar esta pescaria e todos os dados?')) return
    await fetch(`/api/pescarias/${id}`, { method: 'DELETE' })
    router.push('/pescarias')
  }

  async function addFoto(file: File) {
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 })
      })
      await fetch(`/api/pescarias/${id}/fotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          lat: pos?.coords.latitude ?? null,
          lon: pos?.coords.longitude ?? null,
        }),
      })
      load()
    }
    reader.readAsDataURL(file)
  }

  if (!data) {
    return <div className="p-8 text-center text-stone-400">Carregando...</div>
  }

  const ativa = !data.terminadaEm
  const distanceKm = computeDistance(data.pontos)

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/pescarias" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        {editingTitle ? (
          <>
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="flex-1 text-xl font-bold px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              autoFocus
            />
            <button onClick={saveTitle} className="p-2 rounded bg-blue-600 text-white"><Save className="w-4 h-4" /></button>
            <button onClick={() => { setEditingTitle(false); setTitleInput(data.titulo) }} className="p-2 rounded bg-stone-200 dark:bg-stone-700"><X className="w-4 h-4" /></button>
          </>
        ) : (
          <>
            <h1 className="flex-1 text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50 font-display">{data.titulo}</h1>
            <button onClick={() => setEditingTitle(true)} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
              <Edit2 className="w-4 h-4 text-stone-400" />
            </button>
            {ativa && <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-500 text-white animate-pulse">● AO VIVO</span>}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Distância</p>
          <p className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">{distanceKm.toFixed(1)} km</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Pesqueiros</p>
          <p className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">{data.visitas.length}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Fotos</p>
          <p className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">{data.fotos.length}</p>
        </div>
      </div>

      {/* Tracking controls */}
      {ativa && (
        <div className="flex gap-2 mb-4">
          {!tracking ? (
            <button onClick={startTracking} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">
              <Play className="w-4 h-4" /> Começar tracking GPS
            </button>
          ) : (
            <button onClick={stopTracking} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white font-bold">
              <Square className="w-4 h-4" /> Pausar tracking
            </button>
          )}
          <button onClick={terminarPescaria} className="px-4 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold">
            Terminar
          </button>
        </div>
      )}

      {/* Map */}
      <section className="mb-4">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Percurso</h2>
        <PescariaMap pontos={data.pontos} visitas={data.visitas} fotos={data.fotos} />
      </section>

      {/* Visitas (pesqueiros visitados) */}
      <section className="mb-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Locais Pescados</h2>
          <button onClick={() => setShowAddVisita(true)} className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
        {data.visitas.length === 0 ? (
          <p className="p-4 text-center text-xs text-stone-400">Nenhum local registrado. Adicione onde você pescou.</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {data.visitas.map((v) => (
              <div key={v.id} className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-sm font-semibold">{v.nomePersonalizado || 'Local'}</span>
                    <span className="text-[10px] text-stone-400">{formatTime(v.horaInicio)}</span>
                  </div>
                  <button onClick={async () => {
                    await fetch(`/api/pescarias/${id}/visitas?visitaId=${v.id}`, { method: 'DELETE' })
                    load()
                  }} className="p-1 text-stone-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(v.especie || v.quantidade || v.isca) && (
                  <div className="flex flex-wrap gap-1.5 text-[10px] mt-1">
                    {v.quantidade !== null && v.especie && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">🐟 {v.quantidade}× {v.especie}</span>
                    )}
                    {v.isca && <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">🪝 {v.isca}</span>}
                    {v.tecnica && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{v.tecnica}</span>}
                  </div>
                )}
                {v.notas && <p className="text-xs text-stone-500 mt-1 italic">{v.notas}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {showAddVisita && (
        <AddVisitaModal pescariaId={id} onClose={() => setShowAddVisita(false)} onSaved={() => { setShowAddVisita(false); load() }} />
      )}

      {/* Fotos */}
      <section className="mb-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Fotos</h2>
          <label className="text-xs font-semibold text-blue-600 flex items-center gap-1 cursor-pointer">
            <Camera className="w-3.5 h-3.5" /> Adicionar
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) addFoto(f)
            }} />
          </label>
        </div>
        {data.fotos.length === 0 ? (
          <p className="p-4 text-center text-xs text-stone-400">Nenhuma foto ainda</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
            {data.fotos.map((f) => (
              <div key={f.id} className="relative group">
                <img src={f.dataUrl} alt={f.legenda || 'foto'} className="w-full aspect-square object-cover rounded-lg" />
                <button onClick={async () => {
                  if (!confirm('Apagar foto?')) return
                  await fetch(`/api/pescarias/${id}/fotos?fotoId=${f.id}`, { method: 'DELETE' })
                  load()
                }} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-[9px] text-white rounded-b-lg">
                  {formatTime(f.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={deletePescaria} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mt-4">
        <Trash2 className="w-3 h-3" /> Apagar pescaria
      </button>
    </div>
  )
}

function AddVisitaModal({ pescariaId, onClose, onSaved }: { pescariaId: string; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState('')
  const [especie, setEspecie] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [isca, setIsca] = useState('')
  const [tecnica, setTecnica] = useState('')
  const [notas, setNotas] = useState('')

  async function save() {
    const pos = await new Promise<GeolocationPosition | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 })
    })
    await fetch(`/api/pescarias/${pescariaId}/visitas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomePersonalizado: nome || null,
        especie: especie || null,
        quantidade: quantidade ? parseInt(quantidade) : null,
        isca: isca || null,
        tecnica: tecnica || null,
        notas: notas || null,
        lat: pos?.coords.latitude ?? null,
        lon: pos?.coords.longitude ?? null,
      }),
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">Adicionar local pescado</h3>
        <input placeholder="Nome do local (ex: Ilha da Figueira)" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Espécie" value={especie} onChange={(e) => setEspecie(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
          <input type="number" placeholder="Qtd" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
        </div>
        <input placeholder="Isca usada" value={isca} onChange={(e) => setIsca(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
        <input placeholder="Técnica" value={tecnica} onChange={(e) => setTecnica(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
        <textarea placeholder="Notas..." value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-700 font-semibold">Cancelar</button>
          <button onClick={save} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Salvar</button>
        </div>
      </div>
    </div>
  )
}
