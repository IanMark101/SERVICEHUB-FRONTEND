'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Star, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import useDialogFocus from '../../hooks/useDialogFocus';
import { apiMatchProviders, apiMatchRequests, type MarketplaceMatches } from '../../api/ai.api';
import { getApiErrorMessage } from '../../lib/api/errors';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import styles from './MarketplaceAssist.module.css';

export default function MarketplaceMatchesModal({source,tone,onClose}:{source:{id:string;title:string};tone:'seeker'|'provider';onClose:()=>void}) {
  const [state,setState]=useState<{data:MarketplaceMatches|null;loading:boolean;error:string}>({data:null,loading:true,error:''});
  const [revision,setRevision]=useState(0);
  const dialog=useDialogFocus(true,false,onClose,'dialog');
  useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[]);
  useEffect(()=>{
    let active=true;
    void (tone==='seeker'?apiMatchProviders(source.id):apiMatchRequests(source.id)).then(response=>{
      if(!active)return;
      if(!response.success||!Array.isArray(response.data?.suggestions))throw new Error('Matches could not load.');
      setState({data:response.data,loading:false,error:''});
    }).catch(error=>{if(active)setState({data:null,loading:false,error:getApiErrorMessage(error,'Could not load matches. Please try again.')});});
    return()=>{active=false;};
  },[source.id,tone,revision]);
  const refresh=()=>{setState(previous=>({...previous,loading:true,error:''}));setRevision(value=>value+1);};
  const target=tone==='seeker'?'provider services':'seeker requests';
  return createPortal(<div className={styles.overlay} data-tone={tone} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="marketplace-matches-heading" className={styles.panel}>
      <header className={styles.modalHeader}><div><h2 id="marketplace-matches-heading">Matching {target}</h2><p>{source.title}</p></div><button type="button" className={styles.iconButton} aria-label="Close matches" onClick={onClose}><X size={20}/></button></header>
      <div className={styles.modalBody} aria-busy={state.loading}>
        <p className={styles.hint}>Same-category matches, ranked by work relevance, trust, recorded review ratings and distance when known. Review the details before choosing.</p>
        {state.data?.reason&&!state.loading&&<p className={styles.notice} role="status">{state.data.reason}</p>}
        {state.loading?<div className={styles.skeleton} role="status"><span>Finding matching {target}…</span><div/><div/><div/></div>:state.error?<div role="alert" className={styles.notice}><p>{state.error}</p><button type="button" className={styles.assistButton} onClick={refresh}>Try again</button></div>:state.data?.suggestions.length?<ol className={styles.matches}>{state.data.suggestions.map((item,index)=><li key={item.id}>
          <span className={styles.rank} aria-label={`Rank ${index+1}`}>{index+1}</span><div className={styles.matchContent}><h3>{item.title}</h3><p className={styles.person}>{item.name} · {item.category}</p>
          <div className={styles.metrics}><TrustScoreBadge score={item.trustScore}/><span className={styles.rating}><Star size={14} aria-hidden="true"/>{item.reviewCount&&item.rating!==null?`${item.rating.toFixed(1)} (${item.reviewCount} review${item.reviewCount===1?'':'s'})`:'No ratings yet'}</span><span>{item.distanceKm===null?'Distance not available':`${item.distanceKm} km away`}</span></div>
          <p className={styles.hint}>{item.locationLabel||'Area not provided'} · {item.amount===null?'Price by agreement':`${tone==='provider'?'Budget ':''}₱${item.amount.toLocaleString()}${item.priceType==='PER_HOUR'?' / hour':item.priceType==='PER_DAY'?' / day':item.priceType==='PER_PROJECT'?' / project':''}`}</p>
          <Link className={styles.detailLink} href={tone==='seeker'?`/seeker/seek-services?serviceId=${encodeURIComponent(item.id)}`:`/provider/browse-services?request=${encodeURIComponent(item.id)}`} onClick={onClose}>View {tone==='seeker'?'service':'request'}<ArrowRight size={15} aria-hidden="true"/></Link></div>
        </li>)}</ol>:!state.data?.reason&&<p className={styles.notice}>No matching {target} yet. Try again after new listings are posted.</p>}
      </div>
      <footer className={styles.modalFooter}><span className={styles.hint}>{state.data?.source==='gemini'?'AI-assisted relevance':'Marketplace ranking'}</span><button type="button" className={styles.assistButton} disabled={state.loading} onClick={refresh}><RefreshCw size={14} aria-hidden="true"/>Refresh</button><button type="button" className={styles.primaryButton} onClick={onClose}>Done</button></footer>
    </section>
  </div>,document.body);
}
