import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import LandingFaq from './LandingFaq';
import LandingHowItWorks from './LandingHowItWorks';
import LandingTrust from './LandingTrust';

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

  it('lets visitors explore reviews and evidence-based trust with keyboard tabs', () => {
    render(<LandingTrust isDark={false} />);
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const reviews = screen.getByRole('tab', { name: 'Reviews' });
    const score = screen.getByRole('tab', { name: 'Trust score' });
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    expect(screen.queryByRole('tabpanel', { name: 'Reviews' })).not.toBeInTheDocument();
    fireEvent.keyDown(overview, { key: 'ArrowRight' });
    expect(reviews).toHaveFocus();
    expect(reviews).toHaveAttribute('aria-selected', 'true');
    const reviewPanel = within(screen.getByRole('tabpanel', { name: 'Reviews' }));
    const reviewRows = within(reviewPanel.getByRole('list')).getAllByRole('listitem');
    expect(reviewRows[0]).toHaveTextContent('The Provider submits the work');
    expect(reviewRows[1]).toHaveTextContent('The Seeker confirms the result');
    expect(reviewRows[2]).toHaveTextContent('Both sides can leave a review');
    expect(reviewRows[2]).toHaveTextContent('separately from Trust Score');
    expect(reviewPanel.getByRole('heading', { name: 'Responses and disputes' })).toBeVisible();
    fireEvent.keyDown(reviews, { key: 'End' });
    expect(score).toHaveFocus();
    const scorePanel = within(screen.getByRole('tabpanel', { name: 'Trust score' }));
    expect(scorePanel.getByText(/Every account starts at 50/)).toBeVisible();
    expect(scorePanel.getByText(/first approved verification earns 5 points, once per account/)).toBeVisible();
    expect(scorePanel.getByText(/Each eligible participant earns 3 points/)).toBeVisible();
    expect(scorePanel.getByText(/rolling 30-day period, including when roles are switched/)).toBeVisible();
    expect(scorePanel.getByText(/after work starts deducts 5 points; serious misconduct deducts 10/)).toBeVisible();
    fireEvent.keyDown(score, { key: 'ArrowRight' });
    expect(overview).toHaveFocus();
    fireEvent.keyDown(overview, { key: 'ArrowLeft' });
    expect(score).toHaveFocus();
    fireEvent.keyDown(score, { key: 'Home' });
    expect(overview).toHaveFocus();
    fireEvent.click(reviews);
    expect(reviews).toHaveAttribute('aria-selected', 'true');
    expect(overview).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('link', { name: 'Read the trust score rules' })).toHaveAttribute('href', '/help/trust-reputation/how-trust-score-changes');
  });

  it('opens the review explanation for an existing reviews anchor', () => {
    window.history.replaceState(null, '', '/#reviews');
    const { unmount } = render(<LandingTrust isDark />);
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Reviews' })).toBeVisible();
    expect(document.querySelector('#reviews')).toBeInTheDocument();
    unmount();
    window.history.replaceState(null, '', '/');
  });
});
