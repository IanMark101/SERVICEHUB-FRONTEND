import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { useApp } from '../context/AppContext';
import { apiGetPublicProfile, apiGetTrustHistory } from '../api/auth.api';
import { useUserProfile } from './useUserProfile';
import type { UserSession } from '../components/auth/LoginContainer';
import { invalidateApiCache, responseCache, startCacheRuntime } from '../lib/api/responseCache';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/profile/other-user' }));
vi.mock('../api/auth.api', () => ({ apiGetPublicProfile: vi.fn(), apiGetTrustHistory: vi.fn(), apiUpdateProfile: vi.fn() }));
vi.mock('../api/ai.api', () => ({ apiGetProviderSummary: vi.fn() }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

const target = { id: 'other-user', role: 'seeker', firstName: 'John', lastName: 'Client' } as UserSession;
const events = [{ id: 'event', delta: 5, reason: 'Service completed and confirmed', scoreBefore: 50, scoreAfter: 55, createdAt: '2026-10-07T05:00:00Z' }];

describe('viewed profile trust history', () => {
  afterEach(() => { vi.restoreAllMocks(); responseCache.clear(); });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ user: { id: 'viewer-user', role: 'seeker' }, isDark: false } as unknown as ReturnType<typeof useApp>);
    vi.mocked(apiGetPublicProfile).mockResolvedValue({ success: true, data: { id: target.id, name: 'John Client', trustScore: 55 } });
  });
  it('fetches and displays another user’s recorded log for an ordinary community member', async () => {
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: events });
    const { result } = renderHook(() => useUserProfile({ targetUser: target, initialTab: 'trust' }));
    await waitFor(() => expect(result.current.trustHistory).toEqual(events));
    expect(apiGetTrustHistory).toHaveBeenCalledWith(target.id);
    expect(result.current.trustHistoryLoading).toBe(false);
    expect(result.current.trustHistoryError).toBe(false);
  });
  it('makes a rejected fetch visible and reloads the real log on retry', async () => {
    vi.mocked(apiGetTrustHistory).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ success: true, data: events });
    const { result } = renderHook(() => useUserProfile({ targetUser: target }));
    await waitFor(() => expect(result.current.trustHistoryError).toBe(true));
    act(() => result.current.retryTrustHistory());
    await waitFor(() => expect(result.current.trustHistory).toEqual(events));
    expect(result.current.trustHistoryError).toBe(false);
  });
  it('ignores an old target’s delayed trust response after switching profiles', async () => {
    let resolve!: (result: { success: boolean; data: typeof events }) => void;
    vi.mocked(apiGetTrustHistory).mockReturnValueOnce(new Promise(done => { resolve = done; })).mockResolvedValueOnce({ success: true, data: [] });
    const { result, rerender } = renderHook(({ targetUser }) => useUserProfile({ targetUser }), { initialProps: { targetUser: target } });
    await waitFor(() => expect(apiGetTrustHistory).toHaveBeenCalledWith(target.id));
    rerender({ targetUser: { ...target, id: 'different-user' } });
    await waitFor(() => expect(result.current.trustHistoryLoading).toBe(false));
    await act(async () => { resolve({ success: true, data: events }); });
    expect(result.current.trustHistory).toEqual([]);
    expect(result.current.trustHistoryError).toBe(false);
  });

  it('keeps the loaded profile, selected tab and trust history visible when the browser regains focus', async () => {
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    startCacheRuntime();
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: events });
    const { result } = renderHook(() => useUserProfile({ targetUser: target }));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading || result.current.trustHistoryLoading).toBe(false));
    act(() => result.current.setActiveTab('reviews'));

    let finishProfile!: (value: Awaited<ReturnType<typeof apiGetPublicProfile>>) => void;
    let finishHistory!: (value: Awaited<ReturnType<typeof apiGetTrustHistory>>) => void;
    vi.mocked(apiGetPublicProfile).mockReturnValueOnce(new Promise(resolve => { finishProfile = resolve; }));
    vi.mocked(apiGetTrustHistory).mockReturnValueOnce(new Promise(resolve => { finishHistory = resolve; }));
    now += 10_001;
    act(() => window.dispatchEvent(new Event('focus')));
    await waitFor(() => expect(apiGetPublicProfile).toHaveBeenCalledTimes(2));
    expect(result.current.loading).toBe(false);
    expect(result.current.displayName).toBe('John Client');
    expect(result.current.activeTab).toBe('reviews');
    expect(result.current.trustHistoryLoading).toBe(false);
    expect(result.current.trustHistory).toEqual(events);

    await act(async () => {
      finishProfile({ success: true, data: { id: target.id, name: 'John Updated', trustScore: 60 } });
      finishHistory({ success: true, data: [] });
    });
    expect(result.current.displayName).toBe('John Updated');
    expect(result.current.trustHistory).toEqual([]);
    expect(result.current.activeTab).toBe('reviews');
    expect(result.current.loading).toBe(false);
  });

  it('keeps an already loaded empty trust history from becoming a loading state on refresh', async () => {
    vi.mocked(apiGetTrustHistory).mockResolvedValueOnce({ success: true, data: [] }).mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useUserProfile({ targetUser: target }));
    await waitFor(() => expect(result.current.trustHistoryLoading).toBe(false));
    act(() => invalidateApiCache(['profiles'], 'focus'));
    await waitFor(() => expect(apiGetTrustHistory).toHaveBeenCalledTimes(2));
    expect(result.current.trustHistoryLoading).toBe(false);
    expect(result.current.trustHistory).toEqual([]);
  });

  it('retains loaded details on a failed background refresh and exposes a retry', async () => {
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: events });
    const { result } = renderHook(() => useUserProfile({ targetUser: target }));
    await waitFor(() => expect(result.current.loading || result.current.trustHistoryLoading).toBe(false));
    vi.mocked(apiGetPublicProfile).mockRejectedValueOnce(new Error('Offline'));
    vi.mocked(apiGetTrustHistory).mockRejectedValueOnce(new Error('Offline'));
    act(() => invalidateApiCache(['profiles'], 'online'));
    await waitFor(() => expect(result.current.profileRefreshError).toBe(true));
    expect(result.current.loading).toBe(false);
    expect(result.current.profileLoadError).toBe(false);
    expect(result.current.displayName).toBe('John Client');
    expect(result.current.trustHistoryError).toBe(true);
    expect(result.current.trustHistory).toEqual(events);
    act(() => result.current.retryProfile());
    await waitFor(() => expect(result.current.profileRefreshError || result.current.trustHistoryError).toBe(false));
  });

  it('withdraws an unavailable profile rather than retaining its old data after a 404', async () => {
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: events });
    const { result } = renderHook(() => useUserProfile({ targetUser: target }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(apiGetPublicProfile).mockRejectedValueOnce(new AxiosError('Not found', undefined, undefined, undefined, {
      status: 404, statusText: 'Not Found', data: {}, headers: {}, config: { headers: new AxiosHeaders() },
    }));
    act(() => invalidateApiCache(['profiles'], 'socket'));
    await waitFor(() => expect(result.current.profileLoadError).toBe(true));
    expect(result.current.profile).toBeNull();
    expect(result.current.profileRefreshError).toBe(false);
  });

  it('ignores an old profile response and hides the old person while the next profile loads', async () => {
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: [] });
    let finishOld!: (value: Awaited<ReturnType<typeof apiGetPublicProfile>>) => void;
    vi.mocked(apiGetPublicProfile).mockReturnValueOnce(new Promise(resolve => { finishOld = resolve; }));
    const { result, rerender } = renderHook(({ targetUser }) => useUserProfile({ targetUser }), { initialProps: { targetUser: target } });
    await waitFor(() => expect(apiGetPublicProfile).toHaveBeenCalledWith(target.id));
    vi.mocked(apiGetPublicProfile).mockResolvedValueOnce({ success: true, data: { id: 'different-user', name: 'Different Person' } });
    rerender({ targetUser: { ...target, id: 'different-user' } });
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.displayName).toBe('Different Person'));
    await act(async () => { finishOld({ success: true, data: { id: target.id, name: 'Old Person' } }); });
    expect(result.current.displayName).toBe('Different Person');
  });

  it('follows URL section changes without refetching profile data', async () => {
    vi.mocked(apiGetTrustHistory).mockResolvedValue({ success: true, data: [] });
    const { result, rerender } = renderHook(({ tab }: { tab: 'overview' | 'reviews' | 'trust' }) => useUserProfile({ targetUser: target, initialTab: tab }), { initialProps: { tab: 'overview' } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ tab: 'reviews' });
    await waitFor(() => expect(result.current.activeTab).toBe('reviews'));
    rerender({ tab: 'trust' });
    await waitFor(() => expect(result.current.activeTab).toBe('trust'));
    expect(result.current.loading).toBe(false);
    expect(apiGetPublicProfile).toHaveBeenCalledOnce();
  });
});
