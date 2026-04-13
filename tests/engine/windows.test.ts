import { describe, it, expect } from 'vitest'
import { findWindows } from '@/engine/windows'

describe('findWindows', () => {
  it('groups consecutive hours with score >= 75 into a window', () => {
    const snapshots = [
      { pesqueiroId: 1, timestamp: '2026-04-12T06:00:00', score: 80, classificacao: 'otimo' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T07:00:00', score: 85, classificacao: 'otimo' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T08:00:00', score: 90, classificacao: 'excelente' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T09:00:00', score: 60, classificacao: 'bom' as const },
    ]
    const windows = findWindows(snapshots)
    expect(windows).toHaveLength(1)
    expect(windows[0].inicio).toBe('2026-04-12T06:00:00')
    expect(windows[0].fim).toBe('2026-04-12T08:00:00')
    expect(windows[0].scoreMedio).toBe(85)
    expect(windows[0].scoreMax).toBe(90)
  })

  it('returns empty for no qualifying hours', () => {
    const snapshots = [
      { pesqueiroId: 1, timestamp: '2026-04-12T06:00:00', score: 50, classificacao: 'regular' as const },
    ]
    expect(findWindows(snapshots)).toHaveLength(0)
  })

  it('creates separate windows for non-consecutive qualifying hours', () => {
    const snapshots = [
      { pesqueiroId: 1, timestamp: '2026-04-12T06:00:00', score: 80, classificacao: 'otimo' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T07:00:00', score: 80, classificacao: 'otimo' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T08:00:00', score: 50, classificacao: 'regular' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T09:00:00', score: 85, classificacao: 'otimo' as const },
      { pesqueiroId: 1, timestamp: '2026-04-12T10:00:00', score: 90, classificacao: 'excelente' as const },
    ]
    const windows = findWindows(snapshots)
    expect(windows).toHaveLength(2)
  })
})
