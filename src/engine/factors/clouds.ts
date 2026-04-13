export function scoreClouds(percentual: number): number {
  if (percentual >= 30 && percentual <= 60) return 1.0
  if (percentual >= 20 && percentual <= 70) return 0.9
  if (percentual > 70) return 0.7
  return 0.7
}
