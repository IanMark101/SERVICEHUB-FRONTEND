import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecaptchaCheckbox from './RecaptchaCheckbox';

describe('checkbox lifecycle', () => {
  const renderWidget = vi.fn().mockReturnValue(12);
  const reset = vi.fn();
  const onToken = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    renderWidget.mockReturnValue(12);
    window.grecaptcha = { render: renderWidget, reset };
  });
  afterEach(() => { delete window.grecaptcha; vi.restoreAllMocks(); });
  const props = { siteKey: 'public-key', isDark: false, resetKey: 0, onToken };

  it('uses compact size at narrow widths and dark theme when requested', async () => {
    render(<RecaptchaCheckbox {...props} isDark />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
    expect(renderWidget.mock.calls[0][1]).toMatchObject({ sitekey: 'public-key', theme: 'dark', size: 'compact' });
  });

  it('clears expired proofs, reports errors and retries the widget', async () => {
    render(<RecaptchaCheckbox {...props} />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
    const callbacks = renderWidget.mock.calls[0][1];
    act(() => callbacks.callback('verified-proof'));
    expect(onToken).toHaveBeenLastCalledWith('verified-proof');
    act(() => callbacks['expired-callback']());
    expect(onToken).toHaveBeenLastCalledWith('');
    expect(screen.getByText(/The check expired/)).toBeVisible();
    act(() => callbacks['error-callback']());
    fireEvent.click(screen.getByRole('button', { name: 'Retry security check' }));
    await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(2));
    expect(reset).toHaveBeenCalledWith(12);
  });

  it('resets consumed answers and ignores stale callbacks after unmount', async () => {
    const view = render(<RecaptchaCheckbox {...props} />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
    const callbacks = renderWidget.mock.calls[0][1];
    view.rerender(<RecaptchaCheckbox {...props} resetKey={1} />);
    expect(reset).toHaveBeenCalledWith(12);
    view.unmount();
    onToken.mockClear();
    act(() => callbacks.callback('late-proof'));
    expect(onToken).not.toHaveBeenCalled();
  });

  it('does not render duplicate widgets during StrictMode effect replay', async () => {
    render(<StrictMode><RecaptchaCheckbox {...props} /></StrictMode>);
    await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
  });

  it('switches to the compact widget when the form becomes narrow without preserving an old proof', async () => {
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400);
    render(<RecaptchaCheckbox {...props} />);
    await waitFor(() => expect(renderWidget).toHaveBeenCalledOnce());
    expect(renderWidget.mock.calls[0][1].size).toBe('normal');
    act(() => renderWidget.mock.calls[0][1].callback('desktop-proof'));
    width.mockReturnValue(260);
    fireEvent(window, new Event('resize'));
    await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(2));
    expect(renderWidget.mock.calls[1][1].size).toBe('compact');
    expect(onToken).toHaveBeenLastCalledWith('');
  });
});
