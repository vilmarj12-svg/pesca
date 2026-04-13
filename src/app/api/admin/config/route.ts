import { NextResponse } from 'next/server'
import { db } from '@/db'
import { config } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { checkAdminToken } from '@/lib/admin-auth'
import { DEFAULT_WEIGHTS } from '@/engine/constants'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!checkAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const pesosRow = db.select().from(config).where(eq(config.chave, 'pesos')).get()
  const pesos = (pesosRow?.valor as Record<string, number>) ?? DEFAULT_WEIGHTS
  return NextResponse.json({ pesos })
}

export async function PUT(request: Request) {
  if (!checkAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const existing = db.select().from(config).where(eq(config.chave, 'pesos')).get()
  if (existing) {
    db.update(config)
      .set({ valor: body.pesos, atualizadoEm: new Date().toISOString() })
      .where(eq(config.chave, 'pesos'))
      .run()
  } else {
    db.insert(config).values({ chave: 'pesos', valor: body.pesos }).run()
  }
  return NextResponse.json({ pesos: body.pesos })
}
