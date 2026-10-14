import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Inbox, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import styles from './Inbox.module.css';

export default function InboxState({ title, description, icon, actionLabel, actionHref, onAction, loading = false, kind = 'empty' }: {
  title:string; description:string; icon?:LucideIcon; actionLabel?:string; actionHref?:string; onAction?:()=>void; loading?:boolean; kind?:'empty'|'error';
}) {
  const empty = !loading && kind === 'empty';
  const Icon = icon || (kind === 'error' ? TriangleAlert : Inbox);
  const action = <>{actionLabel}{empty && <ArrowRight size={16} aria-hidden="true" />}</>;
  return <div className={`${styles.state}${empty ? ` ${styles.empty}` : ''}`} data-state={loading ? 'loading' : kind} role={loading ? 'status' : kind === 'error' ? 'alert' : undefined}>
    {empty ? <span className={styles.emptyIcon}><Icon size={24} strokeWidth={1.75} aria-hidden="true" /></span>
      : <Icon size={24} strokeWidth={1.75} className={`${styles.stateIcon}${loading ? ' animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />}
    <div className={styles.stateCopy}><h3>{title}</h3><p>{description}</p></div>
    {actionLabel && (actionHref ? <Link href={actionHref} className={styles.button}>{action}</Link>
      : onAction && <button type="button" className={styles.button} onClick={onAction}>{action}</button>)}
  </div>;
}
