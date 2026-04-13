'use client'

import Link from 'next/link'
import { ArrowLeft, Anchor, Fish, Waves, Ship, Navigation } from 'lucide-react'
import { getClassificacaoLabel } from '@/lib/format'
import type { PesqueiroDetalhe, BreakdownCompleto } from '@/lib/types'

const tipoIcons: Record<string, typeof Anchor> = {
  naufragio: Anchor, parcel: Waves, laje: Waves, cascalho: Waves,
  pedra: Waves, offshore: Fish, fundeadouro: Ship, baia: Navigation, canal: Navigation,
}

export function PesqueiroHeader({ pesqueiro, breakdown }: { pesqueiro: PesqueiroDetalhe; breakdown: BreakdownCompleto }) {
  const TipoIcon = tipoIcons[pesqueiro.tipo] || Fish
  const scoreColor = pesqueiro.scoreAtual >= 90 ? 'bg-emerald-500 text-white'
    : pesqueiro.scoreAtual >= 75 ? 'bg-blue-500 text-white'
    : pesqueiro.scoreAtual >= 60 ? 'bg-amber-400 text-amber-900'
    : pesqueiro.scoreAtual >= 45 ? 'bg-orange-500 text-white'
    : 'bg-red-500 text-white'

  return (
    <>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight font-display">
              {pesqueiro.nome}
            </h1>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-black ${scoreColor}`}>
              {pesqueiro.scoreAtual}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <TipoIcon className="w-3.5 h-3.5" />
              {pesqueiro.tipo.charAt(0).toUpperCase() + pesqueiro.tipo.slice(1)}
            </span>
            {pesqueiro.profundidadeM && <span>• {pesqueiro.profundidadeM}m</span>}
            {pesqueiro.distanciaCostaMn && <span>• {pesqueiro.distanciaCostaMn}mn da costa</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pesqueiro.especiesAlvo.map((esp) => (
              <span key={esp} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{esp}</span>
            ))}
          </div>
          {pesqueiro.notas && <p className="text-xs text-stone-400 dark:text-stone-500 mt-2 italic">{pesqueiro.notas}</p>}
        </div>
        <div className="text-center sm:text-right">
          <span className="text-4xl font-black text-stone-900 dark:text-stone-50">{breakdown.score}</span>
          <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{getClassificacaoLabel(breakdown.classificacao)}</p>
        </div>
      </div>
    </>
  )
}
