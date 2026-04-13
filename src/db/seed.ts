import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { pesqueiros, especiesTemporada, iscas, config } from './schema'
import { DEFAULT_WEIGHTS } from '@/engine/constants'

// ──────────────────────────────────────────────
// Seed data arrays (exported for tests)
// ──────────────────────────────────────────────

export const SEED_PESQUEIROS = [
  {
    slug: 'ilha-dos-currais',
    nome: 'Ilha dos Currais',
    lat: -25.7441,
    lon: -48.3558,
    tipo: 'laje',
    profundidadeM: 18,
    distanciaCostaMn: 8,
    especiesAlvo: ['vermelho', 'garoupa', 'badejo', 'cioba'],
    ativo: true,
  },
  {
    slug: 'naufragio-do-tocoyo',
    nome: 'Naufrágio do Tocoyo',
    lat: -25.6800,
    lon: -48.2900,
    tipo: 'naufragio',
    profundidadeM: 22,
    distanciaCostaMn: 12,
    especiesAlvo: ['garoupa', 'badejo', 'anchova'],
    ativo: true,
  },
  {
    slug: 'parcel-da-galheta',
    nome: 'Parcel da Galheta',
    lat: -25.5900,
    lon: -48.3200,
    tipo: 'parcel',
    profundidadeM: 15,
    distanciaCostaMn: 5,
    especiesAlvo: ['robalo', 'sargo', 'vermelho'],
    ativo: true,
  },
  {
    slug: 'cascalho-dos-30',
    nome: 'Cascalho dos 30',
    lat: -25.8200,
    lon: -48.1500,
    tipo: 'cascalho',
    profundidadeM: 30,
    distanciaCostaMn: 20,
    especiesAlvo: ['vermelho', 'cioba', 'dourado'],
    ativo: true,
  },
  {
    slug: 'naufragio-dos-saveiros',
    nome: 'Naufrágio dos Saveiros',
    lat: -25.5500,
    lon: -48.2700,
    tipo: 'naufragio',
    profundidadeM: 25,
    distanciaCostaMn: 15,
    especiesAlvo: ['garoupa', 'badejo'],
    ativo: false,
  },
  {
    slug: 'fundeadouro-alfa-navios',
    nome: 'Fundeadouro Alfa Navios',
    lat: -25.7100,
    lon: -48.2800,
    tipo: 'fundeadouro',
    profundidadeM: 16,
    distanciaCostaMn: 6,
    especiesAlvo: ['vermelho', 'garoupa', 'robalo', 'anchova'],
    ativo: true,
  },
  {
    slug: 'fundeadouro-bravo-navios',
    nome: 'Fundeadouro Bravo Navios',
    lat: -25.6500,
    lon: -48.2500,
    tipo: 'fundeadouro',
    profundidadeM: 18,
    distanciaCostaMn: 10,
    especiesAlvo: ['vermelho', 'garoupa', 'dourado'],
    ativo: true,
  },
  {
    slug: 'barra-da-galheta-canal',
    nome: 'Barra da Galheta Canal',
    lat: -25.5750,
    lon: -48.3180,
    tipo: 'canal',
    profundidadeM: 14,
    distanciaCostaMn: 2,
    especiesAlvo: ['robalo', 'tainha', 'carapeba', 'sargo'],
    ativo: true,
  },
  {
    slug: 'ilha-do-mel-fortaleza',
    nome: 'Ilha do Mel Fortaleza',
    lat: -25.5000,
    lon: -48.3100,
    tipo: 'baia',
    profundidadeM: 8,
    distanciaCostaMn: 1,
    especiesAlvo: ['robalo', 'tainha', 'parati', 'carapeba'],
    ativo: true,
  },
  {
    slug: 'ilha-das-pecas',
    nome: 'Ilha das Peças',
    lat: -25.4400,
    lon: -48.3000,
    tipo: 'baia',
    profundidadeM: 6,
    distanciaCostaMn: 1,
    especiesAlvo: ['robalo', 'tainha', 'parati'],
    ativo: true,
  },
  {
    slug: 'ponta-do-poco',
    nome: 'Ponta do Poço',
    lat: -25.5480,
    lon: -48.3850,
    tipo: 'baia',
    profundidadeM: 10,
    distanciaCostaMn: 0.5,
    especiesAlvo: ['robalo', 'carapeba', 'sargo', 'badejo'],
    ativo: true,
  },
  {
    slug: 'ilha-da-cotinga',
    nome: 'Ilha da Cotinga',
    lat: -25.5100,
    lon: -48.4000,
    tipo: 'baia',
    profundidadeM: 5,
    distanciaCostaMn: 0.5,
    especiesAlvo: ['robalo', 'tainha', 'parati'],
    ativo: true,
  },
  {
    slug: 'barra-de-guaratuba',
    nome: 'Barra de Guaratuba',
    lat: -25.8800,
    lon: -48.5750,
    tipo: 'canal',
    profundidadeM: 8,
    distanciaCostaMn: 0,
    especiesAlvo: ['robalo', 'tainha', 'corvina', 'caranha'],
    ativo: true,
  },
  {
    slug: 'matinhos-offshore',
    nome: 'Matinhos Offshore',
    lat: -25.8100,
    lon: -48.4500,
    tipo: 'offshore',
    profundidadeM: 20,
    distanciaCostaMn: 5,
    especiesAlvo: ['anchova', 'dourado', 'bonito'],
    ativo: true,
  },
  {
    slug: 'barra-do-superagui',
    nome: 'Barra do Superagui',
    lat: -25.3800,
    lon: -48.2200,
    tipo: 'baia',
    profundidadeM: 6,
    distanciaCostaMn: 1,
    especiesAlvo: ['robalo', 'carapeba', 'tainha'],
    ativo: true,
  },
]

export const SEED_ESPECIES = [
  {
    especie: 'vermelho',
    mesesAtivos: [3, 4, 5, 6, 7, 8],
    tempAguaMin: 20,
    tempAguaMax: 26,
    luaPreferida: 'cheia',
    tiposPesqueiro: ['laje', 'naufragio', 'fundeadouro', 'cascalho'],
    iscas: ['sardinha inteira', 'lula', 'camarão morto'],
    tecnica: 'fundo',
    notas: null,
  },
  {
    especie: 'robalo',
    mesesAtivos: [3, 4, 5, 6, 7, 8, 9],
    tempAguaMin: 18,
    tempAguaMax: 28,
    luaPreferida: 'qualquer',
    tiposPesqueiro: ['baia', 'canal', 'parcel'],
    iscas: ['camarão vivo', 'corrupto', 'jig head'],
    tecnica: 'meia-água',
    notas: null,
  },
  {
    especie: 'garoupa',
    mesesAtivos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tempAguaMin: 19,
    tempAguaMax: 27,
    luaPreferida: 'qualquer',
    tiposPesqueiro: ['naufragio', 'fundeadouro', 'laje'],
    iscas: ['sardinha', 'lula inteira', 'peixe vivo'],
    tecnica: 'fundo próximo a estrutura',
    notas: null,
  },
  {
    especie: 'tainha',
    mesesAtivos: [4, 5, 6, 7],
    tempAguaMin: 16,
    tempAguaMax: 24,
    luaPreferida: 'qualquer',
    tiposPesqueiro: ['baia', 'canal'],
    iscas: ['engodo', 'anzol com miçanga'],
    tecnica: 'superfície/meia-água',
    notas: null,
  },
  {
    especie: 'anchova',
    mesesAtivos: [4, 5, 6, 7, 8],
    tempAguaMin: 18,
    tempAguaMax: 24,
    luaPreferida: 'qualquer',
    tiposPesqueiro: ['offshore', 'parcel'],
    iscas: ['sardinha viva', 'colher', 'jig metálico'],
    tecnica: 'corrico ou jigging',
    notas: null,
  },
  {
    especie: 'dourado',
    mesesAtivos: [10, 11, 12, 1, 2, 3],
    tempAguaMin: 22,
    tempAguaMax: 28,
    luaPreferida: 'qualquer',
    tiposPesqueiro: ['offshore', 'cascalho', 'fundeadouro'],
    iscas: ['peixe vivo', 'lula', 'rapala'],
    tecnica: 'corrico de superfície',
    notas: null,
  },
  {
    especie: 'badejo',
    mesesAtivos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tempAguaMin: 19,
    tempAguaMax: 26,
    luaPreferida: 'cheia',
    tiposPesqueiro: ['naufragio', 'laje', 'fundeadouro'],
    iscas: ['sardinha', 'lula', 'camarão'],
    tecnica: 'fundo',
    notas: null,
  },
  {
    especie: 'carapeba',
    mesesAtivos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tempAguaMin: 18,
    tempAguaMax: 28,
    luaPreferida: 'qualquer',
    tiposPesqueiro: ['baia', 'canal'],
    iscas: ['camarão vivo', 'corrupto'],
    tecnica: 'fundo leve ou meia-água',
    notas: null,
  },
]

export const SEED_ISCAS = [
  {
    nome: 'sardinha inteira',
    tipo: 'natural',
    especiesAlvo: ['vermelho', 'garoupa', 'badejo', 'anchova'],
    condicoesIdeais: null,
    disponibilidade: null,
  },
  {
    nome: 'camarão vivo',
    tipo: 'natural',
    especiesAlvo: ['robalo', 'carapeba', 'sargo'],
    condicoesIdeais: null,
    disponibilidade: null,
  },
  {
    nome: 'lula inteira',
    tipo: 'natural',
    especiesAlvo: ['garoupa', 'vermelho', 'badejo'],
    condicoesIdeais: null,
    disponibilidade: null,
  },
  {
    nome: 'corrupto',
    tipo: 'natural',
    especiesAlvo: ['robalo', 'carapeba', 'parati'],
    condicoesIdeais: null,
    disponibilidade: null,
  },
  {
    nome: 'peixe vivo',
    tipo: 'natural',
    especiesAlvo: ['garoupa', 'dourado'],
    condicoesIdeais: 'água clara',
    disponibilidade: null,
  },
  {
    nome: 'jig head + soft bait',
    tipo: 'artificial',
    especiesAlvo: ['robalo', 'carapeba'],
    condicoesIdeais: 'corrente moderada',
    disponibilidade: null,
  },
  {
    nome: 'jig metálico',
    tipo: 'artificial',
    especiesAlvo: ['anchova', 'dourado', 'bonito'],
    condicoesIdeais: 'cardume na superfície',
    disponibilidade: null,
  },
  {
    nome: 'colher',
    tipo: 'artificial',
    especiesAlvo: ['anchova', 'dourado'],
    condicoesIdeais: null,
    disponibilidade: null,
  },
  {
    nome: 'camarão morto',
    tipo: 'natural',
    especiesAlvo: ['vermelho', 'sargo'],
    condicoesIdeais: null,
    disponibilidade: null,
  },
  {
    nome: 'engodo farinha+sardinha',
    tipo: 'natural',
    especiesAlvo: ['tainha'],
    condicoesIdeais: 'água calma',
    disponibilidade: 'inverno',
  },
]

// ──────────────────────────────────────────────
// Seed function
// ──────────────────────────────────────────────

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL || './data/pesca.db'
  const sqlite = new Database(DATABASE_URL)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite)

  console.log('Seeding pesqueiros...')
  for (const p of SEED_PESQUEIROS) {
    await db.insert(pesqueiros).values(p).onConflictDoNothing()
  }
  console.log(`  Inserted ${SEED_PESQUEIROS.length} pesqueiros`)

  console.log('Seeding espécies...')
  for (const e of SEED_ESPECIES) {
    await db.insert(especiesTemporada).values(e).onConflictDoNothing()
  }
  console.log(`  Inserted ${SEED_ESPECIES.length} espécies`)

  console.log('Seeding iscas...')
  for (const i of SEED_ISCAS) {
    await db.insert(iscas).values(i).onConflictDoNothing()
  }
  console.log(`  Inserted ${SEED_ISCAS.length} iscas`)

  console.log('Seeding config pesos...')
  await db
    .insert(config)
    .values({ chave: 'pesos', valor: DEFAULT_WEIGHTS })
    .onConflictDoNothing()
  console.log('  Inserted config pesos')

  sqlite.close()
  console.log('Seed complete.')
}

// Only run seed when executed directly (not when imported in tests)
const isMain = process.argv[1]?.includes('seed')
if (isMain) {
  seed().catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
}
