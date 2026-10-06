import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PhonePasswordConfirmModal from './PhonePasswordConfirmModal';

vi.mock('../../context/AppContext', () => ({ useApp: () => ({ isDark: false }) }));

function mount(isLoading = false) {
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(<PhonePasswordConfirmModal isOpen oldPhone="09171234567" newPhone="09179876543" onConfirm={onConfirm} onClose={onClose} isLoading={isLoading} />);
  return { onConfirm, onClose, input: screen.getByPlaceholderText('Enter current password') };
}

describe('phone number password confirmation', () => {
  it('keeps blank-password protection and forwards the entered password to the existing action', async () => {
    const { input, onConfirm } = mount();
    const submit = screen.getByRole('button', { name: 'Verify & Update Number' });
    expect(submit).toBeDisabled();
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'fixture-current-password' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledExactlyOnceWith('fixture-current-password'));
  });

  it('preserves password visibility and clears the draft when canceled', () => {
    const { input, onClose, onConfirm } = mount();
    fireEvent.change(input, { target: { value: 'fixture-current-password' } });
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(input.parentElement!.querySelector('button')!);
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps confirmation and cancellation blocked while the existing action is loading', () => {
    const { input, onClose, onConfirm } = mount(true);
    fireEvent.change(input, { target: { value: 'fixture-current-password' } });
    expect(screen.getByRole('button', { name: 'Verify & Update Number' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.submit(input.closest('form')!);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
