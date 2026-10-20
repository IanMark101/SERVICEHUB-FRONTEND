import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiConfirmOnlineBooking, apiInitiatePayment } from '../../api/bookings.api';
import { readGcashCheckout, rememberGcashCheckout } from '../../lib/paymentCheckout';
import PaymentReturn from './PaymentReturn';
import GcashPaymentStatus from './GcashPaymentStatus';
import { invalidateApiCache } from '../../lib/api/responseCache';

const state = vi.hoisted(() => ({ replace: vi.fn(), user: { id: 'seeker-one' } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: state.replace }) }));
vi.mock('../../context/AppContext', () => ({ useApp: () => ({ user: state.user, isDark: false }) }));
vi.mock('../../api/bookings.api', () => ({ apiConfirmOnlineBooking: vi.fn(), apiInitiatePayment: vi.fn() }));
const oldCheckout = { seekerId: 'seeker-one', serviceId: 'service-one', paymentIntentId: 'pi_old', redirectUrl: 'https://test-sources.paymongo.com/sources/src_old', expectedAmount: 500, title: 'Math tutoring', providerName: 'Test provider', commission: { ratePercent: 10, platformFeeAmount: 50, providerNetAmount: 450 } };

describe('GCash review, return and recovery', () => {
  beforeEach(() => {
    localStorage.clear(); vi.clearAllMocks(); state.user = { id: 'seeker-one' };
    vi.spyOn(window, 'open').mockReturnValue(null);
    rememberGcashCheckout(oldCheckout);
  });

  it('shows the exact total before the customer explicitly opens GCash, without starting verification early', async () => {
    const close = vi.fn();
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'PENDING' } });
    render(<GcashPaymentStatus paymentIntentId="pi_old" initialCheckout={{ ...oldCheckout, checkoutOpened: false }} onClose={close} />);
    expect(screen.getByRole('heading', { name: 'Review payment' })).toBeVisible();
    expect(screen.getByRole('complementary', { name: 'Payment summary' })).toHaveTextContent('Total you pay₱500.00');
    expect(screen.getByText('The 10% platform fee is included.')).toBeVisible();
    expect(screen.getByText('Platform fee (10%)')).not.toBeVisible();
    fireEvent.click(screen.getByText('Fee details'));
    expect(screen.getByText('Platform fee (10%)')).toBeVisible();
    expect(screen.getByText('₱450.00')).toBeVisible();
    expect(apiConfirmOnlineBooking).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
    const link = screen.getByRole('link', { name: 'Continue with GCash' });
    expect(link).toHaveAttribute('href', oldCheckout.redirectUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(link);
    await waitFor(() => expect(apiConfirmOnlineBooking).toHaveBeenCalledWith({ paymentIntentId: 'pi_old' }));
    expect(readGcashCheckout('seeker-one', 'pi_old')?.checkoutOpened).toBe(true);
    expect(screen.queryByRole('heading', { name: 'Payment successful' })).not.toBeInTheDocument();
  });

  it('cancel closes the review without opening a payment tab or confirming a payment', () => {
    const close = vi.fn();
    render(<GcashPaymentStatus paymentIntentId="pi_old" initialCheckout={{ ...oldCheckout, checkoutOpened: false }} onClose={close} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledOnce();
    expect(window.open).not.toHaveBeenCalled();
    expect(apiConfirmOnlineBooking).not.toHaveBeenCalled();
  });

  it('restores an unopened checkout as a review, including after refresh', async () => {
    rememberGcashCheckout({ ...oldCheckout, checkoutOpened: false });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: 'Review payment' });
    expect(apiConfirmOnlineBooking).not.toHaveBeenCalled();
  });

  it('keeps failure recovery GCash-only and never reopens the expired link', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'FAILED' } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: 'Payment not completed' });
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to service' })).toHaveAttribute('href', '/seeker/seek-services?serviceId=service-one');
    expect(screen.queryByRole('link', { name: 'Open GCash' })).not.toBeInTheDocument();
  });

  it('does not invent an amount or allow checkout if details are missing', async () => {
    localStorage.clear();
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'PENDING' } });
    render(<PaymentReturn paymentIntentId="pi_unknown" />);
    await screen.findByRole('heading', { name: 'Waiting for payment' });
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.queryByText('₱0.00')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open GCash' })).not.toBeInTheDocument();
  });

  it('does not turn a return URL into payment success and lets the customer re-open the valid checkout', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'PENDING' } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    expect(await screen.findByRole('link', { name: 'Open GCash' })).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('link', { name: 'View booking' })).not.toBeInTheDocument();
    expect(screen.getByText(/This page updates automatically/)).toBeVisible();
  });

  it('starts retries at a fresh review with fresh server amounts and no automatic gateway tab', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'FAILED' } });
    vi.mocked(apiInitiatePayment).mockResolvedValue({ success: true, data: { paymentIntentId: 'pi_fresh', redirectUrl: 'https://test-sources.paymongo.com/sources/fresh', expectedAmount: 1000, commission: { ratePercent: 10, platformFeeAmount: 100, providerNetAmount: 900 } } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(state.replace).toHaveBeenCalledWith('/seeker/payment-return?payment_intent_id=pi_fresh'));
    expect(apiInitiatePayment).toHaveBeenCalledWith({ serviceId: 'service-one', offerId: undefined, paymentMethodType: 'gcash', retryPaymentIntentId: 'pi_old' });
    expect(readGcashCheckout('seeker-one', 'pi_fresh')).toMatchObject({ expectedAmount: 1000, checkoutOpened: false, commission: { platformFeeAmount: 100, providerNetAmount: 900 } });
    expect(window.open).not.toHaveBeenCalled();
  });

  it('shows a compact verified receipt, restores server details without storage and opens the exact booking', async () => {
    localStorage.clear();
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'SUCCEEDED', checkout: { ...oldCheckout, bookingId: 'booking-one', reference: 'pay_verified', paidAt: '2026-10-20T08:00:00Z', isTestMode: true } } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: 'Payment successful' });
    expect(screen.getByText('Amount paid').parentElement).toHaveTextContent('₱500.00');
    expect(screen.getByText('Math tutoring')).toBeVisible();
    expect(screen.getByRole('link', { name: 'View booking' })).toHaveAttribute('href', '/seeker/seeker-activity?tab=all&booking=booking-one');
    expect(screen.queryByText('GCash checkout')).not.toBeInTheDocument();
    expect(screen.queryByText('Payment method')).not.toBeInTheDocument();
    expect(screen.queryByText(/paid work queue/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Continue with GCash' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Payment details'));
    expect(screen.getByText('pay_verified')).toBeVisible();
    expect(screen.getByText('Platform fee (10%)')).toBeVisible();
    expect(readGcashCheckout('seeker-one', 'pi_old')).toBeNull();
  });

  it.each(['SUCCEEDED', 'PENDING'])('rechecks live booking events and trusts only the server %s result', async status => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValueOnce({ success: true, data: { status: 'PENDING' } });
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('link', { name: 'Open GCash' });
    vi.useFakeTimers();
    try {
      act(() => { invalidateApiCache(['bookings'], 'socket'); invalidateApiCache(['bookings'], 'socket'); });
      await act(async () => { await vi.advanceTimersByTimeAsync(250); });
      expect(apiConfirmOnlineBooking).toHaveBeenCalledTimes(2);
    } finally { vi.useRealTimers(); }
    if (status === 'SUCCEEDED') await screen.findByRole('heading', { name: 'Payment successful' });
    else expect(screen.queryByRole('heading', { name: 'Payment successful' })).not.toBeInTheDocument();
  });

  it.each([['REFUNDED', 'Payment refunded'], ['REFUND_REQUIRED', 'Payment under review']])('shows %s without offering another payment', async (status, heading) => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: heading });
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open GCash' })).not.toBeInTheDocument();
  });

  it('offers recovery when verification fails without calling the payment successful', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({ success: true, data: { status: 'SUCCEEDED' } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: 'Unable to check payment' });
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await screen.findByRole('heading', { name: 'Payment successful' });
  });

  it('removes another account’s receipt immediately and ignores its late verification response', async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(apiConfirmOnlineBooking).mockReturnValueOnce(new Promise(r => { resolve = r; }));
    const view = render(<PaymentReturn paymentIntentId="pi_old" />);
    await waitFor(() => expect(apiConfirmOnlineBooking).toHaveBeenCalledOnce());
    state.user = { id: 'other-customer' };
    vi.mocked(apiConfirmOnlineBooking).mockRejectedValue(new Error('Not owned'));
    view.rerender(<PaymentReturn paymentIntentId="pi_old" />);
    expect(screen.queryByText('Math tutoring')).not.toBeInTheDocument();
    await act(async () => resolve({ success: true, data: { status: 'SUCCEEDED', checkout: oldCheckout } }));
    await screen.findByRole('heading', { name: 'Unable to check payment' });
    expect(screen.queryByRole('heading', { name: 'Payment successful' })).not.toBeInTheDocument();
  });

  it('never exposes an untrusted checkout URL or pays with a missing amount', () => {
    render(<GcashPaymentStatus paymentIntentId="pi_old" initialCheckout={{ ...oldCheckout, checkoutOpened: false, redirectUrl: 'https://paymongo.com.evil.example/' }} onClose={vi.fn()} />);
    expect(screen.queryByRole('link', { name: 'Continue with GCash' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('alert')).toHaveTextContent('Checkout details are unavailable');
  });
});
