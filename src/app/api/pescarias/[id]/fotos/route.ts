import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pescariaFotos } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  if (!body.dataUrl) return NextResponse.json({ error: 'dataUrl required' }, { status: 400 })
  const [created] = db.insert(pescariaFotos).values({
    pescariaId: parseInt(id),
    dataUrl: body.dataUrl,
    legenda: body.legenda ?? null,
    lat: body.lat ?? null,
    lon: body.lon ?? null,
  }).returning().all()
  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const fotoId = url.searchParams.get('fotoId')
  if (!fotoId) return NextResponse.json({ error: 'fotoId required' }, { status: 400 })
  db.delete(pescariaFotos).where(eq(pescariaFotos.id, parseInt(fotoId))).run()
  return NextResponse.json({ deleted: true })
}
