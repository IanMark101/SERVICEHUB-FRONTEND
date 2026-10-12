import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicFooter } from './motion-footer';

const motionPreference = vi.hoisted(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    media: query, matches: query.includes('no-preference'),
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })));
  vi.stubGlobal('scrollTo', vi.fn());
  return { reduce: false };
});

vi.mock('./particles-bg', () => ({ default: () => null }));
vi.mock('motion/react', async importOriginal => ({
  ...await importOriginal<typeof import('motion/react')>(),
  useReducedMotion: () => motionPreference.reduce,
}));

const observers = new Set<TestObserver>();
class TestObserver {
  targets = new Set<Element>();
  constructor(readonly callback: IntersectionObserverCallback) { observers.add(this); }
  observe(target: Element) { observers.add(this); this.targets.add(target); }
  unobserve(target: Element) { this.targets.delete(target); }
  disconnect() { this.targets.clear(); observers.delete(this); }
}
function intersect(target: Element, isIntersecting: boolean) {
  act(() => {
    for (const observer of observers) {
      if (observer.targets.has(target)) observer.callback(
        [{ target, isIntersecting }] as IntersectionObserverEntry[],
        observer as unknown as IntersectionObserver,
      );
    }
  });
}

beforeEach(() => {
  motionPreference.reduce = false;
  vi.stubGlobal('IntersectionObserver', TestObserver);
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    media: query, matches: query.includes('no-preference'),
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })));
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.globalTimeline.clear();
  observers.clear();
  vi.unstubAllGlobals();
});

describe('footer content visibility after hydration', () => {
  it('preserves the scrolling background wordmark', () => {
    render(<CinematicFooter isDark={false} />);
    const parallax = ScrollTrigger.getAll().find(trigger => trigger.vars.scrub === 1)!;
    expect(parallax).toBeDefined();
    const wordmark = screen.getByText('SERVICEHUB', { exact: true });
    parallax.animation!.totalProgress(0);
    const initialTransform = wordmark.style.transform;
    parallax.animation!.totalProgress(1);
    expect(wordmark.style.transform).not.toBe(initialTransform);
    expect(wordmark.style.opacity).toBe('1');
  });

  it('waits for each content group to enter the viewport and replays on return', async () => {
    render(<CinematicFooter isDark={false} />);
    const groups = [
      screen.getByRole('heading', { name: /Ready to get Work Done/ }),
      screen.getByText(/Book a service or post what you need/),
      screen.getByRole('navigation', { name: 'Browse services by category' }).parentElement!,
      screen.getByRole('navigation', { name: 'Footer navigation' }).closest<HTMLDivElement>('.relative.z-20')!,
    ];

    groups.forEach(group => {
      expect(group).toBeVisible();
      // Observe actual content, not cached offsets or the earlier ticker.
      expect([...observers].some(observer => observer.targets.has(group))).toBe(true);
      intersect(group, true);
    });
    await waitFor(() => {
      groups.forEach(group => expect(Number(group.style.opacity)).toBeLessThan(1));
    });
    await waitFor(() => {
      groups.forEach(group => expect(group.style.opacity).toBe('1'));
    });
    groups.forEach(group => {
      intersect(group, false);
      intersect(group, true);
    });
    await waitFor(() => {
      groups.forEach(group => expect(Number(group.style.opacity)).toBeLessThan(1));
    });
  });

  it.each([false, true])('keeps the heading and shortcuts visible before scroll progress in dark=%s', isDark => {
    // Use the real GSAP engine: the previous fromTo effect immediately hid
    // these elements until its scroll trigger could advance.
    const view = render(<StrictMode><CinematicFooter isDark={isDark} /></StrictMode>);
    expect(screen.getByRole('heading', { name: /Ready to get Work Done/ })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Find a Service' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Post a Custom Request' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Offer Skilled Work' })).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Browse services by category' }).querySelectorAll('a')).toHaveLength(5);
    view.unmount();
    expect(ScrollTrigger.getAll()).toHaveLength(0);
  });

  it('keeps content visible with reduced motion and creates no scroll animations', () => {
    motionPreference.reduce = true;
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      media: query, matches: query.includes(': reduce'),
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    })));
    render(<CinematicFooter isDark={false} />);
    expect(screen.getByRole('heading', { name: /Ready to get Work Done/ })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Find a Service' })).toBeVisible();
    expect(ScrollTrigger.getAll()).toHaveLength(0);
  });
});
