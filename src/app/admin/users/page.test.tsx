import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import AdminUsers from './page';
import { apiListUsers } from '@/api/admin.api';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock('@/context/AppContext', () => ({ useApp: () => ({ isDark: false, user: { id: 'admin-1', role: 'admin' } }) }));
vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/api/admin.api', () => ({ apiListUsers: vi.fn(), apiUpdateTrustScore: vi.fn(), apiSuspendUser: vi.fn(), apiBanUser: vi.fn(), apiRestoreUser: vi.fn(), apiRestorePostingPrivilege: vi.fn() }));

it('keeps user inspection and moderation available without administrator promotion', async () => {
  vi.mocked(apiListUsers).mockResolvedValue({ success: true, data: [{ id: 'member-1', name: 'Alex Reyes', email: 'alex@example.test', role: 'user', trustScore: 79, moderationStatus: 'ACTIVE', isActive: true }], pagination: { total: 1, totalPages: 1 } });
  render(<AdminUsers />);
  await screen.findByText('Alex Reyes');
  expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute('href', expect.stringContaining('/admin/users/member-1?returnTo='));
  expect(screen.getByRole('button', { name: 'Set Trust' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Ban' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Make Admin|Promote/i })).not.toBeInTheDocument();
  expect(screen.queryByText('Promote to Administrator')).not.toBeInTheDocument();
});
