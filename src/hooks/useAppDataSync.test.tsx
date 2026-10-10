import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSession } from '../components/auth/LoginContainer';
import { apiGetCategories } from '../api/categories.api';
import { apiBrowseServices, apiGetMyServices } from '../api/services.api';
import { apiGetRequests } from '../api/requests.api';
import { apiGetReceivedOffers, apiGetMyOffers } from '../api/offers.api';
import { apiConfirmOnlineBooking, apiGetMyEngagements } from '../api/bookings.api';
import { apiGetTransactions } from '../api/transactions.api';
import { apiGetConversations } from '../api/messages.api';
import { apiGetNotifications } from '../api/notifications.api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAppDataSync } from './useAppDataSync';
import { invalidateApiCache } from '../lib/api/responseCache';
import { socketResources } from '../lib/api/cachePolicy';

const auth = vi.hoisted(() => ({ token: null as string | null }));
vi.mock('../lib/api/axios', () => ({ getAccessToken: () => auth.token }));
vi.mock('../lib/socket', () => ({ connectSocket: vi.fn(() => null), disconnectSocket: vi.fn() }));
vi.mock('../api/categories.api', () => ({
  apiGetCategories: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

vi.mock('../api/services.api', () => ({
  apiBrowseServices: vi.fn().mockResolvedValue({ success: true, data: [] }),
  apiGetMyServices: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));
vi.mock('../api/requests.api', () => ({ apiGetRequests: vi.fn().mockResolvedValue({ success: true, data: [] }) }));
vi.mock('../api/offers.api', () => ({
  apiGetReceivedOffers: vi.fn().mockResolvedValue({ success: true, data: [] }),
  apiGetMyOffers: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));
vi.mock('../api/bookings.api', () => ({ apiGetMyEngagements: vi.fn().mockResolvedValue({ success: true, data: {} }), apiConfirmOnlineBooking: vi.fn() }));
vi.mock('../api/transactions.api', () => ({ apiGetTransactions: vi.fn().mockResolvedValue({ success: true, data: [] }) }));
vi.mock('../api/messages.api', () => ({ apiGetConversations: vi.fn().mockResolvedValue({ success: true, data: [] }) }));
vi.mock('../api/notifications.api', () => ({ apiGetNotifications: vi.fn().mockResolvedValue({ success: true, data: [] }) }));

const toastSuccess = vi.fn();
const toastError = vi.fn();
const user = { id: 'test-user', role: 'seeker', emailVerified: true } as UserSession;

describe('useAppDataSync initial marketplace loading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    auth.token = null;
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => vi.useRealTimers());

  it('keeps confirmed empty service and booking workspaces ready while tab-return requests are pending', async () => {
    auth.token = 'test-token';
    vi.mocked(apiBrowseServices).mockResolvedValueOnce({ success: true, data: [] });
    vi.mocked(apiGetMyEngagements).mockResolvedValueOnce({ success: true, data: { bookings: [], completedServices: [] } });
    const { result } = renderHook(() => useAppDataSync({ authLoading: false, isAuthenticated: true, user, toastSuccess, toastError }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.servicesStatus).toBe('ready');
    expect(result.current.engagementsStatus).toBe('ready');
    vi.mocked(apiBrowseServices).mockImplementationOnce(() => new Promise(() => {}));
    vi.mocked(apiGetMyEngagements).mockImplementationOnce(() => new Promise(() => {}));
    const serviceCalls = vi.mocked(apiBrowseServices).mock.calls.length;
    const bookingCalls = vi.mocked(apiGetMyEngagements).mock.calls.length;
    act(() => invalidateApiCache(['services', 'bookings'], 'focus'));
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    expect(apiBrowseServices).toHaveBeenCalledTimes(serviceCalls + 1);
    expect(apiGetMyEngagements).toHaveBeenCalledTimes(bookingCalls + 1);
    expect(result.current.services).toEqual([]);
    expect(result.current.jobEngagements).toEqual([]);
    expect(result.current.servicesStatus).toBe('ready');
    expect(result.current.engagementsStatus).toBe('ready');
  });

  it('does not regress to initial skeletons when retrying a failed background refresh', async () => {
    auth.token = 'test-token';
    vi.mocked(apiBrowseServices).mockResolvedValueOnce({ success: true, data: [] });
    vi.mocked(apiGetMyEngagements).mockResolvedValueOnce({ success: true, data: { bookings: [], completedServices: [] } });
    const { result } = renderHook(() => useAppDataSync({ authLoading: false, isAuthenticated: true, user, toastSuccess, toastError }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    vi.mocked(apiBrowseServices).mockRejectedValueOnce(new Error('Offline'));
    vi.mocked(apiGetMyEngagements).mockRejectedValueOnce(new Error('Offline'));
    await act(async () => { await Promise.all([result.current.syncPublicServices(), result.current.syncEngagements()]); });
    expect(result.current.servicesStatus).toBe('error');
    expect(result.current.engagementsStatus).toBe('error');
    vi.mocked(apiBrowseServices).mockImplementationOnce(() => new Promise(() => {}));
    vi.mocked(apiGetMyEngagements).mockImplementationOnce(() => new Promise(() => {}));
    act(() => { void result.current.syncPublicServices(); void result.current.syncEngagements(); });
    expect(result.current.servicesStatus).toBe('error');
    expect(result.current.engagementsStatus).toBe('error');
  });

  it.each(['browse-first', 'mine-first'])('merges public and private listings in either response order (%s)', async order => {
    let browse!: (value: unknown) => void;
    let mine!: (value: unknown) => void;
    vi.mocked(apiBrowseServices).mockReturnValueOnce(new Promise(resolve => { browse = resolve; }));
    vi.mocked(apiGetMyServices).mockReturnValueOnce(new Promise(resolve => { mine = resolve; }));
    const publicListing = { id: 'public', providerId: 'another-user', title: 'Public service', isAvailable: true, status: 'ACTIVE', category: { name: 'Plumbing' }, provider: { name: 'Other User' } };
    const privateListing = { ...publicListing, id: 'private', providerId: user.id, title: 'My hidden service', status: 'HIDDEN' };
    const { result } = renderHook(() => useAppDataSync({ authLoading: false, isAuthenticated: true, user, toastSuccess, toastError }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const finishBrowse = () => browse({ success: true, data: [publicListing] });
    const finishMine = () => mine({ success: true, data: [privateListing] });
    await act(async () => { (order === 'browse-first' ? finishBrowse : finishMine)(); });
    await act(async () => { (order === 'browse-first' ? finishMine : finishBrowse)(); });
    expect(result.current.services.map(service => service.id).sort()).toEqual(['private', 'public']);
    expect(result.current.servicesStatus).toBe('ready');
  });

  it('ignores an older failed refresh after a newer listing request succeeds', async () => {
    let rejectEarlier!: (reason: Error) => void;
    vi.mocked(apiBrowseServices).mockReturnValueOnce(new Promise((_, reject) => { rejectEarlier = reject; }));
    const { result } = renderHook(() => useAppDataSync({ authLoading: false, isAuthenticated: true, user, toastSuccess, toastError }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    await act(async () => { await result.current.syncPublicServices(); });
    expect(result.current.servicesStatus).toBe('ready');
    await act(async () => { rejectEarlier(new Error('Old request failed')); });
    expect(result.current.servicesStatus).toBe('ready');
  });

  it('skips public pages and loads categories and services after authentication', () => {
    const { rerender } = renderHook(
      ({ authLoading, isAuthenticated, user: currentUser }) => useAppDataSync({
        authLoading,
        isAuthenticated,
        user: currentUser,
        toastSuccess,
        toastError,
      }),
      { initialProps: { authLoading: true, isAuthenticated: false, user: null as UserSession | null } },
    );

    act(() => vi.runOnlyPendingTimers());
    rerender({ authLoading: false, isAuthenticated: false, user: null });
    act(() => vi.runOnlyPendingTimers());

    expect(apiGetCategories).not.toHaveBeenCalled();
    expect(apiBrowseServices).not.toHaveBeenCalled();
    expect(apiGetMyServices).not.toHaveBeenCalled();

    rerender({ authLoading: false, isAuthenticated: true, user });
    act(() => vi.runOnlyPendingTimers());

    expect(apiGetCategories).toHaveBeenCalledTimes(1);
    expect(apiBrowseServices).toHaveBeenCalledTimes(1);
    expect(apiGetMyServices).toHaveBeenCalledTimes(1);
  });

  it('does not load private workspace data for an authenticated email-unverified user', () => {
    auth.token = 'unverified-access-token';
    renderHook(() => useAppDataSync({
      authLoading: false, isAuthenticated: true,
      user: { ...user, emailVerified: false }, toastSuccess, toastError,
    }));
    act(() => vi.runOnlyPendingTimers());
    expect(apiGetMyServices).not.toHaveBeenCalled();
    expect(apiGetRequests).not.toHaveBeenCalled();
    expect(apiGetMyEngagements).not.toHaveBeenCalled();
    expect(apiGetNotifications).not.toHaveBeenCalled();
    expect(connectSocket).not.toHaveBeenCalled();
  });

  it('does not duplicate the authenticated load during Strict Mode effect replay', () => {
    renderHook(() => useAppDataSync({
      authLoading: false,
      isAuthenticated: true,
      user,
      toastSuccess,
      toastError,
    }), { wrapper: StrictMode });

    act(() => vi.runOnlyPendingTimers());

    expect(apiGetCategories).toHaveBeenCalledTimes(1);
    expect(apiBrowseServices).toHaveBeenCalledTimes(1);
    expect(apiGetMyServices).toHaveBeenCalledTimes(1);
  });

  it('keeps the same socket through profile updates, workspace switches, and public-page rerenders', () => {
    auth.token = 'test-access-token';
    vi.mocked(connectSocket).mockReturnValue({ on: vi.fn(), off: vi.fn() } as unknown as ReturnType<typeof connectSocket>);
    const { rerender } = renderHook(
      ({ currentUser, authenticated }) => useAppDataSync({
        authLoading: false, isAuthenticated: authenticated, user: currentUser, toastSuccess, toastError,
      }),
      { initialProps: { currentUser: user as UserSession | null, authenticated: true } },
    );
    for (const role of ['provider', 'seeker', 'provider', 'seeker'] as const) {
      rerender({ currentUser: { ...user, role }, authenticated: true });
    }
    expect(connectSocket).toHaveBeenCalledTimes(1);
    expect(disconnectSocket).not.toHaveBeenCalled();
    rerender({ currentUser: null, authenticated: false });
    expect(disconnectSocket).toHaveBeenCalledTimes(1);
    expect(connectSocket).toHaveBeenCalledTimes(1);
  });

  it('does not request a marketplace-only listing for an authenticated administrator', () => {
    auth.token = 'admin-access-token';
    renderHook(() => useAppDataSync({
      authLoading: false,
      isAuthenticated: true,
      user: { id: 'admin-id', role: 'admin' } as UserSession,
      toastSuccess,
      toastError,
    }));

    act(() => vi.runOnlyPendingTimers());

    expect(apiBrowseServices).toHaveBeenCalledTimes(1);
    expect(apiGetMyServices).not.toHaveBeenCalled();
    expect(apiGetRequests).not.toHaveBeenCalled();
    expect(apiGetReceivedOffers).not.toHaveBeenCalled();
    expect(apiGetMyOffers).not.toHaveBeenCalled();
    expect(apiGetMyEngagements).not.toHaveBeenCalled();
    expect(apiGetTransactions).not.toHaveBeenCalled();
    expect(apiGetConversations).not.toHaveBeenCalled();
    expect(apiGetNotifications).toHaveBeenCalled();
  });

  it('refreshes the shared active category source after an Admin category event', async () => {
    auth.token = 'seeker-access-token';
    const listeners = new Map<string, () => void>();
    vi.mocked(connectSocket).mockReturnValue({
      on: vi.fn((event: string, handler: () => void) => { listeners.set(event, handler); }),
      off: vi.fn(),
    } as unknown as ReturnType<typeof connectSocket>);
    vi.mocked(apiGetCategories)
      .mockResolvedValueOnce({ success: true, data: [{ id: 'category-id', name: 'Plumbing' }] })
      .mockResolvedValueOnce({ success: true, data: [{ id: 'category-id', name: 'Plumbing Repair' }] });

    const { result } = renderHook(() => useAppDataSync({
      authLoading: false,
      isAuthenticated: true,
      user,
      toastSuccess,
      toastError,
    }));
    await act(async () => { vi.runOnlyPendingTimers(); });
    expect(result.current.dbCategories).toEqual([{ id: 'category-id', name: 'Plumbing' }]);

    await act(async () => {
      invalidateApiCache(socketResources('COMMUNITY_CATEGORIES_CHANGED'), 'socket');
      vi.advanceTimersByTime(200);
    });
    expect(result.current.dbCategories).toEqual([{ id: 'category-id', name: 'Plumbing Repair' }]);
  });

  it('coalesces the socket and cache refresh paths into one read per resource', async () => {
    auth.token = 'test-access-token';
    const listeners = new Map<string, (data?: unknown) => void>();
    vi.mocked(connectSocket).mockReturnValue({
      on: vi.fn((event: string, handler: (data?: unknown) => void) => { listeners.set(event, handler); }),
      off: vi.fn(),
    } as unknown as ReturnType<typeof connectSocket>);
    renderHook(() => useAppDataSync({ authLoading: false, isAuthenticated: true, user, toastSuccess, toastError }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    vi.clearAllMocks();
    const emit = (event: string, data?: unknown) => {
      // socket.ts's catch-all runs first, followed by feature listeners.
      invalidateApiCache(socketResources(event, data), 'socket');
      listeners.get(event)?.(data);
    };
    await act(async () => {
      emit('ENGAGEMENT_CHANGED', { bookingId: 'booking', type: 'started' });
      emit('notification');
      emit('ENGAGEMENT_CHANGED', { bookingId: 'booking', type: 'provider_queue_changed' });
      emit('queue_update', { serviceId: 'service', delta: 0, currentSize: 1 });
      await vi.advanceTimersByTimeAsync(500);
    });
    for (const load of [apiGetMyEngagements, apiGetNotifications, apiGetConversations, apiBrowseServices]) {
      expect(load).toHaveBeenCalledTimes(1);
    }
    for (const load of [apiGetRequests, apiGetReceivedOffers, apiGetMyOffers, apiGetTransactions]) {
      expect(load).not.toHaveBeenCalled();
    }
  });

  it('does not let an earlier booking read undo a confirmed action', async () => {
    auth.token = 'test-access-token';
    const booking = { id: 'booking', seekerId: user.id, providerId: 'provider', status: 'ACCEPTED', started: false };
    vi.mocked(apiGetMyEngagements).mockResolvedValueOnce({ success: true, data: { bookings: [booking] } });
    const { result } = renderHook(() => useAppDataSync({ authLoading: false, isAuthenticated: true, user, toastSuccess, toastError }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    let finish!: (value: unknown) => void;
    vi.mocked(apiGetMyEngagements).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    let pending!: Promise<void>;
    act(() => { pending = result.current.syncEngagements(); });
    act(() => { result.current.applyBookingAction({ ...booking, status: 'ONGOING', started: true }); });
    await act(async () => { finish({ success: true, data: { bookings: [booking] } }); await pending; });
    expect(result.current.jobEngagements[0]).toMatchObject({ bookingStatus: 'ONGOING', started: true });
  });

  it('shows a received offer on its socket event without waiting for sent offers', async () => {
    auth.token = 'seeker-access-token';
    const listeners = new Map<string, () => void>();
    vi.mocked(connectSocket).mockReturnValue({
      on: vi.fn((event: string, handler: () => void) => { listeners.set(event, handler); }),
      off: vi.fn(),
    } as unknown as ReturnType<typeof connectSocket>);
    vi.mocked(apiGetMyOffers).mockImplementation(() => new Promise(() => {}));
    vi.mocked(apiGetReceivedOffers)
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: [{
        id: 'offer-1', requestId: 'request-1', providerId: 'provider-1',
        offeredPrice: 500, status: 'PENDING', request: { seekerId: user.id, title: 'Repair sink' },
      }] });

    const { result } = renderHook(() => useAppDataSync({
      authLoading: false, isAuthenticated: true, user, toastSuccess, toastError,
    }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.bids).toEqual([]);

    await act(async () => {
      invalidateApiCache(socketResources('OFFERS_CHANGED'), 'socket');
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(result.current.bids).toMatchObject([{
      id: 'offer-1', seekerId: user.id, requestTitle: 'Repair sink', status: 'pending',
    }]);
  });

  it('keeps a pending GCash return until server verification creates the queue booking', async () => {
    window.history.replaceState({}, '', '/seeker/seeker-activity');
    localStorage.setItem('pending_payment_intent_id', 'pi_return_test');
    localStorage.setItem('pending_service_id', 'service-test');
    vi.mocked(apiConfirmOnlineBooking)
      .mockResolvedValueOnce({ success: true, data: { status: 'PENDING' } })
      .mockResolvedValueOnce({ success: true, data: { status: 'SUCCEEDED' } });

    renderHook(() => useAppDataSync({
      authLoading: false, isAuthenticated: true, user, toastSuccess, toastError,
    }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(apiConfirmOnlineBooking).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('pending_payment_intent_id')).toBe('pi_return_test');

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(apiConfirmOnlineBooking).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('pending_payment_intent_id')).toBeNull();
    expect(toastSuccess).toHaveBeenCalledWith('Payment confirmed', expect.stringContaining('provider queue'));
  });
});
