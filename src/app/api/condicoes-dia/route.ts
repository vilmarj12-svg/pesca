import { NextResponse } from 'next/server'
import { db } from '@/db'
import { snapshots } from '@/db/schema'
import { sql, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const dateParam = url.searchParams.get('date') // YYYY-MM-DD
  const hourParam = url.searchParams.get('hour') // HH (ex: 06, 10, 14)

  let rows

  if (dateParam && hourParam) {
    // Buscar snapshot da hora específica (ex: 2026-04-21T06)
    const prefix = `${dateParam}T${hourParam.padStart(2, '0')}`
    rows = db
      .select()
      .from(snapshots)
      .where(sql`${snapshots.timestamp} LIKE ${prefix + '%'}`)
      .all()
  } else if (dateParam) {
    // Buscar todos os snapshots do dia
    rows = db
      .select()
      .from(snapshots)
      .where(sql`${snapshots.timestamp} LIKE ${dateParam + '%'}`)
      .all()
  } else {
    // Sem data = snapshot mais recente
    rows = db.select().from(snapshots).orderBy(desc(snapshots.id)).limit(24).all()
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Sem dados para essa data/hora', found: false }, { status: 404 })
  }

  const condicoes = rows
    .map(r => r.condicoes as Record<string, any>)
    .filter(Boolean)

  if (condicoes.length === 0) {
    return NextResponse.json({ error: 'Sem condições registradas', found: false }, { status: 404 })
  }

  const ventos = condicoes.map(c => (c.ventoVelocidadeKt ?? 0) * 1.852)
  const ondas = condicoes.map(c => c.ondaAlturaM ?? 0)
  const pressoes = condicoes.map(c => c.pressaoHpa ?? 1013)
  const tempsAgua = condicoes.map(c => c.temperaturaAgua ?? 22)

  const luaIlum = condicoes[0].luaIluminacao ?? 0.5
  let luaFase = 'crescente'
  if (luaIlum < 0.1) luaFase = 'nova'
  else if (luaIlum > 0.9) luaFase = 'cheia'
  else if (luaIlum >= 0.6) luaFase = 'minguante'

  const mareFase = condicoes[0].mareFase ?? 'subindo'

  // Se hora específica, retornar valor exato (não min/max)
  if (hourParam && condicoes.length > 0) {
    const c = condicoes[0]
    const vento = Math.round((c.ventoVelocidadeKt ?? 0) * 1.852)
    return NextResponse.json({
      found: true,
      totalSnapshots: rows.length,
      exact: true,
      ventoKmh: vento,
      ventoMinKmh: vento,
      ventoMaxKmh: vento,
      ondaM: Math.round((c.ondaAlturaM ?? 0) * 10) / 10,
      ondaMin: Math.round((c.ondaAlturaM ?? 0) * 10) / 10,
      ondaMax: Math.round((c.ondaAlturaM ?? 0) * 10) / 10,
      pressaoHpa: Math.round(c.pressaoHpa ?? 1013),
      pressaoMin: Math.round(c.pressaoHpa ?? 1013),
      pressaoMax: Math.round(c.pressaoHpa ?? 1013),
      tempAgua: Math.round((c.temperaturaAgua ?? 22) * 10) / 10,
      tempAguaMin: Math.round((c.temperaturaAgua ?? 22) * 10) / 10,
      tempAguaMax: Math.round((c.temperaturaAgua ?? 22) * 10) / 10,
      luaFase,
      mareFase,
    })
  }

  return NextResponse.json({
    found: true,
    totalSnapshots: rows.length,
    exact: false,
    ventoMinKmh: Math.round(Math.min(...ventos)),
    ventoMaxKmh: Math.round(Math.max(...ventos)),
    ondaMin: Math.round(Math.min(...ondas) * 10) / 10,
    ondaMax: Math.round(Math.max(...ondas) * 10) / 10,
    pressaoMin: Math.round(Math.min(...pressoes)),
    pressaoMax: Math.round(Math.max(...pressoes)),
    tempAguaMin: Math.round(Math.min(...tempsAgua) * 10) / 10,
    tempAguaMax: Math.round(Math.max(...tempsAgua) * 10) / 10,
    luaFase,
    mareFase,
  })
}
