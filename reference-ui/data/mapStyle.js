/**
 * Stylized Twin Cities map — solid ground, roads only (OSM via OpenFreeMap).
 * Highways / majors / streets get distinct Tovant palette colors.
 */

const LINE = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false]

const PALETTES = {
  light: {
    background: '#D8D0C0',
    water: '#C4BBA8',
    path: '#9A9DA4',
    street: '#6E747C',
    major: '#8A7350',
    highway: '#E5BE3C',
    highwayCasing: '#B89620',
    label: '#5A5D64',
    labelHalo: '#D8D0C0',
  },
  dark: {
    background: '#0E0F11',
    water: '#16171A',
    path: '#4A4D54',
    street: '#6E747C',
    major: '#C4A574',
    highway: '#E5BE3C',
    highwayCasing: '#8A6E12',
    label: '#A8ABB2',
    labelHalo: '#0E0F11',
  },
}

export const mapColors = (theme) => PALETTES[theme === 'dark' ? 'dark' : 'light']

export const buildTovantMapStyle = (theme = 'light') => {
  const c = mapColors(theme)

  return {
    version: 8,
    name: 'Tovant',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': c.background },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        filter: ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false],
        paint: { 'fill-color': c.water },
      },
      {
        id: 'road-path',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 13,
        filter: ['all', LINE, ['==', ['get', 'class'], 'path']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': c.path,
          'line-opacity': 0.75,
          'line-dasharray': [1.5, 1.5],
          'line-width': ['interpolate', ['exponential', 1.2], ['zoom'], 13, 0.6, 18, 2.5],
        },
      },
      {
        id: 'road-street',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 10,
        filter: ['all', LINE, ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': c.street,
          'line-opacity': 0.95,
          'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 10, 0.4, 14, 1.2, 18, 6],
        },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 7,
        filter: ['all', LINE, ['match', ['get', 'class'], ['primary', 'secondary', 'tertiary', 'trunk'], true, false]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': c.major,
          'line-width': ['interpolate', ['exponential', 1.35], ['zoom'], 7, 0.8, 12, 2.2, 18, 12],
        },
      },
      {
        id: 'road-highway-casing',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 6,
        filter: ['all', LINE, ['==', ['get', 'class'], 'motorway']],
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: {
          'line-color': c.highwayCasing,
          'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 6, 2.2, 12, 5, 18, 22],
        },
      },
      {
        id: 'road-highway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 5,
        filter: ['all', LINE, ['==', ['get', 'class'], 'motorway']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': c.highway,
          'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 1, 12, 3.2, 18, 16],
        },
      },
      {
        id: 'place-suburb',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 11,
        filter: ['match', ['get', 'class'], ['suburb', 'neighbourhood'], true, false],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.06,
          'text-max-width': 8,
        },
        paint: {
          'text-color': c.label,
          'text-halo-color': c.labelHalo,
          'text-halo-width': 1.2,
          'text-opacity': 0.7,
        },
      },
      {
        id: 'place-city',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['==', ['get', 'class'], 'city'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 20],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.08,
          'text-max-width': 10,
        },
        paint: {
          'text-color': c.label,
          'text-halo-color': c.labelHalo,
          'text-halo-width': 1.5,
        },
      },
    ],
  }
}

/** Rough geodesic circle as GeoJSON (meters). */
export const circlePolygon = (lat, lng, radiusM, steps = 64) => {
  const coords = []
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2
    const dx = radiusM * Math.cos(a)
    const dy = radiusM * Math.sin(a)
    const dLat = dy / 111320
    const dLng = dx / (111320 * Math.cos((lat * Math.PI) / 180))
    coords.push([lng + dLng, lat + dLat])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}
