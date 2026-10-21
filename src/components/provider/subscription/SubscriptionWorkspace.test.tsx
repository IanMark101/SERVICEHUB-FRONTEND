import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { getSubscription, startProCheckout, confirmProPayment, cancelPro, type ProviderSubscription, type SubscriptionPayment } from '../../../api/subscriptions.api';
import SubscriptionWorkspace from './SubscriptionWorkspace';
import ProviderPricing from './ProviderPricing';
import { safeSubscriptionCheckout } from '../../../lib/subscriptions';

vi.mock('next/navigation', () => ({ useSearchParams: vi.fn() }));
vi.mock('../../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../../api/subscriptions.api', () => ({ getSubscription: vi.fn(), startProCheckout: vi.fn(), confirmProPayment: vi.fn(), cancelPro: vi.fn(), cancelProCheckout: vi.fn() }));
vi.mock('@number-flow/react', () => ({ default: ({ value, format }: { value: number; format: Intl.NumberFormatOptions }) => <span>{new Intl.NumberFormat('en-PH', format).format(value)}</span> }));
vi.mock('motion/react', () => ({ useReducedMotion: () => true, motion: { span: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <span className={className}>{children}</span>, article: ({ children, className, 'aria-label': label }: React.PropsWithChildren<{ className?: string; 'aria-label': string }>) => <article className={className} aria-label={label}>{children}</article> } }));
const free: ProviderSubscription = { plan: 'FREE', subscriptionPlan: 'FREE', subscriptionStatus: 'ACTIVE', subscriptionStartedAt: null, subscriptionExpiresAt: null, commissionRateBps: 1000, activeListingLimit: 3, activeListings: 3, monthlyPrice: 199, featuredPriority: false, isTestMode: true, payments: [] };
const pro: ProviderSubscription = { ...free, plan: 'PRO', subscriptionPlan: 'PRO', commissionRateBps: 500, activeListingLimit: null, activeListings: 8, featuredPriority: true, subscriptionStartedAt: '2026-10-20T08:00:00Z', subscriptionExpiresAt: '2026-11-20T08:00:00Z' };
const pending: SubscriptionPayment = { id: 'sub-1', plan: 'PRO', amount: 199, currency: 'PHP', paymentMethod: 'gcash', paymentReference: null, paymentIntentId: 'pi_sub1', paymentStatus: 'PENDING', redirectUrl: 'https://test-sources.paymongo.com/sources/sub1', isTestMode: true, checkoutExpiresAt: '2026-10-20T08:15:00Z', subscriptionStartedAt: null, subscriptionExpiresAt: null, createdAt: '2026-10-20T08:00:00Z', paidAt: null };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useApp).mockReturnValue({ user: { id: 'provider-1', role: 'provider' }, isDark: false } as ReturnType<typeof useApp>);
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
  vi.mocked(getSubscription).mockResolvedValue(free);
  vi.mocked(startProCheckout).mockResolvedValue(pending);
  vi.mocked(confirmProPayment).mockResolvedValue(pending);
});
describe('provider subscription workspace', () => {
  it('has exactly Free/Pro, monthly pesos, shared analytics and the right current-plan buttons', async () => {
    const { rerender } = render(<ProviderPricing currentPlan="FREE" monthlyPrice={199} disabled={false} onUpgrade={vi.fn()} />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('group', { name: '₱199 per month' })).toBeVisible();
    expect(screen.getAllByText('Provider analytics')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Current Plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeEnabled();
    expect(screen.queryByText(/yearly|USD|advanced analytics/i)).not.toBeInTheDocument();
    rerender(<ProviderPricing currentPlan="PRO" monthlyPrice={199} disabled={false} onUpgrade={vi.fn()} />);
    expect(within(screen.getByRole('article', { name: 'Pro plan' })).getByRole('button', { name: 'Current Plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Free Plan' })).toBeDisabled();
  });
  it('reviews the fixed price before checkout and waits for server-verified payment', async () => {
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Upgrade to Pro' }));
    expect(screen.getByRole('button', { name: 'Continue to Payment' })).toBeVisible();
    expect(startProCheckout).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment' }));
    const gateway = await screen.findByRole('link', { name: /Continue to GCash/ });
    expect(gateway).toHaveAttribute('href', pending.redirectUrl);
    expect(screen.queryByText('Welcome to ServiceHub Pro')).not.toBeInTheDocument();
    expect(startProCheckout).toHaveBeenCalledTimes(1);
    vi.mocked(confirmProPayment).mockResolvedValue({ ...pending, paymentStatus: 'SUCCEEDED', paymentReference: 'pay_verified' });
    vi.mocked(getSubscription).mockResolvedValue(pro);
    fireEvent.click(screen.getByRole('button', { name: 'Check payment' }));
    expect(await screen.findByText('Welcome to ServiceHub Pro')).toBeVisible();
    expect(screen.getByText(/Active until November 20, 2026/)).toBeVisible();
  });
  it('uses error styling when checkout fails and never announces an upgrade', async () => {
    vi.mocked(startProCheckout).mockRejectedValue(new Error('GCash is unavailable.'));
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Upgrade to Pro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('GCash is unavailable.');
    expect(screen.queryByText('Welcome to ServiceHub Pro')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to Payment' })).toBeEnabled();
  });
  it('cancellation retains the paid expiry and Pro current-plan state', async () => {
    vi.mocked(getSubscription).mockResolvedValue(pro);
    vi.mocked(cancelPro).mockResolvedValue({ ...pro, subscriptionStatus: 'CANCELLED' });
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel Pro' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Your benefits stay active until November 20, 2026');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel Pro' }));
    expect(await screen.findByText('Cancelled. Your paid benefits stay active until this date.')).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(screen.getByRole('article', { name: 'Pro plan' })).getByRole('button', { name: 'Current Plan' })).toBeDisabled();
  });
  it('explains grandfathered listings after expiry without removing analytics', async () => {
    vi.mocked(getSubscription).mockResolvedValue({ ...free, subscriptionStatus: 'EXPIRED', activeListings: 8 });
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    expect(await screen.findByText(/Your 8 existing listings stay active/)).toBeVisible();
    expect(screen.getAllByText('Provider analytics')).toHaveLength(2);
  });
  it('rejects unsafe or lookalike gateway links', () => {
    for (const url of ['javascript:alert(1)', 'http://paymongo.com/pay', 'https://paymongo.com.evil.test/pay', 'https://evil.test/pay', null]) expect(safeSubscriptionCheckout(url)).toBeNull();
    expect(safeSubscriptionCheckout(pending.redirectUrl)).toBe(pending.redirectUrl);
  });
});
