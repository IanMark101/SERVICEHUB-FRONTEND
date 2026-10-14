'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { apiGetAdminBookingMessages } from '@/api/admin.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { CaseMessage } from './cases/types';
import { dateLabel } from './cases/labels';
import styles from './booking-conversation.module.css';

interface ConversationPage {
  messages: CaseMessage[]; messageCount?: number;
  seeker?: { id: string; name: string }; provider?: { id: string; name: string };
  pagination?: { hasMore: boolean; nextBefore: string | null };
}

export default function BookingConversation({ bookingId }: { bookingId: string }) {
  const [data, setData] = useState<ConversationPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryBefore, setRetryBefore] = useState<string>();
  const frame = useRef<HTMLDivElement>(null);
  const sequence = useRef(0);
  const pending = useRef(false);
  const scroll = useRef<{ height: number; top: number } | 'latest' | null>(null);

  const load = useCallback(async (before?: string) => {
    if (pending.current) return;
    pending.current = true;
    const request = ++sequence.current;
    setLoading(true); setError(''); setRetryBefore(before);
    try {
      const response = before ? await apiGetAdminBookingMessages(bookingId, { before }) : await apiGetAdminBookingMessages(bookingId);
      if (request !== sequence.current) return;
      const page = response.data as ConversationPage;
      scroll.current = before && frame.current ? { height: frame.current.scrollHeight, top: frame.current.scrollTop } : 'latest';
      setData(current => ({ ...page, messages: before && current ? [...page.messages.filter(message => !current.messages.some(existing => existing.id === message.id)), ...current.messages] : page.messages }));
    } catch (cause) {
      if (request === sequence.current) setError(getApiErrorMessage(cause, 'Messages could not be loaded. Try again.'));
    } finally {
      if (request === sequence.current) { pending.current = false; setLoading(false); }
    }
  }, [bookingId]);

  const invalidate = useCallback(() => { sequence.current++; pending.current = false; }, []);
  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => { if (mounted) void load(); });
    return () => { mounted = false; invalidate(); };
  }, [load, invalidate]);
  useLayoutEffect(() => {
    if (frame.current && scroll.current) frame.current.scrollTop = scroll.current === 'latest' ? frame.current.scrollHeight : frame.current.scrollHeight - scroll.current.height + scroll.current.top;
    scroll.current = null;
  }, [data]);

  return <div className={styles.root}>
    <p className={styles.notice}>Booking messages only. This review is recorded in the admin audit log.</p>
    {data && !!data.messages.length && <div className={styles.toolbar}><span>{data.messages.length} of {data.messageCount ?? data.messages.length} messages · Oldest to newest</span>{data.pagination?.hasMore && <button type="button" className="case-button" disabled={loading} onClick={() => void load(data.pagination!.nextBefore!)}>{loading ? 'Loading older messages…' : 'Load older messages'}</button>}</div>}
    {error && <div className={styles.error} role="alert"><p>{error}</p><button type="button" className="case-button" onClick={() => void load(retryBefore)} disabled={loading}>Retry messages</button></div>}
    {!data && loading && <p className={styles.notice} role="status">Loading messages…</p>}
    {data && !data.messages.length && <p className={styles.notice}>No messages have been sent in this booking.</p>}
    {data && !!data.messages.length && <div ref={frame} className={styles.frame} role="region" aria-label="Booking conversation" tabIndex={0} aria-busy={loading}>
      <ol className={styles.messages}>{data.messages.map(message => {
        const role = message.isSystem ? 'System update' : message.senderId === data.seeker?.id ? 'Seeker' : message.senderId === data.provider?.id ? 'Provider' : 'Participant';
        return <li key={message.id} className={message.isSystem ? styles.system : styles.message}>
          <div className={styles.meta}><div><strong>{message.isSystem ? 'ServiceHub' : message.sender?.name || 'Booking participant'}</strong><span>{role}</span></div><time dateTime={message.createdAt}>{dateLabel(message.createdAt)}</time></div>
          <p>{message.content}</p>
        </li>;
      })}</ol>
    </div>}
  </div>;
}
