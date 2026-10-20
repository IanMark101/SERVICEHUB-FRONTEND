import { selectWorkLocation } from '../../test/selectWorkLocation';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ListingLocationFields, { type ListingLocationValues } from './ListingLocationFields';
import type { LocationPoint } from '../../lib/location';
vi.mock('./LocationField', () => ({ default:({value,onChange}:{value:LocationPoint;onChange:(point:LocationPoint)=>void}) => <button type="button" onClick={() => onChange({...value,latitude:value.latitude+.01})}>Move discovery pin</button> }));
const point = {latitude:10.3,longitude:123.9,label:'Cordova'};
function Fields() {
  const [value,setValue]=useState<ListingLocationValues>({serviceLocation:point,venueAddress:'Shop beside the barangay hall',serviceLocationMode:'PROVIDER_VISITS'});
  return <><ListingLocationFields value={value} isDark={false} onChange={patch=>setValue(current=>({...current,...patch}))} /><output data-testid="saved-discovery">{JSON.stringify(value.serviceLocation)}</output></>;
}
describe('one map location across arrangements', () => {
  it('keeps the discovery point through every physical arrangement without a second map', () => {
    render(<Fields />);
    for (const name of [/At your place/, /Either location/, /At customer’s place/]) {
      selectWorkLocation(name);
      expect(screen.getByTestId('saved-discovery')).toHaveTextContent(JSON.stringify(point));
      expect(screen.getAllByRole('button', {name:'Move discovery pin'})).toHaveLength(1);
      expect(screen.queryByRole('checkbox', {name:/exact location publicly/})).not.toBeInTheDocument();
    }
  });
  it('reuses the physical discovery draft after online work without requiring an online location', () => {
    render(<Fields />);
    selectWorkLocation(/Online/);
    expect(screen.queryByRole('button', {name:'Move discovery pin'})).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    selectWorkLocation(/At your place/);
    expect(screen.getByTestId('saved-discovery')).toHaveTextContent(JSON.stringify(point));
    expect(screen.getByRole('textbox', {name:/Business address/})).toHaveValue('Shop beside the barangay hall');
    expect(screen.getByRole('textbox', {name:/Business address/})).toBeRequired();
  });
});
