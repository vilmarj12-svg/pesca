import type { EspecieEmAlta, IscaEmAlta } from './types'

interface EspecieDb {
  especie: string
  mesesAtivos: number[]
  tempAguaMin: number
  tempAguaMax: number
  luaPreferida: 'nova' | 'cheia' | 'qualquer'
  tiposPesqueiro: string[]
  iscas: string[]
  tecnica: string
  notas: string | null
}

interface IscaDb {
  nome: string
  tipo: 'natural' | 'artificial'
  especiesAlvo: string[]
  condicoesIdeais: string | null
  disponibilidade: string | null
}

interface CondicoesAtuais {
  mes: number
  tempAgua: number
  luaIluminacao: number
}

export function findEspeciesEmAlta(
  especies: EspecieDb[],
  condicoes: CondicoesAtuais,
): EspecieEmAlta[] {
  const results: EspecieEmAlta[] = []
  for (const esp of especies) {
    if (!esp.mesesAtivos.includes(condicoes.mes)) continue
    if (condicoes.tempAgua < esp.tempAguaMin || condicoes.tempAgua > esp.tempAguaMax) continue

    const luaMatch = esp.luaPreferida === 'qualquer' ||
      (esp.luaPreferida === 'cheia' && condicoes.luaIluminacao > 0.8) ||
      (esp.luaPreferida === 'nova' && condicoes.luaIluminacao < 0.2)

    const tempIdeal = condicoes.tempAgua >= (esp.tempAguaMin + 2) &&
      condicoes.tempAgua <= (esp.tempAguaMax - 2)

    let intensidade: 'alta' | 'media' | 'baixa'
    if (luaMatch && tempIdeal) intensidade = 'alta'
    else if (luaMatch || tempIdeal) intensidade = 'media'
    else intensidade = 'baixa'

    const motivos: string[] = []
    motivos.push(`Mês ${condicoes.mes} é temporada`)
    if (tempIdeal) motivos.push(`Água ${condicoes.tempAgua}°C (ideal)`)
    if (luaMatch && esp.luaPreferida !== 'qualquer') motivos.push(`Lua ${esp.luaPreferida}`)

    results.push({
      especie: esp.especie,
      motivo: motivos.join(' + '),
      iscas: esp.iscas,
      tecnica: esp.tecnica,
      pesqueiros: esp.tiposPesqueiro,
      intensidade,
    })
  }
  return results.sort((a, b) => {
    const order = { alta: 0, media: 1, baixa: 2 }
    return order[a.intensidade] - order[b.intensidade]
  })
}

export function findIscasEmAlta(
  iscas: IscaDb[],
  especiesEmAlta: EspecieEmAlta[],
): IscaEmAlta[] {
  const especiesSet = new Set(especiesEmAlta.map(e => e.especie))
  const results: IscaEmAlta[] = []
  for (const isca of iscas) {
    const matching = isca.especiesAlvo.filter(e => especiesSet.has(e))
    if (matching.length === 0) continue
    results.push({
      nome: isca.nome,
      tipo: isca.tipo,
      especies: matching,
      destaque: `Boa pra ${matching.join(', ')} agora`,
    })
  }
  return results
}
