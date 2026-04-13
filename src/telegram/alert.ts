import type { FatorBreakdownView } from '@/lib/types'
import { formatScoreStars } from './format'

const MAX_ALERTS_PER_DAY = 5
const SCORE_CHANGE_THRESHOLD = 5

export function buildAlertMessage(
  pesqueiroNome: string,
  scoreMedio: number,
  janelaDesc: string,
  fatores: FatorBreakdownView[],
): string {
  const stars = formatScoreStars(scoreMedio)
  const topFatores = [...fatores]
    .filter(f => f.scoreNorm >= 0.8)
    .sort((a, b) => b.contribuicao - a.contribuicao)
    .slice(0, 6)

  const lines: string[] = [
    '🔥 JANELA EXCELENTE detectada!',
    '',
    `📍 ${pesqueiroNome}`,
    `📅 ${janelaDesc}`,
    `⭐ Score médio: ${scoreMedio} (${stars.split(' ').pop()})`,
    '',
    'Por quê:',
  ]

  for (const f of topFatores) {
    lines.push(`  ✓ ${f.valorBruto}`)
  }

  return lines.join('\n')
}

export function shouldSendAlert(
  scoreMedio: number,
  existingAlerts: Array<{ scoreMedio: number; janelaInicio: string; janelaFim: string }>,
  alertsToday: number,
): boolean {
  if (alertsToday >= MAX_ALERTS_PER_DAY) return false
  if (existingAlerts.length === 0) return true

  for (const existing of existingAlerts) {
    if (Math.abs(existing.scoreMedio - scoreMedio) <= SCORE_CHANGE_THRESHOLD) {
      return false
    }
  }

  return true
}

export function isQuietHours(hour: number): boolean {
  return hour >= 22 || hour < 6
}
