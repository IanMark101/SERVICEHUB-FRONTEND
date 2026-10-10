import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useNearbyMarketplace from './useNearbyMarketplace';
import { api } from '../lib/api/axios';
import { responseCache } from '../lib/api/responseCache';
import { getCachePolicy } from '../lib/api/cachePolicy';

vi.mock('../lib/api/axios', () => ({ api:{ get:vi.fn() } }));
const location = { point:{ latitude:10.3, longitude:123.9, label:'Cebu' }, radiusKm:10 };
const service = (id:string) => ({ id, title:id, price:'200', providerId:'provider', description:'Repair', isAvailable:true, category:{ name:'Plumbing' }, locationLabel:'Lapu-Lapu', distanceKm:1.2 });
function reply(id:string, page=1) { return { data:{ success:true, data:{ items:[service(id)], pagination:{ page,limit:6,total:8,totalPages:2 } } } }; }
function deferred() { let resolve!:(value:ReturnType<typeof reply>)=>void; const promise=new Promise<ReturnType<typeof reply>>(done=>{resolve=done;});return { promise,resolve }; }
const saved = (id='one', role='seeker') => localStorage.setItem(`servicehub:marketplace-location:${id}:${role}`,JSON.stringify(location));

describe('nearby discovery refresh and privacy', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
  it('requires an explicit location and sends radius and filters to the server before paginating', async () => {
    vi.mocked(api.get).mockImplementation(async (_path, options) => reply('Near service', Number(options?.params.page || 1)));
    const { result,rerender }=renderHook(({category})=>useNearbyMarketplace('seeker','one','',category,'all'), { initialProps:{ category:'All Categories' } });
    expect(result.current.items).toEqual([]); expect(api.get).not.toHaveBeenCalled();
    act(()=>result.current.applyLocation({ ...location, point:{ ...location.point, address:'Private job details' } }));
    await waitFor(()=>expect(result.current.items[0].id).toBe('Near service'));
    expect(api.get).toHaveBeenCalledWith('/services/nearby',expect.objectContaining({ params:expect.objectContaining({latitude:10.3,longitude:123.9,radiusKm:10,page:1,limit:6}),apiCache:'no-store' }));
    expect(localStorage.getItem('servicehub:marketplace-location:one:seeker')).not.toContain('Private job details');
    act(()=>result.current.nextPage());
    await waitFor(()=>expect(result.current.currentPage).toBe(2));
    rerender({ category:'Plumbing' });
    await waitFor(()=>expect(api.get).toHaveBeenLastCalledWith('/services/nearby',expect.objectContaining({ params:expect.objectContaining({ page:1,category:'Plumbing' }) })));
  });
  it('ignores a late response from the previous location or account', async () => {
    saved(); saved('two');
    const old = deferred(), changed = deferred(), other=deferred();
    vi.mocked(api.get).mockImplementationOnce(()=>old.promise).mockImplementationOnce(()=>changed.promise).mockImplementationOnce(()=>other.promise);
    const {result,rerender}=renderHook(({id})=>useNearbyMarketplace('seeker',id,'','All Categories','all'), {initialProps:{ id:'one' }});
    await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(1));
    act(()=>result.current.applyLocation({point:{...location.point,latitude:11},radiusKm:5}));
    await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(2));
    await act(async()=>changed.resolve(reply('Current area')));
    expect(result.current.items[0].id).toBe('Current area');
    rerender({ id:'two' });
    expect(result.current.items).toEqual([]);
    await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(3));
    await act(async()=>{ old.resolve(reply('Wrong account')); other.resolve(reply('Other account')); });
    expect(result.current.items[0].id).toBe('Other account');
  });
  it('keeps confirmed cards on a failed refresh and coalesces live invalidations without creating a loop', async () => {
    saved(); vi.mocked(api.get).mockResolvedValue(reply('Existing card'));
    const {result}=renderHook(()=>useNearbyMarketplace('seeker','one','','All Categories','all'));
    await waitFor(()=>expect(result.current.items).toHaveLength(1));
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Temporarily unavailable'));
    act(()=>result.current.refresh());
    await waitFor(()=>expect(result.current.refreshError).not.toBe(''));
    expect(result.current.error).toBe('');
    expect(result.current.items[0].id).toBe('Existing card');
    act(()=>{responseCache.invalidate(['services'],'socket');responseCache.invalidate(['services'],'socket');responseCache.invalidate(['services'],'socket');});
    await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(3));
    await waitFor(()=>expect(result.current.refreshError).toBe(''));
    await act(async()=>{await new Promise(done=>setTimeout(done,300));});
    expect(api.get).toHaveBeenCalledTimes(3);
  });
  it.each(['seeker','provider'] as const)('%s refreshes a loaded empty result in the background on tab focus', async workspace => {
    saved('one', workspace);
    const emptyReply = { data:{success:true,data:{items:[],pagination:{page:1,limit:6,total:0,totalPages:1}}} };
    vi.mocked(api.get).mockResolvedValueOnce(emptyReply);
    const {result,rerender} = renderHook(({category}) => useNearbyMarketplace(workspace,'one','',category,'all'), {initialProps:{category:'All Categories'}});
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const update = deferred();
    vi.mocked(api.get).mockImplementationOnce(() => update.promise);
    act(() => window.dispatchEvent(new Event('focus')));
    await waitFor(() => expect(result.current.refreshing).toBe(true));
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    await act(async () => update.resolve(emptyReply));
    expect(result.current.refreshing).toBe(false);
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Offline'));
    act(() => window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(result.current.refreshError).not.toBe(''));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    const changed = deferred();
    vi.mocked(api.get).mockImplementationOnce(() => changed.promise);
    rerender({category:'Plumbing'});
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(4));
    expect(result.current.loading).toBe(true);
    expect(result.current.refreshing).toBe(false);
    await act(async () => changed.resolve(emptyReply));
    expect(result.current.loading).toBe(false);
  });
  it('uses the request endpoint and keeps profile data separate from workspace search preferences', async () => {
    saved('one','provider'); vi.mocked(api.get).mockResolvedValue({ data:{ success:true,data:{items:[],pagination:{page:1,limit:6,total:0,totalPages:1}} } });
    const {result}=renderHook(()=>useNearbyMarketplace('provider','one','','All Categories','urgent'));
    await waitFor(()=>expect(api.get).toHaveBeenCalledWith('/requests/nearby',expect.objectContaining({params:expect.objectContaining({filter:'urgent'})})));
    expect(result.current.location).toEqual(location);
    expect(localStorage.getItem('servicehub:marketplace-location:one:seeker')).toBeNull();
    expect(getCachePolicy('/services/nearby')).toBeNull();expect(getCachePolicy('/requests/nearby')).toBeNull();expect(getCachePolicy('/locations/search')).toBeNull();
  });
  it('starts with an explicitly saved area from this account’s other workspace, then keeps preferences independent', async () => {
    localStorage.setItem('servicehub:marketplace-location:one:seeker', JSON.stringify({ point:location.point }));
    vi.mocked(api.get).mockResolvedValue(reply('Nearby on first visit'));
    const { result, unmount } = renderHook(() => useNearbyMarketplace('provider','one','','All Categories','all'));
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.location).toEqual(location);
    act(() => result.current.applyLocation({ ...location, radiusKm:5 }));
    expect(JSON.parse(localStorage.getItem('servicehub:marketplace-location:one:seeker')!).radiusKm).toBeUndefined();
    expect(JSON.parse(localStorage.getItem('servicehub:marketplace-location:one:provider')!).radiusKm).toBe(5);
    unmount();
    const nextAccount = renderHook(() => useNearbyMarketplace('provider','two','','All Categories','all'));
    await waitFor(() => expect(nextAccount.result.current.initializing).toBe(false));
    expect(nextAccount.result.current.location).toBeNull();
  });
  it('hides obsolete results while typing and Apply sends the current search together with the new radius', async () => {
    saved(); vi.mocked(api.get).mockResolvedValue(reply('Initial listing'));
    const {result,rerender} = renderHook(({search}) => useNearbyMarketplace('seeker','one',search,'Aircon Repair','available'), { initialProps:{ search:'' } });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    rerender({ search:'  Aircon   Repair  ' });
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(true);
    act(() => result.current.applyLocation({ ...location, radiusKm:1 }));
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/services/nearby', expect.objectContaining({params:expect.objectContaining({ search:'Aircon Repair', category:'Aircon Repair', radiusKm:1, filter:'available',page:1 })})));
  });
});
