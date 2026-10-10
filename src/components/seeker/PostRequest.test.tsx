import { fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import { apiSubmitContentCase } from '../../api/contentCases.api';
import PostRequest from './PostRequest';

vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('../../api/contentCases.api', () => ({ apiSubmitContentCase: vi.fn() }));

const postJobRequest = vi.fn();
const toastError = vi.fn();
const description = 'The faucet leaks under the sink and needs repair.';

function fillValidRequest() {
  fireEvent.change(screen.getByPlaceholderText('e.g. Need help fixing kitchen faucet leak'), {
    target: { value: 'Fix kitchen faucet leak' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Describe the scope of work/), {
    target: { value: description },
  });
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'category-cuid' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Urgency' }), { target: { value: 'Flexible Schedule' } });
}

function submitRequest() {
  const button = screen.getByRole('button', { name: 'Post Request Publicly' });
  fireEvent.submit(button.closest('form')!);
}

describe('Post Request submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApp).mockReturnValue({
      user: { id: 'seeker-id' }, postJobRequest, isDark: false,
      dbCategories: [{ id: 'category-cuid', name: 'Plumbing' }],
    } as unknown as ReturnType<typeof useApp>);
    vi.mocked(useTransactionPermission).mockReturnValue({
      canTransact: true, navigateToVerification: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionPermission>);
    vi.mocked(useToast).mockReturnValue({ error: toastError, success: vi.fn() } as unknown as ReturnType<typeof useToast>);
    vi.mocked(apiSubmitContentCase).mockResolvedValue({ success: true });
  });

  it('uses a controlled urgency dropdown and requires a selection', () => {
    render(<PostRequest />);
    fillValidRequest();
    const urgency = screen.getByRole('combobox', { name: 'Urgency' });
    expect(Array.from((urgency as HTMLSelectElement).options).slice(1).map(option => option.value)).toEqual(['ASAP / Today', 'Needs Tomorrow', 'Next 1-2 Days', 'This Week', 'Flexible Schedule']);
    expect(screen.queryByPlaceholderText(/e.g. ASAP/)).not.toBeInTheDocument();
    fireEvent.change(urgency, { target: { value: '' } });
    submitRequest();
    expect(postJobRequest).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Urgency required', expect.any(String));
  });

  it('prefills a repost without copying urgency and submits through normal new-request creation', async () => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest initialTemplate={{ title: 'FIX KITCHEN FAUCET', description, categoryId: 'category-cuid', categoryName: 'Plumbing', budget: 650, paymentMethods: { cash: true, gcash: false } }} />);
    expect(screen.getByRole('heading', { name: 'Repost a Request' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Need help fixing kitchen faucet leak')).toHaveValue('FIX KITCHEN FAUCET');
    expect(screen.getByPlaceholderText(/Describe the scope of work/)).toHaveValue(description);
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('category-cuid');
    expect(screen.getByRole('combobox', { name: 'Urgency' })).toHaveValue('');
    expect(screen.getByRole('checkbox', { name: /GCash/ })).not.toBeChecked();
    expect(postJobRequest).not.toHaveBeenCalled();
    submitRequest();
    expect(toastError).toHaveBeenCalledWith('Urgency required', expect.any(String));
    expect(postJobRequest).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Urgency' }), { target: { value: 'This Week' } });
    submitRequest();
    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith('seeker-id', 'FIX KITCHEN FAUCET', 'category-cuid', 'This Week', 650, description, { cash: true, gcash: false }, { jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, transportationFee: null }));
  });

  it('requires fresh category and payment choices for a legacy repost with retired/missing settings', () => {
    render(<PostRequest initialTemplate={{ title: 'FIX KITCHEN FAUCET', description, categoryId: '', categoryName: 'Retired plumbing', budget: 650, paymentMethods: null }} />);
    expect(screen.getByText(/Retired plumbing is no longer available/)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('');
    expect(screen.getByRole('checkbox', { name: 'On-site Cash' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /GCash/ })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Post Request Publicly' })).toBeDisabled();
    expect(postJobRequest).not.toHaveBeenCalled();
  });

  it('sends the selected urgency and retains entered values when the API rejects the request', async () => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();

    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith(
      'seeker-id', 'FIX KITCHEN FAUCET LEAK', 'category-cuid', 'Flexible Schedule', 500, description, { cash: true, gcash: true }, { jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, transportationFee: null },
    ));
    expect(screen.queryByText(/Your request is live/)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Need help fixing kitchen faucet leak')).toHaveValue('FIX KITCHEN FAUCET LEAK');
  });

  it('shows success and resets fields only after the server confirms creation', async () => {
    postJobRequest.mockResolvedValue(true);
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();

    expect(await screen.findByText(/Your request is live/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Need help fixing kitchen faucet leak')).toHaveValue('');
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Urgency' })).toHaveValue('');
  });

  it.each([{ cash: true, gcash: false }, { cash: false, gcash: true }])('posts exactly the selected payment methods: %j', async (methods) => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest />);
    fillValidRequest();
    fireEvent.click(screen.getByRole('checkbox', { name: methods.cash ? /GCash/ : 'On-site Cash' }));
    submitRequest();
    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith(
      'seeker-id', 'FIX KITCHEN FAUCET LEAK', 'category-cuid', 'Flexible Schedule', 500, description, methods, { jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, transportationFee: null },
    ));
    expect(screen.getByRole('checkbox', { name: 'On-site Cash' })).toHaveProperty('checked', methods.cash);
    expect(screen.getByRole('checkbox', { name: /GCash/ })).toHaveProperty('checked', methods.gcash);
  });

  it('blocks posting with no method and clears the inline error when one is checked', () => {
    render(<PostRequest />);
    fillValidRequest();
    fireEvent.click(screen.getByRole('checkbox', { name: 'On-site Cash' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /GCash/ }));
    expect(screen.getByRole('button', { name: 'Post Request Publicly' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one payment method');
    submitRequest();
    expect(postJobRequest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'On-site Cash' }));
    expect(screen.queryByText('Select at least one payment method you can use.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post Request Publicly' })).toBeEnabled();
  });

  it('prevents repeated submission while posting', async () => {
    let resolve!: (value: boolean) => void;
    postJobRequest.mockReturnValue(new Promise<boolean>((done) => { resolve = done; }));
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();
    fireEvent.submit(screen.getByRole('button', { name: 'Posting...' }).closest('form')!);
    expect(postJobRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('checkbox', { name: 'On-site Cash' })).toBeDisabled();
    resolve(true);
    await screen.findByText(/Your request is live/);
  });

  it('marks the rejected title and keeps the draft for revision', async () => {
    postJobRequest.mockResolvedValue({ success: false, field: 'title', error: 'Remove hateful or abusive language before publishing.' });
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();

    const titleField = screen.getByPlaceholderText('e.g. Need help fixing kitchen faucet leak');
    expect(await screen.findByText(/Remove hateful or abusive language before publishing/)).toBeInTheDocument();
    expect(titleField).toHaveAttribute('aria-invalid', 'true');
    expect(titleField).toHaveValue('FIX KITCHEN FAUCET LEAK');
    fireEvent.change(titleField, { target: { value: 'Fix kitchen faucet pipe' } });
    expect(titleField).toHaveAttribute('aria-invalid', 'false');
  });

  it('rejects values outside the backend title and description bounds before sending', () => {
    render(<PostRequest />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Need help fixing kitchen faucet leak'), {
      target: { value: 'No' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe the scope of work/), {
      target: { value: 'Too short' },
    });
    submitRequest();

    expect(postJobRequest).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Request details required', expect.any(String));
  });

  it('offers a targeted appeal after an Admin-removed request notification', async () => {
    const requestId = 'ckx1234567890123456789012';
    render(<PostRequest appealRequestId={requestId} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Appeal this removal' }));
    fireEvent.change(screen.getByLabelText('Your explanation'), { target: { value: 'Please review the removal of this request.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send appeal' }));
    await waitFor(() => expect(apiSubmitContentCase).toHaveBeenCalledWith({
      caseType: 'APPEAL', contentType: 'SERVICE_REQUEST', resourceId: requestId,
      reason: 'Please review the removal of this request.',
    }));
  });
});

// These regression tests supply an explicit location fixture; location interaction is tested separately.
vi.mock('../location/LocationField', () => ({ default: ({ onChange, disabled }: { onChange: (point: { latitude:number; longitude:number; label:string }) => void; disabled?:boolean }) => <button type="button" data-testid="test-location" disabled={disabled} onClick={() => onChange({ latitude: 10.3, longitude: 123.9, label: 'Cebu' })}>Set test location</button> }));
function render(...args: Parameters<typeof rtlRender>) { const view = rtlRender(...args); const choice = view.container.querySelector<HTMLButtonElement>('[data-testid="test-location"]'); if (choice) fireEvent.click(choice); return view; }
