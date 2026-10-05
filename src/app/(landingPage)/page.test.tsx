import React, { Suspense, use } from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '@/context/AppContext';
import Home from './page';
import LandingFallback from './loading';
import LandingLayout from './layout';
import GetStartedLink from '@/components/landing/GetStartedLink';

const { push, replace, router } = vi.hoisted(() => {
  const push = vi.fn();
  const replace = vi.fn();
  return { push, replace, router: { push, replace } };
});

vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('@/components/landing/LandingPage', () => ({
  default: () => (
    <main>
      <h1>ServiceHub Cordova</h1>
      <GetStartedLink>Get started</GetStartedLink>
    </main>
  ),
}));

describe('public landing route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ authLoading: true, isAuthenticated: false, user: null } as ReturnType<typeof useApp>);
  });

  it('shows public content before session recovery finishes', () => {
    render(<LandingLayout><Home /></LandingLayout>);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/get-started');
    expect(push).not.toHaveBeenCalled();
  });

  it('keeps the public page visible when session recovery fails or no session exists', () => {
    const { rerender } = render(<LandingLayout><Home /></LandingLayout>);
    const main = screen.getByRole('main');
    vi.mocked(useApp).mockReturnValue({ authLoading: false, isAuthenticated: false, user: null } as ReturnType<typeof useApp>);
    rerender(<LandingLayout><Home /></LandingLayout>);
    expect(screen.getByRole('main')).toBe(main);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/register');
  });

  it.each(['seeker', 'provider', 'admin'])('keeps the full landing page at / for a recovered %s, including refresh', role => {
    const user = { id: 'account', role, emailVerified: true };
    vi.mocked(useApp).mockReturnValue({ authLoading: true, isAuthenticated: true, user } as ReturnType<typeof useApp>);
    const { rerender, unmount } = render(<LandingLayout><Home /></LandingLayout>);
    const main = screen.getByRole('main');
    expect(replace).not.toHaveBeenCalled();
    vi.mocked(useApp).mockReturnValue({ authLoading: false, isAuthenticated: true, user } as ReturnType<typeof useApp>);
    rerender(<LandingLayout><Home /></LandingLayout>);
    expect(screen.getByRole('main')).toBe(main);
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', role === 'admin' ? '/admin/overview' : role === 'provider' ? '/provider/browse-services' : '/seeker/seek-services');
    unmount();
    push.mockClear();
    replace.mockClear();
    render(<LandingLayout><Home /></LandingLayout>);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('allows an email-unverified member to view the public page without opening a workspace', () => {
    vi.mocked(useApp).mockReturnValue({ authLoading: false, isAuthenticated: true, user: { id: 'account', role: 'seeker', emailVerified: false } } as ReturnType<typeof useApp>);
    render(<LandingLayout><Home /></LandingLayout>);
    expect(screen.getByRole('heading', { name: 'ServiceHub Cordova' })).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('keeps one visible body throughout the route streaming handoff', async () => {
    let resolve!: (value: null) => void;
    const pending = new Promise<null>(done => { resolve = done; });
    function StreamedPage() { return use(pending); }
    await act(async () => {
      render(
        <LandingLayout>
          <Suspense fallback={<LandingFallback />}><StreamedPage /></Suspense>
        </LandingLayout>,
      );
    });
    const main = screen.getByRole('main');
    expect(main).toBeVisible();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await act(async () => { resolve(null); await pending; });
    expect(screen.getByRole('main')).toBe(main);
    expect(main).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
  });
});
