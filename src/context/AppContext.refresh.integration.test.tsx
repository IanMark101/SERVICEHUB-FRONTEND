import React, { StrictMode } from 'react';
import axios, { AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useApp } from './AppContext';
import { api, clearAccessToken } from '../lib/api/axios';
import { useRouteGuard } from '../hooks/useRouteGuard';
import SeekServices from '../components/seeker/SeekServices';

const mocks = vi.hoisted(() => ({ pathname: '/seeker/seek-services', router: { replace: vi.fn(), push: vi.fn() }, toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname, useRouter: () => mocks.router }));
vi.mock('../lib/socket', () => ({ connectSocket: vi.fn(() => null), disconnectSocket: vi.fn(), joinServiceRoom: vi.fn() }));
vi.mock('../hooks/useSeekerActions', () => ({ useSeekerActions: () => ({}) }));
vi.mock('../hooks/useProviderActions', () => ({ useProviderActions: () => ({}) }));
vi.mock('../hooks/useSharedActions', () => ({ useSharedActions: () => ({}) }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => mocks.toast }));
vi.mock('../components/moderation/ContentCaseAction', () => ({ default: () => null }));

const profile = { id: 'refresh-account', name: 'Refresh Account', role: 'user', emailVerified: true, verificationStatus: 'VERIFIED', moderationStatus: 'ACTIVE' };
const listing = { id: 'refresh-listing', providerId: 'other-provider', title: 'REFRESH TEST SERVICE', description: 'Test service', price: 500, status: 'ACTIVE', isAvailable: true, category: { name: 'Cleaning' }, provider: { id: 'other-provider', name: 'Test Provider', trustScore: 70 }, paymentMethods: { cash: true, gcash: false } };
const originalAdapter = api.defaults.adapter;
let handler: AxiosAdapter;
let calls: string[];
function reply(config: InternalAxiosRequestConfig, data: unknown) { return { config, status: 200, statusText: 'OK', headers: new AxiosHeaders(), data }; }
function failure(config: InternalAxiosRequestConfig, status = 503) { return new axios.AxiosError('Temporary failure', 'ERR_BAD_RESPONSE', config, undefined, { ...reply(config, { success: false }), status }); }
function defaults(config: InternalAxiosRequestConfig) {
  if (config.url === '/auth/session') return reply(config, { success: true, data: { authenticated: true, accessToken: 'verified-test-token', user: profile } });
  if (config.url === '/auth/me') return reply(config, { success: true, data: { user: profile } });
  if (config.url === '/services/nearby') return reply(config, { success: true, data: { items: [listing], pagination: { page:1, limit:6, total:1, totalPages:1 } } });
  if (config.url === '/services') return reply(config, { success: true, data: [listing] });
  if (config.url === '/bookings/my-engagements') return reply(config, { success: true, data: { bookings: [], completedServices: [] } });
  return reply(config, { success: true, data: [] });
}
function Workspace() {
  const { shouldRender } = useRouteGuard(['user']);
  const { refreshServices, user, servicesStatus } = useApp();
  return shouldRender ? <><output>{user?.role}:{servicesStatus}</output><button onClick={refreshServices}>Refresh listings</button><SeekServices /></> : <p>Verifying access</p>;
}
function mount() { return render(<StrictMode><AppProvider><Workspace /></AppProvider></StrictMode>); }

function BookingWorkspace() {
  const { shouldRender } = useRouteGuard(['user']);
  const { jobEngagements, engagementsStatus, refreshEngagements } = useApp();
  return shouldRender ? <><output aria-label="Booking load status">{engagementsStatus}</output><button onClick={() => { void refreshEngagements(); }}>Refresh bookings</button>{jobEngagements.map(booking => <h2 key={booking.id}>{booking.title}</h2>)}</> : <p>Verifying access</p>;
}
const testBooking = { id: 'refresh-booking', seekerId: profile.id, providerId: 'other-provider', status: 'ACCEPTED', started: false, createdAt: '2026-10-08T05:00:00.000Z', service: { title: 'OUTLET REPAIR BOOKING' } };
function bookingReply(config: InternalAxiosRequestConfig, bookings = [testBooking]) { return reply(config, { success: true, data: { bookings, completedServices: [] } }); }

describe('full refresh through real recovery, Axios, data sync and service UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAccessToken();
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('servicehub:marketplace-location:refresh-account:seeker', JSON.stringify({ point: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, radiusKm:10 }));
    mocks.pathname = '/seeker/seek-services';
    calls = [];
    handler = async config => defaults(config);
    api.defaults.adapter = async config => { calls.push(config.url!); return handler(config); };
  });
  afterEach(() => { cleanup(); clearAccessToken(); api.defaults.adapter = originalAdapter; });

  it.each(['seeker', 'provider'])('restores %s across repeated fresh mounts without a cached profile', async role => {
    localStorage.setItem('workspaceRole', role);
    for (let index = 0; index < 3; index++) {
      localStorage.removeItem('userSession'); clearAccessToken();
      const view = mount();
      await screen.findByText(listing.title);
      expect(screen.getByText(`${role}:ready`)).toBeVisible();
      expect(screen.queryByText('No Services Found')).not.toBeInTheDocument();
      expect(mocks.router.replace).not.toHaveBeenCalled();
      view.unmount();
    }
    expect(calls.filter(path => path === '/auth/session')).toHaveLength(3);
    expect(calls).not.toContain('/auth/refresh');
  });

  it('does not show an empty marketplace while browsing takes longer than 450ms, or wait for private listings', async () => {
    let resolveBrowse!: () => void;
    let resolveMine!: () => void;
    handler = config => config.url === '/services/nearby' ? new Promise(resolve => { resolveBrowse = () => resolve(defaults(config)); })
      : config.url === '/services/mine' ? new Promise(resolve => { resolveMine = () => resolve(defaults(config)); }) : Promise.resolve(defaults(config));
    mount();
    await waitFor(() => expect(resolveBrowse).toBeTypeOf('function'));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 650)); });
    expect(screen.getByText('seeker:ready')).toBeVisible();
    expect(screen.getByRole('status', { name: 'Loading services' })).toBeVisible();
    expect(screen.queryByText('No Services Found')).not.toBeInTheDocument();
    await act(async () => { resolveBrowse(); });
    await screen.findByText(listing.title);
    expect(screen.getByText('seeker:ready')).toBeVisible();
    await act(async () => { resolveMine(); });
  });

  it('shows a retryable listing error without signing out, and preserves cards on a failed later refresh', async () => {
    let failBrowse = true;
    handler = async config => { if (failBrowse && ['/services', '/services/nearby'].includes(config.url || '')) throw failure(config); return defaults(config); };
    mount();
    await screen.findByText('Services could not be loaded');
    expect(screen.queryByText('No Services Found')).not.toBeInTheDocument();
    expect(screen.getByText('seeker:error')).toBeVisible();
    failBrowse = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText(listing.title);
    failBrowse = true;
    fireEvent.click(screen.getByRole('button', { name: 'Refresh listings' }));
    await screen.findByText(/Could not refresh services/);
    expect(screen.getByText(listing.title)).toBeVisible();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it('keeps an unavailable session distinct from logout and recovers in place when retried', async () => {
    localStorage.setItem('userSession', JSON.stringify({ id: profile.id }));
    handler = async config => { if (config.url === '/auth/session') throw failure(config); return defaults(config); };
    mount();
    await screen.findByText('Service temporarily unavailable');
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(calls.filter(path => path === '/auth/session')).toHaveLength(2);
    expect(calls).not.toContain('/services');
    handler = async config => defaults(config);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText(listing.title);
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it('retries one transient session failure automatically, while a confirmed guest still goes to login', async () => {
    let first = true;
    handler = async config => { if (first && config.url === '/auth/session') { first = false; throw failure(config); } return defaults(config); };
    const view = mount();
    await screen.findByText(listing.title);
    expect(mocks.router.replace).not.toHaveBeenCalled();
    view.unmount(); clearAccessToken();
    handler = async config => reply(config, { success: true, data: { authenticated: false } });
    mount();
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith(expect.stringContaining('/login')));
    expect(screen.queryByText(listing.title)).not.toBeInTheDocument();
  });

  it('tracks the real booking fetch, preserves loaded bookings after a failed refresh, and allows recovery', async () => {
    mocks.pathname = '/seeker/seeker-activity';
    let resolveBookings!: () => void;
    handler = config => config.url === '/bookings/my-engagements' ? new Promise(resolve => { resolveBookings = () => resolve(bookingReply(config)); }) : Promise.resolve(defaults(config));
    render(<StrictMode><AppProvider><BookingWorkspace /></AppProvider></StrictMode>);
    await waitFor(() => expect(resolveBookings).toBeTypeOf('function'));
    expect(screen.getByLabelText('Booking load status')).toHaveTextContent('loading');
    await act(async () => { resolveBookings(); });
    await screen.findByText(testBooking.service.title);
    expect(screen.getByLabelText('Booking load status')).toHaveTextContent('ready');

    handler = async config => { if (config.url === '/bookings/my-engagements') throw failure(config); return defaults(config); };
    fireEvent.click(screen.getByRole('button', { name: 'Refresh bookings' }));
    await waitFor(() => expect(screen.getByLabelText('Booking load status')).toHaveTextContent('error'));
    expect(screen.getByText(testBooking.service.title)).toBeVisible();

    handler = async config => config.url === '/bookings/my-engagements' ? bookingReply(config) : defaults(config);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh bookings' }));
    await waitFor(() => expect(screen.getByLabelText('Booking load status')).toHaveTextContent('ready'));
    expect(screen.getByText(testBooking.service.title)).toBeVisible();
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it('does not let an older booking response overwrite a newer refresh or reset the confirmed load state', async () => {
    mocks.pathname = '/seeker/seeker-activity';
    handler = async config => config.url === '/bookings/my-engagements' ? bookingReply(config) : defaults(config);
    render(<StrictMode><AppProvider><BookingWorkspace /></AppProvider></StrictMode>);
    await screen.findByText(testBooking.service.title);
    const pending: Array<(bookings: typeof testBooking[]) => void> = [];
    handler = config => config.url === '/bookings/my-engagements' ? new Promise(resolve => { pending.push(bookings => resolve(bookingReply(config, bookings))); }) : Promise.resolve(defaults(config));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh bookings' }));
    await waitFor(() => expect(pending).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh bookings' }));
    await waitFor(() => expect(pending).toHaveLength(2));
    await act(async () => { pending[0]([]); });
    expect(screen.getByLabelText('Booking load status')).toHaveTextContent('ready');
    expect(screen.getByText(testBooking.service.title)).toBeVisible();
    await act(async () => { pending[1]([{ ...testBooking, service: { title: 'UPDATED OUTLET REPAIR BOOKING' } }]); });
    await screen.findByText('UPDATED OUTLET REPAIR BOOKING');
    expect(screen.getByLabelText('Booking load status')).toHaveTextContent('ready');
    expect(screen.queryByText(testBooking.service.title)).not.toBeInTheDocument();
  });
});
