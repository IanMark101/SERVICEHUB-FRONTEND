import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { apiGetMyServices } from '../../api/services.api';
import BrowseJobs from './BrowseJobs';

const push = vi.fn();
const submitBid = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('../../api/services.api', () => ({ apiGetMyServices: vi.fn() }));
vi.mock('../../api/ai.api', () => ({
  getCachedSeekerSummary: () => undefined,
  apiGetSeekerSummary: vi.fn().mockResolvedValue({ success: true, data: { summary: null, source: 'empty' } }),
}));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ warning: vi.fn() }) }));
vi.mock('../landing/LimitedModeDashboardCard', () => ({ default: () => null }));
vi.mock('../moderation/ContentCaseAction', () => ({ default: () => null }));

const request = {
  id: 'request-id', seekerId: 'seeker-id', seekerName: 'Client', seekerAvatar: '',
  title: 'Fix a leaking pipe', category: 'Plumbing', urgency: 'Needs Tomorrow', budget: 350,
  description: 'A pipe is leaking in the kitchen.', status: 'OPEN', createdAt: new Date().toISOString(), offersCount: 0,
};
const listing = {
  id: 'listing-id', providerId: 'provider-id', title: 'Pipe repair', description: 'Repair leaking pipes.',
  category: { name: 'Plumbing' }, status: 'ACTIVE', isAvailable: true, price: 500,
};

describe('Browse Jobs offer eligibility', () => {
  it('opens the request author’s seeker reviews directly while the author link opens their overview', async () => {
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'View service seeker reviews for Client' }));
    expect(push).toHaveBeenLastCalledWith('/profile/seeker-id?tab=reviews&reviewRole=seeker');
    fireEvent.click(screen.getByRole('button', { name: "View Client's profile" }));
    expect(push).toHaveBeenLastCalledWith('/profile/seeker-id');
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      user: { id: 'provider-id' }, isDark: false, jobRequests: [request], bids: [], submitBid,
    } as unknown as ReturnType<typeof useApp>);
    vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: true } as ReturnType<typeof useTransactionPermission>);
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [] });
  });

  it('lets a provider with zero listings send an offer', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [] });
    submitBid.mockResolvedValue(true);
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    expect(screen.getByLabelText('Service listing (optional)')).toHaveValue('');
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), { target: { value: 'I can repair the pipe tomorrow.' } });
    fireEvent.submit(screen.getAllByRole('button', { name: 'Send Offer' }).at(-1)!.closest('form')!);
    await waitFor(() => expect(submitBid).toHaveBeenCalledWith('request-id', 'provider-id', undefined, 350, 60, 'I can repair the pipe tomorrow.', undefined));
  });

  it('does not require a paused listing to respond', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [{ ...listing, isAvailable: false }] });
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    expect(screen.getByLabelText('Service listing (optional)')).toHaveValue('');
    expect(screen.queryByText(/active Plumbing listing is needed/)).not.toBeInTheDocument();
  });

  it('does not offer a second submission when an earlier offer was accepted', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [] });
    vi.mocked(useApp).mockReturnValue({
      user: { id: 'provider-id' }, isDark: false, jobRequests: [request],
      bids: [{ id: 'accepted-offer', requestId: request.id, providerId: 'provider-id', status: 'accepted' }],
      submitBid,
    } as unknown as ReturnType<typeof useApp>);
    render(<BrowseJobs />);
    expect(await screen.findByText('Offer accepted')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
  });

  it('links an eligible service to the offer and closes only after success', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [listing] });
    submitBid.mockResolvedValue(true);
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Pipe repair' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Service listing (optional)'), { target: { value: 'listing-id' } });
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), { target: { value: 'I can repair the pipe tomorrow.' } });
    fireEvent.submit(screen.getAllByRole('button', { name: 'Send Offer' }).at(-1)!.closest('form')!);
    await waitFor(() => expect(submitBid).toHaveBeenCalledWith('request-id', 'provider-id', 'listing-id', 500, 60, 'I can repair the pipe tomorrow.', undefined));
    await waitFor(() => expect(screen.queryByLabelText('Service listing (optional)')).not.toBeInTheDocument());
  });

  it('keeps the drafted offer open when the server rejects submission', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [listing] });
    submitBid.mockResolvedValue(false);
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), { target: { value: 'I can repair the pipe tomorrow.' } });
    fireEvent.submit(screen.getAllByRole('button', { name: 'Send Offer' }).at(-1)!.closest('form')!);
    await waitFor(() => expect(submitBid).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Describe your approach and availability')).toHaveValue('I can repair the pipe tomorrow.');
  });

  it('lets the provider choose which active category listing backs the offer', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [listing, { ...listing, id: 'second-listing-id', title: 'Emergency pipe repair' }] });
    submitBid.mockResolvedValue(true);
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Emergency pipe repair' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Service listing (optional)'), { target: { value: 'second-listing-id' } });
    fireEvent.change(screen.getByLabelText('Expected duration (minutes)'), { target: { value: '90' } });
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), { target: { value: 'I can repair the pipe tomorrow.' } });
    fireEvent.submit(screen.getAllByRole('button', { name: 'Send Offer' }).at(-1)!.closest('form')!);
    await waitFor(() => expect(submitBid).toHaveBeenCalledWith('request-id', 'provider-id', 'second-listing-id', 500, 90, 'I can repair the pipe tomorrow.', undefined));
  });

  it('keeps offer creation available when listings cannot be loaded', async () => {
    vi.mocked(apiGetMyServices).mockRejectedValue(new Error('Network unavailable'));
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    expect(screen.getByLabelText('Service listing (optional)')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /Create listing/ })).not.toBeInTheDocument();
  });

  it('sends a public request with obsolete provider metadata and custom availability', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [] });
    vi.mocked(useApp).mockReturnValue({ user: { id: 'provider-id' }, isDark: false, jobRequests: [{ ...request, targetProviderId: 'provider-id', targetServiceId: null }], bids: [], submitBid } as unknown as ReturnType<typeof useApp>);
    submitBid.mockResolvedValue(true);
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    fireEvent.change(screen.getByLabelText('Availability (optional)'), { target: { value: 'Saturday morning' } });
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), { target: { value: 'Repair the door.' } });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    await waitFor(() => expect(submitBid).toHaveBeenCalledWith('request-id', 'provider-id', undefined, 350, 60, 'Repair the door.', 'Saturday morning'));
  });

  it.each(['provider-id', 'another-provider-id', 'seeker-id'])('shows the same public job to %s despite obsolete targeting', async (viewerId) => {
    vi.mocked(useApp).mockReturnValue({
      user: { id: viewerId }, isDark: false,
      jobRequests: [{ ...request, targetProviderId: 'provider-id', targetServiceId: null }],
      bids: [], submitBid,
    } as unknown as ReturnType<typeof useApp>);
    render(<BrowseJobs />);
    expect(await screen.findByText(request.title)).toBeInTheDocument();
    if (viewerId === request.seekerId) {
      expect(screen.getByText('Your own request · cannot send an offer')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('button', { name: 'Send Offer' })).toBeInTheDocument();
    }
  });

  it.each(['provider-id', 'another-provider-id', 'seeker-id'])('limits a real listing inquiry to its participants for %s', async (viewerId) => {
    vi.mocked(useApp).mockReturnValue({
      user: { id: viewerId }, isDark: false,
      jobRequests: [{ ...request, targetProviderId: 'provider-id', targetServiceId: 'listing-id' }],
      bids: [], submitBid,
    } as unknown as ReturnType<typeof useApp>);
    render(<BrowseJobs />);
    if (viewerId === 'another-provider-id') {
      await screen.findByRole('heading', { name: 'No Open Job Requests' });
      expect(screen.queryByText(request.title)).not.toBeInTheDocument();
    } else {
      expect(await screen.findByText(request.title)).toBeInTheDocument();
      if (viewerId === request.seekerId) expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
    }
  });

  it('keeps the dialog busy, prevents duplicate clicks, and restores the draft after failure', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [] });
    let resolve!: (sent: boolean) => void;
    submitBid.mockImplementation(() => new Promise(done => { resolve = done; }));
    render(<BrowseJobs />);
    fireEvent.click(await screen.findByRole('button', { name: 'Send Offer' }));
    const form = screen.getByRole('dialog').querySelector('form')!;
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), { target: { value: 'Repair the door.' } });
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(submitBid).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Sending offer…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close offer form' })).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    resolve(false);
    await waitFor(() => expect(form).toHaveAttribute('aria-busy', 'false'));
    expect(screen.getByPlaceholderText('Describe your approach and availability')).toHaveValue('Repair the door.');
  });

  it('does not show a second submission during a payment hold', async () => {
    vi.mocked(apiGetMyServices).mockResolvedValue({ success: true, data: [] });
    vi.mocked(useApp).mockReturnValue({ user: { id: 'provider-id' }, isDark: false, jobRequests: [request], bids: [{ id: 'held', requestId: request.id, providerId: 'provider-id', status: 'pending_payment' }], submitBid } as unknown as ReturnType<typeof useApp>);
    render(<BrowseJobs />);
    expect(await screen.findByText('Proposal Submitted')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send Offer' })).not.toBeInTheDocument();
  });

});
