import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlaceSearch from './PlaceSearch';
import { api } from '../../lib/api/axios';
import type { LocationPoint } from '../../lib/location';

vi.mock('../../lib/api/axios', () => ({ api: { get: vi.fn() } }));
const cordova = { latitude: 10.25, longitude: 123.95, label: 'Cordova, Cebu' };
const cebu = { latitude: 10.32, longitude: 123.9, label: 'Cebu City, Cebu' };
const reply = (places = [cordova]) => ({ data: { success: true, data: places } });
function Search({ onSelect = vi.fn(), disabled = false }: { onSelect?: (point: LocationPoint) => void; disabled?: boolean }) {
  const [query, setQuery] = useState('');
  return <PlaceSearch query={query} onQueryChange={setQuery} onSelect={onSelect} disabled={disabled}/>;
}
const type = (value: string) => fireEvent.change(screen.getByRole('combobox'), { target: { value } });
const advance = (ms = 350) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('live place suggestions', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.mocked(api.get).mockReset().mockResolvedValue(reply()); });
  afterEach(() => vi.useRealTimers());

  it('waits for three characters and a pause, then suggests a partial place name without submitting', async () => {
    render(<Search/>);
    type('co'); await advance(1000); expect(api.get).not.toHaveBeenCalled();
    type('cor'); await advance(200); type('cordov'); await advance(349); expect(api.get).not.toHaveBeenCalled();
    await advance(1);
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/locations/suggest', expect.objectContaining({ params: { q: 'cordov' }, signal: expect.any(AbortSignal) }));
    expect(screen.getByRole('option', { name: 'Cordova, Cebu' })).toBeVisible();
    expect(screen.getByRole('combobox')).toBeEnabled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('cancels an old request and ignores its late results while the user continues typing', async () => {
    let finish!: (value: ReturnType<typeof reply>) => void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(reply([cebu]));
    render(<Search/>); type('cordov'); await advance();
    const signal = vi.mocked(api.get).mock.calls[0][1]?.signal;
    type('cebu'); expect(signal?.aborted).toBe(true); await advance();
    await act(async () => finish(reply()));
    expect(screen.queryByRole('option', { name: 'Cordova, Cebu' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cebu City, Cebu' })).toBeVisible();
  });

  it('supports arrow keys and Enter, returns only the public point, and closes after selecting', async () => {
    vi.mocked(api.get).mockResolvedValue(reply([{ ...cordova, address: 'Private directions' } as LocationPoint]));
    const select = vi.fn(); render(<Search onSelect={select}/>);
    type('cordov'); await advance();
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(select).toHaveBeenCalledWith(cordova);
    expect(input).toHaveValue('Cordova, Cebu');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await advance(1000); expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('keeps manual search available after the suggestion provider fails', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(reply());
    render(<Search/>); type('cordova'); await advance();
    expect(screen.getByRole('status')).toHaveTextContent('Use Search');
    fireEvent.click(screen.getByRole('button', { name: 'Search' })); await advance(0);
    expect(api.get).toHaveBeenLastCalledWith('/locations/search', expect.objectContaining({ params: { q: 'cordova' } }));
    expect(screen.getByRole('option', { name: 'Cordova, Cebu' })).toBeVisible();
  });

  it('dismisses suggestions with Escape without submitting or selecting a place', async () => {
    const select = vi.fn(); render(<Search onSelect={select}/>); type('cordov'); await advance();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument(); expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('cordov');
  });

  it('keeps the manual search control focusable while blocking duplicate requests', async () => {
    let finish!: (value: ReturnType<typeof reply>) => void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    render(<Search/>); type('cordov');
    const button = screen.getByRole('button', { name: 'Search' });
    button.focus(); fireEvent.click(button); await advance(0);
    expect(button).toBeEnabled(); expect(button).toHaveAttribute('aria-disabled', 'true'); expect(button).toHaveFocus();
    fireEvent.click(button); await advance(0); expect(api.get).toHaveBeenCalledTimes(1);
    await act(async () => finish(reply())); expect(screen.getByRole('option', { name: 'Cordova, Cebu' })).toBeVisible();
  });

  it('reuses matching recent results and does not search a selected initial location on mount', async () => {
    const view = render(<Search/>); expect(api.get).not.toHaveBeenCalled();
    type('cordov'); await advance(); type('co'); await advance(); type('cordov'); await advance();
    expect(api.get).toHaveBeenCalledTimes(1); expect(screen.getByRole('option')).toBeVisible();
    view.unmount(); render(<PlaceSearch query="Cordova, Cebu" onQueryChange={vi.fn()} onSelect={vi.fn()}/>);
    await advance(1000); expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state and clears it when the query becomes too short', async () => {
    vi.mocked(api.get).mockResolvedValue(reply([])); render(<Search/>);
    type('unknown'); await advance(); expect(screen.getByRole('status')).toHaveTextContent('No matching places');
    type('un'); expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('cancels pending work on unmount and never searches a disabled picker', async () => {
    const view = render(<Search/>); type('cordov'); view.unmount(); await advance(); expect(api.get).not.toHaveBeenCalled();
    render(<Search disabled/>); expect(screen.getByRole('combobox')).toBeDisabled(); await advance(); expect(api.get).not.toHaveBeenCalled();
  });
});
