import { NextResponse } from 'next/server'
import { buildDashboardData } from './data'
import { getCached, setCache } from '@/lib/cache'

export const dynamic = 'force-dynamic'
const CACHE_KEY = 'dashboard'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export async function GET() {
  try {
    const cached = getCached(CACHE_KEY)
    if (cached) return NextResponse.json(cached)

    const data = buildDashboardData()
    setCache(CACHE_KEY, data, CACHE_TTL)
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
