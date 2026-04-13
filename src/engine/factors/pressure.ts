export function scorePressure(hpa: number, variacao12h: number): number {
  let sVariacao: number
  if (Math.abs(variacao12h) <= 2) sVariacao = 0.9
  else if (variacao12h >= -4 && variacao12h < -2) sVariacao = 0.7
  else if (variacao12h < -4) sVariacao = 0.5
  else if (variacao12h > 4) sVariacao = 0.3
  else sVariacao = 0.6

  const sAbsoluta = hpa >= 1013 && hpa <= 1020 ? 1.0 : 0.8
  return Math.round(sVariacao * sAbsoluta * 100) / 100
}
