import { StrictMode, useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import LocationMap from './LocationMap';

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
  it('ignores an already queued resize notification after closing the picker', async () => {
    const view = render(<StrictMode><LocationMap point={point} radiusKm={10} onChange={vi.fn()}/></StrictMode>);
    await screen.findByRole('button', { name: 'Zoom in' });
    view.unmount();
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
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ label: 'Selected service area' }));
    view.rerender(<LocationMap point={{ ...point, label: 'Updated area' }} radiusKm={5} onChange={change}/>);
    await waitFor(() => expect(view.container.querySelector('.leaflet-marker-icon')).toHaveStyle({ opacity: '1' }));
    fireEvent.keyPress(screen.getByRole('region'), { key: 'Enter', charCode: 13 });
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ label: 'Updated area' }));
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
    expect(change.mock.lastCall?.[0]).toMatchObject({ label:point.label, latitude:point.latitude });
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
});
