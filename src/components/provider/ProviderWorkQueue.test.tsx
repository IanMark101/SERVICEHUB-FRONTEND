import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import ProviderWorkQueue from './ProviderWorkQueue';

const push = vi.fn(), start = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../../context/AppContext', () => ({ useApp: () => ({ isDark: false, providerStartJob: start }) }));
vi.mock('./activity/ProviderWorkloadPanel', () => ({ default: ({ onStart, onOpen, startingBookingId }: { onStart: (id: string) => void; onOpen: (id: string) => void; startingBookingId: string | null }) => <><button onClick={() => onStart('booking')}>Start</button><button onClick={() => onOpen('booking')}>Details</button><span>{startingBookingId || 'idle'}</span></> }));
beforeEach(() => vi.clearAllMocks());
it('delegates starting to the existing booking action, guards repeat clicks and opens Activity details', async () => {
  let finish!: () => void; start.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  render(<ProviderWorkQueue />); fireEvent.click(screen.getByText('Start')); fireEvent.click(screen.getByText('Start'));
  expect(start).toHaveBeenCalledTimes(1); expect(start).toHaveBeenCalledWith('booking');
  fireEvent.click(screen.getByText('Details')); expect(push).toHaveBeenCalledWith('/provider/provider-activity?tab=all&booking=booking');
  finish(); await waitFor(() => expect(screen.getByText('idle')).toBeVisible());
});
