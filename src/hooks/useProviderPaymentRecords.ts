'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiGetProviderPaymentRecords, type PaymentRecordFilter, type ProviderPaymentRecords } from '../api/transactions.api';
import { getApiErrorMessage } from '../lib/api/errors';
import { useApiCacheRefresh } from './useApiCacheRefresh';

type Result = { key: string; data: ProviderPaymentRecords | null; loading: boolean; error: string };

export function useProviderPaymentRecords(userId: string | undefined, date: string, status: PaymentRecordFilter, booking: string | null) {
  const criteria = JSON.stringify({ userId, date, status });
  const [pageState, setPageState] = useState({ criteria: '', page: 1, followedBooking: '' });
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result>({ key: '', data: null, loading: false, error: '' });
  const page = pageState.criteria === criteria ? pageState.page : 1;
  const focusBooking = booking && pageState.followedBooking !== booking ? booking : undefined;
  const key = JSON.stringify({ criteria, page, focusBooking });
  const refresh = useCallback(() => { setRevision(value => value + 1); }, [setRevision]);

  useApiCacheRefresh(['transactions', 'bookings'], refresh, Boolean(userId));
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => {
      if (active) setResult(current => ({ key, data: current.key === key ? current.data : null, loading: true, error: '' }));
    });
    void apiGetProviderPaymentRecords({ page, limit: 8, status, ...(date ? { date } : {}), ...(focusBooking ? { booking: focusBooking } : {}) }, controller.signal)
      .then(data => { if (active) setResult({ key, data, loading: false, error: '' }); })
      .catch(error => {
        if (active) setResult(current => ({ key, data: current.key === key ? current.data : null, loading: false, error: getApiErrorMessage(error, 'Payment records could not load. Try again.') }));
      });
    return () => { active = false; controller.abort(); };
  }, [key, userId, page, status, date, focusBooking, revision]);

  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('online', onFocus); };
  }, [refresh]);

  const current = result.key === key;
  const data = current ? result.data : null;
  return {
    data, error: current ? result.error : '', refresh,
    loading: Boolean(userId && (!current || (!data && result.loading))),
    refreshing: Boolean(data && result.loading),
    goToPage: (next: number) => setPageState({ criteria, page: Math.max(1, next), followedBooking: booking || '' }),
  };
}
