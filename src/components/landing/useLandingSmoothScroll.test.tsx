import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useLandingSmoothScroll from './useLandingSmoothScroll';

const mocked = vi.hoisted(() => ({
  instances: [] as Array<{
    options: Record<string, unknown>;
    isStopped: boolean;
    stop: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    scrollTo: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock('lenis', () => ({
  default: class {
    isStopped = false;
    stop = vi.fn(() => { this.isStopped = true; });
    start = vi.fn(() => { this.isStopped = false; });
    destroy = vi.fn();
    scrollTo = vi.fn();
    constructor(public options: Record<string, unknown>) { mocked.instances.push(this); }
  },
}));

describe('landing smooth scrolling lifecycle', () => {
  let reducedMotion: boolean;
  let changePreference: EventListener;
  const removeMediaListener = vi.fn();

  beforeEach(() => {
    reducedMotion = false;
    mocked.instances.length = 0;
    removeMediaListener.mockClear();
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      get matches() { return reducedMotion; },
      addEventListener: (_type: string, callback: EventListener) => { changePreference = callback; },
      removeEventListener: removeMediaListener,
    })));
  });

  afterEach(() => {
    document.querySelectorAll('dialog[data-test-lock]').forEach((dialog) => dialog.remove());
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const preference = (reduce: boolean) => act(() => {
    reducedMotion = reduce;
    changePreference(new Event('change'));
  });

  it('smooths wheel input without replacing the native window or touch scrolling', () => {
    const { unmount } = renderHook(useLandingSmoothScroll);
    const lenis = mocked.instances[0];
    expect(lenis.options).toMatchObject({
      autoRaf: true, lerp: 0.085, wheelMultiplier: 0.95,
      smoothWheel: true, syncTouch: false, anchors: false,
    });
    expect(lenis.options.wrapper).toBeUndefined();
    unmount();
    expect(lenis.destroy).toHaveBeenCalledOnce();
    expect(removeMediaListener).toHaveBeenCalledWith('change', changePreference);
  });

  it('retains native navigation for reduced motion and responds to preference changes', () => {
    reducedMotion = true;
    const { result, unmount } = renderHook(useLandingSmoothScroll);
    const anchor = document.createElement('section');
    expect(mocked.instances).toHaveLength(0);
    expect(result.current(anchor, { block: 'start', behavior: 'auto' })).toBe(false);
    preference(false);
    expect(mocked.instances).toHaveLength(1);
    preference(true);
    expect(mocked.instances[0].destroy).toHaveBeenCalledOnce();
    expect(result.current(anchor, { block: 'start', behavior: 'auto' })).toBe(false);
    preference(false);
    expect(mocked.instances).toHaveLength(2);
    unmount();
    expect(mocked.instances[1].destroy).toHaveBeenCalledOnce();
  });

  it('leaves one active instance through Strict Mode and destroys it on route exit', () => {
    const { unmount } = renderHook(useLandingSmoothScroll, { wrapper: StrictMode });
    expect(mocked.instances).toHaveLength(2);
    expect(mocked.instances[0].destroy).toHaveBeenCalledOnce();
    expect(mocked.instances[1].destroy).not.toHaveBeenCalled();
    unmount();
    expect(mocked.instances[1].destroy).toHaveBeenCalledOnce();
  });

  it('pauses behind the workspace dialog until both the dialog and body lock are released', async () => {
    renderHook(useLandingSmoothScroll);
    const lenis = mocked.instances[0];
    const dialog = document.createElement('dialog');
    dialog.dataset.testLock = '';
    document.body.append(dialog);
    await act(async () => { dialog.setAttribute('open', ''); });
    expect(lenis.isStopped).toBe(true);
    lenis.start.mockClear();
    await act(async () => {
      document.body.style.overflow = 'hidden';
      dialog.removeAttribute('open');
    });
    expect(lenis.start).not.toHaveBeenCalled();
    expect(lenis.isStopped).toBe(true);
    await act(async () => { document.body.style.overflow = ''; });
    expect(lenis.isStopped).toBe(false);
    expect(lenis.start).toHaveBeenCalledOnce();
  });

  it('keeps smoothing paused if it is enabled while a dialog is already open', () => {
    reducedMotion = true;
    const dialog = document.createElement('dialog');
    dialog.dataset.testLock = '';
    dialog.setAttribute('open', '');
    document.body.append(dialog);
    renderHook(useLandingSmoothScroll);
    preference(false);
    expect(mocked.instances[0].isStopped).toBe(true);
  });

  it('uses Lenis CSS anchor clearance and cancels wheel glides for centered demo jumps', () => {
    const { result } = renderHook(useLandingSmoothScroll);
    const lenis = mocked.instances[0];
    const anchor = document.createElement('section');
    anchor.style.scrollMarginTop = '128px';
    expect(result.current(anchor, { block: 'start', behavior: 'smooth' })).toBe(true);
    // The installed Lenis reads scroll-margin itself; adding an offset doubles it.
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(anchor, { immediate: false, duration: 1.2, lerp: 0 });
    vi.stubGlobal('innerHeight', 1000);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({ top: 200, height: 400 } as DOMRect);
    result.current(anchor, { block: 'center', behavior: 'instant' });
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(200, { immediate: true, duration: 1.2, lerp: 0 });
  });
});
