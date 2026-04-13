export function scoreTide(fase: string, amplitude: number): number {
  const faseScores: Record<string, number> = {
    subindo: 1.0, descendo: 0.9, preamar: 0.7, baixamar: 0.3,
  }
  const sFase = faseScores[fase] ?? 0.5
  const sAmplitude = Math.min(1, amplitude / 1.5)
  return Math.round(sFase * sAmplitude * 100) / 100
}
