import { describe, it, expect } from 'vitest'
import { buildAlertMessage, shouldSendAlert, isQuietHours } from '@/telegram/alert'
import type { FatorBreakdownView } from '@/lib/types'

describe('buildAlertMessage', () => {
  it('builds alert with pesqueiro name and score', () => {
    const fatores: FatorBreakdownView[] = [
      { nome: 'lua', peso: 11, valorBruto: 'Lua cheia', scoreNorm: 0.95, contribuicao: 10.45 },
      { nome: 'mare', peso: 17, valorBruto: '1.9m subindo', scoreNorm: 0.9, contribuicao: 15.3 },
    ]
    const text = buildAlertMessage('Tocoyo', 92, 'Sábado 18/04, 06:00-11:00', fatores)
    expect(text).toContain('🔥 JANELA EXCELENTE')
    expect(text).toContain('Tocoyo')
    expect(text).toContain('92')
    expect(text).toContain('Lua cheia')
  })
})

describe('shouldSendAlert', () => {
  it('returns true when no previous alert exists', () => {
    expect(shouldSendAlert(92, [], 0)).toBe(true)
  })

  it('returns false when alert count exceeds daily limit', () => {
    expect(shouldSendAlert(92, [], 5)).toBe(false)
  })

  it('returns false when overlapping alert has similar score', () => {
    const existing = [{ scoreMedio: 91, janelaInicio: '2026-04-18T06:00:00', janelaFim: '2026-04-18T11:00:00' }]
    expect(shouldSendAlert(92, existing, 0)).toBe(false)
  })

  it('returns true when score differs by more than 5', () => {
    const existing = [{ scoreMedio: 85, janelaInicio: '2026-04-18T06:00:00', janelaFim: '2026-04-18T11:00:00' }]
    expect(shouldSendAlert(92, existing, 0)).toBe(true)
  })
})

describe('isQuietHours', () => {
  it('returns true between 22:00 and 06:00', () => {
    expect(isQuietHours(23)).toBe(true)
    expect(isQuietHours(0)).toBe(true)
    expect(isQuietHours(5)).toBe(true)
  })

  it('returns false during active hours', () => {
    expect(isQuietHours(7)).toBe(false)
    expect(isQuietHours(12)).toBe(false)
    expect(isQuietHours(21)).toBe(false)
  })
})
