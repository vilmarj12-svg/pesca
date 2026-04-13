export async function register() {
  // Only run cron in production server (not during build or client)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const HOUR_MS = 60 * 60 * 1000

    // Refresh scores + ships every hour
    setInterval(async () => {
      try {
        const { runRefresh } = await import('@/cron/refresh')
        const result = await runRefresh()
        console.log(`[CRON] Refresh: ${result.status} — ${result.pesqueirosProcessados} pesqueiros, ${result.alertasEnviados ?? 0} alertas`)
      } catch (e) {
        console.error('[CRON] Refresh failed:', e)
      }
    }, HOUR_MS)

    // Daily summary at 07:00 BRT (10:00 UTC)
    function scheduleDaily() {
      const now = new Date()
      const target = new Date(now)
      target.setUTCHours(10, 0, 0, 0) // 07:00 BRT = 10:00 UTC
      if (target <= now) target.setDate(target.getDate() + 1)
      const delay = target.getTime() - now.getTime()

      setTimeout(async () => {
        try {
          const { sendMessage } = await import('@/telegram/send')
          const { buildDailySummaryText } = await import('@/telegram/daily-summary')
          const { buildDashboardData } = await import('@/app/api/dashboard/data')

          const data = buildDashboardData()
          const latestSnap = data.pesqueiros[0]
          const text = buildDailySummaryText(
            data.pesqueiros, 0.5, 1013, 0, 1.0, 10, 180,
          )
          await sendMessage(text)
          console.log('[CRON] Daily Telegram sent')
        } catch (e) {
          console.error('[CRON] Daily Telegram failed:', e)
        }
        scheduleDaily() // schedule next day
      }, delay)

      console.log(`[CRON] Daily Telegram scheduled in ${Math.round(delay / 60000)}min`)
    }

    // Run first refresh 30s after startup
    setTimeout(async () => {
      try {
        const { runRefresh } = await import('@/cron/refresh')
        const result = await runRefresh()
        console.log(`[CRON] Initial refresh: ${result.status} — ${result.pesqueirosProcessados} pesqueiros`)
      } catch (e) {
        console.error('[CRON] Initial refresh failed:', e)
      }
    }, 30000)

    scheduleDaily()
    console.log('[CRON] Cron jobs registered: refresh (1h), telegram daily (07:00 BRT)')
  }
}
