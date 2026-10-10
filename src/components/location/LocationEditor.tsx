'use client';

import { useEffect, useId, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, LocateFixed, Search } from 'lucide-react';
import { api } from '../../lib/api/axios';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { LocationPoint } from '../../lib/location';
import styles from './Location.module.css';

const Map = dynamic(() => import('./LocationMap'), { ssr:false, loading:() => <div className={styles.mapLoading}>Loading map…</div> });
export default function LocationEditor({ value, onChange, radiusKm, accent, disabled = false, label = 'Area name shown to other users' }: {
  value:LocationPoint | null; onChange:(point:LocationPoint) => void; radiusKm?:number; accent?:string; disabled?:boolean; label?:string;
}) {
  const id = useId();
  const [query, setQuery] = useState(value?.label || '');
  const [results, setResults] = useState<LocationPoint[]>([]);
  const [operation, setOperation] = useState<'search' | 'location' | null>(null);
  const [error, setError] = useState('');
  const request = useRef(0);
  const locationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    onChange(point);
  };
  const search = async () => {
    if (query.trim().length < 3 || busy || disabled) return;
    const version = ++request.current;
    setOperation('search'); setError(''); setResults([]);
    try {
      const response = await api.get('/locations/search', { params:{ q:query.trim() }, timeout:12000 });
      if (version !== request.current) return;
      setResults(response.data.data || []);
      if (!response.data.data?.length) setError('No matching places. Try a city or barangay name, or choose a pin on the map.');
    } catch (e) { if (version === request.current) setError(getApiErrorMessage(e, 'Location search is unavailable. Select a pin on the map instead.')); }
    finally { if (version === request.current) setOperation(null); }
  };
  useEffect(() => () => {
    request.current++;
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
      if (point) { setQuery(point.label); onChange(point); }
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
      <label><span className={styles.label}>Search city or barangay</span><input className={styles.field} value={query} maxLength={80} placeholder="e.g. Lapu-Lapu City, Cebu" disabled={disabled || busy}
        onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); void search(); } }} aria-describedby={`${id}-hint`} /></label>
      <button type="button" className={styles.button} disabled={disabled || busy || query.trim().length<3} onClick={() => void search()}><Search size={16}/>{operation === 'search' ? 'Searching…' : 'Search'}</button>
    </div>
    <p id={`${id}-hint`} className={styles.hint}>Search general areas only. Keep house numbers and private addresses out of place search. Search uses OpenStreetMap.</p>
    {results.length>0 && <div className={styles.results} aria-label="Matching places">{results.map((p,i) => <button type="button" className={styles.result} key={`${p.latitude}-${p.longitude}-${i}`} onClick={() => selectPoint(p)}><MapPin size={16}/>{p.label}</button>)}</div>}
    <button type="button" className={styles.button} onClick={locate} disabled={disabled || busy} aria-describedby={error ? `${id}-error` : undefined}><LocateFixed size={16}/>{operation === 'location' ? 'Locating your device…' : 'Use my device location'}</button>
    {operation === 'location' && <div className={styles.selected}><p role="status" className={styles.hint}>Allow location in your browser. You can cancel and retry after turning on device location.</p><button type="button" className={styles.button} onClick={cancelRequest}>Cancel location request</button></div>}
    {error && <p id={`${id}-error`} role="alert" className={styles.error}>{error}</p>}
    <p className={styles.hint}>Select a place, click the map, or drag the pin. Distance is measured in a straight line, so travel routes may be longer.</p>
    <Map point={value} radiusKm={radiusKm} onChange={selectPoint} accent={accent}/>
    {value && <label><span className={styles.label}>{label}</span><input className={styles.field} value={value.label} maxLength={160} disabled={disabled} onChange={e => onChange({ ...value, label:e.target.value })}/></label>}
  </div>;
}
