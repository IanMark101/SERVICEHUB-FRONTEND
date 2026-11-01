import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SavedListings from './SavedListings';
import { apiGetSavedListings, apiSetListingSaved } from '../../api/savedListings.api';
import { mutationResources } from '../../lib/api/cachePolicy';
import { invalidateApiCache } from '../../lib/api/responseCache';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../../context/AppContext', () => ({ useApp: () => ({ user: { id: 'viewer' }, isDark: false, jobEngagements: [], bids: [] }) }));
vi.mock('../../api/savedListings.api', () => ({ apiGetSavedListings: vi.fn(), apiSetListingSaved: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
const pagination = { page: 1, limit: 12, total: 1, totalPages: 1 };
describe('Saved workspace page', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('opens a saved provider listing through the original service details route and removes it', async () => {
    vi.mocked(apiGetSavedListings).mockResolvedValueOnce({ items: [{ id: 'saved', listingId: 'service', contentType: 'SERVICE_LISTING', savedAt: '', listing: { id: 'service', providerId: 'owner', title: 'Laptop repair', description: 'Repair', price: 500, isAvailable: true, provider: { id: 'owner', name: 'Ian' }, category: { name: 'Computer & Laptop Repair' } } }], pagination }).mockResolvedValue({ items: [], pagination: { ...pagination, total: 0 } });
    vi.mocked(apiSetListingSaved).mockResolvedValue(undefined);
    render(<SavedListings workspace="seeker" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Inspect Laptop repair details' }));
    expect(push).toHaveBeenCalledWith('/seeker/seek-services?serviceId=service');
    fireEvent.click(screen.getByRole('button', { name: 'Remove from Saved' }));
    await waitFor(() => expect(apiSetListingSaved).toHaveBeenCalledWith('SERVICE_LISTING', 'service', false));
    expect(await screen.findByText('No saved listings yet')).toBeVisible();
  });
  it('opens a saved customer request through the original provider details route', async () => {
    vi.mocked(apiGetSavedListings).mockResolvedValue({ items: [{ id: 'saved', listingId: 'request', contentType: 'SERVICE_REQUEST', savedAt: '', listing: { id: 'request', seekerId: 'owner', title: 'Laptop will not start', description: 'Repair', status: 'OPEN', urgency: 'This Week', budgetMax: 500, seeker: { id: 'owner', name: 'John' }, category: { name: 'Computer & Laptop Repair' } } }], pagination });
    render(<SavedListings workspace="provider" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Inspect Laptop will not start details' }));
    expect(apiGetSavedListings).toHaveBeenCalledWith('SERVICE_REQUEST', 1);
    expect(push).toHaveBeenCalledWith('/provider/browse-services?request=request');
  });
  it('shows unavailable listings without content and leaves them removable', async () => {
    vi.mocked(apiGetSavedListings).mockResolvedValue({ items: [{ id: 'saved', listingId: 'request', contentType: 'SERVICE_REQUEST', savedAt: '', listing: null }], pagination });
    render(<SavedListings workspace="provider" />);
    expect(await screen.findByText('Listing unavailable')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Remove from Saved' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Report listing' })).not.toBeInTheDocument();
  });
  it('refreshes hidden saved requests when Provider enrollment finishes on the same page', async () => {
    vi.mocked(apiGetSavedListings)
      .mockResolvedValueOnce({ items: [{ id: 'saved', listingId: 'request', contentType: 'SERVICE_REQUEST', savedAt: '', listing: null }], pagination })
      .mockResolvedValue({ items: [{ id: 'saved', listingId: 'request', contentType: 'SERVICE_REQUEST', savedAt: '', listing: { id: 'request', seekerId: 'owner', title: 'Laptop will not start', description: 'Repair', status: 'OPEN', urgency: 'This Week', budgetMax: 500, seeker: { id: 'owner', name: 'John' }, category: { name: 'Computer & Laptop Repair' } } }], pagination });
    render(<SavedListings workspace="provider" />);
    expect(await screen.findByText('Listing unavailable')).toBeVisible();
    act(() => { invalidateApiCache(mutationResources('/provider/subscription/start-free'), 'mutation'); });
    expect(await screen.findByRole('button', { name: 'Inspect Laptop will not start details' })).toBeVisible();
    expect(screen.queryByText('Listing unavailable')).not.toBeInTheDocument();
  });
  it('shows an error instead of an empty state when the API fails', async () => {
    vi.mocked(apiGetSavedListings).mockRejectedValue(new Error('Network unavailable'));
    render(<SavedListings workspace="seeker" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable');
    expect(screen.queryByText('No saved listings yet')).not.toBeInTheDocument();
  });
});
