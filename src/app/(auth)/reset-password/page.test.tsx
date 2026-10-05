import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import ResetPasswordPage from './page';
import { apiResetPassword } from '../../../api/auth.api';
const { params } = vi.hoisted(() => ({ params: { token: 'fixture-reset-token' } }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(params.token ? { token: params.token } : {}) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('../../../api/auth.api', () => ({ apiResetPassword: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); params.token = 'fixture-reset-token'; vi.mocked(apiResetPassword).mockResolvedValue({ success: true }); });

it('enforces strong matching passwords and shows success without losing the notice', async () => {
  render(<ResetPasswordPage />);
  const action = screen.getByRole('button', { name: 'Reset Password' }); expect(action).toBeDisabled();
  fireEvent.change(screen.getByLabelText('New Password', { exact: true }), { target: { value: 'Safe-password-2026!' } });
  fireEvent.change(screen.getByLabelText('Confirm New Password', { exact: true }), { target: { value: 'different' } });
  expect(screen.getByText('Passwords do not match.')).toBeInTheDocument(); expect(action).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Confirm New Password', { exact: true }), { target: { value: 'Safe-password-2026!' } });
  expect(action).toBeEnabled(); fireEvent.click(action);
  expect(await screen.findByRole('status')).toHaveTextContent('Password reset successfully.');
  expect(apiResetPassword).toHaveBeenCalledWith({ token: 'fixture-reset-token', password: 'Safe-password-2026!', confirmPassword: 'Safe-password-2026!' });
});
it('fails closed when the reset link has no token', () => {
  params.token = ''; render(<ResetPasswordPage />);
  expect(screen.getByRole('alert')).toHaveTextContent('missing its verification token');
  expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument(); expect(screen.getByRole('link', { name: 'Get a new reset link' })).toBeInTheDocument();
});
