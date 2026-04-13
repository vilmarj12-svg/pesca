import { haversineDistanceNm } from '@/lib/geo'
import type { NavioFundeado } from '@/engine/types'
import { SHIPS_RADIUS_NM, SHIPS_MAX_SCORE_COUNT, SHIPS_SATURATION_HOURS } from '@/engine/constants'

export function scoreShips(
  navios: NavioFundeado[],
  pesqueiro: { lat: number; lon: number }
): number {
  if (navios.length === 0) return 0
  const now = Date.now()
  let total = 0
  for (const navio of navios) {
    const distNm = haversineDistanceNm(pesqueiro.lat, pesqueiro.lon, navio.lat, navio.lon)
    if (distNm > SHIPS_RADIUS_NM) continue
    const horasAncorado = (now - new Date(navio.primeiroVistoEm).getTime()) / 3600000
    const bonus = Math.min(1, horasAncorado / SHIPS_SATURATION_HOURS)
    const pesoDist = Math.max(0, 1 - distNm / SHIPS_RADIUS_NM)
    total += bonus * pesoDist
  }
  return Math.round(Math.min(1, total / SHIPS_MAX_SCORE_COUNT) * 100) / 100
}
