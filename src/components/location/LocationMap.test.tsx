import { StrictMode, useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import LocationMap from './LocationMap';
import { addReadableMapLayer } from '../../lib/readableMapLayer';

// Exercise Leaflet lifecycle here; vector labels/loading have separate coverage.
vi.mock('../../lib/readableMapLayer', () => ({ addReadableMapLayer:vi.fn().mockResolvedValue(undefined) }));

const point = { latitude: 10.3, longitude: 123.92, label: 'Cebu test area' };
let resizeCallbacks: ResizeObserverCallback[] = [];
const originalSvgRect = Object.getOwnPropertyDescriptor(SVGSVGElement.prototype, 'createSVGRect');
const dialogMethods = ['show', 'showModal', 'close'] as const;
const originalDialogMethods = dialogMethods.map(name => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name));

beforeAll(() => {
  // Exercise the real Leaflet browser animation/rendering paths in jsdom.
  vi.stubGlobal('WebKitCSSMatrix', class { m11 = 1; });
  Object.defineProperty(SVGSVGElement.prototype, 'createSVGRect', { configurable: true, value: () => ({}) });
  // jsdom has no top layer; exercise selection/lifecycle here and native dialogs in browser QA.
  for (const name of dialogMethods) Object.defineProperty(HTMLDialogElement.prototype, name, {
    configurable:true, value:function(this:HTMLDialogElement) { this.open = name !== 'close'; },
  });
});
beforeEach(() => {
  vi.mocked(addReadableMapLayer).mockReset().mockResolvedValue(undefined);
  resizeCallbacks = [];
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(500);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(300);
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); }
    observe() {}
    disconnect() {}
    unobserve() {}
  });
});
afterEach(() => { vi.restoreAllMocks(); });
afterAll(() => {
  vi.unstubAllGlobals();
  if (originalSvgRect) Object.defineProperty(SVGSVGElement.prototype, 'createSVGRect', originalSvgRect);
  else Reflect.deleteProperty(SVGSVGElement.prototype, 'createSVGRect');
  dialogMethods.forEach((name,index) => {
    const original = originalDialogMethods[index];
    if (original) Object.defineProperty(HTMLDialogElement.prototype, name, original);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  });
});

describe('location map lifecycle with real Leaflet', () => {
  it('keeps green provider markers at their public areas outside the orange radius and opens a preview without choosing a location',async()=>{
    const L=await import('leaflet');
    const popup=vi.spyOn(L.Marker.prototype,'bindPopup');
    const radiusUpdate=vi.spyOn(L.Circle.prototype,'setRadius');
    const change=vi.fn(),select=vi.fn(),viewport=vi.fn();
    const outside={id:'outside',title:'Laptop repairs',label:'Public service area',providerName:'John',area:{latitude:10.4,longitude:123.92,approximate:true as const}};
    const view=render(<LocationMap point={point} radiusKm={2} onChange={change} accent="#bd4f00" results={[outside]}
      resultPlacement="area" resultAccent="#047857" resultActionLabel="View listing" onResultSelect={select} onViewportChange={viewport}/>);
    await waitFor(()=>expect(popup).toHaveBeenCalled());
    const providerMarker=popup.mock.instances[0] as unknown as import('leaflet').Marker;
    expect(providerMarker.getLatLng()).toMatchObject({lat:outside.area.latitude,lng:outside.area.longitude});
    expect(providerMarker.getElement()?.querySelector('[data-map-result]')).toHaveStyle({'--location-accent':'#047857'});
    const circle=radiusUpdate.mock.instances[0] as unknown as import('leaflet').Circle;
    expect(circle.getRadius()).toBe(2000);
    expect(circle.getLatLng()).toMatchObject({lat:point.latitude,lng:point.longitude});
    act(()=>{providerMarker.openPopup();});
    expect(screen.getByText('Laptop repairs')).toBeVisible();
    expect(screen.getByText('John')).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:'View listing'}));
    expect(select).toHaveBeenCalledWith('outside');
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole('button',{name:'Switch location'})).not.toBeInTheDocument();
    expect(viewport).toHaveBeenCalled();
    view.rerender(<LocationMap point={point} radiusKm={1} onChange={change} accent="#bd4f00" results={[outside]}
      resultPlacement="area" resultAccent="#047857" resultActionLabel="View listing" onResultSelect={select} onViewportChange={viewport}/>);
    await waitFor(()=>expect(circle.getRadius()).toBe(1000));
    const updatedMarker=popup.mock.instances.at(-1) as unknown as import('leaflet').Marker;
    expect(updatedMarker.getLatLng()).toMatchObject({lat:outside.area.latitude,lng:outside.area.longitude});
    expect(change).not.toHaveBeenCalled();
  });
  it('ignores an already queued resize notification after closing the picker', async () => {
    const view = render(<StrictMode><LocationMap point={point} radiusKm={10} onChange={vi.fn()}/></StrictMode>);
    await screen.findByRole('button', { name: 'Zoom in' });
    const signal = vi.mocked(addReadableMapLayer).mock.lastCall?.[1];
    view.unmount();
    expect(signal?.aborted).toBe(true);
    expect(resizeCallbacks.length).toBeGreaterThan(0);
    for (const callback of resizeCallbacks) {
      expect(() => callback([], {} as ResizeObserver)).not.toThrow();
    }
  });

  it('can zoom, close during the zoom, and immediately reopen without delayed DOM errors', async () => {
    const errors: string[] = [];
    const capture = (event: ErrorEvent) => { errors.push(event.message); };
    window.addEventListener('error', capture);
    try {
      const first = render(<LocationMap point={point} radiusKm={10} onChange={vi.fn()}/>);
      fireEvent.click(await screen.findByRole('button', { name: 'Zoom in' }));
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
      first.unmount();
      const reopened = render(<LocationMap point={point} radiusKm={5} onChange={vi.fn()}/>);
      await screen.findByRole('button', { name: 'Zoom in' });
      fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 350)); });
      expect(errors).toEqual([]);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(reopened.container.querySelectorAll('.leaflet-container')).toHaveLength(1);
    } finally { window.removeEventListener('error', capture); }
  });

  it('keeps pin selection working after point/radius updates', async () => {
    const change = vi.fn();
    const view = render(<LocationMap point={null} onChange={change}/>);
    await screen.findByRole('button', { name: 'Zoom in' });
    fireEvent.keyPress(screen.getByRole('region'), { key: 'Enter', charCode: 13 });
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Use this location'}));
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ label: 'Selected map location' }));
    view.rerender(<LocationMap point={{ ...point, label: 'Updated area' }} radiusKm={5} onChange={change}/>);
    await waitFor(() => expect(view.container.querySelector('.leaflet-marker-icon')).toHaveStyle({ opacity: '1' }));
    fireEvent.keyPress(screen.getByRole('region'), { key: 'Enter', charCode: 13 });
    fireEvent.click(screen.getByRole('button',{name:'Switch location'}));
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ label: 'Selected map location' }));
  });

  it('keeps the same map and selected location when expanded and restored', async () => {
    const change = vi.fn();
    function Picker() {
      const [selected,setSelected] = useState(point);
      return <LocationMap point={selected} onChange={next => { setSelected(next); change(next); }}/>;
    }
    const view = render(<Picker/>);
    await screen.findByRole('button', { name:'Zoom in' });
    const originalMap = screen.getByRole('region');
    const originalPane = view.container.querySelector('.leaflet-map-pane');
    fireEvent.click(screen.getByRole('button', { name:'Expand map to full screen' }));
    const expanded = screen.getByRole('dialog', { name:'Full-screen location map' });
    expect(expanded).toHaveAttribute('aria-modal','true');
    expect(document.body.style.overflow).toBe('hidden');
    await within(expanded).findByRole('button', { name:'Zoom in' });
    fireEvent.keyPress(within(expanded).getByRole('region'), { key:'Enter', charCode:13 });
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(within(expanded).getByRole('button',{name:'Switch location'}));
    expect(change.mock.lastCall?.[0]).toMatchObject({ label:'Selected map location', latitude:point.latitude });
    expect(change.mock.lastCall?.[0].longitude).toBeCloseTo(point.longitude,8);
    fireEvent.click(screen.getByRole('button', { name:'Exit full screen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('region')).toBe(originalMap);
    expect(view.container.querySelector('.leaflet-map-pane')).toBe(originalPane);
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(screen.getByRole('button', { name:'Expand map to full screen' })).toHaveFocus();
  });

  it('exits with Escape without closing an enclosing form dialog', async () => {
    const parentKey = vi.fn();
    render(<div onKeyDown={parentKey}><LocationMap point={point} onChange={vi.fn()}/></div>);
    await screen.findByRole('button', { name:'Zoom in' });
    fireEvent.click(screen.getByRole('button', { name:'Expand map to full screen' }));
    const expanded = screen.getByRole('dialog');
    await within(expanded).findByRole('button', { name:'Zoom in' });
    fireEvent.keyDown(screen.getByRole('button', { name:'Exit full screen' }), { key:'Tab' });
    expect(within(expanded).getByRole('region')).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('button', { name:'Exit full screen' }), { key:'Escape' });
    expect(parentKey).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name:'Expand map to full screen' })).toHaveFocus();
  });

  it('restores scroll locking on unmount and handles native dialog cancellation', async () => {
    document.body.style.overflow = 'clip';
    const view = render(<LocationMap point={point} onChange={vi.fn()}/>);
    await screen.findByRole('button', { name:'Zoom in' });
    fireEvent.click(screen.getByRole('button', { name:'Expand map to full screen' }));
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable:true }));
    expect(document.body.style.overflow).toBe('clip');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name:'Expand map to full screen' }));
    view.unmount();
    expect(document.body.style.overflow).toBe('clip');
    document.body.style.overflow = '';
  });

  it('draws the selected kilometer radius around the pin in embedded and expanded maps', async () => {
    const L = await import('leaflet');
    const radiusUpdates = vi.spyOn(L.Circle.prototype,'setRadius');
    const props = { point,onChange:vi.fn(),accent:'#059669' };
    const view = render(<LocationMap {...props} radiusKm={2}/>);
    await waitFor(() => expect(radiusUpdates).toHaveBeenCalledWith(2000));
    const embeddedCircle = radiusUpdates.mock.instances[0] as unknown as import('leaflet').Circle;
    expect(embeddedCircle.getRadius()).toBe(2000);
    expect(view.container.querySelector('svg path.leaflet-interactive')).toBeInTheDocument();
    view.rerender(<LocationMap {...props} radiusKm={5}/>);
    await waitFor(() => expect(embeddedCircle.getRadius()).toBe(5000));
    fireEvent.click(screen.getByRole('button', {name:'Expand map to full screen'}));
    const expanded = screen.getByRole('dialog');
    await within(expanded).findByRole('button', {name:'Zoom in'});
    await waitFor(() => expect(new Set(radiusUpdates.mock.instances).size).toBe(2));
    const circles = [...new Set(radiusUpdates.mock.instances)] as unknown as import('leaflet').Circle[];
    expect(circles.every(circle => circle.getRadius()===5000)).toBe(true);
    const moved = { ...point,latitude:10.35,longitude:123.95 };
    view.rerender(<LocationMap {...props} point={moved} radiusKm={5}/>);
    await waitFor(() => expect(circles.every(circle => circle.getLatLng().lat===moved.latitude && circle.getLatLng().lng===moved.longitude)).toBe(true));
    view.rerender(<LocationMap {...props} point={moved}/>);
    await waitFor(() => expect(circles.every(circle => circle.getRadius()===0)).toBe(true));
  });

  it('lets users discard a new pin and preserves a pending selection across fullscreen changes',async()=>{
    const change=vi.fn();
    const view=render(<LocationMap point={point} onChange={change}/>);
    await screen.findByRole('button',{name:'Zoom in'});
    fireEvent.click(screen.getByRole('region'),{clientX:150,clientY:120});
    expect(screen.getByRole('region',{name:'Confirm location'})).toHaveTextContent('Switch to this location?');
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Keep current location'}));
    expect(screen.queryByRole('region',{name:'Confirm location'})).not.toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveFocus();
    fireEvent.click(screen.getByRole('region'),{clientX:170,clientY:140});
    fireEvent.click(screen.getByRole('button',{name:'Expand map to full screen'}));
    const expanded=screen.getByRole('dialog');
    expect(within(expanded).getByRole('region',{name:'Confirm location'})).toBeInTheDocument();
    fireEvent.click(within(expanded).getByRole('button',{name:'Exit full screen'}));
    expect(screen.getByRole('region',{name:'Confirm location'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Switch location'}));
    expect(change).toHaveBeenCalledTimes(1);
    view.unmount();
  });

  it('zooms with Ctrl or Command plus wheel while leaving normal scrolling and selection alone',async()=>{
    const L=await import('leaflet');
    const zoom=vi.spyOn(L.Map.prototype,'setZoomAround');
    const change=vi.fn();
    const view=render(<LocationMap point={point} onChange={change}/>);
    await screen.findByRole('button',{name:'Zoom in'});
    const region=screen.getByRole('region');
    const normal=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100});
    fireEvent(region,normal);
    expect(normal.defaultPrevented).toBe(false);
    expect(zoom).not.toHaveBeenCalled();
    for(const key of ['ctrlKey','metaKey']) {
      const event=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-100,[key]:true});
      fireEvent(region,event);
      expect(event.defaultPrevented).toBe(true);
      await act(async()=>{await new Promise(resolve=>setTimeout(resolve,60));});
    }
    expect(zoom).toHaveBeenCalledTimes(2);
    expect(change).not.toHaveBeenCalled();
    fireEvent.wheel(region,{ctrlKey:true,deltaY:-100});
    view.unmount();
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,60));});
    expect(zoom).toHaveBeenCalledTimes(2);
  });

  it('Escape discards a pending pin before closing a full-screen map or its enclosing dialog',async()=>{
    const parentKey=vi.fn(),change=vi.fn();
    render(<div onKeyDown={parentKey}><LocationMap point={point} onChange={change}/></div>);
    await screen.findByRole('button',{name:'Zoom in'});
    fireEvent.click(screen.getByRole('button',{name:'Expand map to full screen'}));
    const expanded=screen.getByRole('dialog');
    await within(expanded).findByRole('button',{name:'Zoom in'});
    fireEvent.keyPress(within(expanded).getByRole('region'),{key:'Enter',charCode:13});
    fireEvent.keyDown(within(expanded).getByRole('button',{name:'Switch location'}),{key:'Escape'});
    expect(screen.getByRole('dialog')).toBe(expanded);
    expect(screen.queryByRole('region',{name:'Confirm location'})).not.toBeInTheDocument();
    expect(within(expanded).getByRole('region')).toHaveFocus();
    expect(parentKey).not.toHaveBeenCalled();expect(change).not.toHaveBeenCalled();
  });

  it('groups public areas, safely renders titles, and opens results without moving the search pin',async()=>{
    const select=vi.fn(),change=vi.fn();
    const area={latitude:10.3,longitude:123.92,approximate:true as const};
    const pins=[{id:'a',title:'<img src=x onerror=alert(1)>',label:'Cordova',area},{id:'b',title:'Plumbing',label:'Cordova',area}];
    const view=render(<LocationMap point={point} radiusKm={.5} results={pins} onChange={change} onResultSelect={select}/>);
    const group=await screen.findByTitle('2 matches in this area');
    fireEvent.click(group);
    await screen.findByText(pins[0].title);
    expect(view.container.querySelector('img[src="x"]')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button',{name:'Show in list'})[0]);
    expect(select).toHaveBeenCalledWith('a');
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole('region',{name:'Confirm location'})).not.toBeInTheDocument();
    view.rerender(<LocationMap point={point} radiusKm={.5} results={[]} onChange={change}/>);
    await waitFor(()=>expect(screen.queryByTitle('2 matches in this area')).not.toBeInTheDocument());
  });
});
