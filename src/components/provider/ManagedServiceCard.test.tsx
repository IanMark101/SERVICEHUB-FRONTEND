import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ManagedServiceCard from './ManagedServiceCard';
import type { ServiceListing } from '../../types';

vi.mock('../moderation/ContentCaseAction', () => ({ default:() => <button>Appeal this removal</button> }));
const listing = { id:'listing', title:'LAPTOP REPAIR', category:'Computer & Laptop Repair', description:'A'.repeat(1000), price:0, priceType:'BY_AGREEMENT', locationLabel:'Gabi, Cordova, Cebu', isPaused:false, status:'ACTIVE', photos:[
  { id:'one', url:'https://example.test/repair.jpg', width:1200, height:800 },
  { id:'two', url:'https://example.test/parts.jpg', width:1200, height:800 },
], paymentMethods:{ cash:false, gcash:true } } as ServiceListing;
describe('managed listing presentation', () => {
  it('shows one large cover, keeps the full description and opens all photos on demand', () => {
    render(<ManagedServiceCard service={listing} isDark={false} highlighted={false} toggling={false} onEdit={vi.fn()} onDelete={vi.fn()} onToggle={vi.fn()} />);
    expect(screen.getByText(listing.description)).toBeInTheDocument();
    expect(screen.getByAltText('LAPTOP REPAIR, cover photo')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name:'Photos of LAPTOP REPAIR' })).not.toBeInTheDocument();
    expect(screen.queryByText('Cash')).not.toBeInTheDocument();
    expect(screen.getByText('GCash')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:'View 2 listing photos' }));
    expect(screen.getByLabelText('Photos of LAPTOP REPAIR')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:'Next photo' }));
    expect(screen.getByAltText('LAPTOP REPAIR — photo 2 of 2')).toBeInTheDocument();
  });
  it('keeps edit, deletion, availability and removed-listing permissions connected', () => {
    const edit=vi.fn(), remove=vi.fn(), toggle=vi.fn();
    const view=render(<ManagedServiceCard service={{...listing,photos:[]}} isDark={false} highlighted={false} toggling={false} onEdit={edit} onDelete={remove} onToggle={toggle} />);
    expect(screen.getByRole('img', { name:'No photo added' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:'Edit' })); expect(edit).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name:'Delete' })); expect(remove).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('switch')); expect(toggle).toHaveBeenCalledOnce();
    view.rerender(<ManagedServiceCard service={{...listing,status:'SUSPENDED'}} isDark={true} highlighted={false} toggling={false} onEdit={edit} onDelete={remove} onToggle={toggle} />);
    expect(screen.queryByRole('button', { name:'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name:'Appeal this removal' })).toBeInTheDocument();
  });
});
