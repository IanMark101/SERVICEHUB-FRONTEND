'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { Map, Marker, Circle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationPoint } from '../../lib/location';
import styles from './Location.module.css';

type MapProps = {
  point: LocationPoint | null; radiusKm?: number; onChange: (point: LocationPoint) => void; accent?: string;
};

function MapCanvas({ point, radiusKm, onChange, accent = 'var(--color-brand-text)' }: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const circle = useRef<Circle | null>(null);
  const current = useRef({ point, onChange });
  const [failed, setFailed] = useState(false);
  useEffect(() => { current.current = { point, onChange }; }, [point, onChange]);
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let ownedMap: Map | null = null;
    void import('leaflet').then(L => {
      if (disposed || !container.current) return;
      const initial = current.current.point;
      // Leaflet's delayed zoom completion can outlive a dialog/inline picker.
      // Use synchronous zooms so closing or remounting never targets removed panes.
      const instance = L.map(container.current, { scrollWheelZoom: false, zoomAnimation: false, markerZoomAnimation: false });
      ownedMap = instance;
      instance.setView(initial ? [initial.latitude, initial.longitude] : [10.3, 123.92], 12);
      map.current = instance;
      L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom:19,
      }).addTo(instance);
      const choose = (latitude: number, longitude: number) => current.current.onChange({
        ...current.current.point, latitude, longitude:L.latLng(latitude, longitude).wrap().lng,
        label: current.current.point?.label || 'Selected service area',
      });
      const pin = L.marker(initial ? [initial.latitude, initial.longitude] : instance.getCenter(), {
        draggable:true, opacity:initial ? 1 : 0,
        title:'Selected location. Drag to move.', alt:'Selected location',
        // The 44×48 hit area contains a 32×40 pin; its tip is at [22,42].
        // Anchor the tip to the coordinate, which is also the circle's center.
        icon:L.divIcon({ className:'', html:`<div class="${styles.pin}" style="--location-accent:${accent}"><svg viewBox="0 0 32 40" aria-hidden="true" focusable="false"><path d="M16 1C7.7 1 1 7.7 1 16c0 10.4 15 22 15 22s15-11.6 15-22C31 7.7 24.3 1 16 1Z" fill="currentColor" stroke="white" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="16" r="5" fill="white"/></svg></div>`, iconSize:[44,48], iconAnchor:[22,42], tooltipAnchor:[0,-38] }),
      }).addTo(instance);
      marker.current = pin;
      instance.on('click', event => choose(event.latlng.lat, event.latlng.lng));
      instance.on('keypress', event => { if (event.originalEvent.key === 'Enter') { const center = instance.getCenter(); choose(center.lat, center.lng); } });
      pin.on('dragend', () => { const p = pin.getLatLng(); choose(p.lat, p.lng); });
      circle.current = L.circle(instance.getCenter(), { radius:0, color:accent, weight:1.5, fillOpacity:.09 }).addTo(instance);
      observer = new ResizeObserver(() => { if (!disposed) instance.invalidateSize({ animate: false }); });
      observer.observe(container.current);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => {
      disposed = true;
      observer?.disconnect();
      ownedMap?.remove();
      if (map.current === ownedMap) { map.current=null; marker.current=null; circle.current=null; }
    };
  }, [accent]);
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
  }, [latitude, longitude, radiusKm, accent]);
  return <>{failed && <p role="alert" className={styles.error}>The map could not load. Choose a place from the search results instead.</p>}
    <div ref={container} className={styles.map} role="region" aria-label="Location selection map. Use arrow keys to pan and Enter to choose the center, or search a place above." />
  </>;
}

function ExpandedMap({ onClose, trigger, focusAccent, ...props }: MapProps & { onClose:()=>void; trigger:React.RefObject<HTMLButtonElement | null>; focusAccent:string }) {
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
    style={{ '--form-accent':focusAccent } as React.CSSProperties}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <MapCanvas {...props}/>
    <button ref={closeButton} type="button" className={`${styles.button} ${styles.mapToggle}`} onClick={onClose}>
      <Minimize2 size={18} aria-hidden="true"/>Exit full screen
    </button>
  </dialog>, document.body);
}

export default function LocationMap(props:MapProps) {
  const expandButton = useRef<HTMLButtonElement>(null);
  const [expanded,setExpanded] = useState(false);
  const [focusAccent,setFocusAccent] = useState('');
  const close = useCallback(() => setExpanded(false), []);
  return <div className={styles.mapFrame}>
    <MapCanvas {...props}/>
    <button ref={expandButton} type="button" className={`${styles.button} ${styles.mapToggle}`}
      onClick={() => {
        if (expandButton.current) setFocusAccent(getComputedStyle(expandButton.current).getPropertyValue('--form-accent'));
        setExpanded(true);
      }} aria-label="Expand map to full screen" title="Expand map to full screen">
      <Maximize2 size={18} aria-hidden="true"/>
    </button>
    {expanded && <ExpandedMap {...props} onClose={close} trigger={expandButton} focusAccent={focusAccent}/>}
  </div>;
}
