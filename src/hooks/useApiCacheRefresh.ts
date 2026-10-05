'use client';

import { useEffect, useRef } from 'react';
import { responseCache, type CacheChange } from '../lib/api/responseCache';
import type { CacheResource } from '../lib/api/cachePolicy';

/** Refresh only the mounted view's data after an invalidation. Socket bursts
 * and multiple related mutations are coalesced; existing data stays visible. */
export function useApiCacheRefresh(
  tags: readonly CacheResource[],
  refresh: (change: CacheChange) => void | Promise<unknown>,
  enabled = true,
) {
  const latest = useRef(refresh);
  useEffect(() => { latest.current = refresh; }, [refresh]);
  const tagKey = tags.join(',');
  useEffect(() => {
    if (!enabled) return;
    const resources = tagKey.split(',');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = responseCache.subscribe(change => {
      if (!change.tags.some(tag => resources.includes(tag))) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Feature loaders present their own errors. Never leave a background
        // refresh rejection unhandled, or tear down the current screen.
        void Promise.resolve().then(() => latest.current(change)).catch(() => {});
      }, 200);
    });
    return () => { unsubscribe(); clearTimeout(timer); };
  }, [tagKey, enabled]);
}
