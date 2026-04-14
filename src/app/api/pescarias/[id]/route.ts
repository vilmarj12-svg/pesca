import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pescarias, pescariaPontos, pescariaVisitas, pescariaFotos } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pescariaId = parseInt(id)
  const pescaria = db.select().from(pescarias).where(eq(pescarias.id, pescariaId)).get()
  if (!pescaria) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const pontos = db.select().from(pescariaPontos).where(eq(pescariaPontos.pescariaId, pescariaId)).orderBy(asc(pescariaPontos.timestamp)).all()
  const visitas = db.select().from(pescariaVisitas).where(eq(pescariaVisitas.pescariaId, pescariaId)).orderBy(asc(pescariaVisitas.horaInicio)).all()
  const fotos = db.select().from(pescariaFotos).where(eq(pescariaFotos.pescariaId, pescariaId)).orderBy(asc(pescariaFotos.timestamp)).all()

  return NextResponse.json({ ...pescaria, pontos, visitas, fotos })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const update: Record<string, unknown> = {}
  if (body.titulo !== undefined) update.titulo = body.titulo
  if (body.notas !== undefined) update.notas = body.notas
  if (body.terminadaEm !== undefined) update.terminadaEm = body.terminadaEm
  db.update(pescarias).set(update).where(eq(pescarias.id, parseInt(id))).run()
  const updated = db.select().from(pescarias).where(eq(pescarias.id, parseInt(id))).get()
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  db.delete(pescarias).where(eq(pescarias.id, parseInt(id))).run()
  return NextResponse.json({ deleted: true })
}
