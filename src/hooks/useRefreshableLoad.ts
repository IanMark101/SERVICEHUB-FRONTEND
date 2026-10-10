'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** First visits and new queries load visibly. Revalidating a confirmed result
 * (including an empty result) keeps that view in place until fresh data arrives.
 * Call current() before committing data, and finish(true) after a successful read.
 */
export function useRefreshableLoad(queryKey: string | null) {
  const scope = useMemo(() => ({ queryKey }), [queryKey]);
  const lifecycle = useRef({ scope, active: true, version: 0, resolved: false });
  const [state, setState] = useState({ scope, loading: queryKey !== null, refreshing: false });

  useEffect(() => {
    lifecycle.current = { scope, active: true, version: 0, resolved: false };
    return () => { lifecycle.current.active = false; lifecycle.current.version++; };
  }, [scope]);

  const beginLoad = useCallback(() => {
    const run = lifecycle.current;
    const version = ++run.version;
    const current = () => run === lifecycle.current && run.active && run.scope === scope && version === run.version;
    setState({ scope, loading: !run.resolved, refreshing: run.resolved });
    return {
      current,
      finish(success = false) {
        if (!current()) return;
        run.resolved ||= success;
        setState({ scope, loading: false, refreshing: false });
      },
    };
  }, [scope]);

  return {
    loading: queryKey !== null && (state.scope !== scope || state.loading),
    refreshing: state.scope === scope && state.refreshing,
    beginLoad,
  };
}
