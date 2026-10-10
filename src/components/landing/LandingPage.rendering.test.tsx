import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '@/context/AppContext';
import LandingPage from './LandingPage';

vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn((media: string) => ({
    media, matches: false, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {},
  })) });
});

vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }));

describe('landing content before hydration and viewport initialization', () => {
  beforeEach(() => {
    vi.mocked(useApp).mockReturnValue({
      isDark: false, toggleTheme: vi.fn(), authLoading: true,
      isAuthenticated: false, user: null,
    } as unknown as ReturnType<typeof useApp>);
  });

  it.each([
    ['recovering session', true, false, null, false],
    ['guest', false, false, null, false],
    ['seeker', false, true, { role: 'seeker' }, false],
    ['provider', false, true, { role: 'provider' }, false],
    ['admin', false, true, { role: 'admin' }, false],
    ['dark guest', false, false, null, true],
  ])('renders the complete visible public body for %s', (_name, authLoading, isAuthenticated, user, isDark) => {
    vi.mocked(useApp).mockReturnValue({
      isDark, toggleTheme: vi.fn(), authLoading, isAuthenticated, user,
    } as unknown as ReturnType<typeof useApp>);
    // Inspect the actual server HTML: no mocked Motion components, hydration,
    // IntersectionObserver callbacks, auth responses, or animation frames.
    const html = renderToString(<LandingPage />);
    const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { name: 'ServiceHub', level: 1 })).toBeVisible();
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.querySelector('#top [data-orbit-card]')).not.toBeInTheDocument();
    expect(container.querySelector('#problem [data-orbit-card]')).toBeInTheDocument();
    expect(container.querySelector('#top img[src*="hero-presenter"]')).toBeInTheDocument();
    for (const id of ['problem', 'how-it-works', 'booking-progress', 'workspaces', 'trust', 'comparison', 'community', 'reviews', 'faq']) {
      const section = container.querySelector(`#${id}`)! as HTMLElement;
      expect(section).toBeInTheDocument();
      for (const heading of within(section).getAllByRole('heading')) expect(heading).toBeVisible();
    }
    const ctaHeading = within(main).getByRole('heading', { name: 'Create your ServiceHub profile.' });
    const footerHeading = within(main).getByRole('heading', { name: /Ready to get work done/i });
    expect(ctaHeading).toBeVisible();
    expect(footerHeading).toBeVisible();
    expect(ctaHeading.compareDocumentPosition(footerHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const cta = within(ctaHeading.closest('section')!);
    expect(cta.getByRole('link', { name: isAuthenticated ? 'Open workspace' : 'Get started' })).toBeVisible();
    if (isAuthenticated) {
      expect(cta.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    } else {
      expect(cta.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    }
    expect(container.querySelector('[data-preview-theme]')).toBeVisible();
    expect(container.querySelector('.brand-loading')).not.toBeInTheDocument();
    const steps = within(main).getByRole('list', { name: 'Seeker service steps' });
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3);
    expect(within(main).getByRole('region', { name: 'Example booking preview' })).toBeVisible();
    expect(within(main).getByRole('button', { name: 'Preview Start Job' })).toBeVisible();
    expect(container.querySelector('#queue')).toBeInTheDocument();
    expect(within(container.querySelector('#queue')! as HTMLElement).getByRole('link', { name: 'Payment and queue rules' })).toHaveAttribute('href', '/help/queue/how-the-queue-works');
    // Preserve all the existing sections while keeping detailed rules in their
    // own section, including in the HTML sent before session initialization.
    expect(within(main).queryByText('Social Posts')).not.toBeInTheDocument();
    expect(within(main).queryByText(/FCFS within this specific service/)).not.toBeInTheDocument();
    expect(within(main).queryByText(/Providers with matching active services/)).not.toBeInTheDocument();
    const comparison = within(main).getByRole('region', { name: 'A clearer way to find and offer services.' });
    const comparisonTable = within(comparison).getByRole('table');
    expect(within(comparisonTable).getByRole('columnheader', { name: /Facebook/ })).toBeInTheDocument();
    expect(within(comparisonTable).getByRole('columnheader', { name: /ServiceHub/ })).toBeInTheDocument();
    expect(within(comparisonTable).getByRole('rowheader', { name: /Nearby service discovery/ })).toBeVisible();
    expect(within(comparisonTable).getByRole('rowheader', { name: /Structured requests and offers/ })).toBeVisible();
    expect(within(comparisonTable).getAllByRole('cell', { name: 'Built into ServiceHub' })).toHaveLength(5);
    expect(within(comparisonTable).getAllByRole('cell', { name: 'Arranged manually through posts and messages' })).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'Compare' })).toHaveAttribute('href', '#comparison');
    expect(screen.getByRole('link', { name: 'Booking progress' })).toHaveAttribute('href', '#booking-progress');
    const tickers = container.querySelectorAll('[aria-label="ServiceHub highlights"]');
    expect(tickers).toHaveLength(2);
    expect(tickers[0]).toHaveTextContent('Aircon Service');
    expect(tickers[0]).not.toHaveTextContent('Barangay');
    expect(tickers[1]).toHaveTextContent('Choose Your Location');
    expect(tickers[1]).not.toHaveTextContent('Aircon Service');
    for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(container.querySelector(anchor.getAttribute('href')!)).toBeInTheDocument();
    }
  });
});
