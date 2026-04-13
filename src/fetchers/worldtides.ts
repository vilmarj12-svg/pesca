import type { TideData, TidePoint } from './types'

const WORLDTIDES_BASE = 'https://www.worldtides.info/api/v3'

export async function fetchTides(
  lat: number,
  lon: number,
  apiKey?: string,
): Promise<TideData> {
  if (!apiKey) {
    return getDefaultTides()
  }

  const params = new URLSearchParams({
    heights: '',
    extremes: '',
    lat: lat.toString(),
    lon: lon.toString(),
    key: apiKey,
    days: '7',
    datum: 'MSL',
  })

  const res = await fetch(`${WORLDTIDES_BASE}?${params}`)
  if (!res.ok) throw new Error(`WorldTides failed: ${res.status}`)
  const data = await res.json()

  return {
    heights: (data.heights || []).map((h: { dt: number; height: number }) => ({
      time: new Date(h.dt * 1000).toISOString(),
      height: h.height,
      type: null,
    })),
    extremes: (data.extremes || []).map((e: { dt: number; height: number; type: string }) => ({
      time: new Date(e.dt * 1000).toISOString(),
      height: e.height,
      type: e.type === 'High' ? 'high' : 'low',
    })),
  }
}

function getDefaultTides(): TideData {
  // Semi-diurnal tide pattern typical of Paranaguá
  // Two highs and two lows per day, amplitude ~1.5m
  const now = Date.now()
  const heights: TidePoint[] = []

  for (let h = 0; h < 168; h++) {
    const t = now + h * 3600000
    const phase = (h % 12) / 12 * Math.PI * 2
    const height = Math.sin(phase) * 0.75 + 0.8
    heights.push({
      time: new Date(t).toISOString(),
      height: Math.round(height * 100) / 100,
      type: null,
    })
  }

  return { heights, extremes: [] }
}
