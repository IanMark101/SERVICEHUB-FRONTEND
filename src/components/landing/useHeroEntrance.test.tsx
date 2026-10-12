import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useHeroEntrance from './useHeroEntrance';

const { animate, stop, complete, observe, disconnect } = vi.hoisted(() => ({
  animate: vi.fn(), stop: vi.fn(), complete: vi.fn(), observe: vi.fn(), disconnect: vi.fn(),
}));
vi.mock('motion/react', () => ({ useAnimate: () => [useRef(null), animate], inView: observe }));
let enterViewport: () => (() => void);

function Example({ dark = false }: { dark?: boolean }) {
  const scope = useHeroEntrance();
  return <section ref={scope} data-theme={dark ? 'dark' : 'light'}><span data-hero-entrance="badge">Location</span></section>;
}

describe('hero entrance lifecycle', () => {
  beforeEach(() => {
    animate.mockReset().mockReturnValue({ stop, complete });
    stop.mockReset();
    complete.mockReset();
    disconnect.mockReset();
    observe.mockReset().mockImplementation((_element, onEnter) => {
      enterViewport = onEnter;
      return disconnect;
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
  });
  afterEach(() => vi.restoreAllMocks());

  it('replays on viewport re-entry, preserves theme rerenders, and cleans up', () => {
    const view = render(<Example />);
    expect(animate).not.toHaveBeenCalled();
    const leaveViewport = enterViewport();
    const started = animate.mock.calls.length;
    expect(started).toBeGreaterThan(0);
    view.rerender(<Example dark />);
    expect(animate).toHaveBeenCalledTimes(started);
    expect(observe).toHaveBeenCalledTimes(1);
    leaveViewport();
    expect(complete).toHaveBeenCalledTimes(started);
    enterViewport();
    expect(animate).toHaveBeenCalledTimes(started * 2);
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalledTimes(started * 2);
  });

  it('reacts to reduced-motion preference changes without remounting', () => {
    const preference = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.mocked(window.matchMedia).mockReturnValue(preference as unknown as MediaQueryList);
    const view = render(<Example />);
    enterViewport();
    const change = preference.addEventListener.mock.calls[0][1] as () => void;
    preference.matches = true;
    change();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledOnce();
    preference.matches = false;
    change();
    expect(observe).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', change);
  });

  it('keeps content visible without an observer callback', () => {
    render(<Example />);
    expect(animate).not.toHaveBeenCalled();
  });

  it('does not start a spatial entrance with reduced motion', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<Example />);
    expect(animate).not.toHaveBeenCalled();
    expect(observe).not.toHaveBeenCalled();
  });
});
