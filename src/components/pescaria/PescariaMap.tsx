'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getScoreColor } from '@/lib/score-colors'
import { getMarkerSize, getClassificacaoLabel } from '@/lib/format'
import type { PesqueiroResumo } from '@/lib/types'
import type { Ship } from '@/components/dashboard/MapaPesqueiros'

interface Ponto { lat: number; lon: number; timestamp: string }
interface Visita { id: number; nomePersonalizado: string | null; lat: number | null; lon: number | null; especie: string | null; quantidade: number | null }
interface Foto { id: number; dataUrl: string; lat: number | null; lon: number | null; timestamp: string }

function getAnchorHours(primeiroVistoEm: string): number {
  return Math.max(0, (Date.now() - new Date(primeiroVistoEm).getTime()) / 3600000)
}

function getShipColor(hours: number): string {
  const days = hours / 24
  if (days >= 6) return '#064e3b'
  if (days >= 5) return '#065f46'
  if (days >= 4) return '#047857'
  if (days >= 3) return '#059669'
  if (days >= 2) return '#eab308'
  if (days >= 1) return '#f97316'
  return '#ef4444'
}

function formatHours(hours: number): string {
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h`
  return `${Math.floor(hours)}h`
}

export function PescariaMap({ pontos, visitas, fotos }: { pontos: Ponto[]; visitas: Visita[]; fotos: Foto[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [pesqueiros, setPesqueiros] = useState<PesqueiroResumo[]>([])
  const [ships, setShips] = useState<Ship[]>([])

  // Fetch pesqueiros and ships once
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      if (d?.pesqueiros) setPesqueiros(d.pesqueiros)
    }).catch(() => {})
    fetch('/api/ships').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setShips(d)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const center: [number, number] = pontos.length > 0
      ? [pontos[pontos.length - 1].lat, pontos[pontos.length - 1].lon]
      : [-25.55, -48.30]

    const map = L.map(mapRef.current, { center, zoom: 12 })

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '&copy; Esri', maxZoom: 18 }
    ).addTo(map)

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, opacity: 0.8 }
    ).addTo(map)

    // Pesqueiros (bottom layer, smaller)
    pesqueiros.forEach((p) => {
      const color = getScoreColor(p.scoreAtual)
      const size = getMarkerSize(p.scoreAtual)
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size * 2}px;height:${size * 2}px;background:${color};border:1.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);opacity:0.85"></div>`,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      })
      L.marker([p.lat, p.lon], { icon })
        .bindPopup(`<div style="font-family:'Inter',sans-serif"><b>${p.nome}</b><br>Score: ${p.scoreAtual} (${getClassificacaoLabel(p.classificacao)})</div>`, { closeButton: false })
        .addTo(map)
    })

    // Ships
    ships.forEach((s) => {
      const hours = getAnchorHours(s.primeiroVistoEm)
      const color = getShipColor(hours)
      const size = hours / 24 >= 6 ? 18 : 14
      const icon = L.divIcon({
        className: '',
        html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L5 7H19L21 17H3Z" fill="${color}" stroke="white" stroke-width="1.5"/>
          <path d="M12 7V3" stroke="white" stroke-width="1.5"/>
          <path d="M8 7L12 3L16 7" fill="${color}" stroke="white" stroke-width="1"/>
        </svg></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
      L.marker([s.lat, s.lon], { icon })
        .bindPopup(`<div style="font-family:'Inter',sans-serif"><b>🚢 ${s.nomeNavio || `MMSI ${s.mmsi}`}</b><br><span style="font-size:11px">⚓ Fundeado há ${formatHours(hours)}</span></div>`, { closeButton: false })
        .addTo(map)
    })

    // Track polyline (top layer, main focus)
    if (pontos.length >= 2) {
      const latLngs: [number, number][] = pontos.map((p) => [p.lat, p.lon])
      L.polyline(latLngs, { color: '#3b82f6', weight: 4, opacity: 0.9 }).addTo(map)
      map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] })

      const startIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#22c55e;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      })
      L.marker(latLngs[0], { icon: startIcon, zIndexOffset: 1000 }).addTo(map).bindPopup('<b>Início</b>', { closeButton: false })

      const endIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      })
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon, zIndexOffset: 1000 }).addTo(map).bindPopup('<b>Fim / Atual</b>', { closeButton: false })
    }

    // Visitas (locais pescados) — top priority
    visitas.forEach((v) => {
      if (v.lat == null || v.lon == null) return
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:#f59e0b;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:13px">🎣</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      })
      const catchInfo = v.quantidade && v.especie ? `<br>🐟 ${v.quantidade}× ${v.especie}` : ''
      L.marker([v.lat, v.lon], { icon, zIndexOffset: 2000 })
        .bindPopup(`<div style="font-family:'Inter',sans-serif"><b>${v.nomePersonalizado || 'Local'}</b>${catchInfo}</div>`, { closeButton: false })
        .addTo(map)
    })

    // Fotos
    fotos.forEach((f) => {
      if (f.lat == null || f.lon == null) return
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:20px;height:20px;background:#8b5cf6;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:11px">📷</div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      })
      L.marker([f.lat, f.lon], { icon, zIndexOffset: 1500 })
        .bindPopup(`<div><img src="${f.dataUrl}" style="max-width:200px;border-radius:6px" /></div>`, { closeButton: true, maxWidth: 220 })
        .addTo(map)
    })

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [pontos, visitas, fotos, pesqueiros, ships])

  return (
    <div ref={mapRef} className="h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700" style={{ zIndex: 0 }} />
  )
}
