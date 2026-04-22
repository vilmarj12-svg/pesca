import { NextResponse } from 'next/server'
import { db } from '@/db'
import { diasIdeais } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const all = db.select().from(diasIdeais).orderBy(desc(diasIdeais.criadoEm)).all()
  return NextResponse.json(all)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [created] = db.insert(diasIdeais).values({
    titulo: body.titulo,
    data: body.data,
    pesqueiroSlug: body.pesqueiroSlug ?? null,
    ventoMin: body.ventoMin ?? null,
    ventoMax: body.ventoMax ?? null,
    ondaMin: body.ondaMin ?? null,
    ondaMax: body.ondaMax ?? null,
    pressaoMin: body.pressaoMin ?? null,
    pressaoMax: body.pressaoMax ?? null,
    tempAguaMin: body.tempAguaMin ?? null,
    tempAguaMax: body.tempAguaMax ?? null,
    luaFase: body.luaFase ?? null,
    mareFase: body.mareFase ?? null,
    notas: body.notas ?? null,
  }).returning().all()
  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  db.delete(diasIdeais).where(eq(diasIdeais.id, parseInt(id))).run()
  return NextResponse.json({ deleted: true })
}
