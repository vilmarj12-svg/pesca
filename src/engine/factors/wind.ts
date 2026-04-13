export function scoreWind(velocidadeKt: number, direcaoGraus: number): number {
  let sVel: number
  if (velocidadeKt < 3) sVel = 0.6
  else if (velocidadeKt <= 15) sVel = 1.0
  else if (velocidadeKt <= 20) sVel = 0.6
  else if (velocidadeKt <= 25) sVel = 0.3
  else sVel = 0.0
  const terral = direcaoGraus > 200 && direcaoGraus < 290 ? 0.15 : 0
  return Math.min(1, sVel + terral)
}
