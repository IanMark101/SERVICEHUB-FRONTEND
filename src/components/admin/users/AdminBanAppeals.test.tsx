import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminBanAppeals, { type AdminAppeal } from './AdminBanAppeals';
import { apiDecideBanAppeal, apiListBanAppeals } from '@/api/admin.api';
vi.mock('@/api/admin.api', () => ({ apiDecideBanAppeal: vi.fn(), apiListBanAppeals: vi.fn() }));
vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn() }) }));
const appeal: AdminAppeal = { id: 'appeal-1', status: 'PENDING', message: 'Please review my ban and the supporting evidence.', createdAt: '2026-10-01T08:00:00Z',
  user: { id: 'member-1', name: 'Alex Reyes', email: 'alex@example.test', moderationStatus: 'BANNED' },
  banAuditLog: { reason: 'Original ban finding', createdAt: '2026-09-30T08:00:00Z' }, moderationHistory: [] };
const response = (data: AdminAppeal[]) => ({ data, pagination: { total: data.length, totalPages: 1 } });
describe('Separate Ban Appeals workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiListBanAppeals).mockResolvedValue(response([appeal])); });
  it('loads pending appeals separately and links to the admin profile', async () => {
    render(<AdminBanAppeals />); await screen.findByText('Alex Reyes');
    expect(apiListBanAppeals).toHaveBeenCalledWith({ view: 'pending', status: undefined, page: 1, limit: 10 });
    fireEvent.click(screen.getByRole('button', { name: 'Review appeal' }));
    expect(screen.getByRole('link', { name: /View profile/ })).toHaveAttribute('href', '/admin/users/member-1?returnTo=%2Fadmin%2Fban-appeals%3Fview%3Dpending');
  });
  it('history retains original ban reason and recorded decision after account restoration', async () => {
    vi.mocked(apiListBanAppeals).mockResolvedValue(response([{ ...appeal, status: 'APPROVED', decisionReason: 'Evidence supports restoration', decidedAt: '2026-10-02T08:00:00Z', user: { ...appeal.user, moderationStatus: 'ACTIVE', moderationReason: null } }]));
    render(<AdminBanAppeals initialView="history" />); fireEvent.click(await screen.findByRole('button', { name: 'View outcome' }));
    expect(screen.getByText('Evidence supports restoration')).toBeInTheDocument();
    expect(screen.getByText('Original ban finding')).toBeInTheDocument();
    expect(apiListBanAppeals).toHaveBeenCalledWith({ view: 'history', status: undefined, page: 1, limit: 10 });
    expect(screen.queryByRole('button', { name: 'Approve and unban' })).not.toBeInTheDocument();
  });
  it('requires a reason, keeps failed decisions reviewable, and traps focus in the dialog', async () => {
    vi.mocked(apiDecideBanAppeal).mockRejectedValue(new Error('Account status changed'));
    render(<AdminBanAppeals />); await screen.findByText('Alex Reyes');
    const trigger = screen.getByRole('button', { name: 'Review appeal' });
    trigger.focus(); fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Confirm decision' })).toBeDisabled();
    expect(screen.getByRole('dialog')).toHaveFocus();
    fireEvent.click(screen.getByRole('radio', { name: 'Approve and unban' }));
    expect(screen.getByRole('button', { name: 'Confirm decision' })).toBeDisabled();
    const reason = screen.getByLabelText('Decision reason shown to the user');
    fireEvent.change(reason, { target: { value: 'The evidence supports restoring this account.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));
    await screen.findByText('Account status changed');
    expect(apiDecideBanAppeal).toHaveBeenCalledWith('appeal-1', 'APPROVED', 'The evidence supports restoring this account.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
  it('does not show stale pending responses after switching to history', async () => {
    let complete: (value: ReturnType<typeof response>) => void = () => {};
    vi.mocked(apiListBanAppeals).mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
    vi.mocked(apiListBanAppeals).mockResolvedValue(response([]));
    render(<AdminBanAppeals />);
    await waitFor(() => expect(apiListBanAppeals).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'History' }));
    await screen.findByText('No reviewed appeals match this filter.');
    complete(response([appeal]));
    await waitFor(() => expect(screen.queryByText('Alex Reyes')).not.toBeInTheDocument());
  });
  it('requires an explicit decision and submits rejection with the entered reason', async () => {
    vi.mocked(apiDecideBanAppeal).mockResolvedValue({ success: true });
    render(<AdminBanAppeals />);
    fireEvent.click(await screen.findByRole('button', { name: 'Review appeal' }));
    fireEvent.change(screen.getByLabelText('Decision reason shown to the user'), { target: { value: 'The original finding is supported by the evidence.' } });
    expect(screen.getByRole('button', { name: 'Confirm decision' })).toBeDisabled();
    expect(apiDecideBanAppeal).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('radio', { name: 'Reject appeal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm decision' }));
    await waitFor(() => expect(apiDecideBanAppeal).toHaveBeenCalledWith('appeal-1', 'REJECTED', 'The original finding is supported by the evidence.'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('keeps a pending appeal read-only when the account is already restored', async () => {
    vi.mocked(apiListBanAppeals).mockResolvedValue(response([{ ...appeal, user: { ...appeal.user, moderationStatus: 'ACTIVE' } }]));
    render(<AdminBanAppeals />);
    fireEvent.click(await screen.findByRole('button', { name: 'Review appeal' }));
    expect(screen.getByText('This account is no longer banned. A new appeal decision is unavailable.')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm decision' })).not.toBeInTheDocument();
    expect(apiDecideBanAppeal).not.toHaveBeenCalled();
  });
});
