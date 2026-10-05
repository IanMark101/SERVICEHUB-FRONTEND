import { StrictMode } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ParticlesComponent from './particles-bg';

type Config = { particles: { move: { enable: boolean }; color: { value: string }; opacity: { anim: { enable: boolean } } } };
type Instance = { pJS: {
  canvas: { el: HTMLCanvasElement; pxratio: number };
  particles: { array: unknown[] };
  interactivity: { mouse: { pos_x: number | null; pos_y: number | null }; status: string };
  fn: { drawAnimFrame: number; modes: { pushParticles: ReturnType<typeof vi.fn> } }; tmp: object;
} };
const runtime = window as Window & { particlesJS?: (id: string, config: Config) => void; pJSDom?: Instance[] };
let intersect: IntersectionObserverCallback;
let reduced = false;
const motionChange = new Set<EventListener>();
const engine = vi.fn((id: string) => {
  const canvas = document.createElement('canvas');
  document.getElementById(id)!.appendChild(canvas);
  runtime.pJSDom!.push({ pJS: {
    canvas: { el: canvas, pxratio: 2 }, particles: { array: [] },
    interactivity: { mouse: { pos_x: null, pos_y: null }, status: 'mouseleave' },
    fn: { drawAnimFrame: 7, modes: { pushParticles: vi.fn() } }, tmp: {},
  } });
});

beforeEach(() => {
  reduced = false;
  motionChange.clear();
  engine.mockClear();
  runtime.particlesJS = engine;
  runtime.pJSDom = [];
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1440);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(780);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe() {} disconnect() {}
  });
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return reduced; },
    addEventListener: (_: string, callback: EventListener) => motionChange.add(callback),
    removeEventListener: (_: string, callback: EventListener) => motionChange.delete(callback),
  }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); delete runtime.particlesJS; delete runtime.pJSDom; });

describe('particle background lifecycle', () => {
  it('survives Strict Mode and theme changes with one canvas, then cleans up only its instance', async () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const other = { pJS: { canvas: { el: document.createElement('canvas') }, fn: { drawAnimFrame: 99 }, tmp: {} } };
    // The component must not modify a foreign instance's registry entry.
    runtime.pJSDom!.push(other as Instance);
    const view = render(<StrictMode><ParticlesComponent variant="brand" isDark={false} /></StrictMode>);
    await waitFor(() => expect(view.container.querySelectorAll('canvas')).toHaveLength(1));
    view.rerender(<StrictMode><ParticlesComponent variant="brand" isDark /></StrictMode>);
    await waitFor(() => expect(engine).toHaveBeenCalledTimes(2));
    expect(view.container.querySelectorAll('canvas')).toHaveLength(1);
    expect((engine.mock.calls.at(-1) as unknown as [string, Config])[1].particles.color.value).toBe('#e4a18a');
    view.unmount();
    expect(runtime.pJSDom).toEqual([other]);
    expect(cancel).toHaveBeenCalledWith(7);
    expect(cancel).not.toHaveBeenCalledWith(99);
    expect(motionChange.size).toBe(0);
  });

  it('renders static particles for reduced motion, and resumes on preference change', async () => {
    reduced = true;
    const view = render(<ParticlesComponent variant="brand" />);
    await waitFor(() => expect(engine).toHaveBeenCalledTimes(1));
    const last = () => (engine.mock.calls.at(-1) as unknown as [string, Config])[1];
    expect(last().particles.move.enable).toBe(false);
    expect(last().particles.opacity.anim.enable).toBe(false);
    act(() => { reduced = false; motionChange.forEach((callback) => callback(new Event('change'))); });
    expect(last().particles.move.enable).toBe(true);
    view.unmount();
  });

  it('stops offscreen work and restores a single canvas on return', async () => {
    const view = render(<ParticlesComponent />);
    await waitFor(() => expect(view.container.querySelector('canvas')).toBeInTheDocument());
    act(() => intersect([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(view.container.querySelector('canvas')).toBeNull();
    expect(runtime.pJSDom).toHaveLength(0);
    act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(view.container.querySelectorAll('canvas')).toHaveLength(1);
    view.unmount();
  });

  it('tracks cursor coordinates and adds particles on background clicks while preserving controls', async () => {
    const navigate = vi.fn();
    const view = render(<section><ParticlesComponent variant="brand" /><a href="#next" onClick={navigate}>Explore</a></section>);
    await waitFor(() => expect(engine).toHaveBeenCalledTimes(1));
    const surface = view.container.querySelector('section')!;
    const instance = runtime.pJSDom![0];
    fireEvent.mouseMove(surface, { clientX: 100, clientY: 150 });
    expect(instance.pJS.interactivity.mouse).toEqual({ pos_x: 200, pos_y: 300 });
    expect(instance.pJS.interactivity.status).toBe('mousemove');
    fireEvent.click(surface, { clientX: 120, clientY: 160 });
    expect(instance.pJS.fn.modes.pushParticles).toHaveBeenCalledWith(4, { pos_x: 240, pos_y: 320 });
    fireEvent.click(view.getByRole('link', { name: 'Explore' }));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(instance.pJS.fn.modes.pushParticles).toHaveBeenCalledTimes(1);
    instance.pJS.particles.array = Array(240).fill({});
    fireEvent.click(surface, { clientX: 120, clientY: 160 });
    expect(instance.pJS.fn.modes.pushParticles).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(surface);
    expect(instance.pJS.interactivity.status).toBe('mouseleave');
    view.unmount();
    fireEvent.click(surface, { clientX: 120, clientY: 160 });
    expect(instance.pJS.fn.modes.pushParticles).toHaveBeenCalledTimes(1);
  });

  it('ignores pointer interaction with reduced motion', async () => {
    reduced = true;
    const view = render(<section><ParticlesComponent /></section>);
    await waitFor(() => expect(engine).toHaveBeenCalledTimes(1));
    const surface = view.container.querySelector('section')!;
    const instance = runtime.pJSDom![0];
    fireEvent.mouseMove(surface, { clientX: 100, clientY: 150 });
    fireEvent.click(surface, { clientX: 100, clientY: 150 });
    expect(instance.pJS.interactivity.status).toBe('mouseleave');
    expect(instance.pJS.fn.modes.pushParticles).not.toHaveBeenCalled();
    view.unmount();
  });
});
