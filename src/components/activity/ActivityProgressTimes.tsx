import './booking-progress-history.css';

export interface ActivityProgressTime {
  id: string;
  label: string;
  actor?: string;
  occurredAt?: string | null;
  state: 'recorded' | 'missing' | 'pending';
}

// Dates without a recorded clock time must not be presented as action timestamps.
export const isActivityTimestamp = (value?: string | null): value is string =>
  Boolean(value && value.includes('T') && Number.isFinite(Date.parse(value)));

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true,
});

export default function ActivityProgressTimes({ label, rows }: { label: string; rows: ActivityProgressTime[] }) {
  return (
    <section className="booking-progress" aria-label={label}>
      <div className="booking-progress__heading"><h4>Progress times</h4><span>Philippine time (UTC+8)</span></div>
      <ol className="booking-progress__list">
        {rows.map(row => <li key={row.id} className="booking-progress__row" data-state={row.state}>
          <span className="booking-progress__dot" aria-hidden="true" />
          <div className="booking-progress__action"><p>{row.label}</p>{row.actor && <span>{row.actor}</span>}</div>
          {row.state === 'recorded' && isActivityTimestamp(row.occurredAt) ? (
            <time dateTime={row.occurredAt} className="booking-progress__time">
              <strong>{timeFormatter.format(new Date(row.occurredAt))}</strong>
              <span>{dateFormatter.format(new Date(row.occurredAt))}</span>
            </time>
          ) : <span className="booking-progress__status">{row.state === 'pending' ? 'Pending' : 'Time not recorded'}</span>}
        </li>)}
      </ol>
    </section>
  );
}
