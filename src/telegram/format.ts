import { windDirection } from '@/lib/format'

export function formatScoreStars(score: number): string {
  if (score >= 90) return '⭐⭐⭐⭐⭐ EXCELENTE'
  if (score >= 75) return '⭐⭐⭐⭐ Ótimo'
  if (score >= 60) return '⭐⭐⭐ Bom'
  if (score >= 45) return '⭐⭐ Regular'
  return '⭐ Ruim'
}

export function formatDatePtBr(iso: string): string {
  const date = new Date(iso)
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}`
}

export function formatMoonPhase(illumination: number): string {
  if (illumination < 0.1) return '🌑 Lua nova'
  if (illumination < 0.4) return '🌓 Lua crescente'
  if (illumination > 0.9) return '🌕 Lua cheia'
  return '🌗 Lua minguante'
}

export function formatPressureSummary(hpa: number, variation12h: number): string {
  if (Math.abs(variation12h) <= 1) return `Pressão estável em ${Math.round(hpa)} hPa`
  const dir = variation12h > 0 ? 'subindo' : 'caindo'
  const sign = variation12h > 0 ? '+' : ''
  return `Pressão ${dir} (${Math.round(hpa)} hPa, Δ${sign}${Math.round(variation12h)})`
}

export function formatWindSummary(speedKt: number, directionDeg: number): string {
  return `${windDirection(directionDeg)} ${Math.round(speedKt)}kt`
}
