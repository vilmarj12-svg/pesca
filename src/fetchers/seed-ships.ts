import Database from 'better-sqlite3'

const DATABASE_URL = process.env.DATABASE_URL || './data/pesca.db'

// Posições típicas de fundeio na baía de Paranaguá e área de espera
// Baseado nas áreas de fundeadouro oficiais do Porto de Paranaguá
// Área Alfa: fundeadouro externo (~25.7S, 48.28W)
// Área Bravo: fundeadouro externo (~25.65S, 48.25W)
// Área interna: dentro da baía (~25.52S, 48.42W)
const TYPICAL_ANCHORED_SHIPS = [
  { mmsi: 710001001, lat: -25.7050, lon: -48.2780, nome: 'NAVIOS POLLUX', status: 'at_anchor' },
  { mmsi: 710001002, lat: -25.7120, lon: -48.2650, nome: 'PACIFIC VOYAGER', status: 'at_anchor' },
  { mmsi: 710001003, lat: -25.6950, lon: -48.2900, nome: 'ORIENTAL DRAGON', status: 'at_anchor' },
  { mmsi: 710001004, lat: -25.6800, lon: -48.2750, nome: 'STAR HARVEST', status: 'at_anchor' },
  { mmsi: 710001005, lat: -25.6600, lon: -48.2600, nome: 'GOLDEN EAGLE', status: 'at_anchor' },
  { mmsi: 710001006, lat: -25.6500, lon: -48.2450, nome: 'MARE NOSTRUM', status: 'at_anchor' },
  { mmsi: 710001007, lat: -25.7200, lon: -48.2550, nome: 'BLUE HORIZON', status: 'at_anchor' },
  { mmsi: 710001008, lat: -25.6700, lon: -48.2850, nome: 'ATLANTIC PEARL', status: 'at_anchor' },
  // Navios atracados no porto (berços)
  { mmsi: 710001009, lat: -25.5150, lon: -48.5050, nome: 'GRAN COLOMBIA', status: 'atracado' },
  { mmsi: 710001010, lat: -25.5180, lon: -48.5100, nome: 'SHANDONG FORTUNE', status: 'atracado' },
  { mmsi: 710001011, lat: -25.5130, lon: -48.5000, nome: 'PARANAGUA STAR', status: 'atracado' },
  // Navios em trânsito no canal
  { mmsi: 710001012, lat: -25.5800, lon: -48.3200, nome: 'CAPE TOWN BRIDGE', status: 'navegando' },
  // Mais fundeados na área de espera
  { mmsi: 710001013, lat: -25.7300, lon: -48.2400, nome: 'MIGHTY SERVANT', status: 'at_anchor' },
  { mmsi: 710001014, lat: -25.6900, lon: -48.2300, nome: 'IRON CHIEFTAIN', status: 'at_anchor' },
  { mmsi: 710001015, lat: -25.6400, lon: -48.2700, nome: 'NORD VENUS', status: 'at_anchor' },
  { mmsi: 710001016, lat: -25.7100, lon: -48.3000, nome: 'OCEAN LIBERTY', status: 'at_anchor' },
  { mmsi: 710001017, lat: -25.6550, lon: -48.2550, nome: 'CSCL SATURN', status: 'at_anchor' },
  { mmsi: 710001018, lat: -25.7000, lon: -48.2600, nome: 'BULK JAPAN', status: 'at_anchor' },
]

function seed() {
  const sqlite = new Database(DATABASE_URL)
  sqlite.pragma('journal_mode = WAL')

  const now = new Date().toISOString()
  // Ships have been anchored for varying times (6h to 72h)
  const upsert = sqlite.prepare(`
    INSERT INTO cache_navios (mmsi, lat, lon, nome_navio, primeiro_visto_em, ultimo_visto_em, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(mmsi) DO UPDATE SET
      lat = excluded.lat,
      lon = excluded.lon,
      ultimo_visto_em = excluded.ultimo_visto_em,
      status = excluded.status
  `)

  for (const ship of TYPICAL_ANCHORED_SHIPS) {
    // Random time anchored between 6 and 72 hours
    const hoursAgo = Math.floor(Math.random() * 66) + 6
    const firstSeen = new Date(Date.now() - hoursAgo * 3600000).toISOString()
    upsert.run(ship.mmsi, ship.lat, ship.lon, ship.nome, firstSeen, now, ship.status)
  }

  const count = sqlite.prepare('SELECT count(*) as c FROM cache_navios').get() as { c: number }
  console.log(`Seeded ${TYPICAL_ANCHORED_SHIPS.length} ships. Total in cache: ${count.c}`)
  sqlite.close()
}

seed()
