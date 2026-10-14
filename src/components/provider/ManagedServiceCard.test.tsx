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
  it('uses one bounded gallery, keeps the full description accessible and navigates every photo', () => {
    render(<ManagedServiceCard service={listing} isDark={false} highlighted={false} toggling={false} onEdit={vi.fn()} onDelete={vi.fn()} onToggle={vi.fn()} />);
    expect(screen.getByText(listing.description)).toBeInTheDocument();
    expect(screen.getByAltText('LAPTOP REPAIR — photo 1 of 2')).toBeInTheDocument();
    expect(screen.getAllByRole('region', { name:'Photos of LAPTOP REPAIR' })).toHaveLength(1);
    expect(screen.queryByText('Cash')).not.toBeInTheDocument();
    expect(screen.getByText('GCash')).toBeInTheDocument();
    const readMore = screen.getByRole('button', { name:'Read full description' });
    expect(readMore).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(readMore);
    expect(screen.getByRole('button', { name:'Show less' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name:'Next photo' }));
    expect(screen.getByAltText('LAPTOP REPAIR — photo 2 of 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Photos of LAPTOP REPAIR')).toHaveAttribute('data-presentation', 'managed');
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
  it('keeps the pending visibility change disabled and provides a revision action', () => {
    const toggle=vi.fn();
    const view=render(<ManagedServiceCard service={listing} isDark={false} highlighted={false} toggling onEdit={vi.fn()} onDelete={vi.fn()} onToggle={toggle} />);
    expect(screen.getByRole('switch')).toBeDisabled();
    fireEvent.click(screen.getByRole('switch')); expect(toggle).not.toHaveBeenCalled();
    view.rerender(<ManagedServiceCard service={{...listing,status:'REJECTED',adminNotes:'Describe the repair clearly.'}} isDark={false} highlighted={false} toggling={false} onEdit={vi.fn()} onDelete={vi.fn()} onToggle={toggle} />);
    expect(screen.getByRole('button', {name:'Revise Listing'})).toBeInTheDocument();
    expect(screen.getByText('Describe the repair clearly.')).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
