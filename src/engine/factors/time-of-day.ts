export function scoreTimeOfDay(hora: number, nascerSol: number, porSol: number): number {
  const distNascer = Math.abs(hora - nascerSol)
  const distPor = Math.abs(hora - porSol)
  const distMin = Math.min(distNascer, distPor)
  if (distMin <= 1) return 1.0
  if (distMin <= 2) return 0.8
  if (distMin <= 3) return 0.6
  const meiodia = (nascerSol + porSol) / 2
  const distMeiodia = Math.abs(hora - meiodia)
  if (distMeiodia <= 2) return 0.3
  return 0.5
}
