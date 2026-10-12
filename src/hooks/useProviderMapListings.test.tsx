import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api/axios';
import useProviderMapListings from './useProviderMapListings';

vi.mock('../lib/api/axios',()=>({api:{get:vi.fn()}}));
const viewport={center:{latitude:10.3,longitude:123.9},bounds:{north:10.32,south:10.28,east:123.92,west:123.88}};
const filters={search:'  repair  laptop ',category:'Electrical Repair',filter:'rated'};
const pin={id:'outside',title:'Laptop repairs',label:'Public area',area:{latitude:10.4,longitude:123.9,approximate:true}};
const response={data:{success:true,data:{mapPins:[pin],items:[{id:'outside',provider:{name:'John'}}]}}};

describe('provider markers in the location modal',()=>{
  beforeEach(()=>{vi.mocked(api.get).mockReset();});
  it('queries the map area rather than a selected radius, respects filters and uses only public approximate pins',async()=>{
    vi.mocked(api.get).mockResolvedValue({data:{success:true,data:{...response.data.data,mapPins:[pin,{...pin,id:'exact',area:{...pin.area,approximate:false}}]}}});
    const {result,rerender}=renderHook(({enabled})=>useProviderMapListings(viewport,enabled ? {...filters} : undefined),{initialProps:{enabled:true}});
    await waitFor(()=>expect(result.current.resolved).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/services/nearby',expect.objectContaining({params:expect.objectContaining({radiusKm:30,search:'repair laptop',category:'Electrical Repair',filter:'rated'})}));
    expect(result.current.pins).toEqual([{...pin,providerName:'John'}]);
    rerender({enabled:true});
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,300));});
    expect(api.get).toHaveBeenCalledTimes(1);
    rerender({enabled:false});
    expect(result.current.pins).toEqual([]);
  });
  it('deduplicates overlapping viewport requests and includes pins beyond the returned first page',async()=>{
    vi.mocked(api.get).mockResolvedValue({data:{success:true,data:{...response.data.data,items:[],mapPins:[pin]}}});
    const {result}=renderHook(()=>useProviderMapListings({...viewport,bounds:{north:10.8,south:10,east:124.3,west:123.5}},filters));
    await waitFor(()=>expect(result.current.resolved).toBe(true));
    expect(vi.mocked(api.get).mock.calls.length).toBeGreaterThan(1);
    expect(result.current.pins).toEqual([pin]);
  });
  it('ignores a stale request after the viewport changes and retries a failed load',async()=>{
    let finish:((value:typeof response)=>void)|undefined;
    vi.mocked(api.get).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
    const {result,rerender}=renderHook(({view})=>useProviderMapListings(view,filters),{initialProps:{view:viewport}});
    await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(1));
    const signal=vi.mocked(api.get).mock.calls[0][1]?.signal;
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Offline'));
    rerender({view:{...viewport,center:{latitude:10.4,longitude:123.9},bounds:{...viewport.bounds,north:10.42,south:10.38}}});
    expect(signal?.aborted).toBe(true);
    await waitFor(()=>expect(result.current.error).toBeTruthy());
    await act(async()=>{finish?.(response);});
    expect(result.current.pins).toEqual([]);
    vi.mocked(api.get).mockResolvedValue(response);
    act(()=>{result.current.retry();});
    await waitFor(()=>expect(result.current.pins).toHaveLength(1));
    expect(result.current.error).toBe('');
  });
});
