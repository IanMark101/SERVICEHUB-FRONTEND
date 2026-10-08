import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminVerifications from './page';
import { apiListPendingVerifications, apiReviewVerification } from '../../../api/admin.api';

vi.mock('../../../context/AppContext', () => ({ useApp: () => ({ isDark: false }) }));
vi.mock('../../../components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('../../../lib/socket', () => ({ getSocket: () => null }));
vi.mock('../../../api/admin.api', () => ({ apiListPendingVerifications: vi.fn(), apiReviewVerification: vi.fn(), apiAccessVerificationProof: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiListPendingVerifications).mockResolvedValue({ success: true, data: [{
    id: 'submission', userId: 'resident', status: 'PENDING_REVIEW', submittedAt: '2026-10-08T03:00:00.000Z',
    user: { id: 'resident', name: 'Cordova Resident', email: 'resident@example.test' }, proofs: [],
  }], pagination: { total: 1, totalPages: 1 } });
  vi.mocked(apiReviewVerification).mockResolvedValue({ success: true });
});

describe('Admin residency review messages', () => {
  it('allows approval without a message and explains who sees an optional message', async () => {
    render(<AdminVerifications />);
    fireEvent.click(await screen.findByRole('button', { name: 'Approve verification' }));
    expect(screen.getByLabelText('Message to resident (optional)')).not.toBeRequired();
    expect(screen.getByText(/visible to the resident in their private verification details/)).toBeInTheDocument();
    const approve = screen.getAllByRole('button', { name: 'Approve verification' }).find(button => button.getAttribute('type') === 'submit')!;
    fireEvent.click(approve);
    await waitFor(() => expect(apiReviewVerification).toHaveBeenCalledWith('submission', true, ''));
  });

  it('requires a rejection reason and submits the exact resident message', async () => {
    render(<AdminVerifications />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reject proofs' }));
    const field = screen.getByLabelText('Reason for rejection (required)');
    const reject = screen.getByRole('button', { name: 'Reject verification' });
    expect(field).toBeRequired();
    expect(reject).toBeDisabled();
    fireEvent.change(field, { target: { value: 'Provide a document with your current address.' } });
    expect(reject).toBeEnabled();
    fireEvent.click(reject);
    await waitFor(() => expect(apiReviewVerification).toHaveBeenCalledWith('submission', false, 'Provide a document with your current address.'));
  });
});
