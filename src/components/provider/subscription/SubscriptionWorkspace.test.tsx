import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { getSubscription, startFreeProviderPlan, getMembershipQuote, startMembershipCheckout, confirmProPayment, cancelPro } from '../../../api/subscriptions.api';
import SubscriptionWorkspace from './SubscriptionWorkspace';
import ProviderPricing from './ProviderPricing';
import { safeSubscriptionCheckout } from '../../../lib/subscriptions';
import { free, basic, pro, quote, pending } from './membership-fixtures.test-support';
vi.mock('next/navigation', () => ({ useSearchParams: vi.fn() }));
vi.mock('../../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../../api/subscriptions.api', () => ({ getSubscription: vi.fn(), startFreeProviderPlan: vi.fn(), getMembershipQuote: vi.fn(), startMembershipCheckout: vi.fn(), confirmProPayment: vi.fn(), cancelPro: vi.fn(), cancelProCheckout: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useApp).mockReturnValue({ user: { id: 'provider-1', role: 'provider' }, isDark: false } as ReturnType<typeof useApp>);
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
  vi.mocked(getSubscription).mockResolvedValue(free);
  vi.mocked(startFreeProviderPlan).mockResolvedValue(free);
  vi.mocked(getMembershipQuote).mockResolvedValue(quote);
  vi.mocked(startMembershipCheckout).mockResolvedValue(pending);
  vi.mocked(confirmProPayment).mockResolvedValue(pending);
});
describe('provider memberships', () => {
  it('announces loading without exposing checkout actions until membership data is available', async () => {
    let resolveMembership!: (value: typeof free) => void;
    vi.mocked(getSubscription).mockReturnValue(new Promise(resolve => { resolveMembership = resolve; }));
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    const loading = screen.getByRole('status', { name: 'Loading your subscription' });
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('₱99.00')).not.toBeInTheDocument();
    resolveMembership(free);
    expect(await screen.findByRole('button', { name: 'Choose Basic' })).toBeEnabled();
    expect(screen.queryByRole('status', { name: 'Loading your subscription' })).not.toBeInTheDocument();
    expect(startMembershipCheckout).not.toHaveBeenCalled();
  });
  it('replaces the skeleton with a recoverable error and loads the plans on retry', async () => {
    vi.mocked(getSubscription).mockRejectedValueOnce(new Error('Connection lost.')).mockResolvedValue(free);
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost.');
    expect(screen.queryByRole('status', { name: 'Loading your subscription' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('button', { name: 'Choose Basic' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(startMembershipCheckout).not.toHaveBeenCalled();
  });
  it('shows three comparable plans, visible prices, limits and correct current-plan actions', () => {
    const { rerender } = render(<ProviderPricing membership={free} disabled={false} onChoose={vi.fn()} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    for (const [name, price, fee] of [['Free', '0', '10%'], ['Basic', '99', '8%'], ['Pro', '199', '5%']]) {
      const card = within(screen.getByRole('article', { name: `${name} plan` }));
      expect(card.getByText(price)).toBeVisible(); expect(card.getByText(fee)).toBeVisible();
    }
    expect(screen.getByText('1 active service listing')).toBeVisible();
    expect(screen.getByText('Up to 3 active listings')).toBeVisible();
    expect(screen.getByText('Unlimited active listings')).toBeVisible();
    expect(screen.getByText('Recommended')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled();
    rerender(<ProviderPricing membership={pro} disabled={false} onChoose={vi.fn()} />);
    expect(within(screen.getByRole('article', { name: 'Pro plan' })).getByRole('button', { name: 'Current plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'After Pro expires' })).toBeDisabled();
  });
  it('reviews the signed Basic price before checkout; activates only on server confirmation', async () => {
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Choose Basic' }));
    expect(await screen.findByText('₱99.00', { selector: 'dd' })).toBeVisible();
    expect(startMembershipCheckout).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }));
    expect(await screen.findByRole('link', { name: /Continue to GCash/ })).toHaveAttribute('href', pending.redirectUrl);
    expect(startMembershipCheckout).toHaveBeenCalledWith('BASIC', quote.quoteToken);
    expect(within(screen.getByRole('region', { name: 'Current membership' })).getByRole('heading')).toHaveTextContent('Free');
    vi.mocked(confirmProPayment).mockResolvedValue({ ...pending, paymentStatus: 'SUCCEEDED' });
    vi.mocked(getSubscription).mockResolvedValue(basic);
    fireEvent.click(screen.getByRole('button', { name: 'Check payment' }));
    await waitFor(() => expect(within(screen.getByRole('region', { name: 'Current membership' })).getByRole('heading')).toHaveTextContent('Basic'));
    expect(screen.getByText(/Payment confirmed/)).toBeVisible();
  });
  it('shows the prorated upgrade and unchanged expiry before charging', async () => {
    vi.mocked(getSubscription).mockResolvedValue(basic);
    vi.mocked(getMembershipQuote).mockResolvedValue({ ...quote, plan: 'PRO', monthlyPrice: 199, amount: 50, billingAction: 'UPGRADE', periodExpiresAt: basic.expiresAt });
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Choose Pro' }));
    expect(await screen.findByText('Prorated upgrade')).toBeVisible();
    expect(screen.getByText('₱50.00')).toBeVisible();
    expect(screen.getByText(/Your expiry stays Nov 20, 2026/)).toBeVisible();
    expect(startMembershipCheckout).not.toHaveBeenCalled();
  });
  it('requires a new review when a price quote expires', async () => {
    vi.mocked(getMembershipQuote).mockResolvedValueOnce({ ...quote, validUntil: '2000-01-01T00:00:00Z' }).mockResolvedValue(quote);
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Choose Basic' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue to payment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Review the updated total');
    expect(startMembershipCheckout).not.toHaveBeenCalled();
  });
  it('shows gateway failure without claiming membership activation', async () => {
    vi.mocked(startMembershipCheckout).mockRejectedValue(new Error('GCash is unavailable.'));
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Choose Basic' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue to payment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('GCash is unavailable.');
    expect(screen.queryByText(/Payment confirmed/)).not.toBeInTheDocument();
  });
  it('keeps cancelled paid access through expiry', async () => {
    vi.mocked(getSubscription).mockResolvedValue(pro);
    vi.mocked(cancelPro).mockResolvedValue({ ...pro, subscriptionStatus: 'CANCELLED', status: 'CANCELLED' });
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel membership' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('until Nov 20, 2026');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel membership' }));
    expect(await screen.findByText('Ends at expiry')).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(screen.getByRole('article', { name: 'Pro plan' })).getByRole('button', { name: 'Current plan' })).toBeDisabled();
  });
  it('retains the expired paid plan and clearly preserves existing bookings', async () => {
    vi.mocked(getSubscription).mockResolvedValue({ ...pro, marketplaceAccess: false, subscriptionStatus: 'EXPIRED', status: 'EXPIRED', fullAnalytics: false });
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    expect(await screen.findByText('Existing bookings remain available. Choose Basic or Pro to accept new customers.')).toBeVisible();
    expect(within(screen.getByRole('region', { name: 'Current membership' })).getByRole('heading')).toHaveTextContent('Pro');
    expect(screen.getByRole('button', { name: 'Free period used' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Renew membership' })).toBeEnabled();
  });
  it('starts the trial only once for an unstarted provider', async () => {
    vi.mocked(getSubscription).mockResolvedValue({ ...free, trialStarted: false });
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    await screen.findByRole('button', { name: 'Choose Basic' });
    expect(startFreeProviderPlan).toHaveBeenCalledTimes(1);
  });
  it('does not accept a return URL as proof of payment', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('payment_intent_id=pi_other') as ReturnType<typeof useSearchParams>);
    vi.mocked(confirmProPayment).mockRejectedValue(new Error('Payment not found'));
    render(<SubscriptionWorkspace Pricing={ProviderPricing} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Payment not found');
    expect(screen.queryByText(/Payment confirmed/)).not.toBeInTheDocument();
  });
  it('rejects unsafe or lookalike gateway links', () => {
    for (const url of ['javascript:alert(1)', 'http://paymongo.com/pay', 'https://paymongo.com.evil.test/pay', 'https://evil.test/pay', null]) expect(safeSubscriptionCheckout(url)).toBeNull();
    expect(safeSubscriptionCheckout(pending.redirectUrl)).toBe(pending.redirectUrl);
  });
});
