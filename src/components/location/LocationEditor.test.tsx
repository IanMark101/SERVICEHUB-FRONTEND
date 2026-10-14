import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LocationEditor from './LocationEditor';
import type { LocationPoint } from '../../lib/location';
import { api } from '../../lib/api/axios';

vi.mock('../../lib/api/axios', () => ({ api:{get:vi.fn()} }));
vi.mock('next/dynamic', () => ({ default:() => function Map({onChange,candidate,onCandidateChange}:{onChange:(point:LocationPoint)=>void;candidate:LocationPoint|null;onCandidateChange:(point:LocationPoint|null)=>void}) {
  return <><button onClick={() => onCandidateChange({latitude:10.3,longitude:123.9,label:'Chosen map pin'})}>Choose map pin</button>
    <button onClick={() => onCandidateChange({latitude:11.3,longitude:124.9,label:'Selected map location'})}>Choose another pin</button>
    {candidate && <button onClick={()=>{onChange(candidate);onCandidateChange(null);}}>Use this location</button>}</>;
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
    vi.mocked(api.get).mockReset().mockResolvedValue({ data:{ success:true, data:{ label:null } } });
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
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
    expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('My device location');
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
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
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
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps a manually selected pin when an earlier device request finishes', () => {
    const onChange = vi.fn();
    render(<Editor onChange={onChange}/>);
    fireEvent.click(screen.getByRole('button', {name:'Use my device location'}));
    fireEvent.click(screen.getByRole('button', {name:'Choose map pin'}));
    act(() => gps.mock.calls[0][0](position));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('Chosen map pin');
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
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
    expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('My device location');
  });
});

describe('map place-name autofill', () => {
  beforeEach(() => { vi.mocked(api.get).mockReset(); });
  it('preserves private directions entered before a slow confirmed lookup finishes', async () => {
    let finish!: (value:unknown)=>void;
    vi.mocked(api.get).mockImplementation(() => new Promise(resolve=>{finish=resolve;}));
    function JobEditor() {
      const [point,setPoint]=useState<LocationPoint|null>(null);
      return <><LocationEditor value={point} onChange={setPoint}/><button onClick={()=>setPoint(current=>current?{...current,address:'New private directions'}:current)}>Add directions</button>{point?.address && <p>{point.address}</p>}</>;
    }
    render(<JobEditor/>); fireEvent.click(screen.getByRole('button',{name:'Choose map pin'}));fireEvent.click(screen.getByRole('button',{name:'Use this location'}));fireEvent.click(screen.getByRole('button',{name:'Add directions'}));
    await act(async()=>finish({data:{success:true,data:{label:'Cordova, Cebu'}}}));
    expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('Cordova, Cebu');
    expect(screen.getByText('New private directions')).toBeInTheDocument();
  });
  it('names a preview and confirmed pin without moving its coordinate', async () => {
    vi.mocked(api.get).mockResolvedValue({ data:{ success:true, data:{ label:'Gabi, Cordova, Cebu' } } });
    const change=vi.fn(); render(<Editor onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name:'Choose map pin' }));
    await waitFor(() => expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('Gabi, Cordova, Cebu'));
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name:'Use this location' }));
    expect(change).toHaveBeenLastCalledWith({ latitude:10.3, longitude:123.9, label:'Gabi, Cordova, Cebu' });
    expect(api.get).toHaveBeenCalledTimes(1);
  });
  it('does not let an older pin overwrite the current pin after confirmation', async () => {
    let first!: (value:unknown)=>void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { first=resolve; })).mockResolvedValueOnce({ data:{ success:true, data:{ label:'New area' } } });
    const change=vi.fn(); render(<Editor onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name:'Choose map pin' }));
    fireEvent.click(screen.getByRole('button', { name:'Choose another pin' }));
    await waitFor(() => expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('New area'));
    fireEvent.click(screen.getByRole('button', { name:'Use this location' }));
    await act(async () => first({ data:{ success:true, data:{ label:'Old area' } } }));
    expect(change).toHaveBeenLastCalledWith({ latitude:11.3, longitude:124.9, label:'New area' });
  });
  it('keeps a manual correction and the selected pin when lookup is slow or unavailable', async () => {
    let finish!: (value:unknown)=>void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish=resolve; }));
    const change=vi.fn(); render(<Editor onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name:'Choose map pin' }));
    fireEvent.click(screen.getByRole('button', { name:'Use this location' }));
    fireEvent.change(screen.getByLabelText('City or barangay shown to other users'), { target:{ value:'Correct barangay' } });
    await act(async () => finish({ data:{ success:true, data:{ label:'Delayed area' } } }));
    expect(screen.getByLabelText('City or barangay shown to other users')).toHaveValue('Correct barangay');
    expect(change).toHaveBeenLastCalledWith({ latitude:10.3, longitude:123.9, label:'Correct barangay' });
  });
});

describe('general area selection', () => {
  it('selects a city without requiring an exact operating pin or address', async () => {
    vi.mocked(api.get).mockResolvedValue({data:{data:[{latitude:10.25,longitude:123.95,label:'Cordova, Cebu',address:'Must not be copied'}]}});
    const onChange = vi.fn();
    render(<LocationEditor value={null} onChange={onChange} selectionMode="area" radiusKm={10}/>);
    expect(screen.queryByRole('button',{name:'Choose map pin'})).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Find a city or barangay'),{target:{value:'Cordova'}});
    fireEvent.click(screen.getByRole('button',{name:'Search'}));
    fireEvent.click(await screen.findByRole('button',{name:'Cordova, Cebu'}));
    expect(onChange).toHaveBeenCalledWith({latitude:10.25,longitude:123.95,label:'Cordova, Cebu'});
    expect(screen.queryByRole('button',{name:'Use this location'})).not.toBeInTheDocument();
  });
  it('requires pin confirmation for an actual job or provider venue', async () => {
    const point={latitude:10.25,longitude:123.95,label:'Cordova, Cebu'};
    vi.mocked(api.get).mockResolvedValue({data:{data:[point]}});
    const onChange=vi.fn();
    render(<LocationEditor value={null} onChange={onChange}/>);
    fireEvent.change(screen.getByLabelText('Find a city or barangay'),{target:{value:'Cordova'}});
    fireEvent.click(screen.getByRole('button',{name:'Search'}));
    fireEvent.click(await screen.findByRole('button',{name:'Cordova, Cebu'}));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
    expect(onChange).toHaveBeenCalledWith(point);
  });
});
