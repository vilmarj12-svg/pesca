import { NextResponse } from 'next/server'
import { buildPesqueiroDetail } from './data'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const data = buildPesqueiroDetail(slug)
  if (!data) {
    return NextResponse.json({ error: 'Pesqueiro not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}
