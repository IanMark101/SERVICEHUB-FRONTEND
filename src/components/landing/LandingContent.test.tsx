import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.getByRole('heading', { name: 'A straightforward path from need to completed work.' })).toBeVisible();
    const seekerSteps = within(screen.getByRole('list', { name: 'Seeker service steps' }));
    expect(seekerSteps.getAllByRole('listitem')).toHaveLength(3);
    expect(seekerSteps.getByRole('heading', { name: 'Browse or post a request' })).toBeVisible();
    expect(seekerSteps.getByRole('heading', { name: 'Choose an available payment option' })).toBeVisible();
    expect(seekerSteps.getByRole('heading', { name: 'Track and verify the work' })).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    const providerTab = screen.getByRole('button', { name: 'Offering services' });
    fireEvent.click(providerTab);
    expect(providerTab).toHaveAttribute('aria-pressed', 'true');
    const providerSteps = within(screen.getByRole('list', { name: 'Provider service steps' }));
    expect(providerSteps.getAllByRole('listitem')).toHaveLength(3);
    expect(providerSteps.getByRole('heading', { name: 'Create a service listing' })).toBeVisible();
    expect(providerSteps.getByRole('heading', { name: 'Deliver the agreed work' })).toBeVisible();
    expect(screen.getByText(/Browse Service Requests and send an offer/)).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Respond to custom requests' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Payment and queue rules' })).toHaveAttribute('href', '/help/queue/how-the-queue-works');
    expect(screen.getByRole('link', { name: 'Verification and messaging' })).toHaveAttribute('href', '/help/verification/why-verification-is-required');
    expect(screen.getByRole('link', { name: 'How reviews work' })).toHaveAttribute('href', '/help/reviews/how-reviews-and-ratings-work');
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
