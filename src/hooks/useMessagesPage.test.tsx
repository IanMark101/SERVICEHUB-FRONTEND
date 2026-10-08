import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { apiGetConversationGroups, apiGetConversationGroupForBooking, apiGetMessages } from '../api/messages.api';
import { useApp } from '../context/AppContext';
import { useMessagesPage } from './useMessagesPage';
import { BookingThreads, PeopleInbox } from '../components/messages/ConversationNavigation';
import { invalidateApiCache } from '../lib/api/responseCache';

vi.mock('next/navigation', () => ({ useSearchParams: vi.fn() }));
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../api/messages.api', () => ({
  apiGetConversationGroups: vi.fn().mockResolvedValue({ success: true, data: [] }),
  apiGetConversationGroupForBooking: vi.fn(),
  apiGetMessages: vi.fn(), apiSendMessage: vi.fn(),
}));
const socketHandlers = vi.hoisted(() => new Map<string, (message: unknown) => void>());
vi.mock('../lib/socket', () => ({
  getSocket: () => ({
    on: (event: string, handler: (message: unknown) => void) => socketHandlers.set(event, handler),
    off: (event: string) => socketHandlers.delete(event),
  }),
  joinBookingRoom: vi.fn(),
}));

function MessagePane() {
  const { bottomRef, messageScrollRef, handleMessageScroll, messages } = useMessagesPage();
  return (
    <div data-testid="message-pane" ref={messageScrollRef} onScroll={handleMessageScroll}>
      <span data-testid="message-count">{messages.length}</span>
      <div ref={bottomRef} />
    </div>
  );
}

function NavigationPane() {
  const state = useMessagesPage();
  return <>
    <PeopleInbox state={state} accent="orange" />
    <BookingThreads state={state} accent="orange" />
    <span data-testid="selected-booking">{state.selectedConv?.bookingId}</span>
    <span data-testid="read-only">{String(state.isReadOnly)}</span>
  </>;
}

describe('message pane scrolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
    vi.mocked(useApp).mockReturnValue({ isDark: false, user: { id: 'johncarlo' }, syncUnreadMessages: vi.fn() } as unknown as ReturnType<typeof useApp>);
    vi.mocked(apiGetConversationGroups).mockResolvedValue({ success: true, data: [] } as Awaited<ReturnType<typeof apiGetConversationGroups>>);
  });

  it('does not scroll the outer page when the message pane initializes', async () => {
    render(<MessagePane />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });

    expect(screen.getByTestId('message-pane')).toBeInTheDocument();
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('coalesces a booking system-message burst into one inbox read', async () => {
    render(<MessagePane />);
    await waitFor(() => expect(apiGetConversationGroups).toHaveBeenCalledTimes(1));
    vi.mocked(apiGetConversationGroups).mockClear();
    const unread = vi.mocked(useApp).mock.results[0].value.syncUnreadMessages;
    act(() => {
      // The shared socket catch-all invalidates before feature listeners run.
      for (const event of ['new_message', 'message_notification']) {
        invalidateApiCache(['messages', 'notifications'], 'socket');
        socketHandlers.get(event)?.({ id: 'system', bookingId: 'booking', isSystem: true, content: 'Booking cancelled.' });
      }
    });
    expect(apiGetConversationGroups).not.toHaveBeenCalled();
    await waitFor(() => expect(apiGetConversationGroups).toHaveBeenCalledTimes(1));
    expect(unread).not.toHaveBeenCalled();
  });

  it('leaves older messages in view when a new message arrives', async () => {
    vi.mocked(apiGetConversationGroups).mockResolvedValue({ success: true, data: [{
      otherPartyId: 'ian', otherPartyName: 'Ian', unreadCount: 0,
      bookings: [{ bookingId: 'booking-1', title: 'House Cleaning', otherPartyId: 'ian',
        otherPartyName: 'Ian', otherPartyRole: 'Provider', status: 'IN_PROGRESS', unreadCount: 0 }],
    }] } as Awaited<ReturnType<typeof apiGetConversationGroups>>);
    vi.mocked(apiGetMessages).mockResolvedValue({ success: true, data: [] } as Awaited<ReturnType<typeof apiGetMessages>>);
    render(<MessagePane />);
    await waitFor(() => expect(socketHandlers.has('new_message')).toBe(true));
    await waitFor(() => expect(apiGetMessages).toHaveBeenCalledWith('booking-1'));

    const pane = screen.getByTestId('message-pane');
    Object.defineProperty(pane, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(pane, 'clientHeight', { configurable: true, value: 200 });
    pane.scrollTop = 200;
    fireEvent.scroll(pane);

    await act(async () => {
      socketHandlers.get('new_message')?.({
        id: 'message-1', bookingId: 'booking-1', senderId: 'ian', content: 'Update',
        createdAt: '2026-09-27T00:00:00.000Z', isRead: false, isSystem: false,
        sender: { id: 'ian', name: 'Ian' },
      });
    });

    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    expect(pane.scrollTop).toBe(200);
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('keeps the message pane at the bottom when the reader is already there', async () => {
    vi.mocked(apiGetConversationGroups).mockResolvedValue({ success: true, data: [{
      otherPartyId: 'ian', otherPartyName: 'Ian', unreadCount: 0,
      bookings: [{ bookingId: 'booking-1', title: 'House Cleaning', otherPartyId: 'ian',
        otherPartyName: 'Ian', otherPartyRole: 'Provider', status: 'IN_PROGRESS', unreadCount: 0 }],
    }] } as Awaited<ReturnType<typeof apiGetConversationGroups>>);
    vi.mocked(apiGetMessages).mockResolvedValue({ success: true, data: [] } as Awaited<ReturnType<typeof apiGetMessages>>);
    render(<MessagePane />);
    await waitFor(() => expect(apiGetMessages).toHaveBeenCalledWith('booking-1'));

    const pane = screen.getByTestId('message-pane');
    Object.defineProperty(pane, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(pane, 'clientHeight', { configurable: true, value: 200 });
    pane.scrollTop = 800;
    fireEvent.scroll(pane);
    pane.scrollTop = 800;

    await act(async () => {
      socketHandlers.get('new_message')?.({
        id: 'message-2', bookingId: 'booking-1', senderId: 'ian', content: 'Update',
        createdAt: '2026-09-27T00:00:00.000Z', isRead: false, isSystem: false,
        sender: { id: 'ian', name: 'Ian' },
      });
    });

    expect(pane.scrollTop).toBe(1000);
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('shows one person with separate active and past booking threads', async () => {
    vi.mocked(apiGetConversationGroups).mockResolvedValue({ success: true, data: [{
      otherPartyId: 'ian', otherPartyName: 'Ian', unreadCount: 1,
      bookings: [
        { bookingId: 'closed-job', title: 'Old repair', otherPartyId: 'ian', otherPartyName: 'Ian', otherPartyRole: 'Provider', status: 'COMPLETED', unreadCount: 0 },
        { bookingId: 'active-job', title: 'Current repair', otherPartyId: 'ian', otherPartyName: 'Ian', otherPartyRole: 'Provider', status: 'WAITING', unreadCount: 1 },
      ],
    }] } as Awaited<ReturnType<typeof apiGetConversationGroups>>);
    vi.mocked(apiGetMessages).mockResolvedValue({ success: true, data: [] } as Awaited<ReturnType<typeof apiGetMessages>>);

    render(<NavigationPane />);
    await waitFor(() => expect(screen.getByTestId('selected-booking')).toHaveTextContent('active-job'));
    expect(within(screen.getByRole('complementary', { name: 'People in your inbox' })).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByTestId('read-only')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Past jobs (1)'));
    fireEvent.click(screen.getByRole('button', { name: 'Old repair' }));
    await waitFor(() => expect(screen.getByTestId('selected-booking')).toHaveTextContent('closed-job'));
    expect(screen.getByTestId('read-only')).toHaveTextContent('true');
  });

  it('opens a linked booking even when its person is outside the current page', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('booking=linked-job') as ReturnType<typeof useSearchParams>);
    vi.mocked(apiGetConversationGroupForBooking).mockResolvedValue({ success: true, data: {
      otherPartyId: 'ian', otherPartyName: 'Ian', unreadCount: 0,
      bookings: [{ bookingId: 'linked-job', title: 'Linked repair', otherPartyId: 'ian',
        otherPartyName: 'Ian', otherPartyRole: 'Provider', status: 'WAITING', unreadCount: 0 }],
    } } as Awaited<ReturnType<typeof apiGetConversationGroupForBooking>>);
    vi.mocked(apiGetMessages).mockResolvedValue({ success: true, data: [] } as Awaited<ReturnType<typeof apiGetMessages>>);

    render(<NavigationPane />);
    await waitFor(() => expect(apiGetConversationGroupForBooking).toHaveBeenCalledWith('linked-job'));
    await waitFor(() => expect(screen.getByTestId('selected-booking')).toHaveTextContent('linked-job'));
    expect(screen.getByRole('complementary', { name: 'People in your inbox' })).toHaveTextContent('Ian');
  });
});
