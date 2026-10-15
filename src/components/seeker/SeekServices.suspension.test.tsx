import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api/axios';
import { apiGetProviderSummary } from '../../api/ai.api';
import SeekServices from './SeekServices';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../lib/api/axios', () => ({ api: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../api/ai.api', () => ({ apiGetProviderSummary: vi.fn().mockResolvedValue({ success: true, data: {} }) }));
vi.mock('../../lib/socket', () => ({ joinServiceRoom: vi.fn() }));
vi.mock('../../api/savedListings.api', () => ({ apiGetSavedStatus: vi.fn().mockResolvedValue([]), apiSetListingSaved: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));
vi.mock('../moderation/ContentCaseAction', () => ({ default: () => null }));
// Keep the real page, permission hook, listing card and blocked dialog. The
// request form is a sentinel: restricted clicks must never mount it.
vi.mock('./RequestServiceModal', () => ({ default: () => <div role="dialog" aria-label="Service request form">Request form opened</div> }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));

const listing = {
  id: 'agreement-service', providerId: 'provider', provider: { id: 'provider', name: 'Provider fixture', verificationStatus: 'APPROVED', trustScore: 55 },
  title: 'Laptop repair', description: 'Repair a laptop with a faulty fan.', category: { name: 'Computer & Laptop Repair' },
  priceType: 'BY_AGREEMENT', price: null, isAvailable: true, status: 'ACTIVE', paymentMethods: { cash: true, gcash: false },
  locationLabel: 'Cordova, Cebu', serviceLocationMode: 'PROVIDER_VISITS', estimatedDurationMins: 60, distanceKm: 1, photos: [],
};

function account(moderationStatus = 'SUSPENDED') {
  vi.mocked(useApp).mockReturnValue({ user: { id: 'member', role: 'seeker', isActive: true, emailVerified: true, verificationStatus: 'APPROVED', moderationStatus }, services: [], users: [], jobRequests: [], jobEngagements: [], bids: [], isDark: false, dbCategories: [{ id: 'category', name: 'Computer & Laptop Repair' }] } as unknown as ReturnType<typeof useApp>);
}

beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); window.history.replaceState({}, '', '/');
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  localStorage.setItem('servicehub:marketplace-location:member:seeker', JSON.stringify({ point: { latitude: 10.3, longitude: 123.9, label: 'Cordova, Cebu' }, radiusKm: 5 }));
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: { items: [listing], mapPins: [], pagination: { page: 1, limit: 6, total: 1, totalPages: 1 } } } });
  account();
});

describe('Request service suspension gate', () => {
  it.each(['card', 'details'] as const)('immediately blocks a suspended approved member from the %s button before opening or submitting a request', async entry => {
    render(<SeekServices />);
    await screen.findByRole('button', { name: 'Request service' });
    if (entry === 'details') {
      fireEvent.click(screen.getByRole('button', { name: 'Inspect Laptop repair details' }));
      const details = screen.getByRole('dialog');
      expect(within(details).getByText('About this service', { exact: false })).toBeInTheDocument();
      fireEvent.click(within(details).getByRole('button', { name: 'Request service' }));
    } else fireEvent.click(screen.getByRole('button', { name: 'Request service' }));
    expect(screen.getByRole('dialog', { name: 'Account suspended' })).toBeVisible();
    expect(screen.queryByRole('dialog', { name: 'Service request form' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Verify Now' })).not.toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
    expect(apiGetProviderSummary).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue browsing' }));
    expect(screen.queryByRole('dialog', { name: 'Account suspended' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request service' })).toBeVisible();
  });

  it('keeps Request service available to an active approved member', async () => {
    account('ACTIVE');
    render(<SeekServices />);
    fireEvent.click(await screen.findByRole('button', { name: 'Request service' }));
    expect(screen.getByRole('dialog', { name: 'Service request form' })).toBeVisible();
    expect(screen.queryByRole('dialog', { name: 'Account suspended' })).not.toBeInTheDocument();
  });

  it('blocks the next click when a currently browsing member becomes suspended', async () => {
    account('ACTIVE');
    const view = render(<SeekServices />);
    await screen.findByRole('button', { name: 'Request service' });
    account(); view.rerender(<SeekServices />);
    fireEvent.click(screen.getByRole('button', { name: 'Request service' }));
    expect(screen.getByRole('dialog', { name: 'Account suspended' })).toBeVisible();
    expect(screen.queryByRole('dialog', { name: 'Service request form' })).not.toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});
