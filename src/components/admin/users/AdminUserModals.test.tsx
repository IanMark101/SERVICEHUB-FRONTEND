import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminUserModals from './AdminUserModals';

function createModel(overrides: Record<string, unknown> = {}) {
  return {
    isDark: false,
    editingTrustUser: null,
    closeTrustModal: vi.fn(),
    trustDelta: 0,
    setTrustDelta: vi.fn(),
    trustReason: '',
    setTrustReason: vi.fn(),
    trustPassword: '',
    setTrustPassword: vi.fn(),
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
    banBusy: false,
    handleBan: vi.fn(),
    confirmRestoreUserId: null,
    setConfirmRestoreUserId: vi.fn(),
    restoreIsBan: false,
    restoreReason: '',
    setRestoreReason: vi.fn(),
    restoreBusy: false,
    handleRestore: vi.fn(),
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

  it('requires the current admin password for a trust adjustment', () => {
    const model = createModel({ editingTrustUser: { name: 'Test User', trustScore: 80 }, trustDelta: -5, trustReason: 'Documented correction' });
    render(<AdminUserModals model={model} />);
    expect(screen.getByRole('button', { name: 'Apply Adjustment' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Current administrator password'), { target: { value: 'secret' } });
    expect(model.setTrustPassword).toHaveBeenCalledWith('secret');
  });

  it('requires a reason before restoring an account', () => {
    const model = createModel({ confirmRestoreUserId: 'user-123' });
    render(<AdminUserModals model={model} />);
    expect(screen.getByRole('button', { name: 'Confirm restore' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Reason for restoring access'), { target: { value: 'Administrative review completed' } });
    expect(model.setRestoreReason).toHaveBeenCalledWith('Administrative review completed');
    expect(model.handleRestore).not.toHaveBeenCalled();
  });
});
