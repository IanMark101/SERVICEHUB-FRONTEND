'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGetBanAppealSummary } from '@/api/admin.api';
import { useApiCacheRefresh } from './useApiCacheRefresh';

export default function useAdminBanAppealCount(enabled: boolean) {
  const [pending, setPending] = useState<number | undefined>();
  const generation = useRef(0);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const load = useCallback(async () => {
    if (!enabled) return;
    const current = ++generation.current;
    try { const result = await apiGetBanAppealSummary(); if (current === generation.current) setPending(result.data.pending); }
    catch { if (current === generation.current) setPending(undefined); }
  }, [enabled]);
  useApiCacheRefresh(['admin'], load, enabled);
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => { window.clearTimeout(timer); invalidate(); };
  }, [enabled, load, invalidate]);
  return enabled ? pending : undefined;
}
