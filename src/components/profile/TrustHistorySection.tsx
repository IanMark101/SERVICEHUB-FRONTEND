import Link from 'next/link';
import { Award } from 'lucide-react';
import type { getTrustBand } from './ProfileHeader';

export interface TrustHistoryEvent {
  id: string;
  delta: number;
  reason: string;
  scoreBefore: number;
  scoreAfter: number;
  createdAt: string;
}

interface Props {
  events: TrustHistoryEvent[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  score: number;
  band: ReturnType<typeof getTrustBand>;
  isDark: boolean;
}

export default function TrustHistorySection({ events, loading, error, onRetry, score, band, isDark }: Props) {
  const muted = isDark ? 'text-neutral-300' : 'text-slate-600';
  return (
    <section aria-labelledby="trust-history-heading" className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'bg-charcoal-surface border-neutral-800 text-white' : 'bg-white border-slate-200 text-ink'}`}>
      <div className={`flex flex-wrap items-start justify-between gap-4 border-b pb-5 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <div className="min-w-0 max-w-prose">
          <h2 id="trust-history-heading" className="flex items-center gap-2 text-lg font-bold"><Award size={20} aria-hidden="true" /> Trust history</h2>
          <p className={`mt-2 text-sm leading-6 ${muted}`}>Recorded changes to this account’s trust score, newest first.</p>
        </div>
        <p className={`flex flex-wrap items-baseline gap-2 text-sm font-semibold ${band.color}`}>
          <span className="text-2xl font-bold tabular-nums">{score}<span className={`text-sm font-normal ${muted}`}> / 100</span></span>
          <span className={isDark ? 'text-neutral-200' : 'text-slate-700'}>{band.label}</span>
        </p>
      </div>
      <div aria-busy={loading} className="py-5">
        {error && events.length > 0 && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm ${muted}`}>Couldn’t refresh trust history. Showing the last loaded changes.</p>
            <button type="button" onClick={onRetry} className="min-h-11 px-3 text-sm font-semibold underline underline-offset-4">Try again</button>
          </div>
        )}
        {loading ? (
          <p role="status" className={`text-sm ${muted}`}>Loading trust history…</p>
        ) : error && events.length === 0 ? (
          <div role="alert" className="space-y-3">
            <p className={`text-sm ${muted}`}>Trust history could not load. Try again to see the recorded changes.</p>
            <button type="button" onClick={onRetry} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${isDark ? 'border-neutral-600 hover:bg-charcoal' : 'border-slate-300 hover:bg-slate-50'}`}>Try again</button>
          </div>
        ) : events.length === 0 ? (
          <p className={`text-sm ${muted}`}>No trust score changes have been recorded yet.</p>
        ) : (
          <ol className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-slate-200'}`}>
            {events.map(event => {
              const tone = event.delta > 0
                ? isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
                : event.delta < 0
                  ? isDark ? 'bg-rose-950 text-rose-300' : 'bg-rose-50 text-rose-800'
                  : isDark ? 'bg-charcoal text-neutral-300' : 'bg-slate-100 text-slate-600';
              return (
                <li key={event.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span aria-label={`${event.delta > 0 ? '+' : ''}${event.delta} trust points`} className={`inline-flex min-h-10 min-w-12 shrink-0 items-center justify-center rounded-xl px-2 text-sm font-bold tabular-nums ${tone}`}>{event.delta > 0 ? '+' : ''}{event.delta}</span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="break-words text-sm font-semibold leading-6 [overflow-wrap:anywhere]">{event.reason}</h3>
                    <p className={`text-sm tabular-nums ${muted}`}>Score: {event.scoreBefore} → {event.scoreAfter}</p>
                    <time dateTime={event.createdAt} className={`block text-xs leading-5 ${muted}`}>{new Date(event.createdAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · Philippine time</time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <div className={`border-t pt-4 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <p className={`text-sm leading-6 ${muted}`}>Trust scores reflect verification, completed bookings, reviews, and confirmed account actions.</p>
        <Link href="/help/trust-reputation/what-is-trust-score" className={`mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>How trust scores work</Link>
      </div>
    </section>
  );
}
