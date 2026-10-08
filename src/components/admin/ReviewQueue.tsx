import type { ReactNode } from 'react';
import Skeleton from '../ui/Skeleton';
import './review-queue.css';

export function ReviewTable({ columns, label, children }: { columns: string[]; label: string; children: ReactNode }) {
  return <table className="review-table">
    <caption className="sr-only">{label}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table>;
}

export function ReviewCell({ label, children, action = false }: { label: string; children: ReactNode; action?: boolean }) {
  return <td className={action ? 'review-cell-action' : undefined}>
    <span className="review-cell-label" aria-hidden="true">{label}</span>
    <div className="review-cell-value">{children}</div>
  </td>;
}

export function ReviewQueueLoading({ label = 'Loading cases' }: { label?: string }) {
  return <div className="review-loading" role="status" aria-label={label} aria-busy="true">
    {[0, 1, 2].map(index => <div className="review-loading-row" key={index}>
      <div><Skeleton className="h-5 w-56 max-w-full" /><Skeleton className="mt-3 h-4 w-40 max-w-full" /></div>
      <Skeleton className="h-4 w-40 max-w-full" /><Skeleton className="h-5 w-24" /><Skeleton className="h-11 w-32" />
    </div>)}
  </div>;
}
