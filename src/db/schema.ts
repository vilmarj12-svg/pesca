import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const pesqueiros = sqliteTable('pesqueiros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  tipo: text('tipo').notNull(),
  profundidadeM: real('profundidade_m'),
  distanciaCostaMn: real('distancia_costa_mn'),
  especiesAlvo: text('especies_alvo', { mode: 'json' }).notNull().$type<string[]>(),
  notas: text('notas'),
  pesosOverride: text('pesos_override', { mode: 'json' }).$type<Record<string, number>>(),
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  criadoEm: text('criado_em').notNull().default(sql`(datetime('now'))`),
  atualizadoEm: text('atualizado_em').notNull().default(sql`(datetime('now'))`),
})

export const runs = sqliteTable('runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  iniciadoEm: text('iniciado_em').notNull().default(sql`(datetime('now'))`),
  terminadoEm: text('terminado_em'),
  status: text('status').notNull(),
  fontesConsultadas: text('fontes_consultadas', { mode: 'json' }).$type<Record<string, string>>(),
  erro: text('erro'),
})

export const snapshots = sqliteTable('snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pesqueiroId: integer('pesqueiro_id').notNull().references(() => pesqueiros.id),
  timestamp: text('timestamp').notNull(),
  score: integer('score').notNull(),
  classificacao: text('classificacao').notNull(),
  breakdown: text('breakdown', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
  condicoes: text('condicoes', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
  fonteRunId: integer('fonte_run_id').notNull().references(() => runs.id),
})

export const alertasEnviados = sqliteTable('alertas_enviados', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pesqueiroId: integer('pesqueiro_id').notNull().references(() => pesqueiros.id),
  janelaInicio: text('janela_inicio').notNull(),
  janelaFim: text('janela_fim').notNull(),
  scoreMedio: integer('score_medio').notNull(),
  enviadoEm: text('enviado_em').notNull().default(sql`(datetime('now'))`),
  canal: text('canal').notNull().default('telegram'),
})

export const config = sqliteTable('config', {
  chave: text('chave').primaryKey(),
  valor: text('valor', { mode: 'json' }).notNull().$type<unknown>(),
  atualizadoEm: text('atualizado_em').notNull().default(sql`(datetime('now'))`),
})

export const especiesTemporada = sqliteTable('especies_temporada', {
  especie: text('especie').primaryKey(),
  mesesAtivos: text('meses_ativos', { mode: 'json' }).notNull().$type<number[]>(),
  tempAguaMin: real('temp_agua_min').notNull(),
  tempAguaMax: real('temp_agua_max').notNull(),
  luaPreferida: text('lua_preferida').notNull().default('qualquer'),
  tiposPesqueiro: text('tipos_pesqueiro', { mode: 'json' }).notNull().$type<string[]>(),
  profundidadeMinM: real('profundidade_min_m'),
  profundidadeMaxM: real('profundidade_max_m'),
  iscas: text('iscas', { mode: 'json' }).notNull().$type<string[]>(),
  tecnica: text('tecnica').notNull(),
  notas: text('notas'),
})

export const iscas = sqliteTable('iscas', {
  nome: text('nome').primaryKey(),
  tipo: text('tipo').notNull(),
  especiesAlvo: text('especies_alvo', { mode: 'json' }).notNull().$type<string[]>(),
  condicoesIdeais: text('condicoes_ideais'),
  disponibilidade: text('disponibilidade'),
})

export const cacheNavios = sqliteTable('cache_navios', {
  mmsi: integer('mmsi').primaryKey(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  nomeNavio: text('nome_navio'),
  primeiroVistoEm: text('primeiro_visto_em').notNull(),
  ultimoVistoEm: text('ultimo_visto_em').notNull(),
  status: text('status').notNull(),
})
