import { NextResponse } from 'next/server'
import { db } from '@/db'
import { snapshots, pesqueiros } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Get the latest snapshot with conditions
  const latest = db
    .select()
    .from(snapshots)
    .orderBy(desc(snapshots.id))
    .limit(1)
    .get()

  if (!latest) {
    return NextResponse.json({ error: 'No data' }, { status: 404 })
  }

  const c = latest.condicoes as Record<string, any>
  if (!c) {
    return NextResponse.json({ error: 'No conditions' }, { status: 404 })
  }

  // Calculate km/h from knots
  const ventoKmh = Math.round((c.ventoVelocidadeKt ?? 0) * 1.852)

  // Moon phase from illumination
  const luaIlum = c.luaIluminacao ?? 0.5
  let luaFase = 'crescente'
  if (luaIlum < 0.1) luaFase = 'nova'
  else if (luaIlum > 0.9) luaFase = 'cheia'
  else if (luaIlum >= 0.6) luaFase = 'minguante'

  return NextResponse.json({
    ventoKmh,
    ondaM: Math.round((c.ondaAlturaM ?? 0) * 10) / 10,
    pressaoHpa: Math.round(c.pressaoHpa ?? 1013),
    tempAgua: Math.round((c.temperaturaAgua ?? 22) * 10) / 10,
    luaFase,
    mareFase: c.mareFase ?? 'subindo',
    timestamp: latest.timestamp,
  })
}
