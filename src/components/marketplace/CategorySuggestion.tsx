'use client';

import { useEffect, useRef, useState } from 'react';
import { apiSuggestCategory } from '../../api/ai.api';
import { getApiErrorMessage } from '../../lib/api/errors';
import styles from './MarketplaceAssist.module.css';

type Category={id:string;name:string;description?:string|null;aliases?:readonly string[]};
export default function CategorySuggestion({title,description,categories,selectedId,onChoose,tone}:{title:string;description:string;categories:Category[];selectedId:string;onChoose:(id:string)=>void;tone:'seeker'|'provider'}) {
  const [state,setState]=useState<{key:string;busy:boolean;ids:string[];message:string}>({key:'',busy:false,ids:[],message:''});
  const request=useRef<AbortController|null>(null);
  const key=JSON.stringify([title.trim(),description.trim(),categories.map(category=>category.id)]);
  const latest=useRef(key);
  useEffect(()=>()=>request.current?.abort(),[]);
  useEffect(()=>{latest.current=key;request.current?.abort();},[key]);
  const suggest=async()=>{
    if(state.busy&&state.key===key)return;
    const snapshot=key;request.current?.abort();const controller=new AbortController();request.current=controller;
    setState({key:snapshot,busy:true,ids:[],message:''});
    try {
      const response=await apiSuggestCategory(title.trim(),description.trim(),controller.signal);
      if(controller.signal.aborted||latest.current!==snapshot)return;
      setState({key:snapshot,busy:false,ids:response.data.suggestions.filter(item=>categories.some(category=>category.id===item.id)).map(item=>item.id),message:response.data.reason||''});
    }catch(error){if(!controller.signal.aborted&&latest.current===snapshot)setState({key:snapshot,busy:false,ids:[],message:getApiErrorMessage(error,'Could not suggest a category. You can still choose one manually.')});}
  };
  const current=state.key===key;
  return <div className={styles.categoryAssist} data-tone={tone}>
    <button type="button" className={styles.assistButton} disabled={title.trim().length<3||(current&&state.busy)} aria-busy={current&&state.busy} onClick={()=>void suggest()}>{current&&state.busy?'Finding categories…':'Suggest category'}</button>
    {current&&state.message&&<p className={styles.hint} role="status">{state.message}</p>}
    {current&&state.ids.length>0&&<div className={styles.categoryResults} aria-label="AI category suggestions"><p className={styles.hint}>Suggested from your title and description. Choose the best fit.</p>{state.ids.map(id=>{const category=categories.find(item=>item.id===id);return category?<button type="button" key={id} onClick={()=>onChoose(id)} aria-pressed={selectedId===id}>{category.name}<span>{selectedId===id?'Selected':'Use category'}</span></button>:null;})}</div>}
  </div>;
}
