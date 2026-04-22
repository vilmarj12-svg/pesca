interface DiaIdeal {
  id: number
  titulo: string
  ventoMin: number | null
  ventoMax: number | null
  ondaMin: number | null
  ondaMax: number | null
  pressaoMin: number | null
  pressaoMax: number | null
  tempAguaMin: number | null
  tempAguaMax: number | null
  luaFase: string | null
  mareFase: string | null
}

interface CondicaoPrevisao {
  ventoKmh: number
  ondaM: number
  pressaoHpa: number
  tempAgua: number
  luaFase: string
  mareFase: string
}

export interface MatchResult {
  diaIdealId: number
  titulo: string
  matchPercent: number
  fatoresMatch: string[]
  fatoresMiss: string[]
}

function inRange(val: number, min: number | null, max: number | null, tolerance: number): boolean {
  if (min === null && max === null) return true
  const lo = (min ?? val) - tolerance
  const hi = (max ?? val) + tolerance
  return val >= lo && val <= hi
}

export function matchDiaIdeal(ideal: DiaIdeal, cond: CondicaoPrevisao): MatchResult {
  const fatoresMatch: string[] = []
  const fatoresMiss: string[] = []
  let total = 0
  let matched = 0

  // Vento (tolerância ±5 km/h)
  if (ideal.ventoMin !== null || ideal.ventoMax !== null) {
    total++
    if (inRange(cond.ventoKmh, ideal.ventoMin, ideal.ventoMax, 5)) {
      fatoresMatch.push(`Vento ${Math.round(cond.ventoKmh)} km/h`)
      matched++
    } else {
      fatoresMiss.push(`Vento fora (${Math.round(cond.ventoKmh)} km/h)`)
    }
  }

  // Onda (tolerância ±0.3m)
  if (ideal.ondaMin !== null || ideal.ondaMax !== null) {
    total++
    if (inRange(cond.ondaM, ideal.ondaMin, ideal.ondaMax, 0.3)) {
      fatoresMatch.push(`Onda ${cond.ondaM.toFixed(1)}m`)
      matched++
    } else {
      fatoresMiss.push(`Onda fora (${cond.ondaM.toFixed(1)}m)`)
    }
  }

  // Pressão (tolerância ±3 hPa)
  if (ideal.pressaoMin !== null || ideal.pressaoMax !== null) {
    total++
    if (inRange(cond.pressaoHpa, ideal.pressaoMin, ideal.pressaoMax, 3)) {
      fatoresMatch.push(`Pressão ${Math.round(cond.pressaoHpa)} hPa`)
      matched++
    } else {
      fatoresMiss.push(`Pressão fora (${Math.round(cond.pressaoHpa)} hPa)`)
    }
  }

  // Temp água (tolerância ±2°C)
  if (ideal.tempAguaMin !== null || ideal.tempAguaMax !== null) {
    total++
    if (inRange(cond.tempAgua, ideal.tempAguaMin, ideal.tempAguaMax, 2)) {
      fatoresMatch.push(`Água ${cond.tempAgua.toFixed(1)}°C`)
      matched++
    } else {
      fatoresMiss.push(`Água fora (${cond.tempAgua.toFixed(1)}°C)`)
    }
  }

  // Lua
  if (ideal.luaFase) {
    total++
    if (cond.luaFase === ideal.luaFase) {
      fatoresMatch.push(`Lua ${cond.luaFase}`)
      matched++
    } else {
      fatoresMiss.push(`Lua ${cond.luaFase} (ideal: ${ideal.luaFase})`)
    }
  }

  // Maré
  if (ideal.mareFase) {
    total++
    if (cond.mareFase === ideal.mareFase) {
      fatoresMatch.push(`Maré ${cond.mareFase}`)
      matched++
    } else {
      fatoresMiss.push(`Maré ${cond.mareFase} (ideal: ${ideal.mareFase})`)
    }
  }

  const matchPercent = total > 0 ? Math.round((matched / total) * 100) : 0

  return {
    diaIdealId: ideal.id,
    titulo: ideal.titulo,
    matchPercent,
    fatoresMatch,
    fatoresMiss,
  }
}
