import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './page';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

describe('Help Center search using local guides', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders matching guides in the initial HTML without a search loader', async () => {
    const html = renderToString(await Page({ searchParams: Promise.resolve({ q: 'queue' }) }));
    expect(html).toContain('How the Provider Work Queue Works');
    expect(html).toContain('/help/queue/how-the-queue-works');
    expect(html).not.toContain('brand-loading');
    expect(html).not.toContain('Searching help guides');
  });

  it('shows search guidance when no query is supplied', async () => {
    render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Search across every guide')).toBeVisible();
    expect(screen.getByLabelText('Search the ServiceHub help center')).toHaveValue('');
  });

  it('uses the first query value when the URL repeats q', async () => {
    render(await Page({ searchParams: Promise.resolve({ q: ['queue', 'verification'] }) }));
    expect(screen.getByLabelText('Search the ServiceHub help center')).toHaveValue('queue');
    expect(screen.getByRole('link', { name: /How the Provider Work Queue Works/ })).toHaveAttribute('href', '/help/queue/how-the-queue-works');
  });

  it('keeps collection filters and new search navigation working', async () => {
    const view = render(await Page({ searchParams: Promise.resolve({ q: 'queue' }) }));
    fireEvent.click(screen.getByRole('button', { name: /queue/i }));
    expect(screen.getByRole('link', { name: /How the Provider Work Queue Works/ })).toBeVisible();
    const input = screen.getByLabelText('Search the ServiceHub help center');
    fireEvent.change(input, { target: { value: 'payment hold' } });
    fireEvent.submit(input.closest('form')!);
    expect(push).toHaveBeenCalledWith('/help/search?q=payment%20hold');
    view.rerender(await Page({ searchParams: Promise.resolve({ q: 'payment hold' }) }));
    await waitFor(() => expect(screen.getByLabelText('Search the ServiceHub help center')).toHaveValue('payment hold'));
    expect(screen.getByRole('heading', { level: 2, name: /results? for "payment hold"/ })).toBeVisible();
  });

  it('shows a recoverable empty state for a query with no matches', async () => {
    render(await Page({ searchParams: Promise.resolve({ q: 'nonexistent-xyz-topic' }) }));
    expect(screen.getByText('No guides matched "nonexistent-xyz-topic".')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse all collections' })).toHaveAttribute('href', '/help');
  });
});
