import { NextResponse } from 'next/server'
import { buildDashboardData } from './data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = buildDashboardData()
    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
