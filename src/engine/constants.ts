export const DEFAULT_WEIGHTS: Record<string, number> = {
  mare: 17,
  vento: 17,
  onda: 14,
  lua: 11,
  pressao: 9,
  frente: 8,
  tempAgua: 6,
  navios: 5,
  hora: 5,
  visibilidade: 3,
  nuvens: 2,
  tempAr: 2,
  chuva: 1,
}

export const CLASSIFICATION_RANGES = [
  { min: 90, classificacao: 'excelente' as const },
  { min: 75, classificacao: 'otimo' as const },
  { min: 60, classificacao: 'bom' as const },
  { min: 45, classificacao: 'regular' as const },
  { min: 0,  classificacao: 'ruim' as const },
]

export const SAFETY_CAPE_THRESHOLD = 1000
export const WINDOW_MIN_SCORE = 75
export const ALERT_THRESHOLD = 90
export const SHIPS_RADIUS_NM = 2
export const SHIPS_MAX_SCORE_COUNT = 3
export const SHIPS_SATURATION_HOURS = 48
