import type { ReactNode } from 'react';

export interface ActivityFact {
  label: string;
  value: ReactNode;
  detail?: string;
}

export function formatActivityDuration(minutes?: number): string {
  if (!minutes || !Number.isFinite(minutes) || minutes < 0) return 'Not recorded';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours} hr${remainder ? ` ${remainder} min` : ''}` : `${minutes} min`;
}

export default function ActivityFacts({ title, label, rows }: { title: string; label: string; rows: ActivityFact[] }) {
  return (
    <section aria-label={label} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-neutral-700 dark:bg-charcoal/40 sm:p-5">
      <h3 className="text-sm font-bold text-ink dark:text-ink">{title}</h3>
      <dl className="mt-3 divide-y divide-stone-200/80 dark:divide-neutral-700">
        {rows.map((row) => <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-3 first:pt-0 last:pb-0">
          <dt className="text-xs font-medium text-ink-muted dark:text-ink-secondary">{row.label}</dt>
          <dd className="min-w-0 text-right">
            <span className="block whitespace-pre-wrap break-words text-sm font-semibold tabular-nums text-ink dark:text-ink">{row.value}</span>
            {row.detail && <span className="mt-1 block text-xs leading-relaxed text-ink-muted dark:text-ink-secondary">{row.detail}</span>}
          </dd>
        </div>)}
      </dl>
    </section>
  );
}
