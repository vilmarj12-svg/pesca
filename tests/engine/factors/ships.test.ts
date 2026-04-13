import { describe, it, expect } from 'vitest'
import { scoreShips } from '@/engine/factors/ships'
import type { NavioFundeado } from '@/engine/types'

const pesqueiro = { lat: -25.71, lon: -48.28 }

function makeShip(lat: number, lon: number, hoursAgo: number): NavioFundeado {
  const now = Date.now()
  return {
    mmsi: Math.floor(Math.random() * 999999999),
    lat, lon,
    primeiroVistoEm: new Date(now - hoursAgo * 3600000).toISOString(),
    ultimoVistoEm: new Date(now).toISOString(),
  }
}

describe('scoreShips', () => {
  it('returns 0 when no ships nearby', () => {
    expect(scoreShips([], pesqueiro)).toBe(0)
  })
  it('returns > 0 for one ship nearby anchored 24h', () => {
    const ships = [makeShip(-25.71, -48.28, 24)]
    expect(scoreShips(ships, pesqueiro)).toBeGreaterThan(0)
  })
  it('increases with more ships', () => {
    const one = [makeShip(-25.71, -48.28, 24)]
    const three = [
      makeShip(-25.71, -48.28, 24),
      makeShip(-25.712, -48.282, 48),
      makeShip(-25.708, -48.278, 36),
    ]
    expect(scoreShips(three, pesqueiro)).toBeGreaterThan(scoreShips(one, pesqueiro))
  })
  it('caps at 1.0', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeShip(-25.71 + i * 0.001, -48.28, 72)
    )
    expect(scoreShips(many, pesqueiro)).toBeLessThanOrEqual(1.0)
  })
})
