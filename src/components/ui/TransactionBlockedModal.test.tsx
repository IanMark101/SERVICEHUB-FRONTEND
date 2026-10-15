import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import TransactionBlockedModal from './TransactionBlockedModal';
import LimitedModeDashboardCard from '../landing/LimitedModeDashboardCard';
import AccountSuspensionBanner from '../layout/AccountSuspensionBanner';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
const close = vi.fn();
function account(moderationStatus = 'SUSPENDED', verificationStatus = 'APPROVED') {
  vi.mocked(useApp).mockReturnValue({ user: { id: 'resident', role: 'seeker', isActive: true, emailVerified: true, moderationStatus, verificationStatus }, isDark: false } as ReturnType<typeof useApp>);
}
beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); account(); });

describe('suspension explanations', () => {
  it('explains the real restriction and allows returning to browsing without a verification prompt', () => {
    render(<TransactionBlockedModal isOpen onClose={close} />);
    expect(screen.getByRole('dialog', { name: 'Account suspended' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/You can browse ServiceHub while suspended/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Verify Now' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue browsing' }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('keeps the suspension notice visible even when an old verification card was dismissed', () => {
    sessionStorage.setItem('limited_mode_card_dismissed', 'true');
    render(<><AccountSuspensionBanner /><LimitedModeDashboardCard role="seeker" /></>);
    expect(screen.getByRole('status')).toHaveTextContent('Limited Mode — account suspended.');
    expect(screen.getByRole('status')).toHaveTextContent('eligible existing bookings');
    expect(screen.queryByText('Verify Now')).not.toBeInTheDocument();
  });

  it('retains the verification action for an active unverified member', () => {
    account('ACTIVE', 'UNVERIFIED');
    render(<TransactionBlockedModal isOpen onClose={close} />);
    fireEvent.click(screen.getByRole('button', { name: 'Verify Now' }));
    expect(push).toHaveBeenCalledWith('/profile/resident?tab=verification');
  });

  it('closes with Escape and returns keyboard focus to the trigger', () => {
    const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
    const view = render(<TransactionBlockedModal isOpen onClose={close} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close' }), { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
    view.unmount(); expect(trigger).toHaveFocus(); trigger.remove();
  });
});
