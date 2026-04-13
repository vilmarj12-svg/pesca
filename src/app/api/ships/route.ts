import { NextResponse } from 'next/server'
import { db } from '@/db'
import { cacheNavios } from '@/db/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sixHoursAgo = new Date(Date.now() - 6 * 3600000).toISOString()
  const ships = db
    .select()
    .from(cacheNavios)
    .where(sql`${cacheNavios.ultimoVistoEm} > ${sixHoursAgo}`)
    .all()

  return NextResponse.json(ships)
}
