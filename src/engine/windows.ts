import type { Classificacao, JanelaPesca } from './types'
import { WINDOW_MIN_SCORE } from './constants'
import { classify } from './classify'

interface SnapshotInput {
  pesqueiroId: number
  timestamp: string
  score: number
  classificacao: Classificacao
}

export function findWindows(snapshots: SnapshotInput[]): JanelaPesca[] {
  const sorted = [...snapshots].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const windows: JanelaPesca[] = []
  let current: SnapshotInput[] = []

  for (const snap of sorted) {
    if (snap.score >= WINDOW_MIN_SCORE) {
      current.push(snap)
    } else {
      if (current.length > 0) {
        windows.push(buildWindow(current))
        current = []
      }
    }
  }
  if (current.length > 0) {
    windows.push(buildWindow(current))
  }
  return windows
}

function buildWindow(snaps: SnapshotInput[]): JanelaPesca {
  const scores = snaps.map(s => s.score)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const max = Math.max(...scores)
  return {
    pesqueiroId: snaps[0].pesqueiroId,
    inicio: snaps[0].timestamp,
    fim: snaps[snaps.length - 1].timestamp,
    scoreMedio: avg,
    scoreMax: max,
    classificacao: classify(avg),
  }
}
