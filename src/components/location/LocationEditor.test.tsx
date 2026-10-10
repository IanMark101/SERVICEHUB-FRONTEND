import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LocationEditor from './LocationEditor';
import type { LocationPoint } from '../../lib/location';

vi.mock('../../lib/api/axios', () => ({ api:{get:vi.fn()} }));
vi.mock('next/dynamic', () => ({ default:() => function Map({onChange}:{onChange:(point:LocationPoint)=>void}) {
  return <button onClick={() => onChange({latitude:10.3,longitude:123.9,label:'Chosen map pin'})}>Choose map pin</button>;
} }));

const position = {coords:{latitude:10.31,longitude:123.91}} as GeolocationPosition;
const failure = (code:number) => ({code,message:'Device location failed'}) as GeolocationPositionError;

function Editor({onChange}:{onChange:(point:LocationPoint)=>void}) {
  const [point,setPoint] = useState<LocationPoint|null>(null);
  return <LocationEditor value={point} onChange={next => {setPoint(next);onChange(next);}}/>;
}

describe('device-location recovery', () => {
  const gps = vi.fn<Geolocation['getCurrentPosition']>();
  beforeEach(() => {
    gps.mockReset();
    vi.stubGlobal('navigator', Object.assign(Object.create(navigator), {geolocation:{getCurrentPosition:gps}}));
  });
  afterEach(() => {vi.useRealTimers();vi.unstubAllGlobals();});

  it.each([1,2,3])('allows a fresh successful attempt after browser failure code %s', code => {
    gps.mockImplementationOnce((_success,error) => error?.(failure(code)))
      .mockImplementationOnce(success => success(position));
    const onChange = vi.fn();
    render(<Editor onChange={onChange}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    expect(screen.getByRole('alert')).toHaveTextContent(code === 1 ? 'Allow location for this site' : code === 2 ? 'Turn on device location' : 'timed out');
    expect(screen.getByRole('button', {name:'Use my device location'})).toBeEnabled();
    expect(onChange).not.toHaveBeenCalled();
    // The user enables device/site location between attempts.
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    expect(gps).toHaveBeenCalledTimes(2);
    expect(gps).toHaveBeenLastCalledWith(expect.any(Function),expect.any(Function),{timeout:10000,maximumAge:0,enableHighAccuracy:false});
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Area name shown to other users')).toHaveValue('My device location');
    expect(onChange).toHaveBeenCalledWith({latitude:10.31,longitude:123.91,label:'My device location'});
  });

  it('releases a stalled browser request and ignores its late callback after retry succeeds', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<Editor onChange={onChange}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    const oldSuccess = gps.mock.calls[0][0];
    expect(screen.getByRole('button', {name:'Locating your device…'})).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('cancel and retry');
    expect(screen.getByRole('button', {name:'Search'})).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('alert')).toHaveTextContent('timed out');
    expect(screen.getByRole('button', {name:'Use my device location'})).toBeEnabled();
    gps.mockImplementationOnce(success => success(position));
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    act(() => oldSuccess({coords:{latitude:11,longitude:124}} as GeolocationPosition));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({latitude:10.31,longitude:123.91,label:'My device location'});
    expect(vi.getTimerCount()).toBe(0);
  });

  it('can cancel a pending permission request and retry without closing the picker', () => {
    const onChange = vi.fn();
    render(<Editor onChange={onChange}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    const oldError = gps.mock.calls[0][1];
    fireEvent.click(screen.getByRole('button', {name:'Cancel location request'}));
    expect(screen.getByRole('button', {name:'Use my device location'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    expect(gps).toHaveBeenCalledTimes(2);
    act(() => oldError?.(failure(1)));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    act(() => gps.mock.calls[1][0](position));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps a manually selected pin when an earlier device request finishes', () => {
    const onChange = vi.fn();
    render(<Editor onChange={onChange}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    fireEvent.click(screen.getByRole('button', {name:'Choose map pin'}));
    act(() => gps.mock.calls[0][0](position));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Area name shown to other users')).toHaveValue('Chosen map pin');
    expect(screen.getByRole('button', {name:'Use my device location'})).toBeEnabled();
  });

  it('cleans up pending attempts when the picker closes', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const view = render(<Editor onChange={onChange}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => gps.mock.calls[0][0](position));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('recovers if the browser throws before requesting location', () => {
    gps.mockImplementationOnce(() => {throw new Error('Location unavailable');})
      .mockImplementationOnce(success => success(position));
    render(<Editor onChange={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    expect(screen.getByRole('alert')).toHaveTextContent('could not start');
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Area name shown to other users')).toHaveValue('My device location');
  });
});
