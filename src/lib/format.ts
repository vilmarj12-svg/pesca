export function windDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const idx = Math.round((degrees % 360) / 45) % 8
  return dirs[idx]
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getClassificacaoLabel(c: string): string {
  const labels: Record<string, string> = {
    excelente: 'Excelente',
    otimo: 'Ótimo',
    bom: 'Bom',
    regular: 'Regular',
    ruim: 'Ruim',
  }
  return labels[c] || c
}

export function getClassificacaoStars(c: string): string {
  const stars: Record<string, string> = {
    excelente: '★★★★★',
    otimo: '★★★★',
    bom: '★★★',
    regular: '★★',
    ruim: '★',
  }
  return stars[c] || '★'
}

export function getMarkerSize(score: number): number {
  if (score >= 80) return 14
  if (score >= 60) return 12
  if (score >= 40) return 10
  return 8
}
