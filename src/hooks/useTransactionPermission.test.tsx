import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserSession } from '../components/auth/LoginContainer';
import { useApp } from '../context/AppContext';
import { useTransactionPermission } from './useTransactionPermission';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
const approved = { id: 'resident', role: 'seeker', emailVerified: true, verificationStatus: 'APPROVED', isActive: true, moderationStatus: 'ACTIVE' } as UserSession;
function account(user: UserSession | null) { vi.mocked(useApp).mockReturnValue({ user } as ReturnType<typeof useApp>); }
beforeEach(() => { vi.clearAllMocks(); });

describe('marketplace Limited Mode', () => {
  it.each(['seeker', 'provider'] as const)('keeps an approved but suspended %s in browsing mode', role => {
    account({ ...approved, role, moderationStatus: 'SUSPENDED' });
    const { result } = renderHook(() => useTransactionPermission());
    expect(result.current).toMatchObject({ isSuspended: true, canBrowse: true, canTransact: false, canCreateListings: false, canBookServices: false, canAcceptBookings: false, canReview: false });
    // Existing agreement communication and safety have their own authorization.
    expect(result.current.canMessage).toBe(true);
    expect(result.current.canReport).toBe(true);
  });

  it('responds immediately to suspension and administrator restoration without changing verification', () => {
    account(approved);
    const { result, rerender } = renderHook(() => useTransactionPermission());
    expect(result.current.canTransact).toBe(true);
    account({ ...approved, moderationStatus: 'SUSPENDED' }); rerender();
    expect(result.current.canTransact).toBe(false);
    expect(result.current.verificationStatus).toBe('APPROVED');
    account(approved); rerender();
    expect(result.current.canTransact).toBe(true);
    expect(result.current.isSuspended).toBe(false);
  });

  it.each([
    null,
    { ...approved, verificationStatus: 'UNVERIFIED' },
    { ...approved, verificationStatus: 'PENDING_REVIEW' },
    { ...approved, verificationStatus: 'REJECTED' },
    { ...approved, moderationStatus: 'BANNED' },
    { ...approved, moderationStatus: undefined },
    { ...approved, emailVerified: false },
    { ...approved, isActive: false },
  ])('does not authorize a restricted or incomplete identity: %j', user => {
    account(user);
    const { result } = renderHook(() => useTransactionPermission());
    expect(result.current.canTransact).toBe(false);
  });
});
