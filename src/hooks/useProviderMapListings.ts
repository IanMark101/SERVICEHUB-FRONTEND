'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api/axios';
import { getApiErrorMessage } from '../lib/api/errors';
import { parseMapPins, providerMapQueries, providerMapRefreshCenters, type MarketplaceMapPin, type MarketplaceMapViewport } from '../lib/marketplace-map';
import { useApiCacheRefresh } from './useApiCacheRefresh';

export type ProviderMapFilters = { search:string; category:string; filter:string };
type MapResult = { key:string; criteriaKey:string; pins:MarketplaceMapPin[]; loading:boolean; error:string; resolved:boolean; validatedRevision:number };
const emptyPins:MarketplaceMapPin[] = [];

function mergePins(previous:MarketplaceMapPin[], loaded:MarketplaceMapPin[], replace=false) {
  const known = new Map(previous.map(pin => [pin.id,pin]));
  const pins = replace ? new Map<string,MarketplaceMapPin>() : new Map(known);
  for (const pin of loaded) pins.set(pin.id,{ ...known.get(pin.id),...pin });
  const next = [...pins.values()];
  // Unchanged data keeps the same Leaflet marker layer and any open preview.
  return JSON.stringify(previous)===JSON.stringify(next) ? previous : next;
}

/** Public area markers for the location dialog only; never changes the marketplace feed. */
export default function useProviderMapListings(viewport:MarketplaceMapViewport | null, filters?:ProviderMapFilters, initialPins:MarketplaceMapPin[] = emptyPins) {
  const queries = useMemo(() => viewport ? providerMapQueries(viewport) : { centers:[],limited:false },[viewport]);
  const criteriaKey = JSON.stringify(filters ?? null);
  const queryKey = JSON.stringify({ centers:queries.centers,filters });
  const query = useMemo(() => JSON.parse(queryKey) as { centers:Array<{latitude:number;longitude:number}>;filters?:ProviderMapFilters },[queryKey]);
  const [revision,setRevision] = useState(0);
  const [result,setResult] = useState<MapResult>({ key:'',criteriaKey,pins:initialPins,loading:false,error:'',resolved:false,validatedRevision:0 });
  const latestResult = useRef(result);
  useEffect(() => { latestResult.current=result; },[result]);
  const retry = useCallback(() => setRevision(value => value + 1),[]);
  const enabled = Boolean(filters);
  useApiCacheRefresh(['services'],retry,enabled);
  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => { if (document.visibilityState==='visible') retry(); };
    window.addEventListener('focus',onFocus);
    window.addEventListener('online',onFocus);
    return () => { window.removeEventListener('focus',onFocus);window.removeEventListener('online',onFocus); };
  },[enabled,retry]);
  useEffect(() => {
    const { centers,filters:criteria } = query;
    if (!criteria || !centers.length) return;
    const controller = new AbortController();
    let active = true;
    const known = latestResult.current;
    const revalidate = revision > known.validatedRevision;
    const loadCenters = revalidate ? providerMapRefreshCenters(centers,known.criteriaKey===criteriaKey ? known.pins : emptyPins) : centers;
    // Batch move/zoom/resize notifications and cancel requests for the old viewport.
    const timer = window.setTimeout(() => {
      setResult(current => ({ ...current,key:queryKey,criteriaKey,pins:current.criteriaKey===criteriaKey ? current.pins : emptyPins,loading:true,error:'',resolved:false }));
      const load = async () => {
        const pins = new Map<string,MarketplaceMapPin>();
        // Bound concurrency so a wider viewport cannot flood the existing API.
        for (let offset=0;offset<loadCenters.length;offset+=4) {
          const responses = await Promise.all(loadCenters.slice(offset,offset+4).map(center => api.get('/services/nearby',{
            params:{ ...center,radiusKm:30,page:1,limit:6,search:criteria.search.trim().replace(/\s+/g,' '),category:criteria.category,filter:criteria.filter },
            signal:controller.signal,timeout:15000,apiCache:'no-store',
          })));
          if (!active) return;
          for (const response of responses) {
            const data = response.data.data;
            if (!response.data.success || !Array.isArray(data?.mapPins)) throw new Error('Provider map listings could not load.');
            for (const pin of parseMapPins(data.mapPins)) {
              const item = data.items?.find((service:{ id:string }) => service.id===pin.id);
              pins.set(pin.id,{ ...pin,...(typeof item?.provider?.name==='string' ? { providerName:item.provider.name } : {}) });
            }
          }
          // Publish each completed batch. Wide maps should not wait for every
          // discovery window before showing their first available markers.
          if (active && !revalidate) setResult(current => ({ ...current, key:queryKey, criteriaKey,
            pins:mergePins(current.criteriaKey===criteriaKey ? current.pins : emptyPins,[...pins.values()]) }));
        }
        // Zoom discovers more areas; live refreshes authoritatively replace them
        // so disabled/deleted listings cannot linger outside the current viewport.
        if (active) setResult(current => ({ key:queryKey,criteriaKey,
          pins:mergePins(current.criteriaKey===criteriaKey ? current.pins : emptyPins,[...pins.values()],revalidate),
          loading:false,error:'',resolved:true,validatedRevision:revision }));
      };
      void load().catch(error => {
        if (active) setResult(current => ({ ...current,key:queryKey,criteriaKey,pins:current.criteriaKey===criteriaKey ? current.pins : emptyPins,
          loading:false,error:getApiErrorMessage(error,'Provider map listings could not load. Try again.'),resolved:false }));
      });
    },known.key ? 250 : 0);
    return () => { active=false;window.clearTimeout(timer);controller.abort(); };
  },[queryKey,query,criteriaKey,revision]);
  const current = result.key===queryKey;
  return { pins:filters && result.criteriaKey===criteriaKey ? result.pins : emptyPins,error:current ? result.error : '',retry,limited:queries.limited,
    loading:Boolean(filters && queries.centers.length && (!current || result.loading)),resolved:current && result.resolved };
}
