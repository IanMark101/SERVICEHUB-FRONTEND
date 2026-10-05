import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import AccountDeletionPanel from './AccountDeletionPanel';
import { apiDeleteOwnAccount, apiGetAccountDeletionEligibility } from '../../../api/users.api';

vi.mock('../../../api/users.api', () => ({ apiDeleteOwnAccount: vi.fn(), apiGetAccountDeletionEligibility: vi.fn(), apiStartDeletionGoogleVerification: vi.fn() }));
vi.mock('../../../lib/socket', () => ({ disconnectSocket: vi.fn() }));
vi.mock('../../../lib/api/axios', () => ({ clearAccessToken: vi.fn() }));
const clear = { eligible: true, counts: {}, blockers: [], googleAvailable: false };
const blocked = { ...clear, eligible: false, counts: { activeListings: 2, openRequests: 1, nonterminalBookings: 1 }, blockers: [{ type: 'activeListings', count: 2 }, { type: 'openRequests', count: 1 }, { type: 'nonterminalBookings', count: 1 }] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiGetAccountDeletionEligibility).mockResolvedValue({ success: true, data: clear });
  vi.mocked(apiDeleteOwnAccount).mockRejectedValue({ isAxiosError: true, response: { status: 403, data: { error: 'Your current password is incorrect.' } } });
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

async function reachPassword() {
  render(<AccountDeletionPanel email="owner@example.test" isDark={false} />);
  const begin = screen.getByRole('button', { name: /Continue to account deletion/ });
  await waitFor(() => expect(begin).toBeEnabled());
  fireEvent.click(begin);
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText(/Type DELETE/), { target: { value: 'DELETE' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Continue to verification' }));
  return dialog;
}

describe('account deletion safeguards', () => {
  it('shows actionable blockers in both workspaces and prevents starting deletion', async () => {
    vi.mocked(apiGetAccountDeletionEligibility).mockResolvedValue({ success: true, data: blocked });
    render(<AccountDeletionPanel email="owner@example.test" isDark />);
    expect(await screen.findByText('2 published service listings')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Service Manager' })).toHaveAttribute('href', '/provider/service-manager');
    expect(screen.getByRole('link', { name: 'Request Manager' })).toHaveAttribute('href', '/seeker/request-manager');
    expect(screen.getByRole('button', { name: /Continue to account deletion/ })).toBeDisabled();
    expect(apiDeleteOwnAccount).not.toHaveBeenCalled();
  });
  it('typing DELETE only advances to password verification', async () => {
    const dialog = await reachPassword();
    expect(within(dialog).getByLabelText('Current account password')).toHaveAttribute('type', 'password');
    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toBeDisabled();
    expect(apiDeleteOwnAccount).not.toHaveBeenCalled();
  });
  it('states that database and shared history removal is permanent before confirmation', async () => {
    render(<AccountDeletionPanel email="owner@example.test" isDark={false} />);
    const begin = screen.getByRole('button', { name: /Continue to account deletion/ });
    await waitFor(() => expect(begin).toBeEnabled()); fireEvent.click(begin);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/account, profile, login details, and verification records/)).toBeInTheDocument();
    expect(within(dialog).getByText(/removed for both participants/)).toBeInTheDocument();
  });
  it('checks again before opening the dialog, catching newly created commitments', async () => {
    vi.mocked(apiGetAccountDeletionEligibility).mockResolvedValueOnce({ success: true, data: clear }).mockResolvedValue({ success: true, data: blocked });
    render(<AccountDeletionPanel email="owner@example.test" isDark={false} />);
    const begin = screen.getByRole('button', { name: /Continue to account deletion/ });
    await waitFor(() => expect(begin).toBeEnabled()); fireEvent.click(begin);
    expect(await screen.findByText('2 published service listings')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('submits the entered password only at the final step and keeps errors inline', async () => {
    const dialog = await reachPassword();
    const password = within(dialog).getByLabelText('Current account password');
    fireEvent.change(password, { target: { value: 'wrong-password' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your current password is incorrect.');
    expect(apiDeleteOwnAccount).toHaveBeenCalledWith({ method: 'password', password: 'wrong-password' });
    expect(password).toHaveValue('');
    expect(password).toHaveFocus();
  });
  it('returns to the updated checklist if the server finds a new blocker', async () => {
    vi.mocked(apiDeleteOwnAccount).mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { code: 'ACCOUNT_DELETION_BLOCKED', data: blocked } } });
    const dialog = await reachPassword();
    fireEvent.change(within(dialog).getByLabelText('Current account password'), { target: { value: 'valid-password' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }));
    expect(await screen.findByText('2 published service listings')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to account deletion/ })).toBeDisabled();
  });
  it('fails closed on eligibility errors and supports a retry', async () => {
    vi.mocked(apiGetAccountDeletionEligibility).mockRejectedValueOnce(new Error('Connection failed'));
    render(<AccountDeletionPanel email="owner@example.test" isDark={false} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection failed');
    expect(screen.getByRole('button', { name: /Continue to account deletion/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Continue to account deletion/ })).toBeEnabled());
  });
});
