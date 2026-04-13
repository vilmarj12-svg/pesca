import type { Pesqueiro, Condicoes, ScoreResult, FatorBreakdown } from './types'
import { DEFAULT_WEIGHTS, SAFETY_CAPE_THRESHOLD } from './constants'
import { classify } from './classify'
import { windDirection } from '@/lib/format'
import {
  scoreWind, scoreTide, scoreWave, scoreMoon, scorePressure,
  scoreColdFront, scoreWaterTemp, scoreShips, scoreTimeOfDay,
  scoreVisibility, scoreClouds, scoreAirTemp, scoreRain,
} from './factors'

export function calculateScore(
  pesqueiro: Pesqueiro,
  condicoes: Condicoes,
  pesosCustom?: Record<string, number>,
): ScoreResult {
  if (condicoes.capeJkg > SAFETY_CAPE_THRESHOLD) {
    return { score: 0, classificacao: 'ruim', fatores: [], safetyOverride: true }
  }

  const pesos = { ...DEFAULT_WEIGHTS, ...pesqueiro.pesosOverride, ...pesosCustom }

  const fatores: FatorBreakdown[] = [
    { nome: 'mare', peso: pesos.mare, valorBruto: `${condicoes.mareAlturaM}m ${condicoes.mareFase}`, scoreNorm: scoreTide(condicoes.mareFase, condicoes.mareAmplitude), contribuicao: 0 },
    { nome: 'vento', peso: pesos.vento, valorBruto: `${Math.round(condicoes.ventoVelocidadeKt * 10) / 10}kt ${windDirection(condicoes.ventoDirecaoGraus)}`, scoreNorm: scoreWind(condicoes.ventoVelocidadeKt, condicoes.ventoDirecaoGraus), contribuicao: 0 },
    { nome: 'onda', peso: pesos.onda, valorBruto: `${Math.round(condicoes.ondaAlturaM * 10) / 10}m T=${Math.round(condicoes.ondaPeriodoS)}s`, scoreNorm: scoreWave(condicoes.ondaAlturaM, condicoes.ondaPeriodoS), contribuicao: 0 },
    { nome: 'lua', peso: pesos.lua, valorBruto: `${Math.round(condicoes.luaIluminacao * 100)}% iluminação`, scoreNorm: scoreMoon(condicoes.luaIluminacao), contribuicao: 0 },
    { nome: 'pressao', peso: pesos.pressao, valorBruto: `${Math.round(condicoes.pressaoHpa)} hPa (Δ${condicoes.pressaoVariacao12h > 0 ? '+' : ''}${Math.round(condicoes.pressaoVariacao12h * 10) / 10})`, scoreNorm: scorePressure(condicoes.pressaoHpa, condicoes.pressaoVariacao12h), contribuicao: 0 },
    { nome: 'frente', peso: pesos.frente, valorBruto: '', scoreNorm: scoreColdFront(condicoes.pressaoSerie12h, condicoes.ventoSerie12h), contribuicao: 0 },
    { nome: 'tempAgua', peso: pesos.tempAgua, valorBruto: `${Math.round(condicoes.temperaturaAgua * 10) / 10}°C`, scoreNorm: scoreWaterTemp(condicoes.temperaturaAgua), contribuicao: 0 },
    { nome: 'navios', peso: pesos.navios, valorBruto: `${condicoes.naviosFundeados.length} navios próximos`, scoreNorm: scoreShips(condicoes.naviosFundeados, pesqueiro), contribuicao: 0 },
    { nome: 'hora', peso: pesos.hora, valorBruto: `${condicoes.horaAtual}:00`, scoreNorm: scoreTimeOfDay(condicoes.horaAtual, condicoes.horaSol.nascer, condicoes.horaSol.por), contribuicao: 0 },
    { nome: 'visibilidade', peso: pesos.visibilidade, valorBruto: `${Math.round(condicoes.visibilidadeKm)}km`, scoreNorm: scoreVisibility(condicoes.visibilidadeKm), contribuicao: 0 },
    { nome: 'nuvens', peso: pesos.nuvens, valorBruto: `${condicoes.coberturaNuvens}%`, scoreNorm: scoreClouds(condicoes.coberturaNuvens), contribuicao: 0 },
    { nome: 'tempAr', peso: pesos.tempAr, valorBruto: `${Math.round(condicoes.temperaturaAr)}°C`, scoreNorm: scoreAirTemp(condicoes.temperaturaAr), contribuicao: 0 },
    { nome: 'chuva', peso: pesos.chuva, valorBruto: `${Math.round(condicoes.precipitacaoMm * 10) / 10}mm`, scoreNorm: scoreRain(condicoes.precipitacaoMm), contribuicao: 0 },
  ]

  // Fill cold front description
  const frenteFator = fatores.find(f => f.nome === 'frente')!
  frenteFator.valorBruto = frenteFator.scoreNorm >= 0.8 ? 'Frente chegando — peixes ativos' : 'Sem frente em 12h'

  // Calculate contributions
  for (const fator of fatores) {
    fator.contribuicao = Math.round(fator.peso * fator.scoreNorm * 100) / 100
  }

  const score = Math.round(fatores.reduce((sum, f) => sum + f.contribuicao, 0))
  const clampedScore = Math.max(0, Math.min(100, score))

  return {
    score: clampedScore,
    classificacao: classify(clampedScore),
    fatores,
    safetyOverride: false,
  }
}
