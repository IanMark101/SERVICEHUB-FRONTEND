import { fireEvent, render as rtlRender, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApp } from '../../context/AppContext';
import { useTransactionPermission } from '../../hooks/useTransactionPermission';
import { useToast } from '../ui/Toast';
import { apiSubmitContentCase } from '../../api/contentCases.api';
import PostRequest from './PostRequest';

const walletState = vi.hoisted(() => ({ ready: true }));
vi.mock('../../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../ui/GCashNumberField', async () => {
  const { useEffect } = await import('react');
  return { default: ({ userId, enabled, onReadinessChange }: { userId: string; enabled: boolean; onReadinessChange?: (state: { userId: string; ready: boolean }) => void }) => {
    useEffect(() => { if (enabled) onReadinessChange?.({ userId, ready: walletState.ready }); }, [userId, enabled, onReadinessChange]);
    return enabled ? <p>Saved number ending in 6789</p> : null;
  } };
});
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission: vi.fn() }));
vi.mock('../ui/Toast', () => ({ useToast: vi.fn() }));
vi.mock('../../api/contentCases.api', () => ({ apiSubmitContentCase: vi.fn() }));

const postJobRequest = vi.fn();
const toastError = vi.fn();
const description = 'The faucet leaks under the sink and needs repair.';

function fillValidRequest() {
  fireEvent.change(screen.getByPlaceholderText('e.g. Laptop will not turn on'), {
    target: { value: 'Fix kitchen faucet leak' },
  });
  fireEvent.change(screen.getByPlaceholderText(/e.g. My laptop will not turn on/), {
    target: { value: description },
  });
  fireEvent.click(screen.getByRole('combobox', { name:'Service category' }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name:'Plumbing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  fireEvent.change(screen.getByLabelText('When do you need help?'), { target: { value: 'Flexible Schedule' } });
  fireEvent.change(screen.getByPlaceholderText('e.g. 500'), { target: { value: '500' } });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
}

function submitRequest() {
  for (let i = 0; i < 4; i++) {
    const next = screen.queryByRole('button', { name: /^(Next|Review request)$/ });
    if (!next) break;
    const before = screen.getByRole('progressbar').getAttribute('aria-valuenow');
    fireEvent.click(next);
    if (screen.getByRole('progressbar').getAttribute('aria-valuenow') === before) return;
  }
  const button = screen.getByRole('button', { name: 'Post request' });
  fireEvent.click(button);
}

describe('Post Request submission', () => {
  it('posts online work with a general discovery area and no private address or travel budget', async () => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest />);
    fireEvent.change(screen.getByLabelText('Request title'), {target:{value:'Build my business website'}});
    fireEvent.change(screen.getByLabelText('Describe what you need'), {target:{value:'Build a five-page website. We can coordinate and deliver the work online.'}});
    fireEvent.click(screen.getByRole('combobox', { name:'Service category' }));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name:'Plumbing' }));
    fireEvent.click(screen.getByRole('button', {name:'Next'}));
    fireEvent.click(screen.getByRole('radio', {name:/Online \/ remote/}));
    fireEvent.click(screen.getByTestId('test-location'));
    fireEvent.click(screen.getByRole('button', {name:'Next'}));
    expect(screen.queryByLabelText(/Extra budget for the provider/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('When do you need help?'), {target:{value:'Flexible Schedule'}});
    fireEvent.change(screen.getByLabelText('Your service budget (₱)'), {target:{value:'500'}});
    submitRequest();
    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith('seeker-id',expect.any(String),'category-cuid','Flexible Schedule',500,expect.any(String),expect.any(Object),expect.objectContaining({serviceLocationMode:'REMOTE',jobLocation:{latitude:10.3,longitude:123.9,label:'Cebu',address:undefined},transportationFee:null})));
  });
  beforeEach(() => {
  walletState.ready = true;
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

  it('keeps a suspended verified seeker from posting and explains suspension instead of re-verification', () => {
    vi.mocked(useTransactionPermission).mockReturnValue({ canTransact: false, isSuspended: true, navigateToVerification: vi.fn() } as unknown as ReturnType<typeof useTransactionPermission>);
    render(<PostRequest />);
    expect(screen.getByRole('textbox', { name: 'Request title' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByText('Posting is unavailable while suspended.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Verify Now' })).not.toBeInTheDocument();
    expect(postJobRequest).not.toHaveBeenCalled();
  });

  it('uses a controlled urgency dropdown and requires a selection', () => {
    render(<PostRequest />);
    expect(screen.getByLabelText(/Your service budget/)).toHaveValue(null);
    fillValidRequest();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    const urgency = screen.getByLabelText('When do you need help?');
    expect(Array.from((urgency as HTMLSelectElement).options).slice(1).map(option => option.value)).toEqual(['ASAP / Today', 'Needs Tomorrow', 'Next 1-2 Days', 'This Week', 'Flexible Schedule']);
    expect(screen.queryByPlaceholderText(/e.g. ASAP/)).not.toBeInTheDocument();
    fireEvent.change(urgency, { target: { value: '' } });
    submitRequest();
    expect(postJobRequest).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Choose when you need help', expect.any(String));
  });

  it('asks for a search area when the seeker travels and strips private job directions', async () => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest/>);fillValidRequest();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('radio',{name:/You go to the provider/}));
    submitRequest();
    expect(postJobRequest).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Choose an area to find providers',expect.stringContaining('The provider will give their address'));
    fireEvent.click(screen.getByTestId('test-location'));
    submitRequest();
    await waitFor(()=>expect(postJobRequest).toHaveBeenCalledWith('seeker-id',expect.any(String),'category-cuid',expect.any(String),500,description,expect.any(Object),expect.objectContaining({serviceLocationMode:'SEEKER_VISITS',jobLocation:{latitude:10.3,longitude:123.9,label:'Cebu',address:undefined},transportationFee:null})));
  });

  it('prefills a repost without copying urgency and submits through normal new-request creation', async () => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest initialTemplate={{ title: 'FIX KITCHEN FAUCET', description, categoryId: 'category-cuid', categoryName: 'Plumbing', budget: 650, paymentMethods: { cash: true, gcash: false } }} />);
    expect(screen.getByRole('heading', { name: 'Post this request again' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Laptop will not turn on')).toHaveValue('FIX KITCHEN FAUCET');
    expect(screen.getByPlaceholderText(/e.g. My laptop will not turn on/)).toHaveValue(description);
    expect(screen.getByRole('combobox', { name:'Service category' })).toHaveValue('Plumbing');
    expect(screen.getByLabelText('When do you need help?')).toHaveValue('');
    expect(screen.getByLabelText(/GCash/)).not.toBeChecked();
    expect(postJobRequest).not.toHaveBeenCalled();
    submitRequest();
    expect(toastError).toHaveBeenCalledWith('Choose when you need help', expect.any(String));
    expect(postJobRequest).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('When do you need help?'), { target: { value: 'This Week' } });
    submitRequest();
    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith('seeker-id', 'FIX KITCHEN FAUCET', 'category-cuid', 'This Week', 650, description, { cash: true, gcash: false }, { jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, transportationFee: null, serviceLocationMode: 'PROVIDER_VISITS' }));
  });

  it('requires fresh category and payment choices for a legacy repost with retired/missing settings', () => {
    render(<PostRequest initialTemplate={{ title: 'FIX KITCHEN FAUCET', description, categoryId: '', categoryName: 'Retired plumbing', budget: 650, paymentMethods: null }} />);
    expect(screen.getByText(/Retired plumbing is no longer available/)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('');
    expect(screen.getByLabelText('Cash in person')).not.toBeChecked();
    expect(screen.getByLabelText(/GCash/)).not.toBeChecked();
    expect(screen.getByRole('button', { name: /^(Next|Review request)$/ })).toBeEnabled();
    expect(postJobRequest).not.toHaveBeenCalled();
  });

  it('sends the selected urgency and retains entered values when the API rejects the request', async () => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();

    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith(
      'seeker-id', 'FIX KITCHEN FAUCET LEAK', 'category-cuid', 'Flexible Schedule', 500, description, { cash: true, gcash: true }, { jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, transportationFee: null, serviceLocationMode: 'PROVIDER_VISITS' },
    ));
    expect(screen.queryByText(/Your request is live/)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Laptop will not turn on')).toHaveValue('FIX KITCHEN FAUCET LEAK');
  });

  it('shows success and resets fields only after the server confirms creation', async () => {
    postJobRequest.mockResolvedValue(true);
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();

    expect(await screen.findByText(/Your request is live/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Laptop will not turn on')).toHaveValue('');
    expect(screen.getByLabelText(/Your service budget/)).toHaveValue(null);
    expect(screen.getByLabelText('Service category')).toHaveValue('');
    expect(screen.getByLabelText('When do you need help?')).toHaveValue('');
  });

  it.each([{ cash: true, gcash: false }, { cash: false, gcash: true }])('posts exactly the selected payment methods: %j', async (methods) => {
    postJobRequest.mockResolvedValue(false);
    render(<PostRequest />);
    fillValidRequest();
    fireEvent.click(screen.getByRole('checkbox', { name: methods.cash ? /GCash/ : 'Cash in person' }));
    submitRequest();
    await waitFor(() => expect(postJobRequest).toHaveBeenCalledWith(
      'seeker-id', 'FIX KITCHEN FAUCET LEAK', 'category-cuid', 'Flexible Schedule', 500, description, methods, { jobLocation: { latitude: 10.3, longitude: 123.9, label: 'Cebu' }, transportationFee: null, serviceLocationMode: 'PROVIDER_VISITS' },
    ));
    expect(screen.getByLabelText('Cash in person')).toHaveProperty('checked', methods.cash);
    expect(screen.getByLabelText(/GCash/)).toHaveProperty('checked', methods.gcash);
  });

  it('blocks posting with no method and clears the inline error when one is checked', () => {
    render(<PostRequest />);
    fillValidRequest();
    fireEvent.click(screen.getByLabelText('Cash in person'));
    fireEvent.click(screen.getByLabelText(/GCash/));
    expect(screen.getByRole('button', { name: /^(Next|Review request)$/ })).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one way you can pay.');
    submitRequest();
    expect(postJobRequest).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Cash in person'));
    expect(screen.queryByText('Select at least one payment method you can use.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review request' })).toBeEnabled();
  });

  it('prevents repeated submission while posting', async () => {
    let resolve!: (value: boolean) => void;
    postJobRequest.mockReturnValue(new Promise<boolean>((done) => { resolve = done; }));
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();
    fireEvent.submit(screen.getByRole('button', { name: 'Posting...' }).closest('form')!);
    expect(postJobRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Cash in person')).toBeDisabled();
    resolve(true);
    await screen.findByText(/Your request is live/);
  });

  it('marks the rejected title and keeps the draft for revision', async () => {
    postJobRequest.mockResolvedValue({ success: false, field: 'title', error: 'Remove hateful or abusive language before publishing.' });
    render(<PostRequest />);
    fillValidRequest();
    submitRequest();

    const titleField = screen.getByPlaceholderText('e.g. Laptop will not turn on');
    expect(await screen.findByText(/Remove hateful or abusive language before publishing/)).toBeInTheDocument();
    expect(titleField).toHaveAttribute('aria-invalid', 'true');
    expect(titleField).toHaveValue('FIX KITCHEN FAUCET LEAK');
    fireEvent.change(titleField, { target: { value: 'Fix kitchen faucet pipe' } });
    expect(titleField).toHaveAttribute('aria-invalid', 'false');
  });

  it('rejects values outside the backend title and description bounds before sending', () => {
    render(<PostRequest />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Laptop will not turn on'), {
      target: { value: 'No' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. My laptop will not turn on/), {
      target: { value: 'Too short' },
    });
    submitRequest();

    expect(postJobRequest).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Check your request details', expect.any(String));
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

it('blocks a GCash seeker request without a saved number and permits Cash only', () => {
  walletState.ready = false;
  render(<PostRequest />); fillValidRequest();
  fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Save a valid GCash number');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  expect(postJobRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: /GCash/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
});
