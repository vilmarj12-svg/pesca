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

  CREATE TABLE IF NOT EXISTS pescarias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    iniciada_em TEXT NOT NULL DEFAULT (datetime('now')),
    terminada_em TEXT,
    notas TEXT,
    condicoes TEXT
  );

  CREATE TABLE IF NOT EXISTS pescaria_pontos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pescaria_id INTEGER NOT NULL REFERENCES pescarias(id) ON DELETE CASCADE,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    accuracy REAL,
    speed REAL
  );

  CREATE TABLE IF NOT EXISTS pescaria_visitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pescaria_id INTEGER NOT NULL REFERENCES pescarias(id) ON DELETE CASCADE,
    pesqueiro_id INTEGER REFERENCES pesqueiros(id),
    nome_personalizado TEXT,
    lat REAL,
    lon REAL,
    hora_inicio TEXT NOT NULL DEFAULT (datetime('now')),
    hora_fim TEXT,
    especie TEXT,
    quantidade INTEGER,
    isca TEXT,
    tecnica TEXT,
    notas TEXT
  );

  CREATE TABLE IF NOT EXISTS pescaria_fotos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pescaria_id INTEGER NOT NULL REFERENCES pescarias(id) ON DELETE CASCADE,
    data_url TEXT NOT NULL,
    legenda TEXT,
    lat REAL,
    lon REAL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Check if data exists, seed if empty
const count = sqlite.prepare('SELECT count(*) as c FROM pesqueiros').get() as { c: number }

if (count.c === 0) {
  console.log('Database empty — seeding...')
  // Import seed data arrays and insert directly
  const { SEED_PESQUEIROS, SEED_ESPECIES, SEED_ISCAS } = await import('../src/db/seed')
  const { DEFAULT_WEIGHTS } = await import('../src/engine/constants')

  const insertPesqueiro = sqlite.prepare(`INSERT OR IGNORE INTO pesqueiros (slug, nome, lat, lon, tipo, profundidade_m, distancia_costa_mn, especies_alvo, notas, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const p of SEED_PESQUEIROS) {
    insertPesqueiro.run(p.slug, p.nome, p.lat, p.lon, p.tipo, (p as any).profundidadeM ?? null, (p as any).distanciaCostaMn ?? null, JSON.stringify(p.especiesAlvo), (p as any).notas ?? null, p.ativo ? 1 : 0)
  }
  console.log(`  Inserted ${SEED_PESQUEIROS.length} pesqueiros`)

  const insertEspecie = sqlite.prepare(`INSERT OR IGNORE INTO especies_temporada (especie, meses_ativos, temp_agua_min, temp_agua_max, lua_preferida, tipos_pesqueiro, iscas, tecnica, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const e of SEED_ESPECIES) {
    insertEspecie.run(e.especie, JSON.stringify(e.mesesAtivos), e.tempAguaMin, e.tempAguaMax, e.luaPreferida, JSON.stringify(e.tiposPesqueiro), JSON.stringify(e.iscas), e.tecnica, e.notas ?? null)
  }
  console.log(`  Inserted ${SEED_ESPECIES.length} espécies`)

  const insertIsca = sqlite.prepare(`INSERT OR IGNORE INTO iscas (nome, tipo, especies_alvo, condicoes_ideais, disponibilidade) VALUES (?, ?, ?, ?, ?)`)
  for (const i of SEED_ISCAS) {
    insertIsca.run(i.nome, i.tipo, JSON.stringify(i.especiesAlvo), i.condicoesIdeais ?? null, i.disponibilidade ?? null)
  }
  console.log(`  Inserted ${SEED_ISCAS.length} iscas`)

  sqlite.prepare(`INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)`).run('pesos', JSON.stringify(DEFAULT_WEIGHTS))
  console.log('  Inserted config pesos')

  // Seed ships — real vessels from Paranaguá port (VesselFinder + MyShipTracking)
  const now = new Date().toISOString()
  const insertShip = sqlite.prepare(`INSERT OR IGNORE INTO cache_navios (mmsi, lat, lon, nome_navio, primeiro_visto_em, ultimo_visto_em, status) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const ships = [
    // Atracados no porto
    [413687000, -25.5035, -48.5165, 'YIN ZHU HAI', 36, 'atracado'],
    [314167000, -25.5055, -48.5185, 'SOLARA', 60, 'atracado'],
    [215071000, -25.5015, -48.5205, 'ROSSA', 240, 'atracado'],
    [314001133, -25.5075, -48.5145, 'KEFALONIA', 228, 'atracado'],
    [352003460, -25.5045, -48.5225, 'BOW LYNX', 72, 'atracado'],
    [538010106, -25.5025, -48.5135, 'YASA ROSE', 24, 'atracado'],
    [9701140, -25.5090, -48.5110, 'GOODWOOD', 48, 'atracado'],
    [9949261, -25.5065, -48.5195, 'SDM SHENYANG', 72, 'atracado'],
    [9997919, -25.5040, -48.5175, 'GREEN RIZHAO', 36, 'atracado'],
    [9429431, -25.5080, -48.5155, 'IOLCOS HARMONY', 96, 'atracado'],
    // Fundeados — área de espera ao sul da barra
    [9808326, -25.6500, -48.3050, 'RAPHAEL', 48, 'at_anchor'],
    [9808327, -25.6650, -48.2900, 'DONATELLO', 120, 'at_anchor'],
    [9949170, -25.6800, -48.3150, 'YANGZE 25', 72, 'at_anchor'],
    [9472751, -25.7000, -48.2800, 'ZURICH STAR', 168, 'at_anchor'],
    [9605279, -25.6350, -48.3200, 'CAPE KENNEDY', 60, 'at_anchor'],
    [9379131, -25.7150, -48.2700, 'W-ORIGINAL', 192, 'at_anchor'],
    [9425186, -25.6900, -48.2950, 'CHIPOL GUANGAN', 18, 'at_anchor'],
    [9952165, -25.6550, -48.3100, 'BOW LEOPARD', 12, 'at_anchor'],
    [9883845, -25.7300, -48.2600, 'TAI KNIGHTHOOD', 96, 'at_anchor'],
    [9711133, -25.6750, -48.2850, 'XENIA', 144, 'at_anchor'],
    [9561265, -25.7100, -48.3000, 'ELEGANT ACE', 36, 'at_anchor'],
    [9808328, -25.6600, -48.2750, 'DIADEMA', 60, 'at_anchor'],
    [9983449, -25.7200, -48.2900, 'GREEN PARK', 24, 'at_anchor'],
    [9949171, -25.6950, -48.3050, 'YASA RUBY', 84, 'at_anchor'],
    [9472752, -25.7050, -48.2650, 'ORWELL', 108, 'at_anchor'],
    [538005773, -25.6700, -48.3200, 'HAFNIA AMETRINE', 6, 'at_anchor'],
    [636017741, -25.6850, -48.2800, 'SOUTHERN PUMA', 8, 'at_anchor'],
    [636018068, -25.7250, -48.2750, 'MSC AVNI', 4, 'at_anchor'],
    [538007629, -25.6450, -48.3150, 'KOSMAN', 10, 'at_anchor'],
    [355900000, -25.7350, -48.2850, 'AQUILA', 48, 'at_anchor'],
    [563271500, -25.6400, -48.2950, 'DRACO', 30, 'at_anchor'],
    // Rebocadores e trânsito
    [710010860, -25.5800, -48.3200, 'SAAM TUPINAMBA', 8, 'navegando'],
    [710003280, -25.5850, -48.3100, 'MERCURIUS', 24, 'navegando'],
    [710400027, -25.5060, -48.5130, 'SVITZER COPACABANA', 480, 'atracado'],
    [710005320, -25.5900, -48.3000, 'REGULUS', 8, 'navegando'],
    [309847000, -25.5750, -48.3150, 'TARIFA', 2, 'navegando'],
    [229626000, -25.5950, -48.2950, 'MSC AMALFI', 1, 'navegando'],
    [636019077, -25.6200, -48.2700, 'CORDOBA', 3, 'navegando'],
  ]
  for (const [mmsi, lat, lon, nome, hoursAgo, status] of ships) {
    const firstSeen = new Date(Date.now() - (hoursAgo as number) * 3600000).toISOString()
    insertShip.run(mmsi, lat, lon, nome, firstSeen, now, status)
  }
  console.log(`  Inserted ${ships.length} ships`)

  console.log('Seed complete.')
} else {
  console.log(`Database OK — ${count.c} pesqueiros found.`)
}

// Always ensure ships exist
const shipCount = sqlite.prepare('SELECT count(*) as c FROM cache_navios').get() as { c: number }
if (shipCount.c === 0) {
  console.log('No ships — seeding ships...')
  const now = new Date().toISOString()
  const insertShip = sqlite.prepare(`INSERT OR IGNORE INTO cache_navios (mmsi, lat, lon, nome_navio, primeiro_visto_em, ultimo_visto_em, status) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const ships: [number, number, number, string, number, string][] = [
    [413687000, -25.5035, -48.5165, 'YIN ZHU HAI', 36, 'atracado'],
    [314167000, -25.5055, -48.5185, 'SOLARA', 60, 'atracado'],
    [215071000, -25.5015, -48.5205, 'ROSSA', 240, 'atracado'],
    [314001133, -25.5075, -48.5145, 'KEFALONIA', 228, 'atracado'],
    [352003460, -25.5045, -48.5225, 'BOW LYNX', 72, 'atracado'],
    [538010106, -25.5025, -48.5135, 'YASA ROSE', 24, 'atracado'],
    [9701140, -25.5090, -48.5110, 'GOODWOOD', 48, 'atracado'],
    [9949261, -25.5065, -48.5195, 'SDM SHENYANG', 72, 'atracado'],
    [9997919, -25.5040, -48.5175, 'GREEN RIZHAO', 36, 'atracado'],
    [9429431, -25.5080, -48.5155, 'IOLCOS HARMONY', 96, 'atracado'],
    [9808326, -25.6500, -48.3050, 'RAPHAEL', 48, 'at_anchor'],
    [9808327, -25.6650, -48.2900, 'DONATELLO', 120, 'at_anchor'],
    [9949170, -25.6800, -48.3150, 'YANGZE 25', 72, 'at_anchor'],
    [9472751, -25.7000, -48.2800, 'ZURICH STAR', 168, 'at_anchor'],
    [9605279, -25.6350, -48.3200, 'CAPE KENNEDY', 60, 'at_anchor'],
    [9379131, -25.7150, -48.2700, 'W-ORIGINAL', 192, 'at_anchor'],
    [9425186, -25.6900, -48.2950, 'CHIPOL GUANGAN', 18, 'at_anchor'],
    [9952165, -25.6550, -48.3100, 'BOW LEOPARD', 12, 'at_anchor'],
    [9883845, -25.7300, -48.2600, 'TAI KNIGHTHOOD', 96, 'at_anchor'],
    [9711133, -25.6750, -48.2850, 'XENIA', 144, 'at_anchor'],
    [9561265, -25.7100, -48.3000, 'ELEGANT ACE', 36, 'at_anchor'],
    [9808328, -25.6600, -48.2750, 'DIADEMA', 60, 'at_anchor'],
    [9983449, -25.7200, -48.2900, 'GREEN PARK', 24, 'at_anchor'],
    [9949171, -25.6950, -48.3050, 'YASA RUBY', 84, 'at_anchor'],
    [9472752, -25.7050, -48.2650, 'ORWELL', 108, 'at_anchor'],
    [538005773, -25.6700, -48.3200, 'HAFNIA AMETRINE', 6, 'at_anchor'],
    [636017741, -25.6850, -48.2800, 'SOUTHERN PUMA', 8, 'at_anchor'],
    [636018068, -25.7250, -48.2750, 'MSC AVNI', 4, 'at_anchor'],
    [538007629, -25.6450, -48.3150, 'KOSMAN', 10, 'at_anchor'],
    [355900000, -25.7350, -48.2850, 'AQUILA', 48, 'at_anchor'],
    [563271500, -25.6400, -48.2950, 'DRACO', 30, 'at_anchor'],
    [710010860, -25.5800, -48.3200, 'SAAM TUPINAMBA', 8, 'navegando'],
    [710003280, -25.5850, -48.3100, 'MERCURIUS', 24, 'navegando'],
    [710400027, -25.5060, -48.5130, 'SVITZER COPACABANA', 480, 'atracado'],
    [710005320, -25.5900, -48.3000, 'REGULUS', 8, 'navegando'],
    [309847000, -25.5750, -48.3150, 'TARIFA', 2, 'navegando'],
    [229626000, -25.5950, -48.2950, 'MSC AMALFI', 1, 'navegando'],
    [636019077, -25.6200, -48.2700, 'CORDOBA', 3, 'navegando'],
  ]
  for (const [mmsi, lat, lon, nome, hoursAgo, status] of ships) {
    const firstSeen = new Date(Date.now() - hoursAgo * 3600000).toISOString()
    insertShip.run(mmsi, lat, lon, nome, firstSeen, now, status)
  }
  console.log(`  Inserted ${ships.length} ships`)
}

sqlite.close()
