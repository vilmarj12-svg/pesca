export function scoreVisibility(km: number): number {
  if (km >= 5) return 1.0
  if (km >= 2) return 0.7
  if (km >= 1) return 0.4
  if (km >= 0.5) return 0.2
  return 0.0
}
