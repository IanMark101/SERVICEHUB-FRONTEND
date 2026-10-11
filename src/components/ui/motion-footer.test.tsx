import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicFooter } from './motion-footer';

vi.hoisted(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    media: query, matches: query.includes('no-preference'),
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })));
  vi.stubGlobal('scrollTo', vi.fn());
});

vi.mock('./particles-bg', () => ({ default: () => null }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    media: query, matches: query.includes('no-preference'),
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  })));
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.globalTimeline.clear();
  vi.unstubAllGlobals();
});

describe('footer content visibility after hydration', () => {
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
