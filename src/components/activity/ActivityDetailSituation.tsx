export default function ActivityDetailSituation({ situation, role, action, closed = false }: {
  situation: { label: string; title: string; detail: string; next: string; tone?: string };
  role: 'seeker' | 'provider';
  action: string;
  closed?: boolean;
}) {
  const emphasis = closed
    ? 'border-stone-300 bg-stone-50/70 dark:border-neutral-700 dark:bg-charcoal/40'
    : role === 'seeker'
      ? 'border-orange-200 bg-orange-50/40 dark:border-orange-900/50 dark:bg-orange-950/15'
      : 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/15';
  const actionTone = situation.tone === 'action'
    ? role === 'seeker' ? 'text-orange-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400'
    : 'text-ink-muted dark:text-ink-secondary';
  return (
    <div className={`overflow-hidden rounded-2xl border ${emphasis}`}>
      <section aria-label="What is happening now" className="px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="break-words text-xl font-bold leading-snug tracking-tight text-ink dark:text-ink sm:text-2xl">{situation.title}</h2>
      </section>
      <div className="border-t border-stone-200/80 bg-white/80 dark:border-neutral-700 dark:bg-charcoal/45">
        <section aria-label="Your action" className="px-4 py-3.5 sm:px-6">
          <h3 className={`text-[11px] font-bold uppercase tracking-widest ${actionTone}`}>Your action</h3>
          <p className="mt-1 text-base font-semibold leading-relaxed text-ink dark:text-ink">{action}</p>
        </section>
        <details className="border-t border-stone-200/80 px-4 py-3.5 sm:px-6 dark:border-neutral-700">
          <summary className="cursor-pointer text-sm font-semibold text-ink-secondary focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-ink">Status details</summary>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-ink">{situation.detail}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary dark:text-ink">{situation.next}</p>
        </details>
      </div>
    </div>
  );
}
