import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { apiGetConversationGroups, apiGetMessages, apiSendMessage } from '../../api/messages.api';
import ProviderMessagesPage from '../../app/provider/messages/page';
import SeekerMessagesPage from '../../app/seeker/messages/page';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../api/messages.api', () => ({
  apiGetConversationGroups: vi.fn(), apiGetConversationGroupForBooking: vi.fn(),
  apiGetMessages: vi.fn(), apiSendMessage: vi.fn(),
}));
const socketHandlers = vi.hoisted(() => new Map<string, (message: unknown) => void>());
vi.mock('../../lib/socket', () => ({
  getSocket: () => ({
    on: (event: string, handler: (message: unknown) => void) => socketHandlers.set(event, handler),
    off: (event: string) => socketHandlers.delete(event),
  }),
  joinBookingRoom: vi.fn(),
}));

function message(id: string, content: string, senderId = 'me') {
  return { id, bookingId: 'booking-1', content, senderId, createdAt: '2026-10-06T00:00:00Z',
    isRead: false, isSystem: false, sender: { id: senderId, name: senderId === 'me' ? 'Me' : 'Neighbor' } };
}

describe('text-only chat in both workspaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketHandlers.clear();
    vi.mocked(useApp).mockReturnValue({ isDark: false, user: { id: 'me' }, syncUnreadMessages: vi.fn() } as unknown as ReturnType<typeof useApp>);
    vi.mocked(apiGetConversationGroups).mockResolvedValue({ success: true, data: [{
      otherPartyId: 'neighbor', otherPartyName: 'Neighbor', unreadCount: 0,
      bookings: [{ bookingId: 'booking-1', title: 'Repair', otherPartyId: 'neighbor',
        otherPartyName: 'Neighbor', otherPartyRole: 'Provider', status: 'ONGOING', unreadCount: 0 }],
    }] });
    vi.mocked(apiGetMessages).mockResolvedValue({ success: true, data: [] });
    vi.mocked(apiSendMessage).mockImplementation(async (_bookingId, content) => ({ success: true, data: message('sent-message', content) }));
  });

  it.each(['seeker', 'provider'])('%s has only a text composer and receives real-time replies without duplicate bubbles', async (role) => {
    const view = render(role === 'provider' ? <ProviderMessagesPage /> : <SeekerMessagesPage />);
    const input = await screen.findByRole('textbox', { name: 'Message' });
    expect(view.container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByTitle('Attach image from device')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('maxlength', '2000');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    fireEvent.change(input, { target: { value: '  Can you come tomorrow?  ' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(apiSendMessage).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    await waitFor(() => expect(apiSendMessage).toHaveBeenCalledWith('booking-1', 'Can you come tomorrow?'));
    expect(await screen.findByText('Can you come tomorrow?')).toBeInTheDocument();
    expect(input).toHaveValue('');

    await act(async () => {
      socketHandlers.get('new_message')?.(message('sent-message', 'Can you come tomorrow?'));
      socketHandlers.get('new_message')?.(message('reply', 'Yes, at 10 AM.', 'neighbor'));
    });
    expect(screen.getAllByText('Can you come tomorrow?')).toHaveLength(1);
    expect(screen.getByText('Yes, at 10 AM.')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Great, see you then.' } });
    vi.mocked(apiSendMessage).mockResolvedValueOnce({ success: true, data: message('second-sent', 'Great, see you then.') });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Great, see you then.')).toBeInTheDocument();
    expect(apiSendMessage).toHaveBeenCalledTimes(2);
  });

  it.each(['seeker', 'provider'])('%s keeps failed text for retry and ignores blank messages', async (role) => {
    render(role === 'provider' ? <ProviderMessagesPage /> : <SeekerMessagesPage />);
    const input = await screen.findByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(apiSendMessage).not.toHaveBeenCalled();
    vi.mocked(apiSendMessage).mockRejectedValueOnce(new Error('Connection lost'));
    fireEvent.change(input, { target: { value: 'Please confirm the time.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(input).toHaveValue('Please confirm the time.'));
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Please confirm the time.')).toBeInTheDocument();
    expect(screen.queryByText('Connection lost')).not.toBeInTheDocument();
  });
});
