'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getScoreBadgeClass } from '@/lib/score-colors'
import { getClassificacaoLabel, getClassificacaoStars } from '@/lib/format'
import type { PesqueiroResumo } from '@/lib/types'

export function RankingTable({ pesqueiros }: { pesqueiros: PesqueiroResumo[] }) {
  const sorted = [...pesqueiros].sort((a, b) => b.scoreAtual - a.scoreAtual)

  return (
    <div>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-700">
              <th className="py-3 px-3 font-semibold w-10">#</th>
              <th className="py-3 px-3 font-semibold">Pesqueiro</th>
              <th className="py-3 px-3 font-semibold w-20">Score</th>
              <th className="py-3 px-3 font-semibold">Classificação</th>
              <th className="py-3 px-3 font-semibold">Próx. janela</th>
              <th className="py-3 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={p.id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="py-3.5 px-3 text-stone-400 dark:text-stone-500 font-mono text-xs">{i + 1}</td>
                <td className="py-3.5 px-3">
                  <Link href={`/pesqueiro/${p.slug}`} className="font-semibold text-stone-900 dark:text-stone-100 hover:text-blue-600">
                    {p.nome}
                  </Link>
                </td>
                <td className="py-3.5 px-3">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getScoreBadgeClass(p.scoreAtual)}`}>
                    {p.scoreAtual}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-stone-600 dark:text-stone-300">
                  <span className="text-amber-500 mr-1 text-[10px]">{getClassificacaoStars(p.classificacao)}</span>
                  {getClassificacaoLabel(p.classificacao)}
                </td>
                <td className="py-3.5 px-3 text-stone-500 dark:text-stone-400">
                  {p.proximaJanela || <span className="text-stone-300 dark:text-stone-600">—</span>}
                </td>
                <td className="py-3.5 px-3">
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden flex flex-col gap-3 p-3">
        {sorted.map((p, i) => (
          <Link key={p.id} href={`/pesqueiro/${p.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
            <span className="text-xs text-stone-400 font-mono w-5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{p.nome}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {getClassificacaoLabel(p.classificacao)} {p.proximaJanela ? `• ${p.proximaJanela}` : ''}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getScoreBadgeClass(p.scoreAtual)}`}>
              {p.scoreAtual}
            </span>
            <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
