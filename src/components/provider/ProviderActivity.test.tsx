import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';
import ProviderActivity from './ProviderActivity';
import type { JobEngagement } from '../../types';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('./activity/ProviderActivityList', () => ({ default: ({ model }: { model: { openItemId: string | null; myEngagements: JobEngagement[]; openSafetyReport: (engagement: JobEngagement) => void } }) => <div data-testid="activity-view">{model.openItemId ?? 'overview'}<button type="button" onClick={() => model.openSafetyReport(model.myEngagements[0])}>Safety report</button></div> }));
vi.mock('./activity/ProviderWorkloadPanel', () => ({ default: () => null }));
vi.mock('./activity/ProviderCancellationDeclineModal', () => ({ default: () => null }));
vi.mock('../ui/ReasonModal', () => ({ default: () => null }));
vi.mock('../seeker/ReviewModal', () => ({ default: () => null }));
vi.mock('../ui/ConfirmModal', () => ({ default: () => null }));

const refreshEngagements = vi.fn();
const refreshAll = vi.fn();
const queuedBooking = {
  id: 'johnlyy-booking', providerId: 'ian', seekerId: 'johnlyy', status: 'queued',
  title: 'House Cleaning',
};
const activeBooking = {
  id: 'johncarlo-booking', providerId: 'ian', seekerId: 'johncarlo', status: 'in_progress',
  title: 'House Cleaning', started: true,
};

function setEngagements(jobEngagements: unknown[]) {
  vi.mocked(useApp).mockReturnValue({
    jobEngagements, bids: [], jobRequests: [], services: [], notifications: [],
    user: { id: 'ian' }, isDark: false, refreshEngagements, refreshAll,
  } as unknown as ReturnType<typeof useApp>);
}

describe('Provider Activity deep-link tab selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tab=waiting') as ReturnType<typeof useSearchParams>);
    vi.mocked(useToast).mockReturnValue({ success: vi.fn(), error: vi.fn(), info: vi.fn() } as unknown as ReturnType<typeof useToast>);
    setEngagements([queuedBooking, activeBooking]);
  });

  it('keeps the manually selected In Progress tab after bookings refresh', async () => {
    const { rerender } = render(<ProviderActivity currentProviderId="ian" />);
    const waitingTab = screen.getByRole('tab', { name: /Before Work/ });
    const inProgressTab = screen.getByRole('tab', { name: /Work Underway/ });
    await waitFor(() => expect(waitingTab).toHaveAttribute('aria-selected', 'true'));

    fireEvent.click(inProgressTab);
    expect(inProgressTab).toHaveAttribute('aria-selected', 'true');

    setEngagements([{ ...queuedBooking }, { ...activeBooking }]);
    rerender(<ProviderActivity currentProviderId="ian" />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });

    expect(inProgressTab).toHaveAttribute('aria-selected', 'true');
    expect(waitingTab).toHaveAttribute('aria-selected', 'false');
  });

  it('opens an incoming booking link as a focused workroom after a manual tab choice', async () => {
    const { rerender } = render(<ProviderActivity currentProviderId="ian" />);
    const allTab = screen.getByRole('tab', { name: /^All/ });
    await waitFor(() => expect(screen.getByRole('tab', { name: /Before Work/ })).toHaveAttribute('aria-selected', 'true'));

    fireEvent.click(allTab);
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tab=in_progress&booking=johncarlo-booking') as ReturnType<typeof useSearchParams>);
    rerender(<ProviderActivity currentProviderId="ian" />);

    await waitFor(() => expect(screen.getByTestId('activity-view')).toHaveTextContent('johncarlo-booking'));
    expect(screen.queryByRole('tab', { name: /Work Underway/ })).not.toBeInTheDocument();
  });

  it('does not apply a pending deep-link timer after an immediate manual tab click', async () => {
    render(<ProviderActivity currentProviderId="ian" />);
    const inProgressTab = screen.getByRole('tab', { name: /Work Underway/ });

    fireEvent.click(inProgressTab);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });

    expect(inProgressTab).toHaveAttribute('aria-selected', 'true');
  });

  it('does not scroll the page on a booking-link load or later refresh', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('tab=waiting&booking=johnlyy-booking') as ReturnType<typeof useSearchParams>);
    const { rerender } = render(<ProviderActivity currentProviderId="ian" />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 350)); });
    setEngagements([{ ...queuedBooking }, { ...activeBooking }]);
    rerender(<ProviderActivity currentProviderId="ian" />);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 350)); });

    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('updates an open report dialog when the current booking becomes ineligible', () => {
    setEngagements([{ ...queuedBooking, bookingStatus: 'ACCEPTED' }]);
    const view = render(<ProviderActivity currentProviderId="ian" />);
    fireEvent.click(screen.getByRole('button', { name: 'Safety report' }));
    fireEvent.change(screen.getByRole('textbox', { name: /What happened/ }), { target: { value: 'A detailed safety concern.' } });
    expect(screen.getByRole('button', { name: 'Submit private report' })).toBeEnabled();
    setEngagements([{ ...queuedBooking, status: 'canceled', bookingStatus: 'REMOVED' }]);
    view.rerender(<ProviderActivity currentProviderId="ian" />);
    expect(screen.getByRole('button', { name: 'Submit private report' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/removed bookings/);
  });
});
