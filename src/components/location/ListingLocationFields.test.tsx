import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ListingLocationFields, { type ListingLocationValues } from './ListingLocationFields';
import type { LocationPoint } from '../../lib/location';
vi.mock('./LocationField', () => ({ default:({value,onChange}:{value:LocationPoint;onChange:(point:LocationPoint)=>void}) => <><button onClick={() => onChange({...value,latitude:value.latitude+.01})}>Move pin</button><button onClick={() => onChange({...value,label:'Correct area name'})}>Rename area</button></> }));
function Fields() {
  const [value,setValue]=useState<ListingLocationValues>({serviceLocation:{latitude:10.3,longitude:123.9,label:'Cordova'},publicMapPin:true,serviceLocationMode:'SEEKER_VISITS',coverageRadiusKm:5});
  return <ListingLocationFields value={value} isDark={false} onChange={patch=>setValue(current=>({...current,...patch}))} />;
}
describe('public map consent', () => {
  it('requires renewed consent for a moved pin while keeping consent for an area-name correction', () => {
    render(<Fields />);
    const consent=screen.getByRole('checkbox',{name:/Show my shop’s exact location publicly/});
    expect(consent).toBeChecked(); fireEvent.click(screen.getByRole('button',{name:'Rename area'})); expect(consent).toBeChecked();
    fireEvent.click(screen.getByRole('button',{name:'Move pin'})); expect(consent).not.toBeChecked();
    fireEvent.click(consent); expect(consent).toBeChecked();
  });
});
