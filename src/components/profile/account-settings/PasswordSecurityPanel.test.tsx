import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PasswordSecurityPanel from './PasswordSecurityPanel';
import { apiChangePassword, apiGetSecurityMethods, apiSetPassword, apiStartPasswordSetup, apiVerifyPasswordSetup } from '../../../api/auth.api';

vi.mock('../../../api/auth.api', () => ({ apiGetSecurityMethods: vi.fn(), apiChangePassword: vi.fn(), apiSetPassword: vi.fn(), apiStartPasswordSetup: vi.fn(), apiVerifyPasswordSetup: vi.fn() }));
vi.mock('../../../lib/api/axios', () => ({ clearAccessToken: vi.fn() }));
vi.mock('../../../lib/socket', () => ({ disconnectSocket: vi.fn() }));
vi.mock('./GoogleDeletionVerification', () => ({ default: ({ onSuccess }: { onSuccess: (credential: string) => void }) => <button onClick={() => onSuccess('verified-google-token')}>Complete Google verification</button> }));
const google = { email: 'ana@example.test', passwordEnabled: false, googleConnected: true, legacyPasswordUnconfirmed: false, googleAvailable: true };
const input = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'test-google-client');
  vi.mocked(apiGetSecurityMethods).mockResolvedValue({ success: true, data: google });
  vi.mocked(apiStartPasswordSetup).mockResolvedValue({ data: { nonce: 'nonce', challenge: 'challenge', expiresInSeconds: 300 } });
  vi.mocked(apiVerifyPasswordSetup).mockResolvedValue({ data: { grant: 'grant', expiresInSeconds: 300 } });
  vi.mocked(apiSetPassword).mockResolvedValue({ success: true });
});

describe('Password Security', () => {
  it('allows an ambiguous legacy Google account to verify without requesting a current password', async () => {
    vi.mocked(apiGetSecurityMethods).mockResolvedValue({ success: true, data: { ...google, legacyPasswordUnconfirmed: true, googleConnected: false } });
    render(<PasswordSecurityPanel isDark={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Set Password' }));
    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify with Google' })).toBeEnabled();
  });
  it('shows Google only and never asks for a current password during setup', async () => {
    render(<PasswordSecurityPanel isDark={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Set Password' }));
    expect(screen.getByText('No password set.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Verify with Google' }));
    fireEvent.click(await screen.findByText('Complete Google verification'));
    await screen.findByLabelText('New Password', { exact: true });
    expect(apiVerifyPasswordSetup).toHaveBeenCalledWith({ credential: 'verified-google-token', challenge: 'challenge' });
    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
  });
  it('validates all requirements and clears mismatch errors immediately, with independent visibility toggles', async () => {
    vi.mocked(apiGetSecurityMethods).mockResolvedValue({ success: true, data: { ...google, passwordEnabled: true } });
    render(<PasswordSecurityPanel isDark />);
    fireEvent.click(await screen.findByRole('button', { name: 'Change Password' }));
    const submit = screen.getByRole('button', { name: 'Save New Password' });
    expect(submit).toBeDisabled();
    input('Current Password', 'existing'); input('New Password', 'weak'); input('Confirm New Password', 'different');
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    input('New Password', 'Safe-password-2026!'); input('Confirm New Password', 'Safe-password-2026!');
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument(); expect(submit).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Show new password' }));
    expect(screen.getByLabelText('New Password', { exact: true })).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirm New Password', { exact: true })).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Hide new password' }));
    expect(screen.getByLabelText('New Password', { exact: true })).toHaveAttribute('type', 'password');
  });
  it('creates a password only after verification and updates both sign-in methods', async () => {
    render(<PasswordSecurityPanel isDark={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Set Password' })); fireEvent.click(screen.getByRole('button', { name: 'Verify with Google' })); fireEvent.click(await screen.findByText('Complete Google verification'));
    await screen.findByLabelText('New Password', { exact: true });
    input('New Password', 'Safe-password-2026!'); input('Confirm New Password', 'Safe-password-2026!');
    fireEvent.click(screen.getByRole('button', { name: 'Create Password' }));
    await screen.findByRole('button', { name: 'Change Password' });
    expect(screen.getByRole('status')).toHaveTextContent('Password created.');
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(apiSetPassword).toHaveBeenCalledWith({ grant: 'grant', newPassword: 'Safe-password-2026!', confirmPassword: 'Safe-password-2026!' });
  });
  it('shows an incorrect current password on the field and blocks repeats until edited', async () => {
    vi.mocked(apiGetSecurityMethods).mockResolvedValue({ success: true, data: { ...google, passwordEnabled: true, googleConnected: false } });
    vi.mocked(apiChangePassword).mockRejectedValue({ isAxiosError: true, response: { data: { code: 'CURRENT_PASSWORD_INCORRECT', error: 'Current password is incorrect. Try again.' } } });
    render(<PasswordSecurityPanel isDark={false} />); fireEvent.click(await screen.findByRole('button', { name: 'Change Password' }));
    input('Current Password', 'wrong'); input('New Password', 'Safe-password-2026!'); input('Confirm New Password', 'Safe-password-2026!');
    fireEvent.click(screen.getByRole('button', { name: 'Save New Password' }));
    await screen.findByText('Current password is incorrect. Try again.');
    expect(screen.getByLabelText('Current Password', { exact: true })).toHaveFocus(); expect(screen.getByRole('button', { name: 'Save New Password' })).toBeDisabled();
    input('Current Password', 'correct'); expect(screen.queryByText('Current password is incorrect. Try again.')).not.toBeInTheDocument();
  });
  it('keeps a failed methods load closed and offers retry', async () => {
    vi.mocked(apiGetSecurityMethods).mockRejectedValueOnce(new Error('Offline'));
    render(<PasswordSecurityPanel isDark={false} />);
    await screen.findByRole('alert'); expect(screen.queryByText('Set Password')).not.toBeInTheDocument(); fireEvent.click(screen.getByText('Try again')); await screen.findByRole('button', { name: 'Set Password' });
  });
  it('prevents duplicate submissions while saving', async () => {
    let finish!: (value: { success: boolean }) => void;
    vi.mocked(apiSetPassword).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<PasswordSecurityPanel isDark={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Set Password' })); fireEvent.click(screen.getByRole('button', { name: 'Verify with Google' })); fireEvent.click(await screen.findByText('Complete Google verification')); await screen.findByLabelText('New Password', { exact: true });
    input('New Password', 'Safe-password-2026!'); input('Confirm New Password', 'Safe-password-2026!');
    const button = screen.getByRole('button', { name: 'Create Password' }); fireEvent.click(button); fireEvent.click(button);
    expect(apiSetPassword).toHaveBeenCalledTimes(1); expect(screen.getByRole('button', { name: 'Saving password…' })).toBeDisabled(); finish({ success: true }); await waitFor(() => expect(screen.getByText('Password is set.')).toBeInTheDocument());
  });
});
