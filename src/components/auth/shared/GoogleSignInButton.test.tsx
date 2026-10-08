import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GoogleSignInButton from './GoogleSignInButton';
import GoogleDeletionVerification from '../../profile/account-settings/GoogleDeletionVerification';

const scriptUrl = 'https://accounts.google.com/gsi/client';
const props = { onSuccess: vi.fn(), onError: vi.fn(), isDark: false, mode: 'login' };

describe('Google sign-in initialization and callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'test-client');
    delete window.google;
    // Simulate the SDK being initialized on an earlier page in this tab.
    Object.assign(window, { __google_gsi_initialized: true });
  });
  afterEach(() => {
    document.querySelectorAll(`script[src="${scriptUrl}"]`).forEach(script => script.remove());
    delete window.google;
    Reflect.deleteProperty(window, '__google_gsi_initialized');
    Reflect.deleteProperty(window, '__google_gsi_credential_handler');
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('reuses Google initialization after remounting and delivers credentials to the current auth screen', async () => {
    const initialize = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
    const first = render(<GoogleSignInButton {...props} />);
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ use_fedcm_for_button: true, auto_select: false }));
    const callback = initialize.mock.calls[0][0].callback;
    act(() => callback({ credential: 'first-credential' }));
    expect(props.onSuccess).toHaveBeenCalledWith('first-credential');
    first.unmount();
    act(() => callback({ credential: 'unmounted-credential' }));
    expect(props.onSuccess).toHaveBeenCalledTimes(1);
    const nextSuccess = vi.fn();
    render(<GoogleSignInButton {...props} onSuccess={nextSuccess} />);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Loading Google sign-in' })).not.toBeInTheDocument());
    expect(initialize).toHaveBeenCalledTimes(1);
    act(() => callback({ credential: 'next-credential' }));
    expect(nextSuccess).toHaveBeenCalledWith('next-credential');
  });

  it('reports SDK initialization errors and lets the user retry the same button', async () => {
    const initialize = vi.fn().mockImplementationOnce(() => { throw new Error('SDK failed'); });
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
    render(<GoogleSignInButton {...props} />);
    await waitFor(() => expect(props.onError).toHaveBeenCalledWith(expect.stringContaining('Google sign-in could not load')));
    fireEvent.click(screen.getByRole('button', { name: 'Retry Google sign-in' }));
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
  });

  it('initializes once under Strict Mode even if the loaded script also emits a load event', async () => {
    const initialize = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
    render(<StrictMode><GoogleSignInButton {...props} /></StrictMode>);
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
    fireEvent.load(document.querySelector(`script[src="${scriptUrl}"]`)!);
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('updates the theme and current callback without reinitializing the SDK', async () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    const view = render(<GoogleSignInButton {...props} />);
    await waitFor(() => expect(renderButton).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining({ theme: 'outline' })));
    const nextSuccess = vi.fn();
    view.rerender(<GoogleSignInButton {...props} isDark mode="signup" onSuccess={nextSuccess} />);
    await waitFor(() => expect(renderButton).toHaveBeenLastCalledWith(expect.any(HTMLElement), expect.objectContaining({ theme: 'filled_black' })));
    expect(initialize).toHaveBeenCalledTimes(1);
    act(() => initialize.mock.calls[0][0].callback({ credential: 'current-credential' }));
    expect(nextSuccess).toHaveBeenCalledWith('current-credential');
    expect(props.onSuccess).not.toHaveBeenCalled();
    view.rerender(<GoogleSignInButton {...props} disabled onSuccess={nextSuccess} />);
    act(() => initialize.mock.calls[0][0].callback({ credential: 'disabled-credential' }));
    expect(nextSuccess).toHaveBeenCalledTimes(1);
  });

  it('reports a failed SDK download instead of leaving an empty click target', () => {
    render(<GoogleSignInButton {...props} />);
    fireEvent.error(document.querySelector(`script[src="${scriptUrl}"]`)!);
    expect(props.onError).toHaveBeenCalledWith(expect.stringContaining('Google sign-in could not load'));
    expect(screen.getByRole('button', { name: 'Retry Google sign-in' })).toBeEnabled();
  });

  it('preserves verification nonces and ignores disabled or obsolete Google verification callbacks', () => {
    const initialize = vi.fn();
    const onSuccess = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
    const verification = { nonce: 'first-nonce', isDark: false, disabled: false, onSuccess, onError: vi.fn() };
    const view = render(<GoogleDeletionVerification {...verification} />);
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ nonce: 'first-nonce', use_fedcm_for_button: true, auto_select: false }));
    const firstCallback = initialize.mock.calls[0][0].callback;
    act(() => firstCallback({ credential: 'verified-credential' }));
    expect(onSuccess).toHaveBeenCalledTimes(1);

    view.rerender(<GoogleDeletionVerification {...verification} disabled />);
    act(() => firstCallback({ credential: 'disabled-credential' }));
    expect(onSuccess).toHaveBeenCalledTimes(1);

    view.rerender(<GoogleDeletionVerification {...verification} nonce="new-nonce" />);
    expect(initialize).toHaveBeenLastCalledWith(expect.objectContaining({ nonce: 'new-nonce', use_fedcm_for_button: true }));
    act(() => firstCallback({ credential: 'obsolete-credential' }));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    act(() => initialize.mock.calls[1][0].callback({ credential: 'current-credential' }));
    expect(onSuccess).toHaveBeenLastCalledWith('current-credential');
  });

  it('reports a stalled SDK download', async () => {
    vi.useFakeTimers();
    render(<GoogleSignInButton {...props} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(props.onError).toHaveBeenCalledWith(expect.stringContaining('Google sign-in could not load'));
  });

  it('keeps verification nonce callbacks separate from a subsequent login', async () => {
    const initialize = vi.fn();
    const verificationSuccess = vi.fn();
    const loginSuccess = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
    const view = render(<GoogleDeletionVerification nonce="verification-nonce" isDark={false} disabled={false} onSuccess={verificationSuccess} onError={vi.fn()} />);
    const verificationCallback = initialize.mock.calls[0][0].callback;
    view.rerender(<GoogleDeletionVerification nonce="verification-nonce" isDark disabled={false} onSuccess={verificationSuccess} onError={vi.fn()} />);
    expect(initialize).toHaveBeenCalledTimes(1);
    view.unmount();
    render(<GoogleSignInButton {...props} onSuccess={loginSuccess} />);
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
    expect(initialize.mock.calls[1][0].nonce).toBeUndefined();
    act(() => verificationCallback({ credential: 'obsolete-verification' }));
    expect(loginSuccess).not.toHaveBeenCalled();
    expect(verificationSuccess).not.toHaveBeenCalled();
    act(() => initialize.mock.calls[1][0].callback({ credential: 'login-credential' }));
    expect(loginSuccess).toHaveBeenCalledWith('login-credential');
  });
});
