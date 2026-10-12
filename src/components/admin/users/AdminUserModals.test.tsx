import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminUserModals from './AdminUserModals';

function createModel(overrides: Record<string, unknown> = {}) {
  return {
    isDark: false,
    editingTrustUser: null,
    closeTrustModal: vi.fn(),
    trustEventId: '',
    setTrustEventId: vi.fn(),
    trustEvents: [],
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
  it('requires an original trust event and a documented correction reason', () => {
    const model = createModel({
      editingTrustUser: { name: 'Test User', trustScore: 80 },
    });
    render(<AdminUserModals model={model} />);
    expect(screen.getByRole('button', { name: 'Record Correction' })).toBeDisabled();
  });

  it('requires the current admin password for a trust adjustment', () => {
    const model = createModel({ editingTrustUser: { name: 'Test User', trustScore: 80 }, trustEventId: 'event-1', trustReason: 'Documented correction based on the booking evidence' });
    render(<AdminUserModals model={model} />);
    expect(screen.getByRole('button', { name: 'Record Correction' })).toBeDisabled();
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
