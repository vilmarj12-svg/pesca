import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { pesqueiros } from '../src/db/schema'
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

const db = drizzle(sqlite)

// Check if pesqueiros table has data
const count = db.select().from(pesqueiros).all().length

if (count === 0) {
  console.log('Database empty — running seed...')
  sqlite.close()
  // Import and run seed
  import('../src/db/seed').then(() => {
    console.log('Seed complete.')
  })
} else {
  console.log(`Database OK — ${count} pesqueiros found.`)
  sqlite.close()
}
