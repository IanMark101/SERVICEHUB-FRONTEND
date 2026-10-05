import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommunitySectionNav } from './CommunityHeader';
import TopProviders from './TopProviders';
import type { TopProvider } from '../types/community.types';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const featuredProvider: TopProvider = {
  rank: 1,
  id: 'provider-1',
  name: 'Alex Santos',
  avatarUrl: null,
  trustScore: 92,
  verificationStatus: 'APPROVED',
  completedJobs: 4,
  avgRating: 4.8,
  reviewCount: 12,
  primaryService: 'Electrical repair',
};

describe('Community Hub presentation', () => {
  it('keeps section navigation as working anchor links with a visible active state', () => {
    render(<CommunitySectionNav />);
    const overview = screen.getByRole('link', { name: 'Overview' });
    const providers = screen.getByRole('link', { name: 'Providers' });
    expect(overview).toHaveAttribute('href', '#community-overview');
    expect(overview).toHaveAttribute('aria-current', 'location');
    fireEvent.click(providers);
    expect(providers).toHaveAttribute('href', '#community-providers');
    expect(providers).toHaveAttribute('aria-current', 'location');
  });

  it('shows a single qualifying provider without empty podium slots and preserves profile navigation', () => {
    push.mockClear();
    render(<TopProviders providers={[featuredProvider]} />);
    expect(screen.getByText('Alex Santos')).toBeInTheDocument();
    expect(screen.getByText('Electrical repair')).toBeInTheDocument();
    expect(screen.getByText('Verified resident')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('Rank 2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View ranked provider Alex Santos' }));
    expect(push).toHaveBeenCalledWith('/profile/provider-1');
  });

  it('retains the providers anchor even when there is no ranking data', () => {
    const { container } = render(<TopProviders providers={[]} />);
    expect(container.querySelector('#community-providers')).not.toBeNull();
    expect(screen.getByText('No provider recognition is available this week')).toBeInTheDocument();
  });
});
