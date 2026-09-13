import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CommunityHub from './CommunityHub';
import { useCommunityHub } from '../../features/community/hooks/useCommunityHub';

const refetch = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({ isDark: false, user: { id: 'user-1', role: 'seeker' } }),
}));

vi.mock('../../features/community/hooks/useCommunityHub', () => ({
  useCommunityHub: vi.fn(),
}));

describe('CommunityHub failure state', () => {
  beforeEach(() => {
    refetch.mockReset();
    vi.mocked(useCommunityHub).mockReturnValue({
      data: null,
      loading: false,
      refreshing: false,
      error: 'Community data is unavailable.',
      refetch,
    });
  });

  it('shows one actionable error instead of fake zero or empty data', () => {
    render(<CommunityHub />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load Community Hub');
    expect(screen.queryByText('Verified Residents')).not.toBeInTheDocument();
    expect(screen.queryByText('No official announcements at this time')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
