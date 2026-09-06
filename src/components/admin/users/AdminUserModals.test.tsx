import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminUserModals from './AdminUserModals';

function createModel(overrides: Record<string, unknown> = {}) {
  return {
    isDark: false,
    editingTrustUser: null,
    setEditingTrustUser: vi.fn(),
    trustDelta: 0,
    setTrustDelta: vi.fn(),
    trustReason: '',
    setTrustReason: vi.fn(),
    handleUpdateTrust: vi.fn(),
    suspendingUser: null,
    setSuspendingUser: vi.fn(),
    suspendReason: '',
    setSuspendReason: vi.fn(),
    suspendDuration: 7,
    setSuspendDuration: vi.fn(),
    handleSuspend: vi.fn(),
    banningUser: null,
    setBanningUser: vi.fn(),
    banReason: '',
    setBanReason: vi.fn(),
    handleBan: vi.fn(),
    confirmRestoreUserId: null,
    setConfirmRestoreUserId: vi.fn(),
    handleRestore: vi.fn(),
    promotingUser: null,
    setPromotingUser: vi.fn(),
    promotionReason: '',
    setPromotionReason: vi.fn(),
    promotionPassword: '',
    setPromotionPassword: vi.fn(),
    handlePromote: vi.fn(),
    ...overrides,
  };
}

describe('AdminUserModals', () => {
  it('requires a non-zero trust adjustment and a reason', () => {
    const model = createModel({
      editingTrustUser: { name: 'Test User', trustScore: 80 },
    });
    render(<AdminUserModals model={model} />);
    expect(screen.getByRole('button', { name: 'Apply Adjustment' })).toBeDisabled();
  });

  it('requires re-authentication details before administrator promotion', () => {
    const model = createModel({
      promotingUser: { name: 'Test User' },
      promotionReason: 'Needed for moderation',
      promotionPassword: 'short',
    });
    render(<AdminUserModals model={model} />);
    expect(screen.getByRole('button', { name: 'Confirm promotion' })).toBeDisabled();
  });

  it('invokes the explicit restore decision and closes its confirmation', () => {
    const model = createModel({ confirmRestoreUserId: 'user-123' });
    render(<AdminUserModals model={model} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Restore' }));
    expect(model.handleRestore).toHaveBeenCalledWith('user-123');
    expect(model.setConfirmRestoreUserId).toHaveBeenCalledWith(null);
  });
});
