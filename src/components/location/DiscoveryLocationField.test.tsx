import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import DiscoveryLocationField from './DiscoveryLocationField';
import type { LocationPoint } from '../../lib/location';

const point = { latitude:10.3, longitude:123.9, label:'Cordova' };
vi.mock('./LocationField', () => ({ default: ({ value,onChange }: { value:LocationPoint|null; onChange:(point:LocationPoint)=>void }) => <><output>{value?.label || 'No saved location'}</output><button onClick={() => onChange({ ...point,address:'Private directions must not be saved as discovery data' })}>Choose discovery</button></> }));
beforeEach(() => localStorage.clear());
function Field({ userId }: { userId:string }) {
  const [value,setValue] = useState<LocationPoint|null>(null);
  return <DiscoveryLocationField userId={userId} reuseSaved value={value} onChange={setValue} workspace="provider" />;
}
it('reuses the account discovery point for a future post and strips private directions', async () => {
  const first = render(<Field userId="first" />);
  fireEvent.click(screen.getByRole('button', { name:'Choose discovery' }));
  expect(JSON.parse(localStorage.getItem('servicehub:listing-discovery:first')!)).toEqual(point);
  first.unmount();
  render(<Field userId="first" />);
  await waitFor(() => expect(screen.getByText('Cordova')).toBeVisible());
});
it('never reuses another account location and works without browser storage', () => {
  localStorage.setItem('servicehub:listing-discovery:first',JSON.stringify(point));
  render(<Field userId="second" />);
  expect(screen.getByText('No saved location')).toBeVisible();
  const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Unavailable'); });
  fireEvent.click(screen.getByRole('button', { name:'Choose discovery' }));
  expect(screen.getByText('Cordova')).toBeVisible();
  storage.mockRestore();
});
