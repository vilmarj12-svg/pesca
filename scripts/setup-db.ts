import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const DATABASE_URL = process.env.DATABASE_URL || './data/pesca.db'

// Ensure data directory exists
const dir = dirname(DATABASE_URL)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
  console.log(`Created directory: ${dir}`)
}

const sqlite = new Database(DATABASE_URL)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS pesqueiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    tipo TEXT NOT NULL,
    profundidade_m REAL,
    distancia_costa_mn REAL,
    especies_alvo TEXT NOT NULL DEFAULT '[]',
    notas TEXT,
    pesos_override TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iniciado_em TEXT NOT NULL DEFAULT (datetime('now')),
    terminado_em TEXT,
    status TEXT NOT NULL,
    fontes_consultadas TEXT,
    erro TEXT
  );

  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pesqueiro_id INTEGER NOT NULL REFERENCES pesqueiros(id),
    timestamp TEXT NOT NULL,
    score INTEGER NOT NULL,
    classificacao TEXT NOT NULL,
    breakdown TEXT NOT NULL,
    condicoes TEXT NOT NULL,
    fonte_run_id INTEGER NOT NULL REFERENCES runs(id)
  );

  CREATE TABLE IF NOT EXISTS alertas_enviados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pesqueiro_id INTEGER NOT NULL REFERENCES pesqueiros(id),
    janela_inicio TEXT NOT NULL,
    janela_fim TEXT NOT NULL,
    score_medio INTEGER NOT NULL,
    enviado_em TEXT NOT NULL DEFAULT (datetime('now')),
    canal TEXT NOT NULL DEFAULT 'telegram'
  );

  CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS especies_temporada (
    especie TEXT PRIMARY KEY,
    meses_ativos TEXT NOT NULL,
    temp_agua_min REAL NOT NULL,
    temp_agua_max REAL NOT NULL,
    lua_preferida TEXT NOT NULL DEFAULT 'qualquer',
    tipos_pesqueiro TEXT NOT NULL,
    profundidade_min_m REAL,
    profundidade_max_m REAL,
    iscas TEXT NOT NULL,
    tecnica TEXT NOT NULL,
    notas TEXT
  );

  CREATE TABLE IF NOT EXISTS iscas (
    nome TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    especies_alvo TEXT NOT NULL,
    condicoes_ideais TEXT,
    disponibilidade TEXT
  );

  CREATE TABLE IF NOT EXISTS cache_navios (
    mmsi INTEGER PRIMARY KEY,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    nome_navio TEXT,
    primeiro_visto_em TEXT NOT NULL,
    ultimo_visto_em TEXT NOT NULL,
    status TEXT NOT NULL
  );
`)

// Check if data exists
const count = sqlite.prepare('SELECT count(*) as c FROM pesqueiros').get() as { c: number }

if (count.c === 0) {
  console.log('Database empty — running seed...')
  sqlite.close()
  import('../src/db/seed').then(() => {
    console.log('Seed complete.')
  })
} else {
  console.log(`Database OK — ${count.c} pesqueiros found.`)
  sqlite.close()
}
