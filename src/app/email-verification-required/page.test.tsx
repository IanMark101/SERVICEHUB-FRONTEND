import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '@/context/AppContext';
import { apiGetMe, apiResendVerification } from '@/api/auth.api';
import EmailVerificationRequiredPage from './page';

const replace = vi.fn();
const setUser = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('@/api/auth.api', () => ({ apiGetMe: vi.fn(), apiResendVerification: vi.fn(), apiLogout: vi.fn() }));

describe('authenticated email-verification gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      authLoading: false, isAuthenticated: true,
      user: { id: 'user-1', role: 'seeker', email: 'seeker@example.test', emailVerified: false },
      setUser, setIsAuthenticated: vi.fn(),
    } as unknown as ReturnType<typeof useApp>);
  });

  it('shows the destination email and resends a verification link', async () => {
    vi.mocked(apiResendVerification).mockResolvedValue({ success: true });
    render(<EmailVerificationRequiredPage />);
    expect(screen.getByText('seeker@example.test')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resend verification link' }));
    await waitFor(() => expect(apiResendVerification).toHaveBeenCalledWith('seeker@example.test'));
    expect(await screen.findByRole('status')).toHaveTextContent('sent a new link');
  });

  it('refreshes the session from the backend before unlocking the workspace', async () => {
    vi.mocked(apiGetMe).mockResolvedValue({ success: true, data: { user: { id: 'user-1', emailVerified: true, verificationStatus: 'UNVERIFIED' } } });
    render(<EmailVerificationRequiredPage />);
    fireEvent.click(screen.getByRole('button', { name: /I verified my email/i }));
    await waitFor(() => expect(setUser).toHaveBeenCalled());
    const updated = setUser.mock.calls.at(-1)?.[0]({ id: 'user-1', role: 'seeker', emailVerified: false });
    expect(updated).toMatchObject({ emailVerified: true, verificationStatus: 'UNVERIFIED' });
  });

  it('redirects an already verified session to the selected workspace', async () => {
    localStorage.setItem('workspaceRole', 'provider');
    vi.mocked(useApp).mockReturnValue({
      authLoading: false, isAuthenticated: true,
      user: { id: 'user-1', role: 'provider', emailVerified: true },
    } as ReturnType<typeof useApp>);
    render(<EmailVerificationRequiredPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/provider'));
    localStorage.removeItem('workspaceRole');
  });
});
