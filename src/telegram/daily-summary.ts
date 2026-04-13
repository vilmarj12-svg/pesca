import type { PesqueiroResumo } from '@/lib/types'
import { formatScoreStars, formatDatePtBr, formatMoonPhase, formatPressureSummary, formatWindSummary } from './format'

export function buildDailySummaryText(
  pesqueiros: PesqueiroResumo[],
  moonIllumination: number,
  pressaoHpa: number,
  pressaoVariacao: number,
  ondaMedia: number,
  ventoKt: number,
  ventoDirecao: number,
): string {
  const now = new Date()
  const dateStr = formatDatePtBr(now.toISOString())
  const sorted = [...pesqueiros].sort((a, b) => b.scoreAtual - a.scoreAtual)
  const top = sorted.slice(0, 4)

  const lines: string[] = [
    `🎣 Pesca PR — ${dateStr}`,
    '',
    '🌅 Hoje',
  ]

  for (const p of top) {
    const stars = formatScoreStars(p.scoreAtual)
    const janela = p.proximaJanela ? ` — janela ${p.proximaJanela.replace('hoje ', '')}` : ''
    lines.push(`  • ${p.nome.padEnd(18)} ${stars} (${p.scoreAtual})${janela}`)
  }

  lines.push('')
  lines.push(`🌙 ${formatMoonPhase(moonIllumination)}`)
  lines.push(`🌡️ ${formatPressureSummary(pressaoHpa, pressaoVariacao)}`)
  lines.push(`🌊 Onda média ${ondaMedia}m, vento ${formatWindSummary(ventoKt, ventoDirecao)}`)

  return lines.join('\n')
}
