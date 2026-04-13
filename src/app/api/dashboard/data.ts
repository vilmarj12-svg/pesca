import { db } from '@/db'
import { pesqueiros, snapshots, runs, especiesTemporada, iscas } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { findEspeciesEmAlta, findIscasEmAlta } from '@/engine/species'
import { findWindows } from '@/engine/windows'
import type { DashboardData, PesqueiroResumo, RunStatus } from '@/lib/types'

export function buildDashboardData(): DashboardData {
  const allPesqueiros = db
    .select()
    .from(pesqueiros)
    .where(eq(pesqueiros.ativo, true))
    .all()

  const latestRun = db
    .select()
    .from(runs)
    .orderBy(desc(runs.id))
    .limit(1)
    .get()

  const runStatus: RunStatus = latestRun
    ? { ultimaRun: latestRun.iniciadoEm, status: latestRun.status as RunStatus['status'] }
    : { ultimaRun: new Date().toISOString(), status: 'erro' }

  const pesqueiroResumos: PesqueiroResumo[] = allPesqueiros.map((p) => {
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
      .limit(72)
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
      const hoje = new Date()
      const isToday = start.toDateString() === hoje.toDateString()
      const prefix = isToday ? 'hoje' : start.toLocaleDateString('pt-BR', { weekday: 'short' })
      proximaJanela = `${prefix} ${start.getHours()}-${end.getHours()}h`
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

  const allEspecies = db.select().from(especiesTemporada).all()
  const allIscas = db.select().from(iscas).all()

  const latestSnap = db
    .select()
    .from(snapshots)
    .orderBy(desc(snapshots.id))
    .limit(1)
    .get()

  const condicoes = latestSnap?.condicoes as Record<string, any> | undefined
  const now = new Date()

  const especiesEmAlta = findEspeciesEmAlta(
    allEspecies.map((e) => ({
      especie: e.especie,
      mesesAtivos: e.mesesAtivos as number[],
      tempAguaMin: e.tempAguaMin,
      tempAguaMax: e.tempAguaMax,
      luaPreferida: e.luaPreferida as any,
      tiposPesqueiro: e.tiposPesqueiro as string[],
      iscas: e.iscas as string[],
      tecnica: e.tecnica,
      notas: e.notas,
    })),
    {
      mes: now.getMonth() + 1,
      tempAgua: (condicoes?.temperaturaAgua as number) ?? 22,
      luaIluminacao: (condicoes?.luaIluminacao as number) ?? 0.5,
    },
  )

  const iscasEmAlta = findIscasEmAlta(
    allIscas.map((i) => ({
      nome: i.nome,
      tipo: i.tipo as 'natural' | 'artificial',
      especiesAlvo: i.especiesAlvo as string[],
      condicoesIdeais: i.condicoesIdeais,
      disponibilidade: i.disponibilidade,
    })),
    especiesEmAlta,
  )

  return {
    pesqueiros: pesqueiroResumos,
    heatmap: [],
    runStatus,
    especiesEmAlta,
    iscasEmAlta,
  }
}
