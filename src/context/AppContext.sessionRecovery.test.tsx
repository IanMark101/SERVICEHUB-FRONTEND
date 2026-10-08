import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRecoverSession } from '../api/auth.api';
import { clearAccessToken } from '../lib/api/axios';
import { AppProvider, useApp } from './AppContext';
import { useRouteGuard } from '../hooks/useRouteGuard';

const mocks = vi.hoisted(() => ({
  generation: 0,
  pathname: '/',
  router: { replace: vi.fn() },
  sync: { clearPrivateData: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname, useRouter: () => mocks.router }));
vi.mock('../api/auth.api', () => ({ apiGetMe: vi.fn(), apiRecoverSession: vi.fn() }));
vi.mock('../lib/api/axios', () => ({ clearAccessToken: vi.fn(), getSessionGeneration: () => mocks.generation }));
vi.mock('../lib/api/responseCache', () => ({ clearApiCache: vi.fn(), invalidateApiCache: vi.fn() }));
vi.mock('../hooks/useAppDataSync', () => ({ useAppDataSync: () => mocks.sync }));
vi.mock('../hooks/useSeekerActions', () => ({ useSeekerActions: () => ({}) }));
vi.mock('../hooks/useProviderActions', () => ({ useProviderActions: () => ({}) }));
vi.mock('../hooks/useSharedActions', () => ({ useSharedActions: () => ({}) }));
vi.mock('../components/ui/Toast', () => ({ useToast: () => mocks.toast }));

function SessionProbe() {
  const { user, isAuthenticated, authLoading, authError, retrySession, setUser, setIsAuthenticated } = useApp();
  return (
    <>
      <p>{authLoading ? 'Checking session' : 'Session settled'}</p>
      <p>{isAuthenticated ? user?.id : 'Guest'}</p>
      {authError && <><p>{authError}</p><button onClick={retrySession}>Retry session</button></>}
      <button onClick={() => {
        // A successful login response increments the API session generation.
        mocks.generation++;
        setUser({ id: 'new-login', role: 'seeker', emailVerified: true } as NonNullable<typeof user>);
        setIsAuthenticated(true);
      }}>Complete new login</button>
    </>
  );
}

function ProtectedProbe() {
  const { shouldRender } = useRouteGuard(['user']);
  return shouldRender ? <h1>Verified workspace</h1> : null;
}

describe('session recovery with an interactive public landing page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generation = 0;
    mocks.pathname = '/';
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('userSession', JSON.stringify({ id: 'old-session' }));
  });

  it.each(['seeker', 'provider'])('recovers a cookie-only session in the %s workspace without a cached profile', async role => {
    mocks.pathname = `/${role}`;
    localStorage.removeItem('userSession');
    localStorage.setItem('workspaceRole', role);
    vi.mocked(apiRecoverSession).mockResolvedValue({
      success: true,
      data: { user: { id: 'cookie-account', name: 'Test Account', emailVerified: true } },
    });
    render(<AppProvider><SessionProbe /></AppProvider>);
    await waitFor(() => expect(screen.getByText('cookie-account')).toBeVisible());
    expect(apiRecoverSession).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
  });

  it.each(['/', '/get-started', '/login', '/register', '/reset-password', '/help', '/privacy', '/terms'])('makes no session request for a new visitor at %s', async path => {
    mocks.pathname = path;
    localStorage.clear();
    vi.mocked(apiRecoverSession).mockResolvedValue({ success: false, data: { user: null } });
    render(<AppProvider><SessionProbe /></AppProvider>);
    await waitFor(() => expect(screen.getByText('Session settled')).toBeVisible());
    expect(apiRecoverSession).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('servicehub:auth-notice')).toBeNull();
  });

  it('does not treat malformed saved profile data as a session hint', async () => {
    localStorage.setItem('userSession', 'invalid JSON');
    render(<AppProvider><SessionProbe /></AppProvider>);
    await screen.findByText('Session settled');
    expect(apiRecoverSession).not.toHaveBeenCalled();
  });

  it('verifies the cookie before rendering a workspace reached from a guest landing page', async () => {
    localStorage.clear();
    let resolve!: (result: unknown) => void;
    vi.mocked(apiRecoverSession).mockReturnValue(new Promise(done => { resolve = done; }));
    const view = render(<AppProvider><SessionProbe /></AppProvider>);
    await screen.findByText('Session settled');
    expect(apiRecoverSession).not.toHaveBeenCalled();
    mocks.pathname = '/seeker/seek-services';
    view.rerender(<AppProvider><ProtectedProbe /><SessionProbe /></AppProvider>);
    expect(screen.getByText('Checking session')).toBeVisible();
    expect(screen.queryByText('Verified workspace')).not.toBeInTheDocument();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    await act(async () => { resolve({ success: true, data: { user: { id: 'cookie-account', name: 'Test Account', emailVerified: true } } }); });
    expect(screen.getByText('Verified workspace')).toBeVisible();
    expect(apiRecoverSession).toHaveBeenCalledTimes(1);
  });

  it('keeps a recovery failure distinct from a confirmed sign-out and supports retry', async () => {
    let reject!: (reason: Error) => void;
    vi.mocked(apiRecoverSession).mockReturnValue(new Promise((_, fail) => { reject = fail; }));
    render(<AppProvider><SessionProbe /></AppProvider>);
    expect(screen.getByText('Checking session')).toBeVisible();
    await act(async () => { reject(new Error('Session recovery timed out')); });
    expect(screen.getByText('Session settled')).toBeVisible();
    expect(screen.getByText('Guest')).toBeVisible();
    expect(clearAccessToken).not.toHaveBeenCalled();
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
    expect(screen.getByText(/Could not restore your session/)).toBeVisible();
    vi.mocked(apiRecoverSession).mockResolvedValueOnce({ success: true, data: { user: { id: 'restored', name: 'Restored', emailVerified: true } } });
    fireEvent.click(screen.getByRole('button', { name: 'Retry session' }));
    await waitFor(() => expect(screen.getByText('restored')).toBeVisible());
    expect(screen.queryByText(/Could not restore your session/)).not.toBeInTheDocument();
  });

  it.each(['seeker', 'provider'])('gates the %s workspace during a database outage without discarding the login session', async role => {
    mocks.pathname = `/${role}`;
    vi.mocked(apiRecoverSession).mockRejectedValueOnce({ isAxiosError: true,
      response: { status: 503, data: { code: 'DATABASE_QUOTA_EXCEEDED', error: 'Invalid prisma.refreshToken.findUnique()' } } });
    render(<AppProvider><ProtectedProbe /></AppProvider>);
    expect(await screen.findByText('Service temporarily unavailable')).toBeVisible();
    expect(screen.getByText('ServiceHub is temporarily unavailable. Please try again later.')).toBeVisible();
    expect(screen.queryByText('Verified workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('Connection interrupted')).not.toBeInTheDocument();
    expect(screen.queryByText(/prisma/)).not.toBeInTheDocument();
    expect(clearAccessToken).not.toHaveBeenCalled();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
    expect(mocks.router.replace).not.toHaveBeenCalled();
    vi.mocked(apiRecoverSession).mockResolvedValueOnce({ success: true, data: { user: { id: 'restored', name: 'Test Account', emailVerified: true } } });
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Verified workspace')).toBeVisible();
  });

  it('checks again before workspace entry after a saved public session was confirmed absent', async () => {
    vi.mocked(apiRecoverSession).mockResolvedValueOnce({ success: false, data: { user: null } });
    const view = render(<AppProvider><SessionProbe /></AppProvider>);
    await screen.findByText('Session settled');
    let resolve!: (result: unknown) => void;
    vi.mocked(apiRecoverSession).mockReturnValueOnce(new Promise(done => { resolve = done; }));
    mocks.pathname = '/provider/browse-services';
    view.rerender(<AppProvider><ProtectedProbe /><SessionProbe /></AppProvider>);
    expect(screen.getByText('Checking session')).toBeVisible();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    await act(async () => { resolve({ success: true, data: { user: { id: 'restored-cookie', name: 'Test Account', emailVerified: true } } }); });
    expect(screen.getByText('Verified workspace')).toBeVisible();
    expect(apiRecoverSession).toHaveBeenCalledTimes(2);
  });

  it('preserves a new login if the earlier recovery request fails later', async () => {
    let reject!: (reason: Error) => void;
    vi.mocked(apiRecoverSession).mockReturnValue(new Promise((_, fail) => { reject = fail; }));
    render(<AppProvider><SessionProbe /></AppProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Complete new login' }));
    await act(async () => { reject(new Error('Session recovery timed out')); });
    expect(screen.getByText('Session settled')).toBeVisible();
    expect(screen.getByText('new-login')).toBeVisible();
    expect(clearAccessToken).not.toHaveBeenCalled();
    expect(localStorage.getItem('userSession')).toBeNull();
    expect(localStorage.getItem('servicehub:session-present')).toBe('true');
  });

  it.each(['/get-started', '/login', '/register', '/reset-password', '/verify-email', '/help', '/privacy', '/terms'])('keeps public content available at %s when recovery fails', async path => {
    mocks.pathname = path;
    vi.mocked(apiRecoverSession).mockRejectedValue(new Error('Recovery unavailable'));
    render(<AppProvider><h1>Public content</h1><SessionProbe /></AppProvider>);
    await screen.findByText('Session settled');
    expect(screen.getByRole('heading', { name: 'Public content' })).toBeVisible();
    expect(screen.getByText('Guest')).toBeVisible();
    expect(screen.queryByText('Connection interrupted')).not.toBeInTheDocument();
  });

  it.each(['/seeker', '/provider', '/admin'])('still blocks protected content at %s when recovery fails', async path => {
    mocks.pathname = path;
    vi.mocked(apiRecoverSession).mockRejectedValue(new Error('Recovery unavailable'));
    render(<AppProvider><h1>Protected content</h1></AppProvider>);
    expect(await screen.findByText('Connection interrupted')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Protected content' })).not.toBeInTheDocument();
  });

  it('ignores an earlier guest result after a new login succeeds', async () => {
    let resolve!: (result: unknown) => void;
    vi.mocked(apiRecoverSession).mockReturnValue(new Promise(done => { resolve = done; }));
    render(<AppProvider><SessionProbe /></AppProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Complete new login' }));
    await act(async () => { resolve({ success: false, data: { user: null } }); });
    expect(screen.getByText('Session settled')).toBeVisible();
    expect(screen.getByText('new-login')).toBeVisible();
    expect(clearAccessToken).not.toHaveBeenCalled();
  });
});
