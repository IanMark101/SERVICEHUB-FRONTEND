import { afterEach, describe, expect, it, vi } from 'vitest';
import { createParticleColorResolver } from './particle-color';

afterEach(() => vi.restoreAllMocks());

describe('particle color fallback', () => {
  it('expands short hex and supplies a safe brand color for missing tokens', () => {
    const toHex = createParticleColorResolver();
    expect(toHex(' #f60 ', '#ff6b00')).toBe('#ff6600');
    expect(toHex('', '#ff6b00')).toBe('#ff6b00');
    expect(toHex('  ', '#ff6b00')).toBe('#ff6b00');
  });

  it('rejects invalid CSS instead of passing null-producing values to the engine', () => {
    let fill = '#000000';
    const read = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      get fillStyle() { return fill; },
      set fillStyle(value: string) { if (/^#[\da-f]{6}$/i.test(value)) fill = value; },
      getImageData: read,
    } as unknown as CanvasRenderingContext2D);
    expect(createParticleColorResolver()('var(--missing-token)', '#ff6b00')).toBe('#ff6b00');
    expect(read).not.toHaveBeenCalled();
  });

  it('uses the safe color when canvas conversion is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(createParticleColorResolver()('color(srgb 1 .6 .3)', '#ff6b00')).toBe('#ff6b00');
  });
});
