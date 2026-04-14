import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pescariaPontos } from '@/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  // Support batch or single point
  const points = Array.isArray(body.pontos) ? body.pontos : [body]
  for (const p of points) {
    db.insert(pescariaPontos).values({
      pescariaId: parseInt(id),
      lat: p.lat,
      lon: p.lon,
      accuracy: p.accuracy ?? null,
      speed: p.speed ?? null,
    }).run()
  }
  return NextResponse.json({ added: points.length })
}
