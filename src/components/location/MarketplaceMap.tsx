'use client';

import { useId, useState } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, ChevronUp, ChevronDown } from 'lucide-react';
import type { MarketplaceLocation } from '../../lib/location';
import type { MarketplaceMapPin } from '../../lib/marketplace-map';
import styles from './Location.module.css';

const LocationMap=dynamic(()=>import('./LocationMap'),{ssr:false,loading:()=> <div className={styles.mapLoading}>Loading map…</div>});

export default function MarketplaceMap({ workspace, location, pins=[], loading, error, onApply, onShowResult }: {
  workspace:'seeker'|'provider';location:MarketplaceLocation|null;pins?:MarketplaceMapPin[];loading:boolean;error?:string;
  onApply:(location:MarketplaceLocation)=>void;onShowResult:(id:string)=>void;
}) {
  const [open,setOpen]=useState(false);
  const id=useId();
  if(!location)return null;
  return <div className={styles.discoveryMap} data-form-tone={workspace} style={{'--location-button':workspace==='provider'?'var(--color-provider-hover,#047857)':'var(--color-seeker-primary)'} as React.CSSProperties}>
    <button type="button" className={styles.mapDisclosure} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      <MapIcon size={18} aria-hidden="true"/>{open?'Hide nearby map':'Show nearby map'}{open?<ChevronUp size={16} aria-hidden="true"/>:<ChevronDown size={16} aria-hidden="true"/>}
    </button>
    {open && <div id={id} className={styles.discoveryMapBody}>
      <p className={styles.hint}>{loading ? 'Updating map results…' : error ? 'Map results are unavailable. Retry the search below.' : `${pins.length} matching ${workspace==='seeker'?'service':'job'}${pins.length===1?'':'s'} within ${location.radiusKm} km.`} Markers show approximate {workspace==='seeker'?'service bases':'job areas'}; exact locations stay private.</p>
      <LocationMap point={location.point} radiusKm={location.radiusKm} results={loading||error?[]:pins} accent={workspace==='provider'?'#047857':'var(--color-seeker-primary)'}
        onChange={point=>onApply({...location,point})} onResultSelect={id=>{setOpen(false);onShowResult(id);}}/>
      <p className={styles.hint}>The circle uses your search radius. Matches outside it stay hidden. Click a new place and confirm to move your search; zooming alone keeps the same results. Distances are straight-line estimates.</p>
    </div>}
  </div>;
}
