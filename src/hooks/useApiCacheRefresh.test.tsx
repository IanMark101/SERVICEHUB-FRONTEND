import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { invalidateApiCache } from '../lib/api/responseCache';
import { useApiCacheRefresh } from './useApiCacheRefresh';

describe('mounted view cache synchronization', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('coalesces a socket burst and refreshes only the affected mounted view', async () => {
    const refresh = vi.fn();
    const { unmount } = renderHook(() => useApiCacheRefresh(['requests'], refresh));
    act(() => {
      invalidateApiCache(['categories'], 'socket');
      invalidateApiCache(['requests'], 'socket');
      invalidateApiCache(['requests', 'offers'], 'socket');
    });
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith({ tags: ['requests', 'offers'], reason: 'socket' });
    unmount();
    act(() => invalidateApiCache(['requests'], 'mutation'));
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('uses the current loader and cancels refreshes while a view is disabled', async () => {
    const oldRefresh = vi.fn();
    const freshRefresh = vi.fn();
    const { rerender } = renderHook(({ refresh, enabled }) => useApiCacheRefresh(['admin'], refresh, enabled),
      { initialProps: { refresh: oldRefresh, enabled: true } });
    act(() => invalidateApiCache(['admin'], 'focus'));
    rerender({ refresh: freshRefresh, enabled: true });
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(oldRefresh).not.toHaveBeenCalled();
    expect(freshRefresh).toHaveBeenCalledTimes(1);
    act(() => invalidateApiCache(['admin'], 'online'));
    rerender({ refresh: freshRefresh, enabled: false });
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(freshRefresh).toHaveBeenCalledTimes(1);
  });
});
