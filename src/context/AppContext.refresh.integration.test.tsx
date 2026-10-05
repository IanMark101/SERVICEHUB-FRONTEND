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
  if (config.url === '/services') return reply(config, { success: true, data: [listing] });
  if (config.url === '/bookings/mine') return reply(config, { success: true, data: { bookings: [], completedServices: [] } });
  return reply(config, { success: true, data: [] });
}
function Workspace() {
  const { shouldRender } = useRouteGuard(['user']);
  const { refreshServices, user, servicesStatus } = useApp();
  return shouldRender ? <><output>{user?.role}:{servicesStatus}</output><button onClick={refreshServices}>Refresh listings</button><SeekServices /></> : <p>Verifying access</p>;
}
function mount() { return render(<StrictMode><AppProvider><Workspace /></AppProvider></StrictMode>); }

describe('full refresh through real recovery, Axios, data sync and service UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAccessToken();
    localStorage.clear(); sessionStorage.clear();
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
    handler = config => config.url === '/services' ? new Promise(resolve => { resolveBrowse = () => resolve(defaults(config)); })
      : config.url === '/services/mine' ? new Promise(resolve => { resolveMine = () => resolve(defaults(config)); }) : Promise.resolve(defaults(config));
    mount();
    await waitFor(() => expect(resolveBrowse).toBeTypeOf('function'));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 650)); });
    expect(screen.getByText('seeker:loading')).toBeVisible();
    expect(screen.queryByText('No Services Found')).not.toBeInTheDocument();
    await act(async () => { resolveBrowse(); });
    await screen.findByText(listing.title);
    expect(screen.getByText('seeker:ready')).toBeVisible();
    await act(async () => { resolveMine(); });
  });

  it('shows a retryable listing error without signing out, and preserves cards on a failed later refresh', async () => {
    let failBrowse = true;
    handler = async config => { if (failBrowse && config.url === '/services') throw failure(config); return defaults(config); };
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
    await screen.findByText('Connection interrupted');
    expect(localStorage.getItem('userSession')).toContain(profile.id);
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
});
