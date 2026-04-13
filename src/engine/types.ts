export type Classificacao = 'ruim' | 'regular' | 'bom' | 'otimo' | 'excelente'

export type TipoPesqueiro =
  | 'naufragio' | 'parcel' | 'laje' | 'cascalho'
  | 'pedra' | 'offshore' | 'fundeadouro' | 'baia' | 'canal'

export interface Pesqueiro {
  id: number
  slug: string
  nome: string
  lat: number
  lon: number
  tipo: TipoPesqueiro
  profundidadeM: number | null
  distanciaCostaMn: number | null
  especiesAlvo: string[]
  notas: string | null
  pesosOverride: Record<string, number> | null
}

export interface NavioFundeado {
  mmsi: number
  lat: number
  lon: number
  primeiroVistoEm: string
  ultimoVistoEm: string
}

export interface Condicoes {
  ventoVelocidadeKt: number
  ventoDirecaoGraus: number
  pressaoHpa: number
  pressaoVariacao12h: number
  temperaturaAr: number
  coberturaNuvens: number
  precipitacaoMm: number
  visibilidadeKm: number
  capeJkg: number
  ondaAlturaM: number
  ondaPeriodoS: number
  temperaturaAgua: number
  mareAlturaM: number
  mareFase: 'subindo' | 'descendo' | 'preamar' | 'baixamar'
  mareAmplitude: number
  luaIluminacao: number
  horaSol: { nascer: number; por: number }
  pressaoSerie12h: number[]
  ventoSerie12h: number[]
  naviosFundeados: NavioFundeado[]
  horaAtual: number
  mesAtual: number
}

export interface FatorBreakdown {
  nome: string
  peso: number
  valorBruto: string
  scoreNorm: number
  contribuicao: number
}

export interface ScoreResult {
  score: number
  classificacao: Classificacao
  fatores: FatorBreakdown[]
  safetyOverride: boolean
}

export interface JanelaPesca {
  pesqueiroId: number
  inicio: string
  fim: string
  scoreMedio: number
  scoreMax: number
  classificacao: Classificacao
}

export interface EspecieEmAlta {
  especie: string
  motivo: string
  iscas: string[]
  tecnica: string
  pesqueiros: string[]
  intensidade: 'alta' | 'media' | 'baixa'
}

export interface IscaEmAlta {
  nome: string
  tipo: 'natural' | 'artificial'
  especies: string[]
  destaque: string
}
