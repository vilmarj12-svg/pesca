import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pesqueiros, snapshots } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { sendMessage } from '@/telegram/send'
import { buildDailySummaryText } from '@/telegram/daily-summary'
import { findWindows } from '@/engine/windows'
import type { PesqueiroResumo } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const expectedToken = process.env.ADMIN_TOKEN
  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allPesqueiros = db
      .select()
      .from(pesqueiros)
      .where(eq(pesqueiros.ativo, true))
      .all()

    const resumos: PesqueiroResumo[] = allPesqueiros.map((p) => {
      const snap = db
        .select()
        .from(snapshots)
        .where(eq(snapshots.pesqueiroId, p.id))
        .orderBy(desc(snapshots.id))
        .limit(1)
        .get()

      const recentSnaps = db
        .select()
        .from(snapshots)
        .where(eq(snapshots.pesqueiroId, p.id))
        .orderBy(desc(snapshots.id))
        .limit(24)
        .all()

      const windows = findWindows(
        recentSnaps.map((s) => ({
          pesqueiroId: s.pesqueiroId,
          timestamp: s.timestamp,
          score: s.score,
          classificacao: s.classificacao as any,
        }))
      )
      const nextWindow = windows[0]
      let proximaJanela: string | null = null
      if (nextWindow) {
        const start = new Date(nextWindow.inicio)
        const end = new Date(nextWindow.fim)
        proximaJanela = `hoje ${start.getHours()}-${end.getHours()}h`
      }

      return {
        id: p.id,
        slug: p.slug,
        nome: p.nome,
        lat: p.lat,
        lon: p.lon,
        tipo: p.tipo,
        scoreAtual: snap?.score ?? 0,
        classificacao: (snap?.classificacao as any) ?? 'ruim',
        proximaJanela,
      }
    })

    const latestSnap = db.select().from(snapshots).orderBy(desc(snapshots.id)).limit(1).get()
    const c = (latestSnap?.condicoes as Record<string, any>) ?? {}

    const text = buildDailySummaryText(
      resumos,
      c.luaIluminacao ?? 0.5,
      c.pressaoHpa ?? 1013,
      c.pressaoVariacao12h ?? 0,
      c.ondaAlturaM ?? 1.0,
      c.ventoVelocidadeKt ?? 10,
      c.ventoDirecaoGraus ?? 180,
    )

    const sent = await sendMessage(text)
    return NextResponse.json({ sent, preview: text })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
