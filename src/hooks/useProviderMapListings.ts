'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api/axios';
import { getApiErrorMessage } from '../lib/api/errors';
import { parseMapPins, providerMapQueries, type MarketplaceMapPin, type MarketplaceMapViewport } from '../lib/marketplace-map';

export type ProviderMapFilters = { search:string; category:string; filter:string };
type MapResult = { key:string; pins:MarketplaceMapPin[]; loading:boolean; error:string; resolved:boolean };

/** Public area markers for the location dialog only; never changes the marketplace feed. */
export default function useProviderMapListings(viewport:MarketplaceMapViewport | null, filters?:ProviderMapFilters) {
  const queries = useMemo(() => viewport ? providerMapQueries(viewport) : { centers:[],limited:false },[viewport]);
  const queryKey = JSON.stringify({ centers:queries.centers,filters });
  const query = useMemo(() => JSON.parse(queryKey) as { centers:Array<{latitude:number;longitude:number}>;filters?:ProviderMapFilters },[queryKey]);
  const [revision,setRevision] = useState(0);
  const [result,setResult] = useState<MapResult>({ key:'',pins:[],loading:false,error:'',resolved:false });
  const retry = useCallback(() => setRevision(value => value + 1),[]);
  useEffect(() => {
    const { centers,filters:criteria } = query;
    if (!criteria || !centers.length) return;
    const controller = new AbortController();
    let active = true;
    // Batch move/zoom/resize notifications and cancel requests for the old viewport.
    const timer = window.setTimeout(() => {
      setResult(current => ({ key:queryKey,pins:current.key===queryKey ? current.pins : [],loading:true,error:'',resolved:false }));
      const load = async () => {
        const pins = new Map<string,MarketplaceMapPin>();
        // Bound concurrency so a wider viewport cannot flood the existing API.
        for (let offset=0;offset<centers.length;offset+=4) {
          const responses = await Promise.all(centers.slice(offset,offset+4).map(center => api.get('/services/nearby',{
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
        }
        if (active) setResult({ key:queryKey,pins:[...pins.values()],loading:false,error:'',resolved:true });
      };
      void load().catch(error => {
        if (active) setResult({ key:queryKey,pins:[],loading:false,error:getApiErrorMessage(error,'Provider map listings could not load. Try again.'),resolved:false });
      });
    },250);
    return () => { active=false;window.clearTimeout(timer);controller.abort(); };
  },[queryKey,query,revision]);
  const current = result.key===queryKey;
  return { pins:current ? result.pins : [],error:current ? result.error : '',retry,limited:queries.limited,
    loading:Boolean(filters && queries.centers.length && (!current || result.loading)),resolved:current && result.resolved };
}
