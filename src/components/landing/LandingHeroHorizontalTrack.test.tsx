import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import LandingHeroHorizontalTrack from './LandingHeroHorizontalTrack';

describe('LandingHeroHorizontalTrack', () => {
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

  it('loops the remaining panels without the removed green card', () => {
    const { container } = render(<LandingHeroHorizontalTrack />);
    const viewport = container.querySelector('[data-hero-track]');
    const sequences = container.querySelectorAll('[data-track-sequence]');
    // The existing row-reverse track makes visual left-to-right order the reverse of DOM order.
    const order = ['accepted-booking', 'messages', 'service-progress'];
    expect([...order].reverse()).toEqual(['service-progress', 'messages', 'accepted-booking']);

    expect(viewport).toBeInTheDocument();
    expect(sequences).toHaveLength(2);
    sequences.forEach((sequence) => {
      expect(Array.from(sequence.querySelectorAll('[data-card-kind]'), (card) => card.getAttribute('data-card-kind'))).toEqual(order);
      expect(sequence).toHaveAttribute('aria-hidden', 'true');
    });
    expect(sequences[0]).toHaveTextContent('CLEAR OFFERS.');
    expect(sequences[0]).toHaveTextContent('TRUST IS EARNED');
    expect(sequences[0]).toHaveTextContent('Keep the agreement and progress together.');
    expect(container).not.toHaveTextContent('CLOSE TO HOME.');
    expect(container.querySelector('[data-card-kind="completed-trust"]')).not.toBeInTheDocument();
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });
});
