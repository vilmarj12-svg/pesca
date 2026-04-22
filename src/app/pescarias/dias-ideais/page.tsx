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

  async function save() {
    if (!titulo) { alert('Dê um nome pro dia'); return }
    await fetch('/api/dias-ideais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo, data,
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
        notas: notas || null,
      }),
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-3">⭐ Registrar dia ideal</h3>

        <input placeholder="Nome (ex: Dia perfeito em Currais)" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 mb-2" />
        <input type="date" value={data} onChange={e => setData(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 mb-3" />

        <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2 font-semibold">Condições (preencha o que lembrar)</p>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[10px] text-stone-500">💨 Vento min (km/h)</label>
            <input type="number" value={ventoMin} onChange={e => setVentoMin(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">💨 Vento max (km/h)</label>
            <input type="number" value={ventoMax} onChange={e => setVentoMax(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌊 Onda min (m)</label>
            <input type="number" step="0.1" value={ondaMin} onChange={e => setOndaMin(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌊 Onda max (m)</label>
            <input type="number" step="0.1" value={ondaMax} onChange={e => setOndaMax(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">📊 Pressão min (hPa)</label>
            <input type="number" value={pressaoMin} onChange={e => setPressaoMin(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">📊 Pressão max (hPa)</label>
            <input type="number" value={pressaoMax} onChange={e => setPressaoMax(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌡️ Água min (°C)</label>
            <input type="number" value={tempAguaMin} onChange={e => setTempAguaMin(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌡️ Água max (°C)</label>
            <input type="number" value={tempAguaMax} onChange={e => setTempAguaMax(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[10px] text-stone-500">🌙 Lua</label>
            <select value={luaFase} onChange={e => setLuaFase(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm">
              <option value="">Qualquer</option>
              <option value="nova">🌑 Nova</option>
              <option value="crescente">🌓 Crescente</option>
              <option value="cheia">🌕 Cheia</option>
              <option value="minguante">🌗 Minguante</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-stone-500">🌊 Maré</label>
            <select value={mareFase} onChange={e => setMareFase(e.target.value)} className="w-full px-2 py-1.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm">
              <option value="">Qualquer</option>
              <option value="subindo">↑ Subindo</option>
              <option value="descendo">↓ Descendo</option>
              <option value="preamar">▲ Preamar</option>
              <option value="baixamar">▼ Baixamar</option>
            </select>
          </div>
        </div>

        <textarea placeholder="Notas (ex: peguei 5 vermelhos no fundo com sardinha)" value={notas} onChange={e => setNotas(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 mb-3 text-sm" />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-700 font-semibold">Cancelar</button>
          <button onClick={save} className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 text-yellow-900 font-semibold">⭐ Salvar</button>
        </div>
      </div>
    </div>
  )
}
