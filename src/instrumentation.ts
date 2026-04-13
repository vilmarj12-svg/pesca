export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const HOUR_MS = 60 * 60 * 1000
    const port = process.env.PORT || '3000'
    const base = `http://localhost:${port}`
    const token = process.env.ADMIN_TOKEN || ''

    // Refresh every hour via internal HTTP call
    setInterval(async () => {
      try {
        const res = await fetch(`${base}/api/cron/refresh?token=${token}`)
        const data = await res.json()
        console.log(`[CRON] Refresh: ${data.status} — ${data.pesqueirosProcessados} pesqueiros`)
      } catch (e) {
        console.error('[CRON] Refresh failed:', e)
      }
    }, HOUR_MS)

    // Daily Telegram at 07:00 BRT (10:00 UTC)
    function scheduleDaily() {
      const now = new Date()
      const target = new Date(now)
      target.setUTCHours(10, 0, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)
      const delay = target.getTime() - now.getTime()

      setTimeout(async () => {
        try {
          const res = await fetch(`${base}/api/cron/telegram-daily?token=${token}`, { method: 'POST' })
          const data = await res.json()
          console.log(`[CRON] Telegram: sent=${data.sent}`)
        } catch (e) {
          console.error('[CRON] Telegram failed:', e)
        }
        scheduleDaily()
      }, delay)

      console.log(`[CRON] Telegram daily scheduled in ${Math.round(delay / 60000)}min`)
    }

    // First refresh 60s after startup (wait for server to be ready)
    setTimeout(async () => {
      try {
        const res = await fetch(`${base}/api/cron/refresh?token=${token}`)
        const data = await res.json()
        console.log(`[CRON] Initial refresh: ${data.status} — ${data.pesqueirosProcessados} pesqueiros`)
      } catch (e) {
        console.error('[CRON] Initial refresh failed:', e)
      }
    }, 60000)

    scheduleDaily()
    console.log('[CRON] Registered: refresh (1h), telegram (07:00 BRT)')
  }
}
