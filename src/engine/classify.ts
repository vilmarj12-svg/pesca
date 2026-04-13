import type { Classificacao } from './types'
import { CLASSIFICATION_RANGES } from './constants'

export function classify(score: number): Classificacao {
  for (const range of CLASSIFICATION_RANGES) {
    if (score >= range.min) return range.classificacao
  }
  return 'ruim'
}
