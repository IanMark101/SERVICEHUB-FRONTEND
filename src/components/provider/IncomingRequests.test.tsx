import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import IncomingRequests from './IncomingRequests';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: () => ({ canTransact: true }) }));
vi.mock('../landing/LimitedModeDashboardCard', () => ({ default: () => null }));
vi.mock('../ui/TransactionBlockedModal', () => ({ default: () => null }));

describe('provider incoming listing inquiries', () => {
  it('does not show an empty inbox before requests and bookings have loaded', () => {
    vi.mocked(useApp).mockReturnValue({
      jobEngagements: [], bids: [], jobRequests: [], isDark: false,
      requestsStatus: 'loading', engagementsStatus: 'loading', refreshAll: vi.fn(),
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading incoming requests');
    expect(screen.queryByText('No Incoming Requests')).not.toBeInTheDocument();
  });

  it('shows only this provider’s unanswered inquiry with a path to send its quote', () => {
    vi.mocked(useApp).mockReturnValue({
      jobEngagements: [], bids: [], isDark: false,
      jobRequests: [
        { id: 'selected', targetProviderId: 'provider-1', targetServiceId: 'service-1', preferredPaymentMethod: 'GCash', status: 'OPEN', title: 'Repair aircon', seekerName: 'Client', description: 'The aircon needs repair.', budget: 500 },
        { id: 'other', targetProviderId: 'provider-2', targetServiceId: 'service-2', status: 'OPEN', title: 'Other provider job', seekerName: 'Client', description: 'Private details', budget: 500 },
      ],
    } as unknown as ReturnType<typeof useApp>);
    render(<IncomingRequests currentProviderId="provider-1" />);
    expect(screen.getByText('Repair aircon')).toBeInTheDocument();
    expect(screen.getByText('Seeker selected: GCash')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Send quote' })).toHaveAttribute('href', '/provider/browse-services?request=selected');
    expect(screen.queryByText('Other provider job')).not.toBeInTheDocument();
  });
});
