import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollReveal from './ScrollReveal';
import LandingHowItWorks from './LandingHowItWorks';

const observers = new Set<TestObserver>();
class TestObserver {
  targets = new Set<Element>();
  constructor(readonly callback: IntersectionObserverCallback) { observers.add(this); }
  observe(target: Element) { this.targets.add(target); }
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
  vi.stubGlobal('IntersectionObserver', TestObserver);
  vi.stubGlobal('matchMedia', vi.fn((media: string) => ({
    media, matches: false, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
  })));
});
afterEach(() => { cleanup(); observers.clear(); vi.unstubAllGlobals(); });

describe('one-time landing viewport entrances', () => {
  it('waits for first entry, then keeps the entrance completed through exit, return and rerenders', () => {
    const view = render(<StrictMode><ScrollReveal direction="left"><h2>Trust</h2></ScrollReveal></StrictMode>);
    const reveal = screen.getByRole('heading', { name: 'Trust' }).parentElement!;
    expect(reveal).toHaveAttribute('data-entrance-active', 'false');
    expect(reveal).toBeVisible();
    intersect(reveal, false);
    expect(reveal).toHaveAttribute('data-entrance-active', 'false');
    intersect(reveal, true);
    expect(reveal).toHaveAttribute('data-entrance-active', 'true');
    expect([...observers].some(observer => observer.targets.has(reveal))).toBe(false);
    intersect(reveal, false);
    intersect(reveal, true);
    view.rerender(<StrictMode><ScrollReveal direction="left" className="dark"><h2>Trust</h2></ScrollReveal></StrictMode>);
    expect(screen.getByRole('heading', { name: 'Trust' }).parentElement).toBe(reveal);
    expect(reveal).toHaveAttribute('data-entrance-active', 'true');
    view.unmount();
    expect(observers.size).toBe(0);
  });

  it('animates How It Works cards on first entry without replaying when the role changes', () => {
    render(<LandingHowItWorks isDark={false} />);
    const cards = screen.getAllByRole('listitem');
    for (const card of cards) {
      expect(card).toHaveAttribute('data-entrance-active', 'false');
      intersect(card, true);
      expect(card).toHaveAttribute('data-entrance-active', 'true');
      intersect(card, false);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Provider' }));
    const providerCards = screen.getAllByRole('listitem');
    providerCards.forEach((card, index) => {
      expect(card).toBe(cards[index]);
      expect(card).toHaveAttribute('data-entrance-active', 'true');
    });
    expect(screen.getByRole('heading', { name: 'Create a service listing' })).toBeVisible();
  });
});
