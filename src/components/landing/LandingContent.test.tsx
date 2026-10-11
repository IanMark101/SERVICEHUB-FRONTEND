import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

  it('answers eight practical discovery and account questions with accessible disclosure controls', async () => {
    render(<LandingFaq isDark={false} />);
    expect(screen.getByRole('heading', { name: 'Frequently asked questions.' })).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(8);
    const topics = [
      { question: /How can a Seeker discover Providers/, answer: /Open Seek Services/ },
      { question: /How can a Provider discover Seeker requests/, answer: /a request tied to a specific listing requires that matching listing/ },
      { question: /How do I use the map/, answer: /select Apply location to update your results/ },
      { question: /How does the discovery radius work/, answer: /1, 2, 5, 10, 15, 20 or 30 km/ },
      { question: /which results appear first/, answer: /higher Provider Trust Scores breaking equal-distance ties/ },
      { question: /What is Trust Score/, answer: /New accounts start at 50/ },
      { question: /Do I need verification/, answer: /One approved account can use both workspaces/ },
      { question: /follow a booking/, answer: /including when the Provider starts the job/ },
    ];
    let previous: HTMLElement | undefined;
    for (const topic of topics) {
      const question = screen.getByRole('button', { name: topic.question });
      if (question.getAttribute('aria-expanded') !== 'true') fireEvent.click(question);
      expect(question).toHaveAttribute('aria-expanded', 'true');
      if (previous) expect(previous).toHaveAttribute('aria-expanded', 'false');
      const answer = await screen.findByRole('region', { name: topic.question });
      expect(answer.id).toBe(question.getAttribute('aria-controls'));
      expect(within(answer).getByText(topic.answer)).toBeVisible();
      previous = question;
    }
    fireEvent.click(previous!);
    expect(previous).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('region', { name: /follow a booking/ })).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Open the Help Center' })).toHaveAttribute('href', '/help');
  });
});
