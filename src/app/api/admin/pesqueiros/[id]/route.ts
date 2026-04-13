import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pesqueiros } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { checkAdminToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await request.json()
  db.update(pesqueiros)
    .set({ ...body, atualizadoEm: new Date().toISOString() })
    .where(eq(pesqueiros.id, parseInt(id)))
    .run()
  const updated = db.select().from(pesqueiros).where(eq(pesqueiros.id, parseInt(id))).get()
  return NextResponse.json(updated)
}
