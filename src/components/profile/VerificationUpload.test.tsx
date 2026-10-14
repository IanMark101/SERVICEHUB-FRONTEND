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

describe('Document upload guidance', () => {
  beforeEach(() => {
    vi.mocked(apiGetVerificationStatus).mockResolvedValue({ success: true, data: null });
  });

  it.each([
    ['identity.svg', 'image/svg+xml'],
    ['identity.pdf', 'application/pdf'],
    ['identity.gif', 'image/gif'],
    ['identity.txt', 'text/plain'],
  ])('explains how to replace an unacceptable %s without uploading it', async (name, type) => {
    render(<VerificationUpload isDark={false} embedded />);
    const picker = await screen.findByLabelText('Upload document photo 1');
    fireEvent.change(picker, { target: { files: [new File(['document'], name, { type })] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('This file can’t be used. Choose a JPG, PNG, or WebP photo of your document.');
    expect(picker).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Choose document photo 1' })).toHaveAccessibleDescription(/This file can’t be used/);
    expect(apiUploadVerificationImage).not.toHaveBeenCalled();
    expect(apiSubmitVerification).not.toHaveBeenCalled();
  });

  it('explains the size limit and clears the error after choosing a suitable photo', async () => {
    render(<VerificationUpload isDark={true} embedded />);
    const picker = await screen.findByLabelText('Upload document photo 1');
    const oversized = new File(['document'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(oversized, 'size', { value: 5 * 1024 * 1024 + 1 });
    fireEvent.change(picker, { target: { files: [oversized] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a photo no larger than 5 MB');
    expect(apiUploadVerificationImage).not.toHaveBeenCalled();
    fireEvent.change(picker, { target: { files: [new File(['document'], 'small.jpg', { type: 'image/jpeg' })] } });
    await screen.findByText('small.jpg');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(picker).toHaveAttribute('aria-invalid', 'false');
  });

  it('keeps a previous acceptable photo when its replacement cannot be used', async () => {
    render(<VerificationUpload isDark={false} embedded />);
    const picker = await screen.findByLabelText('Upload document photo 1');
    fireEvent.change(picker, { target: { files: [new File(['document'], 'id.png', { type: 'image/png' })] } });
    await screen.findByText('id.png');
    fireEvent.change(picker, { target: { files: [new File(['svg'], 'id.svg', { type: 'image/svg+xml' })] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Your previous photo is still selected.');
    expect(screen.getByText('id.png')).toBeInTheDocument();
  });

  it('explains an empty file before trying to read or upload it', async () => {
    render(<VerificationUpload isDark={false} embedded />);
    const picker = await screen.findByLabelText('Upload document photo 1');
    fireEvent.change(picker, { target: { files: [new File([], 'empty.jpg', { type: 'image/jpeg' })] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('This file is empty. Choose another photo of your document.');
    expect(apiUploadVerificationImage).not.toHaveBeenCalled();
  });

  it('offers a readable next step when the device cannot read the photo', async () => {
    const read = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      this.dispatchEvent(new ProgressEvent('error'));
    });
    try {
      render(<VerificationUpload isDark={false} embedded />);
      const picker = await screen.findByLabelText('Upload document photo 1');
      fireEvent.change(picker, { target: { files: [new File(['document'], 'id.jpg', { type: 'image/jpeg' })] } });
      expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t open this photo. Choose it again or use another photo.');
      expect(apiUploadVerificationImage).not.toHaveBeenCalled();
    } finally { read.mockRestore(); }
  });

  it.each([
    [{ isAxiosError: true, response: { status: 400, data: { error: 'Unsupported source URL: data:image/svg+xml;base64,PHN2Zz4=' } } }, 'Choose a JPG, PNG, or WebP photo'],
    [{ isAxiosError: true, response: { status: 400, data: { error: 'Invalid input: expected string, received undefined' } } }, 'Check the form and try again'],
    [{ isAxiosError: true, code: 'ERR_NETWORK' }, 'Check your internet connection and try again'],
    [{ isAxiosError: true, response: { status: 500, data: { error: 'Cloudinary upload failed in C:\\private\\server.ts' } } }, 'Your selected photos are still here'],
  ])('makes a server or connection rejection readable and keeps the selected photo', async (error, expected) => {
    vi.mocked(apiUploadVerificationImage).mockRejectedValueOnce(error);
    render(<VerificationUpload isDark={false} embedded />);
    const picker = await screen.findByLabelText('Upload document photo 1');
    fireEvent.change(picker, { target: { files: [new File(['document'], 'id.webp', { type: 'image/webp' })] } });
    await screen.findByText('id.webp');
    fireEvent.click(await screen.findByRole('checkbox', { name: /I acknowledge privacy notice/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit for Verification' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(expected);
    expect(screen.getByText('id.webp')).toBeInTheDocument();
    expect(apiSubmitVerification).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Submit for Verification' })).toBeEnabled();
  });

  it('also translates a non-throwing submission rejection', async () => {
    vi.mocked(apiUploadVerificationImage).mockResolvedValue({ data: { storageKey: 'private/document.jpg' } });
    vi.mocked(apiSubmitVerification).mockResolvedValue({ success: false, error: 'Validation failed' });
    render(<VerificationUpload isDark={false} embedded />);
    const picker = await screen.findByLabelText('Upload document photo 1');
    fireEvent.change(picker, { target: { files: [new File(['document'], 'id.jpg', { type: 'image/jpeg' })] } });
    await screen.findByText('id.jpg');
    fireEvent.click(await screen.findByRole('checkbox', { name: /I acknowledge privacy notice/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit for Verification' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Some details are missing or need changing. Check the form and try again.');
    expect(screen.getByText('id.jpg')).toBeInTheDocument();
  });
});
