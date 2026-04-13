import { NextResponse } from 'next/server'
import { runRefresh } from '@/cron/refresh'
import { checkAdminToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!checkAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runRefresh()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
