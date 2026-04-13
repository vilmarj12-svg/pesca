'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, Minimize2 } from 'lucide-react'
import { getScoreColor } from '@/lib/score-colors'
import { getMarkerSize, getClassificacaoLabel } from '@/lib/format'
import type { PesqueiroResumo } from '@/lib/types'

export interface Ship {
  mmsi: number
  lat: number
  lon: number
  nomeNavio: string | null
  primeiroVistoEm: string
  ultimoVistoEm: string
  status: string
}

interface MapaPesqueirosProps {
  pesqueiros: PesqueiroResumo[]
  onPesqueiroClick?: (slug: string) => void
}

function getAnchorHours(primeiroVistoEm: string): number {
  return Math.max(0, (Date.now() - new Date(primeiroVistoEm).getTime()) / 3600000)
}

function getShipColor(hours: number, isAnchored: boolean): string {
  if (!isAnchored) return '#6b7280' // gray for non-anchored
  // Verde = mais tempo (bom pra pesca), vermelho = pouco tempo
  if (hours >= 48) return '#10b981' // emerald — 2+ dias fundeado
  if (hours >= 24) return '#22c55e' // green — 1-2 dias
  if (hours >= 12) return '#eab308' // yellow — 12-24h
  if (hours >= 6) return '#f97316'  // orange — 6-12h
  return '#ef4444'                   // red — <6h recém chegou
}

function formatHours(hours: number): string {
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h`
  return `${Math.floor(hours)}h`
}

function addShipsToMap(map: L.Map, ships: Ship[]) {
  ships.forEach((s) => {
    const isAnchored = s.status === 'at_anchor' || s.status === 'fundeado' || s.status === 'atracado'
    const hours = getAnchorHours(s.primeiroVistoEm)
    const color = getShipColor(hours, isAnchored)
    const size = isAnchored ? (hours >= 24 ? 8 : 6) : 5

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:${size * 2}px;height:${size * 2}px;background:${color};border:2px solid white;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,0.4);transform:rotate(45deg)" />`,
      iconSize: [size * 2, size * 2],
      iconAnchor: [size, size],
    })

    const marker = L.marker([s.lat, s.lon], { icon }).addTo(map)
    const name = s.nomeNavio || `MMSI ${s.mmsi}`
    const statusLabel = isAnchored ? `⚓ Fundeado há ${formatHours(hours)}` : `🚢 ${s.status}`

    marker.bindPopup(`
      <div style="font-family:'Inter',sans-serif;min-width:160px">
        <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:3px">🚢 ${name}</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:2px">${statusLabel}</div>
        <div style="font-size:9px;color:#94a3b8;font-family:'JetBrains Mono',monospace">${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</div>
      </div>
    `, { closeButton: false, offset: [0, -size] })
  })
}

function initMap(
  container: HTMLDivElement,
  pesqueiros: PesqueiroResumo[],
  ships: Ship[],
  onPesqueiroClick?: (slug: string) => void,
): L.Map {
  const map = L.map(container, {
    center: [-25.65, -48.35],
    zoom: 10,
    zoomControl: true,
    attributionControl: true,
  })

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri, Maxar, Earthstar Geographics', maxZoom: 18 }
  ).addTo(map)

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, opacity: 0.8 }
  ).addTo(map)

  pesqueiros.forEach((p) => {
    const color = getScoreColor(p.scoreAtual)
    const size = getMarkerSize(p.scoreAtual)

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:${size * 2}px;height:${size * 2}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.15s" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" />`,
      iconSize: [size * 2, size * 2],
      iconAnchor: [size, size],
    })

    const marker = L.marker([p.lat, p.lon], { icon }).addTo(map)

    marker.bindPopup(`
      <div style="font-family:'Inter',sans-serif;min-width:160px">
        <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${p.nome}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:14px;font-weight:900;color:white;background:${color}">${p.scoreAtual}</span>
          <span style="font-size:11px;color:#64748b">${getClassificacaoLabel(p.classificacao)}</span>
        </div>
        ${p.proximaJanela ? `<div style="font-size:10px;color:#94a3b8">Janela: ${p.proximaJanela}</div>` : ''}
        <div style="font-size:9px;color:#94a3b8;margin-top:4px;font-family:'JetBrains Mono',monospace">${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}</div>
      </div>
    `, { closeButton: false, offset: [0, -size] })

    marker.on('click', () => onPesqueiroClick?.(p.slug))
  })

  if (pesqueiros.length > 0) {
    const bounds = L.latLngBounds(pesqueiros.map((p) => [p.lat, p.lon]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
  }

  // @ts-expect-error — L.control typing issue with @types/leaflet
  const legend = L.control({ position: 'bottomright' })
  legend.onAdd = () => {
    const div = L.DomUtil.create('div')
    div.innerHTML = `<div style="background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);padding:8px 12px;border-radius:8px;font-size:10px;font-family:'Inter',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;gap:10px;align-items:center">
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block"></span> 80-100</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#fbbf24;display:inline-block"></span> 60-79</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#f97316;display:inline-block"></span> 40-59</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span> 0-39</span>
      <span style="display:flex;align-items:center;gap:3px;margin-left:6px;border-left:1px solid #e2e8f0;padding-left:6px"><span style="width:8px;height:8px;border-radius:2px;background:#10b981;display:inline-block;transform:rotate(45deg)"></span> 2d+</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#eab308;display:inline-block;transform:rotate(45deg)"></span> 12h</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#ef4444;display:inline-block;transform:rotate(45deg)"></span> novo</span>
    </div>`
    return div
  }
  legend.addTo(map)

  // Add ships
  if (ships.length > 0) {
    addShipsToMap(map, ships)
  }

  return map
}

export function MapaPesqueiros({ pesqueiros, onPesqueiroClick }: MapaPesqueirosProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [ships, setShips] = useState<Ship[]>([])

  // Fetch ships
  useEffect(() => {
    fetch('/api/ships')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setShips(data) })
      .catch(() => {})
  }, [])

  // Rebuild map whenever fullscreen changes, pesqueiros change, or ships load
  const buildMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
    if (!mapRef.current) return
    mapInstanceRef.current = initMap(mapRef.current, pesqueiros, ships, onPesqueiroClick)
  }, [pesqueiros, ships, onPesqueiroClick])

  // Initial mount
  useEffect(() => {
    buildMap()
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [buildMap])

  // Rebuild on fullscreen change
  useEffect(() => {
    function onFsChange() {
      const isFs = !!document.fullscreenElement
      setFullscreen(isFs)
      // Wait for DOM to settle, then rebuild the map
      setTimeout(() => buildMap(), 100)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [buildMap])

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={fullscreen ? { width: '100vw', height: '100vh', background: '#1c1917' } : undefined}
    >
      <div
        ref={mapRef}
        style={fullscreen ? { width: '100%', height: '100%' } : undefined}
        className={fullscreen ? '' : 'h-[320px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700'}
      />
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-[1000] p-2 rounded-lg bg-white/90 dark:bg-stone-800/90 shadow-md hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
        title={fullscreen ? 'Minimizar mapa' : 'Maximizar mapa'}
      >
        {fullscreen
          ? <Minimize2 className="w-4 h-4 text-stone-700 dark:text-stone-200" />
          : <Maximize2 className="w-4 h-4 text-stone-700 dark:text-stone-200" />
        }
      </button>
    </div>
  )
}
