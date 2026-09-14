import React from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { HOME_POINT } from '../data/directory.js'
import { buildTovantMapStyle, circlePolygon, mapColors } from '../data/mapStyle.js'

const readTheme = () => (
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light'
)

const pinButton = (label, on) => {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'tv-map-pin'
  btn.setAttribute('aria-label', label)
  btn.dataset.active = on ? '1' : '0'
  btn.innerHTML = `<span class="tv-map-pin__label">${label}</span><span class="tv-map-pin__dot"></span>`
  return btn
}

/**
 * Twin Cities map — solid ground, OSM roads in Tovant colors, shop pins.
 * Labels are shop names, never prices.
 */
export default function AreaMap({
  pins = [],
  activeId,
  onPin,
  count,
  height = 632,
  radiusRing = false,
  center = HOME_POINT,
  zoom = 11,
}) {
  const wrap = React.useRef(null)
  const mapRef = React.useRef(null)
  const markersRef = React.useRef([])
  const onPinRef = React.useRef(onPin)
  onPinRef.current = onPin

  React.useEffect(() => {
    if (!wrap.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: wrap.current,
      style: buildTovantMapStyle(readTheme()),
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
      cooperativeGestures: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    mapRef.current = map

    const syncTheme = () => {
      if (!mapRef.current) return
      mapRef.current.setStyle(buildTovantMapStyle(readTheme()), { diff: true })
    }

    const obs = new MutationObserver(syncTheme)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(wrap.current)

    return () => {
      obs.disconnect()
      ro.disconnect()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [center.lat, center.lng, zoom])

  React.useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    pins.forEach((p) => {
      if (p.lat == null || p.lng == null) return
      const on = p.id === activeId
      const el = pinButton(p.label, on)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onPinRef.current?.(p.id)
      })
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.lng, p.lat])
        .addTo(map)
      marker.getElement().setAttribute('aria-label', p.label)
      markersRef.current.push(marker)
    })
  }, [pins, activeId])

  React.useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const ensureRing = () => {
      const pin = pins[0]
      const want = radiusRing && pin?.lat != null
      if (map.getLayer('tv-radius-fill')) map.removeLayer('tv-radius-fill')
      if (map.getLayer('tv-radius-line')) map.removeLayer('tv-radius-line')
      if (map.getSource('tv-radius')) map.removeSource('tv-radius')
      if (!want) return

      const c = mapColors(readTheme())
      map.addSource('tv-radius', {
        type: 'geojson',
        data: circlePolygon(pin.lat, pin.lng, 6500),
      })
      map.addLayer({
        id: 'tv-radius-fill',
        type: 'fill',
        source: 'tv-radius',
        paint: { 'fill-color': c.highway, 'fill-opacity': 0.14 },
      })
      map.addLayer({
        id: 'tv-radius-line',
        type: 'line',
        source: 'tv-radius',
        paint: { 'line-color': c.highway, 'line-width': 1.5 },
      })
    }

    if (map.isStyleLoaded()) ensureRing()
    else map.once('load', ensureRing)
    map.on('style.load', ensureRing)
    return () => { map.off('style.load', ensureRing) }
  }, [pins, radiusRing])

  React.useEffect(() => {
    const map = mapRef.current
    const pin = pins.find((p) => p.id === activeId)
    if (map && pin?.lat != null) {
      map.easeTo({ center: [pin.lng, pin.lat], duration: 450 })
    }
  }, [activeId, pins])

  const zoomBy = (d) => {
    const map = mapRef.current
    if (!map) return
    map.zoomTo(map.getZoom() + d, { duration: 200 })
  }

  return (
    <div
      className="tv-map"
      style={{
        position: 'relative',
        height,
        borderRadius: 'var(--tv-r-card)',
        overflow: 'hidden',
        background: 'var(--tv-map-base)',
        boxShadow: 'var(--tv-shadow)',
      }}
    >
      <div ref={wrap} style={{ position: 'absolute', inset: 0 }} />
      {count != null && (
        <div
          className="tv-map-chip"
          style={{
            position: 'absolute',
            left: 20,
            bottom: 20,
            zIndex: 2,
            padding: '12px 16px',
            borderRadius: 18,
            font: '600 12.5px/1 var(--tv-font)',
          }}
        >
          {count} pro{count === 1 ? '' : 's'} in this view
        </div>
      )}
      <div style={{ position: 'absolute', right: 20, top: 20, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[['+', 1], ['−', -1]].map(([g, d]) => (
          <button
            key={g}
            type="button"
            aria-label={d > 0 ? 'Zoom in' : 'Zoom out'}
            onClick={() => zoomBy(d)}
            className="tv-map-zoom"
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}
