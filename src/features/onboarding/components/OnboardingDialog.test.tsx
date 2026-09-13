import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UserSession } from '../../../components/auth/LoginContainer';
import OnboardingDialog from './OnboardingDialog';

const user: UserSession = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Ana',
  lastName: 'Reyes',
  role: 'seeker',
  avatarUrl: '',
  bio: '',
  phone: '09171234567',
  location: 'Poblacion',
  verificationStatus: 'UNVERIFIED',
  emailVerified: true,
  onboardingStatus: 'PENDING',
};

function renderDialog(overrides: Partial<React.ComponentProps<typeof OnboardingDialog>> = {}) {
  const props = {
    user,
    workspace: 'seeker' as const,
    isDark: false,
    saving: false,
    onSkip: vi.fn(),
    onComplete: vi.fn(),
    onNavigate: vi.fn(),
    ...overrides,
  };
  render(<OnboardingDialog {...props} />);
  return props;
}

describe('OnboardingDialog', () => {
  it('moves forward and backward through the concise five-step flow', () => {
    renderDialog();
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });

  it('supports skip and keyboard dismissal without trapping the application', () => {
    const props = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    expect(props.onSkip).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(props.onSkip).toHaveBeenCalledTimes(2);
  });

  it('finishes the tour and exposes profile next actions', () => {
    const props = renderDialog();
    for (let step = 1; step < 5; step += 1) fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText('5 of 5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /review profile/i }));
    expect(props.onNavigate).toHaveBeenCalledWith('profile');
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));
    expect(props.onComplete).toHaveBeenCalledTimes(1);
  });
});
