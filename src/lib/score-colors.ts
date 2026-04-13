export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#fbbf24'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-emerald-500 text-white'
  if (score >= 60) return 'bg-amber-400 text-amber-900'
  if (score >= 40) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

export function getHeatColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-400'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}
