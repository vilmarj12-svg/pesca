import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pesqueiros, runs } from '@/db/schema'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pesqueiroCount = db.select().from(pesqueiros).all().length
    const lastRun = db.select().from(runs).orderBy(desc(runs.id)).limit(1).get()

    const lastRunAge = lastRun
      ? Math.round((Date.now() - new Date(lastRun.iniciadoEm).getTime()) / 60000)
      : null

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: { pesqueiros: pesqueiroCount },
      lastRun: lastRun ? {
        id: lastRun.id,
        status: lastRun.status,
        agoMinutes: lastRunAge,
      } : null,
    })
  } catch (e) {
    return NextResponse.json({
      status: 'error',
      error: e instanceof Error ? e.message : String(e),
    }, { status: 503 })
  }
}
