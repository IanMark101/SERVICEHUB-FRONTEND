import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import LandingMarketplacePreview, { getOrbitPose } from './LandingMarketplacePreview';

describe('LandingMarketplacePreview', () => {
  it('uses a closed, continuously descending front orbit', () => {
    const top = getOrbitPose(0);
    const left = getOrbitPose(0.25);
    const bottom = getOrbitPose(0.5);
    const right = getOrbitPose(0.75);
    const wrap = getOrbitPose(1);

    expect(wrap.x).toBeCloseTo(top.x, 8);
    expect(wrap.y).toBeCloseTo(top.y, 8);
    expect(wrap.z).toBeCloseTo(top.z, 8);
    expect(wrap.scale).toBeCloseTo(top.scale, 8);
    expect(top.y).toBeLessThan(left.y);
    expect(left.y).toBeLessThan(bottom.y);
    expect(bottom.y).toBeGreaterThan(205);
    expect(bottom.y).toBeLessThan(225);
    expect(left.x).toBeLessThan(top.x);
    expect(top.x).toBeLessThan(right.x);
    expect(top.opacity).toBe(0);
    expect(right.opacity).toBe(0);
    expect(getOrbitPose(0.5).opacity).toBe(1);
    expect(getOrbitPose(0.6).opacity).toBe(1);
    expect(getOrbitPose(0.6).x).toBeGreaterThan(500);

    const beforeWrap = getOrbitPose(1 - 0.0001);
    const afterWrap = getOrbitPose(0.0001);
    expect(Math.abs(beforeWrap.x - afterWrap.x)).toBeLessThan(0.5);
    expect(Math.abs(beforeWrap.y - afterWrap.y)).toBeLessThan(0.4);

    for (let step = 0; step < 1000; step += 1) {
      const current = getOrbitPose(step / 1000);
      const next = getOrbitPose((step + 1) / 1000);
      expect(Math.hypot(next.x - current.x, next.y - current.y)).toBeLessThan(2.5);
    }
  });

  beforeAll(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class IntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('evenly spaces the remaining three panels around the orbit without a vacant slot', () => {
    const { container } = render(<LandingMarketplacePreview isDark={false} />);

    expect(container.querySelector('[data-card-kind="accepted-booking"]')).toHaveTextContent('CLEAR OFFERS.');
    expect(container.querySelector('[data-card-kind="accepted-booking"]')).toHaveTextContent('Compare proposed prices and terms before accepting an offer.');
    expect(container.querySelector('[data-card-kind="messages"]')).toHaveTextContent('TRUST IS EARNED');
    expect(container.querySelector('[data-card-kind="messages"]')).toHaveTextContent('Reviews after completed services');
    expect(container.querySelector('[data-card-kind="service-progress"]')).toHaveTextContent('Seeker');
    expect(container.querySelector('[data-card-kind="service-progress"]')).toHaveTextContent('One booking record');
    expect(container.querySelector('[data-card-kind="service-progress"]')).toHaveTextContent('Provider');
    expect(container.querySelector('[data-card-kind="service-progress"]')).toHaveTextContent('Keep the agreement and progress together.');
    expect(container.querySelector('[data-card-kind="service-progress"]')).not.toHaveTextContent('In Progress');
    expect(container).not.toHaveTextContent('CLOSE TO HOME.');
    expect(container.querySelector('[data-card-kind="completed-trust"]')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('Position 2');

    const cards = container.querySelectorAll('[data-orbit-card]');
    expect(cards).toHaveLength(6);
    expect(Array.from(cards, (card) => card.getAttribute('data-orbit-slot'))).toEqual(['0', '1', '2', '3', '4', '5']);
    const orbitOrder = Array.from(cards, (card) => card.getAttribute('data-card-kind'));
    expect(orbitOrder).toEqual([
      'accepted-booking', 'messages', 'service-progress', 'accepted-booking',
      'messages', 'service-progress',
    ]);
    const lightCards = new Set(['service-progress']);
    orbitOrder.forEach((kind, index) => {
      expect(lightCards.has(kind ?? '') && lightCards.has(orbitOrder[(index + 1) % orbitOrder.length] ?? '')).toBe(false);
    });
    cards.forEach((card) => {
      expect(card).toHaveAttribute('aria-hidden', 'true');
      expect(card.getAttribute('style')).toContain('translate3d');
    });
    expect(container.querySelector('[data-card-kind="accepted-booking"]')).toBeInTheDocument();
    expect(container.querySelector('[data-card-kind="messages"]')).toBeInTheDocument();
    expect(container.querySelector('[data-card-kind="service-progress"]')).toBeInTheDocument();
    expect(container.querySelector('[data-role-card="seeker"]')).toBeInTheDocument();
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });
});
