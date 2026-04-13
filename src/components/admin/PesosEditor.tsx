'use client'

import { useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { DEFAULT_WEIGHTS } from '@/engine/constants'

interface Props {
  pesos: Record<string, number>
  token: string
  onSaved: () => void
}

export function PesosEditor({ pesos, token, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, number>>(pesos)
  const soma = Object.values(values).reduce((s, v) => s + v, 0)
  const somaValid = soma === 100

  function handleChange(fator: string, val: number) {
    setValues((prev) => ({ ...prev, [fator]: val }))
  }

  async function handleSave() {
    await fetch(`/api/admin/config?token=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesos: values }),
    })
    onSaved()
  }

  function handleReset() {
    setValues({ ...DEFAULT_WEIGHTS })
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Pesos do Score Engine</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {Object.entries(values).map(([fator, peso]) => (
            <div key={fator} className="flex items-center justify-between gap-2">
              <label className="text-xs text-stone-600 dark:text-stone-400 truncate">{fator}</label>
              <div className="flex items-center gap-1">
                <input type="number" value={peso}
                  onChange={(e) => handleChange(fator, parseInt(e.target.value) || 0)}
                  className="w-14 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-900 dark:text-stone-100 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                <span className="text-[10px] text-stone-400">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-4 ${somaValid ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'}`}>
          <span className={`text-xs font-semibold ${somaValid ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>Soma: {soma}%</span>
          <span className="text-xs">{somaValid ? '✓ Válido' : '✗ Deve ser 100%'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={!somaValid}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${somaValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
            <Save className="w-3.5 h-3.5" /> Salvar
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Resetar
          </button>
        </div>
      </div>
    </div>
  )
}
