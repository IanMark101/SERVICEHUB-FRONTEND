'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Crosshair } from 'lucide-react';
import type { Map, Marker, Circle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LocationPoint } from '../../lib/location';
import { addReadableMapLayer } from '../../lib/readableMapLayer';
import { mapAreaAnchor, type MarketplaceMapPin, type MarketplaceMapViewport } from '../../lib/marketplace-map';
import styles from './Location.module.css';

type MapProps = {
  point: LocationPoint | null; radiusKm?: number; onChange: (point: LocationPoint) => void; accent?: string;
  candidate?:LocationPoint | null; onCandidateChange?:(point:LocationPoint | null)=>void;
  disabled?:boolean; results?:MarketplaceMapPin[]; onResultSelect?:(id:string)=>void;
  resultPlacement?:'within-radius'|'area'; resultAccent?:string; resultActionLabel?:string;
  onViewportChange?:(viewport:MarketplaceMapViewport)=>void;
};

function mapViewport(instance:Map):MarketplaceMapViewport {
  const bounds=instance.getBounds(),center=instance.getCenter();
  return {center:{latitude:center.lat,longitude:center.wrap().lng},
    bounds:{north:bounds.getNorth(),south:bounds.getSouth(),east:bounds.getEast(),west:bounds.getWest()}};
}

function MapCanvas({ point, candidate, radiusKm, onChange, accent = 'var(--color-brand-text)', disabled=false, results, onResultSelect,
  resultPlacement='within-radius', resultAccent, resultActionLabel='Show in list', onViewportChange }: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const circle = useRef<Circle | null>(null);
  const pendingMarker = useRef<Marker | null>(null);
  const current = useRef({ point, onChange, disabled, onResultSelect, onViewportChange });
  const [failed, setFailed] = useState(false);
  useEffect(() => { current.current = { point, onChange, disabled, onResultSelect, onViewportChange }; }, [point, onChange, disabled, onResultSelect, onViewportChange]);
  useEffect(()=>{if(map.current)onViewportChange?.(mapViewport(map.current));},[onViewportChange]);
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    let observer: ResizeObserver | undefined;
    let ownedMap: Map | null = null;
    let removeWheel: (()=>void) | undefined;
    void import('leaflet').then(L => {
      if (disposed || !container.current) return;
      const initial = current.current.point;
      // Leaflet's delayed zoom completion can outlive a dialog/inline picker.
      // Use synchronous zooms so closing or remounting never targets removed panes.
      const instance = L.map(container.current, { minZoom:1, maxZoom:19, scrollWheelZoom: false, zoomAnimation: false, markerZoomAnimation: false });
      ownedMap = instance;
      instance.setView(initial ? [initial.latitude, initial.longitude] : [10.3, 123.92], 12);
      map.current = instance;
      let popupPanning=false;
      instance.on('autopanstart',()=>{popupPanning=true;});
      const reportViewport = () => {
        // Opening a preview may pan Leaflet to fit it; keep that preview open.
        if (popupPanning) { popupPanning=false;return; }
        current.current.onViewportChange?.(mapViewport(instance));
      };
      instance.on('moveend',reportViewport);
      reportViewport();
      const element=container.current;
      let wheelTimer:ReturnType<typeof setTimeout> | undefined;
      let wheelDelta=0;
      const wheel=(event:WheelEvent)=>{
        if(!event.ctrlKey && !event.metaKey)return;
        event.preventDefault();event.stopPropagation();
        wheelDelta+=event.deltaY * (event.deltaMode===1 ? 20 : event.deltaMode===2 ? element.clientHeight : 1);
        const cursor=instance.mouseEventToContainerPoint(event);
        if(wheelTimer)clearTimeout(wheelTimer);
        wheelTimer=setTimeout(()=>{
          if(disposed)return;
          const step=Math.sign(wheelDelta)*Math.min(3,Math.max(1,Math.round(Math.abs(wheelDelta)/100)));
          wheelDelta=0;
          instance.setZoomAround(cursor,Math.max(instance.getMinZoom(),Math.min(instance.getMaxZoom(),instance.getZoom()-step)),{animate:false});
        },40);
      };
      element.addEventListener('wheel',wheel,{passive:false});
      removeWheel=()=>{element.removeEventListener('wheel',wheel);if(wheelTimer)clearTimeout(wheelTimer);};
      void addReadableMapLayer(instance, controller.signal).catch(() => { if (!disposed) setFailed(true); });
      const choose = (latitude: number, longitude: number) => { if (current.current.disabled) return; current.current.onChange({
        ...current.current.point, latitude, longitude:L.latLng(latitude, longitude).wrap().lng,
        label: 'Selected map location',
      }); };
      const pin = L.marker(initial ? [initial.latitude, initial.longitude] : instance.getCenter(), {
        draggable:!disabled, opacity:initial ? 1 : 0, zIndexOffset:1000,
        title:'Selected location. Drag to move.', alt:'Selected location',
        // The 44×48 hit area contains a 32×40 pin; its tip is at [22,42].
        // Anchor the tip to the coordinate, which is also the circle's center.
        icon:L.divIcon({ className:'', html:`<div class="${styles.pin}" style="--location-accent:${accent}"><svg viewBox="0 0 32 40" aria-hidden="true" focusable="false"><path d="M16 1C7.7 1 1 7.7 1 16c0 10.4 15 22 15 22s15-11.6 15-22C31 7.7 24.3 1 16 1Z" fill="currentColor" stroke="white" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="16" r="5" fill="white"/></svg></div>`, iconSize:[44,48], iconAnchor:[22,42], tooltipAnchor:[0,-38] }),
      }).addTo(instance);
      marker.current = pin;
      instance.on('click', event => choose(event.latlng.lat, event.latlng.lng));
      instance.on('keypress', event => { if (event.originalEvent.key === 'Enter') { const center = instance.getCenter(); choose(center.lat, center.lng); } });
      pin.on('dragend', () => {
        const p = pin.getLatLng();
        const selected = current.current.point;
        if (selected) pin.setLatLng([selected.latitude, selected.longitude]);
        choose(p.lat, p.lng);
      });
      circle.current = L.circle(instance.getCenter(), { radius:0, color:accent, weight:1.5, fillOpacity:.09 }).addTo(instance);
      observer = new ResizeObserver(() => { if (!disposed) instance.invalidateSize({ animate: false }); });
      observer.observe(container.current);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => {
      disposed = true;
      controller.abort();
      removeWheel?.();
      observer?.disconnect();
      ownedMap?.remove();
      if (map.current === ownedMap) { map.current=null; marker.current=null; circle.current=null; }
    };
  }, [accent, disabled]);
  const latitude = point?.latitude;
  const longitude = point?.longitude;
  useEffect(() => {
    // Map initialization is asynchronous; retry once the library resolves below.
    let stopped = false;
    void import('leaflet').then(() => {
      if (stopped || latitude == null || longitude == null || !map.current) return;
      marker.current?.setLatLng([latitude, longitude]).setOpacity(1);
      circle.current?.setLatLng([latitude, longitude]).setRadius((radiusKm || 0) * 1000);
      if (radiusKm && circle.current) map.current.fitBounds(circle.current.getBounds(), { padding:[22,22], maxZoom:15, animate:false });
      else map.current.panTo([latitude, longitude], { animate:false });
    }).catch(() => { /* The initialization effect presents the recoverable map error. */ });
    return () => { stopped=true; };
  }, [latitude, longitude, radiusKm, accent, disabled]);

  useEffect(() => {
    let stopped = false;
    void import('leaflet').then(L => {
      if (stopped || !map.current) return;
      pendingMarker.current?.remove(); pendingMarker.current=null;
      if (!candidate) return;
      const pin = L.marker([candidate.latitude,candidate.longitude], {
        draggable:!disabled, title:'Unconfirmed location. Drag to adjust.', alt:'Unconfirmed location',
        icon:L.divIcon({ className:'', html:`<span class="${styles.pendingPin}" style="--location-accent:${accent}"></span>`,iconSize:[44,44],iconAnchor:[22,22] }),
      }).addTo(map.current);
      pin.on('dragend', () => { const p=pin.getLatLng(); current.current.onChange({ ...candidate,latitude:p.lat,longitude:p.wrap().lng,label:'Selected map location' }); });
      pendingMarker.current=pin;
      if (!map.current.getBounds().contains(pin.getLatLng())) map.current.panTo(pin.getLatLng(),{animate:false});
    }).catch(() => {});
    return () => { stopped=true; pendingMarker.current?.remove(); pendingMarker.current=null; };
  },[candidate,accent,disabled]);

  useEffect(() => {
    let stopped=false;
    let layer:import('leaflet').LayerGroup | undefined;
    void import('leaflet').then(L => {
      if (stopped || !map.current || !results || (resultPlacement==='within-radius' && (!point || !radiusKm))) return;
      layer=L.layerGroup().addTo(map.current);
      const groups=new globalThis.Map<string,MarketplaceMapPin[]>();
      for (const result of results) {
        const key=`${result.area.latitude},${result.area.longitude}`;
        groups.set(key,[...(groups.get(key)||[]),result]);
      }
      for (const group of groups.values()) {
        const position=resultPlacement==='area' ? group[0].area : mapAreaAnchor(group[0].area,{point:point!,radiusKm:radiusKm!});
        const content=document.createElement('div'); content.className=`${styles.mapPopup}${resultPlacement==='area' ? ` ${styles.providerPopup}` : ''}`;
        const heading=document.createElement('strong'); heading.textContent=group.length===1 ? group[0].title : `${group.length} matches in this area`; content.append(heading);
        const note=document.createElement('p'); note.textContent='Approximate area · Exact location stays private'; content.append(note);
        for (const result of group) {
          const row=document.createElement('div');
          if (group.length>1) { const title=document.createElement('span'); title.textContent=result.title; row.append(title); }
          const label=document.createElement('p'); label.textContent=result.label; row.append(label);
          if (result.providerName) { const provider=document.createElement('p'); provider.textContent=result.providerName; row.append(provider); }
          const action=document.createElement('button'); action.type='button'; action.textContent=resultActionLabel; action.className=styles.button;
          action.addEventListener('click',()=>current.current.onResultSelect?.(result.id)); row.append(action); content.append(row);
        }
        L.marker([position.latitude,position.longitude], {
          bubblingMouseEvents:false, title:group.length===1 ? group[0].title : `${group.length} matches in this area`,
          icon:L.divIcon({ className:'', html:`<span class="${styles.resultPin}" data-map-result style="--location-accent:${resultAccent || accent}">${group.length>1 ? group.length : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v11H4zM8 9V5h8v4M9 14h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'}</span>`,iconSize:[44,44],iconAnchor:[22,22] }),
        }).bindPopup(content,{maxWidth:300,minWidth:180}).addTo(layer);
      }
    }).catch(() => {});
    return()=>{stopped=true;layer?.remove();};
  },[results,point,radiusKm,accent,disabled,resultPlacement,resultAccent,resultActionLabel]);
  return <>{failed && <p role="alert" className={styles.error}>The map could not load. Choose a place from the search results instead.</p>}
    <div ref={container} className={styles.map} role="region" aria-label="Location selection map. Use arrow keys to pan and Enter to preview the center, then confirm your location." />
    <span className={styles.mapGestureHint}>Ctrl + scroll to zoom · Pinch on mobile</span>
    <button type="button" className={`${styles.button} ${styles.mapRecenter}`} disabled={!point} onClick={()=>{
      if (!point || !map.current) return;
      if(radiusKm && circle.current) map.current.fitBounds(circle.current.getBounds(),{padding:[22,22],maxZoom:15,animate:false});
      else map.current.setView([point.latitude,point.longitude],15,{animate:false});
    }} aria-label="Back to selected location" title="Back to selected location"><Crosshair size={18} aria-hidden="true"/></button>
  </>;
}

function LocationConfirmation({ point, candidate, onConfirm, onCancel }: { point:LocationPoint|null;candidate:LocationPoint|null;onConfirm:()=>void;onCancel:()=>void }) {
  const confirm=useRef<HTMLButtonElement>(null);
  const finish=(action:()=>void)=>{
    const region=confirm.current?.closest('dialog')?.querySelector<HTMLElement>('[role="region"]')
      || confirm.current?.closest(`.${styles.mapFrame}`)?.querySelector<HTMLElement>('[role="region"]');
    action();region?.focus({preventScroll:true});
  };
  useEffect(()=>{
    if(!candidate)return;
    confirm.current?.focus({preventScroll:true});
    confirm.current?.closest('section')?.scrollIntoView?.({block:'nearest',behavior:'auto'});
  },[candidate]);
  if(!candidate)return null;
  return <section className={styles.mapConfirmation} aria-label="Confirm location" aria-live="polite" onKeyDownCapture={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish(onCancel);}}}>
    <div><strong>{point ? 'Switch to this location?' : 'Use this location?'}</strong>
      <p>{candidate.label==='Selected map location' ? 'Check the new pin before confirming.' : candidate.label}</p>
      <small>{candidate.latitude.toFixed(5)}, {candidate.longitude.toFixed(5)}{point ? ' · Your current location stays selected until you confirm.' : ''}</small>
    </div>
    <div className={styles.confirmActions}><button type="button" className={styles.button} onClick={()=>finish(onCancel)}>{point ? 'Keep current location' : 'Cancel selection'}</button>
      <button ref={confirm} type="button" className={`${styles.button} ${styles.primary}`} onClick={()=>finish(onConfirm)}>{point ? 'Switch location' : 'Use this location'}</button></div>
  </section>;
}

function ExpandedMap({ onClose, trigger, focusAccent, buttonAccent, confirmation, ...props }: MapProps & { onClose:()=>void; trigger:React.RefObject<HTMLButtonElement | null>; focusAccent:string;buttonAccent:string;confirmation:React.ReactNode }) {
  const frame = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = frame.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    const triggerElement = trigger.current;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll:true });
    const keydown = (event:KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Tab') {
        const targets = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]'));
        const first = targets[0], last = targets.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    dialog.addEventListener('keydown', keydown);
    return () => {
      dialog.removeEventListener('keydown', keydown);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (triggerElement?.isConnected) triggerElement.focus({ preventScroll:true });
    };
  }, [onClose, trigger]);
  return createPortal(<dialog ref={frame} className={styles.mapFullscreen} aria-label="Full-screen location map" aria-modal="true"
    style={{ '--form-accent':focusAccent, '--location-button':buttonAccent } as React.CSSProperties}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className={styles.expandedCanvas}><MapCanvas {...props}/></div>
    {confirmation}
    <button ref={closeButton} type="button" className={`${styles.button} ${styles.mapToggle}`} onClick={onClose}>
      <Minimize2 size={18} aria-hidden="true"/>Exit full screen
    </button>
  </dialog>, document.body);
}

export default function LocationMap(props:MapProps) {
  const expandButton = useRef<HTMLButtonElement>(null);
  const [expanded,setExpanded] = useState(false);
  const [focusAccent,setFocusAccent] = useState('');
  const [buttonAccent,setButtonAccent] = useState('');
  const [localCandidate,setLocalCandidate]=useState<LocationPoint|null>(null);
  const candidate=props.candidate===undefined ? localCandidate : props.candidate;
  const propose=(next:LocationPoint|null)=>{
    if(props.disabled)return;
    if(props.onCandidateChange)props.onCandidateChange(next);else setLocalCandidate(next);
  };
  const confirmation=<LocationConfirmation point={props.point} candidate={candidate} onCancel={()=>propose(null)} onConfirm={()=>{
    if(!candidate || props.disabled)return;
    props.onChange(candidate);propose(null);
  }}/>;
  const canvasProps={...props,candidate,onChange:(next:LocationPoint)=>propose(next)};
  const close = useCallback(() => setExpanded(false), []);
  return <div className={styles.mapFrame}>
    <div className={styles.canvasFrame}><MapCanvas {...canvasProps} onViewportChange={expanded ? undefined : props.onViewportChange}/></div>
    {!expanded && confirmation}
    <button ref={expandButton} type="button" className={`${styles.button} ${styles.mapToggle}`}
      onClick={() => {
        if (expandButton.current) {
          const palette=getComputedStyle(expandButton.current);
          setFocusAccent(palette.getPropertyValue('--form-accent'));
          setButtonAccent(palette.getPropertyValue('--location-button') || palette.getPropertyValue('--form-accent') || props.accent || 'var(--color-seeker-primary)');
        }
        setExpanded(true);
      }} aria-label="Expand map to full screen" title="Expand map to full screen">
      <Maximize2 size={18} aria-hidden="true"/>
    </button>
    {expanded && <ExpandedMap {...canvasProps} onResultSelect={id=>{close();props.onResultSelect?.(id);}} confirmation={confirmation} onClose={close} trigger={expandButton} focusAccent={focusAccent} buttonAccent={buttonAccent}/>}
  </div>;
}
