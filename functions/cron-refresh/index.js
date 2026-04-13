export default async function handler() {
  const url = process.env.APP_URL || 'https://pesca-production-e3ad.up.railway.app'
  const token = process.env.ADMIN_TOKEN || 'pesca-pr-admin-2026'
  const res = await fetch(`${url}/api/cron/refresh?token=${token}`)
  const data = await res.json()
  console.log('Cron refresh:', JSON.stringify(data))
  return data
}
