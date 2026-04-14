import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pescarias, pescariaPontos, pescariaVisitas, pescariaFotos } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const all = db.select().from(pescarias).orderBy(desc(pescarias.iniciadaEm)).all()
  const result = all.map((p) => {
    const pontos = db.select().from(pescariaPontos).where(eq(pescariaPontos.pescariaId, p.id)).all()
    const visitas = db.select().from(pescariaVisitas).where(eq(pescariaVisitas.pescariaId, p.id)).all()
    const fotoCount = db.select().from(pescariaFotos).where(eq(pescariaFotos.pescariaId, p.id)).all().length
    return {
      ...p,
      totalPontos: pontos.length,
      totalVisitas: visitas.length,
      totalFotos: fotoCount,
    }
  })
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [created] = db.insert(pescarias).values({
    titulo: body.titulo || `Pescaria ${new Date().toLocaleDateString('pt-BR')}`,
    notas: body.notas || null,
    condicoes: body.condicoes || null,
  }).returning().all()
  return NextResponse.json(created, { status: 201 })
}
