import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import OfferServices from './OfferServices';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const createServiceListing = vi.fn();

describe('Offer Services moderation feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      user: { id: 'provider-id', phone: '09123456789' }, createServiceListing, isDark: false,
      dbCategories: [{ id: 'category-cuid', name: 'Plumbing' }],
    } as unknown as ReturnType<typeof useApp>);
    vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: true, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
    vi.mocked(useToast).mockReturnValue({ error: vi.fn(), success: vi.fn() } as unknown as ReturnType<typeof useToast>);
  });

  it('offers only pricing that shows a definite amount before booking', () => {
    render(<OfferServices />);
    expect(screen.getByRole('option', { name: 'Fixed Price' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Per Hour' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Per Day' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Per Project' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Starts At' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Custom' })).not.toBeInTheDocument();
  });

  it('uses the selected coverage radius for both the map preview and the published listing', async () => {
    createServiceListing.mockResolvedValue({ success:true });
    render(<OfferServices/>);
    fireEvent.change(screen.getByLabelText('Service coverage radius (optional)'), { target:{value:'5'} });
    expect(screen.getByTestId('test-location')).toHaveAttribute('data-radius','5');
    fireEvent.change(screen.getByPlaceholderText('e.g. Lawn Mowing and Edge Trimming'), { target:{value:'Kitchen pipe repair'} });
    fireEvent.change(screen.getByPlaceholderText(/Describe what you will do/), { target:{value:'Repair the leaking pipe and clean up.'} });
    fireEvent.change(screen.getAllByRole('combobox')[0], { target:{value:'category-cuid'} });
    fireEvent.submit(screen.getByRole('button', { name:'Publish Listing' }).closest('form')!);
    await screen.findByRole('button', { name:'Publish Listing' });
    expect(createServiceListing).toHaveBeenCalledWith('provider-id','KITCHEN PIPE REPAIR','category-cuid',500,
      'Repair the leaking pipe and clean up.',{ cash:true,gcash:true },expect.objectContaining({ coverageRadiusKm:5 }));
  });

  it('shows a server moderation rejection beside the title without clearing the draft', async () => {
    createServiceListing.mockResolvedValue({ success: false, field: 'title', error: 'Remove hateful or abusive language before publishing.' });
    render(<OfferServices />);
    const titleField = screen.getByPlaceholderText('e.g. Lawn Mowing and Edge Trimming');
    fireEvent.change(titleField, { target: { value: 'Kitchen pipe repair' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe what you will do/), { target: { value: 'I will repair the leaking kitchen pipe and clean up.' } });
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'category-cuid' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Publish Listing' }).closest('form')!);

    expect(await screen.findByText(/Remove hateful or abusive language before publishing/)).toBeInTheDocument();
    expect(titleField).toHaveAttribute('aria-invalid', 'true');
    expect(titleField).toHaveValue('KITCHEN PIPE REPAIR');
    expect(createServiceListing).toHaveBeenCalledWith(
      'provider-id', 'KITCHEN PIPE REPAIR', 'category-cuid', 500,
      'I will repair the leaking kitchen pipe and clean up.',
      { cash: true, gcash: true }, expect.any(Object),
    );
  });
});

// These regression tests supply an explicit location fixture; location interaction is tested separately.
vi.mock('../location/LocationField', () => ({ default: ({ onChange, disabled, radiusKm }: { onChange: (point: { latitude:number; longitude:number; label:string }) => void; disabled?:boolean; radiusKm?:number | null }) => <button type="button" data-testid="test-location" data-radius={radiusKm ?? ''} disabled={disabled} onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cebu' })}>Set test location</button> }));
function render(...args: Parameters<typeof rtlRender>) { const view = rtlRender(...args); const choice = view.container.querySelector<HTMLButtonElement>('[data-testid="test-location"]'); if (choice) fireEvent.click(choice); return view; }
