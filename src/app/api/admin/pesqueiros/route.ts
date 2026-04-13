import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pesqueiros } from '@/db/schema'
import { checkAdminToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!checkAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const all = db.select().from(pesqueiros).all()
  return NextResponse.json(all)
}

export async function POST(request: Request) {
  if (!checkAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const [created] = db.insert(pesqueiros).values({
    slug: body.slug,
    nome: body.nome,
    lat: body.lat,
    lon: body.lon,
    tipo: body.tipo,
    profundidadeM: body.profundidadeM ?? null,
    distanciaCostaMn: body.distanciaCostaMn ?? null,
    especiesAlvo: body.especiesAlvo ?? [],
    notas: body.notas ?? null,
  }).returning().all()
  return NextResponse.json(created, { status: 201 })
}
