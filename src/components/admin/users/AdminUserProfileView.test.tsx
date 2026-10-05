import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminUserProfileView from './AdminUserProfileView';
import { adminUsersReturnPath } from './types';
import { adminProfileFixture } from '@/test/fixtures/admin-user-profile';
import { apiGetAdminUserRecords } from '@/api/admin.api';
vi.mock('@/api/admin.api', () => ({ apiGetAdminUserRecords: vi.fn() }));
const back = '/admin/users?search=Alex&page=3&limit=6';
function mount(data = adminProfileFixture) { return render(<AdminUserProfileView data={data} backHref={back} />); }
describe('Admin profile inspection', () => {
  beforeEach(() => vi.clearAllMocks());
  it('shows private account fields read-only and preserves the return context', () => {
    mount();
    expect(screen.getByText('alex@example.test')).toBeInTheDocument();
    expect(screen.getByText('09123456789')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to users/ })).toHaveAttribute('href', back);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('4.7/5 · 3 visible reviews')).toBeInTheDocument();
    expect(screen.getByText('5.0/5 · 1 visible reviews')).toBeInTheDocument();
    expect(apiGetAdminUserRecords).not.toHaveBeenCalled();
  });
  it('loads only the selected account history and supports pagination', async () => {
    vi.mocked(apiGetAdminUserRecords).mockResolvedValue({ data: [{ id: 'event1', title: 'Work completed', createdAt: '2026-09-01T08:00:00Z', delta: 3, scoreBefore: 76, scoreAfter: 79 }], pagination: { page: 1, limit: 10, total: 11, totalPages: 2 } });
    mount(); fireEvent.click(screen.getByRole('button', { name: 'Trust history' }));
    await screen.findByText('Work completed');
    expect(apiGetAdminUserRecords).toHaveBeenCalledWith('member-1', 'trust', 1, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(apiGetAdminUserRecords).toHaveBeenCalledWith('member-1', 'trust', 2, expect.any(AbortSignal)));
  });
  it('shows history failure with retry rather than a false empty state', async () => {
    vi.mocked(apiGetAdminUserRecords).mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    mount(); fireEvent.click(screen.getByRole('button', { name: 'Reviews' }));
    await screen.findByRole('alert'); expect(screen.queryByText('No reviews recorded for this account.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('No reviews recorded for this account.');
  });
  it('does not allow profile links or return paths to execute unsafe URLs', () => {
    mount({ ...adminProfileFixture, user: { ...adminProfileFixture.user, websiteUrl: 'javascript:alert(1)' } });
    expect(screen.queryByRole('link', { name: /Website/ })).not.toBeInTheDocument();
    expect(adminUsersReturnPath('https://example.com')).toBe('/admin/users');
    expect(adminUsersReturnPath('/admin/users-malicious')).toBe('/admin/users');
    expect(adminUsersReturnPath(back)).toBe(back);
  });
});
