export function scoreMoon(iluminacao: number): number {
  const distFromQuarter = Math.abs(iluminacao - 0.5) * 2
  return Math.round((0.4 + 0.6 * distFromQuarter) * 100) / 100
}
