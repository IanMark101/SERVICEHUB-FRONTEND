import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../context/AppContext';
import { useRouteGuard } from './useRouteGuard';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));

describe('workspace email gate', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it.each(['seeker', 'provider'] as const)('blocks an unverified direct %s workspace URL', async (role) => {
    vi.mocked(useApp).mockReturnValue({
      authLoading: false, isAuthenticated: true,
      user: { id: 'account', role, emailVerified: false },
    } as ReturnType<typeof useApp>);
    const { result } = renderHook(() => useRouteGuard(['user']));
    expect(result.current.shouldRender).toBe(false);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/email-verification-required'));
  });

  it('permits an email-verified user with residency still unverified into Limited Mode', () => {
    vi.mocked(useApp).mockReturnValue({
      authLoading: false, isAuthenticated: true,
      user: { id: 'account', role: 'seeker', emailVerified: true, verificationStatus: 'UNVERIFIED' },
    } as ReturnType<typeof useApp>);
    const { result } = renderHook(() => useRouteGuard(['user']));
    expect(result.current.shouldRender).toBe(true);
    expect(replace).not.toHaveBeenCalled();
  });

  it('blocks a banned user from a direct workspace URL', async () => {
    vi.mocked(useApp).mockReturnValue({ authLoading: false, isAuthenticated: true, user: { id: 'account', role: 'seeker', emailVerified: true, moderationStatus: 'BANNED' } } as ReturnType<typeof useApp>);
    const { result } = renderHook(() => useRouteGuard(['user']));
    expect(result.current.shouldRender).toBe(false);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/account-banned'));
  });

  it('does not redirect an interrupted recovery to login or authorize cached identity', () => {
    vi.mocked(useApp).mockReturnValue({ authLoading: false, authError: 'Connection interrupted', isAuthenticated: false, user: null } as ReturnType<typeof useApp>);
    const { result } = renderHook(() => useRouteGuard(['user']));
    expect(result.current.shouldRender).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });
});
