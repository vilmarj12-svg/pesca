import { db } from '@/db'
import { pesqueiros, snapshots } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { DetalhePesqueiroData, CondicaoBruta, SnapshotGrafico, FatorBreakdownView } from '@/lib/types'

export function buildPesqueiroDetail(slug: string): DetalhePesqueiroData | null {
  const p = db.select().from(pesqueiros).where(eq(pesqueiros.slug, slug)).get()
  if (!p) return null

  const latest = db
    .select()
    .from(snapshots)
    .where(eq(snapshots.pesqueiroId, p.id))
    .orderBy(desc(snapshots.id))
    .limit(1)
    .get()

  const breakdown = latest?.breakdown as Record<string, any> | undefined
  const condicoes = latest?.condicoes as Record<string, any> | undefined

  const snaps72h = db
    .select()
    .from(snapshots)
    .where(eq(snapshots.pesqueiroId, p.id))
    .orderBy(desc(snapshots.id))
    .limit(72)
    .all()
    .reverse()

  const grafico72h: SnapshotGrafico[] = snaps72h.map((s) => ({
    timestamp: s.timestamp,
    score: s.score,
    classificacao: s.classificacao as any,
  }))

  const snaps24h = snaps72h.slice(-24)
  const condicoes24h: CondicaoBruta[] = snaps24h.map((s) => {
    const c = s.condicoes as Record<string, any>
    const hora = new Date(s.timestamp)
    const hourStr = `${hora.getHours().toString().padStart(2, '0')}:00`

    const pressaoSerie = (c?.pressaoSerie12h as number[]) ?? []
    let pressaoTendencia: 'subindo' | 'descendo' | 'estavel' = 'estavel'
    if (pressaoSerie.length >= 2) {
      const diff = pressaoSerie[pressaoSerie.length - 1] - pressaoSerie[0]
      if (diff > 1) pressaoTendencia = 'subindo'
      else if (diff < -1) pressaoTendencia = 'descendo'
    }

    const luaIlum = c?.luaIluminacao ?? 0.5
    let faseLua = 'crescente'
    if (luaIlum < 0.1) faseLua = 'nova'
    else if (luaIlum > 0.9) faseLua = 'cheia'
    else if (luaIlum >= 0.6) faseLua = 'minguante'

    return {
      hora: hourStr,
      score: s.score,
      classificacao: s.classificacao as any,
      ventoVelocidade: Math.round((c?.ventoVelocidadeKt ?? 0) * 10) / 10,
      ventoDirecao: c?.ventoDirecaoGraus ?? 0,
      ondaAltura: Math.round((c?.ondaAlturaM ?? 0) * 10) / 10,
      ondaPeriodo: Math.round(c?.ondaPeriodoS ?? 0),
      mareAltura: Math.round((c?.mareAlturaM ?? 0) * 10) / 10,
      mareFase: (c?.mareFase as any) ?? 'subindo',
      pressao: Math.round(c?.pressaoHpa ?? 1013),
      pressaoTendencia,
      tempAgua: Math.round((c?.temperaturaAgua ?? 22) * 10) / 10,
      tempAr: Math.round((c?.temperaturaAr ?? 25) * 10) / 10,
      faseLua,
    }
  })

  const fatores: FatorBreakdownView[] = (breakdown?.fatores as any[]) ?? []

  return {
    pesqueiro: {
      id: p.id,
      slug: p.slug,
      nome: p.nome,
      lat: p.lat,
      lon: p.lon,
      tipo: p.tipo,
      profundidadeM: p.profundidadeM,
      distanciaCostaMn: p.distanciaCostaMn,
      especiesAlvo: p.especiesAlvo as string[],
      notas: p.notas,
      scoreAtual: latest?.score ?? 0,
      classificacao: (latest?.classificacao as any) ?? 'ruim',
    },
    breakdown: {
      score: latest?.score ?? 0,
      classificacao: (latest?.classificacao as any) ?? 'ruim',
      fatores,
      safetyOverride: (breakdown?.safetyOverride as boolean) ?? false,
    },
    grafico72h,
    condicoes24h,
  }
}
