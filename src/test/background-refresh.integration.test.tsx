import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminCategories from '@/app/admin/categories/page';
import AdminUsers from '@/app/admin/users/page';
import AdminVerifications from '@/app/admin/verifications/page';
import AdminAnnouncements from '@/app/admin/announcements/page';
import AdminAuditLogs from '@/app/admin/audit-logs/page';
import AdminReports from '@/app/admin/reports/page';
import AdminBanAppeals from '@/components/admin/users/AdminBanAppeals';
import AdminCategoryCatalog from '@/components/admin/AdminCategoryCatalog';
import BookingOperations from '@/components/admin/cases/BookingOperations';
import ContentWorkspace from '@/components/admin/content/ContentWorkspace';
import * as admin from '@/api/admin.api';
import { apiGetContentCases } from '@/api/contentWorkspace.api';
import { responseCache, type CacheReason } from '@/lib/api/responseCache';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock('@/context/AppContext', () => ({ useApp: () => ({ isDark: false, user: { id: 'admin', role: 'admin' } }) }));
vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/lib/socket', () => ({ getSocket: () => null }));
vi.mock('@/api/contentWorkspace.api', () => ({ apiGetContentCases: vi.fn(), apiGetContentCase: vi.fn(), apiGetMarketplaceContent: vi.fn(), apiGetMarketplaceItem: vi.fn() }));
vi.mock('@/api/admin.api', () => ({
  apiListAdminCategories: vi.fn(), apiCreateAdminCategory: vi.fn(), apiUpdateAdminCategory: vi.fn(),
  apiListUsers: vi.fn(), apiUpdateTrustScore: vi.fn(), apiSuspendUser: vi.fn(), apiBanUser: vi.fn(), apiRestoreUser: vi.fn(), apiRestorePostingPrivilege: vi.fn(),
  apiListPendingVerifications: vi.fn(), apiReviewVerification: vi.fn(), apiAccessVerificationProof: vi.fn(),
  apiListAnnouncements: vi.fn(), apiCreateAnnouncement: vi.fn(), apiUpdateAnnouncement: vi.fn(), apiListAdminAuditLogs: vi.fn(),
  apiListModerationCases: vi.fn(), apiGetModerationCase: vi.fn(), apiResolveCompletionEscalation: vi.fn(), apiResolveEscalatedCancellation: vi.fn(), apiResolveReport: vi.fn(),
  apiListBanAppeals: vi.fn(), apiDecideBanAppeal: vi.fn(),
  apiListAdminBookings: vi.fn(), apiListAdminPaymentAttempts: vi.fn(), apiListPaymentReconciliation: vi.fn(), apiGetAdminBookingMessages: vi.fn(), apiCancelAdminBooking: vi.fn(), apiResolveBannedParticipantBooking: vi.fn(), apiRetryPaymentReconciliation: vi.fn(),
}));

const pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
const empty = { success: true, data: [], pagination };
const readMocks = [admin.apiListAdminCategories, admin.apiListUsers, admin.apiListPendingVerifications, admin.apiListAnnouncements, admin.apiListAdminAuditLogs, admin.apiListBanAppeals, admin.apiListAdminBookings, admin.apiListAdminPaymentAttempts, admin.apiListPaymentReconciliation, apiGetContentCases];
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: Error) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
const tick = (ms = 0) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const refresh = async (reason: CacheReason = 'focus') => { act(() => responseCache.invalidate(['admin', 'categories', 'content', 'bookings'], reason)); await tick(200); };

describe('loaded workspaces revalidate without replacing content', () => {
  beforeEach(() => {
    vi.useFakeTimers(); vi.resetAllMocks();
    for (const mock of readMocks) vi.mocked(mock).mockResolvedValue(empty);
    vi.mocked(admin.apiListModerationCases).mockResolvedValue({ ...empty, summary: { active: 0, history: 0, concerns: {} } });
  });
  afterEach(() => vi.useRealTimers());

  it('shows the fallback as protected without offering an unusable save action', async () => {
    vi.mocked(admin.apiListAdminCategories).mockResolvedValue({ ...empty, data: [{ id: 'other', name: 'Other Services', isActive: true, listingCount: 0, liveListingCount: 0, requestCount: 0, openRequestCount: 0 }] });
    render(<AdminCategoryCatalog isDark={false} />); await tick();
    fireEvent.click(screen.getByRole('button', { name: 'Manage' }));
    expect(screen.getByLabelText('Category name')).toHaveAttribute('readonly');
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    expect(screen.getByText(/Other Services is the system fallback/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(admin.apiUpdateAdminCategory).not.toHaveBeenCalled();
  });

  it.each([
    ['users', AdminUsers, admin.apiListUsers, 'No users match the search filters.'],
    ['verifications', AdminVerifications, admin.apiListPendingVerifications, 'There are no verifications currently pending review.'],
    ['announcements', AdminAnnouncements, admin.apiListAnnouncements, 'No announcements have been created.'],
    ['audit records', AdminAuditLogs, admin.apiListAdminAuditLogs, 'No audit records found.'],
    ['moderation cases', AdminReports, admin.apiListModerationCases, 'No cases need attention'],
    ['content cases', ContentWorkspace, apiGetContentCases, 'No cases need review'],
    ['ban appeals', AdminBanAppeals, admin.apiListBanAppeals, 'No ban appeals are awaiting review.'],
    ['booking operations', BookingOperations, admin.apiListAdminBookings, 'No bookings match this view.'],
  ] as const)('keeps the confirmed empty %s view during a slow tab-return refresh', async (_name, Page, read, message) => {
    render(<Page />); await tick(); await tick(300); await tick();
    expect(screen.getByText(message)).toBeInTheDocument();
    vi.mocked(read).mockImplementationOnce(() => new Promise(() => {}));
    const calls = vi.mocked(read).mock.calls.length;
    await refresh();
    expect(read).toHaveBeenCalledTimes(calls + 1);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /Loading/ })).not.toBeInTheDocument();
  });

  it.each(['focus', 'online', 'reconnect', 'socket', 'mutation', 'cross-tab'] as const)('retains the category catalog on %s, then shows fresh results', async reason => {
    render(<StrictMode><AdminCategories /></StrictMode>); await tick();
    expect(screen.getByText('No marketplace categories found.')).toBeInTheDocument();
    const catalog = deferred<Awaited<ReturnType<typeof admin.apiListAdminCategories>>>();
    vi.mocked(admin.apiListAdminCategories).mockReturnValueOnce(catalog.promise);
    await refresh(reason);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('No marketplace categories found.')).toBeInTheDocument();
    await act(async () => {
      catalog.resolve({ ...empty, data: [{ id: 'category', name: 'Home repairs', isActive: true, listingCount: 0, liveListingCount: 0, requestCount: 0, openRequestCount: 0 }] });
    });
    expect(screen.getByText('Home repairs')).toBeInTheDocument();
  });

  it('retains populated category rows and reports a refresh failure without pretending the catalog is empty', async () => {
    vi.mocked(admin.apiListAdminCategories).mockResolvedValue({ ...empty, data: [{ id: 'category', name: 'Home repairs', isActive: true, listingCount: 0, liveListingCount: 0, requestCount: 0, openRequestCount: 0 }] });
    render(<AdminCategories />); await tick();
    const request = deferred<Awaited<ReturnType<typeof admin.apiListAdminCategories>>>();
    vi.mocked(admin.apiListAdminCategories).mockReturnValueOnce(request.promise);
    await refresh();
    expect(screen.getByText('Home repairs')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await act(async () => request.reject(new Error('Connection interrupted')));
    expect(screen.getByText('Connection interrupted')).toBeInTheDocument();
    expect(screen.getByText('Home repairs')).toBeInTheDocument();
  });

  it('loads a newly selected catalog page and ignores a late response from the previous page', async () => {
    vi.mocked(admin.apiListAdminCategories).mockResolvedValue({ ...empty, pagination: { ...pagination, total: 11, totalPages: 2 } });
    render(<AdminCategoryCatalog isDark={false} />); await tick();
    const old = deferred<Awaited<ReturnType<typeof admin.apiListAdminCategories>>>();
    const next = deferred<Awaited<ReturnType<typeof admin.apiListAdminCategories>>>();
    vi.mocked(admin.apiListAdminCategories).mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
    await refresh();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('status', { name: 'Loading category catalog' })).toBeInTheDocument();
    await tick();
    await act(async () => old.resolve({ ...empty, data: [{ id: 'old', name: 'Wrong page', isActive: true, listingCount: 0, liveListingCount: 0, requestCount: 0, openRequestCount: 0 }] }));
    expect(screen.queryByText('Wrong page')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    await act(async () => next.resolve(empty));
    expect(screen.getByText('No marketplace categories found.')).toBeInTheDocument();
  });
});
