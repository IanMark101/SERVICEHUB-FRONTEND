import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useHeroEntrance from './useHeroEntrance';

const { observe, disconnect } = vi.hoisted(() => ({ observe: vi.fn(), disconnect: vi.fn() }));
vi.mock('motion/react', () => ({ inView: observe }));
let enterViewport: () => (() => void);

function Example({ dark = false }: { dark?: boolean }) {
  const scope = useHeroEntrance();
  return <section ref={scope} data-hero-motion="enter" data-theme={dark ? 'dark' : 'light'}>
    <h1 data-hero-entrance="heading">ServiceHub</h1>
  </section>;
}

describe('hero entrance lifecycle', () => {
  beforeEach(() => {
    disconnect.mockReset();
    observe.mockReset().mockImplementation((_element, onEnter) => {
      enterViewport = onEnter;
      return disconnect;
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
  });
  afterEach(() => vi.restoreAllMocks());

  it('sends the first-paint entrance state in server HTML without hiding content inline', () => {
    const html = renderToString(<Example />);
    expect(html).toContain('data-hero-motion="enter"');
    expect(html).toContain('ServiceHub');
    expect(html).not.toContain('style=');
    expect(observe).not.toHaveBeenCalled();
  });

  it('does not reset the initial entrance when hydration first observes it', () => {
    const view = render(<Example />);
    const element = view.container.querySelector('section')!;
    const mutations: string[] = [];
    const setAttribute = element.setAttribute.bind(element);
    vi.spyOn(element, 'setAttribute').mockImplementation((name, value) => {
      if (name === 'data-hero-motion') mutations.push(value);
      setAttribute(name, value);
    });
    enterViewport();
    expect(mutations).not.toContain('idle');
    expect(element).toHaveAttribute('data-hero-motion', 'enter');
  });

  it('settles on exit, replays on re-entry, preserves theme rerenders and cleans up', () => {
    const view = render(<Example />);
    const element = view.container.querySelector('section')!;
    const leaveViewport = enterViewport();
    leaveViewport();
    expect(element).toHaveAttribute('data-hero-motion', 'idle');
    view.rerender(<Example dark />);
    expect(element).toHaveAttribute('data-theme', 'dark');
    expect(element).toHaveAttribute('data-hero-motion', 'idle');
    expect(observe).toHaveBeenCalledTimes(1);
    enterViewport();
    expect(element).toHaveAttribute('data-hero-motion', 'enter');
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
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
    expect(view.container.querySelector('section')).toHaveAttribute('data-hero-motion', 'idle');
    preference.matches = false;
    change();
    enterViewport();
    expect(observe).toHaveBeenCalledTimes(2);
    expect(view.container.querySelector('section')).toHaveAttribute('data-hero-motion', 'enter');
    view.unmount();
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', change);
  });

  it('preserves the initial CSS entrance through Strict Mode setup and cleanup', () => {
    const view = render(<StrictMode><Example /></StrictMode>);
    expect(view.container.querySelector('section')).toHaveAttribute('data-hero-motion', 'enter');
    expect(observe).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledOnce();
    enterViewport();
    expect(view.container.querySelector('section')).toHaveAttribute('data-hero-motion', 'enter');
  });

  it('does not start a spatial entrance with reduced motion', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    const view = render(<Example />);
    expect(view.container.querySelector('section')).toHaveAttribute('data-hero-motion', 'idle');
    expect(observe).not.toHaveBeenCalled();
  });
});
