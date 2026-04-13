import WebSocket from 'ws'
import Database from 'better-sqlite3'

const DATABASE_URL = process.env.DATABASE_URL || './data/pesca.db'
const API_KEY = process.env.AISSTREAM_API_KEY || ''

// Bounding box litoral PR: lat -25.95 a -25.30, lon -48.65 a -48.00
const PARANAGUA_BBOX = [[[-25.95, -48.65], [-25.30, -48.00]]]

const NAV_STATUS: Record<number, string> = {
  0: 'navegando',
  1: 'fundeado',
  2: 'sem_governo',
  3: 'manobra_restrita',
  4: 'calado_limitante',
  5: 'atracado',
  6: 'encalhado',
  7: 'pescando',
  8: 'navegando_vela',
  15: 'desconhecido',
}

function run() {
  if (!API_KEY) {
    console.error('AISSTREAM_API_KEY not set. Get a free key at https://aisstream.io/apikeys')
    process.exit(1)
  }

  const sqlite = new Database(DATABASE_URL)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const upsert = sqlite.prepare(`
    INSERT INTO cache_navios (mmsi, lat, lon, nome_navio, primeiro_visto_em, ultimo_visto_em, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(mmsi) DO UPDATE SET
      lat = excluded.lat,
      lon = excluded.lon,
      nome_navio = COALESCE(excluded.nome_navio, cache_navios.nome_navio),
      ultimo_visto_em = excluded.ultimo_visto_em,
      status = excluded.status
  `)

  // Cleanup stale ships (>6h)
  const cleanup = sqlite.prepare(`DELETE FROM cache_navios WHERE ultimo_visto_em < ?`)

  let shipCount = 0
  let connected = false

  function connect() {
    const socket = new WebSocket('wss://stream.aisstream.io/v0/stream')

    socket.on('open', () => {
      connected = true
      const msg = {
        APIKey: API_KEY,
        BoundingBoxes: PARANAGUA_BBOX,
        FilterMessageTypes: ['PositionReport'],
      }
      socket.send(JSON.stringify(msg))
      console.log(`[AIS] Connected — watching Paranaguá coast (${new Date().toISOString()})`)

      // Cleanup every 10 minutes
      setInterval(() => {
        const sixHoursAgo = new Date(Date.now() - 6 * 3600000).toISOString()
        const result = cleanup.run(sixHoursAgo)
        if (result.changes > 0) {
          console.log(`[AIS] Cleaned up ${result.changes} stale ships`)
        }
      }, 600000)
    })

    socket.on('message', (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString())
        if (msg.MessageType !== 'PositionReport') return

        const meta = msg.MetaData
        const pos = msg.Message?.PositionReport
        if (!meta || !pos) return

        const mmsi = meta.MMSI
        const lat = meta.latitude
        const lon = meta.longitude
        const name = meta.ShipName?.trim() || null
        const navStatus = NAV_STATUS[pos.NavigationalStatus] ?? 'desconhecido'
        const now = new Date().toISOString()

        // Only store anchored/moored ships and ships in the area
        const isAnchored = pos.NavigationalStatus === 1 || pos.NavigationalStatus === 5
        const status = isAnchored ? 'at_anchor' : navStatus

        upsert.run(mmsi, lat, lon, name, now, now, status)
        shipCount++

        if (shipCount % 50 === 0) {
          const total = sqlite.prepare('SELECT count(*) as c FROM cache_navios').get() as { c: number }
          console.log(`[AIS] ${shipCount} updates processed, ${total.c} ships in cache`)
        }
      } catch (e) {
        // ignore parse errors
      }
    })

    socket.on('error', (err) => {
      console.error('[AIS] WebSocket error:', err.message)
    })

    socket.on('close', () => {
      connected = false
      console.log('[AIS] Connection closed, reconnecting in 10s...')
      setTimeout(connect, 10000)
    })
  }

  connect()

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('[AIS] Shutting down...')
    sqlite.close()
    process.exit(0)
  })
}

// Run when executed directly
const isMain = process.argv[1]?.includes('ais-stream')
if (isMain) {
  run()
}

export { run }
