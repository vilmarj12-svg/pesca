export function scoreAirTemp(temp: number): number {
  if (temp >= 18 && temp <= 28) return 1.0
  if (temp >= 14 && temp < 18) return 0.7
  if (temp > 28 && temp <= 35) return 0.7
  return 0.4
}
