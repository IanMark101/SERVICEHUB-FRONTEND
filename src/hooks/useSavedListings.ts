'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGetSavedStatus, apiSetListingSaved, type SavedListingType } from '../api/savedListings.api';
import { useApiCacheRefresh } from './useApiCacheRefresh';
import { useToast } from '../components/ui/Toast';
import { getApiErrorMessage } from '../lib/api/errors';

/** One bounded status request per displayed page, rather than a request per card. */
export default function useSavedListings(contentType: SavedListingType, userId: string | undefined, ids: string[]) {
  const idKey = [...new Set(ids)].sort().join(',');
  const key = `${userId || ''}:${contentType}:${idKey}`;
  const currentKey = useRef(key);
  useEffect(() => { currentKey.current = key; return () => { currentKey.current = ''; }; }, [key]);
  const [state, setState] = useState<{ key: string; ids: Set<string>; error: string }>({ key: '', ids: new Set(), error: '' });
  const [busyState, setBusyState] = useState<{ key: string; ids: Set<string> }>({ key: '', ids: new Set() });
  const pending = useRef(new Set<string>());
  const generation = useRef(0);
  const [revision, setRevision] = useState(0);
  const { success, error: toastError } = useToast();
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useApiCacheRefresh(['saved'], refresh, Boolean(userId));
  useEffect(() => {
    const requestGeneration = ++generation.current;
    if (!userId || !idKey) return;
    let active = true;
    void apiGetSavedStatus(contentType, idKey.split(',')).then(ids => {
      if (active && generation.current === requestGeneration) setState({ key, ids: new Set(ids), error: '' });
    }).catch(error => {
      if (active && generation.current === requestGeneration) setState({ key, ids: new Set(), error: getApiErrorMessage(error, 'Saved status could not load. Try again.') });
    });
    return () => { active = false; };
  }, [contentType, userId, idKey, key, revision]);

  const ready = state.key === key && !state.error;
  const toggle = async (id: string) => {
    const pendingKey = `${userId}:${contentType}:${id}`;
    if (!userId || !ready || pending.current.has(pendingKey)) return false;
    const actionKey = key;
    const saved = !state.ids.has(id);
    pending.current.add(pendingKey);
    setBusyState(previous => ({ key: actionKey, ids: new Set([...(previous.key === actionKey ? previous.ids : []), id]) }));
    ++generation.current; // A slower status request must not undo a completed save.
    try {
      await apiSetListingSaved(contentType, id, saved);
      if (currentKey.current !== actionKey) return true;
      setState(previous => {
        const ids = new Set(previous.key === actionKey ? previous.ids : []);
        if (saved) ids.add(id); else ids.delete(id);
        return { key: actionKey, ids, error: '' };
      });
      success(saved ? 'Listing saved' : 'Listing removed', saved ? 'You can find it in Saved.' : 'Removed from your saved listings.', contentType === 'SERVICE_LISTING' ? 'seeker' : 'provider');
      return true;
    } catch (error) {
      if (currentKey.current === actionKey) toastError('Could not update Saved', getApiErrorMessage(error, 'Please try again.'));
      return false;
    } finally {
      pending.current.delete(pendingKey);
      setBusyState(previous => {
        if (previous.key !== actionKey) return previous;
        const ids = new Set(previous.ids); ids.delete(id);
        return { key: actionKey, ids };
      });
    }
  };
  return {
    isSaved: (id: string) => ready ? state.ids.has(id) : undefined,
    isBusy: (id: string) => busyState.key === key && busyState.ids.has(id),
    toggle, refresh, error: state.key === key ? state.error : '',
  };
}
