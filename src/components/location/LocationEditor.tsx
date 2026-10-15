'use client';

import { useEffect, useId, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, LocateFixed, Search } from 'lucide-react';
import { api } from '../../lib/api/axios';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { LocationPoint } from '../../lib/location';
import type { MarketplaceMapPin, MarketplaceMapViewport } from '../../lib/marketplace-map';
import styles from './Location.module.css';

const Map = dynamic(() => import('./LocationMap'), { ssr:false, loading:() => <div className={styles.mapLoading}>Loading map…</div> });
export default function LocationEditor({ value, onChange, radiusKm, accent, disabled = false, label = 'City or barangay shown to other users', onPendingChange,
  mapResults, mapResultAccent = '#047857', onResultSelect, onViewportChange, selectionMode = 'pin', compact = false, onSelected }: {
  value:LocationPoint | null; onChange:(point:LocationPoint) => void; radiusKm?:number; accent?:string; disabled?:boolean; label?:string;
  onPendingChange?:(pending:boolean)=>void;
  mapResults?:MarketplaceMapPin[]; mapResultAccent?:string; onResultSelect?:(id:string)=>void; onViewportChange?:(viewport:MarketplaceMapViewport)=>void;
  selectionMode?:'area'|'pin';
  compact?:boolean;
  onSelected?:()=>void;
}) {
  const id = useId();
  const [query, setQuery] = useState(value?.label || '');
  const [results, setResults] = useState<LocationPoint[]>([]);
  const [operation, setOperation] = useState<'search' | 'location' | null>(null);
  const [error, setError] = useState('');
  const [candidate,setCandidate]=useState<LocationPoint|null>(null);
  const [showAreaMap, setShowAreaMap] = useState(false);
  const areaOnly = selectionMode === 'area';
  const request = useRef(0);
  const locationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookup = useRef<{ key:string; point:LocationPoint; mode:'preview'|'confirmed'; controller:AbortController } | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'loading'|'manual'|null>(null);
  const [manualLabel, setManualLabel] = useState(false);
  const changeRef = useRef(onChange);
  const selectedRef = useRef(value);
  useEffect(() => { changeRef.current = onChange; }, [onChange]);
  useEffect(() => { selectedRef.current = value; }, [value]);
  const pointKey = (point:LocationPoint) => `${point.latitude},${point.longitude}`;
  const cancelLookup = () => { lookup.current?.controller.abort(); lookup.current=null; setLookupStatus(null); };
  const lookupLabel = (point:LocationPoint, mode:'preview'|'confirmed') => {
    const key = pointKey(point);
    if (lookup.current?.key === key) { lookup.current.mode = mode; return; }
    cancelLookup();
    if (!['Selected map location', 'My device location', 'Chosen map pin'].includes(point.label)) return;
    const controller = new AbortController();
    const target = { key, point, mode, controller };
    lookup.current=target; setLookupStatus('loading');
    void api.get('/locations/reverse', { params:{ latitude:point.latitude, longitude:point.longitude }, signal:controller.signal, timeout:10000, apiCache:'no-store' }).then(response => {
      if (lookup.current !== target || controller.signal.aborted) return;
      const label = response.data?.data?.label;
      if (!response.data?.success || typeof label !== 'string' || label.trim().length < 2) { setLookupStatus('manual'); setManualLabel(true); lookup.current=null; return; }
      const named = { ...target.point, label:label.trim().slice(0,160) };
      if (target.mode === 'preview') setCandidate(current => current && pointKey(current) === key ? named : current);
      else {
        // Preserve private directions typed while this lookup was pending.
        const selected=selectedRef.current;
        if (selected && pointKey(selected)===key && selected.label===target.point.label) {
          const confirmed={...selected,label:named.label};
          setQuery(confirmed.label); changeRef.current(confirmed);
          onSelected?.();
        }
      }
      setLookupStatus(null); lookup.current=null;
    }).catch(() => { if (lookup.current===target && !controller.signal.aborted) { setLookupStatus('manual'); setManualLabel(true); lookup.current=null; } });
  };
  const busy = operation !== null;
  const cancelRequest = () => {
    request.current++;
    if (locationTimer.current !== null) clearTimeout(locationTimer.current);
    locationTimer.current = null;
    setOperation(null);
  };
  const selectPoint = (point:LocationPoint) => {
    if (disabled) return;
    cancelRequest();
    setError(''); setResults([]); setQuery(point.label);
    selectedRef.current=point;
    onChange(point);
    lookupLabel(point, 'confirmed');
    if (!['Selected map location', 'My device location', 'Chosen map pin'].includes(point.label)) { setManualLabel(false); onSelected?.(); }
  };
  const proposePoint=(point:LocationPoint|null)=>{
    if(disabled)return;
    cancelRequest();setError('');setResults([]);
    setCandidate(point);onPendingChange?.(Boolean(point));
    if (point) lookupLabel(point, 'preview');
    else if (lookup.current?.mode !== 'confirmed') cancelLookup();
  };
  const search = async () => {
    if (query.trim().length < 3 || busy || disabled) return;
    cancelLookup();
    const version = ++request.current;
    setOperation('search'); setError(''); setResults([]);
    try {
      const response = await api.get('/locations/search', { params:{ q:query.trim() }, timeout:12000 });
      if (version !== request.current) return;
      setResults(response.data.data || []);
      if (!response.data.data?.length) setError('No places found. Try another city or barangay name, or choose a place on the map.');
    } catch (e) { if (version === request.current) setError(getApiErrorMessage(e, 'We could not search for places. Try again, or choose a place on the map.')); }
    finally { if (version === request.current) setOperation(null); }
  };
  useEffect(() => () => {
    request.current++;
    lookup.current?.controller.abort(); lookup.current=null;
    if (locationTimer.current !== null) clearTimeout(locationTimer.current);
  }, []);
  const locate = () => {
    if (disabled || busy) return;
    if (!navigator.geolocation) { setError('Your browser does not support device location. Search a place or choose a pin.'); return; }
    const version = ++request.current;
    setOperation('location'); setError(''); setResults([]);
    const finish = (message:string, point?:LocationPoint) => {
      if (version !== request.current) return;
      // getCurrentPosition cannot be canceled; ignore callbacks from old attempts.
      request.current++;
      if (locationTimer.current !== null) clearTimeout(locationTimer.current);
      locationTimer.current = null;
      setOperation(null);
      setError(message);
      if (point) proposePoint(point);
    };
    const timedOut = 'Device location timed out. Check that device location and browser location permission are on, then try again. You can also search a place or select a pin.';
    // Browser timeouts can exclude time waiting for permission or an enabled
    // location service. Always release our loading state independently.
    locationTimer.current = setTimeout(() => finish(timedOut), 12000);
    try {
      navigator.geolocation.getCurrentPosition(position => {
        finish('', { latitude:position.coords.latitude, longitude:position.coords.longitude, label:'My device location' });
      }, failure => {
        finish(failure.code === 1
          ? 'Location permission is blocked. Allow location for this site in your browser and turn on device location, then try again. Search a place or select a pin instead if needed.'
          : failure.code === 3 ? timedOut
          : 'Your device could not find its location. Turn on device location and try again. You can also search a place or select a pin.');
      }, { timeout:10000, maximumAge:0, enableHighAccuracy:false });
    } catch {
      finish('Device location could not start. Check this site’s location permission and try again, or search a place or select a pin.');
    }
  };
  return <div className={styles.editor}>
    <div className={styles.search}>
      <label><span className={styles.label}>Find a city or barangay</span><input className={styles.field} value={query} maxLength={80} placeholder="e.g. Cordova, Cebu" disabled={disabled || busy}
        onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); void search(); } }} aria-describedby={`${id}-hint`} /></label>
      <button type="button" className={styles.button} disabled={disabled || busy || query.trim().length<3} onClick={() => void search()}><Search size={16}/>{operation === 'search' ? 'Searching…' : 'Search'}</button>
    </div>
    <p id={`${id}-hint`} className={styles.hint}>Enter only a city or barangay here. Keep house numbers and private addresses out of this search.</p>
    {results.length>0 && <div className={styles.results} aria-label="Matching places">{results.map((p,i) => <button type="button" disabled={disabled} className={styles.result} key={`${p.latitude}-${p.longitude}-${i}`} onClick={() => areaOnly ? selectPoint({ latitude:p.latitude, longitude:p.longitude, label:p.label }) : proposePoint(p)}><MapPin size={16}/>{p.label}</button>)}</div>}
    {areaOnly && <p className={styles.hint}>Select a search result, or choose a point on the map.</p>}
    {areaOnly && <button type="button" className={styles.button} aria-expanded={showAreaMap} onClick={() => setShowAreaMap(!showAreaMap)}>{showAreaMap ? 'Hide area map' : 'Use map instead'}</button>}
    {(!areaOnly || showAreaMap) && <button type="button" className={styles.button} onClick={locate} disabled={disabled || busy} aria-describedby={error ? `${id}-error` : undefined}><LocateFixed size={16}/>{operation === 'location' ? 'Locating your device…' : 'Use my device location'}</button>}
    {operation === 'location' && <div className={styles.selected}><p role="status" className={styles.hint}>Allow location in your browser. You can cancel and retry after turning on device location.</p><button type="button" className={styles.button} onClick={cancelRequest}>Cancel location request</button></div>}
    {error && <p id={`${id}-error`} role="alert" className={styles.error}>{error}</p>}
    {(!areaOnly || showAreaMap) && <><p className={styles.hint}>{areaOnly ? 'Choose a point in your city or barangay, then confirm. No exact address is needed.' : 'Click the map or move the pin to the job location or workplace, then confirm.'}</p>
      <Map point={value} candidate={candidate} onCandidateChange={proposePoint} radiusKm={radiusKm} onChange={selectPoint} accent={accent} disabled={disabled}
        results={mapResults} resultPlacement="area" resultAccent={mapResultAccent} resultActionLabel="View listing" onResultSelect={onResultSelect} onViewportChange={onViewportChange}/></>}
    {(candidate || value) && (!compact || manualLabel) && <label><span className={styles.label}>{compact ? 'City or barangay for the selected point' : label}</span><input className={styles.field} value={candidate?.label ?? value?.label ?? ''} maxLength={160} disabled={disabled || Boolean(candidate)} onChange={e => { cancelLookup(); if(value) onChange({ ...value, label:e.target.value }); }}/></label>}
    {compact && manualLabel && value && !candidate && <button type="button" className={styles.button} disabled={disabled || value.label.trim().length < 2} onClick={() => { setManualLabel(false); onSelected?.(); }}>Save place name</button>}
    {lookupStatus && <p className={styles.hint} role="status">{lookupStatus === 'loading' ? 'Finding the city or barangay for this pin…' : 'We could not find a place name here. Enter the city or barangay yourself; your selected pin stays in place.'}</p>}
  </div>;
}
