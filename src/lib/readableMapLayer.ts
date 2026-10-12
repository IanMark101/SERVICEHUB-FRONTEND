import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import type { Map } from 'leaflet';
import type { StyleSpecification } from 'maplibre-gl';
import { englishMapStyle } from './englishMapStyle';

export const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const attribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export async function addReadableMapLayer(map: Map, signal: AbortSignal): Promise<void> {
  const response = await fetch(process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL, { signal });
  if (!response.ok) throw new Error('Map style could not load.');
  const style = await response.json() as StyleSpecification;
  if (style.version !== 8 || !Array.isArray(style.layers) || !style.sources) throw new Error('Map style is invalid.');
  // A closed/reopened picker must never attach a late layer to the old map.
  if (signal.aborted) return;
  maplibreGL({ style: englishMapStyle(style), attributionControl: { customAttribution: attribution } }).addTo(map);
}
