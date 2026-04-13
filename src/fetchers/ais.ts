import { db } from '@/db'
import { cacheNavios } from '@/db/schema'
import { sql } from 'drizzle-orm'
import type { NavioFundeado } from '@/engine/types'

export function getAnchoredShips(): NavioFundeado[] {
  const sixHoursAgo = new Date(Date.now() - 6 * 3600000).toISOString()
  const rows = db
    .select()
    .from(cacheNavios)
    .where(sql`${cacheNavios.ultimoVistoEm} > ${sixHoursAgo}`)
    .all()
  return rows.map((r) => ({
    mmsi: r.mmsi,
    lat: r.lat,
    lon: r.lon,
    primeiroVistoEm: r.primeiroVistoEm,
    ultimoVistoEm: r.ultimoVistoEm,
  }))
}

export function cleanupStaleShips(): number {
  const sixHoursAgo = new Date(Date.now() - 6 * 3600000).toISOString()
  const result = db
    .delete(cacheNavios)
    .where(sql`${cacheNavios.ultimoVistoEm} <= ${sixHoursAgo}`)
    .run()
  return result.changes
}
