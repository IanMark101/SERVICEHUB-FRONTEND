import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { apiGetAdminBookingMessages } from '@/api/admin.api';
import BookingConversation from './BookingConversation';
vi.mock('@/api/admin.api', () => ({ apiGetAdminBookingMessages: vi.fn() }));
const message = (id: string, content = id) => ({ id, content, senderId: 'seeker', sender: { name: 'Mara' }, isSystem: false, createdAt: '2026-10-14T01:00:00Z' });
beforeEach(() => vi.resetAllMocks());

it('loads older messages without duplication, keeps chronology, and identifies each participant', async () => {
  vi.mocked(apiGetAdminBookingMessages).mockResolvedValueOnce({ data: { messages: [message('new')], messageCount: 3, seeker: { id: 'seeker', name: 'Mara' }, pagination: { hasMore: true, nextBefore: 'new' } } }).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: { messages: [message('old'), message('new')], messageCount: 3, seeker: { id: 'seeker', name: 'Mara' }, pagination: { hasMore: false, nextBefore: null } } });
  render(<BookingConversation bookingId="booking" />);
  await screen.findByText('Customer');
  fireEvent.click(screen.getByRole('button', { name: 'Load older messages' }));
  await screen.findByRole('alert');
  expect(screen.getByText('new')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry messages' }));
  await screen.findByText('old');
  expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual([expect.stringContaining('old'), expect.stringContaining('new')]);
  expect(apiGetAdminBookingMessages).toHaveBeenLastCalledWith('booking', { before: 'new' });
  expect(screen.queryByRole('button', { name: 'Load older messages' })).not.toBeInTheDocument();
});
it('a delayed response for another booking cannot overwrite the selected conversation', async () => {
  let first!: (value: unknown) => void;
  vi.mocked(apiGetAdminBookingMessages).mockImplementationOnce(() => new Promise(resolve => { first = resolve; })).mockResolvedValueOnce({ data: { messages: [message('second', 'Second booking only')] } });
  const { rerender } = render(<BookingConversation key="first" bookingId="first" />);
  await waitFor(() => expect(apiGetAdminBookingMessages).toHaveBeenCalledWith('first'));
  rerender(<BookingConversation key="second" bookingId="second" />);
  await screen.findByText('Second booking only');
  await act(async () => { first({ data: { messages: [message('first', 'Wrong booking evidence')] } }); });
  expect(screen.queryByText('Wrong booking evidence')).not.toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Booking conversation' })).toHaveTextContent('Second booking only');
});
