import { useId, useState } from 'react';
import styles from './Earnings.module.css';

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const dayLabel = (date: string) => new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' }).format(new Date(date + 'T00:00:00+08:00'));

export default function EarningsTrend({ points: dailyPoints }: { points: Array<{ date: string; amount: number }> }) {
  const monthly = dailyPoints.length > 45;
  const points = monthly ? [...dailyPoints.reduce((groups, point) => {
    const key = point.date.slice(0, 7) + '-01';
    groups.set(key, (groups.get(key) ?? 0) + point.amount);
    return groups;
  }, new Map<string, number>())].map(([date, amount]) => ({ date, amount })) : dailyPoints;
  const label = (value: string) => monthly ? new Intl.DateTimeFormat('en-PH', { month: 'short', year: 'numeric', timeZone: 'Asia/Manila' }).format(new Date(value + 'T00:00:00+08:00')) : dayLabel(value);
  const id = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const max = Math.max(1, ...points.map(point => point.amount));
  const active = points.find(point => point.date === selected);
  const hasEarnings = points.some(point => point.amount > 0);
  return <figure className={styles.figure} aria-labelledby={id}>
    <figcaption id={id} className={styles.chartCaption}>
      <span>{hasEarnings ? `Earned fees per ${monthly ? 'month' : 'day'}` : 'No earned fees in this period'}</span>
      <output aria-live="polite">{active ? `${label(active.date)}: ${money.format(active.amount)}` : `Select a ${monthly ? 'month' : 'day'} for details`}</output>
    </figcaption>
    <div className={styles.chart}>
      <div className={styles.axis} aria-hidden="true"><span>{money.format(max)}</span><span>₱0</span></div>
      <div className={styles.bars} role="group" aria-label={`${monthly ? 'Monthly' : 'Daily'} platform earnings`}>
        {points.map(point => <button key={point.date} type="button" onFocus={() => setSelected(point.date)} onMouseEnter={() => setSelected(point.date)} onClick={() => setSelected(point.date)}
          aria-label={`${label(point.date)}: ${money.format(point.amount)}`} aria-pressed={selected === point.date} className={styles.barButton}>
          <span className={styles.bar} style={{ height: `${point.amount > 0 ? Math.max(2, point.amount / max * 100) : 0}%` }} />
        </button>)}
      </div>
    </div>
    <div className={styles.chartDates} aria-hidden="true"><span>{points[0] ? label(points[0].date) : ''}</span><span>{points.at(-1) ? label(points.at(-1)!.date) : ''}</span></div>
  </figure>;
}
