import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GCashNumberField from './GCashNumberField';
import { apiGetGCashNumber, apiSaveGCashNumber } from '../../api/gcashNumber.api';
import EditServiceModal from '../provider/service-manager/EditServiceModal';

vi.mock('../../api/gcashNumber.api', () => ({ apiGetGCashNumber: vi.fn(), apiSaveGCashNumber: vi.fn() }));
vi.mock('../location/ListingLocationFields', () => ({ default: () => null }));
vi.mock('./ListingPhotoUploader', () => ({ default: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(apiGetGCashNumber).mockResolvedValue({ gcashNumber: null });
  vi.mocked(apiSaveGCashNumber).mockResolvedValue({ gcashNumber: '09123456789' });
});

async function open() {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add GCash number' })).toBeEnabled());
  screen.getByRole('button', { name: 'Add GCash number' }).focus();
  fireEvent.click(screen.getByRole('button', { name: 'Add GCash number' }));
}

describe('private GCash number in listing forms', () => {
  it('does not request a wallet for cash-only forms or signed-out users', () => {
    const { rerender } = render(<GCashNumberField userId="owner" enabled={false} isDark={false} workspace="provider" />);
    rerender(<GCashNumberField enabled isDark={false} workspace="seeker" />);
    expect(apiGetGCashNumber).not.toHaveBeenCalled(); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('saves a separate normalized number in a modal without submitting or clearing the listing', async () => {
    const publish = vi.fn(event => event.preventDefault());
    render(<form onSubmit={publish}><input aria-label="Listing title" defaultValue="Laptop repair" /><GCashNumberField userId="owner" enabled isDark={false} workspace="provider" /></form>);
    await open(); expect(screen.getByRole('textbox', { name: 'GCash mobile number' })).toHaveFocus();
    fireEvent.change(screen.getByRole('textbox', { name: 'GCash mobile number' }), { target: { value: '+63 912-345-6789' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save number' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(apiSaveGCashNumber).toHaveBeenCalledWith('09123456789', expect.any(AbortSignal));
    expect(publish).not.toHaveBeenCalled(); expect(screen.getByRole('textbox', { name: 'Listing title' })).toHaveValue('Laptop repair');
    expect(screen.getByText(/Saved number ending in 6789/)).toBeVisible();
    expect(screen.queryByText('09123456789')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit GCash number' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Your contact number is unchanged');
  });
  it('validates missing/invalid input, and cancel leaves the draft and saved number untouched', async () => {
    render(<GCashNumberField userId="owner" enabled isDark workspace="seeker" />); await open();
    fireEvent.click(screen.getByRole('button', { name: 'Save number' }));
    expect(screen.getByRole('alert')).toHaveTextContent('11 digits starting with 09'); expect(apiSaveGCashNumber).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'GCash mobile number' }), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save number' })); expect(apiSaveGCashNumber).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add GCash number' })).toHaveFocus();
  });
  it('keeps errors in the modal and allows retry without losing the entered number', async () => {
    vi.mocked(apiSaveGCashNumber).mockRejectedValueOnce(new Error('Temporary failure'));
    render(<GCashNumberField userId="owner" enabled isDark={false} workspace="provider" />); await open();
    fireEvent.change(screen.getByRole('textbox', { name: 'GCash mobile number' }), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save number' }));
    await screen.findByRole('alert'); expect(screen.getByRole('textbox', { name: 'GCash mobile number' })).toHaveValue('09123456789');
    fireEvent.click(screen.getByRole('button', { name: 'Save number' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument()); expect(apiSaveGCashNumber).toHaveBeenCalledTimes(2);
  });
  it('prevents duplicate saves and closing while the save is pending', async () => {
    let finish!: (result: { gcashNumber: string }) => void;
    vi.mocked(apiSaveGCashNumber).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    render(<GCashNumberField userId="owner" enabled isDark={false} workspace="provider" />); await open();
    fireEvent.change(screen.getByRole('textbox', { name: 'GCash mobile number' }), { target: { value: '09123456789' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Save GCash number' })); fireEvent.submit(screen.getByRole('form', { name: 'Save GCash number' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(apiSaveGCashNumber).toHaveBeenCalledTimes(1); expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => finish({ gcashNumber: '09123456789' })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('loads a persisted number when remounted and supports removal', async () => {
    vi.mocked(apiGetGCashNumber).mockResolvedValue({ gcashNumber: '09123456789' });
    vi.mocked(apiSaveGCashNumber).mockResolvedValue({ gcashNumber: null });
    const first = render(<GCashNumberField userId="owner" enabled isDark={false} workspace="seeker" />);
    await screen.findByRole('button', { name: 'Edit GCash number' }); first.unmount();
    render(<GCashNumberField userId="owner" enabled isDark={false} workspace="seeker" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit GCash number' }));
    expect(screen.getByRole('textbox', { name: 'GCash mobile number' })).toHaveValue('09123456789');
    fireEvent.click(screen.getByRole('button', { name: 'Remove number' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(apiSaveGCashNumber).toHaveBeenCalledWith(null, expect.any(AbortSignal)); expect(screen.getByRole('status')).toHaveTextContent('removed');
  });
  it('does not show a previous account number after role/session switching', async () => {
    vi.mocked(apiGetGCashNumber).mockResolvedValueOnce({ gcashNumber: '09123456789' }).mockResolvedValueOnce({ gcashNumber: null });
    const { rerender } = render(<GCashNumberField userId="first" enabled isDark={false} workspace="provider" />);
    await screen.findByText(/ending in 6789/);
    rerender(<GCashNumberField userId="second" enabled isDark={false} workspace="seeker" />);
    expect(screen.queryByText(/ending in 6789/)).not.toBeInTheDocument(); await open();
    expect(screen.getByRole('textbox', { name: 'GCash mobile number' })).toHaveValue('');
  });
  it('retries failed reads before letting a user replace a saved preference', async () => {
    vi.mocked(apiGetGCashNumber).mockRejectedValueOnce(new Error('Network down'));
    render(<GCashNumberField userId="owner" enabled isDark={false} workspace="provider" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' })); await open();
    expect(apiGetGCashNumber).toHaveBeenCalledTimes(2);
  });
  it('Escape closes only the child GCash modal and keeps the service edit form open', async () => {
    const closeListing = vi.fn();
    render(<EditServiceModal userId="owner" isDark={false} value={{ serviceId: 'service', title: 'Laptop repair', price: 500, priceType: 'FIXED', serviceType: 'ONE_TIME', estimatedDurationMins: 30, description: 'Laptop diagnostics and repair service.', paymentMethods: { cash: true, gcash: true } }} onChange={vi.fn()} onClose={closeListing} onSubmit={vi.fn()} />);
    await open(); fireEvent.keyDown(screen.getByRole('textbox', { name: 'GCash mobile number' }), { key: 'Escape' });
    expect(screen.queryByRole('form', { name: 'Save GCash number' })).not.toBeInTheDocument(); expect(closeListing).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Edit Service Listing' })).toBeVisible();
  });
});
