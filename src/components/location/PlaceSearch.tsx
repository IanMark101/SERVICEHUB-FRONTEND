'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { api } from '../../lib/api/axios';
import type { LocationPoint } from '../../lib/location';
import styles from './Location.module.css';

export default function PlaceSearch({ query, onQueryChange, onSelect, disabled = false, near }: {
  query: string; onQueryChange: (query: string) => void; onSelect: (point: LocationPoint) => void;
  disabled?: boolean; near?: LocationPoint | null;
}) {
  const id = useId();
  const [mode, setMode] = useState<'suggest' | 'search' | null>(null);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ places: [] as LocationPoint[], loading: false, error: '' });
  const [active, setActive] = useState(-1);
  const request = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const options = useRef<Array<HTMLButtonElement | null>>([]);
  const cache = useRef(new Map<string, { expires: number; places: LocationPoint[] }>());
  const latitude = near?.latitude, longitude = near?.longitude;
  const visible = mode !== null && !disabled && query.trim().length >= 3;
  const cancel = () => { request.current++; controller.current?.abort(); };
  const close = () => { cancel(); setMode(null); setActive(-1); setState(current => ({ ...current, loading: false })); };

  useEffect(() => {
    if (!mode || disabled || query.trim().length < 3) return;
    const abort = new AbortController(); controller.current = abort;
    const version = ++request.current;
    const term = query.trim();
    const explicit = mode === 'search';
    const params = explicit ? { q: term } : { q: term, ...(latitude !== undefined && longitude !== undefined ? { latitude, longitude } : {}) };
    const key = `${mode}:${term.toLowerCase()}:${explicit ? '' : `${latitude?.toFixed(2) ?? ''},${longitude?.toFixed(2) ?? ''}`}`;
    const timer = setTimeout(async () => {
      if (abort.signal.aborted || version !== request.current) return;
      setState({ places: [], loading: true, error: '' }); setActive(-1);
      try {
        const cached = cache.current.get(key);
        let places: LocationPoint[];
        if (cached && cached.expires > Date.now()) places = cached.places;
        else {
          const response = await api.get(explicit ? '/locations/search' : '/locations/suggest', { params, signal: abort.signal, timeout: 10000, apiCache: 'no-store' });
          places = Array.isArray(response.data?.data) ? response.data.data.slice(0, 5).flatMap((point: LocationPoint) => {
            if (!point || typeof point.label !== 'string' || typeof point.latitude !== 'number' || typeof point.longitude !== 'number' || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude) || Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180) return [];
            return [{ latitude: point.latitude, longitude: point.longitude, label: point.label.slice(0, 160) }];
          }) : [];
          if (!abort.signal.aborted && version === request.current) {
            if (cache.current.size >= 100) cache.current.delete(cache.current.keys().next().value!);
            cache.current.set(key, { expires: Date.now() + 600000, places });
          }
        }
        if (!abort.signal.aborted && version === request.current) setState({ places, loading: false, error: '' });
      } catch {
        if (!abort.signal.aborted && version === request.current) setState({ places: [], loading: false, error: explicit ? 'Place search is unavailable. Try again shortly.' : 'Suggestions are unavailable. Use Search to try again.' });
      }
    }, explicit ? 0 : 350);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [query, mode, revision, disabled, latitude, longitude, cache]);

  const select = (place: LocationPoint) => { close(); setState({ places: [], loading: false, error: '' }); onQueryChange(place.label); onSelect(place); };
  const move = (index: number) => { setActive(index); options.current[index]?.scrollIntoView?.({ block: 'nearest' }); };
  const search = () => {
    if (disabled || query.trim().length < 3 || (state.loading && mode === 'search')) return;
    cancel(); setState({ places: [], loading: true, error: '' }); setMode('search'); setRevision(value => value + 1);
  };

  return <div className={styles.placeSearch} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}>
    <div className={styles.search}>
      <label><span className={styles.label}>City or barangay</span><input className={styles.field} role="combobox" aria-autocomplete="list" aria-expanded={visible && state.places.length > 0} aria-controls={visible && state.places.length > 0 ? `${id}-results` : undefined} aria-activedescendant={visible && active >= 0 ? `${id}-place-${active}` : undefined} aria-describedby={`${id}-hint`} autoComplete="off" value={query} maxLength={80} placeholder="e.g. Cordova, Cebu" disabled={disabled}
        onChange={event => { cancel(); onQueryChange(event.target.value); setMode('suggest'); setActive(-1); setState({ places: [], loading: true, error: '' }); }}
        onKeyDownCapture={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Escape' && mode) { event.preventDefault(); event.stopPropagation(); close(); }
          else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (visible && state.places.length) { event.preventDefault(); move(event.key === 'ArrowDown' ? (active + 1) % state.places.length : (active < 0 ? state.places.length - 1 : (active - 1 + state.places.length) % state.places.length)); }
            else if (query.trim().length >= 3) { event.preventDefault(); setMode('suggest'); setRevision(value => value + 1); }
          } else if (event.key === 'Enter') { event.preventDefault(); if (visible && active >= 0 && state.places[active]) select(state.places[active]); else if (query.trim().length >= 3) search(); }
        }}/></label>
      <button type="button" className={styles.button} disabled={disabled || query.trim().length < 3} aria-disabled={state.loading && mode === 'search'} onClick={search}><Search size={16} aria-hidden="true"/>{state.loading && mode === 'search' ? 'Searching…' : 'Search'}</button>
    </div>
    <p id={`${id}-hint`} className={styles.hint}>City or barangay only. No private addresses.</p>
    {visible && <>
      <p className={styles.suggestionStatus} role="status">{state.loading ? 'Finding places…' : state.error || (state.places.length ? `${state.places.length} matching place${state.places.length === 1 ? '' : 's'}` : 'No matching places. Try another name.')}</p>
      {state.places.length > 0 && <>
        <div id={`${id}-results`} className={`${styles.results} ${styles.suggestions}`} role="listbox" aria-label="Matching places">{state.places.map((place, index) => {
          const match = place.label.toLowerCase().indexOf(query.trim().toLowerCase());
          return <button ref={element => { options.current[index] = element; }} id={`${id}-place-${index}`} type="button" role="option" aria-label={place.label} aria-selected={active === index} tabIndex={-1} className={styles.result} key={`${place.latitude}-${place.longitude}-${index}`} onMouseDown={event => event.preventDefault()} onClick={() => select(place)}><MapPin size={18} aria-hidden="true"/><span>{match < 0 ? place.label : <>{place.label.slice(0, match)}<mark>{place.label.slice(match, match + query.trim().length)}</mark>{place.label.slice(match + query.trim().length)}</>}</span></button>;
        })}</div>
        <small className={styles.placeAttribution}>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>{mode === 'suggest' && ' · Photon'}</small>
      </>}
    </>}
  </div>;
}
