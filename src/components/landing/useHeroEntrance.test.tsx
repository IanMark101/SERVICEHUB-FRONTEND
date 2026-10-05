import React, { useRef } from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useHeroEntrance from './useHeroEntrance';

const { animate, stop } = vi.hoisted(() => ({ animate: vi.fn(), stop: vi.fn() }));
vi.mock('motion/react', () => ({ useAnimate: () => [useRef(null), animate] }));

function Example({ dark = false }: { dark?: boolean }) {
  const scope = useHeroEntrance();
  return <section ref={scope} data-theme={dark ? 'dark' : 'light'}><span data-hero-entrance="badge">Location</span></section>;
}

describe('hero entrance lifecycle', () => {
  beforeEach(() => {
    animate.mockReset().mockReturnValue({ stop });
    stop.mockReset();
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ opacity: '0' } as CSSStyleDeclaration);
  });
  afterEach(() => vi.restoreAllMocks());

  it('starts on mount, preserves theme rerenders, and stops on unmount', () => {
    const view = render(<Example />);
    const started = animate.mock.calls.length;
    expect(started).toBeGreaterThan(0);
    view.rerender(<Example dark />);
    expect(animate).toHaveBeenCalledTimes(started);
    view.unmount();
    expect(stop).toHaveBeenCalledTimes(started);
  });

  it('does not replay after the visibility fallback or late hydration', () => {
    vi.mocked(window.getComputedStyle).mockReturnValue({ opacity: '1' } as CSSStyleDeclaration);
    render(<Example />);
    expect(animate).not.toHaveBeenCalled();
  });

  it('does not start a spatial entrance with reduced motion', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(<Example />);
    expect(animate).not.toHaveBeenCalled();
  });
});
