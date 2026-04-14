'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, Minimize2, Crosshair } from 'lucide-react'
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
  const days = hours / 24
  if (days >= 6) return '#064e3b'  // emerald-900 — 6+ dias (quase preto-verde)
  if (days >= 5) return '#065f46'  // emerald-800 — 5 dias
  if (days >= 4) return '#047857'  // emerald-700 — 4 dias
  if (days >= 3) return '#059669'  // emerald-600 — 3 dias
  if (days >= 2) return '#eab308'  // yellow-500 — 2 dias
  if (days >= 1) return '#f97316'  // orange-500 — 1 dia
  return '#ef4444'                  // red-500 — <1 dia
}

function formatHours(hours: number): string {
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h`
  return `${Math.floor(hours)}h`
}

function shipSvg(color: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17L5 7H19L21 17H3Z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <path d="M12 7V3" stroke="white" stroke-width="1.5"/>
    <path d="M8 7L12 3L16 7" fill="${color}" stroke="white" stroke-width="1"/>
    <path d="M2 20C4 18 6 18 8 20C10 18 12 18 14 20C16 18 18 18 20 20C22 18 22 18 22 18" stroke="white" stroke-width="1.2" fill="none" opacity="0.7"/>
  </svg>`
}

function addShipsToMap(map: L.Map, ships: Ship[]) {
  ships.forEach((s) => {
    const isAnchored = s.status === 'at_anchor' || s.status === 'fundeado' || s.status === 'atracado'
    const hours = getAnchorHours(s.primeiroVistoEm)
    const color = getShipColor(hours, isAnchored)
    const days = hours / 24
    const size = !isAnchored ? 12 : days >= 6 ? 18 : days >= 3 ? 15 : 13

    const icon = L.divIcon({
      className: '',
      html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${shipSvg(color, size)}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
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
      html: `<div style="width:${size * 2}px;height:${size * 2}px;background:${color};border:1.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.15s" onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'" />`,
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
      <span style="display:flex;align-items:center;gap:3px;margin-left:6px;border-left:1px solid #e2e8f0;padding-left:6px">🚢<span style="width:8px;height:8px;background:#064e3b;display:inline-block;border-radius:2px"></span> 6d+</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;background:#059669;display:inline-block;border-radius:2px"></span> 3d</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;background:#eab308;display:inline-block;border-radius:2px"></span> 2d</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;background:#f97316;display:inline-block;border-radius:2px"></span> 1d</span>
      <span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;background:#ef4444;display:inline-block;border-radius:2px"></span> novo</span>
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
  const userMarkerRef = useRef<L.Marker | null>(null)
  const userAccuracyRef = useRef<L.Circle | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [ships, setShips] = useState<Ship[]>([])
  const [userPos, setUserPos] = useState<GeolocationPosition | null>(null)

  // Fetch ships
  useEffect(() => {
    fetch('/api/ships')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setShips(data) })
      .catch(() => {})
  }, [])

  // Track user location in real-time
  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos(pos),
      (err) => console.log('Geolocation:', err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Update user marker on map when position changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !userPos) return

    const { latitude, longitude, accuracy } = userPos.coords

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude])
      userAccuracyRef.current?.setLatLng([latitude, longitude]).setRadius(accuracy)
    } else {
      // Blue pulsing dot for user location
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:16px;height:16px">
          <div style="position:absolute;top:0;left:0;width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>
          <div style="position:absolute;top:-4px;left:-4px;width:24px;height:24px;background:#3b82f6;border-radius:50%;opacity:0.3;animation:pulse 2s infinite"></div>
        </div>
        <style>
          @keyframes pulse { 0% { transform: scale(1); opacity: 0.3 } 70% { transform: scale(2); opacity: 0 } 100% { transform: scale(2); opacity: 0 } }
        </style>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 10000 })
        .bindPopup(`<div style="font-family:'Inter',sans-serif"><b>🧭 Você está aqui</b><br><span style="font-size:10px;color:#64748b">Precisão: ${Math.round(accuracy)}m</span></div>`, { closeButton: false })
        .addTo(map)

      userAccuracyRef.current = L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
      }).addTo(map)
    }
  }, [userPos])

  // Rebuild map whenever fullscreen changes, pesqueiros change, or ships load
  const buildMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
    userMarkerRef.current = null
    userAccuracyRef.current = null
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
        className={fullscreen ? '' : 'h-[450px] sm:h-[550px] lg:h-[650px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700'}
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
      {userPos && (
        <button
          onClick={() => {
            const map = mapInstanceRef.current
            if (map && userPos) {
              map.setView([userPos.coords.latitude, userPos.coords.longitude], 14)
            }
          }}
          className="absolute top-14 right-3 z-[1000] p-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
          title="Centralizar na minha localização"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
