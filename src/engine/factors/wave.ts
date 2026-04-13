export function scoreWave(alturaM: number, periodoS: number): number {
  let sAltura: number
  if (alturaM <= 0.5) sAltura = 1.0
  else if (alturaM <= 1.0) sAltura = 0.9
  else if (alturaM <= 1.5) sAltura = 0.7
  else if (alturaM <= 2.0) sAltura = 0.4
  else if (alturaM <= 2.5) sAltura = 0.2
  else sAltura = 0.0
  const sPeriodo = Math.min(1, periodoS / 10)
  return Math.round(sAltura * (0.7 + 0.3 * sPeriodo) * 100) / 100
}
