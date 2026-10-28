import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import SubscriptionPage from './page';
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../hooks/useRouteGuard', () => ({ useRouteGuard: () => ({ shouldRender: true }) }));
vi.mock('../../components/provider/subscription/SubscriptionPageShell', () => ({ default: ({ children }: React.PropsWithChildren) => <main>{children}</main> }));
vi.mock('../../components/provider/subscription/SubscriptionWorkspace', () => ({ default: () => <div>Provider membership flow</div> }));
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); });
it('requires an explicit provider switch before mounting any customer membership checkout', () => {
  const setUser = vi.fn();
  vi.mocked(useApp).mockReturnValue({ user: { id: 'c1', role: 'seeker' }, setUser, isDark: false } as unknown as ReturnType<typeof useApp>);
  render(<SubscriptionPage />);
  expect(screen.getByText(/Customers use ServiceHub for free/)).toBeVisible();
  expect(screen.queryByText('Provider membership flow')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Continue as Provider' }));
  expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'provider' }));
  expect(localStorage.getItem('workspaceRole')).toBe('provider');
});
it('uses the existing dedicated flow for providers', () => {
  vi.mocked(useApp).mockReturnValue({ user: { id: 'p1', role: 'provider' }, setUser: vi.fn(), isDark: false } as unknown as ReturnType<typeof useApp>);
  render(<SubscriptionPage />);
  expect(screen.getByText('Provider membership flow')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Continue as Provider' })).not.toBeInTheDocument();
});
