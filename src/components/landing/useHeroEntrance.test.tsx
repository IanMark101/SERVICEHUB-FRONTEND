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

function ReferenceSequenceExample() {
  const scope = useHeroEntrance();
  return <section ref={scope}>
    {['badge', 'heading', 'description', 'actions', 'support', 'scene'].map(name =>
      <div key={name} data-hero-entrance={name}>{name}</div>)}
  </section>;
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

  it('matches the observed eGov text stagger and presenter slide', () => {
    render(<ReferenceSequenceExample />);
    enterViewport();
    const calls = animate.mock.calls.map(([selector, keyframes, timing]) => ({
      selector, from: keyframes.transform[0], opacity: keyframes.opacity,
      duration: timing.duration, delay: timing.delay,
    }));
    expect(calls).toEqual([
      { selector: '[data-hero-entrance="badge"]', from: 'translateY(-20px)', opacity: [0, 1], duration: 0.5, delay: 0.05 },
      { selector: '[data-hero-entrance="heading"]', from: 'translateY(32px)', opacity: [0, 1], duration: 0.6, delay: 0.15 },
      { selector: '[data-hero-entrance="description"]', from: 'translateY(32px)', opacity: [0, 1], duration: 0.6, delay: 0.25 },
      { selector: '[data-hero-entrance="actions"]', from: 'translateY(32px)', opacity: [0, 1], duration: 0.6, delay: 0.35 },
      { selector: '[data-hero-entrance="support"]', from: 'translateY(32px)', opacity: [0, 1], duration: 0.6, delay: 0.45 },
      { selector: '[data-hero-entrance="scene"]', from: 'translateX(48px)', opacity: [0, 1], duration: 0.7, delay: 0.3 },
    ]);
  });

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
