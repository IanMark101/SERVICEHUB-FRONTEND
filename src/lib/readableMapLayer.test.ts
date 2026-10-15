import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Evented, tileLayer, type Map } from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import { addReadableMapLayer, DEFAULT_MAP_STYLE_URL, FALLBACK_MAP_TILE_URL, MAP_LOAD_TIMEOUT_MS } from './readableMapLayer';

vi.mock('@maplibre/maplibre-gl-leaflet', () => ({ maplibreGL: vi.fn() }));
vi.mock('maplibre-gl', () => ({ getVersion: () => '6.4.1', setWorkerUrl: vi.fn() }));
vi.mock('leaflet', async original => ({ ...await original<typeof import('leaflet')>(), tileLayer: vi.fn() }));
const style = { version: 8, sources: {}, layers: [] };
const map = {} as Map;
class MapEvents extends Evented {}
let renderer: Evented, vector: ReturnType<typeof maplibreGL>, raster: ReturnType<typeof tileLayer>;
const settle = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv('NEXT_PUBLIC_MAP_STYLE_URL', '');
  vi.stubEnv('NEXT_PUBLIC_MAP_FALLBACK_TILE_URL', '');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => style }));
  renderer = Object.assign(new MapEvents(), { getCanvas: () => ({ getContext: () => ({}) }) });
  vector = { addTo: vi.fn(), remove: vi.fn(), onRemove: vi.fn(), getMaplibreMap: () => renderer } as unknown as typeof vector;
  raster = Object.assign(new MapEvents(), { addTo: vi.fn(), remove: vi.fn() }) as unknown as typeof raster;
  vi.mocked(maplibreGL).mockReturnValue(vector);
  vi.mocked(tileLayer).mockReturnValue(raster);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe('readable basemap readiness and recovery', () => {
  it('configures the same-origin versioned worker before adding the vector layer and waits for rendering', async () => {
    let ready = false;
    const pending = addReadableMapLayer(map, new AbortController().signal).then(() => { ready = true; });
    await settle();
    expect(fetch).toHaveBeenCalledWith(DEFAULT_MAP_STYLE_URL, { signal: expect.any(AbortSignal) });
    expect(setWorkerUrl).toHaveBeenCalledWith(`${window.location.origin}/maplibre/6.4.1/maplibre-gl-worker.mjs`);
    expect(vi.mocked(setWorkerUrl).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(vector.addTo).mock.invocationCallOrder[0]);
    expect(maplibreGL).toHaveBeenCalledWith(expect.objectContaining({ attributionControl: { customAttribution: expect.stringContaining('OpenStreetMap') } }));
    expect(vector.addTo).toHaveBeenCalledWith(map);
    expect(ready).toBe(false);
    renderer.fire('load'); await pending;
    expect(ready).toBe(true);
    expect(tileLayer).not.toHaveBeenCalled();
    expect(renderer.listens('load')).toBe(false);
    expect(renderer.listens('error')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never attaches a late style response to a closed picker', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => { controller.abort(); return style; } }));
    await addReadableMapLayer(map, controller.signal);
    expect(maplibreGL).not.toHaveBeenCalled();
    expect(tileLayer).not.toHaveBeenCalled();
  });

  it.each(['style unavailable', 'invalid style', 'WebGL unavailable', 'worker error', 'worker stalled'])('recovers from %s without replacing the Leaflet map', async failure => {
    if (failure === 'style unavailable') vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    if (failure === 'invalid style') vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 8 }) }));
    if (failure === 'WebGL unavailable') vi.mocked(vector.addTo).mockImplementation(() => { throw new Error('GPUInitializationError'); });
    const pending = addReadableMapLayer(map, new AbortController().signal);
    await settle();
    if (failure === 'worker error') renderer.fire('error');
    if (failure === 'worker stalled') await vi.advanceTimersByTimeAsync(MAP_LOAD_TIMEOUT_MS);
    await settle();
    expect(tileLayer).toHaveBeenCalledWith(FALLBACK_MAP_TILE_URL, expect.objectContaining({ attribution: expect.stringContaining('OpenStreetMap'), keepBuffer: 0 }));
    expect(raster.addTo).toHaveBeenCalledWith(map);
    raster.fire('tileload'); await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes a pending renderer and its listeners on close, without starting a fallback', async () => {
    const controller = new AbortController();
    const pending = addReadableMapLayer(map, controller.signal);
    await settle(); controller.abort(); await pending;
    expect(vector.remove).toHaveBeenCalled();
    expect(renderer.listens('load')).toBe(false);
    expect(renderer.listens('error')).toBe(false);
    expect(tileLayer).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reports failure if neither renderer can load rather than leaving an unexplained blank map', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
    const pending = addReadableMapLayer(map, new AbortController().signal);
    const rejected = expect(pending).rejects.toThrow('Map loading timed out');
    await settle(); await vi.advanceTimersByTimeAsync(MAP_LOAD_TIMEOUT_MS); await rejected;
    expect(raster.remove).toHaveBeenCalled();
    expect(raster.listens('tileload')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops fallback loading when its picker closes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
    const controller = new AbortController();
    const pending = addReadableMapLayer(map, controller.signal);
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await settle(); controller.abort(); await rejected;
    expect(raster.remove).toHaveBeenCalled();
    expect(raster.listens('tileload')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
