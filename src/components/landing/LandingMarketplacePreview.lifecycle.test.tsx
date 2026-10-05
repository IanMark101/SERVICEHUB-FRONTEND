import { Activity, StrictMode, forwardRef, type HTMLAttributes } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LandingMarketplacePreview from './LandingMarketplacePreview';
import LandingHeroHorizontalTrack from './LandingHeroHorizontalTrack';
import LandingBenefits from './LandingBenefits';

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', async importOriginal => {
  const original = await importOriginal<typeof import('motion/react')>();
  return {
    ...original,
    useReducedMotion: () => preferences.reduced,
    // Leave the real viewport hook active. Replace only the reveal wrapper so
    // this test can check orbit startup independently of reveal frames.
    motion: { div: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & Record<string, unknown>>(
      function Reveal(props, ref) {
        const domProps = { ...props };
        for (const prop of ['initial', 'whileInView', 'viewport', 'transition']) delete domProps[prop];
        return <div {...domProps} ref={ref} />;
      },
    ) },
  };
});

let observers: Set<IntersectionObserverCallback>;

function intersect(target: Element, isIntersecting: boolean) {
  act(() => {
    observers.forEach(callback => callback([{ target, isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver));
  });
}

describe('landing animation navigation lifecycle', () => {
  beforeEach(() => {
    preferences.reduced = false;
    observers = new Set();
    vi.spyOn(window, 'requestAnimationFrame');
    vi.stubGlobal('IntersectionObserver', class {
      constructor(private callback: IntersectionObserverCallback) { observers.add(callback); }
      observe() {}
      unobserve() {}
      disconnect() { observers.delete(this.callback); }
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('ships a running preview before client effects or viewport callbacks', () => {
    const html = renderToString(<LandingMarketplacePreview isDark={false} />);
    expect(html).toContain('data-running="true"');
    expect(html).toContain('animation-delay:-4s');
    expect(html).toContain('animation-delay:-20s');
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('pauses both responsive card layouts without resetting their elements, then resumes', () => {
    const { container } = render(<LandingBenefits isDark={false} />);
    const orbit = container.querySelector('[data-preview-theme]')!;
    const track = container.querySelector('[data-hero-track]')!;
    const cards = Array.from(container.querySelectorAll('[data-orbit-card]'));
    expect(orbit).toHaveAttribute('data-running', 'true');
    expect(track).toHaveAttribute('data-running', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Pause cards' }));
    expect(orbit).toHaveAttribute('data-running', 'false');
    expect(track).toHaveAttribute('data-running', 'false');
    expect(Array.from(container.querySelectorAll('[data-orbit-card]'))).toEqual(cards);
    fireEvent.click(screen.getByRole('button', { name: 'Resume cards' }));
    expect(orbit).toHaveAttribute('data-running', 'true');
    expect(track).toHaveAttribute('data-running', 'true');
  });

  it('respects reduced motion when showing the relocated section', () => {
    preferences.reduced = true;
    const { container } = render(<LandingBenefits isDark={false} />);
    expect(screen.getByRole('button', { name: 'Motion off' })).toBeDisabled();
    expect(container.querySelector('[data-preview-theme]')).toHaveAttribute('data-running', 'false');
    expect(container.querySelector('[data-hero-track]')).toHaveAttribute('data-running', 'false');
  });

  it('retains the same card elements and animation offsets through auth/theme re-renders', () => {
    const { container, rerender } = render(<StrictMode><LandingMarketplacePreview isDark={false} /></StrictMode>);
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-orbit-card]'));
    const offsets = cards.map(card => card.style.animationDelay);
    rerender(<StrictMode><LandingMarketplacePreview isDark /></StrictMode>);
    expect(Array.from(container.querySelectorAll('[data-orbit-card]'))).toEqual(cards);
    expect(cards.map(card => card.style.animationDelay)).toEqual(offsets);
    expect(container.querySelector('[data-preview-theme]')).toHaveAttribute('data-running', 'true');
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('restarts when a cached landing subtree becomes visible again', () => {
    const { container, rerender } = render(<Activity mode="visible"><LandingMarketplacePreview isDark={false} /></Activity>);
    rerender(<Activity mode="hidden"><LandingMarketplacePreview isDark={false} /></Activity>);
    rerender(<Activity mode="visible"><LandingMarketplacePreview isDark={false} /></Activity>);
    expect(container.querySelector('[data-preview-theme]')).toHaveAttribute('data-running', 'true');
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('pauses offscreen and resumes on re-entry', () => {
    const { container } = render(<LandingMarketplacePreview isDark={false} />);
    const orbit = container.querySelector('[data-preview-theme]')!;
    // Motion's observer records entry before it records exit.
    intersect(orbit, true);
    intersect(orbit, false);
    expect(orbit).toHaveAttribute('data-running', 'false');
    intersect(orbit, true);
    expect(orbit).toHaveAttribute('data-running', 'true');
  });

  it('resumes after a hidden document becomes visible again', () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get');
    const { container } = render(<LandingMarketplacePreview isDark={false} />);
    visibility.mockReturnValue('hidden');
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(container.querySelector('[data-preview-theme]')).toHaveAttribute('data-running', 'false');
    visibility.mockReturnValue('visible');
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(container.querySelector('[data-preview-theme]')).toHaveAttribute('data-running', 'true');
  });

  it('keeps reduced-motion previews static', () => {
    preferences.reduced = true;
    const { container } = render(<LandingMarketplacePreview isDark={false} />);
    expect(container.querySelector('[data-preview-theme]')).toHaveAttribute('data-running', 'false');
    expect(container.querySelectorAll('[data-orbit-card]')).toHaveLength(6);
  });

  it('starts the mobile track while its viewport observer is still initializing', () => {
    const { container, rerender } = render(<Activity mode="visible"><LandingHeroHorizontalTrack /></Activity>);
    expect(container.querySelector('[data-hero-track]')).toHaveAttribute('data-running', 'true');
    rerender(<Activity mode="hidden"><LandingHeroHorizontalTrack /></Activity>);
    rerender(<Activity mode="visible"><LandingHeroHorizontalTrack /></Activity>);
    expect(container.querySelector('[data-hero-track]')).toHaveAttribute('data-running', 'true');
  });
});
