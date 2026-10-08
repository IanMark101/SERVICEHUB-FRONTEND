import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiConfirmOnlineBooking, apiInitiatePayment } from '../../api/bookings.api';
import { readGcashCheckout, rememberGcashCheckout } from '../../lib/paymentCheckout';
import PaymentReturn from './PaymentReturn';
import { invalidateApiCache } from '../../lib/api/responseCache';

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({ user: { id: 'seeker-one' }, services: [{ id: 'service-one', paymentMethods: { cash: true, gcash: true } }] }),
}));
vi.mock('../../api/bookings.api', () => ({ apiConfirmOnlineBooking: vi.fn(), apiInitiatePayment: vi.fn() }));

const oldCheckout = {
  seekerId: 'seeker-one', serviceId: 'service-one', paymentIntentId: 'pi_old',
  redirectUrl: 'https://test-sources.paymongo.com/sources/src_expired',
};

describe('GCash payment return and recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockReturnValue(null);
    rememberGcashCheckout(oldCheckout);
  });

  it('shows a verified failure, no booking claim, and both supported recovery choices', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'FAILED' } });
    const view = render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: 'GCash payment was not completed' });
    expect(apiConfirmOnlineBooking).toHaveBeenCalledWith({ paymentIntentId: 'pi_old' });
    expect(screen.getByText('No booking was created and no payment was recorded as successful.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Try GCash Again' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Choose On-site Cash' })).toHaveAttribute('href', '/seeker/seek-services?serviceId=service-one');
    expect(screen.queryByRole('link', { name: /Open PayMongo/ })).not.toBeInTheDocument();
    expect(view.container).not.toHaveTextContent('src_expired');
  });

  it('keeps ServiceHub available during PayMongo checkout and verifies before claiming success', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'PENDING' } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    const payLink = await screen.findByRole('link', { name: /Open PayMongo Test Mode/ });
    expect(payLink).toHaveAttribute('target', '_blank');
    expect(payLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/No booking or queue position exists until ServiceHub verifies/)).toBeInTheDocument();
    expect(screen.getByText(/Payment status updates automatically/)).toBeInTheDocument();
  });

  it('starts a fresh GCash attempt after failure rather than reusing the expired redirect', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'FAILED' } });
    vi.mocked(apiInitiatePayment).mockResolvedValue({ success: true, data: {
      paymentIntentId: 'pi_fresh', redirectUrl: 'https://test-sources.paymongo.com/sources/src_fresh',
    } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Try GCash Again' }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/seeker/payment-return?payment_intent_id=pi_fresh'));
    expect(apiInitiatePayment).toHaveBeenCalledWith({ serviceId: 'service-one', offerId: undefined, paymentMethodType: 'gcash' });
    expect(readGcashCheckout('seeker-one', 'pi_fresh')?.redirectUrl).toContain('src_fresh');
    expect(readGcashCheckout('seeker-one', 'pi_old')).toBeNull();
  });

  it('shows Activity only after server confirmation and clears the pending checkout', async () => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status: 'SUCCEEDED' } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('heading', { name: 'GCash payment confirmed' });
    expect(screen.getByText(/ServiceHub verified the payment/)).toBeInTheDocument();
    expect(screen.queryByText(/An unsuccessful attempt cannot be reused/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View booking in Activity' })).toHaveAttribute('href', '/seeker/seeker-activity');
    expect(screen.queryByRole('button', { name: 'Try GCash Again' })).not.toBeInTheDocument();
    expect(readGcashCheckout('seeker-one', 'pi_old')).toBeNull();
  });

  it.each(['SUCCEEDED', 'PENDING'])('rechecks promptly after a live booking event and trusts only the server %s result', async status => {
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValueOnce({ success: true, data: { status: 'PENDING' } });
    vi.mocked(apiConfirmOnlineBooking).mockResolvedValue({ success: true, data: { status } });
    render(<PaymentReturn paymentIntentId="pi_old" />);
    await screen.findByRole('link', { name: /Open PayMongo Test Mode/ });
    act(() => {
      invalidateApiCache(['bookings'], 'socket');
      invalidateApiCache(['bookings'], 'socket');
    });
    await waitFor(() => expect(apiConfirmOnlineBooking).toHaveBeenCalledTimes(2));
    if (status === 'SUCCEEDED') await screen.findByRole('heading', { name: 'GCash payment confirmed' });
    else expect(screen.queryByRole('heading', { name: 'GCash payment confirmed' })).not.toBeInTheDocument();
  });
});
