import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetMe, apiVerifyEmail } from '@/api/auth.api';
import { useApp } from '@/context/AppContext';
import VerifyEmailPage from './page';

const replace = vi.fn();
const setUser = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams('token=test-verification-token'),
}));
vi.mock('@/api/auth.api', () => ({ apiVerifyEmail: vi.fn(), apiGetMe: vi.fn() }));
vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));

describe('verification-link return', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      authLoading: false, isAuthenticated: true,
      user: { id: 'seeker-1', role: 'seeker', emailVerified: false }, setUser,
    } as unknown as ReturnType<typeof useApp>);
  });

  it('refreshes email verification from the backend for the authenticated account', async () => {
    vi.mocked(apiVerifyEmail).mockResolvedValue({ success: true, message: 'Email verified.' });
    vi.mocked(apiGetMe).mockResolvedValue({ success: true, data: { user: {
      id: 'seeker-1', emailVerified: true, verificationStatus: 'UNVERIFIED',
    } } });
    render(<VerifyEmailPage />);
    expect(await screen.findByRole('heading', { name: 'Email verified' })).toBeInTheDocument();
    await waitFor(() => expect(setUser).toHaveBeenCalled());
    const updated = setUser.mock.calls.at(-1)?.[0]({ id: 'seeker-1', role: 'seeker', emailVerified: false });
    expect(updated).toMatchObject({ emailVerified: true, verificationStatus: 'UNVERIFIED' });
  });
});
