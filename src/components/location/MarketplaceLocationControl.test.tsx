import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MarketplaceLocationControl from './MarketplaceLocationControl';
import LocationField from './LocationField';
import { api } from '../../lib/api/axios';
import type { LocationPoint } from '../../lib/location';

vi.mock('../../lib/api/axios', () => ({ api: { get: vi.fn() } }));
// Leaflet needs real browser layout. Keep all location/search/dialog behavior real here.
vi.mock('next/dynamic', () => ({ default: () => function Map({ point, radiusKm, onChange }: { point:LocationPoint|null; radiusKm:number; onChange:(p:LocationPoint)=>void }) {
  return <div aria-label="Test map"><output>{radiusKm} km circle</output><button type="button" onClick={() => onChange({ ...point, latitude:10.31, longitude:123.91, label:'Lapu-Lapu City, Cebu' })}>Choose map pin</button></div>;
} }));
const initial = { point:{ latitude:10.3, longitude:123.9, label:'Cordova, Cebu' }, radiusKm:10 };

describe('marketplace search location', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('keeps a changed pin and radius as a draft until Apply, and Cancel preserves the original', () => {
    const apply = vi.fn();
    render(<MarketplaceLocationControl value={initial} workspace="seeker" onApply={apply}/>);
    fireEvent.click(screen.getByRole('button', { name:/Cordova/ }));
    fireEvent.change(screen.getByLabelText('Search radius'), { target:{ value:'5' } });
    expect(screen.queryByLabelText('Service category')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:'Choose map pin' }));
    expect(screen.getByText('5 km circle')).toBeVisible();
    expect(apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name:'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:/Cordova/ }));
    expect(screen.getByLabelText('Search radius')).toHaveValue('10');
    expect(screen.getByLabelText('Search area name')).toHaveValue('Cordova, Cebu');
    fireEvent.change(screen.getByLabelText('Search radius'), { target:{ value:'15' } });
    fireEvent.click(screen.getByRole('button', { name:'Choose map pin' }));
    fireEvent.click(screen.getByRole('button', { name:'Apply location' }));
    expect(apply).toHaveBeenCalledWith({ point:{ latitude:10.31, longitude:123.91, label:'Lapu-Lapu City, Cebu' }, radiusKm:15 });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('does not assume a map center or ask for GPS when first opened, and searches only on explicit action', async () => {
    const gps = vi.fn();
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), { geolocation:{ getCurrentPosition:gps } }));
    vi.mocked(api.get).mockResolvedValueOnce({ data:{ success:true, data:[initial.point] } });
    render(<MarketplaceLocationControl value={null} workspace="provider" onApply={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button', { name:/Choose your search location/ }));
    expect(screen.getByRole('button', { name:'Apply location' })).toBeDisabled();
    expect(gps).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Search city or barangay'), { target:{ value:'Cordova' } });
    expect(api.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name:'Search' }));
    fireEvent.click(await screen.findByRole('button', { name:'Cordova, Cebu' }));
    expect(api.get).toHaveBeenCalledWith('/locations/search', expect.objectContaining({ params:{ q:'Cordova' } }));
    expect(screen.getByRole('button', { name:'Apply location' })).toBeEnabled();
    vi.unstubAllGlobals();
  });
  it('recovers from denied GPS with manual pin selection, and supports Escape', async () => {
    const gps = vi.fn((_ok, fail) => fail({ code:1 }));
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), { geolocation:{ getCurrentPosition:gps } }));
    render(<MarketplaceLocationControl value={null} workspace="seeker" onApply={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button', { name:/Choose your search location/ }));
    fireEvent.click(screen.getByRole('button', { name:'Use my device location' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Search a place or select a pin');
    fireEvent.click(screen.getByRole('button', { name:'Choose map pin' }));
    expect(screen.getByRole('button', { name:'Apply location' })).toBeEnabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key:'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
  it('lazy loads a job location picker and keeps private directions out of place search', async () => {
    function JobField() { const [point,setPoint] = useState<LocationPoint|null>(null); return <LocationField value={point} onChange={setPoint} label="Job location" privateAddress/>; }
    render(<JobField/>);
    expect(screen.queryByLabelText('Search city or barangay')).not.toBeInTheDocument();
    const details = document.querySelector('details')!;
    details.open = true; fireEvent(details, new Event('toggle'));
    fireEvent.click(await screen.findByRole('button', { name:'Choose map pin' }));
    fireEvent.change(screen.getByLabelText('Private address / directions (optional)'), { target:{ value:'Unit 7, private directions' } });
    expect(api.get).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Area name shown to other users')).toHaveValue('Lapu-Lapu City, Cebu');
    await waitFor(() => expect(screen.getByLabelText('Private address / directions (optional)')).toHaveValue('Unit 7, private directions'));
  });
});
