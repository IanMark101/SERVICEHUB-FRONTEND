import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { apiCheckRegistrationEmail } from '@/api/auth.api';
import useAuthForm from '@/schema/auth/useAuthForm';
import SignupForm from './SignupForm';

vi.mock('./shared/GoogleSignInButton', () => ({ default: () => null }));
vi.mock('./shared/useAuthCaptcha', () => ({ default: () => ({ status: 'ready', required: false, blocked: false }) }));
vi.mock('@/api/auth.api', () => ({ apiCheckRegistrationEmail: vi.fn() }));

function Registration() {
  const model = useAuthForm({ onLoginSuccess: vi.fn(), setMode: vi.fn(), initialResetToken: '', mode: 'signup' });
  return <SignupForm {...model} isDark={false} accentText="" accentBg="" toggleMode={() => {}} />;
}

describe('registration email interface', () => {
  it('shows checking feedback, then focuses the registered email and keeps the user on credentials', async () => {
    let resolve!: (available: boolean) => void;
    vi.mocked(apiCheckRegistrationEmail).mockReturnValueOnce(new Promise<boolean>(done => { resolve = done; }));
    render(<Registration />);
    for (const [label, value] of [
      ['First Name', 'Ana'], ['Last Name', 'Cruz'], ['Email', 'resident@example.com'],
      ['Password', 'ValidPassword1!'], ['Confirm Password', 'ValidPassword1!'],
    ]) fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(screen.getByRole('button', { name: 'Checking email...' })).toBeDisabled();
    expect(screen.getByRole('status', { name: 'Checking email' })).toBeInTheDocument();
    await act(async () => { resolve(false); });
    const email = screen.getByRole('textbox', { name: 'Email' });
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/already registered/);
    expect(email).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeEnabled();
    expect(screen.getByLabelText('First Name')).toHaveValue('Ana');
  });
});
