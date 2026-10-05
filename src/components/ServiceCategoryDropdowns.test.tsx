import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../context/AppContext';
import { useTransactionPermission } from '../hooks/useTransactionPermission';
import { useToast } from './ui/Toast';
import PostRequest from './seeker/PostRequest';
import OfferServices from './provider/OfferServices';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('./ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const postJobRequest = vi.fn();
const createServiceListing = vi.fn();
const toastError = vi.fn();

type Category = { id: string; name: string };
let activeCategories: Category[];

function categoryOptions(container: HTMLElement) {
  const select = container.querySelector('select')!;
  return Array.from(select.options).map((option) => ({ value: option.value, name: option.textContent }));
}

describe('Seeker and Provider admin-managed categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeCategories = [{ id: 'plumbing-id', name: 'Plumbing' }];
    vi.mocked(useApp).mockImplementation(() => ({
      user: { id: 'resident-id', phone: '09123456789' },
      isDark: false,
      dbCategories: activeCategories,
      postJobRequest,
      createServiceListing,
    } as unknown as ReturnType<typeof useApp>));
    vi.mocked(useTransactionPermission).mockReturnValue({
      canTransact: true, navigateToVerification: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionPermission>);
    vi.mocked(useToast).mockReturnValue({ error: toastError } as unknown as ReturnType<typeof useToast>);
  });

  it('shows the same active category IDs and exact Admin names on create and rename, including Haircut', () => {
    const seeker = render(<PostRequest />);
    const provider = render(<OfferServices />);
    const expected = [
      { value: '', name: 'Select a category...' },
      { value: 'plumbing-id', name: 'Plumbing' },
    ];
    expect(categoryOptions(seeker.container)).toEqual(expected);
    expect(categoryOptions(provider.container)).toEqual(expected);

    // An Admin approval adds an active row to the shared /categories response.
    activeCategories = [...activeCategories, { id: 'haircut-id', name: 'Haircut' }];
    seeker.rerender(<PostRequest />);
    provider.rerender(<OfferServices />);
    expect(categoryOptions(seeker.container)).toEqual(categoryOptions(provider.container));
    expect(categoryOptions(seeker.container)).toContainEqual({ value: 'haircut-id', name: 'Haircut' });

    // Admin rename retains the database ID; both labels update in place.
    activeCategories = [{ id: 'plumbing-id', name: 'Plumbing Repair' }, activeCategories[1]];
    seeker.rerender(<PostRequest />);
    provider.rerender(<OfferServices />);
    expect(categoryOptions(seeker.container)).toEqual(categoryOptions(provider.container));
    expect(categoryOptions(seeker.container)).toContainEqual({ value: 'plumbing-id', name: 'Plumbing Repair' });
  });

  it('removes an Admin-deactivated category from both and rejects a stale selection', async () => {
    activeCategories = [{ id: 'plumbing-id', name: 'Plumbing' }, { id: 'haircut-id', name: 'Haircut' }];
    const seeker = render(<PostRequest />);
    const provider = render(<OfferServices />);
    fireEvent.change(seeker.container.querySelector('select')!, { target: { value: 'haircut-id' } });
    fireEvent.change(provider.container.querySelector('select')!, { target: { value: 'haircut-id' } });

    activeCategories = [{ id: 'plumbing-id', name: 'Plumbing' }];
    seeker.rerender(<PostRequest />);
    provider.rerender(<OfferServices />);

    expect(categoryOptions(seeker.container)).toEqual(categoryOptions(provider.container));
    expect(categoryOptions(seeker.container)).not.toContainEqual({ value: 'haircut-id', name: 'Haircut' });
    expect(seeker.container.querySelector('select')).toHaveValue('');
    expect(provider.container.querySelector('select')).toHaveValue('');

    fireEvent.submit(seeker.container.querySelector('form')!);
    fireEvent.submit(provider.container.querySelector('form')!);
    await waitFor(() => {
      expect(postJobRequest).not.toHaveBeenCalled();
      expect(createServiceListing).not.toHaveBeenCalled();
    });

    // Reactivation returns the same Admin-owned ID to both workspaces.
    activeCategories = [{ id: 'plumbing-id', name: 'Plumbing' }, { id: 'haircut-id', name: 'Haircut' }];
    seeker.rerender(<PostRequest />);
    provider.rerender(<OfferServices />);
    expect(categoryOptions(seeker.container)).toEqual(categoryOptions(provider.container));
    expect(categoryOptions(seeker.container)).toContainEqual({ value: 'haircut-id', name: 'Haircut' });
  });

  it('submits the exact selected category ID from each workspace', async () => {
    postJobRequest.mockResolvedValue(true);
    createServiceListing.mockResolvedValue({ success: true, data: { id: 'listing-id' } });
    const seeker = render(<PostRequest />);
    const provider = render(<OfferServices />);
    fireEvent.change(seeker.container.querySelector('select')!, { target: { value: 'plumbing-id' } });
    fireEvent.change(provider.container.querySelector('select')!, { target: { value: 'plumbing-id' } });
    fireEvent.change(seeker.container.querySelector('input[placeholder="e.g. Need help fixing kitchen faucet leak"]')!, { target: { value: 'Fix kitchen faucet leak' } });
    fireEvent.change(seeker.container.querySelector('textarea')!, { target: { value: 'The faucet leaks under the sink and needs repair.' } });
    fireEvent.change(seeker.container.querySelector('#request-urgency')!, { target: { value: 'Flexible Schedule' } });
    fireEvent.submit(seeker.container.querySelector('form')!);
    fireEvent.submit(provider.container.querySelector('form')!);
    await waitFor(() => {
      expect(postJobRequest).toHaveBeenCalledWith('resident-id', 'FIX KITCHEN FAUCET LEAK', 'plumbing-id', 'Flexible Schedule', 500, expect.any(String), expect.any(Object));
      expect(createServiceListing).toHaveBeenCalledWith('resident-id', '', 'plumbing-id', 500, '', expect.any(Object), expect.any(Object));
    });
  });
});
