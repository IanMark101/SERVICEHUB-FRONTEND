import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { motionValue, useReducedMotion, useScroll } from 'motion/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollReveal from './ScrollReveal';
import { useScrollEntrance } from './useScrollEntrance';

vi.mock('motion/react', async importOriginal => ({
  ...await importOriginal<typeof import('motion/react')>(),
  useScroll: vi.fn(),
  useReducedMotion: vi.fn(),
}));

describe('scroll-linked landing entrances', () => {
  let progress = motionValue(0);
  let preference = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  beforeEach(() => {
    progress = motionValue(0);
    vi.mocked(useScroll).mockReturnValue({
      scrollYProgress: progress, scrollXProgress: motionValue(0),
      scrollX: motionValue(0), scrollY: motionValue(0),
    });
    vi.mocked(useReducedMotion).mockReturnValue(false);
    preference = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', vi.fn((query: string) => query.includes('reduced-motion') ? preference : ({
      matches: query.includes('900px'), media: query,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
  });

  it('leaves server-rendered content fully visible before scroll initialization', () => {
    const html = renderToString(<ScrollReveal><h2>Readable without JavaScript</h2></ScrollReveal>);
    expect(html).toContain('Readable without JavaScript');
    expect(html).toContain('opacity:1');
    expect(html).not.toContain('translateY');
  });

  it('follows multiple positions, reverses, and repeats without timers or React renders', () => {
    let renders = 0;
    const { result, unmount } = renderHook(() => { renders++; return useScrollEntrance<HTMLDivElement>(); });
    const read = () => ({ y: result.current.style.y.get(), opacity: result.current.style.opacity.get() });
    const initial = read();
    const mountRenders = renders;
    expect(initial.y).toBeGreaterThan(60);
    act(() => progress.set(0.5));
    const halfway = read();
    expect(halfway.y).toBeGreaterThan(15);
    expect(halfway.y).toBeLessThan(initial.y);
    expect(halfway.opacity).toBeGreaterThan(initial.opacity);
    act(() => progress.set(1));
    expect(read()).toEqual({ y: 0, opacity: 1 });
    act(() => progress.set(0.5));
    expect(read()).toEqual(halfway);
    act(() => progress.set(0));
    expect(read()).toEqual(initial);
    act(() => progress.set(1));
    expect(read()).toEqual({ y: 0, opacity: 1 });
    expect(renders).toBe(mountRenders);
    unmount();
    progress.set(0);
    expect(read()).toEqual({ y: 0, opacity: 1 });
  });

  it('keeps focused controls steady and responds to reduced-motion preference changes', () => {
    const { result, unmount } = renderHook(() => useScrollEntrance<HTMLDivElement>({ direction: 'right' }));
    expect(result.current.style.x.get()).toBeGreaterThan(60);
    act(() => result.current.onFocusCapture());
    act(() => progress.set(0.2));
    expect(result.current.style.x.get()).toBe(0);
    expect(result.current.style.opacity.get()).toBe(1);
    act(() => result.current.onBlurCapture({
      currentTarget: document.createElement('div'), relatedTarget: null,
    } as React.FocusEvent<HTMLDivElement>));
    expect(result.current.style.x.get()).toBeGreaterThan(0);
    const change = preference.addEventListener.mock.calls[0][1] as () => void;
    preference.matches = true;
    act(() => change());
    act(() => progress.set(0.7));
    expect(result.current.style.x.get()).toBe(0);
    expect(result.current.style.opacity.get()).toBe(1);
    preference.matches = false;
    act(() => change());
    expect(result.current.style.x.get()).toBeGreaterThan(0);
    unmount();
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', change);
  });

  it('uses bounded vertical movement on narrow screens instead of overflowing sideways', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    const { result } = renderHook(() => useScrollEntrance<HTMLDivElement>({ direction: 'right' }));
    expect(result.current.style.x.get()).toBe(0);
    expect(result.current.style.y.get()).toBe(48);
  });
});
