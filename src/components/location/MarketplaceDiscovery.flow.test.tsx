import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SeekServices from '../seeker/SeekServices';
import BrowseJobs from '../provider/BrowseJobs';
import { api } from '../../lib/api/axios';
import { useApp } from '../../context/AppContext';

const { push, submitBid } = vi.hoisted(() => ({ push:vi.fn(), submitBid:vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter:() => ({ push }) }));
vi.mock('../../context/AppContext', () => ({ useApp:vi.fn() }));
vi.mock('../../lib/api/axios', () => ({ api:{ get:vi.fn() } }));
vi.mock('../../api/services.api', () => ({ apiGetMyServices:vi.fn().mockResolvedValue({ success:true, data:[] }) }));
vi.mock('../../api/ai.api', () => ({ apiGetProviderSummary:vi.fn(), getCachedSeekerSummary:() => undefined, apiGetSeekerSummary:vi.fn().mockResolvedValue({ success:true, data:{ summary:null, source:'empty' } }) }));
vi.mock('../../lib/socket', () => ({ joinServiceRoom:vi.fn() }));
vi.mock('../../hooks/useTransactionPermission', () => ({ useTransactionPermission:() => ({ canTransact:true }) }));
vi.mock('../ui/Toast', () => ({ useToast:() => ({ warning:vi.fn(),success:vi.fn(),error:vi.fn(),info:vi.fn() }) }));
vi.mock('../landing/LimitedModeDashboardCard', () => ({ default:() => null }));
vi.mock('../moderation/ContentCaseAction', () => ({ default:() => null }));
// The existing booking form/lifecycle has its own integration coverage. Check
// that discovery still selects the same listing through its normal entry point.
vi.mock('../seeker/RequestServiceModal', () => ({ default:({ listing }:{listing:{id:string}}) => <div role="dialog">Booking listing {listing.id}</div> }));
vi.mock('next/dynamic', () => ({ default:() => function Map() { return <div aria-label="Test map"/>; } }));

const location = { point:{ latitude:10.3, longitude:123.9, label:'Cordova, Cebu' }, radiusKm:10 };
const aircon = (km:number) => ({ id:`aircon-${km}`, providerId:'provider', provider:{id:'provider',name:'Juan'}, seekerId:'seeker', seeker:{id:'seeker',name:'Client'},
  title:`Aircon Repair ${km}`, description:'Repair air conditioning', category:{name:'Aircon Repair'}, price:500, budgetMax:500, urgency:'Needs Tomorrow',
  status:'ACTIVE', isAvailable:true, paymentMethods:{cash:true,gcash:true}, distanceKm:km, locationLabel:'Lapu-Lapu City', createdAt:new Date().toISOString() });
const plumbing = { ...aircon(.5), id:'plumbing', title:'Plumbing service', category:{name:'Plumbing'} };

describe('actual Seeker and Provider discovery pages with the nearby hook', () => {
  beforeEach(() => {
    vi.clearAllMocks(); localStorage.clear(); window.history.replaceState({}, '', '/');
    window.matchMedia = vi.fn().mockReturnValue({ matches:false });
    Element.prototype.scrollIntoView = vi.fn();
    vi.mocked(useApp).mockReturnValue({ user:{id:'member'}, services:[], users:[], jobRequests:[], jobEngagements:[], bids:[], isDark:false,
      dbCategories:[{id:'aircon',name:'Aircon Repair'},{id:'plumbing',name:'Plumbing'}], submitBid } as unknown as ReturnType<typeof useApp>);
    // Fixed endpoint scenarios exercise real page/hook wiring. Actual database
    // matching (including out-of-radius and wrong-category records) is covered
    // by proximity-marketplace.test.ts in the backend.
    vi.mocked(api.get).mockImplementation(async (path, options) => {
      if (!String(path).endsWith('/nearby')) throw new Error(`Unexpected API: ${path}`);
      const params = options!.params;
      const narrowed = params.search || params.category === 'Aircon Repair';
      const items = params.radiusKm === 1 || params.filter === 'rated' || params.filter === 'urgent' ? []
        : params.radiusKm === 2 ? (narrowed ? [aircon(2)] : [plumbing, aircon(2)])
        : narrowed ? [aircon(2), aircon(7)] : [plumbing, aircon(2), aircon(7)];
      return { data:{success:true,data:{ items:items.map(item => ({...item,status:String(path).startsWith('/requests') ? 'OPEN' : 'ACTIVE'})),pagination:{page:1,limit:6,total:items.length,totalPages:1} }} };
    });
  });

  it.each(['seeker','provider'] as const)('%s waits for results and shows the full matching total rather than the page size', async workspace => {
    localStorage.setItem(`servicehub:marketplace-location:member:${workspace}`, JSON.stringify(location));
    let resolve!: (value: unknown) => void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    render(workspace === 'seeker' ? <SeekServices/> : <BrowseJobs/>);
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(screen.queryByText(/\d+ (?:Services?|Jobs?) Available/)).not.toBeInTheDocument();
    await act(async () => resolve({ data: { success: true, data: {
      items: [{ ...aircon(2), status: workspace === 'seeker' ? 'ACTIVE' : 'OPEN' }],
      pagination: { page: 1, limit: 6, total: 25, totalPages: 5 },
    } } }));
    expect(await screen.findByText(workspace === 'seeker' ? '25 Services Available' : '25 Service Requests Available')).toBeVisible();
  });

  it.each(['seeker','provider'] as const)('%s does not present a failed initial request as zero available results', async workspace => {
    localStorage.setItem(`servicehub:marketplace-location:member:${workspace}`, JSON.stringify(location));
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Connection unavailable'));
    render(workspace === 'seeker' ? <SeekServices/> : <BrowseJobs/>);
    await screen.findByRole('alert');
    expect(screen.queryByText(/\d+ (?:Services?|Jobs?) Available/)).not.toBeInTheDocument();
  });

  it.each(['seeker','provider'] as const)('%s uses a saved area, combines filters and applies radius only on Apply', async workspace => {
    localStorage.setItem(`servicehub:marketplace-location:member:${workspace}`, JSON.stringify(location));
    render(workspace === 'seeker' ? <SeekServices/> : <BrowseJobs/>);
    await screen.findByText('Plumbing service');
    expect(screen.getByText(workspace === 'seeker' ? '3 Services Available' : '3 Service Requests Available')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('within 10 km');
    const search = screen.getByRole('textbox', { name:workspace === 'seeker' ? 'Search service listings' : 'Search service requests' });
    fireEvent.change(search, {target:{value:'Aircon Repair'}});
    fireEvent.click(screen.getByRole('button', {name:'Search'}));
    await waitFor(() => expect(screen.queryByText('Plumbing service')).not.toBeInTheDocument());
    await screen.findByText('Aircon Repair 7');
    fireEvent.click(screen.getByRole('button', {name:'Aircon Repair'}));
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith(workspace === 'seeker' ? '/services/nearby' : '/requests/nearby', expect.objectContaining({params:expect.objectContaining({ search:'Aircon Repair', category:'Aircon Repair', radiusKm:10 })})));
    fireEvent.click(screen.getByRole('button', {name:/Location: Cordova/}));
    const calls = vi.mocked(api.get).mock.calls.length;
    fireEvent.change(screen.getByLabelText('Search radius'), {target:{value:'1'}});
    expect(api.get).toHaveBeenCalledTimes(calls);
    fireEvent.click(screen.getByRole('button', {name:'Apply location'}));
    await screen.findByRole('heading', {name:workspace === 'seeker' ? 'No Services Found' : 'No Open Service Requests'});
    expect(screen.queryByText('Aircon Repair 7')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aircon Repair');
    expect(screen.getByRole('status')).toHaveTextContent('within 1 km');
    expect(screen.getByText(workspace === 'seeker' ? '0 Services Available' : '0 Service Requests Available')).toBeVisible();
    if (workspace === 'seeker') {
      expect(screen.queryByRole('button', { name: 'Change location' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Suggest a Category/i })).not.toBeInTheDocument();
      expect(screen.queryByText("Can't find what you're looking for?")).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Location: Cordova/ })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', {name:'Post a Request'}));
      expect(push).toHaveBeenCalledWith('/seeker/post-request');
    } else expect(screen.queryByRole('button', {name:'Book Service'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'Expand radius to 2 km'}));
    await screen.findByText('Aircon Repair 2');
    expect(screen.getByText(workspace === 'seeker' ? '1 Service Available' : '1 Service Request Available')).toBeVisible();
    expect(screen.queryByText('Aircon Repair 7')).not.toBeInTheDocument();
    fireEvent.change(search, {target:{value:''}});
    fireEvent.click(screen.getByRole('button', {name:'All Categories'}));
    await screen.findByText('Plumbing service');
    fireEvent.click(screen.getByRole('button', {name:'Aircon Repair'}));
    await waitFor(() => expect(screen.queryByText('Plumbing service')).not.toBeInTheDocument());
    expect(screen.getByText('Aircon Repair 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:workspace === 'seeker' ? 'Top Rated' : 'Urgent'}));
    await screen.findByRole('button', {name:'Clear filters'});
    fireEvent.click(screen.getByRole('button', {name:'Clear filters'}));
    await screen.findByText('Plumbing service');
    expect(JSON.parse(localStorage.getItem(`servicehub:marketplace-location:member:${workspace}`)!).radiusKm).toBe(2);
  });

  it.each(['seeker','provider'] as const)('%s keeps category selection on the dashboard and preserves it when applying a radius', async workspace => {
    localStorage.setItem(`servicehub:marketplace-location:member:${workspace}`, JSON.stringify(location));
    render(workspace === 'seeker' ? <SeekServices/> : <BrowseJobs/>);
    await screen.findByText('Aircon Repair 7');
    expect(screen.getByText('Plumbing service')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'Aircon Repair'}));
    await waitFor(() => expect(screen.queryByText('Plumbing service')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', {name:/Location: Cordova/}));
    const dialog = screen.getByRole('dialog');
    const calls = vi.mocked(api.get).mock.calls.length;
    expect(within(dialog).queryByLabelText('Service category')).not.toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Search radius'), {target:{value:'2'}});
    expect(api.get).toHaveBeenCalledTimes(calls);
    fireEvent.click(within(dialog).getByRole('button', {name:'Apply location'}));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(calls + 1));
    expect(api.get).toHaveBeenLastCalledWith(workspace === 'seeker' ? '/services/nearby' : '/requests/nearby', expect.objectContaining({params:expect.objectContaining({category:'Aircon Repair',radiusKm:2,latitude:10.3,longitude:123.9})}));
    await screen.findByText('Aircon Repair 2');
    expect(screen.queryByText('Plumbing service')).not.toBeInTheDocument();
    expect(screen.queryByText('Aircon Repair 7')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name:'Aircon Repair'})).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', {name:/Location: Cordova/}));
    fireEvent.change(screen.getByLabelText('Search radius'), {target:{value:'10'}});
    fireEvent.click(screen.getByRole('button', {name:'Cancel'}));
    expect(api.get).toHaveBeenCalledTimes(calls + 1);
    expect(screen.queryByText('Plumbing service')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('within 2 km');
    fireEvent.click(screen.getByRole('button', {name:'All Categories'}));
    await screen.findByText('Plumbing service');
    expect(screen.queryByText('Aircon Repair 7')).not.toBeInTheDocument();
    expect(api.get).toHaveBeenLastCalledWith(workspace === 'seeker' ? '/services/nearby' : '/requests/nearby', expect.objectContaining({params:expect.objectContaining({category:'All Categories',radiusKm:2,latitude:10.3,longitude:123.9})}));
  });

  it.each(['seeker','provider'] as const)('%s keeps its empty state visible when returning to the browser tab', async workspace => {
    localStorage.setItem(`servicehub:marketplace-location:member:${workspace}`, JSON.stringify({...location,radiusKm:1}));
    render(workspace === 'seeker' ? <SeekServices/> : <BrowseJobs/>);
    const emptyTitle = workspace === 'seeker' ? 'No Services Found' : 'No Open Service Requests';
    await screen.findByRole('heading', {name:emptyTitle});
    let resolve!: (value:unknown) => void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(done => {resolve=done;}));
    const calls = vi.mocked(api.get).mock.calls.length;
    fireEvent(window, new Event('focus'));
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(calls+1));
    expect(screen.getByRole('heading', {name:emptyTitle})).toBeVisible();
    expect(screen.queryByRole('status', {name:workspace === 'seeker' ? 'Loading services' : 'Loading job requests'})).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 matching');
    await act(async () => resolve({data:{success:true,data:{items:[],pagination:{page:1,limit:6,total:0,totalPages:1}}}}));
    expect(screen.getByRole('heading', {name:emptyTitle})).toBeVisible();
  });

  it('opens the location dialog from a first-use search without inventing a location', async () => {
    render(<SeekServices/>);
    await screen.findByRole('heading', {name:'Choose your search location'});
    expect(api.get).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', {name:'Search service listings'}), {target:{value:'Aircon Repair'}});
    fireEvent.click(screen.getByRole('button', {name:'Search'}));
    expect(screen.getByRole('dialog', {name:'Change search location'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name:'Apply location'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name:'Cancel'}));
    expect(screen.getByRole('textbox', {name:'Search service listings'})).toHaveValue('Aircon Repair');
  });

  it('provider details lead to an offer, while seeker cards lead to the existing booking form', async () => {
    localStorage.setItem('servicehub:marketplace-location:member:provider', JSON.stringify({...location,radiusKm:2}));
    submitBid.mockResolvedValue(true);
    const view = render(<BrowseJobs/>);
    fireEvent.click(await screen.findByRole('button', {name:'Inspect Aircon Repair 2 details'}));
    const details = screen.getByRole('dialog');
    fireEvent.click(within(details).getByRole('button', {name:/Send Offer/}));
    expect(screen.getByLabelText('Service listing (optional)')).toHaveValue('');
    fireEvent.change(screen.getByPlaceholderText('Describe your approach and availability'), {target:{value:'I can repair the aircon tomorrow.'}});
    fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
    await waitFor(() => expect(submitBid).toHaveBeenCalledWith('aircon-2','member',undefined,500,60,'I can repair the aircon tomorrow.',undefined));
    view.unmount();
    // First seeker visit reuses only this account's deliberate marketplace area.
    render(<SeekServices/>);
    const buttons = await screen.findAllByRole('button', {name:'Book Service'});
    fireEvent.click(buttons[0]);
    expect(screen.getByRole('dialog')).toHaveTextContent('Booking listing plumbing');
  });

  it('an explicit service link opens details without bypassing nearby result filters', async () => {
    window.history.replaceState({}, '', '/?serviceId=far-service');
    localStorage.setItem('servicehub:marketplace-location:member:seeker', JSON.stringify({...location,radiusKm:1}));
    vi.mocked(useApp).mockReturnValue({ ...useApp(),services:[{ id:'far-service',title:'Far aircon',status:'ACTIVE',isPaused:false,providerId:'provider',providerName:'Juan',price:500,priceType:'FIXED',description:'Repair',category:'Aircon Repair',paymentMethods:{cash:true,gcash:true},queueSize:0 }] } as unknown as ReturnType<typeof useApp>);
    render(<SeekServices/>);
    expect(await screen.findByRole('dialog')).toHaveTextContent('Far aircon');
    await screen.findByRole('heading', {name:'No Services Found'});
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name:'Cancel'}));
    expect(screen.queryByText('Far aircon')).not.toBeInTheDocument();
  });

  it.each(['seeker', 'provider'] as const)('%s discovers Other through All, then combines the official filter with text search', async workspace => {
    localStorage.setItem(`servicehub:marketplace-location:member:${workspace}`, JSON.stringify(location));
    vi.mocked(useApp).mockReturnValue({ ...useApp(), dbCategories: [{ id: 'other-id', name: 'Other Services' }, ...useApp().dbCategories] } as ReturnType<typeof useApp>);
    const other = { ...aircon(1), id: 'aquarium', title: 'Repair aquarium pump', description: 'Inspect circulation pump', category: { name: 'Other Services' } };
    vi.mocked(api.get).mockImplementation(async (_path, options) => {
      const items = options!.params.category === 'Other Services' || options!.params.search ? [other] : [plumbing, other];
      return { data: { success: true, data: { items, pagination: { page: 1, limit: 6, total: items.length, totalPages: 1 } } } };
    });
    render(workspace === 'seeker' ? <SeekServices /> : <BrowseJobs />);
    await screen.findByText('Repair aquarium pump');
    expect(screen.getByText('Plumbing service')).toBeInTheDocument();
    const categoryRow = screen.getByRole('group', {name:workspace==='seeker' ? 'Service categories' : 'Service request categories'});
    expect(within(categoryRow).getAllByRole('button').map(button => button.textContent)).toEqual(['All Categories', 'Aircon Repair', 'Plumbing', 'Other Services']);
    fireEvent.click(screen.getByRole('button', { name: 'Other Services' }));
    await waitFor(() => expect(screen.queryByText('Plumbing service')).not.toBeInTheDocument());
    fireEvent.change(screen.getByRole('textbox', { name: workspace === 'seeker' ? 'Search service listings' : 'Search service requests' }), { target: { value: 'aquarium' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith(workspace === 'seeker' ? '/services/nearby' : '/requests/nearby', expect.objectContaining({ params: expect.objectContaining({ search: 'aquarium', category: 'Other Services', radiusKm: 10, latitude: 10.3, longitude: 123.9 }) })));
    expect(screen.getByText('Repair aquarium pump')).toBeInTheDocument();
  });
});
