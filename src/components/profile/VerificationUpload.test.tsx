import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerificationUpload from './VerificationUpload';
import { apiGetVerificationStatus, apiGetVerificationPrivacyNotice, apiUploadVerificationImage, apiSubmitVerification, type VerificationStatusData } from '../../api/verifications.api';
import { invalidateApiCache } from '../../lib/api/responseCache';

vi.mock('../../api/verifications.api', () => ({
  apiGetVerificationStatus: vi.fn(), apiGetVerificationPrivacyNotice: vi.fn(),
  apiSubmitVerification: vi.fn(), apiUploadVerificationImage: vi.fn(),
}));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));

const decision: VerificationStatusData = {
  id: 'verification', status: 'APPROVED', adminNotes: 'Your residency documents are confirmed.\nThank you for providing a clear address.',
  submittedAt: '2026-10-08T03:00:00.000Z', reviewedAt: '2026-10-08T04:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiGetVerificationStatus).mockResolvedValue({ success: true, data: decision });
  vi.mocked(apiGetVerificationPrivacyNotice).mockResolvedValue({ data: { version: 'v1', notice: 'Private document notice', minimumRetentionDays: 30 } });
});

describe('Private verification decisions', () => {
  it.each([false, true])('shows the saved approval message and review date in theme dark=%s', async isDark => {
    render(<VerificationUpload isDark={isDark} embedded />);
    await screen.findByRole('heading', { name: 'Verification approved' });
    expect(screen.getByText('Message from admin').nextElementSibling?.textContent).toBe(decision.adminNotes);
    expect(screen.getByText(/^Reviewed/).querySelector('time')).toHaveAttribute('dateTime', decision.reviewedAt);
    expect(screen.queryByRole('button', { name: /Submit for Verification/ })).not.toBeInTheDocument();
  });

  it('allows an approval without inventing an admin message', async () => {
    vi.mocked(apiGetVerificationStatus).mockResolvedValue({ success: true, data: { ...decision, adminNotes: null } });
    render(<VerificationUpload isDark={false} embedded />);
    await screen.findByRole('heading', { name: 'Verification approved' });
    expect(screen.queryByText('Message from admin')).not.toBeInTheDocument();
  });

  it('shows the actual rejection reason and offers resubmission', async () => {
    const reason = 'Please provide a document showing your current Cordova address.';
    vi.mocked(apiGetVerificationStatus).mockResolvedValue({ success: true, data: { ...decision, status: 'REJECTED', adminNotes: reason } });
    render(<VerificationUpload isDark={false} embedded />);
    await screen.findByRole('heading', { name: 'Reason for rejection' });
    expect(screen.getByText(reason)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resubmit Documents for Review' })).toBeInTheDocument();
    expect(screen.queryByText(/Uploaded photos were unreadable/)).not.toBeInTheDocument();
  });

  it('offers retry after a status error without showing a false unsubmitted state', async () => {
    vi.mocked(apiGetVerificationStatus).mockRejectedValueOnce(new Error('Network failed'));
    render(<VerificationUpload isDark={false} embedded />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry verification details' }));
    await screen.findByRole('heading', { name: 'Verification approved' });
    expect(apiGetVerificationStatus).toHaveBeenCalledTimes(2);
  });

  it('updates an open verification view when the account status cache is invalidated', async () => {
    vi.mocked(apiGetVerificationStatus).mockResolvedValueOnce({ success: true, data: { ...decision, status: 'PENDING_REVIEW', adminNotes: null, reviewedAt: null } });
    render(<VerificationUpload isDark={false} embedded />);
    await screen.findByRole('heading', { name: 'Verification under review' });
    act(() => invalidateApiCache(['profiles'], 'socket'));
    await screen.findByRole('heading', { name: 'Verification approved' });
    expect(screen.getByText('Message from admin')).toBeInTheDocument();
    await waitFor(() => expect(apiGetVerificationStatus).toHaveBeenCalledTimes(2));
  });

  it('keeps the loaded decision visible while a tab-focus refresh is pending', async () => {
    render(<VerificationUpload isDark={false} embedded />);
    await screen.findByRole('heading', { name: 'Verification approved' });
    vi.mocked(apiGetVerificationStatus).mockImplementationOnce(() => new Promise(() => {}));
    act(() => invalidateApiCache(['profiles'], 'focus'));
    await waitFor(() => expect(apiGetVerificationStatus).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('heading', { name: 'Verification approved' })).toBeInTheDocument();
    expect(screen.queryByText('Loading verification decision...')).not.toBeInTheDocument();
  });

  it('retains the chosen photo, retries the privacy notice, and submits acknowledged proof', async () => {
    vi.mocked(apiGetVerificationStatus).mockResolvedValueOnce({ success: true, data: null });
    vi.mocked(apiGetVerificationPrivacyNotice).mockRejectedValueOnce(new Error('Could not load the privacy notice. Try again.'));
    vi.mocked(apiUploadVerificationImage).mockResolvedValue({ data: { storageKey: 'servicehub/verification/resident/document.jpg' } });
    vi.mocked(apiSubmitVerification).mockResolvedValue({ success: true });
    render(<VerificationUpload isDark={false} embedded />);
    await screen.findByRole('button', { name: 'Retry privacy notice' });
    fireEvent.change(screen.getByLabelText('Upload document photo 1'), { target: { files: [new File(['photo'], 'document.jpg', { type: 'image/jpeg' })] } });
    await screen.findByText('document.jpg');
    expect(screen.getByRole('button', { name: 'Submit for Verification' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry privacy notice' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: /I acknowledge privacy notice/ }));
    expect(screen.getByText('document.jpg')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit for Verification' }));
    await waitFor(() => expect(apiSubmitVerification).toHaveBeenCalledWith([
      { storageKey: 'servicehub/verification/resident/document.jpg', documentType: 'GOVERNMENT_ID' },
    ], 'v1'));
  });

  it('shows a recoverable error for an empty privacy response instead of perpetual loading', async () => {
    vi.mocked(apiGetVerificationStatus).mockResolvedValue({ success: true, data: null });
    vi.mocked(apiGetVerificationPrivacyNotice).mockResolvedValueOnce({ success: true, data: null });
    render(<VerificationUpload isDark={false} embedded />);
    await screen.findByRole('button', { name: 'Retry privacy notice' });
    expect(screen.queryByText('Loading the current verification privacy notice...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit for Verification' })).toBeDisabled();
  });
});
