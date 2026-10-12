import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PwaProvider from './PwaProvider';
import InstallPage from './InstallPage';

let standalone: EventTarget & { matches: boolean };
let container: EventTarget & { controller: object | null; register: ReturnType<typeof vi.fn> };
let worker: EventTarget & { state: string; postMessage: ReturnType<typeof vi.fn> };
let registration: EventTarget & { waiting: typeof worker | null; installing: typeof worker | null; update: ReturnType<typeof vi.fn> };
const originalWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

function renderPage() { return render(<PwaProvider><InstallPage /></PwaProvider>); }
function offerInstall(outcome: 'accepted' | 'dismissed' = 'accepted', fail = false) {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: fail ? vi.fn().mockRejectedValue(new Error('cancelled')) : vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome }),
  });
  act(() => { window.dispatchEvent(event); });
  return event;
}

describe('PWA installation and update UX', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    standalone = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal('matchMedia', vi.fn(() => standalone));
    vi.stubGlobal('isSecureContext', true);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    worker = Object.assign(new EventTarget(), { state: 'installed', postMessage: vi.fn() });
    registration = Object.assign(new EventTarget(), { waiting: worker, installing: null, update: vi.fn().mockResolvedValue(undefined) });
    container = Object.assign(new EventTarget(), { controller: {}, register: vi.fn().mockResolvedValue(registration) });
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: container });
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers();
    if (originalWorker) Object.defineProperty(navigator, 'serviceWorker', originalWorker);
    else Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('offers manual installation guidance without an unsolicited prompt or dev worker', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: 'Install ServiceHub' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'On iPhone or iPad' })).toBeVisible();
    expect(container.register).not.toHaveBeenCalled();
  });
  it('opens the native prompt only on request and confirms the appinstalled event', async () => {
    renderPage(); const event = offerInstall();
    expect(event.defaultPrevented).toBe(true); expect(event.prompt).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Install ServiceHub' }));
    await waitFor(() => expect(event.prompt).toHaveBeenCalledOnce());
    act(() => { window.dispatchEvent(new Event('appinstalled')); });
    expect(screen.getByRole('heading', { name: 'ServiceHub is ready on your device.' })).toBeVisible();
  });
  it.each([['dismissed', false], ['accepted', true]] as const)('handles installation %s / error=%s', async (outcome, fail) => {
    renderPage(); offerInstall(outcome, fail);
    fireEvent.click(screen.getByRole('button', { name: 'Install ServiceHub' }));
    await waitFor(() => expect(screen.getByText(fail ? /Installation couldn't be opened/ : /Installation cancelled/)).toBeVisible());
  });
  it('recognizes standalone mode and announces connection loss', () => {
    standalone.matches = true; renderPage();
    expect(screen.getByRole('heading', { name: 'ServiceHub is ready on your device.' })).toBeVisible();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(screen.getByRole('complementary', { name: 'Connection status' })).toHaveTextContent("You're offline");
  });
  it('keeps a production update waiting until the user requests it', async () => {
    vi.stubEnv('NODE_ENV', 'production'); renderPage();
    act(() => { window.dispatchEvent(new Event('load')); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Update now' })).toBeVisible());
    expect(container.register).toHaveBeenCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
    expect(worker.postMessage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(screen.queryByRole('complementary', { name: 'ServiceHub update' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Update ServiceHub' }));
    expect(worker.postMessage).toHaveBeenCalledExactlyOnceWith({ type: 'SKIP_WAITING' });
  });
  it('reports registration failure without blocking normal browser access', async () => {
    vi.stubEnv('NODE_ENV', 'production'); container.register.mockRejectedValue(new Error('blocked'));
    renderPage(); act(() => { window.dispatchEvent(new Event('load')); });
    await waitFor(() => expect(screen.getByText(/Offline support couldn't be prepared/)).toBeVisible());
    expect(screen.getByRole('link', { name: 'Open ServiceHub' })).toHaveAttribute('href', '/dashboard');
  });
  it('removes install and registration observers after unmounting', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const windowRemoved = vi.spyOn(window, 'removeEventListener');
    const workerRemoved = vi.spyOn(container, 'removeEventListener');
    const view = renderPage(); act(() => { window.dispatchEvent(new Event('load')); });
    await waitFor(() => expect(container.register).toHaveBeenCalled()); view.unmount();
    expect(windowRemoved).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    expect(workerRemoved).toHaveBeenCalledWith('controllerchange', expect.any(Function));
  });
});
