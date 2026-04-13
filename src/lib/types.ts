export type Classificacao = 'ruim' | 'regular' | 'bom' | 'otimo' | 'excelente'

export interface PesqueiroResumo {
  id: number
  slug: string
  nome: string
  lat: number
  lon: number
  tipo: string
  scoreAtual: number
  classificacao: Classificacao
  proximaJanela: string | null
}

export interface SnapshotHora {
  timestamp: string
  score: number
  classificacao: Classificacao
}

export interface HeatmapPesqueiro {
  pesqueiroId: number
  nome: string
  horas: SnapshotHora[]
}

export interface RunStatus {
  ultimaRun: string
  status: 'sucesso' | 'parcial' | 'erro'
}

export interface EspecieEmAltaView {
  especie: string
  motivo: string
  iscas: string[]
  tecnica: string
  pesqueiros: string[]
  intensidade: 'alta' | 'media' | 'baixa'
}

export interface IscaEmAltaView {
  nome: string
  tipo: 'natural' | 'artificial'
  especies: string[]
  destaque: string
}

export interface DashboardData {
  pesqueiros: PesqueiroResumo[]
  heatmap: HeatmapPesqueiro[]
  runStatus: RunStatus
  especiesEmAlta: EspecieEmAltaView[]
  iscasEmAlta: IscaEmAltaView[]
}

export interface PesqueiroDetalhe {
  id: number
  slug: string
  nome: string
  lat: number
  lon: number
  tipo: string
  profundidadeM: number | null
  distanciaCostaMn: number | null
  especiesAlvo: string[]
  notas: string | null
  scoreAtual: number
  classificacao: Classificacao
}

export interface FatorBreakdownView {
  nome: string
  peso: number
  valorBruto: string
  scoreNorm: number
  contribuicao: number
}

export interface BreakdownCompleto {
  score: number
  classificacao: Classificacao
  fatores: FatorBreakdownView[]
  safetyOverride: boolean
}

export interface SnapshotGrafico {
  timestamp: string
  score: number
  classificacao: Classificacao
}

export interface CondicaoBruta {
  hora: string
  score: number
  classificacao: Classificacao
  ventoVelocidade: number
  ventoDirecao: number
  ondaAltura: number
  ondaPeriodo: number
  mareAltura: number
  mareFase: 'subindo' | 'descendo' | 'preamar' | 'baixamar'
  pressao: number
  pressaoTendencia: 'subindo' | 'descendo' | 'estavel'
  tempAgua: number
  tempAr: number
  faseLua: string
}

export interface DetalhePesqueiroData {
  pesqueiro: PesqueiroDetalhe
  breakdown: BreakdownCompleto
  grafico72h: SnapshotGrafico[]
  condicoes24h: CondicaoBruta[]
}

export interface PesqueiroAdmin {
  id: number
  slug: string
  nome: string
  lat: number
  lon: number
  tipo: string
  profundidadeM: number | null
  distanciaCostaMn: number | null
  especiesAlvo: string[]
  notas: string | null
  ativo: boolean
}
