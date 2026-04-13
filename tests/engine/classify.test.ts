import { describe, it, expect } from 'vitest'
import { classify } from '@/engine/classify'

describe('classify', () => {
  it('returns excelente for 90-100', () => { expect(classify(95)).toBe('excelente') })
  it('returns otimo for 75-89', () => { expect(classify(82)).toBe('otimo') })
  it('returns bom for 60-74', () => { expect(classify(65)).toBe('bom') })
  it('returns regular for 45-59', () => { expect(classify(50)).toBe('regular') })
  it('returns ruim for 0-44', () => { expect(classify(30)).toBe('ruim') })
  it('returns excelente for exactly 90', () => { expect(classify(90)).toBe('excelente') })
  it('returns ruim for 0', () => { expect(classify(0)).toBe('ruim') })
})
