import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MarketplaceProfilePage from './page';
import { apiGetPublicProfile } from '../../../api/auth.api';

const route = vi.hoisted(() => ({ id: 'john', tab: 'overview', reviewRole: '' }));
vi.mock('next/navigation', () => ({
  useParams: () => ({ userId: route.id }),
  useSearchParams: () => new URLSearchParams({ tab: route.tab, reviewRole: route.reviewRole }),
  usePathname: () => `/profile/${route.id}`,
}));
vi.mock('../../../hooks/useRouteGuard', () => ({ useRouteGuard: () => ({ shouldRender: true }) }));
vi.mock('../../../context/AppContext', () => ({ useApp: () => ({ user: { id: 'viewer', role: 'seeker' }, users: [], isDark: false }) }));
vi.mock('../../../api/auth.api', () => ({
  apiGetPublicProfile: vi.fn(), apiGetTrustHistory: vi.fn().mockResolvedValue({ success: true, data: [] }), apiUpdateProfile: vi.fn(),
}));
vi.mock('../../../api/ai.api', () => ({ apiGetProviderSummary: vi.fn() }));
vi.mock('../../../components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('../../../components/profile/ProfilePageShell', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('../../../components/profile/UserProfile', async () => {
  const { useUserProfile } = await import('../../../hooks/useUserProfile');
  return { default: function ProfileProbe(props: Parameters<typeof useUserProfile>[0] & { initialReviewContext?: string }) {
    const profile = useUserProfile(props);
    return profile.loading ? <p role="status">Loading profile</p>
      : <article>{profile.displayName}<span>{profile.activeTab}</span><span data-testid="review-role">{props.initialReviewContext ?? 'auto'}</span></article>;
  } };
});

describe('profile route lifetime', () => {
  beforeEach(() => {
    vi.clearAllMocks(); route.id = 'john'; route.tab = 'overview'; route.reviewRole = '';
    vi.mocked(apiGetPublicProfile).mockResolvedValue({ success: true, data: { id: 'john', name: 'John' } });
  });

  it('honors role-specific review links without refetching the loaded profile', async () => {
    route.tab = 'reviews'; route.reviewRole = 'seeker';
    const { rerender } = render(<MarketplaceProfilePage />);
    await waitFor(() => expect(screen.getByTestId('review-role')).toHaveTextContent('SEEKER'));
    route.reviewRole = 'provider'; rerender(<MarketplaceProfilePage />);
    expect(screen.getByTestId('review-role')).toHaveTextContent('PROVIDER');
    route.reviewRole = 'invalid'; rerender(<MarketplaceProfilePage />);
    expect(screen.getByTestId('review-role')).toHaveTextContent('auto');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(apiGetPublicProfile).toHaveBeenCalledOnce();
  });

  it('keeps the loaded profile mounted when only the URL tab changes', async () => {
    const { rerender } = render(<MarketplaceProfilePage />);
    await waitFor(() => expect(screen.getByText('overview')).toBeInTheDocument());
    route.tab = 'reviews'; rerender(<MarketplaceProfilePage />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('reviews')).toBeInTheDocument());
    route.tab = 'trust'; rerender(<MarketplaceProfilePage />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('trust')).toBeInTheDocument());
    expect(apiGetPublicProfile).toHaveBeenCalledOnce();
  });

  it('still shows initial loading when opening a different person’s profile', async () => {
    const { rerender } = render(<MarketplaceProfilePage />);
    await waitFor(() => expect(screen.getByText('overview')).toBeInTheDocument());
    vi.mocked(apiGetPublicProfile).mockReturnValueOnce(new Promise(() => {}));
    route.id = 'different-person'; rerender(<MarketplaceProfilePage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading profile');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await waitFor(() => expect(apiGetPublicProfile).toHaveBeenLastCalledWith('different-person'));
  });
});
