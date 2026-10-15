import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { tileLayer, type Map, type Layer } from 'leaflet';
import { getVersion, setWorkerUrl, type StyleSpecification } from 'maplibre-gl';
import { englishMapStyle } from './englishMapStyle';
import { safeMapFilters } from './mapFilterSafety';

export const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
export const FALLBACK_MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_LOAD_TIMEOUT_MS = 15_000;
const attribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function canceled() { return new DOMException('Map closed.', 'AbortError'); }

// Resolving a style download does not mean a map rendered. Wait for actual
// renderer/tile readiness and release listeners and layers when the picker closes.
function waitForLayer(layer: Layer, signal: AbortSignal, subscribe: (loaded: () => void, failed: () => void) => () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      unsubscribe();
      if (error) { layer.remove(); reject(error); } else resolve();
    };
    const loaded = () => finish();
    const failed = () => finish(new Error('Map renderer could not load.'));
    const abort = () => finish(canceled());
    const timer = setTimeout(() => finish(new Error('Map loading timed out.')), MAP_LOAD_TIMEOUT_MS);
    const unsubscribe = subscribe(loaded, failed);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}

async function addVectorLayer(map: Map, signal: AbortSignal): Promise<void> {
  const download = new AbortController();
  const abort = () => download.abort();
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, MAP_LOAD_TIMEOUT_MS);
  let layer: ReturnType<typeof maplibreGL> | undefined;
  try {
    if (signal.aborted) throw canceled();
    const response = await fetch(process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL, { signal: download.signal });
    if (!response.ok) throw new Error('Map style could not load.');
    const style = await response.json() as StyleSpecification;
    if (style.version !== 8 || !Array.isArray(style.layers) || !style.sources) throw new Error('Map style is invalid.');
    if (signal.aborted) throw canceled();
    setWorkerUrl(new URL(`/maplibre/${getVersion()}/maplibre-gl-worker.mjs`, window.location.origin).href);
    layer = maplibreGL({ style: safeMapFilters(englishMapStyle(style)), attributionControl: { customAttribution: attribution } });
    // The Leaflet adapter assumes GL construction succeeded when removing a
    // layer. A device without WebGL2 can throw before that GL instance exists.
    const remove = layer.onRemove;
    layer.onRemove = function (owner) {
      if (this.getMaplibreMap()?.getCanvas().getContext('webgl2')) return remove.call(this, owner);
      this.getContainer()?.remove();
      return this;
    };
    layer.addTo(map);
    const renderer = layer.getMaplibreMap();
    // Some v6 builds emit the initial GPU error during construction, before
    // listeners can be attached. Detect that case immediately instead of
    // showing a blank canvas until the readiness deadline expires.
    if (!renderer.getCanvas().getContext('webgl2')) throw new Error('WebGL2 is unavailable.');
    await waitForLayer(layer, signal, (loaded, failed) => {
      renderer.on('load', loaded);
      renderer.on('error', failed);
      return () => { renderer.off('load', loaded); renderer.off('error', failed); };
    });
  } catch (error) {
    layer?.remove();
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}

export async function addReadableMapLayer(map: Map, signal: AbortSignal): Promise<void> {
  try {
    await addVectorLayer(map, signal);
  } catch {
    // WebGL2, a worker, or the vector host can fail independently. Preserve the
    // Leaflet map, selected coordinates, privacy rules, markers and interactions.
    if (signal.aborted) return;
    const fallback = tileLayer(process.env.NEXT_PUBLIC_MAP_FALLBACK_TILE_URL || FALLBACK_MAP_TILE_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 19, maxZoom: 19, keepBuffer: 0,
    });
    const loaded = waitForLayer(fallback, signal, loaded => {
      fallback.on('tileload', loaded);
      return () => { fallback.off('tileload', loaded); };
    });
    fallback.addTo(map);
    await loaded;
  }
}
