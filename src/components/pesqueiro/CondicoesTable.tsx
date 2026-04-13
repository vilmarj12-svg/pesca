import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'
import { getScoreBadgeClass } from '@/lib/score-colors'
import { windDirection } from '@/lib/format'
import type { CondicaoBruta } from '@/lib/types'

function TendenciaIcon({ tendencia }: { tendencia: string }) {
  if (tendencia === 'subindo') return <ArrowUp className="w-3 h-3 text-red-500 inline" />
  if (tendencia === 'descendo') return <ArrowDown className="w-3 h-3 text-emerald-500 inline" />
  return <ArrowRight className="w-3 h-3 text-stone-400 inline" />
}

function MareFaseIcon({ fase }: { fase: string }) {
  if (fase === 'subindo') return <span className="text-blue-500">↑</span>
  if (fase === 'descendo') return <span className="text-blue-400">↓</span>
  if (fase === 'preamar') return <span className="text-blue-600 font-bold">▲</span>
  return <span className="text-blue-300">▼</span>
}

const luaIcons: Record<string, string> = { nova: '🌑', crescente: '🌓', cheia: '🌕', minguante: '🌗' }

export function CondicoesTable({ condicoes }: { condicoes: CondicaoBruta[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-left text-[10px] text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-700 uppercase tracking-wider">
            <th className="py-2.5 px-2 font-semibold sticky left-0 bg-white dark:bg-stone-900">Hora</th>
            <th className="py-2.5 px-2 font-semibold">Score</th>
            <th className="py-2.5 px-2 font-semibold">Vento</th>
            <th className="py-2.5 px-2 font-semibold">Onda</th>
            <th className="py-2.5 px-2 font-semibold">Maré</th>
            <th className="py-2.5 px-2 font-semibold">Pressão</th>
            <th className="py-2.5 px-2 font-semibold">T.Água</th>
            <th className="py-2.5 px-2 font-semibold">T.Ar</th>
            <th className="py-2.5 px-2 font-semibold">Lua</th>
          </tr>
        </thead>
        <tbody>
          {condicoes.map((c, i) => (
            <tr key={i} className="border-b border-stone-50 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
              <td className="py-2.5 px-2 font-semibold text-stone-700 dark:text-stone-300 sticky left-0 bg-white dark:bg-stone-900">{c.hora}</td>
              <td className="py-2.5 px-2">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getScoreBadgeClass(c.score)}`}>{c.score}</span>
              </td>
              <td className="py-2.5 px-2 text-stone-600 dark:text-stone-400">{Math.round(c.ventoVelocidade * 1.852)}km/h {windDirection(c.ventoDirecao)}</td>
              <td className="py-2.5 px-2 text-stone-600 dark:text-stone-400">{c.ondaAltura}m T={c.ondaPeriodo}s</td>
              <td className="py-2.5 px-2 text-stone-600 dark:text-stone-400">{c.mareAltura}m <MareFaseIcon fase={c.mareFase} /></td>
              <td className="py-2.5 px-2 text-stone-600 dark:text-stone-400">{c.pressao} <TendenciaIcon tendencia={c.pressaoTendencia} /></td>
              <td className="py-2.5 px-2 text-blue-500">{c.tempAgua}°</td>
              <td className="py-2.5 px-2 text-stone-600 dark:text-stone-400">{c.tempAr}°</td>
              <td className="py-2.5 px-2">{luaIcons[c.faseLua] || '🌕'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
