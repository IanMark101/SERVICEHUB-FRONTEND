import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountBannedPage from './page';
import { useApp } from '@/context/AppContext';
import { apiGetBanAppeal, apiSubmitBanAppeal } from '@/api/auth.api';

const replace = vi.fn();
const router = { replace };
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('@/api/auth.api', () => ({ apiGetBanAppeal: vi.fn(), apiGetMe: vi.fn(), apiSubmitBanAppeal: vi.fn(), apiLogout: vi.fn() }));
vi.mock('@/lib/api/axios', () => ({ clearAccessToken: vi.fn() }));

describe('banned-account experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      authLoading: false, isAuthenticated: true,
      user: { id: 'user-1', role: 'seeker', moderationStatus: 'BANNED' },
      setUser: vi.fn(), setIsAuthenticated: vi.fn(),
    } as unknown as ReturnType<typeof useApp>);
  });

  it('shows the ban and submits one explained appeal', async () => {
    vi.mocked(apiGetBanAppeal).mockResolvedValueOnce({ success: true, data: { appeal: null } })
      .mockResolvedValueOnce({ success: true, data: { appeal: { id: 'appeal-1', status: 'PENDING', createdAt: '2026-09-30T00:00:00Z' } } });
    vi.mocked(apiSubmitBanAppeal).mockResolvedValue({ success: true });
    render(<AccountBannedPage />);
    expect(screen.getByRole('heading', { name: /account has been banned/i })).toBeInTheDocument();
    const explanation = await screen.findByLabelText('Appeal Ban');
    fireEvent.change(explanation, { target: { value: 'Please review the circumstances of this account decision.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit appeal' }));
    await waitFor(() => expect(apiSubmitBanAppeal).toHaveBeenCalledWith('Please review the circumstances of this account decision.'));
    expect(await screen.findByText('Appeal awaiting Admin review')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit appeal' })).not.toBeInTheDocument();
  });

  it('shows an existing appeal status without offering a duplicate form', async () => {
    vi.mocked(apiGetBanAppeal).mockResolvedValue({ success: true, data: { appeal: { id: 'appeal-1', status: 'REJECTED', decisionReason: 'Evidence confirmed the decision.', createdAt: '2026-09-30T00:00:00Z' } } });
    render(<AccountBannedPage />);
    expect(await screen.findByText('Appeal rejected')).toBeInTheDocument();
    expect(screen.getByText('Decision reason: Evidence confirmed the decision.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit appeal' })).not.toBeInTheDocument();
  });
});
