import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pescariaVisitas } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const [created] = db.insert(pescariaVisitas).values({
    pescariaId: parseInt(id),
    pesqueiroId: body.pesqueiroId ?? null,
    nomePersonalizado: body.nomePersonalizado ?? null,
    lat: body.lat ?? null,
    lon: body.lon ?? null,
    horaFim: body.horaFim ?? null,
    especie: body.especie ?? null,
    quantidade: body.quantidade ?? null,
    isca: body.isca ?? null,
    tecnica: body.tecnica ?? null,
    notas: body.notas ?? null,
  }).returning().all()
  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const visitaId = url.searchParams.get('visitaId')
  if (!visitaId) return NextResponse.json({ error: 'visitaId required' }, { status: 400 })
  db.delete(pescariaVisitas).where(eq(pescariaVisitas.id, parseInt(visitaId))).run()
  return NextResponse.json({ deleted: true })
}
