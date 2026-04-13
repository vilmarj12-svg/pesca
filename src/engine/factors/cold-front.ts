export function scoreColdFront(pressaoSerie: number[], ventoSerie: number[]): number {
  if (pressaoSerie.length < 2 || ventoSerie.length < 2) return 0.5
  const deltaPressao = pressaoSerie[pressaoSerie.length - 1] - pressaoSerie[0]
  const ultimoVento = ventoSerie[ventoSerie.length - 1]
  const pressaoCaindo = deltaPressao < -4
  const ventoSul = ultimoVento >= 135 && ultimoVento <= 225
  if (pressaoCaindo && ventoSul) return 1.0
  if (pressaoCaindo) return 0.7
  return 0.5
}
