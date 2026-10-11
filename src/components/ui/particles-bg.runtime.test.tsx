import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ParticlesComponent from './particles-bg';

const vendorSource = readFileSync('public/vendor/particles.js/particles.js', 'utf8');
const darkColor = 'color-mix(in srgb, #ff6b00 70%, white)';
const accentColor = 'color-mix(in srgb, #ff6b00 85%, white)';
type EngineInstance = { pJS: {
  particles: { array: { color: { rgb: unknown } }[]; line_linked: { color_rgb_line: unknown } };
  interactivity: { status: string };
  fn: { vendors: { draw: () => void } };
} };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (window as Window & { particlesJS?: unknown }).particlesJS;
  delete (window as Window & { pJSDom?: unknown }).pJSDom;
});

describe('bundled particles.js compatibility', () => {
  it.each([false, true])('draws linked particles with modern CSS tokens (reduced motion: %s)', async (reduced) => {
    // Rasterization is the only browser primitive jsdom cannot provide. Model
    // its documented CSS-color parsing and sRGB readback; run the real engine.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      let fill = '#000000';
      const colors: Record<string, string> = {
        [darkColor]: '#ff974d', [accentColor]: '#ff8126',
        'rgb(255, 107, 0)': '#ff6b00',
      };
      return {
        get fillStyle() { return fill; },
        set fillStyle(value: string) {
          if (/^#[\da-f]{6}$/i.test(value)) fill = value;
          else if (colors[value]) fill = colors[value];
        },
        clearRect() {}, fillRect() {}, beginPath() {}, closePath() {},
        arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {},
        getImageData: () => ({ data: new Uint8ClampedArray([
          ...fill.slice(1).match(/../g)!.map((channel) => parseInt(channel, 16)), 255,
        ]) }),
      } as unknown as CanvasRenderingContext2D;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(600);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => ({
        '--color-brand': 'rgb(255, 107, 0)',
        '--color-brand-on-dark': darkColor,
        '--color-orange-400': accentColor,
      }[name] ?? ''),
    } as CSSStyleDeclaration);
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduced-motion') ? reduced : true,
      addEventListener() {}, removeEventListener() {},
    }));

    const legacy = createContext({
      document, console, devicePixelRatio: 1,
      requestAnimationFrame: vi.fn(() => 1), cancelAnimationFrame: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    });
    legacy.window = legacy;
    runInContext(vendorSource, legacy);
    // Force links to be drawn rather than relying on random particle placement.
    runInContext('Math.random = function () { return 0.5; };', legacy);
    const initialize = vi.fn((id: string, config: unknown) => {
      legacy.pJSDom = (window as Window & { pJSDom?: EngineInstance[] }).pJSDom;
      legacy.hostId = id;
      legacy.configJson = JSON.stringify(config);
      runInContext('particlesJS(hostId, JSON.parse(configJson));', legacy);
    });
    Object.assign(window, { particlesJS: initialize, pJSDom: legacy.pJSDom });

    const view = render(<ParticlesComponent variant="brand" isDark />);
    await waitFor(() => expect(legacy.pJSDom).toHaveLength(1));
    const instance = (legacy.pJSDom as EngineInstance[])[0];
    expect(instance.pJS.particles.array.length).toBeGreaterThan(1);
    expect(instance.pJS.particles.line_linked.color_rgb_line).toEqual({ r: 255, g: 151, b: 77 });
    expect(instance.pJS.particles.array[0].color.rgb).toEqual({ r: 255, g: 151, b: 77 });
    expect(() => act(() => instance.pJS.fn.vendors.draw())).not.toThrow();

    // Negative control: the same engine/config crashes at linkParticles if an
    // unconverted CSS color is allowed through, reproducing the reported error.
    const probe = document.createElement('div');
    probe.id = 'raw-color-repro';
    document.body.appendChild(probe);
    legacy.invalidConfigJson = JSON.stringify(initialize.mock.calls[0][1]);
    legacy.rawColor = darkColor;
    expect(() => runInContext(`
      var invalid = JSON.parse(invalidConfigJson);
      invalid.particles.line_linked.color = rawColor;
      particlesJS('raw-color-repro', invalid);
    `, legacy)).toThrow("Cannot read properties of null (reading 'r')");
    probe.remove();

    const initialStatus = instance.pJS.interactivity.status;
    fireEvent.mouseMove(view.container, { clientX: 100, clientY: 150 });
    expect(instance.pJS.interactivity.status).toBe(reduced ? initialStatus : 'mousemove');
    expect(() => act(() => instance.pJS.fn.vendors.draw())).not.toThrow();
    const count = instance.pJS.particles.array.length;
    fireEvent.click(view.container, { clientX: 120, clientY: 160 });
    fireEvent.click(view.container, { clientX: 120, clientY: 160 });
    expect(instance.pJS.particles.array).toHaveLength(count);

    view.rerender(<ParticlesComponent variant="brand" isDark={false} />);
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
    expect((legacy.pJSDom as EngineInstance[]).at(-1)?.pJS.particles.line_linked.color_rgb_line)
      .toEqual({ r: 255, g: 107, b: 0 });
    view.unmount();
    expect(document.querySelector('.particles-js-canvas-el')).toBeNull();
    expect((window as Window & { pJSDom?: EngineInstance[] }).pJSDom).toHaveLength(0);
  });
});
