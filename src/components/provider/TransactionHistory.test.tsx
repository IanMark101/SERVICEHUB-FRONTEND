import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import TransactionHistory from './TransactionHistory';

vi.mock('next/navigation', () => ({ useSearchParams: vi.fn() }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));

const transaction = {
  id: 'transaction-1', jobId: 'booking-1', providerId: 'ian', seekerId: 'johncarlo',
  amount: 250, serviceTitle: 'House Cleaning', paymentMethod: 'GCash', createdAt: '2026-09-27T00:00:00.000Z',
};

function setTransactions(transactions: unknown[]) {
  vi.mocked(useApp).mockReturnValue({
    transactions, isDark: false, hasMoreTransactions: false, loadMoreTransactions: vi.fn(),
  } as unknown as ReturnType<typeof useApp>);
}

describe('Provider Transaction History booking link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('booking=booking-1') as ReturnType<typeof useSearchParams>);
    setTransactions([transaction]);
  });

  it('highlights the linked transaction without moving the page on load or refresh', async () => {
    const { rerender } = render(<TransactionHistory currentUserId="ian" />);
    setTransactions([{ ...transaction }]);
    rerender(<TransactionHistory currentUserId="ian" />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 450)); });

    expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
