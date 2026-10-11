import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Map } from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { addReadableMapLayer, DEFAULT_MAP_STYLE_URL } from './readableMapLayer';

vi.mock('@maplibre/maplibre-gl-leaflet', () => ({maplibreGL:vi.fn()}));
const style = {version:8,sources:{},layers:[]};
afterEach(() => {vi.unstubAllGlobals();vi.unstubAllEnvs();vi.clearAllMocks();});

describe('readable map layer loading', () => {
  it('loads the public style with a cancelable request and visible attribution', async () => {
    vi.stubEnv('NEXT_PUBLIC_MAP_STYLE_URL', '');
    const fetchStyle = vi.fn().mockResolvedValue({ok:true,json:async () => style});
    vi.stubGlobal('fetch', fetchStyle);
    const addTo = vi.fn();
    vi.mocked(maplibreGL).mockReturnValue({addTo} as unknown as ReturnType<typeof maplibreGL>);
    const map = {} as Map;
    const signal = new AbortController().signal;
    await addReadableMapLayer(map, signal);
    expect(fetchStyle).toHaveBeenCalledWith(DEFAULT_MAP_STYLE_URL, {signal});
    expect(maplibreGL).toHaveBeenCalledWith(expect.objectContaining({attributionControl:{customAttribution:expect.stringContaining('OpenStreetMap')}}));
    expect(addTo).toHaveBeenCalledWith(map);
  });

  it('does not attach a late response to a closed map', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true,json:async () => {controller.abort();return style;}}));
    await addReadableMapLayer({} as Map, controller.signal);
    expect(maplibreGL).not.toHaveBeenCalled();
  });

  it.each([{ok:false}, {ok:true,json:async () => ({version:8})}])('rejects unavailable or invalid styles so the picker can show its recovery message', async response => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    await expect(addReadableMapLayer({} as Map, new AbortController().signal)).rejects.toThrow(/Map style/);
    expect(maplibreGL).not.toHaveBeenCalled();
  });
});
