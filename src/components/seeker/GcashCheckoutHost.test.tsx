import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiConfirmOnlineBooking, apiInitiatePayment } from '../../api/bookings.api';
import { readGcashCheckout, rememberGcashCheckout } from '../../lib/paymentCheckout';
import GcashCheckoutHost from './GcashCheckoutHost';

const state = vi.hoisted(() => ({ seekerId: 'seeker', pathname: '/seeker/seek-services', replace: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname, useRouter: () => ({ replace: state.replace }) }));
vi.mock('../../context/AppContext', () => ({ useApp: () => ({
  user: { id: state.seekerId }, isDark: false, services: [{ id: 'service', paymentMethods: { cash: true, gcash: true } }],
}) }));
vi.mock('../../api/bookings.api', () => ({ apiConfirmOnlineBooking: vi.fn(), apiInitiatePayment: vi.fn() }));

const checkout = {
  seekerId: 'seeker', serviceId: 'service', paymentIntentId: 'pi_one', quantity: 3,
  title: 'House cleaning', providerName: 'Ian', expectedAmount: 1500,
  redirectUrl: 'https://test-sources.paymongo.com/sources/source_one',
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  state.seekerId = 'seeker';
  state.pathname = '/seeker/seek-services';
  vi.spyOn(window, 'open').mockReturnValue(null);
  vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'PENDING' } });
});

describe('Workspace GCash dialog', () => {
  it('opens in place with the service, provider and server total, then closes without a floating control', async () => {
    render(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    const dialog = await screen.findByRole('dialog', { name: 'Waiting for payment confirmation' });
    expect(dialog).toHaveTextContent('House cleaning');
    expect(dialog).toHaveTextContent('Ian');
    expect(dialog).toHaveTextContent('₱1,500.00');
    expect(screen.getByRole('link', { name: /Open PayMongo/ })).toHaveAttribute('target', '_blank');
    fireEvent.click(screen.getByRole('button', { name: 'Close for now' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(readGcashCheckout('seeker', 'pi_one')).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Resume/ })).not.toBeInTheDocument();
    act(() => rememberGcashCheckout(checkout));
    await screen.findByRole('dialog', { name: 'Waiting for payment confirmation' });
    expect(apiConfirmOnlineBooking).toHaveBeenCalledTimes(2);
    expect(apiConfirmOnlineBooking).toHaveBeenLastCalledWith({ paymentIntentId: 'pi_one' });
    expect(apiInitiatePayment).not.toHaveBeenCalled();
    expect(state.replace).not.toHaveBeenCalled();
  });

  it('does not show a floating control or reopen a saved checkout after remount', async () => {
    rememberGcashCheckout(checkout);
    render(<GcashCheckoutHost />);
    expect(screen.queryByRole('button', { name: /Resume/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(readGcashCheckout('seeker', 'pi_one')).not.toBeNull();
    expect(apiInitiatePayment).not.toHaveBeenCalled();
  });

  it('does not show the saved payment to another account or over the return page', async () => {
    rememberGcashCheckout(checkout);
    state.seekerId = 'another-seeker';
    const view = render(<GcashCheckoutHost />);
    await act(() => new Promise(resolve => setTimeout(resolve, 10)));
    expect(screen.queryByRole('button', { name: /Resume/ })).not.toBeInTheDocument();
    state.seekerId = 'seeker';
    state.pathname = '/seeker/payment-return';
    view.rerender(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(apiConfirmOnlineBooking).not.toHaveBeenCalled();
  });

  it('retries a failed payment in the same dialog and preserves the metered quantity', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValueOnce({ success: true, data: { status: 'FAILED' } });
    vi.mocked(apiInitiatePayment).mockResolvedValue({ success: true, data: {
      paymentIntentId: 'pi_new', redirectUrl: 'https://test-sources.paymongo.com/sources/new', expectedAmount: 1500,
    } });
    render(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    fireEvent.click(await screen.findByRole('button', { name: 'Try GCash Again' }));
    await screen.findByRole('dialog', { name: 'Waiting for payment confirmation' });
    expect(apiInitiatePayment).toHaveBeenCalledWith({ retryPaymentIntentId: 'pi_one', serviceId: 'service', offerId: undefined, quantity: 3, paymentMethodType: 'gcash' });
    expect(apiConfirmOnlineBooking).toHaveBeenLastCalledWith({ paymentIntentId: 'pi_new' });
    expect(screen.getByRole('link', { name: /Open PayMongo/ })).toHaveAttribute('href', 'https://test-sources.paymongo.com/sources/new');
    expect(state.replace).not.toHaveBeenCalled();
  });

  it('shows the success action only after backend verification and clears the saved attempt', async () => {
    render(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    await screen.findByRole('dialog', { name: 'Waiting for payment confirmation' });
    expect(screen.queryByRole('link', { name: /View booking/ })).not.toBeInTheDocument();
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'SUCCEEDED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check payment status' }));
    await screen.findByRole('dialog', { name: 'GCash payment confirmed' });
    expect(screen.getByRole('link', { name: /View booking/ })).toHaveAttribute('href', '/seeker/seeker-activity');
    expect(readGcashCheckout('seeker', 'pi_one')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Close payment status' }));
    expect(screen.queryByRole('button', { name: /Resume/ })).not.toBeInTheDocument();
  });

  it('keeps a payment with an unknown result recoverable and prevents a new-payment retry', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockRejectedValue(new Error('Network unavailable'));
    render(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    await screen.findByRole('dialog', { name: 'Payment status is temporarily unavailable' });
    expect(screen.queryByRole('button', { name: 'Try GCash Again' })).not.toBeInTheDocument();
    expect(readGcashCheckout('seeker', 'pi_one')).not.toBeNull();
    expect(apiInitiatePayment).not.toHaveBeenCalled();
  });

  it('traps keyboard focus and allows Escape to close without cancelling the attempt', async () => {
    render(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    const dialog = await screen.findByRole('dialog', { name: 'Waiting for payment confirmation' });
    const last = screen.getByRole('button', { name: 'Close for now' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Close payment status' })).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Resume/ })).not.toBeInTheDocument();
    expect(readGcashCheckout('seeker', 'pi_one')).not.toBeNull();
  });

  it('does not accept a success-shaped error response as payment confirmation', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: false, data: { status: 'SUCCEEDED' } });
    render(<GcashCheckoutHost />);
    act(() => rememberGcashCheckout(checkout));
    await screen.findByRole('dialog', { name: 'Payment status is temporarily unavailable' });
    expect(screen.queryByRole('link', { name: /View booking/ })).not.toBeInTheDocument();
    expect(readGcashCheckout('seeker', 'pi_one')).not.toBeNull();
  });
});
