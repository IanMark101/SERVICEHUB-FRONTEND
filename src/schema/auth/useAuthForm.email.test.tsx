import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormEvent } from 'react';
import { apiCheckRegistrationEmail, apiRegister } from '@/api/auth.api';
import useAuthForm from './useAuthForm';

vi.mock('@/components/auth/shared/useAuthCaptcha', () => ({ default: () => ({ blocked: false, required: false, reset: vi.fn(), handleFailure: vi.fn() }) }));
vi.mock('@/api/auth.api', () => ({ apiCheckRegistrationEmail: vi.fn(), apiRegister: vi.fn(), apiLogin: vi.fn(), apiForgotPassword: vi.fn(), apiResetPassword: vi.fn(), apiGoogleLogin: vi.fn() }));
vi.mock('@/lib/api/axios', () => ({ setAccessToken: vi.fn() }));
vi.mock('@/lib/browserStorage', () => ({ markSessionPresent: vi.fn() }));
const props = { onLoginSuccess: vi.fn(), setMode: vi.fn(), initialResetToken: '' };
type Model = ReturnType<typeof useAuthForm>;
const submit = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;

function fillCredentials(model: Model) {
  model.setValue('firstName', 'Ana'); model.setValue('lastName', 'Cruz');
  model.setValue('email', 'resident@example.com'); model.setValue('password', 'ValidPassword1!');
  model.setValue('confirmPassword', 'ValidPassword1!'); model.setValue('agreeTerms', true);
}

describe('registration email feedback', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiCheckRegistrationEmail).mockResolvedValue(true); });

  it('keeps registered Google/password emails on step 1 with an actionable email error', async () => {
    vi.mocked(apiCheckRegistrationEmail).mockResolvedValue(false);
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => fillCredentials(result.current));
    await act(async () => { await result.current.handleNextStep(); });
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.email).toContain('already registered');
    expect(result.current.fieldErrors.email).toContain('Google sign-in');
    expect(result.current.formData.firstName).toBe('Ana');
    expect(result.current.formData.password).toBe('ValidPassword1!');
    expect(result.current.isCheckingEmail).toBe(false);
    expect(apiRegister).not.toHaveBeenCalled();
    act(() => result.current.setValue('email', 'new@example.com'));
    expect(result.current.fieldErrors.email).toBeUndefined();
  });

  it('advances an available email only after the check finishes', async () => {
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => fillCredentials(result.current));
    await act(async () => { await result.current.handleNextStep(); });
    expect(result.current.step).toBe(2);
    expect(apiCheckRegistrationEmail).toHaveBeenCalledWith('resident@example.com', expect.any(AbortSignal));
    expect(apiRegister).not.toHaveBeenCalled();
  });

  it('validates credentials before contacting the API', async () => {
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    await act(async () => { await result.current.handleNextStep(); });
    expect(apiCheckRegistrationEmail).not.toHaveBeenCalled();
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.email).toBe('Email address is required');
  });

  it('prevents double checks and ignores a stale reply after the email changes', async () => {
    let resolve!: (available: boolean) => void;
    vi.mocked(apiCheckRegistrationEmail).mockReturnValueOnce(new Promise<boolean>(done => { resolve = done; }));
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => fillCredentials(result.current));
    let pending!: Promise<void>;
    act(() => { pending = result.current.handleNextStep(); });
    expect(result.current.isCheckingEmail).toBe(true);
    await act(async () => { await result.current.handleNextStep(); });
    expect(apiCheckRegistrationEmail).toHaveBeenCalledOnce();
    const signal = vi.mocked(apiCheckRegistrationEmail).mock.calls[0][1];
    act(() => result.current.setValue('email', 'new@example.com'));
    expect(signal?.aborted).toBe(true);
    await act(async () => { resolve(true); await pending; });
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.email).toBeUndefined();
    expect(result.current.isCheckingEmail).toBe(false);
    await act(async () => { await result.current.handleNextStep(); });
    expect(result.current.step).toBe(2);
  });

  it('revalidates credentials edited while the email check is pending', async () => {
    let resolve!: (available: boolean) => void;
    vi.mocked(apiCheckRegistrationEmail).mockReturnValueOnce(new Promise<boolean>(done => { resolve = done; }));
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => fillCredentials(result.current));
    let pending!: Promise<void>;
    act(() => { pending = result.current.handleNextStep(); });
    act(() => result.current.setValue('agreeTerms', false));
    await act(async () => { resolve(true); await pending; });
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.agreeTerms).toContain('must agree');
  });

  it('ignores a reply after switching out of signup', async () => {
    let resolve!: (available: boolean) => void;
    vi.mocked(apiCheckRegistrationEmail).mockReturnValueOnce(new Promise<boolean>(done => { resolve = done; }));
    const { result, rerender } = renderHook(({ mode }: { mode: 'signup' | 'login' }) => useAuthForm({ ...props, mode }), { initialProps: { mode: 'signup' } });
    act(() => fillCredentials(result.current));
    let pending!: Promise<void>;
    act(() => { pending = result.current.handleNextStep(); });
    rerender({ mode: 'login' });
    await act(async () => { resolve(false); await pending; });
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.email).toBeUndefined();
  });

  it('shows a failed check and allows a retry without advancing', async () => {
    vi.mocked(apiCheckRegistrationEmail).mockRejectedValueOnce(new Error('Could not check this email. Please try again.'));
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => fillCredentials(result.current));
    await act(async () => { await result.current.handleNextStep(); });
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.email).toContain('Please try again');
    expect(result.current.isCheckingEmail).toBe(false);
    await act(async () => { await result.current.handleNextStep(); });
    expect(result.current.step).toBe(2);
  });

  it('returns a final duplicate conflict to the email field and preserves contact details', async () => {
    vi.mocked(apiRegister).mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { code: 'EMAIL_ALREADY_REGISTERED', error: 'Already registered' } } });
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => {
      fillCredentials(result.current); result.current.setStep(3);
      result.current.setValue('phone', '9171234567'); result.current.setValue('barangay', 'Babag 2');
      result.current.setValue('cityMunicipality', 'Lapu-Lapu City'); result.current.setValue('province', 'Cebu');
    });
    await act(async () => result.current.handleSubmit(submit()));
    expect(result.current.step).toBe(1);
    expect(result.current.fieldErrors.email).toContain('already registered');
    expect(result.current.formData.province).toBe('Cebu');
    expect(result.current.isRegisterSuccess).toBe(false);
  });
});
