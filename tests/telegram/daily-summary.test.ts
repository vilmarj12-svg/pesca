import { describe, it, expect } from 'vitest'
import { buildDailySummaryText } from '@/telegram/daily-summary'
import type { PesqueiroResumo } from '@/lib/types'

describe('buildDailySummaryText', () => {
  const pesqueiros: PesqueiroResumo[] = [
    { id: 1, slug: 'currais', nome: 'Currais', lat: -25.7, lon: -48.3, tipo: 'laje', scoreAtual: 84, classificacao: 'otimo', proximaJanela: 'hoje 06-10h' },
    { id: 2, slug: 'tocoyo', nome: 'Tocoyo', lat: -25.6, lon: -48.2, tipo: 'naufragio', scoreAtual: 71, classificacao: 'bom', proximaJanela: 'hoje 16-19h' },
    { id: 3, slug: 'galheta', nome: 'Galheta', lat: -25.5, lon: -48.1, tipo: 'parcel', scoreAtual: 58, classificacao: 'regular', proximaJanela: null },
    { id: 4, slug: 'cascalho-30', nome: 'Cascalho 30', lat: -25.4, lon: -48.0, tipo: 'cascalho', scoreAtual: 42, classificacao: 'ruim', proximaJanela: null },
  ]

  it('includes header with Pesca PR', () => {
    const text = buildDailySummaryText(pesqueiros, 0.95, 1018, 0.5, 1.2, 12, 135)
    expect(text).toContain('🎣 Pesca PR')
  })

  it('lists top pesqueiros sorted by score', () => {
    const text = buildDailySummaryText(pesqueiros, 0.95, 1018, 0.5, 1.2, 12, 135)
    expect(text).toContain('Currais')
    expect(text).toContain('84')
    expect(text).toContain('Tocoyo')
  })

  it('includes moon phase', () => {
    const text = buildDailySummaryText(pesqueiros, 0.95, 1018, 0.5, 1.2, 12, 135)
    expect(text).toContain('🌕')
  })

  it('includes pressure summary', () => {
    const text = buildDailySummaryText(pesqueiros, 0.5, 1018, 0.5, 1.2, 12, 135)
    expect(text).toContain('Pressão estável')
  })

  it('includes wave and wind', () => {
    const text = buildDailySummaryText(pesqueiros, 0.5, 1018, 0.5, 1.2, 12, 135)
    expect(text).toContain('1.2m')
    expect(text).toContain('SE 12kt')
  })
})
