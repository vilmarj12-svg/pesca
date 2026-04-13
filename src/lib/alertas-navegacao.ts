export type AlertaSeveridade = 'perigo' | 'atencao' | 'aviso'
export type AlertaTipo = 'vento' | 'onda' | 'tempestade' | 'visibilidade' | 'chuva' | 'pressao'

export interface AlertaNavegacao {
  tipo: AlertaTipo
  severidade: AlertaSeveridade
  titulo: string
  descricao: string
  periodo: string
  icone: string
}

interface CondicaoHora {
  timestamp: string
  ventoKt: number
  ventoDirecao: number
  ondaM: number
  ondaPeriodoS: number
  visibilidadeKm: number
  capeJkg: number
  precipitacaoMm: number
  pressaoHpa: number
  pressaoVariacao: number
}

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
function windDir(deg: number): string {
  return DIRS[Math.round((deg % 360) / 45) % 8]
}

function formatPeriodo(timestamps: string[]): string {
  if (timestamps.length === 0) return ''
  const first = new Date(timestamps[0])
  const last = new Date(timestamps[timestamps.length - 1])
  const dayLabel = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  if (first.toDateString() === last.toDateString()) {
    return `${dayLabel(first)} ${first.getHours()}h-${last.getHours()}h`
  }
  return `${dayLabel(first)} ${first.getHours()}h — ${dayLabel(last)} ${last.getHours()}h`
}

export function detectAlertasNavegacao(condicoes: CondicaoHora[]): AlertaNavegacao[] {
  const alertas: AlertaNavegacao[] = []

  // === VENTO ===
  const ventoForte = condicoes.filter(c => c.ventoKt >= 25)
  const ventoModerado = condicoes.filter(c => c.ventoKt >= 18 && c.ventoKt < 25)

  if (ventoForte.length > 0) {
    const max = Math.max(...ventoForte.map(c => c.ventoKt))
    const dir = windDir(ventoForte[0].ventoDirecao)
    alertas.push({
      tipo: 'vento',
      severidade: max >= 35 ? 'perigo' : 'atencao',
      titulo: max >= 35 ? 'VENTO MUITO FORTE' : 'Vento forte',
      descricao: `Rajadas de ${Math.round(max)}kt (${Math.round(max * 1.852)}km/h) de ${dir}. ${max >= 35 ? 'Navegação perigosa pra embarcações pequenas.' : 'Desconforto na navegação. Mar agitado.'}`,
      periodo: formatPeriodo(ventoForte.map(c => c.timestamp)),
      icone: '💨',
    })
  } else if (ventoModerado.length >= 3) {
    const max = Math.max(...ventoModerado.map(c => c.ventoKt))
    const dir = windDir(ventoModerado[0].ventoDirecao)
    alertas.push({
      tipo: 'vento',
      severidade: 'aviso',
      titulo: 'Vento moderado a forte',
      descricao: `Ventos de ${Math.round(max)}kt de ${dir}. Atenção na navegação costeira.`,
      periodo: formatPeriodo(ventoModerado.map(c => c.timestamp)),
      icone: '💨',
    })
  }

  // === ONDULAÇÃO ===
  const ondaAlta = condicoes.filter(c => c.ondaM >= 2.5)
  const ondaModerada = condicoes.filter(c => c.ondaM >= 1.8 && c.ondaM < 2.5)

  if (ondaAlta.length > 0) {
    const max = Math.max(...ondaAlta.map(c => c.ondaM))
    const periodo = ondaAlta[0].ondaPeriodoS
    alertas.push({
      tipo: 'onda',
      severidade: max >= 3.5 ? 'perigo' : 'atencao',
      titulo: max >= 3.5 ? 'MAR GROSSO' : 'Mar agitado',
      descricao: `Ondas de ${max.toFixed(1)}m com período de ${Math.round(periodo)}s. ${max >= 3.5 ? 'Não saia com embarcação pequena.' : 'Desconfortável pra embarcações até 30 pés.'}`,
      periodo: formatPeriodo(ondaAlta.map(c => c.timestamp)),
      icone: '🌊',
    })
  } else if (ondaModerada.length >= 3) {
    const max = Math.max(...ondaModerada.map(c => c.ondaM))
    alertas.push({
      tipo: 'onda',
      severidade: 'aviso',
      titulo: 'Ondulação moderada',
      descricao: `Ondas de ${max.toFixed(1)}m. Atenção na saída da barra e pesqueiros rasos.`,
      periodo: formatPeriodo(ondaModerada.map(c => c.timestamp)),
      icone: '🌊',
    })
  }

  // === TEMPESTADE (CAPE) ===
  const tempestade = condicoes.filter(c => c.capeJkg >= 1000)
  if (tempestade.length > 0) {
    const max = Math.max(...tempestade.map(c => c.capeJkg))
    alertas.push({
      tipo: 'tempestade',
      severidade: 'perigo',
      titulo: 'RISCO DE TEMPESTADE',
      descricao: `CAPE de ${Math.round(max)} J/kg. Risco alto de raios e vendaval. Não navegue.`,
      periodo: formatPeriodo(tempestade.map(c => c.timestamp)),
      icone: '⛈️',
    })
  }

  // === VISIBILIDADE ===
  const visRuim = condicoes.filter(c => c.visibilidadeKm < 2)
  if (visRuim.length > 0) {
    const min = Math.min(...visRuim.map(c => c.visibilidadeKm))
    alertas.push({
      tipo: 'visibilidade',
      severidade: min < 0.5 ? 'perigo' : 'atencao',
      titulo: min < 0.5 ? 'NEVOEIRO DENSO' : 'Visibilidade reduzida',
      descricao: `Visibilidade de ${min.toFixed(1)}km. ${min < 0.5 ? 'Navegação extremamente perigosa.' : 'Risco de colisão. Use radar e buzina.'}`,
      periodo: formatPeriodo(visRuim.map(c => c.timestamp)),
      icone: '🌫️',
    })
  }

  // === CHUVA FORTE ===
  const chuvaForte = condicoes.filter(c => c.precipitacaoMm >= 10)
  if (chuvaForte.length > 0) {
    const max = Math.max(...chuvaForte.map(c => c.precipitacaoMm))
    alertas.push({
      tipo: 'chuva',
      severidade: max >= 25 ? 'atencao' : 'aviso',
      titulo: max >= 25 ? 'Chuva intensa' : 'Pancadas de chuva',
      descricao: `Precipitação de ${Math.round(max)}mm/h. Reduz visibilidade e turva a água.`,
      periodo: formatPeriodo(chuvaForte.map(c => c.timestamp)),
      icone: '🌧️',
    })
  }

  // === QUEDA BRUSCA DE PRESSÃO (frente fria) ===
  const quedaPressao = condicoes.filter(c => c.pressaoVariacao < -4)
  if (quedaPressao.length > 0) {
    const maxQueda = Math.min(...quedaPressao.map(c => c.pressaoVariacao))
    alertas.push({
      tipo: 'pressao',
      severidade: maxQueda < -8 ? 'atencao' : 'aviso',
      titulo: 'Frente fria se aproximando',
      descricao: `Queda de pressão de ${Math.round(Math.abs(maxQueda))} hPa em 12h. Vento vai virar Sul. ${maxQueda < -8 ? 'Frente forte — volte antes que vire.' : 'Mudança de tempo nas próximas horas.'}`,
      periodo: formatPeriodo(quedaPressao.map(c => c.timestamp)),
      icone: '📉',
    })
  }

  // Sort by severity
  const ordem: Record<AlertaSeveridade, number> = { perigo: 0, atencao: 1, aviso: 2 }
  return alertas.sort((a, b) => ordem[a.severidade] - ordem[b.severidade])
}
