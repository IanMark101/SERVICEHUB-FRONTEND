import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MarketplaceMatchesModal from './MarketplaceMatchesModal';
import { apiMatchProviders, apiMatchRequests } from '../../api/ai.api';
vi.mock('../../api/ai.api',()=>({apiMatchProviders:vi.fn(),apiMatchRequests:vi.fn()}));
const match={id:'listing-1',title:'Laptop repair',category:'Computer & Laptop Repair',name:'Sample Member',userId:'member-1',trustScore:82,rating:4.5,reviewCount:2,distanceKm:1.2,locationLabel:'Cordova',amount:500,priceType:'FIXED',rank:1,rationale:'Same category'};
describe('ranked marketplace match dialogs',()=>{
  beforeEach(()=>{vi.clearAllMocks();vi.mocked(apiMatchProviders).mockResolvedValue({success:true,data:{suggestions:[match],source:'gemini'}});vi.mocked(apiMatchRequests).mockResolvedValue({success:true,data:{suggestions:[match],source:'computed',reason:'AI is unavailable. Showing recorded matches.'}});});
  it.each(['seeker','provider'] as const)('%s shows recorded trust, ratings, ranking and a correct listing link',async tone=>{
    const close=vi.fn();render(<MarketplaceMatchesModal source={{id:'source-1',title:'My listing'}} tone={tone} onClose={close}/>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();expect(await screen.findByText('Sample Member · Computer & Laptop Repair')).toBeInTheDocument();
    expect(screen.getByLabelText('Trust score: 82 out of 100')).toBeInTheDocument();expect(screen.getByText('4.5 (2 reviews)')).toBeInTheDocument();expect(screen.getByLabelText('Rank 1')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href',tone==='seeker'?'/seeker/seek-services?serviceId=listing-1':'/provider/browse-services?request=listing-1');
    fireEvent.click(screen.getByRole('button',{name:'Close matches'}));expect(close).toHaveBeenCalledOnce();
  });
  it('shows a meaningful empty reason and supports retry after an API failure',async()=>{
    vi.mocked(apiMatchProviders).mockRejectedValueOnce(new Error('Offline'));
    render(<MarketplaceMatchesModal source={{id:'source-1',title:'My listing'}} tone="seeker" onClose={vi.fn()}/>);
    await screen.findByRole('alert');
    vi.mocked(apiMatchProviders).mockResolvedValueOnce({success:true,data:{suggestions:[],source:'computed',reason:'No eligible providers in this category yet.'}});
    fireEvent.click(screen.getByRole('button',{name:'Try again'}));await waitFor(()=>expect(screen.getByText('No eligible providers in this category yet.')).toBeVisible());
  });
});
