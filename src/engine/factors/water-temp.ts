export function scoreWaterTemp(temp: number): number {
  if (temp >= 20 && temp <= 25) return 1.0
  if (temp >= 18 && temp < 20) return 0.8
  if (temp > 25 && temp <= 28) return 0.8
  if (temp >= 15 && temp < 18) return 0.5
  if (temp > 28 && temp <= 30) return 0.5
  return 0.3
}
