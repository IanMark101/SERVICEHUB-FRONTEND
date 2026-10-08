import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LegacyProfileRedirect from './LegacyProfileRedirect';

const state = vi.hoisted(() => ({ replace: vi.fn(), query: '', user: { id: 'john' } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: state.replace }),
  useSearchParams: () => new URLSearchParams(state.query),
}));
vi.mock('../../context/AppContext', () => ({ useApp: () => ({ user: state.user }) }));

describe('legacy profile loading', () => {
  afterEach(() => { cleanup(); state.replace.mockClear(); state.query = ''; });

  it('shows a profile skeleton while opening the received review', () => {
    state.query = 'id=john&tab=reviews';
    const { container } = render(<LegacyProfileRedirect />);
    expect(state.replace).toHaveBeenCalledWith('/profile/john?tab=reviews');
    expect(screen.getByRole('status', { name: 'Loading marketplace profile' })).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.brand-loading')).toBeNull();
  });

  it('keeps old verification and settings links working', () => {
    state.query = 'verify=true';
    const { unmount } = render(<LegacyProfileRedirect />);
    expect(state.replace).toHaveBeenCalledWith('/profile/john?tab=verification');
    unmount();
    state.query = 'tab=settings';
    render(<LegacyProfileRedirect />);
    expect(state.replace).toHaveBeenLastCalledWith('/account/settings');
  });
});
