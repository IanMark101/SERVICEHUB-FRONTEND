import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { apiGetMyRequests } from '../../api/requests.api';
import RequestManager from './RequestManager';
import { invalidateApiCache } from '../../lib/api/responseCache';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../api/requests.api', () => ({ apiGetMyRequests: vi.fn() }));
vi.mock('../../api/ai.api', () => ({ apiMatchProviders: vi.fn() }));
vi.mock('../ui/PaginationBar', () => ({ default: () => null }));

const request = { id: 'request-1', seekerId: 'seeker-1', seekerName: 'Ian', seekerAvatar: '', title: 'PIPE REPAIR', description: 'Repair the leaking kitchen pipe.', category: 'Plumbing', budget: 500, urgency: 'Flexible', status: 'CLOSED', createdAt: '2026-10-01', paymentMethods: { cash: true, gcash: false } };
const toggle = vi.fn();
const edit = vi.fn();
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('Request Manager activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({ jobRequests: [request], bids: [], toggleJobRequestStatus: toggle, deleteJobRequest: vi.fn(), editJobRequest: edit, isDark: false } as unknown as ReturnType<typeof useApp>);
  });

  it('keeps activation after a late stale owner-list response and a public-board refresh', async () => {
    const initialRead = deferred<{ success: boolean; data: unknown[] }>();
    const update = deferred<boolean>();
    vi.mocked(apiGetMyRequests).mockReturnValue(initialRead.promise);
    toggle.mockReturnValue(update.promise);
    const { rerender } = render(<RequestManager currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('switch', { name: 'Activate PIPE REPAIR' }));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch')).toBeDisabled();
    await act(async () => { update.resolve(true); });
    await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
    await act(async () => { initialRead.resolve({ success: true, data: [request] }); });
    vi.mocked(useApp).mockReturnValue({ jobRequests: [], bids: [], toggleJobRequestStatus: toggle, deleteJobRequest: vi.fn(), editJobRequest: vi.fn(), isDark: false } as unknown as ReturnType<typeof useApp>);
    rerender(<RequestManager currentUserId="seeker-1" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(screen.getByText('On-site Cash')).toBeInTheDocument();
    expect(screen.queryByText('GCash · Test Mode')).not.toBeInTheDocument();
  });

  it('rolls back only when the update is rejected and then allows retry', async () => {
    vi.mocked(apiGetMyRequests).mockReturnValue(new Promise(() => {}));
    toggle.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<RequestManager currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(screen.getByText('Paused')).toBeInTheDocument());
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('switch'));
    await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
  });

  it('keeps both directions stable across repeated toggles', async () => {
    vi.mocked(apiGetMyRequests).mockReturnValue(new Promise(() => {}));
    toggle.mockResolvedValue(true);
    render(<RequestManager currentUserId="seeker-1" />);
    for (const expected of ['Active', 'Paused', 'Active']) {
      fireEvent.click(screen.getByRole('switch'));
      await waitFor(() => expect(screen.getByText(expected)).toBeInTheDocument());
      expect(screen.getByRole('switch')).toBeEnabled();
    }
    expect(toggle.mock.calls.map((call) => call[1])).toEqual(['CLOSED', 'OPEN', 'CLOSED']);
  });

  it('shows pending progress, prevents duplicate saves, and displays confirmed edits despite a stale owner-list read', async () => {
    const initialRead = deferred<{ success: boolean; data: unknown[] }>();
    const saved = { title: 'PIPE REPAI', budget: 650, description: 'Updated pipe repair details.' };
    const update = deferred<typeof saved>();
    vi.mocked(apiGetMyRequests).mockReturnValue(initialRead.promise);
    edit.mockReturnValue(update.promise);
    const { rerender } = render(<RequestManager currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit PIPE REPAIR' }));
    fireEvent.change(screen.getByLabelText('Request Title'), { target: { value: 'PIPE REPAI' } });
    fireEvent.change(screen.getByLabelText('Estimated Budget (₱)'), { target: { value: '650' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: saved.description } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(screen.getByRole('button', { name: /Saving changes/ })).toBeDisabled();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('Request Title')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close edit request' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: /Saving changes/ }).closest('form')!);
    expect(edit).toHaveBeenCalledTimes(1);
    expect(edit).toHaveBeenCalledWith(request.id, saved.title, saved.budget, saved.description, undefined);

    await act(async () => { update.resolve(saved); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
    expect(screen.getByText(saved.description)).toBeInTheDocument();
    expect(screen.getByText('₱650')).toBeInTheDocument();

    await act(async () => { initialRead.resolve({ success: true, data: [{ ...request, budgetMax: 500 }] }); });
    vi.mocked(useApp).mockReturnValue({ jobRequests: [], bids: [], toggleJobRequestStatus: toggle, deleteJobRequest: vi.fn(), editJobRequest: edit, isDark: false } as unknown as ReturnType<typeof useApp>);
    rerender(<RequestManager currentUserId="seeker-1" />);
    expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
    expect(screen.getByText('₱650')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Edit ${saved.title}` }));
    expect(screen.getByLabelText('Request Title')).toHaveValue(saved.title);
    expect(screen.getByLabelText('Estimated Budget (₱)')).toHaveValue(650);
  });

  it('keeps unsaved changes open after a rejected save and allows a successful retry', async () => {
    vi.mocked(apiGetMyRequests).mockReturnValue(new Promise(() => {}));
    const saved = { title: 'PIPE REPAI', budget: request.budget, description: request.description };
    edit.mockResolvedValueOnce(null).mockResolvedValueOnce(saved);
    render(<RequestManager currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit PIPE REPAIR' }));
    fireEvent.change(screen.getByLabelText('Request Title'), { target: { value: saved.title } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Request Title')).toHaveValue(saved.title);
    expect(screen.getByRole('heading', { name: request.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: saved.title })).toBeInTheDocument();
  });
});

describe('Request Manager deletion', () => {
  const remove = vi.fn();
  const open = { ...request, status: 'OPEN', canDelete: true };
  const context = (row = open, bids: unknown[] = []) => ({ jobRequests: [row], bids, jobEngagements: [{ id: 'booking-1', status: 'in_progress' }], toggleJobRequestStatus: toggle, deleteJobRequest: remove, editJobRequest: edit, isDark: false } as unknown as ReturnType<typeof useApp>);
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue(context());
    vi.mocked(apiGetMyRequests).mockResolvedValue({ success: true, data: [open] });
  });

  it('keeps the exact card in place while deleting and after rejection, including a refresh and remount', async () => {
    const response = deferred<boolean>();
    remove.mockReturnValue(response.promise);
    const { unmount } = render(<RequestManager currentUserId="seeker-1" />);
    const heading = await screen.findByRole('heading', { name: open.title });
    fireEvent.click(screen.getByRole('button', { name: `Delete ${open.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete Request' }));
    expect(screen.getByRole('heading', { name: open.title })).toBe(heading);
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
    await act(async () => { response.resolve(false); });
    expect(screen.getByRole('heading', { name: open.title })).toBe(heading);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(apiGetMyRequests).toHaveBeenCalledTimes(1);
    await act(async () => { invalidateApiCache(['requests'], 'socket'); });
    await waitFor(() => expect(apiGetMyRequests).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('heading', { name: open.title })).toBe(heading);
    unmount();
    render(<RequestManager currentUserId="seeker-1" />);
    expect(await screen.findByRole('heading', { name: open.title })).toBeInTheDocument();
  });

  it('removes an open request only on success and never brings it back from a late stale read', async () => {
    const initialRead = deferred<{ success: boolean; data: unknown[] }>();
    vi.mocked(apiGetMyRequests).mockReturnValue(initialRead.promise);
    remove.mockResolvedValue(true);
    render(<RequestManager currentUserId="seeker-1" />);
    fireEvent.click(screen.getByRole('button', { name: `Delete ${open.title}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete Request' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: open.title })).not.toBeInTheDocument());
    await act(async () => { initialRead.resolve({ success: true, data: [open] }); });
    expect(screen.queryByRole('heading', { name: open.title })).not.toBeInTheDocument();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it.each(['booking', 'accepted offer', 'pending payment', 'server protection'])('shows information instead of destructive confirmation for %s', async scenario => {
    const row = { ...open,
      ...(scenario === 'booking' ? { status: 'IN_PROGRESS' } : {}),
      ...(scenario === 'accepted offer' ? { offers: [{ status: 'ACCEPTED' }] } : {}),
      ...(scenario === 'pending payment' ? { offers: [{ status: 'PENDING_PAYMENT' }] } : {}),
      ...(scenario === 'server protection' ? { canDelete: false, deleteBlockedReason: 'This request can’t be deleted while a refund is being processed.' } : {}),
    };
    vi.mocked(apiGetMyRequests).mockResolvedValue({ success: true, data: [row] });
    const navigate = vi.fn();
    render(<RequestManager currentUserId="seeker-1" onNavigateToActivity={navigate} />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: `Delete ${open.title}` }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Request can’t be deleted');
    expect(screen.queryByRole('button', { name: 'Yes, Delete Request' })).not.toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: open.title })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'View Booking' }));
    expect(navigate).toHaveBeenCalledOnce();
  });

  it('replaces an already-open destructive confirmation when an offer is accepted', async () => {
    const { rerender } = render(<RequestManager currentUserId="seeker-1" />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: `Delete ${open.title}` }));
    expect(screen.getByRole('button', { name: 'Yes, Delete Request' })).toBeInTheDocument();
    vi.mocked(useApp).mockReturnValue(context(open, [{ requestId: open.id, status: 'accepted' }]));
    rerender(<RequestManager currentUserId="seeker-1" />);
    expect(screen.getByRole('dialog')).toHaveTextContent('an offer has already been accepted');
    expect(screen.queryByRole('button', { name: 'Yes, Delete Request' })).not.toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
  });
});
