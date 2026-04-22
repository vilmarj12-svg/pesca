import { NextResponse } from 'next/server'
import { db } from '@/db'
import { snapshots } from '@/db/schema'
import { sql, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const dateParam = url.searchParams.get('date') // YYYY-MM-DD

  let rows

  if (dateParam) {
    // Buscar snapshots do dia específico (horas de pesca: 04-14)
    rows = db
      .select()
      .from(snapshots)
      .where(sql`${snapshots.timestamp} LIKE ${dateParam + '%'}`)
      .all()
  } else {
    // Sem data = snapshot mais recente
    const latest = db.select().from(snapshots).orderBy(desc(snapshots.id)).limit(24).all()
    rows = latest
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Sem dados para essa data', found: false }, { status: 404 })
  }

  // Extrair condições de todos os snapshots daquele dia
  const condicoes = rows
    .map(r => r.condicoes as Record<string, any>)
    .filter(Boolean)

  if (condicoes.length === 0) {
    return NextResponse.json({ error: 'Sem condições registradas', found: false }, { status: 404 })
  }

  // Calcular min/max de cada fator
  const ventos = condicoes.map(c => (c.ventoVelocidadeKt ?? 0) * 1.852)
  const ondas = condicoes.map(c => c.ondaAlturaM ?? 0)
  const pressoes = condicoes.map(c => c.pressaoHpa ?? 1013)
  const tempsAgua = condicoes.map(c => c.temperaturaAgua ?? 22)

  // Lua — pegar do primeiro
  const luaIlum = condicoes[0].luaIluminacao ?? 0.5
  let luaFase = 'crescente'
  if (luaIlum < 0.1) luaFase = 'nova'
  else if (luaIlum > 0.9) luaFase = 'cheia'
  else if (luaIlum >= 0.6) luaFase = 'minguante'

  // Maré — pegar do primeiro
  const mareFase = condicoes[0].mareFase ?? 'subindo'

  return NextResponse.json({
    found: true,
    totalSnapshots: rows.length,
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
