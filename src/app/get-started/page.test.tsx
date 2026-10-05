import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '@/context/AppContext';
import GetStartedPage from './page';

const { replace, router } = vi.hoisted(() => {
  const replace = vi.fn();
  return { replace, router: { replace } };
});
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));

function session(value: Partial<ReturnType<typeof useApp>>) {
  vi.mocked(useApp).mockReturnValue({ authLoading: false, authError: null, isAuthenticated: false, user: null, ...value } as ReturnType<typeof useApp>);
}

describe('explicit Get started gateway', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it.each(['seeker', 'provider', 'admin'] as const)('waits for recovery before opening the %s workspace', role => {
    session({ authLoading: true });
    const { rerender } = render(<GetStartedPage />);
    expect(replace).not.toHaveBeenCalled();
    session({ isAuthenticated: true, user: { role, emailVerified: true } as ReturnType<typeof useApp>['user'] });
    rerender(<GetStartedPage />);
    expect(replace).toHaveBeenCalledExactlyOnceWith(role === 'admin' ? '/admin/overview' : role === 'provider' ? '/provider/browse-services' : '/seeker/seek-services');
    // Background profile polling must not issue another identical redirect.
    session({ isAuthenticated: true, user: { role, emailVerified: true } as ReturnType<typeof useApp>['user'] });
    rerender(<GetStartedPage />);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('sends a confirmed guest to registration', () => {
    session({});
    render(<GetStartedPage />);
    expect(replace).toHaveBeenCalledExactlyOnceWith('/register');
  });

  it('keeps registration accessible after a recovery failure without authorizing a workspace', () => {
    session({ authError: 'Session recovery unavailable' });
    const { rerender } = render(<GetStartedPage />);
    expect(replace).toHaveBeenCalledExactlyOnceWith('/register');
    replace.mockClear();
    session({ authLoading: true });
    rerender(<GetStartedPage />);
    expect(replace).not.toHaveBeenCalled();
    session({ isAuthenticated: true, user: { role: 'seeker', emailVerified: true } as ReturnType<typeof useApp>['user'] });
    rerender(<GetStartedPage />);
    expect(replace).toHaveBeenCalledExactlyOnceWith('/seeker/seek-services');
  });

  it.each([
    { user: { role: 'seeker', emailVerified: false }, path: '/email-verification-required' },
    { user: { role: 'provider', emailVerified: true, moderationStatus: 'BANNED' }, path: '/account-banned' },
  ])('preserves the account gate at $path', ({ user, path }) => {
    session({ isAuthenticated: true, user: user as ReturnType<typeof useApp>['user'] });
    render(<GetStartedPage />);
    expect(replace).toHaveBeenCalledExactlyOnceWith(path);
  });
});
