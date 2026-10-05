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
    ['recovering session', true, false, null],
    ['guest', false, false, null],
    ['seeker', false, true, { role: 'seeker' }],
    ['provider', false, true, { role: 'provider' }],
    ['admin', false, true, { role: 'admin' }],
  ])('renders the complete visible public body for %s', (_name, authLoading, isAuthenticated, user) => {
    vi.mocked(useApp).mockReturnValue({
      isDark: false, toggleTheme: vi.fn(), authLoading, isAuthenticated, user,
    } as unknown as ReturnType<typeof useApp>);
    // Inspect the actual server HTML: no mocked Motion components, hydration,
    // IntersectionObserver callbacks, auth responses, or animation frames.
    const html = renderToString(<LandingPage />);
    const { container } = render(<div dangerouslySetInnerHTML={{ __html: html }} />);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { name: 'ServiceHub Cordova', level: 1 })).toBeVisible();
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.querySelector('#top [data-orbit-card]')).not.toBeInTheDocument();
    expect(container.querySelector('#problem [data-orbit-card]')).toBeInTheDocument();
    expect(container.querySelector('#top img[src*="hero-presenter"]')).toBeInTheDocument();
    for (const id of ['problem', 'how-it-works', 'workspaces', 'queue', 'trust', 'comparison', 'community', 'reviews', 'faq']) {
      const section = container.querySelector(`#${id}`)! as HTMLElement;
      expect(section).toBeInTheDocument();
      for (const heading of within(section).getAllByRole('heading')) expect(heading).toBeVisible();
    }
    expect(within(main).getByRole('heading', { name: /Ready to get work done/i })).toBeVisible();
    expect(container.querySelector('[data-preview-theme]')).toBeVisible();
    expect(container.querySelector('.brand-loading')).not.toBeInTheDocument();
    // Preserve all the existing sections while keeping detailed rules in their
    // own section, including in the HTML sent before session initialization.
    expect(within(main).queryByText('Social Posts')).not.toBeInTheDocument();
    expect(within(main).queryByText(/FCFS within this specific service/)).not.toBeInTheDocument();
    expect(within(main).queryByText(/Providers with matching active services/)).not.toBeInTheDocument();
    expect(within(main).getByRole('heading', { name: 'Support when something needs attention.' })).toBeVisible();
    const tickers = container.querySelectorAll('[aria-label="ServiceHub highlights"]');
    expect(tickers).toHaveLength(2);
    expect(tickers[0]).toHaveTextContent('Aircon Service');
    expect(tickers[0]).not.toHaveTextContent('Barangay');
    expect(tickers[1]).toHaveTextContent('Barangay Ibabao');
    expect(tickers[1]).not.toHaveTextContent('Aircon Service');
    for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(container.querySelector(anchor.getAttribute('href')!)).toBeInTheDocument();
    }
  });
});
