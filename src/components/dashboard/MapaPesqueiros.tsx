'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, Minimize2 } from 'lucide-react'
import { getScoreColor } from '@/lib/score-colors'
import { getMarkerSize, getClassificacaoLabel } from '@/lib/format'
import type { PesqueiroResumo } from '@/lib/types'

interface MapaPesqueirosProps {
  pesqueiros: PesqueiroResumo[]
  onPesqueiroClick?: (slug: string) => void
}

export function MapaPesqueiros({ pesqueiros, onPesqueiroClick }: MapaPesqueirosProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
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
      </div>`
      return div
    }
    legend.addTo(map)

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [pesqueiros, onPesqueiroClick])

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onFsChange() {
      setFullscreen(!!document.fullscreenElement)
      // Multiple invalidateSize calls to ensure tiles load after resize
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100)
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300)
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 600)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={mapRef}
        className={`${fullscreen ? 'h-screen w-screen' : 'h-[320px] sm:h-[400px] lg:h-[450px]'} rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700`}
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
