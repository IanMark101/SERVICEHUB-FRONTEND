import React, { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import axios, { AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../app/(auth)/login/page';
import RegisterPage from '../app/(auth)/register/page';
import LandingLayout from '../app/(landingPage)/layout';
import Home from '../app/(landingPage)/page';
import { api, clearAccessToken, getAccessToken } from '../lib/api/axios';
import { AppProvider, useApp } from './AppContext';
import { useRouteGuard } from '../hooks/useRouteGuard';
import SeekServices from '../components/seeker/SeekServices';
import ProviderServicesPage from '../app/provider/browse-services/page';
import GetStartedPage from '../app/get-started/page';

const mocks = vi.hoisted(() => ({
  pathname: '/login',
  router: { replace: vi.fn(), push: vi.fn() },
  sync: { clearPrivateData: vi.fn(), services: [], dbCategories: [], jobRequests: [], bids: [], jobEngagements: [], categorySuggestions: [] },
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn((media: string) => ({
    // jsdom has no browser animation timeline. Auth assertions use the real
    // reduced-motion path; entrance timing has its own dedicated tests.
    media, matches: media === '(prefers-reduced-motion: reduce)', addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })) });
});
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname, useRouter: () => mocks.router }));
vi.mock('../hooks/useAppDataSync', () => ({ useAppDataSync: () => mocks.sync }));
vi.mock('../hooks/useSeekerActions', () => ({ useSeekerActions: () => ({}) }));
vi.mock('../hooks/useProviderActions', () => ({ useProviderActions: () => ({}) }));
vi.mock('../hooks/useSharedActions', () => ({ useSharedActions: () => ({}) }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => mocks.toast }));
vi.mock('../components/auth/AuthLeftPanel', () => ({ default: () => null }));

// Only the HTTP transport and Google SDK are fixtures. Recovery, Axios
// interceptors, AppProvider, LoginPage, the real form and its callbacks run together.
const profile = { id: 'session-account', name: 'Session Account', email: 'account@example.test', role: 'user', emailVerified: true, moderationStatus: 'ACTIVE' };
const defaultAdapter = api.defaults.adapter;
let cookieValid: boolean;
let sessionRequest: ((config: InternalAxiosRequestConfig) => ReturnType<AxiosAdapter>) | undefined;
let finishSessionCheck: (() => void) | undefined;
let googleRequest: ((config: InternalAxiosRequestConfig) => ReturnType<AxiosAdapter>) | undefined;
let currentProfile: typeof profile;
let transport: ReturnType<typeof vi.fn<AxiosAdapter>>;
type GoogleApi = NonNullable<NonNullable<NonNullable<Window['google']>['accounts']>['id']>;
let initialize: ReturnType<typeof vi.fn<GoogleApi['initialize']>>;

function reply(config: InternalAxiosRequestConfig, data: unknown) {
  return { status: 200, statusText: 'OK', config, headers: new AxiosHeaders(), data };
}
function SessionProbe() {
  const { user, isAuthenticated, authLoading } = useApp();
  return <output aria-label="Session identity" data-loading={authLoading}>{isAuthenticated ? `${user?.id}:${user?.role}` : 'Guest'}</output>;
}
function WorkspaceProbe() {
  const { shouldRender } = useRouteGuard(['user']);
  return shouldRender ? <h1>Authenticated workspace</h1> : null;
}
function WorkspaceContent({ role }: { role: string }) {
  const { shouldRender } = useRouteGuard(['user']);
  return shouldRender ? role === 'provider' ? <ProviderServicesPage /> : <SeekServices /> : null;
}
function mountLogin() {
  return render(<StrictMode><AppProvider><LoginPage /><SessionProbe /></AppProvider></StrictMode>);
}
async function deliverGoogleCredential() {
  await waitFor(() => expect(initialize).toHaveBeenCalled());
  const config = initialize.mock.calls.at(-1)![0];
  await act(async () => { config.callback({ credential: 'sdk-test-credential' }); });
}

describe('login/session integration through the real auth flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = '/login';
    window.history.replaceState({}, '', '/login');
    localStorage.clear();
    sessionStorage.clear();
    clearAccessToken();
    // jsdom has no viewport observer. Leave viewport events pending so the
    // real landing components must remain visible before animations initialize.
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    cookieValid = false;
    sessionRequest = undefined;
    finishSessionCheck = undefined;
    googleRequest = undefined;
    currentProfile = { ...profile };
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'test-client');
    initialize = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
    transport = vi.fn<AxiosAdapter>(async config => {
      expect(config.withCredentials).toBe(true);
      if (config.url === '/auth/session' && sessionRequest) return sessionRequest(config);
      if (config.url === '/auth/session') return reply(config, { success: true, data: cookieValid ? { authenticated: true, accessToken: 'test-access' } : { authenticated: false } });
      if (config.url === '/auth/me') {
        expect(config.headers.Authorization).toBe('Bearer test-access');
        return reply(config, { success: true, data: { user: currentProfile } });
      }
      if (config.url === '/auth/google-login' && googleRequest) return googleRequest(config);
      if (['/auth/login', '/auth/google-login'].includes(config.url!)) {
        expect(config.timeout).toBe(15_000);
        cookieValid = true;
        return reply(config, { success: true, data: { user: currentProfile, accessToken: 'test-access' } });
      }
      if (config.url === '/auth/reset-password') return reply(config, { success: false, error: 'Fixture reset refusal' });
      throw new Error(`Unexpected auth request: ${config.url}`);
    });
    api.defaults.adapter = transport;
  });

  it.each([
    { path: '/login', Page: LoginPage, heading: 'Sign In' },
    { path: '/register', Page: RegisterPage, heading: 'Create an Account' },
  ])('renders an editable $path form before session recovery finishes', async ({ path, Page, heading }) => {
    mocks.pathname = path;
    localStorage.setItem('userSession', JSON.stringify({ id: 'saved-account' }));
    let complete!: () => void;
    sessionRequest = config => new Promise(resolve => {
      complete = () => resolve(reply(config, { success: true, data: { authenticated: false } }));
      finishSessionCheck = complete;
    });
    render(<StrictMode><AppProvider><Page /><SessionProbe /></AppProvider></StrictMode>);
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(document.querySelector('.brand-loading')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Session identity')).toHaveAttribute('data-loading', 'true');
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: profile.email } });
    await waitFor(() => expect(complete).toBeTypeOf('function'));
    await act(async () => { complete(); });
    expect(screen.getByLabelText('Email')).toHaveValue(profile.email);
    expect(screen.getByLabelText('Session identity')).toHaveAttribute('data-loading', 'false');
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it.each(['seeker', 'provider', 'admin'])('still redirects a restored %s session from registration', async role => {
    mocks.pathname = '/register';
    cookieValid = true;
    localStorage.setItem('userSession', JSON.stringify({ id: profile.id }));
    localStorage.setItem('workspaceRole', role);
    if (role === 'admin') currentProfile = { ...profile, role: 'admin' };
    render(<StrictMode><AppProvider><RegisterPage /></AppProvider></StrictMode>);
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith(`/${role}`));
  });

  it.each([
    { path: '/login', Page: LoginPage, heading: 'Sign In' },
    { path: '/register', Page: RegisterPage, heading: 'Create an Account' },
  ])('keeps the $path form and entered values after session recovery fails', async ({ path, Page, heading }) => {
    mocks.pathname = path;
    localStorage.setItem('userSession', JSON.stringify({ id: 'cached-account', role: 'seeker' }));
    let fail!: () => void;
    sessionRequest = () => new Promise((_, reject) => {
      fail = () => reject(new Error('Session recovery unavailable'));
      finishSessionCheck = fail;
    });
    render(<StrictMode><AppProvider><Page /><SessionProbe /></AppProvider></StrictMode>);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: profile.email } });
    await waitFor(() => expect(fail).toBeTypeOf('function'));
    await act(async () => { fail(); });
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveValue(profile.email);
    expect(screen.getByLabelText('Session identity')).toHaveAttribute('data-loading', 'false');
    expect(screen.getByLabelText('Session identity')).toHaveTextContent('Guest');
    expect(screen.queryByText('Connection interrupted')).not.toBeInTheDocument();
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(initialize).toHaveBeenCalledTimes(1);

    if (path === '/login') {
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Example-password-1!' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/seeker'));
      expect(screen.getByLabelText('Session identity')).toHaveTextContent('session-account:seeker');
      expect(getAccessToken()).toBe('test-access');
    }
  });

  it.each([
    { query: 'reason=session-expired', text: 'Your session ended' },
    { query: 'reason=account-deleted', text: 'Your account has been deleted' },
    { query: 'reason=password-changed', text: 'Password changed successfully' },
    { query: 'mode=forgot', text: 'Forgot Password' },
    { query: 'resetToken=fixture-reset-token', text: 'Reset Password' },
  ])('hydrates the public form without errors for $query', async ({ query, text }) => {
    const browserWindow = window;
    browserWindow.history.replaceState({}, '', `/login?${query}`);
    const element = <StrictMode><AppProvider><LoginPage /></AppProvider></StrictMode>;
    let html: string;
    vi.stubGlobal('window', undefined);
    try { html = renderToString(element); }
    finally { vi.stubGlobal('window', browserWindow); }
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const hydrationErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => { root = hydrateRoot(container, element, { onRecoverableError: error => hydrationErrors.push(error) }); });
      expect(query.startsWith('reason=') ? screen.getByText(text, { exact: true }) : screen.getByRole('heading', { name: text })).toBeVisible();
      expect(document.querySelector('.brand-loading--page')).not.toBeInTheDocument();
      expect(hydrationErrors).toEqual([]);
      if (query.startsWith('reason=')) {
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: profile.email } });
        expect(screen.getByText(text, { exact: true })).toBeVisible();
      }
    } finally {
      await act(async () => { root?.unmount(); });
      container.remove();
    }
  });

  it('shows the expired-session notice only after a cached session is confirmed absent', async () => {
    localStorage.setItem('userSession', JSON.stringify({ id: 'expired-account', role: 'seeker' }));
    let complete!: () => void;
    sessionRequest = config => new Promise(resolve => {
      complete = () => resolve(reply(config, { success: true, data: { authenticated: false } }));
      finishSessionCheck = complete;
    });
    mountLogin();
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    expect(screen.queryByText('Your session ended')).not.toBeInTheDocument();
    await waitFor(() => expect(complete).toBeTypeOf('function'));
    await act(async () => { complete(); });
    expect(screen.getByText('Your session ended')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  it('retains the token when submitting a legacy reset link initialized after hydration', async () => {
    window.history.replaceState({}, '', '/login?resetToken=fixture-reset-token');
    mountLogin();
    await screen.findByRole('heading', { name: 'Reset Password' });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), { target: { value: 'Example-password-1!' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password', { exact: true }), { target: { value: 'Example-password-1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    await waitFor(() => expect(transport.mock.calls.some(([config]) => config.url === '/auth/reset-password')).toBe(true));
    const request = transport.mock.calls.find(([config]) => config.url === '/auth/reset-password')![0];
    expect(JSON.parse(request.data)).toMatchObject({ token: 'fixture-reset-token', password: 'Example-password-1!', confirmPassword: 'Example-password-1!' });
  });

  it.each([
    { method: 'email', path: '/login', Page: LoginPage },
    { method: 'google', path: '/login', Page: LoginPage },
    { method: 'google', path: '/register', Page: RegisterPage },
  ])('completes $method sign-in on $path while an earlier session check remains pending', async ({ method, path, Page }) => {
    mocks.pathname = path;
    localStorage.setItem('userSession', JSON.stringify({ id: 'saved-account' }));
    let complete!: () => void;
    sessionRequest = config => new Promise(resolve => {
      complete = () => resolve(reply(config, { success: true, data: { authenticated: false } }));
      finishSessionCheck = complete;
    });
    render(<StrictMode><AppProvider><Page /><SessionProbe /></AppProvider></StrictMode>);
    await waitFor(() => expect(complete).toBeTypeOf('function'));
    if (method === 'email') {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: profile.email } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Example-password-1!' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    } else await deliverGoogleCredential();
    await waitFor(() => expect(screen.getByLabelText('Session identity')).toHaveTextContent('session-account:seeker'));
    expect(screen.getByLabelText('Session identity')).toHaveAttribute('data-loading', 'false');
    expect(mocks.router.replace).toHaveBeenCalledWith('/seeker');
    await act(async () => { complete(); });
    expect(screen.getByLabelText('Session identity')).toHaveTextContent('session-account:seeker');
    expect(getAccessToken()).toBe('test-access');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
  });
  afterEach(async () => {
    cleanup();
    await act(async () => { await Promise.resolve(); finishSessionCheck?.(); });
    clearAccessToken();
    api.defaults.adapter = defaultAdapter;
    delete window.google;
    document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]').forEach(script => script.remove());
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each(['seeker', 'provider'])('restores a cookie-only %s session on a protected route and survives a fresh mount', async role => {
    cookieValid = true;
    mocks.pathname = `/${role}`;
    localStorage.setItem('workspaceRole', role);
    const first = render(<StrictMode><AppProvider><WorkspaceProbe /><SessionProbe /></AppProvider></StrictMode>);
    await screen.findByRole('heading', { name: 'Authenticated workspace' });
    expect(screen.getByLabelText('Session identity')).toHaveTextContent(`session-account:${role}`);
    expect(transport.mock.calls.map(([config]) => config.url)).toEqual(['/auth/session', '/auth/me']);
    first.unmount();
    clearAccessToken();
    localStorage.removeItem('userSession');
    mocks.router.replace.mockClear();
    render(<StrictMode><AppProvider><WorkspaceProbe /><SessionProbe /></AppProvider></StrictMode>);
    await screen.findByRole('heading', { name: 'Authenticated workspace' });
    expect(transport.mock.calls.map(([config]) => config.url)).toEqual(['/auth/session', '/auth/me', '/auth/session', '/auth/me']);
    expect(getAccessToken()).toBe('test-access');
  });

  it('lets a visitor without a cookie sign in using the real email/password form', async () => {
    mountLogin();
    await screen.findByRole('heading', { name: 'Sign In' });
    expect(screen.queryByText('Your session ended')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: profile.email } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Example-password-1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/seeker'));
    expect(getAccessToken()).toBe('test-access');
    expect(screen.getByLabelText('Session identity')).toHaveTextContent('session-account:seeker');
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
    expect(transport.mock.calls.map(([config]) => config.url)).toEqual(['/auth/login']);
  });

  it('opens Get started and the sign-in form from a guest landing page without contacting the session API', async () => {
    mocks.pathname = '/';
    const view = render(<StrictMode><AppProvider><LandingLayout><Home /><SessionProbe /></LandingLayout></AppProvider></StrictMode>);
    await waitFor(() => expect(screen.getByLabelText('Session identity')).toHaveAttribute('data-loading', 'false'));
    expect(transport).not.toHaveBeenCalled();
    mocks.pathname = '/get-started';
    view.rerender(<StrictMode><AppProvider><GetStartedPage /></AppProvider></StrictMode>);
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/register'));
    mocks.pathname = '/login';
    view.rerender(<StrictMode><AppProvider><LoginPage /></AppProvider></StrictMode>);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    expect(transport).not.toHaveBeenCalled();
  });

  it('opens registration when Get started cannot recover a saved session, keeping the hint for a later retry', async () => {
    mocks.pathname = '/get-started';
    localStorage.setItem('userSession', JSON.stringify({ id: 'saved-account' }));
    sessionRequest = () => Promise.reject(new axios.AxiosError('Backend unavailable', 'ERR_NETWORK'));
    const view = render(<StrictMode><AppProvider><GetStartedPage /></AppProvider></StrictMode>);
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledExactlyOnceWith('/register'));
    expect(screen.queryByText('Connection interrupted')).not.toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
    mocks.pathname = '/login';
    view.rerender(<StrictMode><AppProvider><LoginPage /></AppProvider></StrictMode>);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  it('completes Google sign-in, updates the session, and redirects to the selected provider workspace', async () => {
    localStorage.setItem('workspaceRole', 'provider');
    mountLogin();
    await screen.findByRole('heading', { name: 'Sign In' });
    await deliverGoogleCredential();
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/provider'));
    expect(getAccessToken()).toBe('test-access');
    expect(screen.getByLabelText('Session identity')).toHaveTextContent('session-account:provider');
    const googleCall = transport.mock.calls.find(([config]) => config.url === '/auth/google-login')!;
    expect(JSON.parse(googleCall[0].data)).toEqual({ token: 'sdk-test-credential' });
  });

  it('shows progress while Google completes and ignores duplicate credentials', async () => {
    let complete!: () => void;
    googleRequest = config => new Promise(resolve => { complete = () => resolve(reply(config, { success: true, data: { user: profile, accessToken: 'test-access' } })); });
    mountLogin();
    await screen.findByRole('heading', { name: 'Sign In' });
    await deliverGoogleCredential();
    expect(screen.getByRole('status', { name: 'Signing in' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    await deliverGoogleCredential();
    expect(transport.mock.calls.filter(([config]) => config.url === '/auth/google-login')).toHaveLength(1);
    await act(async () => { complete(); });
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/seeker'));
  });

  it('shows the server error, restores the button, and allows a later Google attempt', async () => {
    googleRequest = config => Promise.reject(new axios.AxiosError('Google rejected', 'ERR_BAD_REQUEST', config, undefined, { status: 401, statusText: 'Unauthorized', config, headers: new AxiosHeaders(), data: { error: 'Google authentication failed. Please try again.' } }));
    mountLogin();
    await screen.findByRole('heading', { name: 'Sign In' });
    await deliverGoogleCredential();
    expect(await screen.findByRole('alert')).toHaveTextContent('Google authentication failed. Please try again.');
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    googleRequest = undefined;
    await deliverGoogleCredential();
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith('/seeker'));
  });

  it.each([
    { emailVerified: false, moderationStatus: 'ACTIVE', target: '/email-verification-required' },
    { emailVerified: true, moderationStatus: 'BANNED', target: '/account-banned' },
  ])('preserves the server account gate for $target on cookie recovery', async ({ target, ...status }) => {
    cookieValid = true;
    localStorage.setItem('userSession', JSON.stringify({ id: profile.id }));
    currentProfile = { ...profile, ...status };
    mountLogin();
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith(target));
    expect(mocks.router.replace).not.toHaveBeenCalledWith('/seeker');
  });

  it.each(['seeker', 'provider'])('keeps the full root body and %s session after cookie recovery without navigating', async role => {
    mocks.pathname = '/';
    localStorage.setItem('userSession', JSON.stringify({ id: profile.id }));
    localStorage.setItem('workspaceRole', role);
    let complete!: () => void;
    const underlying = api.defaults.adapter as AxiosAdapter;
    api.defaults.adapter = async config => {
      if (config.url === '/auth/session') return new Promise(resolve => {
        complete = () => resolve(reply(config, { success: true, data: { authenticated: true, accessToken: 'test-access' } }));
      });
      return underlying(config);
    };
    render(<AppProvider><LandingLayout><Home /></LandingLayout><SessionProbe /></AppProvider>);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    for (const id of ['how-it-works', 'workspaces', 'queue', 'trust', 'community', 'faq']) {
      expect(document.getElementById(id)).toBeVisible();
    }
    expect(screen.queryByText(/Checking session/)).not.toBeInTheDocument();
    expect(document.querySelector('header')).toHaveTextContent('Get started');
    expect(screen.queryByText('Open ServiceHub')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open workspace' })).not.toBeInTheDocument();
    expect(document.querySelector('.brand-loading')).not.toBeInTheDocument();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    await waitFor(() => expect(complete).toBeTypeOf('function'));
    await act(async () => { complete(); });
    await waitFor(() => expect(screen.getByLabelText('Session identity')).toHaveTextContent(`session-account:${role}`));
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open workspace' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(mocks.router.push).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('test-access');
  });

  it.each([
    { role: 'seeker', path: '/seeker/seek-services' },
    { role: 'provider', path: '/provider/browse-services' },
  ])('preserves the $role session when navigating from $path to / and refreshing', async ({ role, path }) => {
    mocks.pathname = path;
    cookieValid = true;
    localStorage.setItem('workspaceRole', role);
    const workspace = render(<StrictMode><AppProvider><WorkspaceProbe /><SessionProbe /></AppProvider></StrictMode>);
    await screen.findByRole('heading', { name: 'Authenticated workspace' });
    expect(mocks.router.replace).not.toHaveBeenCalled();

    mocks.pathname = '/';
    workspace.rerender(<StrictMode><AppProvider><LandingLayout><Home /></LandingLayout><SessionProbe /></AppProvider></StrictMode>);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(screen.getByLabelText('Session identity')).toHaveTextContent(`session-account:${role}`);
    expect(screen.getByRole('link', { name: 'Open workspace' })).toBeVisible();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(mocks.router.push).not.toHaveBeenCalled();
    expect(transport.mock.calls.map(([config]) => config.url)).toEqual(['/auth/session', '/auth/me']);

    workspace.unmount();
    clearAccessToken();
    const refreshed = render(<StrictMode><AppProvider><LandingLayout><Home /></LandingLayout><SessionProbe /></AppProvider></StrictMode>);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(document.querySelector('.brand-loading')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Session identity')).toHaveTextContent(`session-account:${role}`));
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(mocks.router.push).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('test-access');
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');

    expect(screen.getByRole('link', { name: 'Open workspace' })).toHaveAttribute('href', path);
    refreshed.unmount();
  });

  it.each([
    { role: 'seeker', path: '/seeker/seek-services', heading: 'Find local experts for any task.' },
    { role: 'provider', path: '/provider/browse-services', heading: 'Find client requests for any task.' },
  ])('reopens the real $role content repeatedly after visiting the landing page', async ({ role, path, heading }) => {
    cookieValid = true;
    localStorage.setItem('workspaceRole', role);
    mocks.pathname = path;
    const view = render(<StrictMode><AppProvider><WorkspaceContent role={role} /></AppProvider></StrictMode>);
    await screen.findByRole('heading', { name: heading });
    for (let visit = 0; visit < 2; visit++) {
      mocks.pathname = '/';
      view.rerender(<StrictMode><AppProvider><LandingLayout><Home /></LandingLayout></AppProvider></StrictMode>);
      expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
      expect(document.querySelector('.brand-loading')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Open workspace' })).toHaveAttribute('href', path);
      mocks.pathname = path;
      view.rerender(<StrictMode><AppProvider><WorkspaceContent role={role} /></AppProvider></StrictMode>);
      expect(await screen.findByRole('heading', { name: heading })).toBeVisible();
      await waitFor(() => expect(view.container.querySelector('.animate-pulse')).not.toBeInTheDocument());
      expect(view.container.querySelector('.workspace-page-skeleton')).not.toBeInTheDocument();
    }
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('test-access');
  });

  it.each([
    { role: 'seeker', path: '/seeker/seek-services' },
    { role: 'provider', path: '/provider/browse-services' },
  ])('reuses pending cookie recovery when Get started opens the $role gateway', async ({ role, path }) => {
    mocks.pathname = '/';
    localStorage.setItem('userSession', JSON.stringify({ id: profile.id }));
    localStorage.setItem('workspaceRole', role);
    let complete!: () => void;
    sessionRequest = config => new Promise(resolve => {
      complete = () => resolve(reply(config, { success: true, data: { authenticated: true, accessToken: 'test-access', user: currentProfile } }));
      finishSessionCheck = complete;
    });
    const view = render(<StrictMode><AppProvider><LandingLayout><Home /></LandingLayout><SessionProbe /></AppProvider></StrictMode>);
    expect(screen.getByRole('banner').querySelector('a[href="/get-started"]')).toHaveTextContent('Get started');
    await waitFor(() => expect(complete).toBeTypeOf('function'));
    // Model the route transition while keeping the real AppProvider mounted.
    mocks.pathname = '/get-started';
    view.rerender(<StrictMode><AppProvider><GetStartedPage /><SessionProbe /></AppProvider></StrictMode>);
    expect(mocks.router.replace).not.toHaveBeenCalled();
    expect(mocks.router.push).not.toHaveBeenCalled();
    await act(async () => { complete(); });
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith(path));
    expect(mocks.router.replace).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Session identity')).toHaveTextContent(`session-account:${role}`);
    expect(getAccessToken()).toBe('test-access');
    expect(transport.mock.calls.map(([config]) => config.url)).toEqual(['/auth/session']);
  });
});
