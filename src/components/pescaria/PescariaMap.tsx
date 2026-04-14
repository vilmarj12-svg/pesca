'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Ponto { lat: number; lon: number; timestamp: string }
interface Visita { id: number; nomePersonalizado: string | null; lat: number | null; lon: number | null; especie: string | null; quantidade: number | null }
interface Foto { id: number; dataUrl: string; lat: number | null; lon: number | null; timestamp: string }

export function PescariaMap({ pontos, visitas, fotos }: { pontos: Ponto[]; visitas: Visita[]; fotos: Foto[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Default center litoral PR
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

    // Track polyline
    if (pontos.length >= 2) {
      const latLngs: [number, number][] = pontos.map((p) => [p.lat, p.lon])
      L.polyline(latLngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(map)
      map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] })

      // Start and end markers
      const startIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#22c55e;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      })
      L.marker(latLngs[0], { icon: startIcon }).addTo(map).bindPopup('<b>Início</b>', { closeButton: false })

      const endIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      })
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(map).bindPopup('<b>Fim / Atual</b>', { closeButton: false })
    }

    // Visitas (local pescado)
    visitas.forEach((v) => {
      if (v.lat == null || v.lon == null) return
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:22px;height:22px;background:#f59e0b;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:12px">🎣</div>`,
        iconSize: [22, 22], iconAnchor: [11, 11],
      })
      const catchInfo = v.quantidade && v.especie ? `<br>🐟 ${v.quantidade}× ${v.especie}` : ''
      L.marker([v.lat, v.lon], { icon })
        .bindPopup(`<div style="font-family:'Inter',sans-serif"><b>${v.nomePersonalizado || 'Local'}</b>${catchInfo}</div>`, { closeButton: false })
        .addTo(map)
    })

    // Fotos
    fotos.forEach((f) => {
      if (f.lat == null || f.lon == null) return
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;background:#8b5cf6;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:10px">📷</div>`,
        iconSize: [18, 18], iconAnchor: [9, 9],
      })
      L.marker([f.lat, f.lon], { icon })
        .bindPopup(`<div><img src="${f.dataUrl}" style="max-width:200px;border-radius:6px" /></div>`, { closeButton: true, maxWidth: 220 })
        .addTo(map)
    })

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [pontos, visitas, fotos])

  return (
    <div ref={mapRef} className="h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700" style={{ zIndex: 0 }} />
  )
}
