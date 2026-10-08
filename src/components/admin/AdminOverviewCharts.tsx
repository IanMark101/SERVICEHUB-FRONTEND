import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, BarChart3, CircleGauge } from 'lucide-react';

export interface AdminActivityPoint {
  date: string;
  registrations: number;
  listings: number;
  bookings: number;
}

export interface AdminChartMetric {
  label: string;
  count: number;
  href?: string;
}

interface AdminOverviewChartsProps {
  activity: AdminActivityPoint[];
  bookingLifecycle: AdminChartMetric[];
  moderationWorkload: AdminChartMetric[];
  isDark: boolean;
}

const workloadColors = [
  'var(--admin-chart-primary)',
  'var(--admin-chart-secondary)',
  'var(--admin-chart-tertiary)',
  'var(--admin-chart-quaternary)',
];

function formatDay(date: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(`${date}T00:00:00`));
}

function buildConicGradient(metrics: AdminChartMetric[]) {
  const total = metrics.reduce((sum, metric) => sum + metric.count, 0);
  if (total === 0) return 'var(--admin-chart-track)';

  let cursor = 0;
  const stops = metrics.map((metric, index) => {
    const start = cursor;
    cursor += (metric.count / total) * 100;
    return `${workloadColors[index % workloadColors.length]} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export default function AdminOverviewCharts({
  activity,
  bookingLifecycle,
  moderationWorkload,
  isDark,
}: AdminOverviewChartsProps) {
  const router = useRouter();
  const surface = isDark
    ? 'border-neutral-800 bg-charcoal-surface text-white'
    : 'border-slate-200 bg-white text-ink';
  const activityMaximum = Math.max(
    1,
    ...activity.flatMap((item) => [item.registrations, item.listings, item.bookings]),
  );
  const lifecycleMaximum = Math.max(1, ...bookingLifecycle.map((item) => item.count));
  const workloadTotal = moderationWorkload.reduce((sum, metric) => sum + metric.count, 0);
  const activityTotal = activity.reduce(
    (sum, point) => sum + point.registrations + point.listings + point.bookings,
    0,
  );

  return (
    <section aria-labelledby="admin-insights-title" className="space-y-3">
      <div>
        <h3 id="admin-insights-title" className="text-sm font-extrabold">Operational insights</h3>
        <p className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted">
          Live database counts designed to expose demand, workflow bottlenecks, and pending moderation work.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <article className={`rounded-2xl border p-5 shadow-sm ${surface}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-extrabold">
                <BarChart3 className="h-4 w-4 text-[var(--admin-accent)]" aria-hidden="true" />
                Marketplace activity
              </h4>
              <p className="mt-1 text-[10px] text-ink-muted">New records created during the last seven calendar days.</p>
            </div>
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-ink-muted dark:border-neutral-700 dark:text-ink-secondary">
              {activityTotal} events
            </span>
          </div>

          <div className="mt-5 flex items-center gap-4 text-[9px] font-semibold text-ink-muted" aria-hidden="true">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--admin-chart-primary)]" />Registrations</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--admin-chart-secondary)]" />Listings</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--admin-chart-tertiary)]" />Bookings</span>
          </div>

          <div
            className="mt-4 grid h-44 grid-cols-7 items-end gap-2 border-b border-slate-200 pb-2 dark:border-neutral-700"
            role="img"
            aria-label={`Seven-day activity: ${activity.map((item) => `${formatDay(item.date)}, ${item.registrations} registrations, ${item.listings} listings, ${item.bookings} bookings`).join('; ')}`}
          >
            {activity.map((item) => (
              <div key={item.date} className="flex h-full min-w-0 flex-col justify-end gap-2">
                <div className="flex h-full items-end justify-center gap-1">
                  {([
                    ['registrations', item.registrations, 'bg-[var(--admin-chart-primary)]'],
                    ['listings', item.listings, 'bg-[var(--admin-chart-secondary)]'],
                    ['bookings', item.bookings, 'bg-[var(--admin-chart-tertiary)]'],
                  ] as const).map(([label, value, color]) => (
                    <span
                      key={label}
                      className={`w-full max-w-3 rounded-t-sm transition-[height] ${color}`}
                      style={{ height: value > 0 ? `${Math.max(6, (value / activityMaximum) * 100)}%` : '2px' }}
                      title={`${value} ${label}`}
                    />
                  ))}
                </div>
                <span className="text-center text-[9px] font-semibold text-ink-subtle">{formatDay(item.date)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={`rounded-2xl border p-5 shadow-sm ${surface}`}>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-extrabold">
              <CircleGauge className="h-4 w-4 text-[var(--admin-accent)]" aria-hidden="true" />
              Moderation workload
            </h4>
            <p className="mt-1 text-[10px] text-ink-muted">Open items requiring administrator attention.</p>
          </div>

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
            <div
              className="relative h-36 w-36 shrink-0 rounded-full"
              style={{ background: buildConicGradient(moderationWorkload) } as CSSProperties}
              role="img"
              aria-label={`${workloadTotal} total moderation items: ${moderationWorkload.map((item) => `${item.label} ${item.count}`).join(', ')}`}
            >
              <div className={`absolute inset-5 flex flex-col items-center justify-center rounded-full ${isDark ? 'bg-charcoal-surface' : 'bg-white'}`}>
                <strong className="text-2xl font-bold">{workloadTotal}</strong>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-subtle">Open items</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {moderationWorkload.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.href && router.push(item.href)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[10px] transition-colors hover:bg-slate-50 dark:hover:bg-charcoal"
                >
                  <span className="flex items-center gap-2 font-semibold text-ink-muted dark:text-ink-secondary">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: workloadColors[index % workloadColors.length] }} />
                    {item.label}
                  </span>
                  <strong>{item.count}</strong>
                </button>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className={`rounded-2xl border p-5 shadow-sm ${surface}`}>
        <div>
          <h4 className="flex items-center gap-2 text-sm font-extrabold">
            <Activity className="h-4 w-4 text-[var(--admin-accent)]" aria-hidden="true" />
            Booking lifecycle
          </h4>
          <p className="mt-1 text-[10px] text-ink-muted">All bookings grouped into operational stages.</p>
        </div>
        <div className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2" role="list">
          {bookingLifecycle.map((item) => (
            <div key={item.label} role="listitem">
              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-ink-muted dark:text-ink-secondary">{item.label}</span>
                <strong>{item.count}</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-charcoal">
                <div
                  className="h-full rounded-full bg-[var(--admin-chart-primary)]"
                  style={{ width: item.count > 0 ? `${Math.max(3, (item.count / lifecycleMaximum) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
