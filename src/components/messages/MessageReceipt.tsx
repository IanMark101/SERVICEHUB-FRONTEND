'use client';

/** Historical read flags remain useful even when their seen time is unknown. */
export default function MessageReceipt({ isRead, readAt }: { isRead:boolean; readAt?:string|null }) {
  const seen = readAt ? new Date(readAt) : null;
  if (!isRead) return <span>Sent</span>;
  if (!seen || Number.isNaN(seen.getTime())) return <span>Seen</span>;
  const today = seen.toDateString() === new Date().toDateString();
  const label = seen.toLocaleString([], { ...(today ? {} : { month:'short', day:'numeric' } as const), hour:'2-digit', minute:'2-digit' });
  return <time dateTime={seen.toISOString()} title={`Seen ${seen.toLocaleString()}`}>Seen {label}</time>;
}
