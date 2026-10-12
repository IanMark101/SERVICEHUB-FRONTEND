import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from './manifest';

describe('installed ServiceHub identity', () => {
  it('keeps one root installation and preserves both workspace entry routes', () => {
    const value = manifest();
    expect(value.id).toBe('/'); expect(value.scope).toBe('/'); expect(value.display).toBe('standalone');
    expect(value.shortcuts?.map(shortcut => shortcut.url)).toEqual(['/seeker/seek-services', '/provider/browse-services']);
  });
  it('references real PNG icons with matching dimensions, including a separate maskable icon', () => {
    for (const icon of manifest().icons!) {
      const png = readFileSync(resolve('public', icon.src.slice(1)));
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(icon.sizes);
    }
    expect(manifest().icons?.some(icon => icon.purpose === 'maskable')).toBe(true);
  });
});
