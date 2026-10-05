import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import LandingFaq from './LandingFaq';
import LandingHowItWorks from './LandingHowItWorks';

describe('landing information and disclosure controls', () => {
  beforeAll(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('matchMedia', vi.fn((media: string) => ({
      media, matches: true, addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {},
    })));
  });

  it('keeps the journey role switch usable and points to dedicated policy sections', async () => {
    render(<LandingHowItWorks isDark={false} />);
    const providerTab = screen.getByRole('button', { name: 'Offering services' });
    fireEvent.click(providerTab);
    expect(providerTab).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByRole('heading', { name: 'Respond to custom requests' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Payment and queue rules' })).toHaveAttribute('href', '#queue');
    expect(screen.getByRole('link', { name: 'Verification and messaging' })).toHaveAttribute('href', '#trust');
    expect(screen.getByRole('link', { name: 'How reviews work' })).toHaveAttribute('href', '#reviews');
    fireEvent.click(screen.getByRole('button', { name: 'Seeking services' }));
    expect(await screen.findByRole('heading', { name: 'Browse or post a request' })).toBeVisible();
  });

  it('keeps distinct FAQ answers available, including the listing-specific offer exception', async () => {
    render(<LandingFaq isDark={false} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    const listingQuestion = screen.getByRole('button', { name: 'Do I need a service listing to send an offer?' });
    fireEvent.click(listingQuestion);
    expect(listingQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText(/If the request is tied to a specific listing, your offer must use that listing/)).toBeVisible();
    const paymentQuestion = screen.getByRole('button', { name: 'Does GCash send real money to a provider?' });
    fireEvent.click(paymentQuestion);
    expect(paymentQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(listingQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(await screen.findByText(/no real online payment or Provider payout takes place/)).toBeVisible();
    fireEvent.click(paymentQuestion);
    expect(paymentQuestion).toHaveAttribute('aria-expanded', 'false');
  });
});
