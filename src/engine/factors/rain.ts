export function scoreRain(mm: number): number {
  if (mm === 0) return 1.0
  if (mm <= 1) return 0.9
  if (mm <= 3) return 0.7
  if (mm <= 5) return 0.5
  return 0.3
}
