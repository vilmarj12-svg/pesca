import { describe, it, expect } from 'vitest'
import { findEspeciesEmAlta, findIscasEmAlta } from '@/engine/species'

const especiesDb = [
  {
    especie: 'vermelho', mesesAtivos: [3, 4, 5, 6], tempAguaMin: 20, tempAguaMax: 26,
    luaPreferida: 'cheia' as const, tiposPesqueiro: ['laje', 'fundeadouro'],
    iscas: ['sardinha', 'lula'], tecnica: 'fundo', notas: null,
  },
  {
    especie: 'robalo', mesesAtivos: [3, 4, 5, 6, 7, 8, 9], tempAguaMin: 18, tempAguaMax: 28,
    luaPreferida: 'qualquer' as const, tiposPesqueiro: ['baia', 'canal'],
    iscas: ['camarão vivo', 'jig head'], tecnica: 'meia-água', notas: null,
  },
]

const iscasDb = [
  { nome: 'sardinha', tipo: 'natural' as const, especiesAlvo: ['vermelho', 'garoupa'], condicoesIdeais: null, disponibilidade: 'o ano todo' },
  { nome: 'camarão vivo', tipo: 'natural' as const, especiesAlvo: ['robalo', 'carapeba'], condicoesIdeais: null, disponibilidade: 'o ano todo' },
]

describe('findEspeciesEmAlta', () => {
  it('returns species matching current month and water temp', () => {
    const result = findEspeciesEmAlta(especiesDb, { mes: 4, tempAgua: 23, luaIluminacao: 1.0 })
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.find(e => e.especie === 'vermelho')).toBeDefined()
  })
  it('excludes species outside their active months', () => {
    const result = findEspeciesEmAlta(especiesDb, { mes: 12, tempAgua: 23, luaIluminacao: 1.0 })
    expect(result.find(e => e.especie === 'vermelho')).toBeUndefined()
  })
  it('boosts intensity when moon matches preference', () => {
    const full = findEspeciesEmAlta(especiesDb, { mes: 4, tempAgua: 23, luaIluminacao: 1.0 })
    const quarter = findEspeciesEmAlta(especiesDb, { mes: 4, tempAgua: 23, luaIluminacao: 0.5 })
    const vermFull = full.find(e => e.especie === 'vermelho')
    const vermQuarter = quarter.find(e => e.especie === 'vermelho')
    expect(vermFull?.intensidade).not.toBe(vermQuarter?.intensidade)
  })
})

describe('findIscasEmAlta', () => {
  it('returns baits whose target species are em alta', () => {
    const especies = findEspeciesEmAlta(especiesDb, { mes: 4, tempAgua: 23, luaIluminacao: 1.0 })
    const result = findIscasEmAlta(iscasDb, especies)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.find(i => i.nome === 'sardinha')).toBeDefined()
  })
})
