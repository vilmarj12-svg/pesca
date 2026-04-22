'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Plus, Trash2 } from 'lucide-react'

interface DiaIdeal {
  id: number
  titulo: string
  data: string
  pesqueiroSlug: string | null
  ventoMin: number | null
  ventoMax: number | null
  ondaMin: number | null
  ondaMax: number | null
  pressaoMin: number | null
  pressaoMax: number | null
  tempAguaMin: number | null
  tempAguaMax: number | null
  luaFase: string | null
  mareFase: string | null
  notas: string | null
}

export default function DiasIdeaisPage() {
  const [dias, setDias] = useState<DiaIdeal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/dias-ideais').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setDias(d)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function deletar(id: number) {
    if (!confirm('Apagar este dia ideal?')) return
    await fetch(`/api/dias-ideais?id=${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/pescarias" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50 font-display">Dias Ideais</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500 text-yellow-900 text-xs font-semibold hover:bg-yellow-400 cursor-pointer">
          <Plus className="w-4 h-4" /> Registrar dia
        </button>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
        Salve as condições dos seus melhores dias de pesca. O app te avisa quando a previsão bater com esses parâmetros.
      </p>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-stone-200 dark:bg-stone-800 rounded-xl" />)}
        </div>
      ) : dias.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <Star className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-2">Nenhum dia ideal salvo</p>
          <p className="text-xs text-stone-400 mb-4">Após um dia excelente de pesca, registre as condições aqui</p>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-yellow-500 text-yellow-900 text-sm font-semibold">
            Registrar primeiro dia
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dias.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-yellow-200 dark:border-yellow-800 border-l-4 border-l-yellow-500">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{d.titulo}</h3>
                  <p className="text-[10px] text-stone-400">{new Date(d.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onClick={() => deletar(d.id)} className="p-1 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {d.ventoMin !== null && <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">💨 {d.ventoMin}-{d.ventoMax} km/h</span>}
                {d.ondaMin !== null && <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">🌊 {d.ondaMin}-{d.ondaMax}m</span>}
                {d.pressaoMin !== null && <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">📊 {d.pressaoMin}-{d.pressaoMax} hPa</span>}
                {d.tempAguaMin !== null && <span className="px-1.5 py-0.5 rounded text-[9px] bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">🌡️ {d.tempAguaMin}-{d.tempAguaMax}°C</span>}
                {d.luaFase && <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300">🌙 {d.luaFase}</span>}
                {d.mareFase && <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300">🌊 maré {d.mareFase}</span>}
              </div>
              {d.notas && <p className="text-xs text-stone-500 mt-2 italic">{d.notas}</p>}
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddDiaIdealModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
    </div>
  )
}

function AddDiaIdealModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [ventoMin, setVentoMin] = useState('')
  const [ventoMax, setVentoMax] = useState('')
  const [ondaMin, setOndaMin] = useState('')
  const [ondaMax, setOndaMax] = useState('')
  const [pressaoMin, setPressaoMin] = useState('')
  const [pressaoMax, setPressaoMax] = useState('')
  const [tempAguaMin, setTempAguaMin] = useState('')
  const [tempAguaMax, setTempAguaMax] = useState('')
  const [luaFase, setLuaFase] = useState('')
  const [mareFase, setMareFase] = useState('')
  const [notas, setNotas] = useState('')
  const [local, setLocal] = useState('')
  const [peixes, setPeixes] = useState('')
  const [isca, setIsca] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [loadingConditions, setLoadingConditions] = useState(false)
  const [pesqueiros, setPesqueiros] = useState<Array<{ slug: string; nome: string }>>([])

  // Load pesqueiros list
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      if (d?.pesqueiros) setPesqueiros(d.pesqueiros.map((p: any) => ({ slug: p.slug, nome: p.nome })))
    }).catch(() => {})
  }, [])

  // Auto-fill conditions when date changes
  async function carregarCondicoes(dateStr: string) {
    setLoadingConditions(true)
    try {
      const res = await fetch('/api/forecast')
      const fc = await res.json()
      if (!fc?.pesqueiros?.[0]?.dias) return

      // Find the day in forecast
      const day = fc.pesqueiros[0].dias.find((d: any) => d.date === dateStr)
      if (!day) return

      // Get hourly data for that day from first pesqueiro
      const dayHoras = fc.pesqueiros[0].horas?.filter((h: any) => h.timestamp.startsWith(dateStr)) ?? []

      // Also fetch current snapshot for conditions
      const dashRes = await fetch('/api/dashboard')
      const dash = await dashRes.json()
      const snap = dash?.pesqueiros?.[0]

      // Try to get conditions from the latest snapshot
      if (snap) {
        const detailRes = await fetch(`/api/pesqueiro/${snap.slug}`)
        const detail = await detailRes.json()
        if (detail?.condicoes24h?.length > 0) {
          const conds = detail.condicoes24h
          const ventos = conds.map((c: any) => c.ventoVelocidade * 1.852)
          const ondas = conds.map((c: any) => c.ondaAltura)
          const pressoes = conds.map((c: any) => c.pressao)
          const temps = conds.map((c: any) => c.tempAgua)

          setVentoMin(Math.round(Math.min(...ventos)).toString())
          setVentoMax(Math.round(Math.max(...ventos)).toString())
          setOndaMin(Math.min(...ondas).toFixed(1))
          setOndaMax(Math.max(...ondas).toFixed(1))
          setPressaoMin(Math.round(Math.min(...pressoes)).toString())
          setPressaoMax(Math.round(Math.max(...pressoes)).toString())
          setTempAguaMin(Math.min(...temps).toFixed(1))
          setTempAguaMax(Math.max(...temps).toFixed(1))

          // Moon phase from first condition
          const lua = conds[0]?.faseLua
          if (lua) setLuaFase(lua)

          // Tide from first condition
          const mare = conds[0]?.mareFase
          if (mare) setMareFase(mare)
        }
      }
    } catch (e) {
      console.error('Erro ao carregar condições:', e)
    }
    setLoadingConditions(false)
  }

  // Auto-fill on mount (today's conditions)
  useEffect(() => { carregarCondicoes(data) }, [])

  function handleDateChange(newDate: string) {
    setData(newDate)
    carregarCondicoes(newDate)
  }

  function addFoto(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      setFotos(prev => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    if (!titulo) { alert('Dê um nome pro dia'); return }
    await fetch('/api/dias-ideais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo, data,
        pesqueiroSlug: local || null,
        ventoMin: ventoMin ? parseFloat(ventoMin) : null,
        ventoMax: ventoMax ? parseFloat(ventoMax) : null,
        ondaMin: ondaMin ? parseFloat(ondaMin) : null,
        ondaMax: ondaMax ? parseFloat(ondaMax) : null,
        pressaoMin: pressaoMin ? parseFloat(pressaoMin) : null,
        pressaoMax: pressaoMax ? parseFloat(pressaoMax) : null,
        tempAguaMin: tempAguaMin ? parseFloat(tempAguaMin) : null,
        tempAguaMax: tempAguaMax ? parseFloat(tempAguaMax) : null,
        luaFase: luaFase || null,
        mareFase: mareFase || null,
        notas: [
          peixes ? `Peixes: ${peixes}` : '',
          isca ? `Isca: ${isca}` : '',
          notas,
        ].filter(Boolean).join(' | ') || null,
      }),
    })
    onSaved()
  }

  const inputCls = "w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm"

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-3">⭐ Registrar dia ideal</h3>

        <input placeholder="Nome (ex: Dia perfeito em Currais)" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 mb-2" />

        <div className="flex gap-2 mb-3">
          <input type="date" value={data} onChange={e => handleDateChange(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800" />
          {loadingConditions && <span className="text-xs text-stone-400 self-center animate-pulse">Carregando...</span>}
        </div>

        {/* Local */}
        <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-semibold">📍 Onde pescou</p>
        <select value={local} onChange={e => setLocal(e.target.value)} className={`${inputCls} mb-2`}>
          <option value="">Selecione o pesqueiro</option>
          {pesqueiros.map(p => <option key={p.slug} value={p.slug}>{p.nome}</option>)}
        </select>

        {/* Peixes e isca */}
        <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-semibold">🐟 O que pescou</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input placeholder="Peixes (ex: 5 vermelhos, 2 garoupas)" value={peixes} onChange={e => setPeixes(e.target.value)} className={inputCls} />
          <input placeholder="Isca usada" value={isca} onChange={e => setIsca(e.target.value)} className={inputCls} />
        </div>

        {/* Condições automáticas */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">⛅ Condições do dia</p>
          <span className="text-[9px] text-emerald-500 font-semibold">✓ Preenchido automaticamente</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[10px] text-stone-500">💨 Vento min (km/h)</label>
            <input type="number" value={ventoMin} onChange={e => setVentoMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">💨 Vento max (km/h)</label>
            <input type="number" value={ventoMax} onChange={e => setVentoMax(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌊 Onda min (m)</label>
            <input type="number" step="0.1" value={ondaMin} onChange={e => setOndaMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌊 Onda max (m)</label>
            <input type="number" step="0.1" value={ondaMax} onChange={e => setOndaMax(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">📊 Pressão min (hPa)</label>
            <input type="number" value={pressaoMin} onChange={e => setPressaoMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">📊 Pressão max (hPa)</label>
            <input type="number" value={pressaoMax} onChange={e => setPressaoMax(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌡️ Água min (°C)</label>
            <input type="number" value={tempAguaMin} onChange={e => setTempAguaMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌡️ Água max (°C)</label>
            <input type="number" value={tempAguaMax} onChange={e => setTempAguaMax(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] text-stone-500">🌙 Lua</label>
            <select value={luaFase} onChange={e => setLuaFase(e.target.value)} className={inputCls}>
              <option value="">Qualquer</option>
              <option value="nova">🌑 Nova</option>
              <option value="crescente">🌓 Crescente</option>
              <option value="cheia">🌕 Cheia</option>
              <option value="minguante">🌗 Minguante</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌊 Maré</label>
            <select value={mareFase} onChange={e => setMareFase(e.target.value)} className={inputCls}>
              <option value="">Qualquer</option>
              <option value="subindo">↑ Subindo</option>
              <option value="descendo">↓ Descendo</option>
              <option value="preamar">▲ Preamar</option>
              <option value="baixamar">▼ Baixamar</option>
            </select>
          </div>
        </div>

        {/* Fotos */}
        <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-semibold">📷 Fotos do dia</p>
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {fotos.map((f, i) => (
            <div key={i} className="relative shrink-0">
              <img src={f} className="w-16 h-16 object-cover rounded-lg" />
              <button onClick={() => setFotos(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">✕</button>
            </div>
          ))}
          <label className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center cursor-pointer hover:border-blue-400">
            <span className="text-xl text-stone-400">+</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) addFoto(f) }} />
          </label>
        </div>

        {/* Notas */}
        <textarea placeholder="Notas adicionais..." value={notas} onChange={e => setNotas(e.target.value)} rows={2} className={`${inputCls} mb-3`} />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-700 font-semibold">Cancelar</button>
          <button onClick={save} className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 text-yellow-900 font-semibold">⭐ Salvar</button>
        </div>
      </div>
    </div>
  )
}
