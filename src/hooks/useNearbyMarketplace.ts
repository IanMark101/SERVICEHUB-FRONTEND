'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api/axios';
import { getApiErrorMessage } from '../lib/api/errors';
import { useApiCacheRefresh } from './useApiCacheRefresh';
import { mapServiceToListing, mapRequestToJobRequest } from '../context/mappers';
import { parseMarketplaceLocation, type MarketplaceLocation } from '../lib/location';
import type { ServiceListing, JobRequest } from '../types';

type Pagination = { page:number; limit:number; total:number; totalPages:number };
type Result = { key:string; items:Array<ServiceListing|JobRequest>; pagination:Pagination; error:string; loading:boolean; resolved:boolean };
const empty = { page:1, limit:6, total:0, totalPages:1 };
export default function useNearbyMarketplace(workspace:'seeker'|'provider', userId:string | undefined, search:string, category:string, filter:string) {
  const storageKey = `servicehub:marketplace-location:${userId || 'guest'}:${workspace}`;
  const fallbackKey = `servicehub:marketplace-location:${userId || 'guest'}:${workspace === 'seeker' ? 'provider' : 'seeker'}`;
  const normalizedSearch = search.trim().replace(/\s+/g, ' ');
  const [saved,setSaved] = useState<{ owner:string; location:MarketplaceLocation|null }>({ owner:'', location:null });
  const location = saved.owner===storageKey ? saved.location : null;
  const [debouncedSearch,setDebouncedSearch]=useState(normalizedSearch);
  const [pageState,setPageState]=useState({ criteria:'', page:1 });
  const [revision,setRevision]=useState(0);
  const [result,setResult]=useState<Result>({ key:'',items:[],pagination:empty,error:'',loading:false,resolved:false });
  useEffect(() => {
    let active = true;
    let value:MarketplaceLocation|null=null;
    // Reuse an area this account deliberately chose in its other workspace only
    // on first use. Once saved here, the two workspace preferences stay separate.
    if (userId) {
      for (const key of [storageKey, fallbackKey]) {
        try { const raw=localStorage.getItem(key); if(raw)value=parseMarketplaceLocation(JSON.parse(raw)); } catch { /* Ignore an unusable preference. */ }
        if (value) break;
      }
      if (value) {
        try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* Browsing still works without persistence. */ }
      }
    }
    queueMicrotask(() => { if (active) setSaved(current => current.owner === storageKey ? current : { owner:storageKey,location:value }); });
    return () => { active = false; };
  },[storageKey,fallbackKey,userId]);
  useEffect(() => { const timer=window.setTimeout(()=>setDebouncedSearch(normalizedSearch),250);return()=>window.clearTimeout(timer); },[normalizedSearch]);
  const searchPending = normalizedSearch !== debouncedSearch;
  const initializing = Boolean(userId && saved.owner !== storageKey);
  const submitSearch = useCallback(() => setDebouncedSearch(normalizedSearch), [normalizedSearch]);
  const criteria=JSON.stringify({ workspace,userId,location,search:debouncedSearch,category,filter });
  const page=pageState.criteria===criteria ? pageState.page : 1;
  const params=useMemo(()=>location ? { latitude:location.point.latitude,longitude:location.point.longitude,radiusKm:location.radiusKm,page,limit:6,search:debouncedSearch,category,filter } : null,[location,page,debouncedSearch,category,filter]);
  const key=JSON.stringify({ storageKey,params });
  const refresh=useCallback(()=>{
    setRevision(value=>value+1);
  },[]);
  useApiCacheRefresh([workspace === 'seeker' ? 'services' : 'requests'], refresh, Boolean(location && userId));
  useEffect(()=>{
    if(!params || !userId || searchPending)return;
    const controller=new AbortController();let active=true;
    // An empty successful response is loaded data too. Revalidation should
    // preserve that state, not replace it with first-load skeletons on focus.
    queueMicrotask(()=>{if(active)setResult(current=>({ key,items:current.key===key ? current.items : [],pagination:current.key===key ? current.pagination : empty,resolved:current.key===key && current.resolved,error:'',loading:true }));});
    void api.get(workspace==='seeker' ? '/services/nearby' : '/requests/nearby',{ params,signal:controller.signal,timeout:15000,apiCache:'no-store' }).then(response=>{
      if(!active)return;
      const data=response.data.data;
      if(!response.data.success || !Array.isArray(data?.items))throw new Error('Nearby results could not be loaded.');
      const items=workspace==='seeker' ? data.items.map(mapServiceToListing) : data.items.map(mapRequestToJobRequest);
      setResult({ key,items,pagination:data.pagination,error:'',loading:false,resolved:true });
    }).catch(error=>{if(active)setResult(current=>({key,items:current.key===key ? current.items : [],pagination:current.key===key ? current.pagination : empty,resolved:current.key===key && current.resolved,error:getApiErrorMessage(error,'Nearby results could not load. Try again.'),loading:false}));});
    return()=>{active=false;controller.abort();};
  },[key,params,userId,workspace,revision,searchPending]);
  useEffect(()=>{
    const onFocus=()=>{if(document.visibilityState==='visible')refresh();};
    window.addEventListener('focus',onFocus);
    window.addEventListener('online',onFocus);
    return()=>{window.removeEventListener('focus',onFocus);window.removeEventListener('online',onFocus);};
  },[refresh]);
  const applyLocation=useCallback((value:MarketplaceLocation)=>{
    const parsed=parseMarketplaceLocation(value);if(!parsed)return;
    try{localStorage.setItem(storageKey,JSON.stringify(parsed));}catch{/* Continue without persistence. */}
    setSaved({owner:storageKey,location:parsed});
    setDebouncedSearch(normalizedSearch);
  },[storageKey,normalizedSearch]);
  const current=!searchPending && result.key===key;
  const pagination=current ? result.pagination : empty;
  const goToPage=(next:number)=>setPageState({criteria,page:Math.max(1,Math.min(next,pagination.totalPages))});
  return {
    location,applyLocation,refresh,submitSearch,initializing,items:current ? result.items : [],
    error:current && !result.resolved ? result.error : '',
    refreshError:current && result.resolved ? result.error : '',
    loading:initializing || (!!location && (!current || (!result.resolved && result.loading))),
    refreshing:current && result.resolved && result.loading,
    totalItems:pagination.total,currentPage:pagination.page,totalPages:pagination.totalPages,
    startIndex:(pagination.page-1)*pagination.limit,endIndex:Math.min(pagination.page*pagination.limit,pagination.total),
    goToPage,nextPage:()=>goToPage(page+1),prevPage:()=>goToPage(page-1),
  };
}
