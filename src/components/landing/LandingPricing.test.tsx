import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import LandingPricing from './LandingPricing';
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); });
it('shows three public prices and routes guests into existing registration with provider intent', () => {
  vi.mocked(useApp).mockReturnValue({ user: null, isAuthenticated: false, authLoading: false, setUser: vi.fn() } as unknown as ReturnType<typeof useApp>);
  render(<LandingPricing isDark={false} />);
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(screen.getByText('Customers use ServiceHub for free.')).toBeVisible();
  const basic = within(screen.getByRole('article', { name: 'Basic plan' }));
  expect(basic.getByText('99')).toBeVisible();
  const action = basic.getByRole('link', { name: 'Choose Basic' });
  expect(action).toHaveAttribute('href', '/register'); action.addEventListener('click', event => event.preventDefault()); fireEvent.click(action);
  expect(localStorage.getItem('workspaceRole')).toBe('provider');
  expect(screen.getByRole('link', { name: 'Compare all features' })).toHaveAttribute('href', '/help/payments/provider-plans-and-subscriptions');
});
it('routes signed-in providers to dedicated membership management', () => {
  const setUser = vi.fn();
  vi.mocked(useApp).mockReturnValue({ user: { id: 'p1', role: 'provider' }, isAuthenticated: true, authLoading: false, setUser } as unknown as ReturnType<typeof useApp>);
  render(<LandingPricing isDark />);
  const action = screen.getByRole('link', { name: 'Choose Pro' });
  expect(action).toHaveAttribute('href', '/subscription'); action.addEventListener('click', event => event.preventDefault()); fireEvent.click(action);
  expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'provider' }));
});
