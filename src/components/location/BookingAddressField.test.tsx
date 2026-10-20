import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import BookingAddressField from './BookingAddressField';
import { BookingLocationSchema, type BookingLocation } from '../../lib/location';
vi.mock('./LocationField',()=>({default:({onChange}:{onChange:(point:BookingLocation)=>void})=><button onClick={()=>onChange({latitude:10.3,longitude:123.9,label:'Actual job pin'})}>Choose test job pin</button>}));
function Field() {
  const [value,setValue] = useState<BookingLocation|null>(null);
  return <><BookingAddressField value={value} onChange={setValue}/><output data-testid="booking-value">{JSON.stringify(value)}</output></>;
}
it('accepts written directions without loading a map, and retains them when an optional pin is added',()=>{
  render(<Field/>);
  expect(screen.queryByRole('button',{name:'Choose test job pin'})).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox',{name:'Service address'}),{target:{value:'Blue gate beside Ibabao barangay hall'}});
  expect(BookingLocationSchema.safeParse(JSON.parse(screen.getByTestId('booking-value').textContent!)).success).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'Add job pin (optional)'}));
  fireEvent.click(screen.getByRole('button',{name:'Choose test job pin'}));
  expect(JSON.parse(screen.getByTestId('booking-value').textContent!)).toEqual({latitude:10.3,longitude:123.9,label:'Actual job pin',address:'Blue gate beside Ibabao barangay hall'});
});
