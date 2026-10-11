import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SignupForm from './SignupForm';
import useAuthForm from '@/schema/auth/useAuthForm';

vi.mock('./shared/GoogleSignInButton', () => ({ default: () => null }));
vi.mock('./shared/useAuthCaptcha', () => ({ default: () => ({ status: 'ready', required: false, blocked: false }) }));
vi.mock('@/api/auth.api', () => ({ apiCheckRegistrationEmail: vi.fn().mockResolvedValue(true) }));

const onLoginSuccess = vi.fn();
const setMode = vi.fn();

function Registration() {
  const model = useAuthForm({ onLoginSuccess, setMode, initialResetToken: '', mode: 'signup' });
  return <SignupForm {...model} isDark={false} accentText="" accentBg="" toggleMode={() => {}} />;
}

async function openContactStep() {
  render(<Registration />);
  for (const [label, value] of [
    ['First Name', 'Ana'], ['Last Name', 'Cruz'], ['Email', 'ana@example.com'],
    ['Password', 'ValidPassword1!'], ['Confirm Password', 'ValidPassword1!'],
  ]) fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
  fireEvent.change(await screen.findByLabelText('Contact Number'), { target: { value: '9171234567' } });
}

describe('registration address inputs', () => {
  it('requires every separate address field and preserves them when going back', async () => {
    await openContactStep();
    const fields = [
      { label: 'Barangay', value: 'Babag 2', autoComplete: 'address-level3' },
      { label: 'City / Municipality', value: 'Lapu-Lapu City', autoComplete: 'address-level2' },
      { label: 'Province', value: 'Cebu', autoComplete: 'address-level1' },
    ];
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeDisabled();
    for (const field of fields) {
      const input = screen.getByRole('textbox', { name: field.label });
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('autocomplete', field.autoComplete);
      fireEvent.change(input, { target: { value: field.value } });
    }
    for (const field of fields) {
      const input = screen.getByRole('textbox', { name: field.label });
      fireEvent.change(input, { target: { value: '   ' } });
      expect(screen.getByRole('button', { name: 'Next Step' })).toBeDisabled();
      fireEvent.change(input, { target: { value: field.value } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(screen.getByRole('heading', { name: 'Profile Setup' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    for (const field of fields) expect(screen.getByRole('textbox', { name: field.label })).toHaveValue(field.value);
    expect(screen.getByRole('button', { name: 'Next Step' })).toBeEnabled();
  });

  it('shows an inline error when the combined address exceeds the saved profile limit', async () => {
    await openContactStep();
    fireEvent.change(screen.getByRole('textbox', { name: 'Barangay' }), { target: { value: 'B'.repeat(40) } });
    fireEvent.change(screen.getByRole('textbox', { name: 'City / Municipality' }), { target: { value: 'C'.repeat(30) } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Province' }), { target: { value: 'P'.repeat(27) } });
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(screen.getByRole('heading', { name: 'Contact & Address' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('within 100 characters');
    expect(screen.getByRole('textbox', { name: 'Province' })).toHaveAttribute('aria-invalid', 'true');
  });
});
