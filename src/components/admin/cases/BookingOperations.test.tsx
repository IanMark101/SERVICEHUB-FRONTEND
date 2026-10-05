import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import BookingOperations from './BookingOperations';
import { apiCancelAdminBooking, apiListAdminBookings, apiListAdminPaymentAttempts, apiListPaymentReconciliation } from '@/api/admin.api';
vi.mock('@/api/admin.api', () => ({ apiCancelAdminBooking: vi.fn(), apiGetAdminBookingMessages: vi.fn(), apiListAdminBookings: vi.fn(), apiListAdminPaymentAttempts: vi.fn(), apiListPaymentReconciliation: vi.fn(), apiResolveBannedParticipantBooking: vi.fn(), apiRetryPaymentReconciliation: vi.fn() }));
vi.mock('@/components/ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/context/AppContext', () => ({ useApp: () => ({ isDark: false }) }));
vi.mock('@/lib/socket', () => ({ getSocket: () => null }));
const booking = { id:'qa-booking',status:'ACCEPTED',paymentStatus:'PAID_HELD',paymentMethod:'GCash',agreedAmount:500,started:false,seeker:{id:'seeker',name:'Mara Cabahug',moderationStatus:'ACTIVE'},provider:{id:'provider',name:'Rafael Abellana',moderationStatus:'ACTIVE'},service:{title:'Phone repair'} };
const pagination = {total:1,totalPages:1};
beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiListAdminBookings).mockResolvedValue({data:[booking],pagination}); vi.mocked(apiListAdminPaymentAttempts).mockResolvedValue({data:[],pagination:{total:0,totalPages:1}}); vi.mocked(apiListPaymentReconciliation).mockResolvedValue({data:[],pagination:{total:0,totalPages:1}}); });
it('preserves the audited unstarted cancellation path and requires a reason', async () => {
  vi.mocked(apiCancelAdminBooking).mockResolvedValue({});
  render(<BookingOperations />); fireEvent.click(await screen.findByRole('button',{name:'Cancel booking'}));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
  const confirm = screen.getAllByRole('button',{name:'Cancel booking'}).find(button => dialog.contains(button))!;
  expect(confirm).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox',{name:'Reason'}),{target:{value:'The parties agreed that work cannot start.'}});
  fireEvent.click(confirm);
  await waitFor(() => expect(apiCancelAdminBooking).toHaveBeenCalledWith('qa-booking','The parties agreed that work cannot start.'));
});
it('never offers unilateral completion for a banned participant’s cash booking', async () => {
  vi.mocked(apiListAdminBookings).mockResolvedValue({data:[{...booking,status:'AWAITING_CONFIRMATION',started:true,paymentMethod:'On-site Cash',paymentStatus:'UNPAID',seeker:{...booking.seeker,moderationStatus:'BANNED'}}],pagination});
  render(<BookingOperations userId="seeker" />);
  await screen.findByRole('button',{name:'Cancel / refund'});
  expect(screen.queryByRole('button',{name:'Complete booking'})).not.toBeInTheDocument();
  expect(apiListAdminBookings).toHaveBeenCalledWith(expect.objectContaining({userId:'seeker',needsResolution:true}));
});
it('isolates payment-load errors and allows switching to booking history', async () => {
  vi.mocked(apiListAdminPaymentAttempts).mockRejectedValue(new Error('offline'));
  render(<BookingOperations />);
  await screen.findByRole('button',{name:'Review messages'});
  fireEvent.click(screen.getByRole('checkbox',{name:'Only active or unsettled bookings'}));
  await waitFor(() => expect(apiListAdminBookings).toHaveBeenLastCalledWith(expect.objectContaining({needsResolution:false,page:1})));
  expect(screen.getByRole('button',{name:'Review messages'})).toBeInTheDocument();
});
