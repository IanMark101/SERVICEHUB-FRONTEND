import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormEvent } from 'react';
import { apiForgotPassword, apiGoogleLogin, apiLogin, apiRegister } from '@/api/auth.api';
import useAuthForm from './useAuthForm';

const captcha = vi.hoisted(() => ({
  status: 'ready', required: true, siteKey: 'public-key', token: 'single-use-proof', resetKey: 0,
  blocked: false, setToken: vi.fn(), reset: vi.fn(), reload: vi.fn(), handleFailure: vi.fn(),
}));
vi.mock('@/components/auth/shared/useAuthCaptcha', () => ({ default: () => captcha }));
vi.mock('@/api/auth.api', () => ({ apiLogin: vi.fn(), apiRegister: vi.fn(), apiForgotPassword: vi.fn(), apiResetPassword: vi.fn(), apiGoogleLogin: vi.fn() }));
vi.mock('@/lib/api/axios', () => ({ setAccessToken: vi.fn() }));
vi.mock('@/lib/browserStorage', () => ({ markSessionPresent: vi.fn() }));
const submit = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;
const props = { onLoginSuccess: vi.fn(), setMode: vi.fn(), initialResetToken: '' };

describe('authentication submits verified proofs', () => {
  beforeEach(() => {
    vi.clearAllMocks(); captcha.blocked = false;
    vi.mocked(apiForgotPassword).mockResolvedValue({ success: true });
    vi.mocked(apiLogin).mockRejectedValue(new Error('Wrong password'));
    vi.mocked(apiRegister).mockResolvedValue({ success: true, data: { verificationEmailSent: true } });
    vi.mocked(apiGoogleLogin).mockResolvedValue({ success: false, error: 'Mock login finished' });
  });

  it('attaches a proof to reset-link requests and resets it after submission', async () => {
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'forgot' }));
    act(() => result.current.setValue('email', 'seeker@example.com'));
    await act(async () => result.current.handleSubmit(submit()));
    expect(apiForgotPassword).toHaveBeenCalledWith('seeker@example.com', 'single-use-proof');
    expect(captcha.reset).toHaveBeenCalledOnce();
  });

  it('blocks unverified reset requests before making any API call', async () => {
    captcha.blocked = true;
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'forgot' }));
    act(() => result.current.setValue('email', 'seeker@example.com'));
    await act(async () => result.current.handleSubmit(submit()));
    expect(apiForgotPassword).not.toHaveBeenCalled();
  });

  it('attaches a proof to password sign-in and refreshes the failed-login policy', async () => {
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'login' }));
    act(() => { result.current.setValue('email', 'seeker@example.com'); result.current.setValue('password', 'ValidPassword1!'); });
    await act(async () => result.current.handleSubmit(submit()));
    expect(apiLogin).toHaveBeenCalledWith({ email: 'seeker@example.com', password: 'ValidPassword1!', captchaToken: 'single-use-proof' });
    expect(captcha.handleFailure).toHaveBeenCalledOnce();
    expect(captcha.reset).toHaveBeenCalledOnce();
  });

  it('waits until registration step 3 and sends its proof with the account fields', async () => {
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => {
      result.current.setStep(3);
      result.current.setValue('firstName', 'John'); result.current.setValue('lastName', 'Seeker');
      result.current.setValue('email', 'seeker@example.com'); result.current.setValue('password', 'ValidPassword1!');
      result.current.setValue('phone', '9123456789');
      result.current.setValue('barangay', ' Babag 2 ');
      result.current.setValue('cityMunicipality', ' Lapu-Lapu City ');
      result.current.setValue('province', ' Cebu ');
    });
    await act(async () => result.current.handleSubmit(submit()));
    expect(apiRegister).toHaveBeenCalledWith(expect.objectContaining({ name: 'John Seeker', email: 'seeker@example.com', location: 'Babag 2, Lapu-Lapu City, Cebu', captchaToken: 'single-use-proof' }));
    expect(captcha.reset).toHaveBeenCalledOnce();
  });

  it('blocks final registration when a required address part is missing', async () => {
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => {
      result.current.setStep(3);
      result.current.setValue('phone', '9123456789');
      result.current.setValue('barangay', 'Babag 2');
      result.current.setValue('cityMunicipality', 'Lapu-Lapu City');
    });
    await act(async () => result.current.handleSubmit(submit()));
    expect(apiRegister).not.toHaveBeenCalled();
    expect(result.current.step).toBe(2);
    expect(result.current.fieldErrors.province).toBe('Province is required');
    expect(captcha.reset).not.toHaveBeenCalled();
  });

  it('allows Google OAuth even when a password CAPTCHA is unsolved', async () => {
    captcha.blocked = true;
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'login' }));
    await act(async () => result.current.handleGoogleSuccessResponse('google-id-token'));
    expect(apiGoogleLogin).toHaveBeenCalledWith('google-id-token');
    expect(captcha.reset).not.toHaveBeenCalled();
  });

  it('shows a readable service failure instead of blaming the password or exposing server details', async () => {
    vi.mocked(apiLogin).mockRejectedValue({ isAxiosError: true, response: { status: 500, data: { error: 'Invalid prisma.user.findUnique() in C:\\server\\auth.ts' } } });
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'login' }));
    act(() => { result.current.setValue('email', 'seeker@example.com'); result.current.setValue('password', 'ValidPassword1!'); });
    await act(async () => result.current.handleSubmit(submit()));
    expect(result.current.error).toBe('We couldn’t sign you in. Please try again.');
  });

  it('translates a non-throwing Google sign-in failure', async () => {
    vi.mocked(apiGoogleLogin).mockResolvedValue({ success: false, error: 'Validation failed' });
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'login' }));
    await act(async () => result.current.handleGoogleSuccessResponse('google-id-token'));
    expect(result.current.error).toBe('Some details are missing or need changing. Check the form and try again.');
  });

  it('translates registration validation details while keeping the entered account information', async () => {
    vi.mocked(apiRegister).mockRejectedValue({ isAxiosError: true, response: { status: 400, data: { errors: [{ message: 'Invalid input: expected string, received undefined' }] } } });
    const { result } = renderHook(() => useAuthForm({ ...props, mode: 'signup' }));
    act(() => {
      result.current.setStep(3);
      result.current.setValue('firstName', 'Ana'); result.current.setValue('lastName', 'Cruz');
      result.current.setValue('email', 'resident@example.com'); result.current.setValue('password', 'ValidPassword1!');
      result.current.setValue('phone', '9123456789'); result.current.setValue('barangay', 'Babag');
      result.current.setValue('cityMunicipality', 'Lapu-Lapu City'); result.current.setValue('province', 'Cebu');
    });
    await act(async () => result.current.handleSubmit(submit()));
    expect(result.current.error).toBe('Some details are missing or need changing. Check the form and try again.');
    expect(result.current.formData.firstName).toBe('Ana');
    expect(result.current.formData.email).toBe('resident@example.com');
  });
});
